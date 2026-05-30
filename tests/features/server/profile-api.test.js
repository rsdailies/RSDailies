import assert from 'node:assert/strict';
import test from 'node:test';

import { GET, POST } from '../../../src/pages/api/profile.ts';
import { getProfileFilePath } from '../../../src/shared/server/profile-storage.ts';

async function readJson(response) {
	return response.json();
}

test('profile api reports disabled sync by default', async () => {
	delete process.env.SERVER_SYNC_DRIVER;
	delete process.env.NODE_ENV;
	delete process.env.VERCEL;

	const response = await GET({
		url: new URL('http://localhost/api/profile?profileName=default'),
	});

	assert.equal(response.status, 503);
	const payload = await readJson(response);
	assert.equal(payload.success, false);
	assert.match(payload.message, /disabled/i);
});

test('profile api reads and writes backups when filesystem sync is enabled locally', async (t) => {
	process.env.SERVER_SYNC_DRIVER = 'filesystem';
	delete process.env.NODE_ENV;
	delete process.env.VERCEL;

	const profileName = `profile-api-${Date.now()}`;
	const filePath = getProfileFilePath(profileName);
	t.after(async () => {
		const fs = await import('node:fs/promises');
		await fs.rm(filePath, { force: true });
		delete process.env.SERVER_SYNC_DRIVER;
	});

	const postResponse = await POST({
		request: new Request('http://localhost/api/profile', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				profileName,
				timestamp: Date.now(),
				data: {
					'test:key': { ok: true },
				},
			}),
		}),
	});

	assert.equal(postResponse.status, 200);
	const postPayload = await readJson(postResponse);
	assert.equal(postPayload.success, true);
	assert.equal(postPayload.driver, 'filesystem');

	const getResponse = await GET({
		url: new URL(`http://localhost/api/profile?profileName=${encodeURIComponent(profileName)}`),
	});

	assert.equal(getResponse.status, 200);
	const getPayload = await readJson(getResponse);
	assert.equal(getPayload.success, true);
	assert.equal(getPayload.driver, 'filesystem');
	assert.deepEqual(getPayload.data['test:key'], { ok: true });
});
