import { loadJson, saveJson } from './local-store.js';
import { ACTIVE_PROFILE_KEY, GLOBAL_PROFILES_KEY, createProfilePrefix } from './namespace.js';
import { StorageKeyBuilder } from './keys-builder.js';

export const CURRENT_STORAGE_SCHEMA_VERSION = 3;
export const CURRENT_EXPORT_SCHEMA_VERSION = 1;
import {
  renameValue,
  renameObjectKeys,
  migrateLegacySectionValue,
  migrateLegacyPageMode,
  migrateLegacyTimerStorage,
  migrateLegacyOverviewPins,
  migrateLegacyCollapsedBlocks
} from './migrations/schema-v3.js';

const LEGACY_TIMER_SECTION_KEY = 'rs3farming';
const TIMER_SECTION_KEY = 'timers';

function profileStorageKey(profileName, key) {
  return `${createProfilePrefix(profileName)}${key}`;
}

function getProfiles(storage) {
  const profiles = loadJson(GLOBAL_PROFILES_KEY, ['default'], storage);
  return Array.isArray(profiles) && profiles.length > 0 ? profiles : ['default'];
}

function ensureActiveProfile(profiles, storage) {
  const activeProfile = storage.getItem(ACTIVE_PROFILE_KEY) || 'default';
  if (profiles.includes(activeProfile)) {
    return activeProfile;
  }

  const fallbackProfile = profiles[0] || 'default';
  storage.setItem(ACTIVE_PROFILE_KEY, fallbackProfile);
  return fallbackProfile;
}

function migrateProfileStorage(profileName, storage) {
  const schemaVersionKey = profileStorageKey(profileName, StorageKeyBuilder.schemaVersion());
  const storedSchemaVersion = Number(loadJson(schemaVersionKey, 0, storage) || 0);
  let changed = false;

  if (storedSchemaVersion < 1) {
    const pageModeKey = profileStorageKey(profileName, 'pageMode');
    const viewModeKey = profileStorageKey(profileName, 'viewMode');
    const hasPageMode = storage.getItem(pageModeKey) !== null;
    const legacyViewMode = loadJson(viewModeKey, null, storage);

    if (!hasPageMode && typeof legacyViewMode === 'string' && legacyViewMode.trim() !== '') {
      saveJson(pageModeKey, legacyViewMode, storage);
      changed = true;
    }
  }

  if (storedSchemaVersion < 2) {
    const pageModeKey = profileStorageKey(profileName, 'pageMode');
    const rs3PageModeKey = profileStorageKey(profileName, 'pageMode:rs3');
    const existingRs3PageMode = storage.getItem(rs3PageModeKey);
    const storedPageMode = loadJson(pageModeKey, null, storage);
    const legacyViewMode = loadJson(profileStorageKey(profileName, 'viewMode'), null, storage);
    const nextRs3PageMode = typeof storedPageMode === 'string' && storedPageMode.trim() !== ''
      ? storedPageMode
      : typeof legacyViewMode === 'string' && legacyViewMode.trim() !== ''
        ? legacyViewMode
        : null;

    if (existingRs3PageMode === null && nextRs3PageMode) {
      saveJson(rs3PageModeKey, nextRs3PageMode, storage);
      changed = true;
    }
  }

  if (storedSchemaVersion < 3) {
    const timerChildPrefix = `${LEGACY_TIMER_SECTION_KEY}::`;
    const replacements = [[timerChildPrefix, `${TIMER_SECTION_KEY}::`]];

    changed = migrateLegacyPageMode(storage, profileName, 'pageMode', profileStorageKey) || changed;
    changed = migrateLegacyPageMode(storage, profileName, 'pageMode:rs3', profileStorageKey) || changed;
    changed = migrateLegacyTimerStorage(storage, profileName, profileStorageKey, StorageKeyBuilder) || changed;
    changed = migrateLegacyOverviewPins(storage, profileName, profileStorageKey, StorageKeyBuilder) || changed;
    changed = migrateLegacyCollapsedBlocks(storage, profileName, profileStorageKey, StorageKeyBuilder) || changed;

    ['completed', 'hiddenRows', 'removedRows'].forEach((key) => {
      changed = migrateLegacySectionValue(storage, profileName, key, profileStorageKey, (value) => renameObjectKeys(value, replacements)) || changed;
    });

    ['order'].forEach((key) => {
      changed = migrateLegacySectionValue(storage, profileName, key, profileStorageKey, (value) => (
        Array.isArray(value) ? value.map((entry) => renameValue(entry, replacements)) : value
      )) || changed;
    });

    ['hideSection', 'showHidden', 'sort'].forEach((key) => {
      changed = migrateLegacySectionValue(storage, profileName, key, profileStorageKey) || changed;
    });
  }

  if (storedSchemaVersion !== CURRENT_STORAGE_SCHEMA_VERSION) {
    saveJson(schemaVersionKey, CURRENT_STORAGE_SCHEMA_VERSION, storage);
    changed = true;
  }

  return changed;
}

export function migrateStorageShape(storage = window.localStorage) {
  const profiles = getProfiles(storage);
  let changed = false;

  if (storage.getItem(GLOBAL_PROFILES_KEY) === null) {
    saveJson(GLOBAL_PROFILES_KEY, profiles, storage);
    changed = true;
  }

  ensureActiveProfile(profiles, storage);

  profiles.forEach((profileName) => {
    if (migrateProfileStorage(profileName, storage)) {
      changed = true;
    }
  });

  return changed;
}
