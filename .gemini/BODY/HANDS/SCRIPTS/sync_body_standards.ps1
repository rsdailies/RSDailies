param(
    [string]$WorkspaceRoot = (Get-Location).Path,
    [switch]$Force
)

$WorkspaceRoot = (Resolve-Path $WorkspaceRoot).Path
$BodyRoot = Join-Path $WorkspaceRoot "BODY"

if (-not (Test-Path $BodyRoot)) {
    throw "BODY root not found: $BodyRoot"
}

function Get-RelativeBodyPath {
    param([string]$DirectoryPath)
    return $DirectoryPath.Substring($WorkspaceRoot.Length + 1) -replace "\\", "/"
}

function Get-ChildSummary {
    param([string]$DirectoryPath)
    $items = Get-ChildItem -LiteralPath $DirectoryPath
    if (-not $items) {
        return @("- _empty_")
    }

    return $items |
        Sort-Object -Property Name |
        ForEach-Object {
            if ($_.PSIsContainer) {
                "- dir: $($_.Name)"
            } else {
                "- file: $($_.Name)"
            }
        }
}

function Write-IfMissing {
    param(
        [string]$Path,
        [string[]]$Content
    )

    if ((-not (Test-Path $Path)) -or $Force) {
        Set-Content -Path $Path -Value $Content
    }
}

$directories = @($BodyRoot) + (Get-ChildItem -Path $BodyRoot -Recurse -Directory | Select-Object -ExpandProperty FullName)
foreach ($directory in $directories) {
    $relativeBodyPath = Get-RelativeBodyPath -DirectoryPath $directory
    $name = Split-Path $directory -Leaf
    $children = Get-ChildSummary -DirectoryPath $directory

    Write-IfMissing -Path (Join-Path $directory "README.md") -Content @(
        "# $name"
        ""
        "This directory is part of the anatomical framework."
        ""
        "Canonical path: $relativeBodyPath."
    )

    Write-IfMissing -Path (Join-Path $directory "ROLE.md") -Content @(
        "# $name Role"
        ""
        "This node owns the responsibilities associated with $relativeBodyPath."
        ""
        "Canonical path: $relativeBodyPath."
    )

    Write-IfMissing -Path (Join-Path $directory "INDEX.md") -Content @(
        "# $name Index"
        ""
        "Canonical path: $relativeBodyPath."
        ""
    ) + $children

    Write-IfMissing -Path (Join-Path $directory "MANIFEST.yaml") -Content @(
        "path: $relativeBodyPath"
        "kind: directory"
        "generated_by: BODY/HANDS/SCRIPTS/sync_body_standards.ps1"
    )
}

Write-Host "Standards sync complete." -ForegroundColor Green
