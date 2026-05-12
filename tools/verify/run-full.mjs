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
