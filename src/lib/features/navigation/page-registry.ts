export type Game = 'rs3' | 'osrs';

export type NavItem =
	| { type: 'link'; mode: string; label: string; href: string }
	| { type: 'dropdown'; label: string; items: { mode: string; label: string; href: string }[] };

const pages = [
	{ id: 'rs3-tasks', mode: 'all', game: 'rs3', label: 'Tasks', href: '/rs3/tasks', order: 1 },
	{ id: 'rs3-gathering', mode: 'gathering', game: 'rs3', label: 'Gathering', href: '/rs3/gathering', order: 2 },
	{ id: 'rs3-timers', mode: 'timers', game: 'rs3', label: 'Timers', href: '/rs3/timers', order: 3 },
	{ id: 'osrs-tasks', mode: 'all', game: 'osrs', label: 'Tasks', href: '/osrs/tasks', order: 1 },
] as const;

export function getTrackerPrimaryNavItems(game: string | null = 'rs3'): NavItem[] {
	return pages
		.filter((page) => page.game === (game === 'osrs' ? 'osrs' : 'rs3'))
		.sort((a, b) => a.order - b.order)
		.map((page) => ({ type: 'link', mode: page.mode, label: page.label, href: page.href }));
}

export function getTrackerPageModeDefinitions() { return [...pages]; }
export function getActivePages(game: string | null = null) { return game ? pages.filter((page) => page.game === game) : [...pages]; }
export function getDefaultTrackerPageMode(game: string | null = 'rs3') { return getActivePages(game)[0]?.mode || 'all'; }
