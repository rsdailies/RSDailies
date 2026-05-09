export const STORAGE_ROOT = 'rsdailies';
export const STORAGE_SCHEMA_VERSION = 1;
export const GLOBAL_PROFILES_KEY = `${STORAGE_ROOT}:profiles`;
export const ACTIVE_PROFILE_KEY = `${STORAGE_ROOT}:active-profile`;
export const STORAGE_EVENT_NAME = `${STORAGE_ROOT}:storage-change`;

export function createProfilePrefix(profileName: string = 'default') {
  return `${STORAGE_ROOT}:${profileName || 'default'}:`;
}

export function createProfileKey(profilePrefix: string, key: string) {
  return `${profilePrefix}${key}`;
}
