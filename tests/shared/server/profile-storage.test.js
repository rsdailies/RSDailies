import assert from 'node:assert/strict';
import test from 'node:test';

import { getClientServerSyncStatus } from '../../../src/features/tracker/services/server-sync.ts';
import { resolveServerSyncConfig } from '../../../src/shared/server/profile-storage.ts';

test('server sync config defaults to disabled', () => {
	assert.deepEqual(resolveServerSyncConfig({}), {
		driver: 'disabled',
		enabled: false,
		message: 'Server profile backup is disabled for this deployment.',
	});
});

test('server sync config enables filesystem only for local runtimes', () => {
	assert.deepEqual(resolveServerSyncConfig({ SERVER_SYNC_DRIVER: 'filesystem' }), {
		driver: 'filesystem',
		enabled: true,
		message: 'Local filesystem-backed profile backup is enabled.',
	});

	assert.deepEqual(resolveServerSyncConfig({ SERVER_SYNC_DRIVER: 'filesystem', NODE_ENV: 'production' }), {
		driver: 'disabled',
		enabled: false,
		message: 'Filesystem-backed server profile backup is only available for local development and preview runtimes.',
	});
});

test('client sync status only enables when both public flags are present', () => {
	assert.equal(getClientServerSyncStatus({ PUBLIC_ENABLE_SERVER_SYNC: 'true' }).enabled, false);
	assert.equal(
		getClientServerSyncStatus({
			PUBLIC_ENABLE_SERVER_SYNC: 'true',
			PUBLIC_SERVER_SYNC_DRIVER: 'filesystem',
		}).enabled,
		true,
	);
});
