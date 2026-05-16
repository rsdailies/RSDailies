import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repoRoot = fileURLToPath(new URL('../../', import.meta.url));
const isWindows = process.platform === 'win32';
const npmStep = (...args) =>
	isWindows
		? { command: 'cmd.exe', args: ['/c', 'npm', ...args] }
		: { command: 'npm', args };

const nodeWithTypeStripping = (scriptPath) => ({
	command: 'node',
	args: ['--experimental-strip-types', scriptPath],
});

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
		const child = spawn(step.command, step.args, {
			cwd: repoRoot,
			stdio: 'inherit',
			shell: false,
		});

		child.on('error', reject);
		child.on('exit', (code) => {
			if (code === 0) {
				resolve();
				return;
			}
			reject(new Error(`Step failed: ${step.label} (${code ?? 1})`));
		});
	});
}

for (const step of steps) {
	await runStep(step);
}
