import { loadContentPages, loadContentPagesByGame } from '../../core/domain/content/load-content.js';

export const CONTENT_PAGES = Object.freeze(loadContentPages());
const trackerPagesById = new Map(CONTENT_PAGES.map((page) => [page.id, page]));

export function getTrackerPages(game = null) {
  return game ? loadContentPagesByGame(game) : [...CONTENT_PAGES];
}

export function getTrackerPagesByGame(game) {
  return loadContentPagesByGame(game);
}

export function getTrackerPage(pageId, game = null) {
  const page = trackerPagesById.get(pageId) || null;
  if (!page) {
    return null;
  }

  return game && page.game !== game ? null : page;
}

export function getTrackerPageSectionIds(pageId, game = null) {
  const page = getTrackerPage(pageId, game);
  if (!page || !Array.isArray(page.sections)) {
    return [];
  }

  return page.sections.map((section) => section.id);
}
