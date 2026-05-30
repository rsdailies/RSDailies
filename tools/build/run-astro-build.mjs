import { spawn, spawnSync } from 'node:child_process';
import { mkdir, open, readFile, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = fileURLToPath(new URL('../../', import.meta.url));
const lockDir = path.join(repoRoot, '.astro-cache', 'build');
const lockPath = path.join(lockDir, 'astro-build.lock');
const vercelDir = path.join(repoRoot, '.vercel');
const lockTimeoutMs = Number(process.env.DS_BUILD_LOCK_TIMEOUT_MS || 5 * 60 * 1000);
const retryDelayMs = 1000;
const waitLogIntervalMs = 5000;
const contentionErrorCodes = new Set(['EEXIST', 'EPERM', 'EACCES']);
const warningFilters = [
	'Experimental optimizeDeps.disabled and deps pre-bundling during build were removed in Vite 5.1.',
	'Experimental ssr.optimizeDeps.disabled and deps pre-bundling during build were removed in Vite 5.1.',
	'To disable the deps optimizer, set optimizeDeps.noDiscovery to true and optimizeDeps.include as undefined or empty.',
	'To disable the deps optimizer, set ssr.optimizeDeps.noDiscovery to true and ssr.optimizeDeps.include as undefined or empty.',
	'Please remove optimizeDeps.disabled from your config.',
	'Please remove ssr.optimizeDeps.disabled from your config.',
];

let lockHeld = false;

async function ensureLockDir() {
	await mkdir(lockDir, { recursive: true });
}

async function releaseLock() {
	if (!lockHeld) return;
	lockHeld = false;
	await rm(lockPath, { force: true }).catch(() => {});
}

async function cleanVercelOutput() {
	if (process.platform === 'win32') {
		const result = spawnSync('cmd', ['/c', 'rmdir', '/s', '/q', vercelDir], {
			cwd: repoRoot,
			stdio: 'ignore',
		});
		if (result.status === 0) return;
	}

	await rm(vercelDir, { recursive: true, force: true });
}

async function readLockMetadata() {
	try {
		const [contents, stats] = await Promise.all([readFile(lockPath, 'utf8'), stat(lockPath)]);
		let metadata = null;
		try {
			metadata = JSON.parse(contents);
		} catch {}
		return { contents, metadata, stats };
	} catch (error) {
		if (error?.code === 'ENOENT') return null;
		throw error;
	}
}

async function removeLockIfPresent() {
	await rm(lockPath, { force: true });
}

function isPidAlive(pid) {
	if (!Number.isInteger(pid) || pid <= 0) return false;
	try {
		process.kill(pid, 0);
		return true;
	} catch {
		return false;
	}
}

function isStaleLock(lockInfo) {
	if (!lockInfo) return false;

	const lockAgeMs = Date.now() - lockInfo.stats.mtimeMs;
	if (Number.isFinite(lockAgeMs) && lockAgeMs >= lockTimeoutMs) return true;

	const acquiredAtMs = Date.parse(lockInfo.metadata?.acquiredAt || '');
	if (Number.isFinite(acquiredAtMs) && Date.now() - acquiredAtMs >= lockTimeoutMs) return true;

	const lockPid = Number(lockInfo.metadata?.pid);
	if (Number.isInteger(lockPid) && lockPid > 0 && !isPidAlive(lockPid)) return true;

	return false;
}

async function acquireLock() {
	await ensureLockDir();
	const startedAt = Date.now();
	let lastLogAt = 0;

	while (true) {
		try {
			const handle = await open(lockPath, 'wx');
			const metadata = {
				pid: process.pid,
				acquiredAt: new Date().toISOString(),
				command: 'astro build',
			};
			await writeFile(handle, `${JSON.stringify(metadata, null, 2)}\n`);
			await handle.close();
			lockHeld = true;
			return;
		} catch (error) {
			if (!contentionErrorCodes.has(error?.code)) throw error;

			const elapsed = Date.now() - startedAt;
			const lockInfo = await readLockMetadata().catch(() => null);
			if (lockInfo && isStaleLock(lockInfo)) {
				await removeLockIfPresent();
				continue;
			}

			if (elapsed >= lockTimeoutMs) {
				let holder = '';
				try {
					holder = lockInfo?.contents || (await readFile(lockPath, 'utf8'));
				} catch {}
				throw new Error(
					`Timed out waiting for Astro build lock after ${Math.round(elapsed / 1000)}s.${holder ? ` Lock holder: ${holder.trim()}` : ''}`,
				);
			}

			if (elapsed - lastLogAt >= waitLogIntervalMs) {
				lastLogAt = elapsed;
				console.log(
					`[build-lock] Waiting for another Astro build to finish (${Math.round(elapsed / 1000)}s elapsed)...`,
				);
			}

			await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
		}
	}
}

function runAstroBuild() {
	return new Promise((resolve, reject) => {
		const child = spawn('node', ['node_modules/astro/bin/astro.mjs', 'build'], {
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
				reject(new Error(`Astro build terminated by signal ${signal}`));
				return;
			}
			resolve(code ?? 1);
		});
	});
}

for (const signal of ['SIGINT', 'SIGTERM']) {
	process.on(signal, async () => {
		await releaseLock();
		process.exit(signal === 'SIGINT' ? 130 : 143);
	});
}

process.on('uncaughtException', async (error) => {
	console.error(error);
	await releaseLock();
	process.exit(1);
});

process.on('unhandledRejection', async (error) => {
	console.error(error);
	await releaseLock();
	process.exit(1);
});

try {
	await acquireLock();
	await cleanVercelOutput();
	const exitCode = await runAstroBuild();
	await releaseLock();
	process.exit(exitCode);
} catch (error) {
	await releaseLock();
	console.error(error instanceof Error ? error.message : String(error));
	process.exit(1);
}
