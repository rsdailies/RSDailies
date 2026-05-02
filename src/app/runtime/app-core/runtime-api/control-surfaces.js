import { setupFeatureControls } from '../setup-controls.js';

export function createRuntimeControls({
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
  getCustomTasks,
  saveCustomTasks,
  documentRef = document,
  windowRef = window,
}) {
  const controls = setupFeatureControls({
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
  };
}
