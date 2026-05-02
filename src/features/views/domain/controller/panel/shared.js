import { getViewsButtonLabel } from '../../../../../ui/components/views/views-menu.js';
import { GAMES, getSelectedGame } from '../../../../../core/state/GameContext.js';

export function getActiveGame(game = getSelectedGame()) {
  return game === GAMES.OSRS ? GAMES.OSRS : GAMES.RS3;
}

export function syncViewsButtonLabel(button, mode, game) {
  if (!button) return;

  const textNode = button.querySelector('.expanding_text');
  if (textNode) {
    textNode.innerHTML = `&nbsp;${getViewsButtonLabel(mode, game)}`;
  }
}
