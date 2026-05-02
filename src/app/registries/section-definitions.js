import { getCanonicalSections } from '../../core/domain/content/catalog.js';
import { CONTENT_PAGES } from './content-pages.js';
import { filterByGame } from './shared.js';

function buildTrackerSections() {
  return Object.freeze(
    getCanonicalSections({ pages: CONTENT_PAGES }).map((section) => ({
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
    }))
  );
}

export const TRACKER_SECTION_DEFINITIONS = buildTrackerSections();
const trackerSectionsById = new Map(TRACKER_SECTION_DEFINITIONS.map((section) => [section.id, section]));

export function getTrackerSections(game = null) {
  return filterByGame(TRACKER_SECTION_DEFINITIONS, game);
}

export function getTrackerSection(sectionId) {
  return trackerSectionsById.get(sectionId) || null;
}

export function getTrackerSectionIds(game = null) {
  return getTrackerSections(game).map((section) => section.id);
}

export function getTrackerSectionIdMaps() {
  return TRACKER_SECTION_DEFINITIONS.reduce(
    (maps, section) => {
      maps.containerIds[section.id] = section.containerId;
      maps.tableIds[section.id] = section.tableId;
      return maps;
    },
    { containerIds: {}, tableIds: {} }
  );
}
