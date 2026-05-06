param(
    [string]$WorkspaceRoot = (Get-Location).Path,
    [string]$OutputPath = "BODY/SKELETON/MANIFESTS/file_index.txt"
)

$WorkspaceRoot = (Resolve-Path $WorkspaceRoot).Path
$BodyRoot = Join-Path $WorkspaceRoot "BODY"
$OutputFile = Join-Path $WorkspaceRoot $OutputPath

if (-not (Test-Path $BodyRoot)) {
    throw "BODY root not found: $BodyRoot"
}

$paths = Get-ChildItem -Path $BodyRoot -Recurse -File |
    Sort-Object FullName |
    ForEach-Object {
        $_.FullName.Substring($WorkspaceRoot.Length + 1) -replace "\\", "/"
    }

$header = @(
    "# Generated file index"
    "# Workspace: $WorkspaceRoot"
    "# Generated: $(Get-Date -Format s)"
    ""
)

Set-Content -Path $OutputFile -Value ($header + $paths)
Write-Host "Rebuilt file index: $OutputFile" -ForegroundColor Green
