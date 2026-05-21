import { TRACKER_PAGES } from '@entities/task/page-definitions';
import type { TrackerPage } from '@entities/task/types';

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

const pageAliases: Record<string, readonly string[]> = {
	'rs3-tasks': ['tasks', 'all', 'daily', 'weekly', 'monthly'],
	'rs3-gathering': ['gathering'],
	'rs3-timers': ['timers'],
	'osrs-tasks': ['tasks', 'all', 'daily', 'weekly', 'monthly'],
};

function getPageMode(page: TrackerPage) {
	if (page.id.endsWith('tasks')) return 'all';
	if (page.id.endsWith('gathering')) return 'gathering';
	if (page.id.endsWith('timers')) return 'timers';
	return page.id;
}

const pages: CompatPage[] = (TRACKER_PAGES as TrackerPage[]).map((page) => ({
	id: page.id,
	mode: getPageMode(page),
	game: page.game,
	label: page.navLabel || page.title || page.id,
	buttonLabel: page.navLabel || page.title || page.id,
	navLabel: page.navLabel || page.title || page.id,
	title: page.title,
	href: page.route,
	order: page.displayOrder,
	aliases: pageAliases[page.id] || [],
	sections: page.sections,
}));

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
