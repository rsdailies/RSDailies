param(
    [string]$WorkspaceRoot = (Get-Location).Path,
    [string]$FileIndexPath = "BODY/SKELETON/MANIFESTS/file_index.txt"
)

$WorkspaceRoot = (Resolve-Path $WorkspaceRoot).Path
$Errors = New-Object System.Collections.Generic.List[string]

function Add-Error {
    param([string]$Message)
    $script:Errors.Add($Message)
}

function Resolve-ImportTarget {
    param(
        [string]$SourceFile,
        [string]$ImportValue
    )

    $sourceDir = Split-Path $SourceFile -Parent
    $candidate = Join-Path $sourceDir $ImportValue
    try {
        return (Resolve-Path -LiteralPath $candidate -ErrorAction Stop).Path
    } catch {
        return $null
    }
}

function Test-ImportsInFile {
    param([string]$Path)

    $lines = Get-Content $Path
    foreach ($line in $lines) {
        if ($line -match '^\s*@(.+)$') {
            $target = Resolve-ImportTarget -SourceFile $Path -ImportValue $matches[1].Trim()
            if (-not $target) {
                Add-Error "Broken import in $Path -> $($matches[1].Trim())"
            }
        }
    }
}

function Test-Standards {
    param([string]$BodyRoot)

    $required = @("ROLE.md", "README.md", "INDEX.md", "MANIFEST.yaml")
    $directories = @($BodyRoot) + (Get-ChildItem -Path $BodyRoot -Recurse -Directory | Select-Object -ExpandProperty FullName)
    foreach ($directory in $directories) {
        foreach ($fileName in $required) {
            $candidate = Join-Path $directory $fileName
            if (-not (Test-Path $candidate)) {
                Add-Error "Missing standards file: $candidate"
            }
        }
    }
}

function Test-FileIndex {
    param(
        [string]$BodyRoot,
        [string]$IndexFile
    )

    if (-not (Test-Path $IndexFile)) {
        Add-Error "Missing file index: $IndexFile"
        return
    }

    $expected = Get-ChildItem -Path $BodyRoot -Recurse -File |
        Sort-Object FullName |
        ForEach-Object {
            $_.FullName.Substring($WorkspaceRoot.Length + 1) -replace "\\", "/"
        }

    $actual = Get-Content $IndexFile |
        Where-Object { $_ -and (-not $_.StartsWith("#")) }

    $diff = Compare-Object -ReferenceObject $expected -DifferenceObject $actual
    if ($diff) {
        Add-Error "Generated file index does not match the live BODY tree."
    }
}

function Test-CanonicalRegistry {
    $required = @(
        "BODY/ORGANS/MEMORY/user_profile.md",
        "BODY/ORGANS/MEMORY/active_context.md",
        "BODY/ORGANS/SKILLS/PLANNING/plan-mode/SKILL.md",
        "BODY/ORGANS/SKILLS/RESEARCH/research/SKILL.md",
        "BODY/ORGANS/SKILLS/RESEARCH/research-sync/SKILL.md",
        "BODY/ORGANS/SKILLS/SAFETY/logic-audit/SKILL.md"
    )

    foreach ($relativePath in $required) {
        $fullPath = Join-Path $WorkspaceRoot $relativePath
        if (-not (Test-Path $fullPath)) {
            Add-Error "Missing canonical registry target: $relativePath"
        }
    }
}

function Test-BridgeManifest {
    param([string]$ManifestPath)

    if (-not (Test-Path $ManifestPath)) {
        Add-Error "Missing bridge manifest: $ManifestPath"
        return
    }

    foreach ($line in Get-Content $ManifestPath) {
        if ($line -match 'canonical:\s+(.+)$') {
            $path = $matches[1].Trim()
            if (-not (Test-Path (Join-Path $WorkspaceRoot $path))) {
                Add-Error "Bridge manifest canonical target is missing: $path"
            }
        }
        if ($line -match '^\s*-\s+(\.?.+)$') {
            $path = $matches[1].Trim()
            if (($path -match '^(BODY|\.agents|\.gemini|AGENTS\.md|GEMINI\.md)') -and (-not (Test-Path (Join-Path $WorkspaceRoot $path)))) {
                Add-Error "Bridge manifest output target is missing: $path"
            }
        }
    }
}

