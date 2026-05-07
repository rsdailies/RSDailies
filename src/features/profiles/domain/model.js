import { 
  loadGlobal, 
  saveGlobal, 
  setActiveProfile, 
  getActiveProfile, 
  getProfilePrefix as getProfilePrefixFromService, 
  getAllProfilesGlobal, 
  saveAllProfilesGlobal, 
  clearProfileStorage,
  initStorageService,
  getStorageBackend
} from '../../../shared/lib/storage/storage-service.js';
import { ACTIVE_PROFILE_KEY } from '../../../shared/lib/storage/namespace.js';
import { CURRENT_EXPORT_SCHEMA_VERSION, CURRENT_STORAGE_SCHEMA_VERSION, migrateStorageShape } from '../../../shared/lib/storage/migrations.js';

/**
 * Profile Model
 * 
 * Authoritative business logic for profiles, state management, 
 * and export/import token generation.
 * 
 * Replaces the legacy profiles/domain/store.js.
 */

// ============ State Management ============

export function getCurrentProfile() {
  return getActiveProfile();
}

export function getProfilePrefix() {
  return getProfilePrefixFromService();
}

export function setProfile(name) {
  const profileName = name || 'default';
  setActiveProfile(profileName);
  saveGlobal(ACTIVE_PROFILE_KEY, profileName);
}

export function initProfileContext() {
  const storedProfile = loadGlobal(ACTIVE_PROFILE_KEY, 'default');
  setActiveProfile(storedProfile);
  initStorageService(storedProfile);
}

export function loadProfiles() {
  const profiles = getAllProfilesGlobal();
  return Array.isArray(profiles) && profiles.length ? profiles : ['default'];
}

export function saveProfiles(profiles) {
  saveAllProfilesGlobal(profiles);
}

export function removeProfileStorage(profileName) {
  clearProfileStorage(profileName);
}

// ============ Logic Helpers ============

export function isActiveProfile(name, currentProfile = getActiveProfile()) {
  return name === currentProfile;
}

export function getProfileLabel(name, currentProfile = getActiveProfile()) {
  return isActiveProfile(name, currentProfile) ? `${name} (active)` : name;
}

// ============ Export/Import ============

export function buildExportToken() {
  const storage = getStorageBackend();
  if (!storage) return '';
  
  migrateStorageShape(storage);
  const profile = getActiveProfile();
  const profilePrefix = getProfilePrefix();

  const payload = {
    exportVersion: CURRENT_EXPORT_SCHEMA_VERSION,
    storageSchemaVersion: CURRENT_STORAGE_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    profile,
    globals: {
      profiles: loadProfiles(),
      activeProfile: profile
    },
    profileData: {}
  };

  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (key && key.startsWith(profilePrefix)) {
      payload.profileData[key] = storage.getItem(key);
    }
  }

  return btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
}

export function importProfileToken(rawToken) {
  const storage = getStorageBackend();
  if (!storage) return null;

  const decoded = decodeURIComponent(escape(atob(rawToken)));
  const data = JSON.parse(decoded);

  if (Array.isArray(data?.globals?.profiles)) {
    saveProfiles(data.globals.profiles);
  }

  if (data?.profileData && typeof data.profileData === 'object') {
    Object.entries(data.profileData).forEach(([key, value]) => {
      storage.setItem(key, value);
    });
  }

  migrateStorageShape(storage);

  if (data?.profile) setProfile(data.profile);
  return data;
}
