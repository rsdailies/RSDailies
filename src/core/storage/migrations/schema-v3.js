import { loadJson, saveJson } from '../local-store.js';

const LEGACY_TIMER_SECTION_KEY = 'rs3farming';
const TIMER_SECTION_KEY = 'timers';

export function renameValue(value, replacements) {
  if (typeof value !== 'string') return value;
  return replacements.reduce(
    (nextValue, [from, to]) => nextValue.split(from).join(to),
    value
  );
}

export function renameObjectKeys(value, replacements) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return value;
  return Object.entries(value).reduce((nextValue, [key, entryValue]) => {
    nextValue[renameValue(key, replacements)] = entryValue;
    return nextValue;
  }, {});
}

export function migrateLegacySectionValue(storage, profileName, sectionValueKey, profileStorageKey, transform = (value) => value) {
  const legacyKey = profileStorageKey(profileName, `${sectionValueKey}:${LEGACY_TIMER_SECTION_KEY}`);
  const nextKey = profileStorageKey(profileName, `${sectionValueKey}:${TIMER_SECTION_KEY}`);
  const legacyValue = loadJson(legacyKey, null, storage);
  const hasLegacyValue = storage.getItem(legacyKey) !== null;

  if (!hasLegacyValue || storage.getItem(nextKey) !== null) return false;

  saveJson(nextKey, transform(legacyValue), storage);
  storage.removeItem(legacyKey);
  return true;
}

export function migrateLegacyPageMode(storage, profileName, key, profileStorageKey) {
  const storageKey = profileStorageKey(profileName, key);
  const storedValue = loadJson(storageKey, null, storage);
  const nextValue = renameValue(storedValue, [[LEGACY_TIMER_SECTION_KEY, TIMER_SECTION_KEY]]);

  if (nextValue === storedValue) return false;

  saveJson(storageKey, nextValue, storage);
  return true;
}

export function migrateLegacyTimerStorage(storage, profileName, profileStorageKey, StorageKeyBuilder) {
  const legacyKey = profileStorageKey(profileName, 'farmingTimers');
  const nextKey = profileStorageKey(profileName, StorageKeyBuilder.timers());
  const hasLegacyValue = storage.getItem(legacyKey) !== null;

  if (!hasLegacyValue || storage.getItem(nextKey) !== null) return false;

  const legacyValue = loadJson(legacyKey, {}, storage);
  saveJson(nextKey, legacyValue, storage);
  storage.removeItem(legacyKey);
  return true;
}

export function migrateLegacyOverviewPins(storage, profileName, profileStorageKey, StorageKeyBuilder) {
  const key = profileStorageKey(profileName, StorageKeyBuilder.overviewPins());
  const pins = loadJson(key, null, storage);
  const nextPins = renameObjectKeys(pins, [[`${LEGACY_TIMER_SECTION_KEY}::`, `${TIMER_SECTION_KEY}::`]]);

  if (!nextPins || JSON.stringify(nextPins) === JSON.stringify(pins)) return false;

  saveJson(key, nextPins, storage);
  return true;
}

export function migrateLegacyCollapsedBlocks(storage, profileName, profileStorageKey, StorageKeyBuilder) {
  const key = profileStorageKey(profileName, StorageKeyBuilder.collapsedBlocks());
  const collapsedBlocks = loadJson(key, null, storage);
  const nextBlocks = renameObjectKeys(collapsedBlocks, [[`group-collapse-${LEGACY_TIMER_SECTION_KEY}`, `group-collapse-${TIMER_SECTION_KEY}`]]);

  if (!nextBlocks || JSON.stringify(nextBlocks) === JSON.stringify(collapsedBlocks)) return false;

  saveJson(key, nextBlocks, storage);
  return true;
}
