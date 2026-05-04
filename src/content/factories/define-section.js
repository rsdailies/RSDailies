/**
 * Standard factory for defining a section object.
 * 
 * @param {Object} params
 * @param {string} params.id - Unique identifier for the section.
 * @param {string} params.label - Human-readable label.
 * @param {string} params.game - The game this section belongs to ('rs3', 'osrs').
 * @param {number} [params.displayOrder] - Ordering priority in the UI.
 * @param {string} [params.resetFrequency] - Default reset period for tasks in this section.
 * @param {string} [params.renderVariant] - The renderer strategy ('standard', 'grouped-sections', 'parent-children', 'timer-groups').
 * @param {Object} [params.shell] - Shell configuration (columns, visibility).
 * @param {Array} [params.items] - List of tasks or subgroups.
 * @returns {Readonly<Object>}
 */
export function defineSection({
  id,
  label,
  game,
  displayOrder = 100,
  resetFrequency = 'daily',
  renderVariant = 'standard',
  shell = {},
  items = [],
  ...extra
}) {
  if (!id) throw new Error('Section must have an id');
  if (!label) throw new Error(`Section ${id} must have a label`);
  if (!game) throw new Error(`Section ${id} must define a game`);

  return Object.freeze({
    id,
    label,
    shortLabel: label, // Defaults to label, can be overridden via ...extra
    game,
    displayOrder,
    resetFrequency,
    renderVariant,
    shell: {
      columns: [],
      extraTableClasses: [],
      showAddButton: false,
      showResetButton: true,
      showCountdown: true,
      ...shell
    },
    items,
    ...extra,
  });
}
