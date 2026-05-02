import { nextDailyBoundary, nextWeeklyBoundary, nextMonthlyBoundary } from '../../../../core/time/boundaries.js';
import { formatDurationMs } from '../../../../core/time/formatters.js';
import { applySettingsToDomBridge, checkAutoResetBridge, updateCountdowns as updateCountdownsBridge } from '../core-actions.js';

export function createRuntimeMaintenance({
  applySettingsToDomFeature,
  getSettings,
  checkAutoResetFeature,
  getStorageDeps,
  documentRef = document,
}) {
  return {
    applySettingsToDom: () => applySettingsToDomBridge(applySettingsToDomFeature, getSettings, documentRef),
    checkAutoReset: () => checkAutoResetBridge(checkAutoResetFeature, getStorageDeps),
    updateCountdowns: () => updateCountdownsBridge(documentRef, {
      nextDailyBoundary,
      nextWeeklyBoundary,
      nextMonthlyBoundary,
      formatDurationMs,
    }),
  };
}
