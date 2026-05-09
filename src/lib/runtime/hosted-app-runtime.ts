import { buildExportToken, importProfileToken, initProfileContext } from './profile-model.ts';
import { setupProfileControl as setupProfileControlFeature, updateProfileHeader } from './profile-controller.ts';
import {
	applySettingsToDom as applySettingsToDomFeature,
	getSettings,
	setupSettingsControl as setupSettingsControlFeature,
} from './settings-controller.ts';
import {
	closeFloatingControls,
	getPageMode,
	setupViewsControl as setupViewsControlFeature,
	syncStoredViewModeToPageMode,
} from './view-controller.ts';
import {
	startTimer,
	clearTimer,
	cleanupReadyTimers as cleanupReadyTimersFeature,
	getTimerHeaderStatus,
} from '../features/timers/timer-runtime.ts';
import { startCooldown, cleanupReadyCooldowns as cleanupReadyCooldownsFeature } from '../features/cooldowns/cooldown-service.ts';
import { maybeNotifyTaskAlert } from '../features/notifications/notification-bridge.ts';
import { isPenguinSyncEnabled, syncPenguinWeeklyData } from '../features/penguins/penguin-sync.ts';
import {
	checkAutoReset as checkAutoResetFeature,
	clearSectionCompletionsOnly as clearSectionCompletionsOnlyFeature,
	resetSectionView,
} from '../features/sections/reset-service.ts';
import { hideTask, setTaskCompleted } from '../features/sections/task-actions.ts';
import {
	getSectionState,
	isCollapsedBlock,
	setCollapsedBlock,
	getCustomTasks,
	saveCustomTasks,
	getTimers,
	getCooldowns,
	getOverviewPins,
	saveSectionValue,
} from '../features/sections/section-state-service.ts';
import {
	load,
	save,
	remove as removeKey,
	initStorageService,
	setActiveProfile,
	getActiveProfile,
	loadGlobal,
	saveGlobal,
	removeGlobal,
	getAllProfilesGlobal,
	saveAllProfilesGlobal,
} from '../shared/storage/storage-service.ts';
import { hideTooltip } from '../ui/tooltip-engine.ts';
import {
	setupGlobalClickCloser as setupGlobalClickCloserHelper,
	closeAllFloatingControls,
} from '../ui/panel-controls.ts';
import { bindSectionControls } from '../features/sections/section-controls.ts';
import { setupImportExport as setupImportExportFeature } from '../features/import-export/import-export-controller.ts';
import { setupCustomAdd as setupCustomAddFeature } from '../features/custom-tasks/custom-task-controller.ts';
import { renderApp as renderAppCore } from './render-orchestrator.ts';
import { fetchProfits } from './fetch-profits.ts';
import { migrateStorageShape } from '../storage/migrations.ts';
import { createRuntimeMaintenance } from './hosted-maintenance.ts';
import { createRuntimeRenderApp } from './hosted-render-app.ts';
import { bindRuntimeSections } from './hosted-section-bindings.ts';
import { createRuntimeControls } from './hosted-control-surfaces.ts';

const getStorageDeps = () => ({ load, save, removeKey });

export {
	initProfileContext,
	syncStoredViewModeToPageMode,
	migrateStorageShape,
	initStorageService,
	setActiveProfile,
	getActiveProfile,
	loadGlobal,
	saveGlobal,
	removeGlobal,
	getAllProfilesGlobal,
	saveAllProfilesGlobal,
	closeFloatingControls,
};

const maintenance = createRuntimeMaintenance({
	applySettingsToDomFeature,
	getSettings,
	checkAutoResetFeature,
	getStorageDeps,
	documentRef: document,
});

export const applySettingsToDom = maintenance.applySettingsToDom;
export const checkAutoReset = maintenance.checkAutoReset;
export const updateCountdowns = maintenance.updateCountdowns;
export const cleanupReadyTimersHosted = () => cleanupReadyTimersFeature({ load, save });
export const cleanupReadyCooldownsHosted = () => cleanupReadyCooldownsFeature({ load, save });
export const clearSectionCompletionsOnlyHosted = (key: string, deps?: { save?: typeof save }) =>
	clearSectionCompletionsOnlyFeature(key, deps);
export const cleanupReadyTimers = cleanupReadyTimersHosted;
export const cleanupReadyCooldowns = cleanupReadyCooldownsHosted;
export const clearSectionCompletionsOnly = clearSectionCompletionsOnlyHosted;
export const clearSectionCompletionsOnlyRuntime = clearSectionCompletionsOnlyHosted;

const renderApp = createRuntimeRenderApp({
	renderAppCore,
	load,
	save,
	getSectionState,
	getCustomTasks,
	saveCustomTasks,
	getCooldowns,
	getTimers,
	cleanupReadyTimers: cleanupReadyTimersFeature,
	cleanupReadyCooldowns: cleanupReadyCooldownsFeature,
	hideTooltip,
	getTimerHeaderStatus,
	hideTask,
	setTaskCompleted,
	clearTimer,
	startTimer,
	startCooldown,
	isCollapsedBlock,
	setCollapsedBlock,
	fetchProfits,
	updateProfileHeader,
	maybeNotifyTaskAlert,
	bindSectionControls,
	saveSectionValue,
	resetSectionView,
	clearSectionCompletionsOnly: clearSectionCompletionsOnlyFeature,
	getPageMode,
	getOverviewPins,
	removeKey,
});

export { renderApp };

export function setupSectionBindings() {
	bindRuntimeSections({
		bindSectionControls,
		renderApp,
		getSectionState,
		saveSectionValue,
		resetSectionView,
		clearSectionCompletionsOnly: clearSectionCompletionsOnlyFeature,
		load,
		save,
		removeKey,
	});
}

const runtimeControls = createRuntimeControls({
	setupProfileControlFeature,
	setupSettingsControlFeature,
	setupViewsControlFeature,
	closeFloatingControls,
	setupGlobalClickCloserHelper,
	setupImportExportFeature,
	buildExportToken,
	importProfileToken,
	setupCustomAddFeature,
	renderApp,
	getCustomTasks: () => getCustomTasks({ load }),
	saveCustomTasks: (tasks: any[]) => saveCustomTasks(tasks, { save }),
	documentRef: document,
	windowRef: window,
});

export const setupProfileControl = runtimeControls.setupProfileControl;
export const setupSettingsControl = runtimeControls.setupSettingsControl;
export const setupViewsControl = runtimeControls.setupViewsControl;
export const setupGlobalClickCloser = runtimeControls.setupGlobalClickCloser;
export const setupImportExport = runtimeControls.setupImportExport;
export const setupCustomAdd = runtimeControls.setupCustomAdd;
export const setupNavigation = runtimeControls.setupNavigation;
export const setupProfileControlHosted = setupProfileControl;
export const setupSettingsControlHosted = setupSettingsControl;
export const setupViewsControlHosted = setupViewsControl;
export const setupGlobalClickCloserHosted = setupGlobalClickCloser;
export const setupImportExportHosted = setupImportExport;
export const setupCustomAddHosted = setupCustomAdd;
export const setupNavigationHosted = setupNavigation;
export const startPenguinSync = () => syncPenguinWeeklyData({ load, save, renderApp });
export const canStartPenguinSync = () => isPenguinSyncEnabled();
