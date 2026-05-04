/**
 * Standard factory for defining a page object.
 * 
 * @param {Object} params
 * @param {string} params.id - Unique identifier for the page.
 * @param {string} params.title - Page title.
 * @param {string} params.game - The game this page belongs to ('rs3', 'osrs').
 * @param {string} params.route - The URL path.
 * @param {Array} params.sections - List of section objects to include on this page.
 * @param {Array} [params.aliases] - Path aliases for routing.
 * @param {string} [params.layout] - Layout strategy ('tracker', 'overview').
 * @param {number} [params.displayOrder] - Nav ordering.
 * @returns {Readonly<Object>}
 */
export function definePage({
  id,
  title,
  game,
  route,
  sections = [],
  aliases = [],
  layout = 'tracker',
  displayOrder = 100,
  ...extra
}) {
  if (!id) throw new Error('Page must have an id');
  if (!title) throw new Error(`Page ${id} must have a title`);
  if (!game) throw new Error(`Page ${id} must define a game`);
  if (!route) throw new Error(`Page ${id} must define a route`);

  return Object.freeze({
    id,
    title,
    game,
    route,
    layout,
    displayOrder,
    aliases: aliases.length ? aliases : [id],
    sections,
    // Nav defaults
    buttonLabel: title,
    navLabel: title,
    menuGroup: 'Tasks',
    includeInViewsPanel: false,
    includeInPrimaryNav: false,
    ...extra,
  });
}
