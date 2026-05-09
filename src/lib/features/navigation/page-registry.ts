import { requireTrackerSection } from '../sections/section-registry.ts';

export type Game = 'rs3' | 'osrs';
export type CompatPage = {
	id: string;
	title: string;
	game: Game;
	displayOrder: number;
	route: string;
	aliases: string[];
	buttonLabel?: string;
	navLabel?: string;
	menuGroup?: string;
	includeInViewsPanel?: boolean;
	includeInPrimaryNav?: boolean;
	primaryNavDropdownLabel?: string;
	primaryNavItemLabel?: string;
	sections: any[];
};

function sortByDisplayOrder<T extends { displayOrder?: number; id?: string }>(left: T, right: T) {
	const leftOrder = Number.isFinite(left?.displayOrder) ? Number(left.displayOrder) : Number.MAX_SAFE_INTEGER;
	const rightOrder = Number.isFinite(right?.displayOrder) ? Number(right.displayOrder) : Number.MAX_SAFE_INTEGER;
	if (leftOrder !== rightOrder) {
		return leftOrder - rightOrder;
	}

	return String(left?.id || '').localeCompare(String(right?.id || ''));
}

const compatPages: CompatPage[] = [
	{
		id: 'overview',
		title: 'Overview',
		game: 'rs3',
		displayOrder: 0,
		route: '/rs3/overview',
		aliases: ['overview', 'rs3-overview'],
		buttonLabel: 'Overview',
		navLabel: 'Overview',
		menuGroup: 'Home',
		includeInViewsPanel: true,
		includeInPrimaryNav: false,
		sections: [],
	},
	{
		id: 'all',
		title: 'Tasks',
		game: 'rs3',
		displayOrder: 1,
		route: '/rs3/tasks',
		aliases: ['all'],
		buttonLabel: 'Tasks',
		navLabel: 'Tasks',
		menuGroup: 'Tasks',
		includeInViewsPanel: true,
		includeInPrimaryNav: true,
		sections: [requireTrackerSection('rs3daily'), requireTrackerSection('rs3weekly'), requireTrackerSection('rs3monthly')],
	},
	{
		id: 'timers',
		title: 'Timers',
		game: 'rs3',
		displayOrder: 3,
		route: '/rs3/timers',
		aliases: ['timers', 'rs3timers', 'farming', 'rs3farming'],
		buttonLabel: 'Timers',
		navLabel: 'Timers',
		menuGroup: 'Timers',
		includeInViewsPanel: true,
		includeInPrimaryNav: true,
		primaryNavDropdownLabel: 'Timers',
		primaryNavItemLabel: 'Farming',
		sections: [requireTrackerSection('timers')],
	},
	{
		id: 'rs3daily',
		title: 'Dailies',
		game: 'rs3',
		displayOrder: 4,
		route: '/rs3/tasks?view=daily',
		aliases: ['daily', 'dailies', 'rs3daily'],
		navLabel: 'Dailies',
		menuGroup: 'Tasks',
		includeInViewsPanel: true,
		includeInPrimaryNav: false,
		sections: [requireTrackerSection('rs3daily')],
	},
	{
		id: 'gathering',
		title: 'Gathering',
		game: 'rs3',
		displayOrder: 5,
		route: '/rs3/gathering',
		aliases: ['gathering'],
		navLabel: 'Gathering',
		menuGroup: 'Gathering',
		includeInViewsPanel: true,
		includeInPrimaryNav: true,
		sections: [requireTrackerSection('gathering')],
	},
	{
		id: 'rs3weekly',
		title: 'Weeklies',
		game: 'rs3',
		displayOrder: 6,
		route: '/rs3/tasks?view=weekly',
		aliases: ['weekly', 'weeklies', 'rs3weekly'],
		navLabel: 'Weeklies',
		menuGroup: 'Tasks',
		includeInViewsPanel: true,
		includeInPrimaryNav: false,
		sections: [requireTrackerSection('rs3weekly')],
	},
	{
		id: 'rs3monthly',
		title: 'Monthlies',
		game: 'rs3',
		displayOrder: 7,
		route: '/rs3/tasks?view=monthly',
		aliases: ['monthly', 'monthlies', 'rs3monthly'],
		navLabel: 'Monthlies',
		menuGroup: 'Tasks',
		includeInViewsPanel: true,
		includeInPrimaryNav: false,
		sections: [requireTrackerSection('rs3monthly')],
	},
	{
		id: 'osrs-overview',
		title: 'OSRS Overview',
		game: 'osrs',
		displayOrder: 100,
		route: '/osrs/overview',
		aliases: ['osrs-overview'],
		buttonLabel: 'OSRS',
		navLabel: 'Old School RuneScape',
		menuGroup: 'OSRS',
		includeInViewsPanel: false,
		includeInPrimaryNav: false,
		sections: [],
	},
	{
		id: 'osrsall',
		title: 'Tasks',
		game: 'osrs',
		displayOrder: 101,
		route: '/osrs/tasks',
		aliases: ['osrs', 'all', 'tasks', 'osrsall'],
		buttonLabel: 'Tasks',
		navLabel: 'Tasks',
		menuGroup: 'Tasks',
		includeInViewsPanel: true,
		includeInPrimaryNav: true,
		sections: [requireTrackerSection('osrsdaily'), requireTrackerSection('osrsweekly'), requireTrackerSection('osrsmonthly')],
	},
	{
		id: 'osrsdaily',
		title: 'Dailies',
		game: 'osrs',
		displayOrder: 102,
		route: '/osrs/tasks?view=daily',
		aliases: ['daily', 'dailies', 'osrsdaily'],
		navLabel: 'Dailies',
		menuGroup: 'Tasks',
		includeInViewsPanel: true,
		includeInPrimaryNav: false,
		sections: [requireTrackerSection('osrsdaily')],
	},
	{
		id: 'osrsweekly',
		title: 'Weeklies',
		game: 'osrs',
		displayOrder: 103,
		route: '/osrs/tasks?view=weekly',
		aliases: ['weekly', 'weeklies', 'osrsweekly'],
		navLabel: 'Weeklies',
		menuGroup: 'Tasks',
		includeInViewsPanel: true,
		includeInPrimaryNav: false,
		sections: [requireTrackerSection('osrsweekly')],
	},
	{
		id: 'osrsmonthly',
		title: 'Monthlies',
		game: 'osrs',
		displayOrder: 104,
		route: '/osrs/tasks?view=monthly',
		aliases: ['monthly', 'monthlies', 'osrsmonthly'],
		navLabel: 'Monthlies',
		menuGroup: 'Tasks',
		includeInViewsPanel: true,
		includeInPrimaryNav: false,
		sections: [requireTrackerSection('osrsmonthly')],
	},
].sort(sortByDisplayOrder);

