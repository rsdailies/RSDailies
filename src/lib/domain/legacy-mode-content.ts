import { TRACKER_PAGES, TRACKER_SECTIONS } from './static-content.ts';
import { resolvePenguinTask } from './resolvers/penguin.ts';

type Game = 'rs3' | 'osrs';
type CompatPage = {
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

const sectionById = new Map(TRACKER_SECTIONS.map((section) => [section.id, section]));

function requireSection(sectionId: string) {
	const section = sectionById.get(sectionId);
	if (!section) {
		throw new Error(`Missing tracker section "${sectionId}" in migrated content registry.`);
	}
	return section;
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
		sections: [requireSection('rs3daily'), requireSection('rs3weekly'), requireSection('rs3monthly')],
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
		sections: [requireSection('timers')],
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
		sections: [requireSection('rs3daily')],
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
		sections: [requireSection('gathering')],
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
		sections: [requireSection('rs3weekly')],
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
		sections: [requireSection('rs3monthly')],
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
		sections: [requireSection('osrsdaily'), requireSection('osrsweekly'), requireSection('osrsmonthly')],
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
		sections: [requireSection('osrsdaily')],
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
		sections: [requireSection('osrsweekly')],
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
		sections: [requireSection('osrsmonthly')],
	},
].sort(sortByDisplayOrder);

const compatPageById = new Map(compatPages.map((page) => [page.id, page]));

function getActivePages(game: string | null = null) {
	if (!game) {
		return compatPages;
	}
	return compatPages.filter((page) => page.game === game);
}

function createAliasLookup(pages: CompatPage[]) {
	const lookup = new Map<string, string>();
	for (const page of pages) {
		lookup.set(page.id, page.id);
		for (const alias of page.aliases || []) {
			lookup.set(alias, page.id);
		}
	}
	return lookup;
}

const aliasLookup = createAliasLookup(compatPages);
const aliasLookupByGame = new Map<Game, Map<string, string>>([
	['rs3', createAliasLookup(getActivePages('rs3'))],
	['osrs', createAliasLookup(getActivePages('osrs'))],
]);

function normalizeTimerEntry(timer: any, group: any, index: number) {
	const timerId = timer?.id || `${group.id}-timer-${index}`;

	return {
		...timer,
		id: timerId,
		isTimerParent: true,
		vanishOnStart: timer?.vanishOnStart ?? true,
		plots: Array.isArray(timer?.plots) ? timer.plots : [],
	};
}

function normalizeStandalonePlots(group: any) {
	if (!Array.isArray(group?.plots) || group.plots.length === 0) {
		return [];
	}

	if (Array.isArray(group?.timers) && group.timers.length > 0) {
		return [];
	}

	return [
		{
			id: `${group.id}-plots`,
			name: group.label || group.name || group.id,
			isTimer: false,
			tasks: group.plots.map((plot: any) => ({
				...plot,
				id: plot.id,
			})),
		},
	];
}

function resolveTimerGroups(groups: any[]) {
	return Array.isArray(groups)
		? groups.map((group) => {
				const timerSubgroups = Array.isArray(group?.timers)
					? group.timers.map((timer: any, index: number) => {
							const timerTask = normalizeTimerEntry(timer, group, index);
							const plots = Array.isArray(timer?.plots)
								? timer.plots
								: Array.isArray(group?.plots)
									? group.plots
									: [];

							return {
								id: timerTask.id,
								name: timerTask.name || group.label || group.name || group.id,
								isTimer: true,
								timerTask,
								plots: plots.map((plot: any) => ({
									...plot,
									id: plot.id,
								})),
							};
					  })
					: [];

				return {
					id: group.id,
					name: group.label || group.name || group.id,
					note: group.note || '',
					subgroups: [...timerSubgroups, ...normalizeStandalonePlots(group)],
				};
		  })
		: [];
}

function resolveSectionItems(section: any, options: { getCustomTasks?: () => any[]; getPenguinWeeklyData?: () => Record<string, any> }) {
	if (section.id === 'custom') {
		return typeof options.getCustomTasks === 'function' ? options.getCustomTasks() : [];
	}

	if (Array.isArray(section.groups) && section.groups.length > 0) {
		return resolveTimerGroups(section.groups);
	}

	if (section.id !== 'rs3weekly') {
		return Array.isArray(section.items) ? section.items : [];
	}

	return (section.items || []).map((task: any) =>
		resolvePenguinTask(task, typeof options.getPenguinWeeklyData === 'function' ? options.getPenguinWeeklyData() : {})
	);
}

