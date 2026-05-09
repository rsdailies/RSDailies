import { maybeBrowserNotify, maybeWebhookNotify } from '../../logic/notifications.ts';
import { StorageKeyBuilder } from '../../shared/storage/keys-builder.ts';
import { nextDailyBoundary, nextMonthlyBoundary, nextWeeklyBoundary } from '../../shared/time/boundaries.ts';
import { getSettings } from '../settings/settings-service.ts';
import { reader, writer } from './reset-internals.ts';
import { clearCompletionFor } from './reset-storage.ts';
import { clearGatheringCompletions, getResettableSectionsForFrequency, resetCustomCompletions } from './reset-policy.ts';
import type { LoadFn, RemoveFn, SaveFn } from './reset-internals.ts';

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
