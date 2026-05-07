import { osrsPages } from '../../content/games/osrs/manifest.js';
import { rs3Pages } from '../../content/games/rs3/manifest.js';
import { validateContentPages } from './validate-content.js';
import { resolvePenguinTask } from './resolvers/penguin.resolver.js';
import { resolveTimerGroups } from './resolvers/timer.resolver.js';
import { resolveCustomTasks } from './resolvers/custom.resolver.js';

/**
 * Unified Content Loader
 * 
 * Authoritatively manages the loading, validation, sorting, and resolution 
 * of all game content, sections, and page modes.
 */

// ============ Helper: Content Loading & Sorting ============

function sortByDisplayOrder(left, right) {
  const leftOrder = Number.isFinite(left?.displayOrder) ? left.displayOrder : Number.MAX_SAFE_INTEGER;
  const rightOrder = Number.isFinite(right?.displayOrder) ? right.displayOrder : Number.MAX_SAFE_INTEGER;

  if (leftOrder !== rightOrder) {
    return leftOrder - rightOrder;
  }

  return String(left?.id || '').localeCompare(String(right?.id || ''));
}

function buildContentPages() {
  const rawPages = [...rs3Pages, ...osrsPages];
  const sorted = [...rawPages].sort(sortByDisplayOrder);
  return Object.freeze(validateContentPages(sorted));
}

// Cached authoritative content pages
let _CONTENT_PAGES = null;
export function getContentPages() {
  if (!_CONTENT_PAGES) {
    _CONTENT_PAGES = buildContentPages();
  }
  return _CONTENT_PAGES;
}

// ============ Helper: Canonical Resolution ============

function getContentPagesInternal({ pages = null, game = null } = {}) {
  const sourcePages = pages || getContentPages();
  const filtered = game ? sourcePages.filter((page) => page?.game === game) : sourcePages;
  return [...filtered].sort(sortByDisplayOrder);
}

function getCanonicalSectionsInternal({ pages = null, game = null } = {}) {
  const sourcePages = pages || getContentPages();
  const sections = new Map();

  getContentPagesInternal({ pages: sourcePages, game }).forEach((page) => {
    (page.sections || []).forEach((section) => {
      const current = sections.get(section.id);
      const score = page.id === section.id ? 2 : 1;

      if (!current || score > current.score) {
        sections.set(section.id, { score, section });
      }
    });
  });

  return Array.from(sections.values())
    .map((entry) => entry.section)
    .sort(sortByDisplayOrder);
}

// ============ Helper: Shared Registry Logic ============

function filterByGame(items, game = null) {
  if (!game) return items;
  return items.filter((item) => item.game === game);
}

function createAliasLookup(modes) {
  const lookup = new Map();
  modes.forEach((mode) => {
    (mode.aliases || []).forEach((alias) => {
      lookup.set(alias, mode.id);
    });
    lookup.set(mode.id, mode.id);
  });
  return lookup;
}

// ============ Section Definitions ============

function buildSectionDefinitions() {
  return Object.freeze(
    getCanonicalSectionsInternal({ pages: getContentPages() }).map((section) => ({
      id: section.id,
      label: section.label,
      shortLabel: section.shortLabel || section.label,
      game: section.game || 'rs3',
      displayOrder: section.displayOrder,
      resetFrequency: section.resetFrequency,
      renderVariant: section.renderVariant,
      containerId: section.containerId,
      tableId: section.tableId,
      includedInAllMode: section.includedInAllMode ?? false,
      supportsTaskNotifications: section.supportsTaskNotifications ?? false,
      shell: section.shell,
      items: section.items || [],
      groups: section.groups || null,
    }))
  );
}

let _TRACKER_SECTION_DEFINITIONS = null;
export function getTrackerSectionDefinitions() {
  if (!_TRACKER_SECTION_DEFINITIONS) {
    _TRACKER_SECTION_DEFINITIONS = buildSectionDefinitions();
  }
  return _TRACKER_SECTION_DEFINITIONS;
}

