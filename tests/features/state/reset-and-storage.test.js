import test from 'node:test';
import assert from 'node:assert/strict';

import { StorageKeyBuilder } from '../../../src/lib/shared/storage/keys-builder.ts';
import * as StorageService from '../../../src/lib/shared/storage/storage-service.ts';
import { checkAutoReset, resetSectionView } from '../../../src/lib/features/sections/reset-service.ts';
import { upsertCustomTask } from '../../../src/lib/features/custom-tasks/custom-task-service.ts';
import { createMemoryStorage } from '../../helpers/memory-storage.js';

function initMemoryProfile() {
	const storage = createMemoryStorage();
	StorageService.initStorageService('default', storage);
	return storage;
}

test('storage service isolates profile keys and export tokens', () => {
	initMemoryProfile();
	StorageService.save('alpha', { ok: true });

	StorageService.setActiveProfile('alt');
	StorageService.save('beta', 42);

	StorageService.setActiveProfile('default');
	assert.deepEqual(StorageService.load('alpha', null), { ok: true });
	assert.equal(StorageService.load('beta', null), null);
	assert.ok(StorageService.buildExportToken().length > 10);
});

test('section reset clears owned view state', () => {
	initMemoryProfile();
	StorageService.save(StorageKeyBuilder.sectionCompletion('rs3daily'), { a: true });
	StorageService.save(StorageKeyBuilder.sectionHiddenRows('rs3daily'), { a: true });

	resetSectionView('rs3daily', {
		load: StorageService.load,
		save: StorageService.save,
		removeKey: StorageService.remove,
	});

	assert.deepEqual(StorageService.load(StorageKeyBuilder.sectionCompletion('rs3daily'), {}), {});
	assert.deepEqual(StorageService.load(StorageKeyBuilder.sectionHiddenRows('rs3daily'), {}), {});
});

test('auto reset clears custom daily completions exactly once after a missed boundary', () => {
	initMemoryProfile();
	upsertCustomTask({ id: 'custom-daily', name: 'Daily thing', reset: 'daily', game: 'rs3' });
	StorageService.save(StorageKeyBuilder.sectionCompletion('custom'), { 'custom-daily': true });
	StorageService.save(StorageKeyBuilder.lastVisit(), Date.now() - 2 * 86400000);

	const changed = checkAutoReset({
		load: StorageService.load,
		save: StorageService.save,
		removeKey: StorageService.remove,
	});

	assert.equal(changed, true);
	assert.deepEqual(StorageService.load(StorageKeyBuilder.sectionCompletion('custom'), {}), {});
});
