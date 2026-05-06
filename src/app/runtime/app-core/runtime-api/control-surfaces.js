import { setupFeatureControls } from '../setup-controls.js';

export function createRuntimeControls({
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
  getCustomTasks,
  saveCustomTasks,
  documentRef = document,
  windowRef = window,
}) {
  const controls = setupFeatureControls({
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
    getCustomTasks,
    saveCustomTasks,
    documentRef,
    windowRef,
  });

  return {
    setupProfileControl: () => controls.setupProfile(),
    setupSettingsControl: () => controls.setupSettings(),
    setupViewsControl: () => controls.setupViews(),
    setupGlobalClickCloser: () => controls.setupCloser(),
    setupImportExport: () => controls.setupImportExport(),
    setupCustomAdd: () => controls.setupCustomAdd(),
    setupNavigation: () => controls.setupNavigation(),
  };
}
