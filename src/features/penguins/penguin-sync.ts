import { tracker } from '@features/tracker/stores/tracker.svelte';
import { nextWeeklyBoundary } from '@shared/time/boundaries';
import { parsePenguinActives } from './penguin-parser';
import { penguinStore } from './stores/penguin.svelte';

const PENGUIN_CACHE_KEY = 'penguinWeeklyData_v3';
const PENGUIN_META_KEY = 'penguinWeeklyDataMeta_v3';
const PENGUIN_REFRESH_MS = 60000; // Refresh every minute

let activePenguinSync: Promise<boolean> | null = null;

function getCurrentWeekKey(now = new Date()) {
	return nextWeeklyBoundary(now).toISOString();
}

function buildPenguinApiUrl() {
	const configuredUrl = String(import.meta.env.PUBLIC_PENGUIN_API_URL || '').trim();
	return configuredUrl || '/api/penguins';
}

export function isPenguinSyncEnabled() {
	return !!buildPenguinApiUrl();
}

function shouldSyncPenguins(load?: <T = any>(key: string, fallback?: T) => T) {
	const meta = load?.(PENGUIN_META_KEY, {}) || {};
	const weekKey = getCurrentWeekKey();
	const hasCurrentCache = Object.keys(load?.(PENGUIN_CACHE_KEY, {}) || {}).length > 0;

	if ((meta as any).weekKey !== weekKey) return true;
	if (!hasCurrentCache) return true;
	if (!(meta as any).syncedAt) return true;

	return Date.now() - (meta as any).syncedAt >= PENGUIN_REFRESH_MS;
}

export async function syncPenguinWeeklyData({
	load,
	save,
	fetchImpl = window.fetch.bind(window),
}: {
	load?: <T = any>(key: string, fallback?: T) => T;
	save?: (key: string, value: any) => void;
	fetchImpl?: typeof fetch;
}) {
	if (activePenguinSync) return activePenguinSync;
	if (!shouldSyncPenguins(load)) return false;

	activePenguinSync = (async () => {
		const weekKey = getCurrentWeekKey();
		const meta = load?.(PENGUIN_META_KEY, {}) || {};
		const penguinApiUrl = buildPenguinApiUrl();

		if (!penguinApiUrl) {
			return false;
		}

		try {
			const response = await fetchImpl(penguinApiUrl, {
				headers: { Accept: 'application/json' },
				cache: 'no-store',
			});

			if (!response.ok) {
				throw new Error(`Penguin sync failed with status ${response.status}`);
			}

			const payload = await response.json();
			const parsed = parsePenguinActives(payload);

			if (Object.keys(parsed).length === 0) {
				throw new Error('Penguin sync returned no active rows');
			}

			save?.(PENGUIN_CACHE_KEY, parsed);
			save?.(PENGUIN_META_KEY, {
				...meta,
				weekKey,
				syncedAt: Date.now(),
				lastAttemptAt: Date.now(),
				lastError: '',
			});
			penguinStore.setData(parsed);
			tracker.reloadAll();
			return true;
		} catch (error) {
			save?.(PENGUIN_META_KEY, {
				...meta,
				weekKey,
				lastAttemptAt: Date.now(),
				lastError: String(error),
			});
			return false;
		} finally {
			activePenguinSync = null;
		}
	})();

	return activePenguinSync;
}
