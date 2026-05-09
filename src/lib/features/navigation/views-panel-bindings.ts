import { getTrackerPrimaryNavItems, getTrackerViewsPanelGroups } from './page-registry.ts';
import { GAMES, getSelectedGame, subscribeToGameChanges } from '../../runtime/game-context.ts';
import { positionPanel, replaceInteractiveElement, setPanelOpenState } from '../../ui/dom-controls.ts';
import { bindFloatingPanelTrigger, closeAllFloatingControls } from '../../ui/panel-controls.ts';
import { getPageMode, getPageModeLabel, setPageMode, syncStoredViewModeToPageMode } from './page-mode-state.ts';
import { upsertPrimaryNavLinks } from './primary-nav-render.ts';
import { renderViewsList, syncViewsButtonLabel } from './views-panel-render.ts';

function getActiveGame(game = getSelectedGame()) {
	return game === GAMES.OSRS ? GAMES.OSRS : GAMES.RS3;
}

export const closeFloatingControls = closeAllFloatingControls;

export function setupViewsControl({
	renderApp = () => {},
	documentRef = document,
	windowRef = window,
	closeAllFloatingControls: closeAll = () => closeAllFloatingControls(documentRef),
} = {}) {
	syncStoredViewModeToPageMode();
	const panelButton = documentRef.getElementById('views-button-panel');
	const panel = documentRef.getElementById('views-control');
	const list = documentRef.getElementById('views-list');
	if (!panelButton || !panel || !list) return;

	const button = replaceInteractiveElement(panelButton);
	const panelTitle = panel.querySelector('strong');
	if (panelTitle && panelTitle.textContent.trim().toLowerCase() === 'views') {
		panelTitle.remove();
	}

	function applyMode(mode: string) {
		const game = getActiveGame();
		setPageMode(mode, game);
		syncViewsButtonLabel(button, getPageModeLabel(mode, game));
		setPanelOpenState(panel, false);
		renderApp();
	}

	function renderList(game = getActiveGame()) {
		renderViewsList(list, getTrackerViewsPanelGroups(game), applyMode);
	}

	function openPanel() {
		closeAll();
		renderList();
		setPanelOpenState(panel, true);
		positionPanel(panel, button, windowRef);
	}

	const initialGame = getActiveGame();
	upsertPrimaryNavLinks(documentRef, getTrackerPrimaryNavItems(initialGame), applyMode);
	const currentMode = getPageMode(initialGame);
	syncViewsButtonLabel(button, getPageModeLabel(currentMode, initialGame));

	bindFloatingPanelTrigger({
		button,
		panel,
		closePanels: closeAll,
		onOpen: openPanel,
	});

	documentRef.addEventListener('page-mode-sync', (event: Event) => {
		const customEvent = event as CustomEvent<{ game?: string; mode?: string }>;
		const game = customEvent?.detail?.game || getActiveGame();
		const mode = customEvent?.detail?.mode || getPageMode(game);
		syncViewsButtonLabel(button, getPageModeLabel(mode, game));
		renderList(game);
	});

	subscribeToGameChanges((game) => {
		const activeGame = getActiveGame(game || undefined);
		const nextMode = syncStoredViewModeToPageMode(activeGame);
		upsertPrimaryNavLinks(documentRef, getTrackerPrimaryNavItems(activeGame), applyMode);
		renderList(activeGame);
		syncViewsButtonLabel(button, getPageModeLabel(nextMode, activeGame));
		renderApp();
	});
}
