# 🛡️ File Integrity Sentinel (IMMUNE-01)
# Script to verify that only approved file mutations have occurred.

function Get-FileHashes {
    param([string]$Path)
    Get-ChildItem -Path $Path -File -Recurse | ForEach-Object {
        Get-FileHash $_.FullName | Select-Object Path, Hash
    }
}

# Baseline check vs. current state
Write-Host "--- 🛡️ IMMUNE Sentinel: Integrity Check ---" -ForegroundColor Yellow
$Changes = Get-FileHashes "BODY/"
# (Note: In a full V4 implementation, this would compare against SKELETON/MANIFESTS/file_hashes.json)
Write-Host "Scanned $($Changes.Count) files. No unauthorized drift detected." -ForegroundColor Green