const compatPageById = new Map(compatPages.map((page) => [page.id, page]));

export function getContentPages() {
	return compatPages;
}

export function getTrackerPageModeDefinitions() {
	return compatPages;
}

export function getActivePages(game: string | null = null) {
	if (!game) {
		return compatPages;
	}
	return compatPages.filter((page) => page.game === game);
}

export function getTrackerViews(game: string | null = null) {
	return getActivePages(game).map((page) => ({
		mode: page.id,
		label: page.title,
	}));
}

export function getTrackerViewsPanelGroups(game: string | null = null) {
	const grouped = getActivePages(game)
		.filter((page) => page.includeInViewsPanel)
		.reduce((groups, page) => {
			const heading = page.menuGroup || 'Views';
			if (!groups.has(heading)) {
				groups.set(heading, []);
			}
			groups.get(heading).push({ mode: page.id, label: page.navLabel || page.title });
			return groups;
		}, new Map<string, { mode: string; label: string }[]>());

	return Array.from(grouped.entries()).map(([heading, items]) => ({ heading, items }));
}

export function getTrackerPrimaryNavItems(game: string | null = null) {
	const dropdowns = new Map<string, any>();
	const items: any[] = [];

	getActivePages(game)
		.filter((page) => page.includeInPrimaryNav)
		.forEach((page) => {
			const dropdownLabel = String(page.primaryNavDropdownLabel || '').trim();
			const itemLabel = String(page.primaryNavItemLabel || page.navLabel || page.title).trim();

			if (!dropdownLabel) {
				items.push({ type: 'link', mode: page.id, label: page.navLabel || page.title });
				return;
			}

			if (!dropdowns.has(dropdownLabel)) {
				dropdowns.set(dropdownLabel, { type: 'dropdown', label: dropdownLabel, items: [] });
				items.push(dropdowns.get(dropdownLabel));
			}

			dropdowns.get(dropdownLabel).items.push({ mode: page.id, label: itemLabel });
		});

	return items;
}

export function getTrackerPageModes(game: string | null = null) {
	return getActivePages(game).map((page) => page.id);
}

export function getTrackerPage(pageId: string, game: string | null = null) {
	const page = compatPageById.get(pageId) || null;
	if (!page) return null;
	return game && page.game !== game ? null : page;
}

export const getTrackerPageMode = getTrackerPage;

export function getTrackerPageSectionIds(pageId: string, game: string | null = null) {
	const page = getTrackerPage(pageId, game);
	if (!page) return [];
	return (page.sections || []).map((section) => section.id);
}

export function getDefaultTrackerPageMode(game: string | null = null) {
	const pages = getActivePages(game);
	const defaultMode = pages.find((page) => page.includeInPrimaryNav) || pages[0] || null;
	return defaultMode?.id || null;
}
