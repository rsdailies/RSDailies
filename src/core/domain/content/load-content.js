import { osrsPages } from '../../../content/games/osrs/manifest.js';
import { rs3Pages } from '../../../content/games/rs3/manifest.js';
import { validateContentPages } from './validate-content.js';

const CONTENT_PAGES = Object.freeze([
  ...rs3Pages,
  ...osrsPages,
]);


let cachedPages = null;

export function loadContentPages() {
  if (cachedPages) {
    return cachedPages;
  }

  const pages = [...CONTENT_PAGES]
    .sort((left, right) => {
      const leftOrder = Number.isFinite(left?.displayOrder) ? left.displayOrder : Number.MAX_SAFE_INTEGER;
      const rightOrder = Number.isFinite(right?.displayOrder) ? right.displayOrder : Number.MAX_SAFE_INTEGER;

      if (leftOrder !== rightOrder) {
        return leftOrder - rightOrder;
      }

      return String(left.id).localeCompare(String(right.id));
    });

  cachedPages = Object.freeze(validateContentPages(pages));
  return cachedPages;
}


export function loadContentPagesByGame(game) {
  return loadContentPages().filter((page) => page.game === game);
}
