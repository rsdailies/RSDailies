import { map } from 'nanostores';
import * as StorageService from '../lib/shared/storage/storage-service';

export const $taskState = map<Record<string, string>>({});

// Global initialization - only runs on the client
if (typeof window !== 'undefined') {
	// 1. Initialize storage with the active profile
	const activeProfile = StorageService.loadGlobal('rsdailies:active-profile', 'default');
	StorageService.initStorageService(activeProfile);

	// 2. Hydrate from pre-loaded state to kill the flicker
	const preloaded = (window as any).__DAILYSCAPE_STATE__ || {};
	$taskState.set(preloaded);
}

export function toggleTask(taskId: string) {
	const currentState = $taskState.get()[taskId];
	const newState = currentState === 'true' ? 'false' : 'true';
	
	// Update NanoStore (UI)
	$taskState.setKey(taskId, newState);
	
	// Update StorageService (Persistence)
	StorageService.save(taskId, newState);
}

export function setTaskState(taskId: string, state: string) {
	$taskState.setKey(taskId, state);
}
