# Anatomical compiler for bridge wrappers.
# Generates host-facing shims for the global framework repo or an infected project.

param(
    [ValidateSet("GlobalFramework", "InfectedProject")]
    [string]$Mode = "GlobalFramework",
    [string]$WorkspaceRoot = (Get-Location).Path,
    [switch]$SkipAgents,
    [switch]$SkipGemini
)

$WorkspaceRoot = (Resolve-Path $WorkspaceRoot).Path
$GeminiBridge = Join-Path $WorkspaceRoot ".gemini"
$AgentsBridge = Join-Path $WorkspaceRoot ".agents"

switch ($Mode) {
    "GlobalFramework" {
        $BodyRoot = Join-Path $WorkspaceRoot "BODY"
    }
    "InfectedProject" {
        $BodyRoot = Join-Path $GeminiBridge "BODY"
    }
}

if (-not (Test-Path $BodyRoot)) {
    throw "Canonical BODY root not found for mode '$Mode': $BodyRoot"
}

$SkillTemplate = Get-Content (Join-Path $WorkspaceRoot "BODY/SKELETON/TEMPLATES/WRAPPERS/skill_wrapper.template") -Raw
$SubagentTemplate = Get-Content (Join-Path $WorkspaceRoot "BODY/SKELETON/TEMPLATES/WRAPPERS/subagent_wrapper.template") -Raw

function Ensure-Directory {
    param([string]$Path)
    if (-not (Test-Path $Path)) {
        try {
            New-Item -ItemType Directory -Path $Path -Force -ErrorAction Stop | Out-Null
            return $true
        } catch {
            Write-Warning "Unable to create directory: $Path"
            return $false
        }
    }
    return $true
}

function Test-BridgeWritable {
    param([string]$BridgeRoot)

    if (-not (Test-Path $BridgeRoot)) {
        return $false
    }

    $probe = Join-Path $BridgeRoot ".bridge_write_probe"
    try {
        Set-Content -Path $probe -Value "probe" -ErrorAction Stop
        Remove-Item -Path $probe -Force -ErrorAction Stop
        return $true
    } catch {
        return $false
    }
}

function Get-RelativeImport {
    param(
        [string]$FromFile,
        [string]$ToFile
    )

    $fromUri = [System.Uri]((Resolve-Path (Split-Path $FromFile -Parent)).Path + [System.IO.Path]::DirectorySeparatorChar)
    $toUri = [System.Uri](Resolve-Path $ToFile).Path
    $relativeUri = $fromUri.MakeRelativeUri($toUri)
    return [System.Uri]::UnescapeDataString($relativeUri.ToString()) -replace "\\", "/"
}

function Get-FrontMatterValue {
    param(
        [string]$Content,
        [string]$Key
    )

    $pattern = "(?m)^" + [regex]::Escape($Key) + ":\s*(.+?)\s*$"
    $match = [regex]::Match($Content, $pattern)
    if ($match.Success) {
        return $match.Groups[1].Value.Trim()
    }
    return ""
}

function Render-Template {
    param(
        [string]$Template,
        [hashtable]$Values
    )

    $result = $Template
    foreach ($entry in $Values.GetEnumerator()) {
        $result = $result.Replace(("{{" + $entry.Key + "}}"), [string]$entry.Value)
    }
    return $result
}

function Write-Wrapper {
    param(
        [string]$Template,
        [string]$DestinationFile,
        [string]$CanonicalFile,
        [hashtable]$Metadata
    )

    if (-not (Ensure-Directory (Split-Path $DestinationFile -Parent))) {
        return
    }
    $values = @{}
    foreach ($key in $Metadata.Keys) {
        $values[$key] = $Metadata[$key]
    }
    $values["relative_import"] = Get-RelativeImport -FromFile $DestinationFile -ToFile $CanonicalFile
    $content = Render-Template -Template $Template -Values $values
    try {
        Set-Content -Path $DestinationFile -Value $content -ErrorAction Stop
    } catch {
        Write-Warning "Unable to write wrapper: $DestinationFile"
    }
}

$geminiEnabled = -not $SkipGemini
$agentsEnabled = -not $SkipAgents

if ($geminiEnabled) {
    $geminiEnabled = (Ensure-Directory $GeminiBridge) -and (Test-BridgeWritable $GeminiBridge)
    if ($geminiEnabled) {
        $geminiEnabled = (Ensure-Directory (Join-Path $GeminiBridge "skills")) -and (Ensure-Directory (Join-Path $GeminiBridge "agents"))
    } else {
        Write-Warning "Skipping .gemini bridge generation because the bridge root is not writable."
    }
}

if ($agentsEnabled) {
    $agentsEnabled = (Ensure-Directory $AgentsBridge) -and (Test-BridgeWritable $AgentsBridge)
    if ($agentsEnabled) {
        $agentsEnabled = (Ensure-Directory (Join-Path $AgentsBridge "skills")) -and (Ensure-Directory (Join-Path $AgentsBridge "agents"))
    } else {
        Write-Warning "Skipping .agents bridge generation because the bridge root is not writable in this host runtime."
    }
}

$skillWriteCount = 0
$subagentWriteCount = 0

$skillFiles = Get-ChildItem -Path (Join-Path $BodyRoot "ORGANS/SKILLS") -Recurse -Filter "SKILL.md" -File
foreach ($skillFile in $skillFiles) {
    $content = Get-Content $skillFile.FullName -Raw
    $name = $skillFile.Directory.Name
    $description = Get-FrontMatterValue -Content $content -Key "description"
    if (-not $description) {
        $description = "Wrapper for $name"
    }

    $metadata = @{
        name = $name
        description = $description
    }

    if ($geminiEnabled) {
        Write-Wrapper -Template $SkillTemplate -DestinationFile (Join-Path $GeminiBridge "skills/$name/SKILL.md") -CanonicalFile $skillFile.FullName -Metadata $metadata
        $skillWriteCount++
    }
    if ($agentsEnabled) {
        Write-Wrapper -Template $SkillTemplate -DestinationFile (Join-Path $AgentsBridge "skills/$name/SKILL.md") -CanonicalFile $skillFile.FullName -Metadata $metadata
    }
}

$subagentFiles = Get-ChildItem -Path (Join-Path $BodyRoot "BRAIN/SUBAGENTS") -Filter "*.md" -File |
    Where-Object { $_.Name -notin @("README.md", "ROLE.md", "INDEX.md") }

foreach ($subagentFile in $subagentFiles) {
    $name = [System.IO.Path]::GetFileNameWithoutExtension($subagentFile.Name)
    $metadata = @{
        name = $name
    }

    if ($geminiEnabled) {
        Write-Wrapper -Template $SubagentTemplate -DestinationFile (Join-Path $GeminiBridge "agents/$name.md") -CanonicalFile $subagentFile.FullName -Metadata $metadata
        $subagentWriteCount++
    }
    if ($agentsEnabled) {
        Write-Wrapper -Template $SubagentTemplate -DestinationFile (Join-Path $AgentsBridge "agents/$name.md") -CanonicalFile $subagentFile.FullName -Metadata $metadata
    }
}

Write-Host "Bridge wrappers generated for mode: $Mode" -ForegroundColor Green
Write-Host ".gemini skill wrappers attempted: $skillWriteCount" -ForegroundColor Green
Write-Host ".gemini subagent wrappers attempted: $subagentWriteCount" -ForegroundColor Green
