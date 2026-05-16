import { nextWeeklyBoundary } from '@shared/time/boundaries';
import { tracker } from '../../../stores/tracker.svelte';

const PENGUIN_CACHE_KEY = 'penguinWeeklyData';
const PENGUIN_META_KEY = 'penguinWeeklyDataMeta';
const PENGUIN_REFRESH_MS = 3 * 60 * 60 * 1000;

let activePenguinSync: Promise<boolean> | null = null;

function sanitizeText(value: unknown) {
	return String(value || '')
		.replace(/\s+/g, ' ')
		.trim();
}

function buildPenguinNote(entry: any) {
	const parts = [];

	if (entry.points) parts.push(`${entry.points}-point`);
	if (entry.disguise) parts.push(entry.disguise);
	if (entry.last_location) parts.push(`Last seen: ${sanitizeText(entry.last_location)}`);
	if (entry.confined_to) parts.push(`Area: ${sanitizeText(entry.confined_to)}`);
	if (entry.warning) parts.push(`Warning: ${sanitizeText(entry.warning)}`);
	if (entry.requirements) parts.push(`Req: ${sanitizeText(entry.requirements)}`);

	return parts.join(' | ');
}

function buildPolarBearNote(entry: any) {
	const parts = [];

	if (entry.name) parts.push(sanitizeText(entry.name));
	if (entry.location) parts.push(`Location: ${sanitizeText(entry.location)}`);

	return parts.join(' | ');
}

function getCurrentWeekKey(now = new Date()) {
	return nextWeeklyBoundary(now).toISOString();
}

function buildPenguinApiUrl() {
	const configuredUrl = String(import.meta.env.PUBLIC_PENGUIN_API_URL || '').trim();
	return configuredUrl || null;
}

export function isPenguinSyncEnabled() {
	return !!buildPenguinApiUrl();
}

export function parsePenguinActives(payload: any) {
	const penguins = Array.isArray(payload?.Activepenguin) ? [...payload.Activepenguin] : [];
	const bear = Array.isArray(payload?.Bear) ? payload.Bear.find((entry: any) => String(entry?.active) === '1') : null;

	penguins.sort((left: any, right: any) => {
		const leftWeight = Number(left?.weight) || Number.MAX_SAFE_INTEGER;
		const rightWeight = Number(right?.weight) || Number.MAX_SAFE_INTEGER;
		return leftWeight - rightWeight;
	});

	const parsed: Record<string, { name: string; note: string }> = {};

	penguins.slice(0, 12).forEach((entry: any, index: number) => {
		parsed[`penguin-${index + 1}`] = {
			name: sanitizeText(entry?.name) || `Penguin ${index + 1}`,
			note: buildPenguinNote(entry),
		};
	});

	if (bear) {
		parsed['penguin-polar-bear'] = {
			name: 'Polar Bear',
			note: buildPolarBearNote(bear),
		};
	}

	return parsed;
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
