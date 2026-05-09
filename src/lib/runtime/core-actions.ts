import { getTrackerSections } from '../features/sections/section-registry.ts';

export function formatBoundaryCountdown(targetMs: number, formatDurationMs: (diff: number) => string) {
	const diff = targetMs - Date.now();
	if (diff <= 0) return '00:00:00';
	return formatDurationMs(diff);
}

export function applySettingsToDomBridge(
	applySettingsToDomFeature: (documentRef?: Document, settings?: any) => void,
	getSettings: () => any,
	documentRef = document
) {
	applySettingsToDomFeature(documentRef, getSettings());
}

export function checkAutoResetBridge(checkAutoResetFeature: (deps: any) => boolean, getStorageDeps: () => any) {
	return checkAutoResetFeature(getStorageDeps());
}

export function updateCountdowns(
	documentRef: Document,
	{
		nextDailyBoundary,
		nextWeeklyBoundary,
		nextMonthlyBoundary,
		formatDurationMs,
	}: {
		nextDailyBoundary: (date?: Date) => Date;
		nextWeeklyBoundary: (date?: Date) => Date;
		nextMonthlyBoundary: (date?: Date) => Date;
		formatDurationMs: (diff: number) => string;
	}
) {
	const boundaryResolvers = {
		daily: nextDailyBoundary,
		weekly: nextWeeklyBoundary,
		monthly: nextMonthlyBoundary,
	};

	getTrackerSections().forEach((section) => {
		const countdownId = section.shell?.countdownId;
		const boundaryResolver = boundaryResolvers[section.resetFrequency as keyof typeof boundaryResolvers];

		if (!countdownId || !boundaryResolver) {
			return;
		}

		const value = formatBoundaryCountdown(boundaryResolver(new Date()).getTime(), formatDurationMs);
		const el = documentRef.getElementById(countdownId);
		if (el) el.textContent = value;
	});
}
