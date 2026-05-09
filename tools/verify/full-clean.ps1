$ErrorActionPreference = 'Stop'

$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path

function Invoke-Step {
	param(
		[Parameter(Mandatory = $true)]
		[string]$Label,
		[Parameter(Mandatory = $true)]
		[string]$FilePath,
		[Parameter(Mandatory = $false)]
		[string[]]$ArgumentList = @()
	)

	Write-Host ""
	Write-Host "[verify:full] $Label"

	$process = Start-Process `
		-FilePath $FilePath `
		-ArgumentList $ArgumentList `
		-WorkingDirectory $RepoRoot `
		-NoNewWindow `
		-PassThru `
		-Wait

	if ($process.ExitCode -ne 0) {
		throw "Step failed: $Label ($($process.ExitCode))"
	}
}

Invoke-Step -Label 'test' -FilePath 'node' -ArgumentList @('--test', 'tests/**/*.test.js')
Invoke-Step -Label 'audit:content' -FilePath 'node' -ArgumentList @('tools/audit/validate-content.mjs')
Invoke-Step -Label 'audit:routes' -FilePath 'node' -ArgumentList @('tools/audit/verify-routes.mjs')
Invoke-Step -Label 'audit:timers' -FilePath 'node' -ArgumentList @('tools/audit/validate-timers.mjs')
Invoke-Step -Label 'build' -FilePath 'npm.cmd' -ArgumentList @('run', 'build')
Invoke-Step -Label 'test:e2e' -FilePath 'npm.cmd' -ArgumentList @('run', 'test:e2e')