function flattenTaskIds(tasks: any[] = []) {
	return tasks.flatMap((task) => {
		const childRows = Array.isArray(task.childRows) ? task.childRows.map((child: any) => child.id) : [];
		const children = Array.isArray(task.children) ? task.children.map((child: any) => child.id) : [];
		return [task.id, ...childRows, ...children].filter(Boolean);
	});
}

function flattenGroupTaskIds(sectionId: string, groups: any[] = []) {
	return groups.flatMap((group) => {
		const timers = Array.isArray(group.timers) ? group.timers : [];
		const plots = Array.isArray(group.plots) ? group.plots : [];
		const timerChildIds = timers.flatMap((timer: any) =>
			plots.map((plot: any) => `${sectionId}::${timer.id}::${plot.id}`)
		);
		const plotIdsWithoutTimers = timers.length === 0 ? plots.map((plot: any) => plot.id) : [];
		return [...timerChildIds, ...plotIdsWithoutTimers].filter(Boolean);
	});
}

export function getContentPages() {
	return compatPages;
}

export function getTrackerSectionDefinitions() {
	return TRACKER_SECTIONS;
}

export function getTrackerSections(game: string | null = null) {
	return game ? TRACKER_SECTIONS.filter((section) => section.game === game) : TRACKER_SECTIONS;
}

export function getTrackerSection(sectionId: string) {
	return sectionById.get(sectionId) || null;
}

export const getContentSectionDefinition = getTrackerSection;

export function getTrackerSectionIds(game: string | null = null) {
	return getTrackerSections(game).map((section) => section.id);
}

export function getTrackerSectionIdMaps() {
	return getTrackerSections().reduce(
		(maps, section) => {
			maps.containerIds[section.id] = section.containerId;
			maps.tableIds[section.id] = section.tableId;
			return maps;
		},
		{ containerIds: {} as Record<string, string>, tableIds: {} as Record<string, string> }
	);
}

export function getTrackerPageModeDefinitions() {
	return compatPages;
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

export function isTrackerPageMode(modeId: string, game: string | null = null) {
	return !!getTrackerPage(modeId, game);
}

export function getDefaultTrackerPageMode(game: string | null = null) {
	const pages = getActivePages(game);
	const defaultMode = pages.find((page) => page.includeInPrimaryNav) || pages[0] || null;
	return defaultMode?.id || null;
}

export function normalizeTrackerPageMode(modeId: string, fallback: string | null = null, game: string | null = null) {
	const lookup = game ? aliasLookupByGame.get(game as Game) || new Map<string, string>() : aliasLookup;
	const resolvedFallback = fallback || getDefaultTrackerPageMode(game) || 'overview';
	if (typeof modeId !== 'string') {
		return resolvedFallback;
	}
	return lookup.get(modeId) || resolvedFallback;
}

export function resolveTrackerSections(options: {
	game?: string | null;
	getCustomTasks?: () => any[];
	getPenguinWeeklyData?: () => Record<string, any>;
} = {}) {
	const { game = null } = options;

	return getTrackerSections(game).reduce((sections, section) => {
		sections[section.id] = resolveSectionItems(section, options);
		return sections;
	}, {} as Record<string, any>);
}

export function resolveTrackerPage(
	pageId: string,
	options: {
		game?: string | null;
		getCustomTasks?: () => any[];
		getPenguinWeeklyData?: () => Record<string, any>;
	} = {}
) {
	const page = getTrackerPage(pageId, options.game || null);
	if (!page) {
		return null;
	}

	return {
		...page,
		sections: (page.sections || []).map((section) => ({
			...section,
			resolvedItems: resolveSectionItems(section, options),
		})),
	};
}

export function getContentSectionTaskIds(sectionId: string, options: { customTasks?: any[] } = {}) {
	if (sectionId === 'custom') {
		return (options.customTasks || []).map((task: any) => task.id).filter(Boolean);
	}

	const section = getTrackerSection(sectionId);
	if (!section) return [];

	if (Array.isArray(section.items) && section.items.length > 0) {
		return flattenTaskIds(section.items);
	}

	if (Array.isArray(section.groups) && section.groups.length > 0) {
		return flattenGroupTaskIds(sectionId, section.groups);
	}

	return [];
}

export function getContentSectionTaskIdsByCadence(sectionId: string, cadence: string) {
	const section = getTrackerSection(sectionId);
	if (!section || !Array.isArray(section.items)) {
		return [];
	}

	const normalizedCadence = String(cadence || '').toLowerCase();
	return section.items
		.filter((task: any) => String(task?.reset || 'daily').toLowerCase() === normalizedCadence)
		.map((task: any) => task.id)
		.filter(Boolean);
}

export function validateContentPages(pages: typeof TRACKER_PAGES) {
	return pages;
}
