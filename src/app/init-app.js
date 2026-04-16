export function initApp({
    documentRef = document,
    initProfileContext,
    migrateLegacyViewModeToPageMode,
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
    renderApp,
  }) {
    documentRef.addEventListener('DOMContentLoaded', () => {
      initProfileContext();
      migrateLegacyViewModeToPageMode();
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
  
      renderApp();
    });
  }