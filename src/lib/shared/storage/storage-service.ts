import {
	ACTIVE_PROFILE_KEY,
	GLOBAL_PROFILES_KEY,
	STORAGE_EVENT_NAME,
	STORAGE_ROOT,
	STORAGE_SCHEMA_VERSION,
	createProfileKey,
	createProfilePrefix,
} from './namespace.ts';
import { StorageKeyBuilder } from './keys-builder.ts';

type StoragePayload = Storage | null;

let currentProfileName = 'default';
let currentProfilePrefix = createProfilePrefix('default');
let storageBackend: StoragePayload = typeof window !== 'undefined' ? window.localStorage : null;

function emitStorageChange(detail: Record<string, unknown>) {
	if (typeof window === 'undefined') {
		return;
	}

	window.dispatchEvent(
		new CustomEvent(STORAGE_EVENT_NAME, {
			detail: {
				profile: currentProfileName,
				...detail,
			},
		})
	);
}

function loadJsonInternal(key: string, fallback: any, storage: StoragePayload) {
	if (!storage) return fallback;

	try {
		const raw = storage.getItem(key);
		return raw !== null ? JSON.parse(raw) : fallback;
	} catch {
		return fallback;
	}
}

function saveJsonInternal(key: string, value: any, storage: StoragePayload) {
	if (!storage) return;

	storage.setItem(key, JSON.stringify(value));
}

function removeKeyInternal(key: string, storage: StoragePayload) {
	if (!storage) return;
	storage.removeItem(key);
}

function ensureProfilesGlobal(storage: StoragePayload) {
	const profiles = loadJsonInternal(GLOBAL_PROFILES_KEY, null, storage);
	if (!Array.isArray(profiles) || profiles.length === 0) {
		saveJsonInternal(GLOBAL_PROFILES_KEY, ['default'], storage);
	}
}

function ensureSchema(storage: StoragePayload) {
	const schemaVersion = loadJsonInternal(createProfileKey(createProfilePrefix(currentProfileName), StorageKeyBuilder.schemaVersion()), 0, storage);
	if (!schemaVersion) {
		save(StorageKeyBuilder.schemaVersion(), STORAGE_SCHEMA_VERSION);
	}
}

export function initStorageService(initialProfileName?: string, customStorage: StoragePayload = null) {
	if (customStorage) {
		storageBackend = customStorage;
	}

	ensureProfilesGlobal(storageBackend);
	const globalActive = getActiveProfileGlobal();
	setActiveProfile(initialProfileName || globalActive || 'default');
	ensureSchema(storageBackend);
}

export function setActiveProfile(profileName: string, persistGlobal = true) {
	currentProfileName = String(profileName || 'default').trim() || 'default';
	currentProfilePrefix = createProfilePrefix(currentProfileName);

	const profiles = new Set(getAllProfilesGlobal());
	profiles.add(currentProfileName);
	saveAllProfilesGlobal(Array.from(profiles));

	if (persistGlobal) {
		saveGlobal(ACTIVE_PROFILE_KEY, currentProfileName);
	}

	ensureSchema(storageBackend);
	emitStorageChange({ scope: 'profile', key: ACTIVE_PROFILE_KEY });
}

export function getActiveProfile() {
	return currentProfileName;
}

export function getActiveProfileGlobal() {
	return loadGlobal(ACTIVE_PROFILE_KEY, 'default');
}

export function getProfilePrefix() {
	return currentProfilePrefix;
}

export function getStorageBackend() {
	return storageBackend;
}

export function buildProfileKey(key: string) {
	return createProfileKey(currentProfilePrefix, key);
}

export function loadGlobal<T = any>(key: string, fallback: T = null as T) {
	return loadJsonInternal(key, fallback, storageBackend) as T;
}

export function saveGlobal(key: string, value: any) {
	saveJsonInternal(key, value, storageBackend);
	emitStorageChange({ scope: 'global', key });
}

export function removeGlobal(key: string) {
	removeKeyInternal(key, storageBackend);
	emitStorageChange({ scope: 'global', key });
}

