import { getSelectedGame, subscribeToGameChanges } from '../../runtime/game-context.ts';
import { closeAllFloatingControls } from '../../ui/panel-controls.ts';
import { tracker } from '../../../stores/tracker.svelte';

export const closeFloatingControls = closeAllFloatingControls;

export function setupViewsControl({}: { documentRef?: Document } = {}) {
	const syncNavbar = (_game: string | null) => {
		// Navbar integration via components
	};

	syncNavbar(getSelectedGame());

	subscribeToGameChanges((game) => {
		syncNavbar(game);
		tracker.reloadAll();
	});
}
