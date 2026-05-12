export interface RouteState {
	game: 'rs3' | 'osrs' | null;
	mode: string | null;
	view?: string | null;
}

export function readRouteState(locationRef: Location): RouteState {
	const path = locationRef.pathname.replace(/\/+$/, '') || '/';

	if (path === '/' || path === '') {
		return { game: null, mode: null };
	}

	if (path === '/rs3/overview') return { game: 'rs3', mode: 'overview' };
	if (path === '/rs3/gathering') return { game: 'rs3', mode: 'gathering' };
	if (path === '/rs3/timers') return { game: 'rs3', mode: 'timers' };
	if (path === '/rs3/tasks') return { game: 'rs3', mode: 'all' };

	if (path === '/osrs/overview') return { game: 'osrs', mode: 'osrs-overview' };
	if (path === '/osrs/tasks') return { game: 'osrs', mode: 'osrsall' };

	return { game: null, mode: null };
}

export function routeForState(game: string | null, mode: string | null) {
	if (!game) return '/';

	if (game === 'rs3') {
		if (mode === 'overview' || mode === 'rs3-overview') return '/rs3/overview';
		if (mode === 'all') return '/rs3/tasks';
		if (mode === 'gathering') return '/rs3/gathering';
		if (mode === 'timers' || mode === 'rs3farming') return '/rs3/timers';
		return '/rs3/tasks';
	}

	if (mode === 'osrs-overview') return '/osrs/overview';
	if (mode === 'osrsall' || mode === 'all') return '/osrs/tasks';
	return '/osrs/tasks';
}

export function syncRouteToState(game: string | null, mode: string | null, locationRef = window.location) {
	const nextUrl = routeForState(game, mode);
	const currentUrl = `${locationRef.pathname}${locationRef.search}`;

	if (nextUrl !== currentUrl) {
		window.history.replaceState({}, '', nextUrl);
	}
}
