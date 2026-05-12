import { getSelectedGame, subscribeToGameChanges } from '../../runtime/game-context.ts';
import { closeAllFloatingControls } from '../../ui/panel-controls.ts';

export const closeFloatingControls = closeAllFloatingControls;

export function setupViewsControl({
	renderApp,
}: {
	documentRef: Document;
	renderApp: () => void;
}) {
	const syncNavbar = (_game: string | null) => {
		// Navbar integration via components
	};

	syncNavbar(getSelectedGame());

	subscribeToGameChanges((game) => {
		syncNavbar(game);
		renderApp();
	});
}
