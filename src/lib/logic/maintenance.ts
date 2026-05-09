import { checkAutoReset } from './reset-orchestrator.ts';
import { markReadyTimers } from '../features/timers/timer-service.ts';
import * as StorageService from '../shared/storage/storage-service.ts';

let heartbeatInterval: ReturnType<typeof setInterval> | null = null;

export function startHeartbeat() {
	if (typeof window === 'undefined' || heartbeatInterval) return;

	heartbeatInterval = setInterval(async () => {
		const changed = checkAutoReset({
			load: StorageService.load,
			save: StorageService.save,
			removeKey: StorageService.remove,
		});

		await markReadyTimers();
		window.dispatchEvent(new CustomEvent('rsdailies:heartbeat'));

		if (changed) {
			window.dispatchEvent(new CustomEvent('rsdailies:reset'));
		}
	}, 1000);
}

export function stopHeartbeat() {
	if (!heartbeatInterval) return;
	clearInterval(heartbeatInterval);
	heartbeatInterval = null;
}
