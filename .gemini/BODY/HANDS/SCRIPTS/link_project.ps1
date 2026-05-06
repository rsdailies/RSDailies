# Neuro-Sync Engine: project infection script.
# Purpose: bridge an external workspace to the global framework BODY.

param(
    [string]$WorkspaceRoot = $PSScriptRoot,
    [string]$GlobalBodyPath = "c:\Users\antho\.gemini\BODY"
)

Write-Host "--- Starting Project Infection: $WorkspaceRoot ---" -ForegroundColor Green

$GeminiDir = Join-Path $WorkspaceRoot ".gemini"
if (-not (Test-Path $GeminiDir)) {
    New-Item -ItemType Directory -Path $GeminiDir -Force | Out-Null
    Write-Host "[+] Created .gemini/ directory."
}

$LocalBody = Join-Path $GeminiDir "BODY"
if (-not (Test-Path $LocalBody)) {
    cmd /c mklink /j "$LocalBody" "$GlobalBodyPath"
    Write-Host "[+] Established BODY junction to global framework."
} else {
    Write-Host "[!] BODY bridge already exists."
}

$GeminiMD = Join-Path $GeminiDir "GEMINI.md"
$MDContent = @"
---
title: Gemini Anatomical Bridge (Project Infected)
description: This workspace is bridged to the global anatomical framework.
---
@./BODY/SKELETON/BOOT.md
@./BODY/HEART/POLICIES/OPERATING_PRINCIPLES.md
@./BODY/BRAIN/ORCHESTRATION/CURRENT_STATE.md
@./BODY/BRAIN/ORCHESTRATION/ACTIVE_PLAN.md
@./BODY/SKELETON/STRUCTURE/BODY_MAP.md
"@

if (-not (Test-Path $GeminiMD)) {
    Set-Content -Path $GeminiMD -Value $MDContent
    Write-Host "[+] Created .gemini/GEMINI.md entry point."
}

$AgentsMD = Join-Path $WorkspaceRoot "AGENTS.md"
$AGContent = "This project is governed by .gemini/BODY.`nRead .gemini/BODY/SKELETON/BOOT.md first."

if (-not (Test-Path $AgentsMD)) {
    Set-Content -Path $AgentsMD -Value $AGContent
    Write-Host "[+] Created AGENTS.md root shim."
}

Write-Host "--- Project infection complete. ---" -ForegroundColor Green
