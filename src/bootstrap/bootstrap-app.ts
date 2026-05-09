import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import navbarHtml from '../app/shell/html/navbar.html?raw';
import overviewHtml from '../app/shell/html/overview.html?raw';
import footerHtml from '../app/shell/html/footer.html?raw';
import customTaskModalHtml from '../app/shell/html/modals/custom-task.html?raw';
import tokenModalHtml from '../app/shell/html/modals/token.html?raw';
import rowTemplateHtml from '../widgets/tracker/rows/templates/row-sample.html?raw';

import { renderAppView } from '../lib/runtime/render-app-shell.ts';
import { startHostedApp } from './start-app';
import {
	initStorageService,
	loadGlobal,
} from '../lib/shared/storage/storage-service.ts';
import { ACTIVE_PROFILE_KEY } from '../lib/shared/storage/namespace.ts';
import {
	GAMES,
	getSelectedGame,
	setSelectedGame,
	subscribeToGameChanges,
} from '../lib/runtime/game-context.ts';
import {
	getPageMode,
	readRouteState,
	setPageMode,
	syncRouteToState,
} from '../lib/features/navigation/index.ts';

function injectShellMarkup() {
	const mounts: Record<string, string> = {
		'main-nav': navbarHtml,
		'overview-mount': overviewHtml,
		'main-footer': footerHtml,
		'token-modal': tokenModalHtml,
		'custom-task-modal': customTaskModalHtml,
		sample_row: rowTemplateHtml,
	};

	for (const [id, html] of Object.entries(mounts)) {
		const element = document.getElementById(id);
		if (element) {
			element.innerHTML = html;
		}
	}

	renderAppView();
}


function seedRouteState() {
	const activeProfile = loadGlobal(ACTIVE_PROFILE_KEY, 'default');
	initStorageService(activeProfile);

	const routeState = readRouteState(window.location);
	if (!routeState.game) {
		setSelectedGame(null);
		return;
	}

	setSelectedGame(routeState.game === 'osrs' ? GAMES.OSRS : GAMES.RS3);
	if (routeState.mode) {
		setPageMode(routeState.mode, routeState.game);
	}
}

function bindRouteSync() {
	document.addEventListener('page-mode-sync', (event: Event) => {
		const customEvent = event as CustomEvent<{ mode?: string; game?: string }>;
		syncRouteToState(
			customEvent.detail?.game || getSelectedGame(),
			customEvent.detail?.mode || getPageMode()
		);
	});

	subscribeToGameChanges((game) => {
		syncRouteToState(game, game ? getPageMode(game) : null);
	});
}

function bootstrapHostedApp() {
	injectShellMarkup();
	seedRouteState();
	startHostedApp();
	bindRouteSync();
}

bootstrapHostedApp();
