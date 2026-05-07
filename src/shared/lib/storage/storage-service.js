import { 
  STORAGE_ROOT, 
  GLOBAL_PROFILES_KEY,
  createProfileKey, 
  createProfilePrefix 
} from './namespace.js';

/**
 * Storage Service
 * 
 * Single authoritative entry point for all app storage operations.
 * All features and modules MUST use this service.
 * Enables mocking, testing, and future migration to IndexedDB.
 */

let currentProfileName = 'default';
let currentProfilePrefix = createProfilePrefix('default');
let storageBackend = (typeof window !== 'undefined') ? window.localStorage : null;

// ============ Internal Helpers ============

function loadJsonInternal(key, fallback, storage) {
  if (!storage) return fallback;
  try {
    const raw = storage.getItem(key);
    return raw !== null ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveJsonInternal(key, value, storage) {
  if (!storage) return;
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Storage error for key ${key}:`, err);
  }
}

function removeKeyInternal(key, storage) {
  if (!storage) return;
  storage.removeItem(key);
}

// ============ Profile Management ============

export function initStorageService(initialProfileName = 'default', customStorage = null) {
  if (customStorage) {
    storageBackend = customStorage;
  }
  setActiveProfile(initialProfileName);
}

export function setActiveProfile(profileName) {
  currentProfileName = profileName || 'default';
  currentProfilePrefix = createProfilePrefix(currentProfileName);
}

export function getActiveProfile() {
  return currentProfileName;
}

export function getProfilePrefix() {
  return currentProfilePrefix;
}

export function buildProfileKey(key) {
  return createProfileKey(currentProfilePrefix, key);
}

// ============ Global Operations (Non-Profile) ============

export function loadGlobal(key, fallback = null) {
  return loadJsonInternal(key, fallback, storageBackend);
}

export function saveGlobal(key, value) {
  saveJsonInternal(key, value, storageBackend);
}

export function removeGlobal(key) {
  removeKeyInternal(key, storageBackend);
}

// ============ Profile-Scoped Operations ============

export function load(key, fallback = null) {
  return loadJsonInternal(buildProfileKey(key), fallback, storageBackend);
}

export function save(key, value) {
  saveJsonInternal(buildProfileKey(key), value, storageBackend);
}

export function removeKey(key) {
  removeKeyInternal(buildProfileKey(key), storageBackend);
}

// ============ Batch Operations ============

export function getAllProfilesGlobal() {
  return loadGlobal(GLOBAL_PROFILES_KEY, ['default']);
}

export function saveAllProfilesGlobal(profileList) {
  saveGlobal(GLOBAL_PROFILES_KEY, profileList);
}

export function clearProfileStorage(profileName) {
  const prefix = createProfilePrefix(profileName);
  if (!storageBackend) return;
  
  const keysToDelete = [];
  for (let i = 0; i < storageBackend.length; i++) {
    const key = storageBackend.key(i);
    if (key && key.startsWith(prefix)) {
      keysToDelete.push(key);
    }
  }
  keysToDelete.forEach((key) => storageBackend.removeItem(key));
}

// ============ Testing/Debug ============

export function getStorageBackend() {
  return storageBackend;
}

export function setStorageBackend(backend) {
  storageBackend = backend;
}
