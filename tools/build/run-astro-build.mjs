import { spawn } from 'node:child_process';
import { mkdir, open, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = fileURLToPath(new URL('../../', import.meta.url));
const lockDir = path.join(repoRoot, '.tmp');
const lockPath = path.join(lockDir, 'astro-build.lock');
const lockTimeoutMs = Number(process.env.DS_BUILD_LOCK_TIMEOUT_MS || 5 * 60 * 1000);
const retryDelayMs = 1000;
const waitLogIntervalMs = 5000;

let lockHeld = false;

async function ensureLockDir() {
	await mkdir(lockDir, { recursive: true });
}

async function releaseLock() {
	if (!lockHeld) return;
	lockHeld = false;
	await rm(lockPath, { force: true }).catch(() => {});
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
			if (error?.code !== 'EEXIST') throw error;

			const elapsed = Date.now() - startedAt;
			if (elapsed >= lockTimeoutMs) {
				let holder = '';
				try {
					holder = await readFile(lockPath, 'utf8');
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
			stdio: 'inherit',
		});

		child.on('error', reject);
		child.on('exit', (code, signal) => {
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
	const exitCode = await runAstroBuild();
	await releaseLock();
	process.exit(exitCode);
} catch (error) {
	await releaseLock();
	console.error(error instanceof Error ? error.message : String(error));
	process.exit(1);
}
