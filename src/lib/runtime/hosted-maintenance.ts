import { nextDailyBoundary, nextWeeklyBoundary, nextMonthlyBoundary } from '../shared/time/boundaries.ts';
import { formatDurationMs } from '../shared/time/formatters.ts';
import { applySettingsToDomBridge, checkAutoResetBridge, updateCountdowns as updateCountdownsBridge } from './core-actions.ts';

export function createRuntimeMaintenance({
	applySettingsToDomFeature,
	getSettings,
	checkAutoResetFeature,
	getStorageDeps,
	documentRef = document,
}: any) {
	return {
		applySettingsToDom: () => applySettingsToDomBridge(applySettingsToDomFeature, getSettings, documentRef),
		checkAutoReset: () => checkAutoResetBridge(checkAutoResetFeature, getStorageDeps),
		updateCountdowns: () =>
			updateCountdownsBridge(documentRef, {
				nextDailyBoundary,
				nextWeeklyBoundary,
				nextMonthlyBoundary,
				formatDurationMs,
			}),
	};
}
