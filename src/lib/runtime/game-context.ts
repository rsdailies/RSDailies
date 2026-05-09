import {
	load,
	remove,
	save,
} from '../shared/storage/storage-service.ts';

export const GAMES = Object.freeze({ RS3: 'rs3', OSRS: 'osrs' });

const GAME_KEY = 'selectedGame';
let selectedGame: string | null = null;
let isInitialized = false;
const listeners = new Set<(game: string | null) => void>();

function ensureInitialized() {
	if (isInitialized) return;

	const storedGame = load<string | null>(GAME_KEY, null);
	selectedGame = storedGame === GAMES.OSRS || storedGame === GAMES.RS3 ? storedGame : null;
	isInitialized = true;
}

export function getSelectedGame() {
	ensureInitialized();
	return selectedGame;
}

export function hasSelectedGame() {
	return getSelectedGame() !== null;
}

export function setSelectedGame(game: string | null) {
	selectedGame = game === GAMES.OSRS || game === GAMES.RS3 ? game : null;

	if (selectedGame === null) {
		remove(GAME_KEY);
	} else {
		save(GAME_KEY, selectedGame);
	}

	listeners.forEach((listener) => listener(selectedGame));
	return selectedGame;
}

export function subscribeToGameChanges(listener: (game: string | null) => void) {
	listeners.add(listener);
	return () => listeners.delete(listener);
}

export function isRs3Selected() {
	return getSelectedGame() === GAMES.RS3;
}
