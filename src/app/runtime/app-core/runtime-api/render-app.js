import { GAMES, getSelectedGame } from '../../../../core/state/GameContext.js';
import { resolveTrackerSections } from '../../../../core/domain/content/resolve-tracker-content.js';
import { createRenderAppRunner } from '../render-deps.js';

export function createRuntimeRenderApp({
  renderAppCore,
  load,
  save,
  getSectionState,
  getCustomTasks,
  saveCustomTasks,
  getCooldowns,
  getTimers,
  cleanupReadyTimers,
  cleanupReadyCooldowns,
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
  updateProfileHeaderFeature,
  maybeNotifyTaskAlert,
  bindSectionControls,
  saveSectionValue,
  resetSectionView,
  getPageMode,
  getOverviewPins,
}) {
  let renderApp = () => {};

  renderApp = createRenderAppRunner(renderAppCore, {
    load,
    save,
    getSectionState: (sectionKey) => getSectionState(sectionKey, load),
    getCustomTasks: () => getCustomTasks(load),
    saveCustomTasks: (tasks) => saveCustomTasks(tasks, save),
    getCooldowns: () => getCooldowns(load),
    getTimers: () => getTimers(load),
    cleanupReadyTimers: () => cleanupReadyTimers({ load, save }),
    cleanupReadyCooldowns: () => cleanupReadyCooldowns({ load, save }),
    hideTooltip: () => hideTooltip(document),
    getResolvedSections: (game = null) => resolveTrackerSections({
      game: game || (getSelectedGame() === GAMES.OSRS ? GAMES.OSRS : GAMES.RS3),
      getCustomTasks: () => getCustomTasks(load),
      getPenguinWeeklyData: () => load('penguinWeeklyData', {}),
    }),
    getTimerHeaderStatus: (task) => getTimerHeaderStatus(task, { load }),
    hideTask: (sectionKey, taskId) => hideTask(sectionKey, taskId, { load, save }),
    setTaskCompleted: (sectionKey, taskId, completed) => setTaskCompleted(sectionKey, taskId, completed, { load, save }),
    clearTimer: (taskId) => clearTimer(taskId, { load, save }),
    startTimer: (task) => startTimer(task, { load, save }),
    startCooldown: (taskId, minutes) => startCooldown(taskId, minutes, { load, save }),
    isCollapsedBlock: (blockId) => isCollapsedBlock(blockId, load),
    setCollapsedBlock: (blockId, collapsed) => setCollapsedBlock(blockId, collapsed, load, save),
    fetchProfits,
    updateProfileHeaderBridge,
    updateProfileHeaderFeature,
    maybeNotifyTaskAlert: (task, sectionKey) => maybeNotifyTaskAlert(task, sectionKey, { load, save }),
    bindSectionControls: (sectionKey, opts) => bindSectionControls(sectionKey, opts, {
      renderApp,
      getSectionState: (key) => getSectionState(key, load),
      saveSectionValue: (key, name, value) => saveSectionValue(key, name, value, save),
      resetSectionView: (key) => resetSectionView(key, { load, save }),
    }),
    getPageMode,
    getOverviewPins: () => getOverviewPins(load),
  });

  return renderApp;
}
