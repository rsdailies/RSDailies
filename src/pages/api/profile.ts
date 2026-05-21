import type { APIRoute } from 'astro';
import { readProfileBackup, writeProfileBackup } from '@shared/server/profile-storage';

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
	const profileName = String(url.searchParams.get('profileName') || '').trim();

	if (!profileName) {
		return json({ success: false, message: 'profileName is required.' }, { status: 400 });
	}

	try {
		return json({
			success: true,
			data: await readProfileBackup(profileName),
		});
	} catch {
		return json({ success: false, message: 'No backup found on server.' }, { status: 404 });
	}
};

export const POST: APIRoute = async ({ request }) => {
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
			syncedAt: new Date().toISOString(),
		});
	} catch {
		return json({ success: false, message: 'Server failed to write data to disk.' }, { status: 500 });
	}
};
