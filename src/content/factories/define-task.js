/**
 * Sanitizes text by removing extra whitespace.
 * @param {string} text 
 * @returns {string}
 */
function clean(text = '') {
  return String(text).replace(/\s+/g, ' ').trim();
}

/**
 * Standard factory for defining a task object.
 * Enforces schema consistency and provides a single source of truth for task structure.
 * 
 * @param {Object} params
 * @param {string} params.id - Unique identifier for the task.
 * @param {string} params.name - Human-readable name of the task.
 * @param {string} [params.wiki] - Optional wiki link suffix.
 * @param {string} [params.note] - Optional inline note for the task row.
 * @param {string} [params.reset] - Reset frequency ('daily', 'weekly', 'monthly').
 * @param {Object} [params.hover] - Optional hover/tooltip metadata.
 * @param {string} [params.hover.note] - Specific note for the tooltip.
 * @returns {Readonly<Object>}
 */
export function defineTask({
  id,
  name,
  wiki = '',
  note = '',
  reset = 'daily',
  hover = {},
  ...extra
}) {
  if (!id) throw new Error('Task must have an id');
  if (!name) throw new Error(`Task ${id} must have a name`);

  const taskObj = {
    id,
    name: clean(name),
    wiki,
    note: clean(note),
    reset,
    hover: {
      ...hover,
    },
    ...extra,
  };

  if (hover.note) {
    taskObj.hover.note = clean(hover.note);
  }

  return Object.freeze(taskObj);
}


