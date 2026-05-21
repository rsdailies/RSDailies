import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repoRoot = fileURLToPath(new URL('../../', import.meta.url));
const isWindows = process.platform === 'win32';
const npmStep = (...args) =>
	isWindows ? { command: 'cmd.exe', args: ['/c', 'npm', ...args] } : { command: 'npm', args };

const nodeWithTypeStripping = (scriptPath) => ({
	command: 'node',
	args: ['--experimental-strip-types', scriptPath],
});

const auditInfraFailurePatterns = [
	/audit endpoint returned an error/i,
	/request to .*security\/audits/i,
	/failed, reason:/i,
	/timed out/i,
	/econnreset/i,
	/enotfound/i,
	/eai_again/i,
	/503 service unavailable/i,
	/502 bad gateway/i,
	/504 gateway timeout/i,
];

const steps = [
	{
		label: 'check',
		...npmStep('run', 'check'),
	},
	{
		label: 'test',
		command: 'node',
		args: ['--experimental-strip-types', '--test', 'tests/**/*.test.js'],
	},
	{
		label: 'audit:content',
		...nodeWithTypeStripping('tools/audit/validate-content.mjs'),
	},
	{
		label: 'audit:no-bootstrap',
		...nodeWithTypeStripping('tools/audit/no-bootstrap-js-controls.mjs'),
	},
	{
		label: 'audit:no-bootstrap-vocabulary',
		...nodeWithTypeStripping('tools/audit/no-bootstrap-class-vocabulary.mjs'),
	},
	{
		label: 'audit:no-legacy-surface',
		...nodeWithTypeStripping('tools/audit/no-legacy-shipped-surface.mjs'),
	},
	{
		label: 'audit:no-hash-links',
		...nodeWithTypeStripping('tools/audit/no-hash-action-links.mjs'),
	},
	{
		label: 'audit:dependencies',
		...nodeWithTypeStripping('tools/audit/dependency-audit.mjs'),
	},
	{
		label: 'audit:routes',
		...nodeWithTypeStripping('tools/audit/verify-routes.mjs'),
	},
	{
		label: 'audit:timers',
		...nodeWithTypeStripping('tools/audit/validate-timers.mjs'),
	},
	{
		label: 'npm audit',
		...npmStep('audit'),
	},
	{
		label: 'build',
		...npmStep('run', 'build'),
	},
	{
		label: 'audit:headings',
		...nodeWithTypeStripping('tools/audit/heading-audit.mjs'),
	},
	{
		label: 'audit:asset-budget',
		...nodeWithTypeStripping('tools/audit/asset-budget.mjs'),
	},
	{
		label: 'test:e2e',
		command: 'node',
		args: ['tools/e2e/run-playwright.mjs'],
	},
];

function runStep(step) {
	return new Promise((resolve, reject) => {
		console.log(`\n[verify:full] ${step.label}`);
		const stdout = [];
		const stderr = [];
		const child = spawn(step.command, step.args, {
			cwd: repoRoot,
			stdio: ['ignore', 'pipe', 'pipe'],
			shell: false,
		});

		child.stdout?.on('data', (chunk) => {
			const text = chunk.toString();
			stdout.push(text);
			process.stdout.write(text);
		});

		child.stderr?.on('data', (chunk) => {
			const text = chunk.toString();
			stderr.push(text);
			process.stderr.write(text);
		});

		child.on('error', reject);
		child.on('exit', (code) => {
			if (code === 0) {
				resolve();
				return;
			}

			if (step.label === 'npm audit') {
				const output = `${stdout.join('')}\n${stderr.join('')}`;
				const isInfraFailure = auditInfraFailurePatterns.some((pattern) => pattern.test(output));
				if (isInfraFailure) {
					console.warn(
						'[verify:full] npm audit could not complete because the audit service or registry endpoint was unavailable. Continuing verification, but security status is incomplete and npm audit must be rerun later.',
					);
					resolve();
					return;
				}
			}

			reject(new Error(`Step failed: ${step.label} (${code ?? 1})`));
		});
	});
}

for (const step of steps) {
	await runStep(step);
}
