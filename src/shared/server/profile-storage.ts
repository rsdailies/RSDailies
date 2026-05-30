import fs from 'node:fs/promises';
import path from 'node:path';

const DATA_DIR = path.join(process.cwd(), 'user_data');

export type ServerSyncDriver = 'disabled' | 'filesystem';

type EnvLike = NodeJS.ProcessEnv | Record<string, string | undefined>;

export class ServerSyncDisabledError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'ServerSyncDisabledError';
	}
}

export function toSafeProfileFilename(profileName: string) {
	const normalized = String(profileName || 'default')
		.trim()
		.replace(/[<>:"/\\|?*\u0000-\u001f]/g, '-')
		.replace(/\.+$/g, '')
		.replace(/\s+/g, ' ');

	return normalized && normalized !== '.' && normalized !== '..' ? normalized : 'default';
}

export function getProfileFilePath(profileName: string) {
	return path.join(DATA_DIR, `${toSafeProfileFilename(profileName)}.json`);
}

function normalizeDriver(value: string | undefined): ServerSyncDriver {
	return String(value || '')
		.trim()
		.toLowerCase() === 'filesystem'
		? 'filesystem'
		: 'disabled';
}

function isTruthy(value: string | undefined) {
	return ['1', 'true', 'yes'].includes(
		String(value || '')
			.trim()
			.toLowerCase(),
	);
}

function isLocalFilesystemRuntime(env: EnvLike) {
	return (
		!isTruthy(env.VERCEL) && !env.AWS_LAMBDA_FUNCTION_NAME && String(env.NODE_ENV || '').toLowerCase() !== 'production'
	);
}

export function resolveServerSyncConfig(env: EnvLike = process.env) {
	const requestedDriver = normalizeDriver(env.SERVER_SYNC_DRIVER);
	if (requestedDriver !== 'filesystem') {
		return {
			driver: 'disabled' as const,
			enabled: false,
			message: 'Server profile backup is disabled for this deployment.',
		};
	}

	if (!isLocalFilesystemRuntime(env)) {
		return {
			driver: 'disabled' as const,
			enabled: false,
			message: 'Filesystem-backed server profile backup is only available for local development and preview runtimes.',
		};
	}

	return {
		driver: 'filesystem' as const,
		enabled: true,
		message: 'Local filesystem-backed profile backup is enabled.',
	};
}

async function writeProfileBackupToFilesystem(profileName: string, data: Record<string, unknown>, timestamp: number) {
	await fs.mkdir(DATA_DIR, { recursive: true });
	const filePath = getProfileFilePath(profileName);

	await fs.writeFile(
		filePath,
		JSON.stringify(
			{
				...data,
				_syncedAt: new Date().toISOString(),
				_timestamp: timestamp,
			},
			null,
			2,
		),
	);
}

async function readProfileBackupFromFilesystem(profileName: string) {
	const filePath = getProfileFilePath(profileName);
	const content = await fs.readFile(filePath, 'utf-8');
	return JSON.parse(content);
}

function getProfileStorageAdapter(env: EnvLike = process.env) {
	const config = resolveServerSyncConfig(env);
	if (!config.enabled) {
		return {
			...config,
			async readProfileBackup() {
				throw new ServerSyncDisabledError(config.message);
			},
			async writeProfileBackup() {
				throw new ServerSyncDisabledError(config.message);
			},
		};
	}

	return {
		...config,
		readProfileBackup: readProfileBackupFromFilesystem,
		writeProfileBackup: writeProfileBackupToFilesystem,
	};
}

export async function writeProfileBackup(profileName: string, data: Record<string, unknown>, timestamp: number) {
	const adapter = getProfileStorageAdapter();
	return adapter.writeProfileBackup(profileName, data, timestamp);
}

export async function readProfileBackup(profileName: string) {
	const adapter = getProfileStorageAdapter();
	return adapter.readProfileBackup(profileName);
}
