import { TRACKER_SECTIONS } from '../domain/static-content.ts';
import { getCustomTasks } from '../features/custom-tasks/custom-task-service.ts';
import { StorageKeyBuilder } from '../shared/storage/keys-builder.ts';
import { nextDailyBoundary, nextMonthlyBoundary, nextWeeklyBoundary } from '../shared/time/boundaries.ts';
import { clearSpecificTaskCompletions, getSectionTaskIds, type StorageDeps } from './reset-helpers.ts';

function getSectionIdsForFrequency(frequency: string) {
	return TRACKER_SECTIONS.filter((section) => section.resetFrequency === frequency).map((section) => section.id);
}

function clearFullSectionState(sectionKey: string, { save, removeKey }: StorageDeps) {
	save(StorageKeyBuilder.sectionCompletion(sectionKey), {});
	save(StorageKeyBuilder.sectionHiddenRows(sectionKey), {});
	save(StorageKeyBuilder.sectionRemovedRows(sectionKey), {});
	save(StorageKeyBuilder.sectionOrder(sectionKey), []);
	save(StorageKeyBuilder.sectionSort(sectionKey), 'default');
	save(StorageKeyBuilder.sectionShowHidden(sectionKey), false);
	save(StorageKeyBuilder.sectionHidden(sectionKey), false);
	removeKey?.(`notified:${sectionKey}`);
}

export function resetSectionView(sectionKey: string, deps: StorageDeps) {
	clearFullSectionState(sectionKey, deps);
	if (sectionKey === 'timers') {
		deps.save(StorageKeyBuilder.timers(), {});
	}
}

export function clearSectionCompletionsOnly(sectionKey: string, deps: StorageDeps) {
	deps.save(StorageKeyBuilder.sectionCompletion(sectionKey), {});
}

function clearGatheringCadence(cadence: 'daily' | 'weekly', deps: StorageDeps) {
	const section = TRACKER_SECTIONS.find((entry) => entry.id === 'gathering');
	if (!section) return false;

	const ids = (section.items || [])
		.filter((task) => String(task.reset || '').toLowerCase() === cadence)
		.map((task) => task.id);

	return clearSpecificTaskCompletions('gathering', ids, deps);
}

function clearCustomCadence(cadence: 'daily' | 'weekly' | 'monthly', deps: StorageDeps) {
	const ids = getCustomTasks()
		.filter((task) => String(task.reset || '').toLowerCase() === cadence)
		.map((task) => task.id);

	return clearSpecificTaskCompletions('custom', ids, deps);
}

export function checkAutoReset({ load, save, removeKey }: StorageDeps) {
	const now = Date.now();
	const lastVisit = load<number>(StorageKeyBuilder.lastVisit(), 0);

	if (lastVisit === 0) {
		save(StorageKeyBuilder.lastVisit(), now);
		return false;
	}

	let changed = false;
	const prevDaily = nextDailyBoundary(new Date(now - 86400000)).getTime();
	const prevWeekly = nextWeeklyBoundary(new Date(now - 7 * 86400000)).getTime();
	const prevMonthly = nextMonthlyBoundary(new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth() - 1, 1))).getTime();

	if (lastVisit < prevDaily) {
		for (const sectionKey of getSectionIdsForFrequency('daily')) {
			clearSpecificTaskCompletions(sectionKey, getSectionTaskIds(sectionKey), { load, save, removeKey });
		}
		clearGatheringCadence('daily', { load, save, removeKey });
		clearCustomCadence('daily', { load, save, removeKey });
		changed = true;
	}

	if (lastVisit < prevWeekly) {
		for (const sectionKey of getSectionIdsForFrequency('weekly')) {
			clearSpecificTaskCompletions(sectionKey, getSectionTaskIds(sectionKey), { load, save, removeKey });
		}
		clearGatheringCadence('weekly', { load, save, removeKey });
		clearCustomCadence('weekly', { load, save, removeKey });
		changed = true;
	}

	if (lastVisit < prevMonthly) {
		for (const sectionKey of getSectionIdsForFrequency('monthly')) {
			clearSpecificTaskCompletions(sectionKey, getSectionTaskIds(sectionKey), { load, save, removeKey });
		}
		clearCustomCadence('monthly', { load, save, removeKey });
		changed = true;
	}

	save(StorageKeyBuilder.lastVisit(), now);
	return changed;
}
