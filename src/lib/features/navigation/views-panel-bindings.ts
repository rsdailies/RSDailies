import { getTrackerPrimaryNavItems, getTrackerViewsPanelGroups } from './page-registry.ts';
import { GAMES, getSelectedGame, subscribeToGameChanges } from '../../runtime/game-context.ts';
import { positionPanel, replaceInteractiveElement, setPanelOpenState } from '../../ui/dom-controls.ts';
import { bindFloatingPanelTrigger, closeAllFloatingControls } from '../../ui/panel-controls.ts';
import { getPageMode, getPageModeLabel, setPageMode, syncStoredViewModeToPageMode } from './page-mode-state.ts';
import { upsertPrimaryNavLinks } from './primary-nav-render.ts';
import { renderViewsList, syncViewsButtonLabel } from './views-panel-render.ts';

function getActiveGame(game = getSelectedGame()) {
	if (!game) return null;
	return game === GAMES.OSRS ? GAMES.OSRS : GAMES.RS3;
}

export const closeFloatingControls = closeAllFloatingControls;

export function setupViewsControl({
	documentRef,
	renderApp,
}: {
	documentRef: Document;
	renderApp: () => void;
}) {
	const syncNavbar = (game: string | null) => {
		const activeGame = getActiveGame(game);
		const items = activeGame ? getTrackerPrimaryNavItems(activeGame) : [];
		/*
		upsertPrimaryNavLinks(documentRef, items, (mode: string) => {
			setPageMode(mode, activeGame);
			renderApp();
		});
		*/
	};

	// Initial render
	syncNavbar(getSelectedGame());

	subscribeToGameChanges((game) => {
		syncNavbar(game);
		renderApp();
	});
}
