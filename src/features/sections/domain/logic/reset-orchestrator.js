import { saveTimers as saveTimersFeature } from '../state.js';
import { nextDailyBoundary as nextDailyBoundaryCore, nextWeeklyBoundary as nextWeeklyBoundaryCore, nextMonthlyBoundary as nextMonthlyBoundaryCore } from '../../../../core/time/boundaries.js';
import { maybeBrowserNotify, maybeWebhookNotify } from '../../../notifications/domain/bridge.js';
import {
  clearCompletionFor,
  clearGatheringCompletions,
  getSectionTaskIds,
  resetCustomCompletions,
  clearCooldownsForTaskIds
} from './reset-helpers.js';
import { cleanupTaskNotificationsForReset } from '../../../notifications/domain/bridge.js';
import { StorageKeyBuilder } from '../../../../core/storage/keys-builder.js';
import { getTrackerSections } from '../../../../core/domain/content/content-loader.js';
import { TIMER_SECTION_KEY } from '../../../timers/domain/timers.js';

/**
 * Reset Orchestrator
 * 
 * Manages the automatic and manual reset cycles for all tracker sections.
 * Standardized on the { load, save } dependency injection pattern.
 */

function getResettableSectionsForFrequency(frequency) {
  return getTrackerSections()
    .filter((section) => section.resetFrequency === frequency)
    .map((section) => section.id);
}

export function resetSectionView(sectionKey, { load, save, removeKey }) {
  save(StorageKeyBuilder.sectionCompletion(sectionKey), {});
  save(StorageKeyBuilder.sectionHiddenRows(sectionKey), {});
  save(StorageKeyBuilder.sectionRemovedRows(sectionKey), {});
  save(StorageKeyBuilder.sectionOrder(sectionKey), []);
  save(StorageKeyBuilder.sectionSort(sectionKey), 'default');
  save(StorageKeyBuilder.sectionShowHidden(sectionKey), false);
  save(StorageKeyBuilder.sectionHidden(sectionKey), false);
  
  clearCooldownsForTaskIds(getSectionTaskIds(sectionKey, { load }), { load, save });
  cleanupTaskNotificationsForReset(sectionKey, { removeKey });
  
  if (sectionKey === TIMER_SECTION_KEY) saveTimersFeature({}, { save });
  if (sectionKey === 'custom') save('notified:custom', {});
}

export function clearSectionCompletionsOnly(sectionKey, { load, save }) {
  // Surgical reset - ONLY clears completions (green highlights)
  save(StorageKeyBuilder.sectionCompletion(sectionKey), {});
}

export function checkAutoReset({ load, save, removeKey }) {
  const now = Date.now();
  const lastVisit = load(StorageKeyBuilder.lastVisit(), 0);

  // If this is the first visit (or lost timestamp), just initialize it and return.
  // This prevents over-aggressive resets on first load or new profiles.
  if (lastVisit === 0) {
    save(StorageKeyBuilder.lastVisit(), now);
    return false;
  }

  let changed = false;
  const prevDaily = nextDailyBoundaryCore(new Date(now - 86400000)).getTime();
  const prevWeekly = nextWeeklyBoundaryCore(new Date(now - 7 * 86400000)).getTime();
  const prevMonthly = nextMonthlyBoundaryCore(new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth() - 1, 1))).getTime();

  if (lastVisit < prevDaily) {
    getResettableSectionsForFrequency('daily').forEach((sectionKey) => clearCompletionFor(sectionKey, { load, save, removeKey }));
    clearGatheringCompletions('daily', { load, save, removeKey });
    getResettableSectionsForFrequency('rolling').forEach((sectionKey) => clearCompletionFor(sectionKey, { load, save, removeKey }));
    resetCustomCompletions('daily', { load, save, removeKey });
    maybeBrowserNotify('RSDailies', 'Daily reset happened.');
    maybeWebhookNotify('RSDailies: daily reset happened (UTC).');
    changed = true;
  }
  if (lastVisit < prevWeekly) {
    getResettableSectionsForFrequency('weekly').forEach((sectionKey) => clearCompletionFor(sectionKey, { load, save, removeKey }));
    clearGatheringCompletions('weekly', { load, save, removeKey });
    resetCustomCompletions('weekly', { load, save, removeKey });
    maybeBrowserNotify('RSDailies', 'Weekly reset happened.');
    maybeWebhookNotify('RSDailies: weekly reset happened (UTC).');
    changed = true;
  }
  if (lastVisit < prevMonthly) {
    getResettableSectionsForFrequency('monthly').forEach((sectionKey) => clearCompletionFor(sectionKey, { load, save, removeKey }));
    resetCustomCompletions('monthly', { load, save, removeKey });
    maybeBrowserNotify('RSDailies', 'Monthly reset happened.');
    maybeWebhookNotify('RSDailies: monthly reset happened (UTC).');
    changed = true;
  }

  save(StorageKeyBuilder.lastVisit(), now);
  return changed;
}
