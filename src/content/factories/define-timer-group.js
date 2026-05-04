/**
 * Factory for creating a standardized timer group definition.
 * Used for complex timer structures like Farming patches that contain
 * multiple sub-timers or checklists.
 */
export function defineTimerGroup({
  id,
  label,
  name,
  note = '',
  timers = [],
  plots = []
}) {
  if (!id) throw new Error('Timer group must have an ID');
  
  // label is preferred but name is accepted for backward compatibility
  const groupLabel = label || name || id;

  return Object.freeze({
    id,
    label: groupLabel,
    name: groupLabel, // keep name for renderers expecting it
    note,
    timers: timers.map(t => ({
      ...t,
      timerKind: t.timerKind || 'growth',
      timerCategory: t.timerCategory || 'farming'
    })),
    plots: [...plots]
  });
}
