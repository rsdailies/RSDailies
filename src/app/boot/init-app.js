export function initApp({
  documentRef = document,
  migrateStorageShape = () => {},
  initProfileContext,
  syncStoredViewModeToPageMode,
  applySettingsToDom,
  checkAutoReset,
  updateCountdowns,
  startRunLoops,
  setupSectionBindings,
  setupProfileControl,
  setupSettingsControl,
  setupViewsControl,
  setupGlobalClickCloser,
  setupImportExport,
  setupCustomAdd,
  setupNavigation,
  startPenguinSync,
  renderApp,
}) {
  const run = () => {
    migrateStorageShape();
    initProfileContext();
    syncStoredViewModeToPageMode();
    applySettingsToDom();
    checkAutoReset();
    updateCountdowns();

    startRunLoops();

    setupSectionBindings();
    setupProfileControl();
    setupSettingsControl();
    setupViewsControl();
    setupGlobalClickCloser();
    setupImportExport();
    setupCustomAdd();
    setupNavigation();

    renderApp();
    startPenguinSync?.();
  };

  if (documentRef.readyState === 'loading') {
    documentRef.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
}
