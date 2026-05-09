import { getActivePages, getDefaultTrackerPageMode, getTrackerPage, type CompatPage, type Game } from './page-registry.ts';

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

const aliasLookup = createAliasLookup(getActivePages());
const aliasLookupByGame = new Map<Game, Map<string, string>>([
	['rs3', createAliasLookup(getActivePages('rs3'))],
	['osrs', createAliasLookup(getActivePages('osrs'))],
]);

export function isTrackerPageMode(modeId: string, game: string | null = null) {
	return !!getTrackerPage(modeId, game);
}

export function normalizeTrackerPageMode(modeId: string, fallback: string | null = null, game: string | null = null) {
	const lookup = game ? aliasLookupByGame.get(game as Game) || new Map<string, string>() : aliasLookup;
	const resolvedFallback = fallback || getDefaultTrackerPageMode(game) || 'overview';
	if (typeof modeId !== 'string') {
		return resolvedFallback;
	}
	return lookup.get(modeId) || resolvedFallback;
}
