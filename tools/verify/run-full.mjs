import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repoRoot = fileURLToPath(new URL('../../', import.meta.url));
const isWindows = process.platform === 'win32';
const npmStep = (...args) =>
	isWindows
		? { command: 'cmd.exe', args: ['/c', 'npm', ...args] }
		: { command: 'npm', args };

const steps = [
	{
		label: 'test',
		command: 'node',
		args: ['--test', 'tests/**/*.test.js'],
	},
	{
		label: 'audit:content',
		command: 'node',
		args: ['tools/audit/validate-content.mjs'],
	},
	{
		label: 'audit:routes',
		command: 'node',
		args: ['tools/audit/verify-routes.mjs'],
	},
	{
		label: 'audit:timers',
		command: 'node',
		args: ['tools/audit/validate-timers.mjs'],
	},
	{
		label: 'build',
		...npmStep('run', 'build'),
	},
	{
		label: 'test:e2e',
		...npmStep('run', 'test:e2e'),
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
