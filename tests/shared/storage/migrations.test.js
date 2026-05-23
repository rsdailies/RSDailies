import assert from 'node:assert/strict';
import test from 'node:test';

import {
	migrateLegacyCollapsedBlocks,
	migrateLegacyOverviewPins,
	migrateLegacyPageMode,
	migrateLegacySectionValue,
} from '../../../src/shared/storage/schema-v3.ts';
import { createMemoryStorage } from '../../helpers/memory-storage.js';

function profileStorageKey(profileName, key) {
	return `dailyscape:profile:${profileName}:${key}`;
}

const storageKeyBuilder = {
	overviewPins: () => 'overviewPins',
	collapsedBlocks: () => 'collapsedBlocks',
	timers: () => 'timers',
};

test('migrateLegacyPageMode renames legacy timer page values', () => {
	const storage = createMemoryStorage();
	storage.setItem(profileStorageKey('default', 'pageMode'), JSON.stringify('rs3farming'));

	const changed = migrateLegacyPageMode(storage, 'default', 'pageMode', profileStorageKey);

	assert.equal(changed, true);
	assert.equal(JSON.parse(storage.getItem(profileStorageKey('default', 'pageMode'))), 'timers');
});

test('migrateLegacyOverviewPins rewrites legacy timer prefixes', () => {
	const storage = createMemoryStorage();
	storage.setItem(
		profileStorageKey('default', storageKeyBuilder.overviewPins()),
		JSON.stringify({ 'rs3farming::herb-run': true }),
	);

	const changed = migrateLegacyOverviewPins(storage, 'default', profileStorageKey, storageKeyBuilder);

	assert.equal(changed, true);
	assert.deepEqual(JSON.parse(storage.getItem(profileStorageKey('default', 'overviewPins'))), {
		'timers::herb-run': true,
	});
});

test('migrateLegacyCollapsedBlocks rewrites legacy group collapse keys', () => {
	const storage = createMemoryStorage();
	storage.setItem(
		profileStorageKey('default', storageKeyBuilder.collapsedBlocks()),
		JSON.stringify({ 'group-collapse-rs3farming': true }),
	);

	const changed = migrateLegacyCollapsedBlocks(storage, 'default', profileStorageKey, storageKeyBuilder);

	assert.equal(changed, true);
	assert.deepEqual(JSON.parse(storage.getItem(profileStorageKey('default', 'collapsedBlocks'))), {
		'group-collapse-timers': true,
	});
});

test('migrateLegacySectionValue moves legacy section values to timers', () => {
	const storage = createMemoryStorage();
	storage.setItem(profileStorageKey('default', 'completed:rs3farming'), JSON.stringify({ 'rs3farming::a': true }));

	const changed = migrateLegacySectionValue(storage, 'default', 'completed', profileStorageKey, (value) => value);

	assert.equal(changed, true);
	assert.deepEqual(JSON.parse(storage.getItem(profileStorageKey('default', 'completed:timers'))), {
		'rs3farming::a': true,
	});
	assert.equal(storage.getItem(profileStorageKey('default', 'completed:rs3farming')), null);
});
