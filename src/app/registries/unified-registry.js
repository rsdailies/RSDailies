import { getTrackerPages } from './content-pages.js';
import { TRACKER_PAGE_MODE_DEFINITIONS } from './page-mode-definitions.js';
import { getTrackerSections } from './section-definitions.js';
import { filterByGame } from './shared.js';

export { CONTENT_PAGES, getTrackerPages, getTrackerPagesByGame, getTrackerPage, getTrackerPageSectionIds } from './content-pages.js';
export {
  TRACKER_PAGE_MODE_DEFINITIONS,
  getTrackerViews,
  getTrackerViewsPanelGroups,
  getTrackerPrimaryNavItems,
  getTrackerPageModes,
  getDefaultTrackerPageMode,
  getTrackerPageMode,
  isTrackerPageMode,
  normalizeTrackerPageMode,
} from './page-mode-definitions.js';
export {
  TRACKER_SECTION_DEFINITIONS,
  getTrackerSections,
  getTrackerSection,
  getTrackerSectionIds,
  getTrackerSectionIdMaps,
} from './section-definitions.js';
export { filterByGame } from './shared.js';

const registryCache = new Map();

export function getCanonicalTrackerRegistry(game = null) {
  const cacheKey = game || 'all';
  if (registryCache.has(cacheKey)) {
    return registryCache.get(cacheKey);
  }

  const registry = {
    sections: getTrackerSections(game),
    pageModes: filterByGame(TRACKER_PAGE_MODE_DEFINITIONS, game),
    pages: getTrackerPages(game),
  };

  registryCache.set(cacheKey, registry);
  return registry;
}

