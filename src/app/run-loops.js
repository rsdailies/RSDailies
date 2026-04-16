export function startAppLoops({
    updateCountdowns,
    checkAutoReset,
    cleanupReadyFarmingTimers,
    cleanupReadyCooldowns,
    renderApp,
    intervalRef = window.setInterval,
  }) {
    const countdownLoopId = intervalRef(updateCountdowns, 1000);
  
    const maintenanceLoopId = intervalRef(() => {
      const resetChanged = checkAutoReset();
      const farmingChanged = cleanupReadyFarmingTimers();
      const cooldownChanged = cleanupReadyCooldowns();
  
      if (resetChanged || farmingChanged || cooldownChanged) {
        renderApp();
      }
    }, 1000);
  
    return {
      countdownLoopId,
      maintenanceLoopId,
    };
  }