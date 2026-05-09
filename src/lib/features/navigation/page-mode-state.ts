import { load, save } from '../../shared/storage/storage-service.ts';
import { getDefaultTrackerPageMode, getTrackerPageMode } from './page-registry.ts';
import { isTrackerPageMode, normalizeTrackerPageMode } from './page-aliases.ts';
import { GAMES, getSelectedGame } from '../../runtime/game-context.ts';

function getActiveGame(game = getSelectedGame()) {
	return game === GAMES.OSRS ? GAMES.OSRS : GAMES.RS3;
}

function getGamePageModeKey(game: string) {
	return `pageMode:${game}`;
}

export function getPageModeLabel(mode: string, game = getActiveGame()) {
	const activeGame = getActiveGame(game);
	const modeDef =
		getTrackerPageMode(mode, activeGame) || getTrackerPageMode(getDefaultTrackerPageMode(activeGame), activeGame);
	return modeDef?.buttonLabel || modeDef?.label || 'Overview';
}

export function syncStoredViewModeToPageMode(game = getActiveGame()) {
	const activeGame = getActiveGame(game);
	const key = getGamePageModeKey(activeGame);
	const current = load<string | null>(key, null);

	if (typeof current === 'string' && isTrackerPageMode(current, activeGame)) {
		return current;
	}

	let sourceMode: string | null = null;
	if (activeGame === GAMES.RS3) {
		sourceMode = load<string | null>('pageMode', null) || load<string | null>('viewMode', null);
	}

	const migrated = normalizeTrackerPageMode(sourceMode as string, null, activeGame);
	save(key, migrated);

	if (activeGame === GAMES.RS3) {
		save('pageMode', migrated);
	}

	return migrated;
}

export function getPageMode(game = getActiveGame()) {
	const activeGame = getActiveGame(game);
	const mode = load<string | null>(getGamePageModeKey(activeGame), null);

	if (typeof mode === 'string' && isTrackerPageMode(mode, activeGame)) {
		return mode;
	}

	return syncStoredViewModeToPageMode(activeGame);
}

export function setPageMode(mode: string, game = getActiveGame()) {
	const activeGame = getActiveGame(game);
	const normalized = normalizeTrackerPageMode(mode, null, activeGame);

	save(getGamePageModeKey(activeGame), normalized);

	if (activeGame === GAMES.RS3) {
		save('pageMode', normalized);
	}

	try {
		document.dispatchEvent(new CustomEvent('page-mode-sync', { detail: { mode: normalized, game: activeGame } }));
	} catch {
		// noop
	}

	return normalized;
}
