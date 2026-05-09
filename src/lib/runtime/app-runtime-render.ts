import { GAMES, getSelectedGame } from './game-context.ts';
import { getTrackerSectionIds } from '../features/sections/section-registry.ts';
import { resolveTrackerSections } from '../features/sections/section-resolution.ts';
import { createRuntimeRenderApp } from './app-render-factory.ts';
import { bindRuntimeSections } from './app-section-bindings.ts';
import { renderApp as renderAppCore } from './render-orchestrator.ts';
import { fetchProfits } from './fetch-profits.ts';
import { updateProfileHeader } from './profile-controller.ts';
import { maybeNotifyTaskAlert } from '../features/notifications/notification-bridge.ts';
import { isPenguinSyncEnabled, syncPenguinWeeklyData } from '../features/penguins/penguin-sync.ts';
import { clearSectionCompletionsOnly as clearSectionCompletionsOnlyFeature, resetSectionView } from '../features/sections/reset-view.ts';
import { bindSectionControls } from '../features/sections/section-controls.ts';
import { hideTooltip } from '../ui/tooltip-engine.ts';
import {
	load,
	save,
	removeKey,
	getPageMode,
	getHostedSectionState,
	getHostedCustomTasks,
	saveHostedCustomTasks,
	getHostedCooldowns,
	getHostedTimers,
	getHostedOverviewPins,
	getTimerHeaderStatus,
	hideHostedTask,
	setHostedTaskCompleted,
	clearHostedTimer,
	startHostedTimer,
	startHostedCooldown,
	isHostedCollapsedBlock,
	setHostedCollapsedBlock,
	saveSectionValue,
} from './app-runtime-state.ts';
import { cleanupReadyTimersHosted, cleanupReadyCooldownsHosted } from './app-runtime-maintenance.ts';

export const renderApp = createRuntimeRenderApp({
	renderAppCore,
	load,
	save,
	getSectionState: getHostedSectionState,
	getCustomTasks: getHostedCustomTasks,
	saveCustomTasks: saveHostedCustomTasks,
	getCooldowns: getHostedCooldowns,
	getTimers: getHostedTimers,
	cleanupReadyTimers: cleanupReadyTimersHosted,
	cleanupReadyCooldowns: cleanupReadyCooldownsHosted,
	hideTooltip,
	getTimerHeaderStatus,
	hideTask: hideHostedTask,
	setTaskCompleted: setHostedTaskCompleted,
	clearTimer: clearHostedTimer,
	startTimer: startHostedTimer,
	startCooldown: startHostedCooldown,
	isCollapsedBlock: isHostedCollapsedBlock,
	setCollapsedBlock: setHostedCollapsedBlock,
	fetchProfits,
	updateProfileHeader,
	maybeNotifyTaskAlert,
	bindSectionControls,
	saveSectionValue,
	resetSectionView,
	clearSectionCompletionsOnly: clearSectionCompletionsOnlyFeature,
	getPageMode,
	getOverviewPins: getHostedOverviewPins,
	removeKey,
});

export function setupSectionBindings() {
	bindRuntimeSections({
		getTrackerSectionIds,
		bindSectionControls,
		renderApp,
		getSectionState: getHostedSectionState,
		saveSectionValue,
		resetSectionView,
		clearSectionCompletionsOnly: clearSectionCompletionsOnlyFeature,
		load,
		save,
		removeKey,
	});
}

export const startPenguinSync = () => syncPenguinWeeklyData({ load, save, renderApp });
export const canStartPenguinSync = () => isPenguinSyncEnabled();
