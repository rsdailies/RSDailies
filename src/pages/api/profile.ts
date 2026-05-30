import type { APIRoute } from 'astro';
import {
	ServerSyncDisabledError,
	readProfileBackup,
	resolveServerSyncConfig,
	writeProfileBackup,
} from '../../shared/server/profile-storage.ts';

function json(body: unknown, init: ResponseInit = {}) {
	return new Response(JSON.stringify(body), {
		...init,
		headers: {
			'Content-Type': 'application/json; charset=utf-8',
			...(init.headers || {}),
		},
	});
}

export const GET: APIRoute = async ({ url }) => {
	const syncConfig = resolveServerSyncConfig();
	if (!syncConfig.enabled) {
		return json({ success: false, driver: syncConfig.driver, message: syncConfig.message }, { status: 503 });
	}

	const profileName = String(url.searchParams.get('profileName') || '').trim();

	if (!profileName) {
		return json({ success: false, message: 'profileName is required.' }, { status: 400 });
	}

	try {
		return json({
			success: true,
			driver: syncConfig.driver,
			data: await readProfileBackup(profileName),
		});
	} catch (error) {
		if (error instanceof ServerSyncDisabledError) {
			return json({ success: false, driver: syncConfig.driver, message: error.message }, { status: 503 });
		}

		return json({ success: false, message: 'No backup found on server.' }, { status: 404 });
	}
};

export const POST: APIRoute = async ({ request }) => {
	const syncConfig = resolveServerSyncConfig();
	if (!syncConfig.enabled) {
		return json({ success: false, driver: syncConfig.driver, message: syncConfig.message }, { status: 503 });
	}

	try {
		const payload = await request.json();
		const profileName = String(payload?.profileName || '').trim();
		const data = payload?.data;
		const timestamp = Number(payload?.timestamp || Date.now());

		if (!profileName || !data || typeof data !== 'object') {
			return json({ success: false, message: 'Invalid profile sync payload.' }, { status: 400 });
		}

		await writeProfileBackup(profileName, data as Record<string, unknown>, timestamp);

		return json({
			success: true,
			driver: syncConfig.driver,
			syncedAt: new Date().toISOString(),
		});
	} catch (error) {
		if (error instanceof ServerSyncDisabledError) {
			return json({ success: false, driver: syncConfig.driver, message: error.message }, { status: 503 });
		}

		return json({ success: false, message: 'Server failed to write data to disk.' }, { status: 500 });
	}
};
