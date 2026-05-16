import { resolvePenguinTask } from './resolvers/penguin.ts';
import type { TrackerView, TrackerTask, TrackerSection, TrackerPage } from './types.ts';

const PAGE_ALIASES: Record<string, string> = {
	rs3tasks: 'rs3-tasks',
	rs3gathering: 'rs3-gathering',
	rs3timers: 'rs3-timers',
	osrstasks: 'osrs-tasks',
	all: 'rs3-tasks',
	gathering: 'rs3-gathering',
	timers: 'rs3-timers',
	osrsall: 'osrs-tasks',
};

function normalizePageId(value: string | null | undefined) {
	const raw = String(value || '').trim().toLowerCase();
	return PAGE_ALIASES[raw] || raw;
}

function sortByDisplayOrder<T extends { displayOrder?: number; id?: string }>(left: T, right: T) {
	const a = Number.isFinite(left?.displayOrder) ? Number(left.displayOrder) : Number.MAX_SAFE_INTEGER;
	const b = Number.isFinite(right?.displayOrder) ? Number(right.displayOrder) : Number.MAX_SAFE_INTEGER;
	return a === b ? String(left?.id || '').localeCompare(String(right?.id || '')) : a - b;
}

function cloneSection<T>(section: T): T { return JSON.parse(JSON.stringify(section)); }
function filterTaskItems(items: TrackerTask[] = [], cadence: string, weeklyData: Record<string, any>) {
	return items.map((item) => resolvePenguinTask(item, weeklyData)).filter((item) => cadence === 'all' || String(item.reset || '').toLowerCase() === cadence);
}

export function getTrackerPage(game: string, pageId: string, pages: TrackerPage[]) {
	const normalizedGame = game === 'osrs' ? 'osrs' : 'rs3';
	const normalizedPageId = normalizePageId(pageId);
	return pages.find((page) => page.game === normalizedGame && (normalizePageId(page.id) === normalizedPageId || page.route.endsWith(`/${pageId}`))) || null;
}

export function normalizeTrackerView(page: TrackerPage, requestedView: string | null | undefined) {
	if (!page.availableViews.length) return '';
	const requested = String(requestedView || '').trim().toLowerCase();
	const fallback = page.availableViews[0]?.id || '';
	return page.availableViews.some((view) => view.id === requested) ? requested : fallback;
}

export function getTrackerSectionsForPage(game: string, pageId: string, view: string | null | undefined, pages: TrackerPage[], sections: TrackerSection[], options: { weeklyData?: Record<string, any> } = {}) {
	const page = getTrackerPage(game, pageId, pages);
	if (!page) return [];
	const requestedView = normalizeTrackerView(page, view);
	const gameSections = sections.filter((section) => page.sections.includes(section.id) && section.game === page.game).sort(sortByDisplayOrder).map(cloneSection);
	if (!requestedView) return gameSections;
	if (page.id.endsWith('tasks')) {
		if (requestedView === 'all') return gameSections.map((section) => ({ ...section, items: filterTaskItems(section.items || [], 'all', options.weeklyData || {}) }));
		return gameSections.filter((section) => String(section.resetFrequency || '').toLowerCase() === requestedView).map((section) => ({ ...section, items: filterTaskItems(section.items || [], requestedView, options.weeklyData || {}) }));
	}
	if (page.id.endsWith('gathering')) return gameSections.map((section) => ({ ...section, items: filterTaskItems(section.items || [], requestedView, options.weeklyData || {}) }));
	return gameSections;
}
