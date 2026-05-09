import { StorageKeyBuilder } from '../../shared/storage/keys-builder.ts';
import * as StorageService from '../../shared/storage/storage-service.ts';
import { getSettings } from '../settings/settings-service.ts';
import { getTimerMinutes } from './timer-math.ts';
import { maybeBrowserNotify, maybeWebhookNotify } from '../../logic/notifications.ts';

export interface ActiveTimer {
	id: string;
	name: string;
	startedAt: number;
	readyAt: number;
	growthMinutes: number;
	timerCategory?: string;
	notifiedReady?: boolean;
}

export const TIMER_SECTION_KEY = 'timers';

function safeObject<T>(value: T, fallback: T): T {
	return value && typeof value === 'object' ? value : fallback;
}

export function getTimers() {
	return safeObject(StorageService.load<Record<string, ActiveTimer>>(StorageKeyBuilder.timers(), {}), {});
}

export function saveTimers(nextTimers: Record<string, ActiveTimer>) {
	StorageService.save(StorageKeyBuilder.timers(), nextTimers);
}

export function startTimer(timer: any) {
	if (!timer?.id) return false;

	const settings = getSettings();
	const minutes = getTimerMinutes(timer, settings);
	if (minutes < 1) return false;

	const startedAt = Date.now();
	const readyAt = startedAt + minutes * 60 * 1000;
	const nextTimers = {
		...getTimers(),
		[timer.id]: {
			id: timer.id,
			name: timer.name || timer.id,
			startedAt,
			readyAt,
			growthMinutes: minutes,
			timerCategory: timer.timerCategory || 'default',
			notifiedReady: false,
		},
	};

	saveTimers(nextTimers);
	return true;
}

export function clearTimer(timerId: string) {
	const nextTimers = { ...getTimers() };
	if (!nextTimers[timerId]) return false;
	delete nextTimers[timerId];
	saveTimers(nextTimers);
	return true;
}

export async function markReadyTimers() {
	const timers = { ...getTimers() };
	const settings = getSettings();
	const now = Date.now();
	let changed = false;

	for (const [timerId, timer] of Object.entries(timers)) {
		if (!timer) continue;

		if (timer.readyAt <= now && !timer.notifiedReady) {
			timer.notifiedReady = true;
			timers[timerId] = timer;
			changed = true;
			maybeBrowserNotify('RSDailies', `${timer.name} is ready.`, settings);
			await maybeWebhookNotify(timer.name, settings);
		}
	}

	if (changed) {
		saveTimers(timers);
	}

	return changed;
}
