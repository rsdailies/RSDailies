import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import navbarHtml from '../app/shell/html/navbar.html?raw';
import overviewHtml from '../app/shell/html/overview.html?raw';
import footerHtml from '../app/shell/html/footer.html?raw';
import customTaskModalHtml from '../app/shell/html/modals/custom-task.html?raw';
import tokenModalHtml from '../app/shell/html/modals/token.html?raw';
import rowTemplateHtml from '../widgets/tracker/rows/templates/row-sample.html?raw';

import { renderAppView } from '../lib/runtime/render-app-shell.ts';
import { startHostedApp } from './start-hosted-app';
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
	setPageMode,
} from '../lib/runtime/view-controller.ts';

interface RouteState {
	game: 'rs3' | 'osrs' | null;
	mode: string | null;
}

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

function readRouteState(locationRef: Location): RouteState {
	const path = locationRef.pathname.replace(/\/+$/, '') || '/';
	const params = new URLSearchParams(locationRef.search);
	const view = String(params.get('view') || '').toLowerCase();

	if (path === '/' || path === '') {
		return { game: null, mode: null };
	}

	if (path === '/rs3/overview') return { game: 'rs3', mode: 'overview' };
	if (path === '/rs3/gathering') return { game: 'rs3', mode: 'gathering' };
	if (path === '/rs3/timers') return { game: 'rs3', mode: 'rs3farming' };
	if (path === '/rs3/tasks') {
		if (view === 'daily') return { game: 'rs3', mode: 'rs3daily' };
		if (view === 'weekly') return { game: 'rs3', mode: 'rs3weekly' };
		if (view === 'monthly') return { game: 'rs3', mode: 'rs3monthly' };
		return { game: 'rs3', mode: 'all' };
	}

	if (path === '/osrs/overview') return { game: 'osrs', mode: 'osrs-overview' };
	if (path === '/osrs/tasks') {
		if (view === 'daily') return { game: 'osrs', mode: 'osrsdaily' };
		if (view === 'weekly') return { game: 'osrs', mode: 'osrsweekly' };
		if (view === 'monthly') return { game: 'osrs', mode: 'osrsmonthly' };
		return { game: 'osrs', mode: 'osrsall' };
	}

	return { game: null, mode: null };
}

function routeForState(game: string | null, mode: string | null) {
	if (!game) return '/';

	if (game === 'rs3') {
		if (mode === 'overview' || mode === 'rs3-overview') return '/rs3/overview';
		if (mode === 'rs3daily') return '/rs3/tasks?view=daily';
		if (mode === 'rs3weekly') return '/rs3/tasks?view=weekly';
		if (mode === 'rs3monthly') return '/rs3/tasks?view=monthly';
		if (mode === 'gathering') return '/rs3/gathering';
		if (mode === 'rs3farming' || mode === 'timers') return '/rs3/timers';
		return '/rs3/tasks?view=all';
	}

	if (mode === 'osrs-overview') return '/osrs/overview';
	if (mode === 'osrsdaily') return '/osrs/tasks?view=daily';
	if (mode === 'osrsweekly') return '/osrs/tasks?view=weekly';
	if (mode === 'osrsmonthly') return '/osrs/tasks?view=monthly';
	return '/osrs/tasks?view=all';
}

function syncRouteToState(game: string | null, mode: string | null) {
	const nextUrl = routeForState(game, mode);
	const currentUrl = `${window.location.pathname}${window.location.search}`;

	if (nextUrl !== currentUrl) {
		window.history.replaceState({}, '', nextUrl);
	}
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
