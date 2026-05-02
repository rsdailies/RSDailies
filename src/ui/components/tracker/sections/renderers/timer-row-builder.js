import {
  buildTimerLocationTask,
  formatTimerDurationNote,
} from './timer-helpers.js';

const TIMER_SECTION_KEY = 'timers';

export function buildTimerPlotRows(timerTask, subgroup, createRightSideChildRow, formatDurationMs, statusNote, context) {
  const durationNote = formatTimerDurationNote(timerTask, {
    formatDurationMs,
    getSettingsValue: context.getSettingsValue,
  });
  const plots = Array.isArray(subgroup.plots) ? subgroup.plots : [];
  const rows = [];

  plots.forEach((plot) => {
    const childTask = buildTimerLocationTask(plot, timerTask, { durationNote, statusNote });
    const childRow = createRightSideChildRow(TIMER_SECTION_KEY, childTask, timerTask.id, {
      extraClass: 'farming-child-row',
      context,
    });
    if (childRow) rows.push(childRow);
  });

  return rows;
}
