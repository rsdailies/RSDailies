$ErrorActionPreference = 'Stop'

$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path

$process = Start-Process `
	-FilePath 'node' `
	-ArgumentList @('tools/verify/run-full.mjs') `
	-WorkingDirectory $RepoRoot `
	-NoNewWindow `
	-PassThru `
	-Wait

if ($process.ExitCode -ne 0) {
	throw "Step failed: verify:full ($($process.ExitCode))"
}
