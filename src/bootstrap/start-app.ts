import {
	applySettingsToDom,
	checkAutoReset,
	cleanupReadyCooldowns,
	canStartPenguinSync,
	cleanupReadyTimers,
	initProfileContext,
	migrateStorageShape,
	// renderApp,
	setupCustomAdd,
	setupGlobalClickCloser,
	setupImportExport,
	setupNavigation,
	setupProfileControl,
	setupSectionBindings,
	setupSettingsControl,
	setupViewsControl,
	startPenguinSync,
	syncStoredViewModeToPageMode,
	updateCountdowns,
} from '../lib/runtime/app-runtime.ts';
import { tracker } from '../stores/tracker.svelte';

declare global {
	interface Window {
		__rsdailiesHostedAppStarted?: boolean;
		__rsdailiesHostedAppLoops?: number[];
	}
}

function clearExistingLoops() {
	if (!Array.isArray(window.__rsdailiesHostedAppLoops)) {
		return;
	}

	for (const loopId of window.__rsdailiesHostedAppLoops) {
		window.clearInterval(loopId);
	}

	window.__rsdailiesHostedAppLoops = [];
}

function startHostedLoops() {
	clearExistingLoops();

	const countdownLoopId = window.setInterval(() => {
		updateCountdowns();
	}, 1000);

	const maintenanceLoopId = window.setInterval(() => {
		const resetChanged = checkAutoReset();
		const timerChanged = cleanupReadyTimers();
		const cooldownChanged = cleanupReadyCooldowns();

		if (resetChanged || timerChanged || cooldownChanged) {
			// renderApp();
			tracker.reloadAll();
		}
	}, 1000);

	const loopIds = [countdownLoopId, maintenanceLoopId];

	if (canStartPenguinSync()) {
		const penguinLoopId = window.setInterval(() => {
			startPenguinSync?.();
		}, 15 * 60 * 1000);

		loopIds.push(penguinLoopId);
	}

	window.__rsdailiesHostedAppLoops = loopIds;
}

function runHostedStartup() {
	migrateStorageShape();
	initProfileContext();
	syncStoredViewModeToPageMode();
	applySettingsToDom();
	checkAutoReset();
	updateCountdowns();

	startHostedLoops();

	setupSectionBindings();
	setupProfileControl();
	setupSettingsControl();
	setupViewsControl();
	setupGlobalClickCloser();
	setupImportExport();
	setupCustomAdd();
	setupNavigation();

	// renderApp();
	if (canStartPenguinSync()) {
		startPenguinSync?.();
	}
}

export function startHostedApp() {
	if (window.__rsdailiesHostedAppStarted) {
		return;
	}

	window.__rsdailiesHostedAppStarted = true;

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', runHostedStartup, { once: true });
		return;
	}

	runHostedStartup();
}
