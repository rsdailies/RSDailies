interface SyncPayload {
	profileName: string;
	data: Record<string, unknown>;
	timestamp: number;
}

type SyncResponse<T = Record<string, unknown>> = {
	ok: boolean;
	status: number;
	success?: boolean;
	message?: string;
	driver?: string;
	data?: T;
	syncedAt?: string;
};

type ClientEnvLike = Record<string, string | undefined>;

function getClientEnv(env?: ClientEnvLike) {
	if (env) return env;
	return ((import.meta.env as ClientEnvLike | undefined) ??
		(process.env as ClientEnvLike | undefined) ??
		{}) as ClientEnvLike;
}

function isTruthy(value: string | undefined) {
	return ['1', 'true', 'yes'].includes(
		String(value || '')
			.trim()
			.toLowerCase(),
	);
}

export function getClientServerSyncStatus(env?: ClientEnvLike) {
	const clientEnv = getClientEnv(env);
	const driver =
		String(clientEnv.PUBLIC_SERVER_SYNC_DRIVER || '')
			.trim()
			.toLowerCase() === 'filesystem'
			? 'filesystem'
			: 'disabled';
	const enabled = isTruthy(clientEnv.PUBLIC_ENABLE_SERVER_SYNC) && driver === 'filesystem';

	return {
		driver,
		enabled,
		message: enabled
			? 'Local server backup is enabled for this build.'
			: 'Server backup is disabled for this build. Use Import / Export to move or back up data.',
	};
}

async function readJson<T>(response: Response): Promise<SyncResponse<T>> {
	try {
		return {
			ok: response.ok,
			status: response.status,
			...((await response.json()) as Record<string, unknown>),
		} as SyncResponse<T>;
	} catch {
		return {
			ok: response.ok,
			status: response.status,
			success: false,
			message: `Server profile sync failed with status ${response.status}.`,
		};
	}
}

export async function fetchServerProfile(profileName: string) {
	const response = await fetch(`/api/profile?profileName=${encodeURIComponent(profileName)}`, {
		method: 'GET',
		headers: {
			Accept: 'application/json',
		},
	});

	return readJson<Record<string, unknown>>(response);
}

export async function syncServerProfile(payload: SyncPayload) {
	const response = await fetch('/api/profile', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json',
		},
		body: JSON.stringify(payload),
	});

	return readJson(response);
}
