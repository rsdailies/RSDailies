export type Game = 'rs3' | 'osrs';

export type NavItem =
	| { type: 'link'; mode: string; label: string; href: string }
	| { type: 'dropdown'; label: string; items: { mode: string; label: string; href: string }[] };

export type CompatPage = {
	id: string;
	mode: string;
	game: string;
	label: string;
	href: string;
	order: number;
	buttonLabel?: string;
	navLabel?: string;
	title?: string;
	aliases?: readonly string[];
	sections?: readonly string[];
};

const pages: CompatPage[] = [
	{
		id: 'rs3-tasks',
		mode: 'all',
		game: 'rs3',
		label: 'Tasks',
		buttonLabel: 'Tasks',
		navLabel: 'Tasks',
		title: 'Tasks',
		href: '/rs3/tasks',
		order: 1,
		aliases: ['tasks', 'all', 'daily', 'weekly', 'monthly'],
		sections: ['rs3daily', 'rs3weekly', 'rs3monthly'],
	},
	{
		id: 'rs3-gathering',
		mode: 'gathering',
		game: 'rs3',
		label: 'Gathering',
		buttonLabel: 'Gathering',
		navLabel: 'Gathering',
		title: 'Gathering',
		href: '/rs3/gathering',
		order: 2,
		aliases: ['gathering'],
		sections: ['gathering'],
	},
	{
		id: 'rs3-timers',
		mode: 'timers',
		game: 'rs3',
		label: 'Timers',
		buttonLabel: 'Timers',
		navLabel: 'Timers',
		title: 'Timers',
		href: '/rs3/timers',
		order: 3,
		aliases: ['timers'],
		sections: ['timers'],
	},
	{
		id: 'osrs-tasks',
		mode: 'all',
		game: 'osrs',
		label: 'Tasks',
		buttonLabel: 'Tasks',
		navLabel: 'Tasks',
		title: 'Tasks',
		href: '/osrs/tasks',
		order: 1,
		aliases: ['tasks', 'all', 'daily', 'weekly', 'monthly'],
		sections: ['osrsdaily', 'osrsweekly', 'osrsmonthly'],
	},
];

export function getTrackerPrimaryNavItems(game: string | null = 'rs3'): NavItem[] {
	return pages
		.filter((page) => page.game === (game === 'osrs' ? 'osrs' : 'rs3'))
		.sort((a, b) => a.order - b.order)
		.map((page) => ({ type: 'link', mode: page.mode, label: page.label, href: page.href }));
}

export function getTrackerPage(modeOrId: string, game: string | null = null): CompatPage | undefined {
	return pages.find((p) => (p.mode === modeOrId || p.id === modeOrId) && (!game || p.game === game));
}

export function getTrackerPageMode(modeOrId: string, game: string | null = null): CompatPage | undefined {
	return getTrackerPage(modeOrId, game);
}

export function getTrackerPageSectionIds(modeOrId: string, game: string | null = null): string[] {
	const page = getTrackerPage(modeOrId, game);
	return page?.sections ? [...page.sections] : [];
}

export function getTrackerPageModeDefinitions() {
	return [...pages];
}

export function getActivePages(game: string | null = null) {
	return game ? pages.filter((page) => page.game === game) : [...pages];
}

export function getDefaultTrackerPageMode(game: string | null = 'rs3') {
	return getActivePages(game)[0]?.mode || 'all';
}
