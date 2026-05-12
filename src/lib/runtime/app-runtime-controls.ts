import { setupProfileControl as setupProfileControlFeature } from './profile-controller.ts';
import { setupSettingsControl as setupSettingsControlFeature } from './settings-controller.ts';
import { closeFloatingControls, setupViewsControl as setupViewsControlFeature } from '../features/navigation/index.ts';
import { setupGlobalClickCloser as setupGlobalClickCloserHelper } from '../ui/panel-controls.ts';
import { setupImportExport as setupImportExportFeature } from '../features/import-export/import-export-controller.ts';
import { setupCustomAdd as setupCustomAddFeature } from '../features/custom-tasks/custom-task-modal.ts';
import { createRuntimeControls } from './app-control-surfaces.ts';
import { buildExportToken, importProfileToken } from './app-runtime-base.ts';
import { getHostedCustomTasks, saveHostedCustomTasks } from './app-runtime-state.ts';

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
	getCustomTasks: getHostedCustomTasks,
	saveCustomTasks: saveHostedCustomTasks,
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
