function loadJson(key: string, fallback: any, storage: Storage) {
	try {
		const raw = storage.getItem(key);
		return raw !== null ? JSON.parse(raw) : fallback;
	} catch {
		return fallback;
	}
}

function saveJson(key: string, value: any, storage: Storage) {
	storage.setItem(key, JSON.stringify(value));
}

const LEGACY_TIMER_SECTION_KEY = 'rs3farming';
const TIMER_SECTION_KEY = 'timers';

export function renameValue(value: any, replacements: string[][]) {
	if (typeof value !== 'string') return value;
	return replacements.reduce((nextValue, [from, to]) => nextValue.split(from).join(to), value);
}

export function renameObjectKeys(value: any, replacements: string[][]) {
	if (!value || typeof value !== 'object' || Array.isArray(value)) return value;
	return Object.entries(value).reduce<Record<string, any>>((nextValue, [key, entryValue]) => {
		nextValue[renameValue(key, replacements)] = entryValue;
		return nextValue;
	}, {});
}

export function migrateLegacySectionValue(
	storage: Storage,
	profileName: string,
	sectionValueKey: string,
	profileStorageKey: (profileName: string, key: string) => string,
	transform = (value: any) => value
) {
	const legacyKey = profileStorageKey(profileName, `${sectionValueKey}:${LEGACY_TIMER_SECTION_KEY}`);
	const nextKey = profileStorageKey(profileName, `${sectionValueKey}:${TIMER_SECTION_KEY}`);
	const legacyValue = loadJson(legacyKey, null, storage);
	const hasLegacyValue = storage.getItem(legacyKey) !== null;

	if (!hasLegacyValue || storage.getItem(nextKey) !== null) return false;

	saveJson(nextKey, transform(legacyValue), storage);
	storage.removeItem(legacyKey);
	return true;
}

export function migrateLegacyPageMode(storage: Storage, profileName: string, key: string, profileStorageKey: any) {
	const storageKey = profileStorageKey(profileName, key);
	const storedValue = loadJson(storageKey, null, storage);
	const nextValue = renameValue(storedValue, [[LEGACY_TIMER_SECTION_KEY, TIMER_SECTION_KEY]]);

	if (nextValue === storedValue) return false;

	saveJson(storageKey, nextValue, storage);
	return true;
}

export function migrateLegacyTimerStorage(storage: Storage, profileName: string, profileStorageKey: any, StorageKeyBuilder: any) {
	const legacyKey = profileStorageKey(profileName, 'farmingTimers');
	const nextKey = profileStorageKey(profileName, StorageKeyBuilder.timers());
	const hasLegacyValue = storage.getItem(legacyKey) !== null;

	if (!hasLegacyValue || storage.getItem(nextKey) !== null) return false;

	const legacyValue = loadJson(legacyKey, {}, storage);
	saveJson(nextKey, legacyValue, storage);
	storage.removeItem(legacyKey);
	return true;
}

export function migrateLegacyOverviewPins(storage: Storage, profileName: string, profileStorageKey: any, StorageKeyBuilder: any) {
	const key = profileStorageKey(profileName, StorageKeyBuilder.overviewPins());
	const pins = loadJson(key, null, storage);
	const nextPins = renameObjectKeys(pins, [[`${LEGACY_TIMER_SECTION_KEY}::`, `${TIMER_SECTION_KEY}::`]]);

	if (!nextPins || JSON.stringify(nextPins) === JSON.stringify(pins)) return false;

	saveJson(key, nextPins, storage);
	return true;
}

export function migrateLegacyCollapsedBlocks(storage: Storage, profileName: string, profileStorageKey: any, StorageKeyBuilder: any) {
	const key = profileStorageKey(profileName, StorageKeyBuilder.collapsedBlocks());
	const collapsedBlocks = loadJson(key, null, storage);
	const nextBlocks = renameObjectKeys(collapsedBlocks, [[`group-collapse-${LEGACY_TIMER_SECTION_KEY}`, `group-collapse-${TIMER_SECTION_KEY}`]]);

	if (!nextBlocks || JSON.stringify(nextBlocks) === JSON.stringify(collapsedBlocks)) return false;

	saveJson(key, nextBlocks, storage);
	return true;
}