let _SECTIONS_BY_ID = null;
function getSectionsByIdMap() {
  if (!_SECTIONS_BY_ID) {
    _SECTIONS_BY_ID = new Map(getTrackerSectionDefinitions().map((s) => [s.id, s]));
  }
  return _SECTIONS_BY_ID;
}

export function getTrackerSections(game = null, pages = null) {
  if (pages) {
    return getCanonicalSectionsInternal({ pages, game });
  }
  return filterByGame(getTrackerSectionDefinitions(), game);
}

export function getTrackerSection(sectionId) {
  return getSectionsByIdMap().get(sectionId) || null;
}

export const getContentSectionDefinition = getTrackerSection;

export function getTrackerSectionIds(game = null) {
  return getTrackerSections(game).map((s) => s.id);
}

export function getTrackerSectionIdMaps() {
  return getTrackerSectionDefinitions().reduce(
    (maps, section) => {
      maps.containerIds[section.id] = section.containerId;
      maps.tableIds[section.id] = section.tableId;
      return maps;
    },
    { containerIds: {}, tableIds: {} }
  );
}

// ============ Page Mode Definitions ============

function buildPageModeDefinitions() {
  return Object.freeze(
    getContentPagesInternal({ pages: getContentPages() }).map((page) => ({
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
      sections: page.sections || [],
    }))
  );
}

let _TRACKER_PAGE_MODE_DEFINITIONS = null;
export function getTrackerPageModeDefinitions() {
  if (!_TRACKER_PAGE_MODE_DEFINITIONS) {
    _TRACKER_PAGE_MODE_DEFINITIONS = buildPageModeDefinitions();
  }
  return _TRACKER_PAGE_MODE_DEFINITIONS;
}

let _PAGE_MODES_BY_ID = null;
function getPageModesByIdMap() {
  if (!_PAGE_MODES_BY_ID) {
    _PAGE_MODES_BY_ID = new Map(getTrackerPageModeDefinitions().map((m) => [m.id, m]));
  }
  return _PAGE_MODES_BY_ID;
}

let _PAGE_MODES_BY_ALIAS = null;
function getPageModesByAliasMap() {
  if (!_PAGE_MODES_BY_ALIAS) {
    _PAGE_MODES_BY_ALIAS = createAliasLookup(getTrackerPageModeDefinitions());
  }
  return _PAGE_MODES_BY_ALIAS;
}

let _PAGE_MODES_BY_ALIAS_BY_GAME = null;
function getPageModesByAliasByGameMap() {
  if (!_PAGE_MODES_BY_ALIAS_BY_GAME) {
    const cache = getTrackerPageModeDefinitions();
    _PAGE_MODES_BY_ALIAS_BY_GAME = new Map(
      Array.from(new Set(cache.map((m) => m.game))).map((game) => [
        game,
        createAliasLookup(filterByGame(cache, game)),
      ])
    );
  }
  return _PAGE_MODES_BY_ALIAS_BY_GAME;
}

export function getTrackerViews(game = null) {
  return filterByGame(getTrackerPageModeDefinitions(), game).map((mode) => ({
    mode: mode.id,
    label: mode.label,
  }));
}

export function getTrackerViewsPanelGroups(game = null) {
  const groupedModes = filterByGame(getTrackerPageModeDefinitions(), game)
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

  filterByGame(getTrackerPageModeDefinitions(), game)
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
  return filterByGame(getTrackerPageModeDefinitions(), game).map((mode) => mode.id);
}

export function getTrackerPage(pageId, game = null) {
  const mode = getPageModesByIdMap().get(pageId) || null;
  if (!mode) return null;
  return game && mode.game !== game ? null : mode;
}

export const getTrackerPageMode = getTrackerPage;

export function getTrackerPageSectionIds(pageId, game = null) {
  const page = getTrackerPage(pageId, game);
  if (!page || !Array.isArray(page.sections)) {
    return [];
  }
  return page.sections.map((section) => section.id);
}

export function isTrackerPageMode(modeId, game = null) {
  return !!getTrackerPage(modeId, game);
}

