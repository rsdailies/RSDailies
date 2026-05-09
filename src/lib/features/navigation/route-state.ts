export interface RouteState {
	game: 'rs3' | 'osrs' | null;
	mode: string | null;
}

export function readRouteState(locationRef: Location): RouteState {
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

export function routeForState(game: string | null, mode: string | null) {
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

export function syncRouteToState(game: string | null, mode: string | null, locationRef = window.location) {
	const nextUrl = routeForState(game, mode);
	const currentUrl = `${locationRef.pathname}${locationRef.search}`;

	if (nextUrl !== currentUrl) {
		window.history.replaceState({}, '', nextUrl);
	}
}
