import { resolvePenguinTask } from './resolvers/penguin.ts';

type TrackerView = {
	id: string;
	label: string;
};

type TrackerTask = {
	id: string;
	reset?: string;
	children?: TrackerTask[];
	childRows?: TrackerTask[];
};

type TrackerSection = {
	id: string;
	game: 'rs3' | 'osrs';
	displayOrder?: number;
	resetFrequency?: string;
	items?: TrackerTask[];
	sections?: string[];
};

type TrackerPage = {
	id: string;
	game: 'rs3' | 'osrs';
	route: string;
	displayOrder?: number;
	availableViews: TrackerView[];
	sections: string[];
};

function normalizeViewValue(value: string | null | undefined) {
	return String(value || '').trim().toLowerCase();
}

function sortByDisplayOrder<T extends { displayOrder?: number; id?: string }>(left: T, right: T) {
	const leftOrder = Number.isFinite(left?.displayOrder) ? Number(left.displayOrder) : Number.MAX_SAFE_INTEGER;
	const rightOrder = Number.isFinite(right?.displayOrder) ? Number(right.displayOrder) : Number.MAX_SAFE_INTEGER;
	if (leftOrder !== rightOrder) return leftOrder - rightOrder;
	return String(left?.id || '').localeCompare(String(right?.id || ''));
}

function cloneSection<T>(section: T): T {
	return JSON.parse(JSON.stringify(section)) as T;
}

function filterTaskItems(items: TrackerTask[] = [], cadence: string, weeklyData: Record<string, any>) {
	return items
		.map((item) => resolvePenguinTask(item, weeklyData))
		.filter((item) => cadence === 'all' || String(item.reset || '').toLowerCase() === cadence);
}

export function getTrackerPage(game: string, pageId: string, pages: TrackerPage[]) {
	const normalizedGame = game === 'osrs' ? 'osrs' : 'rs3';
	return pages.find((page) => page.game === normalizedGame && (page.id === pageId || page.route.endsWith(`/${pageId}`))) || null;
}

export function normalizeTrackerView(page: TrackerPage, requestedView: string | null | undefined) {
	if (!page.availableViews.length) return '';

	const normalized = normalizeViewValue(requestedView);
	const fallback = page.availableViews[0]?.id || '';
	return page.availableViews.some((view) => view.id === normalized) ? normalized : fallback;
}

export function getTrackerSectionsForPage(
	game: string,
	pageId: string,
	view: string | null | undefined,
	pages: TrackerPage[],
	sections: TrackerSection[],
	options: { weeklyData?: Record<string, any> } = {}
) {
	const page = getTrackerPage(game, pageId, pages);
	if (!page) return [];

	const requestedView = normalizeTrackerView(page, view);
	const gameSections = sections
		.filter((section) => page.sections.includes(section.id) && section.game === page.game)
		.sort(sortByDisplayOrder)
		.map(cloneSection);

	if (!requestedView) {
		return gameSections;
	}

	if (page.id.endsWith('tasks')) {
		if (requestedView === 'all') {
			return gameSections.map((section) => ({
				...section,
				items: filterTaskItems(section.items || [], 'all', options.weeklyData || {}),
			}));
		}

		return gameSections
			.filter((section) => String(section.resetFrequency || '').toLowerCase() === requestedView)
			.map((section) => ({
				...section,
				items: filterTaskItems(section.items || [], requestedView, options.weeklyData || {}),
			}));
	}

	if (page.id.endsWith('gathering')) {
		return gameSections.map((section) => ({
			...section,
			items: filterTaskItems(section.items || [], requestedView, options.weeklyData || {}),
		}));
	}

	return gameSections;
}
