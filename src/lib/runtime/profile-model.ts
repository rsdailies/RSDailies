import {
	buildExportToken as buildHostedExportToken,
	getActiveProfile,
	getAllProfilesGlobal,
	getProfilePrefix,
	getStorageBackend,
	importProfileToken as importHostedProfileToken,
	initStorageService,
	loadGlobal,
	saveAllProfilesGlobal,
	saveGlobal,
	setActiveProfile,
} from '../shared/storage/storage-service.ts';
import { ACTIVE_PROFILE_KEY, createProfilePrefix } from '../shared/storage/namespace.ts';

export function getCurrentProfile() {
	return getActiveProfile();
}

export { getProfilePrefix };

export function setProfile(name: string) {
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

export function saveProfiles(profiles: string[]) {
	saveAllProfilesGlobal(profiles);
}

export function removeProfileStorage(profileName: string) {
	const storage = getStorageBackend();
	if (!storage) return;

	const prefix = createProfilePrefix(profileName);
	const keysToDelete: string[] = [];

	for (let index = 0; index < storage.length; index += 1) {
		const key = storage.key(index);
		if (key && key.startsWith(prefix)) {
			keysToDelete.push(key);
		}
	}

	keysToDelete.forEach((key) => storage.removeItem(key));
}

export function isActiveProfile(name: string, currentProfile = getActiveProfile()) {
	return name === currentProfile;
}

export function getProfileLabel(name: string, currentProfile = getActiveProfile()) {
	return isActiveProfile(name, currentProfile) ? `${name} (active)` : name;
}

export function buildExportToken() {
	return buildHostedExportToken();
}

export function importProfileToken(rawToken: string) {
	return importHostedProfileToken(rawToken);
}