function Test-VerifiedClaims {
    param(
        [string]$BodyMapPath,
        [bool]$ImportsOk,
        [bool]$RegistryOk
    )

    if (-not (Test-Path $BodyMapPath)) {
        return
    }

    $content = Get-Content $BodyMapPath -Raw
    if ($content -match 'Zero broken links' -and (-not $ImportsOk)) {
        Add-Error "BODY_MAP.md claims zero broken links while import verification fails."
    }
    if ($content -match 'Zero floating files' -and (-not $RegistryOk)) {
        Add-Error "BODY_MAP.md claims zero floating files while canonical registry verification fails."
    }
}

function Test-ActiveMcpParity {
    param(
        [string]$SettingsPath,
        [string]$AntigravityPath,
        [string]$ServersPath
    )

    if (-not (Test-Path $SettingsPath)) {
        Add-Error "Missing settings.json"
        return
    }
    if (-not (Test-Path $AntigravityPath)) {
        Add-Error "Missing antigravity/mcp_config.json"
        return
    }
    if (-not (Test-Path $ServersPath)) {
        Add-Error "Missing BODY/NERVES/MCP/servers.yaml"
        return
    }

    $settings = Get-Content $SettingsPath -Raw | ConvertFrom-Json
    $antigravity = Get-Content $AntigravityPath -Raw | ConvertFrom-Json
    $serverYaml = Get-Content $ServersPath -Raw

    $settingsIds = @($settings.mcpServers.PSObject.Properties.Name)
    $antigravityIds = @($antigravity.mcpServers.PSObject.Properties.Name)

    if (Compare-Object $settingsIds $antigravityIds) {
        Add-Error "settings.json and antigravity/mcp_config.json disagree on active MCP server ids."
    }

    foreach ($serverId in $settingsIds) {
        if ($serverYaml -notmatch "enabled_servers:\s*\[[^\]]*\b$serverId\b") {
            Add-Error "servers.yaml active_local_settings does not include active server '$serverId'."
        }
    }
}

$bodyRoot = Join-Path $WorkspaceRoot "BODY"
$fileIndex = Join-Path $WorkspaceRoot $FileIndexPath

$importTargets = @(
    (Join-Path $WorkspaceRoot "GEMINI.md"),
    (Join-Path $WorkspaceRoot ".gemini/GEMINI.md"),
    (Join-Path $WorkspaceRoot ".agents/instructions.md")
)

$importTargets += Get-ChildItem -Path (Join-Path $WorkspaceRoot ".agents/skills") -Recurse -Filter "SKILL.md" -File -ErrorAction SilentlyContinue | Select-Object -ExpandProperty FullName
$importTargets += Get-ChildItem -Path (Join-Path $WorkspaceRoot ".gemini/skills") -Recurse -Filter "SKILL.md" -File -ErrorAction SilentlyContinue | Select-Object -ExpandProperty FullName
$importTargets += Get-ChildItem -Path (Join-Path $WorkspaceRoot ".agents/agents") -Filter "*.md" -File -ErrorAction SilentlyContinue | Select-Object -ExpandProperty FullName
$importTargets += Get-ChildItem -Path (Join-Path $WorkspaceRoot ".gemini/agents") -Filter "*.md" -File -ErrorAction SilentlyContinue | Select-Object -ExpandProperty FullName

foreach ($path in $importTargets | Sort-Object -Unique) {
    if (Test-Path $path) {
        Test-ImportsInFile -Path $path
    } else {
        Add-Error "Expected bridge file is missing: $path"
    }
}

$importErrorsBefore = $Errors.Count
Test-CanonicalRegistry
$registryOk = ($Errors.Count -eq $importErrorsBefore)

Test-Standards -BodyRoot $bodyRoot
Test-FileIndex -BodyRoot $bodyRoot -IndexFile $fileIndex
Test-BridgeManifest -ManifestPath (Join-Path $WorkspaceRoot "BODY/SKELETON/MANIFESTS/bridge_manifest.yaml")
Test-ActiveMcpParity -SettingsPath (Join-Path $WorkspaceRoot "settings.json") -AntigravityPath (Join-Path $WorkspaceRoot "antigravity/mcp_config.json") -ServersPath (Join-Path $WorkspaceRoot "BODY/NERVES/MCP/servers.yaml")
Test-VerifiedClaims -BodyMapPath (Join-Path $WorkspaceRoot "BODY/SKELETON/STRUCTURE/BODY_MAP.md") -ImportsOk ($importErrorsBefore -eq 0) -RegistryOk $registryOk

if ($Errors.Count -gt 0) {
    $Errors | ForEach-Object { Write-Error $_ }
    exit 1
}

Write-Host "No drift detected." -ForegroundColor Green
