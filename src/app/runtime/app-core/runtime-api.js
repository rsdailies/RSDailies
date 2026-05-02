import { initProfileContext, setupProfileControl as setupProfileControlFeature, updateProfileHeader } from '../../../features/profiles/domain/controller.js';
import { getSettings, applySettingsToDom as applySettingsToDomFeature, setupSettingsControl as setupSettingsControlFeature } from '../../../features/settings/domain/controller.js';
import { closeFloatingControls, setupViewsControl as setupViewsControlFeature } from '../../../features/views/domain/controller.js';
import { getPageMode, syncStoredViewModeToPageMode } from '../../../features/views/domain/model.js';
import { startTimer, clearTimer, cleanupReadyTimers as cleanupReadyTimersFeature, getTimerHeaderStatus } from '../../../features/timers/domain/timers.js';
import { startCooldown, cleanupReadyCooldowns as cleanupReadyCooldownsFeature } from '../../../features/cooldowns/domain/timers.js';
import { maybeNotifyTaskAlert, maybeBrowserNotify, maybeWebhookNotify } from '../../../features/notifications/domain/bridge.js';
import { syncPenguinWeeklyData } from '../../../features/penguins/index.js';
import { checkAutoReset as checkAutoResetFeature, hideTask, resetSectionView, setTaskCompleted } from '../../../features/sections/domain/logic.js';
import { bindSectionControls } from '../../../ui/components/tracker/sections/controls/section-controls-bindings.js';
import { setupImportExport as setupImportExportFeature } from '../../../ui/components/import-export/index.js';
import { setupCustomAdd as setupCustomAddFeature } from '../../../ui/components/custom-tasks/modal/custom-task-controller.js';
import { hideTooltip } from '../../../ui/primitives/tooltips/tooltip-engine.js';
import { load, save, removeKey, saveSectionValue, getSectionState, isCollapsedBlock, setCollapsedBlock, getCustomTasks, saveCustomTasks, getTimers, getCooldowns, getOverviewPins } from '../storage-bridge.js';
import { setupProfileControl as setupProfileControlBridge, setupSettingsControl as setupSettingsControlBridge, setupViewsControl as setupViewsControlBridge, closeFloatingControls as closeFloatingControlsBridge, setupGlobalClickCloser as setupGlobalClickCloserBridge, updateProfileHeader as updateProfileHeaderBridge } from '../floating-controls.js';
import { renderApp as renderAppCore } from '../render-orchestrator.js';
import { fetchProfits } from './fetch-profits.js';
import { migrateStorageShape } from '../../../core/storage/migrations.js';
import { buildExportToken, importProfileToken } from '../../../features/profiles/domain/model.js';
import { createRuntimeMaintenance } from './runtime-api/maintenance.js';
import { createRuntimeRenderApp } from './runtime-api/render-app.js';
import { bindRuntimeSections } from './runtime-api/section-bindings.js';
import { createRuntimeControls } from './runtime-api/control-surfaces.js';

const getStorageDeps = () => ({ load, save, removeKey });

export { initProfileContext, syncStoredViewModeToPageMode, migrateStorageShape };

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
export const cleanupReadyTimers = () => cleanupReadyTimersFeature({ load, save });
export const cleanupReadyCooldowns = () => cleanupReadyCooldownsFeature({ load, save });

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
  updateProfileHeaderBridge,
  updateProfileHeaderFeature: updateProfileHeader,
  maybeNotifyTaskAlert: (task, sectionKey, deps) => maybeNotifyTaskAlert(task, sectionKey, { ...deps, maybeBrowserNotify, maybeWebhookNotify }),
  bindSectionControls,
  saveSectionValue,
  resetSectionView,
  getPageMode,
  getOverviewPins,
});

export { renderApp };

export function setupSectionBindings() {
  bindRuntimeSections({
    bindSectionControls,
    renderApp,
    getSectionState,
    saveSectionValue,
    resetSectionView,
    load,
    save,
    removeKey,
  });
}

const runtimeControls = createRuntimeControls({
  setupProfileControlBridge,
  setupProfileControlFeature,
  setupSettingsControlBridge,
  setupSettingsControlFeature,
  setupViewsControlBridge,
  setupViewsControlFeature,
  closeFloatingControlsBridge,
  closeFloatingControls,
  setupGlobalClickCloserBridge,
  setupImportExportFeature,
  buildExportToken,
  importProfileToken,
  setupCustomAddFeature,
  renderApp,
  getCustomTasks: () => getCustomTasks(load),
  saveCustomTasks: (tasks) => saveCustomTasks(tasks, save),
  documentRef: document,
  windowRef: window,
});

export const setupProfileControl = runtimeControls.setupProfileControl;
export const setupSettingsControl = runtimeControls.setupSettingsControl;
export const setupViewsControl = runtimeControls.setupViewsControl;
export const setupGlobalClickCloser = runtimeControls.setupGlobalClickCloser;
export const setupImportExport = runtimeControls.setupImportExport;
export const setupCustomAdd = runtimeControls.setupCustomAdd;
export const startPenguinSync = () => syncPenguinWeeklyData({ load, save, renderApp });
