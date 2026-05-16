import { formatDurationMs } from '@shared/time/formatters';
import { StorageKeyBuilder } from '@shared/storage/keys-builder';
import { getSettings } from '../settings/settings-service.ts';
import { getTimerMinutes } from './timer-math.ts';

type LoadFn = <T = any>(key: string, fallback?: T) => T;
type SaveFn = (key: string, value: any) => void;

export const TIMER_SECTION_KEY = 'timers';
export const LEGACY_TIMER_SECTION_KEY = 'rs3farming';

function getNow() {
	return Date.now();
}

function reader(load?: LoadFn) {
	return load || ((_: string, fallback: any) => fallback);
}

function writer(save?: SaveFn) {
	return save || (() => {});
}

export function isTimerSectionKey(sectionKey: string) {
	return sectionKey === TIMER_SECTION_KEY || sectionKey === LEGACY_TIMER_SECTION_KEY;
}

export function getTimerChildStorageId(taskId: string, childId: string) {
	return StorageKeyBuilder.childTaskStorageId(TIMER_SECTION_KEY, taskId, childId);
}

export function getTimers({ load }: { load?: LoadFn } = {}) {
	const value = reader(load)<Record<string, any>>(StorageKeyBuilder.timers(), {});
	return value && typeof value === 'object' ? value : {};
}

export function saveTimers(nextTimers: Record<string, any>, { save }: { save?: SaveFn } = {}) {
	writer(save)(StorageKeyBuilder.timers(), nextTimers);
}

function clearChildProgressForTimer(taskId: string, { load, save }: { load?: LoadFn; save?: SaveFn }) {
	if (!taskId) return false;

	const read = reader(load);
	const write = writer(save);
	const prefix = `${TIMER_SECTION_KEY}::${taskId}::`;
	const completed = { ...(read<Record<string, boolean>>(StorageKeyBuilder.sectionCompletion(TIMER_SECTION_KEY), {}) || {}) };
	const hiddenRows = { ...(read<Record<string, boolean>>(StorageKeyBuilder.sectionHiddenRows(TIMER_SECTION_KEY), {}) || {}) };

	let changed = false;
	Object.keys(completed).forEach((key) => {
		if (key.startsWith(prefix)) {
			delete completed[key];
			changed = true;
		}
	});

	Object.keys(hiddenRows).forEach((key) => {
		if (key.startsWith(prefix)) {
			delete hiddenRows[key];
			changed = true;
		}
	});

	if (changed) {
		write(StorageKeyBuilder.sectionCompletion(TIMER_SECTION_KEY), completed);
		write(StorageKeyBuilder.sectionHiddenRows(TIMER_SECTION_KEY), hiddenRows);
	}

	return changed;
}

export function startTimer(
	task: any,
	{ load, save, getSettingsValue = getSettings }: { load?: LoadFn; save?: SaveFn; getSettingsValue?: typeof getSettings } = {}
) {
	if (!task?.id) return false;

	const minutes = getTimerMinutes(task, getSettingsValue());
	if (!minutes || minutes < 1) return false;

	clearChildProgressForTimer(task.id, { load, save });

	const startedAt = getNow();
	const readyAt = startedAt + minutes * 60 * 1000;
	const timers = { ...getTimers({ load }) };
	timers[task.id] = {
		id: task.id,
		name: task.name || '',
		timerCategory: task.timerCategory || 'default',
		startedAt,
		readyAt,
		growthMinutes: minutes,
	};

	saveTimers(timers, { save });
	return true;
}

export function clearTimer(taskId: string, { load, save }: { load?: LoadFn; save?: SaveFn } = {}) {
	if (!taskId) return false;

	const timers = { ...getTimers({ load }) };
	const hadTimer = !!timers[taskId];

	if (hadTimer) {
		delete timers[taskId];
		saveTimers(timers, { save });
	}

	const clearedChildren = clearChildProgressForTimer(taskId, { load, save });
	return hadTimer || clearedChildren;
}

export function cleanupReadyTimers({ load, save }: { load?: LoadFn; save?: SaveFn } = {}) {
	const timers = { ...getTimers({ load }) };
	const now = getNow();
	let changed = false;

	Object.keys(timers).forEach((taskId) => {
		const entry = timers[taskId];

		if (!entry || !Number.isFinite(entry.readyAt)) {
			delete timers[taskId];
			clearChildProgressForTimer(taskId, { load, save });
			changed = true;
			return;
		}

		if (entry.readyAt <= now) {
			delete timers[taskId];
			clearChildProgressForTimer(taskId, { load, save });
			changed = true;
		}
	});

	if (changed) {
		saveTimers(timers, { save });
	}

	return changed;
}

export function getTimerHeaderStatus(task: any, { load }: { load?: LoadFn } = {}) {
	if (!task?.id) {
		return { state: 'idle', note: task?.note || '' };
	}

	const entry = getTimers({ load })[task.id];
	if (!entry) {
		return { state: 'idle', note: task?.note || '' };
	}

	const remaining = entry.readyAt - getNow();
	if (remaining <= 0) {
		return { state: 'ready', note: 'Ready now' };
	}

	return { state: 'running', note: `Ready in ${formatDurationMs(remaining)}` };
}
