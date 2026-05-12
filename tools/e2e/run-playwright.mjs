import { spawn } from 'node:child_process';

const host = process.env.HOST || '127.0.0.1';
const port = Number(process.env.PORT || 4174);
const serverUrl = `http://${host}:${port}`;

function waitForServerReady(serverProcess, timeoutMs = 30000) {
	return new Promise((resolve, reject) => {
		let settled = false;
		const timeoutId = setTimeout(() => {
			if (settled) return;
			settled = true;
			reject(new Error(`Timed out waiting for ${serverUrl}`));
		}, timeoutMs);

		const handleReady = (chunk) => {
			const text = chunk.toString();
			process.stdout.write(text);
			if (!settled && text.includes(`Serving dist on ${serverUrl}`)) {
				settled = true;
				clearTimeout(timeoutId);
				resolve();
			}
		};

		serverProcess.stdout?.on('data', handleReady);
		serverProcess.stderr?.on('data', (chunk) => process.stderr.write(chunk.toString()));
		serverProcess.on('error', (error) => {
			if (settled) return;
			settled = true;
			clearTimeout(timeoutId);
			reject(error);
		});
		serverProcess.on('exit', (code) => {
			if (settled) return;
			settled = true;
			clearTimeout(timeoutId);
			reject(new Error(`Dist server exited before startup with code ${code ?? 1}`));
		});
	});
}

async function main() {
	const serverProcess = spawn('node', ['tools/e2e/serve-dist.mjs'], {
		stdio: ['ignore', 'pipe', 'pipe'],
		env: { ...process.env, HOST: host, PORT: String(port) },
	});

	let shuttingDown = false;
	const shutdownServer = () => {
		if (shuttingDown) return;
		shuttingDown = true;
		if (!serverProcess.killed) serverProcess.kill('SIGTERM');
	};

	process.on('SIGINT', () => { shutdownServer(); process.exit(130); });
	process.on('SIGTERM', () => { shutdownServer(); process.exit(143); });

	try {
		await waitForServerReady(serverProcess);
		const runner = spawn('node', ['node_modules/playwright/cli.js', 'test', ...process.argv.slice(2)], {
			stdio: 'inherit',
			env: { ...process.env, PLAYWRIGHT_TEST_BASE_URL: serverUrl },
		});
		const exitCode = await new Promise((resolve, reject) => {
			runner.on('exit', (code) => resolve(code ?? 1));
			runner.on('error', reject);
		});
		shutdownServer();
		process.exit(exitCode);
	} catch (error) {
		shutdownServer();
		throw error;
	}
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
