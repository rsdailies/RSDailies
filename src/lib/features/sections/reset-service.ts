import { maybeBrowserNotify, maybeWebhookNotify } from '../../logic/notifications.ts';
import { StorageKeyBuilder } from '../../shared/storage/keys-builder.ts';
import { nextDailyBoundary, nextMonthlyBoundary, nextWeeklyBoundary } from '../../shared/time/boundaries.ts';
import { TRACKER_SECTIONS } from '../../domain/static-content.ts';
import { getContentSectionTaskIds, getContentSectionTaskIdsByCadence } from '../../domain/legacy-mode-content.ts';
import { getSettings } from '../settings/settings-service.ts';
import { getCustomTasks } from './section-state-service.ts';
import { TIMER_SECTION_KEY } from '../timers/timer-runtime.ts';
import { saveTimers } from './section-state-service.ts';

type LoadFn = <T = any>(key: string, fallback?: T) => T;
type SaveFn = (key: string, value: any) => void;
type RemoveFn = (key: string) => void;

function reader(load?: LoadFn) {
	return load || ((_: string, fallback: any) => fallback);
}

function writer(save?: SaveFn) {
	return save || (() => {});
}

function cleanupTaskNotificationsForReset(sectionKey: string, { removeKey }: { removeKey?: RemoveFn }) {
	removeKey?.(`notified:${sectionKey}`);
}

function getResettableSectionsForFrequency(frequency: string) {
	return TRACKER_SECTIONS.filter((section) => section.resetFrequency === frequency).map((section) => section.id);
}

export function clearCooldownsForTaskIds(taskIds: string[], { load, save }: { load?: LoadFn; save?: SaveFn }) {
	const ids = new Set((Array.isArray(taskIds) ? taskIds : []).filter(Boolean));
	if (ids.size === 0) return false;

	const read = reader(load);
	const write = writer(save);
	const cooldowns = { ...(read<Record<string, any>>(StorageKeyBuilder.cooldowns(), {}) || {}) };
	let changed = false;

	ids.forEach((taskId) => {
		if (cooldowns[taskId]) {
			delete cooldowns[taskId];
			changed = true;
		}
	});

	if (changed) {
		write(StorageKeyBuilder.cooldowns(), cooldowns);
	}

	return changed;
}

export function clearSpecificTaskCompletions(
	sectionKey: string,
	taskIds: string[],
	{ load, save, removeKey }: { load?: LoadFn; save?: SaveFn; removeKey?: RemoveFn }
) {
	const ids = new Set((Array.isArray(taskIds) ? taskIds : []).filter(Boolean));
	if (ids.size === 0) return false;

	const read = reader(load);
	const write = writer(save);
	const completed = { ...(read<Record<string, boolean>>(StorageKeyBuilder.sectionCompletion(sectionKey), {}) || {}) };
	const hiddenRows = { ...(read<Record<string, boolean>>(StorageKeyBuilder.sectionHiddenRows(sectionKey), {}) || {}) };
	const removedRows = { ...(read<Record<string, boolean>>(StorageKeyBuilder.sectionRemovedRows(sectionKey), {}) || {}) };
	let changed = false;

	ids.forEach((taskId) => {
		if (completed[taskId]) {
			delete completed[taskId];
			changed = true;
		}
		if (hiddenRows[taskId]) {
			delete hiddenRows[taskId];
			changed = true;
		}
		if (removedRows[taskId]) {
			delete removedRows[taskId];
			changed = true;
		}
	});

	clearCooldownsForTaskIds([...ids], { load, save });

	if (changed) {
		write(StorageKeyBuilder.sectionCompletion(sectionKey), completed);
		write(StorageKeyBuilder.sectionHiddenRows(sectionKey), hiddenRows);
		write(StorageKeyBuilder.sectionRemovedRows(sectionKey), removedRows);
		cleanupTaskNotificationsForReset(sectionKey, { removeKey });
	}

	return changed;
}

export function clearGatheringCompletions(kind: string, deps: { load?: LoadFn; save?: SaveFn; removeKey?: RemoveFn }) {
	const ids = getContentSectionTaskIdsByCadence('gathering', kind);
	return clearSpecificTaskCompletions('gathering', ids, deps);
}

export function clearCompletionFor(sectionKey: string, { load, save, removeKey }: { load?: LoadFn; save?: SaveFn; removeKey?: RemoveFn }) {
	const read = reader(load);
	const write = writer(save);
	const completed = { ...(read<Record<string, boolean>>(StorageKeyBuilder.sectionCompletion(sectionKey), {}) || {}) };
	const hiddenRows = { ...(read<Record<string, boolean>>(StorageKeyBuilder.sectionHiddenRows(sectionKey), {}) || {}) };
	const removedRows = { ...(read<Record<string, boolean>>(StorageKeyBuilder.sectionRemovedRows(sectionKey), {}) || {}) };
	const completedIds = Object.keys(completed);
	const hiddenIds = Object.keys(hiddenRows);
	const removedIds = Object.keys(removedRows);
	let changed = false;

	if (completedIds.length > 0) {
		write(StorageKeyBuilder.sectionCompletion(sectionKey), {});
		changed = true;
	}
	if (hiddenIds.length > 0) {
		write(StorageKeyBuilder.sectionHiddenRows(sectionKey), {});
		changed = true;
	}
	if (removedIds.length > 0) {
		write(StorageKeyBuilder.sectionRemovedRows(sectionKey), {});
		changed = true;
	}

	clearCooldownsForTaskIds([...new Set([...completedIds, ...hiddenIds, ...removedIds])], { load, save });

	if (changed) {
		cleanupTaskNotificationsForReset(sectionKey, { removeKey });
	}
}

