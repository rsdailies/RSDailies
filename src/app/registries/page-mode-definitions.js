import { getContentPages } from '../../core/domain/content/catalog.js';
import { CONTENT_PAGES } from './content-pages.js';
import { createAliasLookup, filterByGame } from './shared.js';

function buildTrackerPageModes() {
  return Object.freeze(
    getContentPages({ pages: CONTENT_PAGES }).map((page) => ({
      id: page.id,
      label: page.title,
      game: page.game,
      aliases: Array.isArray(page.aliases) && page.aliases.length > 0 ? page.aliases : [page.id],
      buttonLabel: page.buttonLabel || page.title,
      navLabel: page.navLabel || page.title,
      menuGroup: page.menuGroup || 'Views',
      includeInViewsPanel: page.includeInViewsPanel ?? false,
      includeInPrimaryNav: page.includeInPrimaryNav ?? false,
      primaryNavDropdownLabel: page.primaryNavDropdownLabel || '',
      primaryNavItemLabel: page.primaryNavItemLabel || '',
      displayOrder: page.displayOrder,
    }))
  );
}

export const TRACKER_PAGE_MODE_DEFINITIONS = buildTrackerPageModes();
const trackerPageModesById = new Map(TRACKER_PAGE_MODE_DEFINITIONS.map((mode) => [mode.id, mode]));
const trackerPageModesByAlias = createAliasLookup(TRACKER_PAGE_MODE_DEFINITIONS);
const trackerPageModesByAliasByGame = new Map(
  Array.from(new Set(TRACKER_PAGE_MODE_DEFINITIONS.map((mode) => mode.game))).map((game) => [
    game,
    createAliasLookup(filterByGame(TRACKER_PAGE_MODE_DEFINITIONS, game)),
  ])
);

export function getTrackerViews(game = null) {
  return filterByGame(TRACKER_PAGE_MODE_DEFINITIONS, game).map((mode) => ({
    mode: mode.id,
    label: mode.label,
  }));
}

export function getTrackerViewsPanelGroups(game = null) {
  const groupedModes = filterByGame(TRACKER_PAGE_MODE_DEFINITIONS, game)
    .filter((mode) => mode.includeInViewsPanel)
    .reduce((groups, mode) => {
      const heading = mode.menuGroup || 'Views';
      if (!groups.has(heading)) {
        groups.set(heading, []);
      }

      groups.get(heading).push({ mode: mode.id, label: mode.navLabel || mode.label });
      return groups;
    }, new Map());

  return Array.from(groupedModes.entries()).map(([heading, items]) => ({ heading, items }));
}

export function getTrackerPrimaryNavItems(game = null) {
  const dropdowns = new Map();
  const items = [];

  filterByGame(TRACKER_PAGE_MODE_DEFINITIONS, game)
    .filter((mode) => mode.includeInPrimaryNav)
    .forEach((mode) => {
      const dropdownLabel = String(mode.primaryNavDropdownLabel || '').trim();
      const itemLabel = String(mode.primaryNavItemLabel || mode.navLabel || mode.label).trim();

      if (!dropdownLabel) {
        items.push({ type: 'link', mode: mode.id, label: mode.navLabel || mode.label });
        return;
      }

      if (!dropdowns.has(dropdownLabel)) {
        dropdowns.set(dropdownLabel, { type: 'dropdown', label: dropdownLabel, items: [] });
        items.push(dropdowns.get(dropdownLabel));
      }

      dropdowns.get(dropdownLabel).items.push({ mode: mode.id, label: itemLabel });
    });

  return items;
}

export function getTrackerPageModes(game = null) {
  return filterByGame(TRACKER_PAGE_MODE_DEFINITIONS, game).map((mode) => mode.id);
}

export function getDefaultTrackerPageMode(game = null) {
  const definitions = filterByGame(TRACKER_PAGE_MODE_DEFINITIONS, game);
  const defaultMode = definitions.find((mode) => mode.includeInPrimaryNav) || definitions[0] || null;
  return defaultMode?.id || null;
}

export function getTrackerPageMode(modeId, game = null) {
  const mode = trackerPageModesById.get(modeId) || null;
  if (!mode) {
    return null;
  }

  return game && mode.game !== game ? null : mode;
}

export function isTrackerPageMode(modeId, game = null) {
  return !!getTrackerPageMode(modeId, game);
}

export function normalizeTrackerPageMode(modeId, fallback = null, game = null) {
  const aliasLookup = game ? trackerPageModesByAliasByGame.get(game) || new Map() : trackerPageModesByAlias;
  const resolvedFallback = fallback || getDefaultTrackerPageMode(game) || 'overview';

  if (typeof modeId !== 'string') {
    return resolvedFallback;
  }

  const canonicalMode = aliasLookup.get(modeId);
  return canonicalMode || resolvedFallback;
}
