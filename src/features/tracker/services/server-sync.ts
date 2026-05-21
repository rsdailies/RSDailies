interface SyncPayload {
	profileName: string;
	data: Record<string, unknown>;
	timestamp: number;
}

async function readJson<T>(response: Response): Promise<T | null> {
	try {
		return (await response.json()) as T;
	} catch {
		return null;
	}
}

export async function fetchServerProfile(profileName: string) {
	const response = await fetch(`/api/profile?profileName=${encodeURIComponent(profileName)}`, {
		method: 'GET',
		headers: {
			Accept: 'application/json',
		},
	});

	return readJson<{ success?: boolean; data?: Record<string, unknown> }>(response);
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

	return readJson<{ success?: boolean; syncedAt?: string }>(response);
}