export function load<T = any>(key: string, fallback: T = null as T) {
	return loadJsonInternal(buildProfileKey(key), fallback, storageBackend) as T;
}

export function save(key: string, value: any) {
	saveJsonInternal(buildProfileKey(key), value, storageBackend);
	emitStorageChange({ scope: 'profile', key });
}

export function remove(key: string) {
	removeKeyInternal(buildProfileKey(key), storageBackend);
	emitStorageChange({ scope: 'profile', key });
}

export function getAllProfilesGlobal(): string[] {
	const profiles = loadGlobal<string[]>(GLOBAL_PROFILES_KEY, ['default']);
	return Array.isArray(profiles) && profiles.length > 0 ? profiles : ['default'];
}

export function saveAllProfilesGlobal(profileList: string[]) {
	const unique = Array.from(new Set((Array.isArray(profileList) ? profileList : []).map((profile) => String(profile || '').trim()).filter(Boolean)));
	saveGlobal(GLOBAL_PROFILES_KEY, unique.length > 0 ? unique : ['default']);
}

export function deleteProfile(profileName: string) {
	if (!storageBackend) return;

	const target = String(profileName || '').trim();
	if (!target || target === 'default') return;

	const prefix = createProfilePrefix(target);
	const keysToDelete: string[] = [];

	for (let index = 0; index < storageBackend.length; index += 1) {
		const key = storageBackend.key(index);
		if (key && key.startsWith(prefix)) {
			keysToDelete.push(key);
		}
	}

	keysToDelete.forEach((key) => storageBackend?.removeItem(key));

	const remaining = getAllProfilesGlobal().filter((profile) => profile !== target);
	saveAllProfilesGlobal(remaining);

	if (getActiveProfileGlobal() === target) {
		setActiveProfile('default');
	} else {
		emitStorageChange({ scope: 'profile-list', key: GLOBAL_PROFILES_KEY });
	}
}

export function listCurrentProfileEntries() {
	if (!storageBackend) return {} as Record<string, any>;

	const payload: Record<string, any> = {};

	for (let index = 0; index < storageBackend.length; index += 1) {
		const key = storageBackend.key(index);
		if (key && key.startsWith(currentProfilePrefix)) {
			const localKey = key.slice(currentProfilePrefix.length);
			payload[localKey] = load(localKey, null);
		}
	}

	return payload;
}

export function buildExportToken() {
	if (!storageBackend) return '';

	const profile = getActiveProfile();
	const payload = {
		exportVersion: 1,
		storageSchemaVersion: STORAGE_SCHEMA_VERSION,
		exportedAt: new Date().toISOString(),
		profile,
		globals: {
			root: STORAGE_ROOT,
			profiles: getAllProfilesGlobal(),
			activeProfile: getActiveProfileGlobal(),
		},
		profileData: {} as Record<string, string | null>,
	};

	for (let index = 0; index < storageBackend.length; index += 1) {
		const key = storageBackend.key(index);
		if (key && key.startsWith(getProfilePrefix())) {
			payload.profileData[key] = storageBackend.getItem(key);
		}
	}

	return btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
}

export function importProfileToken(rawToken: string) {
	if (!storageBackend) return null;

	try {
		const decoded = decodeURIComponent(escape(atob(String(rawToken || '').trim())));
		const data = JSON.parse(decoded);

		if (!data?.profileData || typeof data.profileData !== 'object') {
			return null;
		}

		if (Array.isArray(data?.globals?.profiles)) {
			saveAllProfilesGlobal(data.globals.profiles);
		}

		Object.entries(data.profileData).forEach(([key, value]) => {
			if (typeof value === 'string' || value === null) {
				if (value === null) {
					storageBackend?.removeItem(key);
				} else {
					storageBackend?.setItem(key, value);
				}
			}
		});

		if (data?.profile) {
			setActiveProfile(data.profile);
		}

		emitStorageChange({ scope: 'import', key: 'token' });
		return data;
	} catch {
		return null;
	}
}
