import { getSettings } from '../../../features/settings/domain/state.js';
import { TIMER_SECTION_KEY } from '../../../features/timers/domain/timers.js';
import { determineTaskState } from '../../../shared/state/task-state-machine.js';

/**
 * Render App Runner
 * 
 * Injects dependencies and business logic into the core render orchestrator.
 * Standardized on the { load, save } dependency injection pattern and 
 * delegates state logic to the Task State Machine.
 */

export function createRenderAppRunner(renderAppCore, deps) {
  const {
    load, save, getSectionState, getCustomTasks, saveCustomTasks, getCooldowns, getTimers,
    getResolvedSections, getTimerHeaderStatus, hideTask, setTaskCompleted, clearTimer,
    startTimer, startCooldown, isCollapsedBlock, setCollapsedBlock, fetchProfits,
    updateProfileHeaderBridge, updateProfileHeaderFeature, maybeNotifyTaskAlert, bindSectionControls,
    resetSectionView, getPageMode, getOverviewPins
  } = deps;

  function renderApp() {
    renderAppCore({
      load,
      save,
      getSectionState: (sectionKey) => getSectionState(sectionKey),
      getCustomTasks,
      saveCustomTasks,
      cleanupReadyTimers: deps.cleanupReadyTimers,
      cleanupReadyCooldowns: deps.cleanupReadyCooldowns,
      hideTooltip: deps.hideTooltip,
      getTaskState: (sectionKey, taskId, task) => {
        const section = getSectionState(sectionKey, { load });

        return determineTaskState(taskId, task, {
          sectionKey,
          hiddenRows: section.hiddenRows || {},
          completed: section.completed || {},
          cooldowns: getCooldowns(),
          timers: getTimers(),
          settings: getSettings({ load }),
          timerSectionKey: TIMER_SECTION_KEY,
          now: Date.now()
        });
      },
      getResolvedSections,
      getTimerHeaderStatus,
      hideTask,
      setTaskCompleted,
      clearTimer,
      startTimer,
      startCooldown,
      isCollapsedBlock,
      setCollapsedBlock,
      fetchProfits,
      updateProfileHeader: () => updateProfileHeaderBridge({ updateProfileHeaderFeature, documentRef: document }),
      maybeNotifyTaskAlert,
      bindSectionControls,
      getPageMode,
      getOverviewPins
    });
  }

  return renderApp;
}
