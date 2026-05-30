import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repoRoot = fileURLToPath(new URL('../../', import.meta.url));
const warningFilters = [
	'Experimental optimizeDeps.disabled and deps pre-bundling during build were removed in Vite 5.1.',
	'Experimental ssr.optimizeDeps.disabled and deps pre-bundling during build were removed in Vite 5.1.',
	'To disable the deps optimizer, set optimizeDeps.noDiscovery to true and optimizeDeps.include as undefined or empty.',
	'To disable the deps optimizer, set ssr.optimizeDeps.noDiscovery to true and ssr.optimizeDeps.include as undefined or empty.',
	'Please remove optimizeDeps.disabled from your config.',
	'Please remove ssr.optimizeDeps.disabled from your config.',
];

function runAstroCheck() {
	return new Promise((resolve, reject) => {
		const child = spawn('node', ['node_modules/astro/bin/astro.mjs', 'check'], {
			cwd: repoRoot,
			stdio: ['ignore', 'pipe', 'pipe'],
		});

		const stdoutState = { text: '' };
		const stderrState = { text: '' };

		const writeFiltered = (chunk, destination, buffer) => {
			buffer.text += chunk.toString();
			const lines = buffer.text.split(/\r?\n/);
			buffer.text = lines.pop() ?? '';

			for (const line of lines) {
				if (warningFilters.some((warning) => line.includes(warning))) continue;
				destination.write(`${line}\n`);
			}
		};

		child.stdout.on('data', (chunk) => writeFiltered(chunk, process.stdout, stdoutState));
		child.stderr.on('data', (chunk) => writeFiltered(chunk, process.stderr, stderrState));

		child.on('error', reject);
		child.on('exit', (code, signal) => {
			if (stdoutState.text && !warningFilters.some((warning) => stdoutState.text.includes(warning))) {
				process.stdout.write(stdoutState.text);
			}
			if (stderrState.text && !warningFilters.some((warning) => stderrState.text.includes(warning))) {
				process.stderr.write(stderrState.text);
			}
			if (signal) {
				reject(new Error(`Astro check terminated by signal ${signal}`));
				return;
			}

			resolve(code ?? 1);
		});
	});
}

try {
	const exitCode = await runAstroCheck();
	process.exit(exitCode);
} catch (error) {
	console.error(error instanceof Error ? error.message : String(error));
	process.exit(1);
}
