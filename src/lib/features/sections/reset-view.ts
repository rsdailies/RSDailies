import { StorageKeyBuilder } from '../../shared/storage/keys-builder.ts';
import { TIMER_SECTION_KEY } from '../timers/timer-runtime.ts';
import { getSectionTaskIds } from './reset-policy.ts';
import { cleanupSectionNotifications, clearCooldownsForTaskIds, clearSectionCompletionsOnly } from './reset-storage.ts';
import { writer } from './reset-internals.ts';
import { saveTimers } from './section-state-service.ts';
import type { LoadFn, RemoveFn, SaveFn } from './reset-internals.ts';

export function resetSectionView(
	sectionKey: string,
	{ load, save, removeKey }: { load?: LoadFn; save?: SaveFn; removeKey?: RemoveFn }
) {
	const write = writer(save);

	write(StorageKeyBuilder.sectionCompletion(sectionKey), {});
	write(StorageKeyBuilder.sectionHiddenRows(sectionKey), {});
	write(StorageKeyBuilder.sectionRemovedRows(sectionKey), {});
	write(StorageKeyBuilder.sectionOrder(sectionKey), []);
	write(StorageKeyBuilder.sectionSort(sectionKey), 'default');
	write(StorageKeyBuilder.sectionShowHidden(sectionKey), false);
	write(StorageKeyBuilder.sectionHidden(sectionKey), false);

	clearCooldownsForTaskIds(getSectionTaskIds(sectionKey, { load }), { load, save });
	cleanupSectionNotifications(sectionKey, { removeKey });

	if (sectionKey === TIMER_SECTION_KEY) {
		saveTimers({}, { save });
	}
	if (sectionKey === 'custom') {
		write('notified:custom', {});
	}
}

export { clearSectionCompletionsOnly };
