import { load, save, removeKey } from '../storage/storage-service.js';

/**
 * Game Context
 * 
 * Manages the selected game state (RS3 vs OSRS).
 * Persisted per-profile using StorageService.
 */

export const GAMES = Object.freeze({ RS3: 'rs3', OSRS: 'osrs' });

const GAME_KEY = 'selectedGame';
let selectedGame = null;
let isInitialized = false;
const listeners = new Set();

function ensureInitialized() {
  if (isInitialized) return;
  const storedGame = load(GAME_KEY, null);
  selectedGame = (storedGame === GAMES.OSRS || storedGame === GAMES.RS3) ? storedGame : null;
  isInitialized = true;
}

export function getSelectedGame() {
  ensureInitialized();
  return selectedGame;
}

export function hasSelectedGame() {
  return getSelectedGame() !== null;
}

export function setSelectedGame(game) {
  selectedGame = (game === GAMES.OSRS || game === GAMES.RS3) ? game : null;
  
  if (selectedGame === null) {
    removeKey(GAME_KEY);
  } else {
    save(GAME_KEY, selectedGame);
  }
  
  listeners.forEach((listener) => listener(selectedGame));
  return selectedGame;
}

export function subscribeToGameChanges(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function isRs3Selected() {
  return getSelectedGame() === GAMES.RS3;
}