export function getDefaultTrackerPageMode(game = null) {
  const definitions = filterByGame(getTrackerPageModeDefinitions(), game);
  const defaultMode = definitions.find((mode) => mode.includeInPrimaryNav) || definitions[0] || null;
  return defaultMode?.id || null;
}

export function normalizeTrackerPageMode(modeId, fallback = null, game = null) {
  const aliasLookup = game ? getPageModesByAliasByGameMap().get(game) || new Map() : getPageModesByAliasMap();
  const resolvedFallback = fallback || getDefaultTrackerPageMode(game) || 'overview';

  if (typeof modeId !== 'string') return resolvedFallback;
  const canonicalMode = aliasLookup.get(modeId);
  return canonicalMode || resolvedFallback;
}

// ============ Task Resolution ============

function resolveSectionItems(section, deps) {
  if (section.id === 'custom') {
    return resolveCustomTasks(deps.getCustomTasks);
  }

  if (Array.isArray(section.groups) && section.groups.length > 0) {
    return resolveTimerGroups(section.groups);
  }

  const items = section.items || [];
  if (section.id !== 'rs3weekly') {
    return items;
  }

  return items.map((task) => resolvePenguinTask(task, deps.getPenguinWeeklyData()));
}

export function resolveTrackerSections(options = {}) {
  const {
    game = null,
    pages = null,
    getCustomTasks = () => [],
    getPenguinWeeklyData = () => ({})
  } = options;

  const deps = { getCustomTasks, getPenguinWeeklyData };

  return getTrackerSections(game, pages).reduce((sections, section) => {
    sections[section.id] = resolveSectionItems(section, deps);
    return sections;
  }, {});
}

export function resolveTrackerPage(pageId, options = {}) {
  const {
    pages = null,
    getCustomTasks = () => [],
    getPenguinWeeklyData = () => ({})
  } = options;

  const sourcePages = pages || getContentPages();
  const page = sourcePages.find((p) => p.id === pageId);
  if (!page) return null;

  const deps = { getCustomTasks, getPenguinWeeklyData };

  return {
    ...page,
    sections: (page.sections || []).map((section) => ({
      ...section,
      resolvedItems: resolveSectionItems(section, deps),
    })),
  };
}

// ============ Task ID Flattening ============

function flattenTaskIds(tasks = []) {
  return tasks.flatMap((task) => {
    const childRows = Array.isArray(task.childRows) ? task.childRows.map((c) => c.id) : [];
    const children = Array.isArray(task.children) ? task.children.map((c) => c.id) : [];
    return [task.id, ...childRows, ...children].filter(Boolean);
  });
}

function flattenGroupTaskIds(sectionId, groups = []) {
  return groups.flatMap((group) => {
    const timers = Array.isArray(group.timers) ? group.timers : [];
    const plots = Array.isArray(group.plots) ? group.plots : [];

    const timerChildIds = timers.flatMap((timer) =>
      plots.map((plot) => `${sectionId}::${timer.id}::${plot.id}`)
    );

    const plotIdsWithoutTimers = timers.length === 0 ? plots.map((plot) => plot.id) : [];
    return [...timerChildIds, ...plotIdsWithoutTimers].filter(Boolean);
  });
}

export function getContentSectionTaskIds(sectionId, options = {}) {
  const { game = null, customTasks = [] } = options;

  if (sectionId === 'custom') {
    return customTasks.map((task) => task.id).filter(Boolean);
  }

  const section = getTrackerSection(sectionId);
  if (!section) return [];

  if (Array.isArray(section.items) && section.items.length > 0) {
    return flattenTaskIds(section.items);
  }

  if (Array.isArray(section.groups) && section.groups.length > 0) {
    return flattenGroupTaskIds(sectionId, section.groups);
  }

  return [];
}

export function getContentSectionTaskIdsByCadence(sectionId, cadence, options = {}) {
  const { game = null } = options;
  const normalizedCadence = String(cadence || '').toLowerCase();
  const section = getTrackerSection(sectionId);

  if (!section || !Array.isArray(section.items)) return [];

  return section.items
    .filter((task) => String(task?.reset || 'daily').toLowerCase() === normalizedCadence)
    .map((task) => task.id)
    .filter(Boolean);
}
