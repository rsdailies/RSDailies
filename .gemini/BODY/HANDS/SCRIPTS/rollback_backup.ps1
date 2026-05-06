# 🔄 Rollback Engine (HANDS-03)
# Automates the creation of backups before file mutations.

param(
    [string]$TargetFile
)

$BackupPath = $TargetFile + ".bak"

if (Test-Path $TargetFile) {
    Copy-Item $TargetFile $BackupPath -Force
    Write-Host "[🔄] Created rollback backup: $BackupPath" -ForegroundColor Gray
}