export function resetCustomCompletions(kind: string, { load, save, removeKey }: { load?: LoadFn; save?: SaveFn; removeKey?: RemoveFn }) {
	const tasks = getCustomTasks({ load });
	const ids = tasks.filter((task) => String(task?.reset || 'daily').toLowerCase() === kind).map((task) => task.id);
	return clearSpecificTaskCompletions('custom', ids, { load, save, removeKey });
}

export function getSectionTaskIds(sectionKey: string, { load }: { load?: LoadFn } = {}) {
	return getContentSectionTaskIds(sectionKey, {
		customTasks: sectionKey === 'custom' ? getCustomTasks({ load }) : [],
	});
}

export function resetSectionView(sectionKey: string, { load, save, removeKey }: { load?: LoadFn; save?: SaveFn; removeKey?: RemoveFn }) {
	const write = writer(save);

	write(StorageKeyBuilder.sectionCompletion(sectionKey), {});
	write(StorageKeyBuilder.sectionHiddenRows(sectionKey), {});
	write(StorageKeyBuilder.sectionRemovedRows(sectionKey), {});
	write(StorageKeyBuilder.sectionOrder(sectionKey), []);
	write(StorageKeyBuilder.sectionSort(sectionKey), 'default');
	write(StorageKeyBuilder.sectionShowHidden(sectionKey), false);
	write(StorageKeyBuilder.sectionHidden(sectionKey), false);

	clearCooldownsForTaskIds(getSectionTaskIds(sectionKey, { load }), { load, save });
	cleanupTaskNotificationsForReset(sectionKey, { removeKey });

	if (sectionKey === TIMER_SECTION_KEY) {
		saveTimers({}, { save });
	}
	if (sectionKey === 'custom') {
		write('notified:custom', {});
	}
}

export function clearSectionCompletionsOnly(sectionKey: string, { save }: { save?: SaveFn }) {
	writer(save)(StorageKeyBuilder.sectionCompletion(sectionKey), {});
}

export function checkAutoReset({ load, save, removeKey }: { load?: LoadFn; save?: SaveFn; removeKey?: RemoveFn }) {
	const read = reader(load);
	const write = writer(save);
	const now = Date.now();
	const lastVisit = read<number>(StorageKeyBuilder.lastVisit(), 0);

	if (lastVisit === 0) {
		write(StorageKeyBuilder.lastVisit(), now);
		return false;
	}

	let changed = false;
	const settings = getSettings();
	const prevDaily = nextDailyBoundary(new Date(now - 86400000)).getTime();
	const prevWeekly = nextWeeklyBoundary(new Date(now - 7 * 86400000)).getTime();
	const prevMonthly = nextMonthlyBoundary(new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth() - 1, 1))).getTime();

	if (lastVisit < prevDaily) {
		getResettableSectionsForFrequency('daily').forEach((sectionKey) => clearCompletionFor(sectionKey, { load, save, removeKey }));
		clearGatheringCompletions('daily', { load, save, removeKey });
		getResettableSectionsForFrequency('rolling').forEach((sectionKey) => clearCompletionFor(sectionKey, { load, save, removeKey }));
		resetCustomCompletions('daily', { load, save, removeKey });
		maybeBrowserNotify('RSDailies', 'Daily reset happened.', settings);
		void maybeWebhookNotify('RSDailies: daily reset happened (UTC).', settings);
		changed = true;
	}

	if (lastVisit < prevWeekly) {
		getResettableSectionsForFrequency('weekly').forEach((sectionKey) => clearCompletionFor(sectionKey, { load, save, removeKey }));
		clearGatheringCompletions('weekly', { load, save, removeKey });
		resetCustomCompletions('weekly', { load, save, removeKey });
		maybeBrowserNotify('RSDailies', 'Weekly reset happened.', settings);
		void maybeWebhookNotify('RSDailies: weekly reset happened (UTC).', settings);
		changed = true;
	}

	if (lastVisit < prevMonthly) {
		getResettableSectionsForFrequency('monthly').forEach((sectionKey) => clearCompletionFor(sectionKey, { load, save, removeKey }));
		resetCustomCompletions('monthly', { load, save, removeKey });
		maybeBrowserNotify('RSDailies', 'Monthly reset happened.', settings);
		void maybeWebhookNotify('RSDailies: monthly reset happened (UTC).', settings);
		changed = true;
	}

	write(StorageKeyBuilder.lastVisit(), now);
	return changed;
}
