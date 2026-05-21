import { load, save } from '@shared/storage/storage-service';

const PENGUIN_CACHE_KEY = 'penguinWeeklyData_v3';
const PENGUIN_REFRESH_MS = 1000 * 60;

type PenguinMap = Record<
	string,
	{
		name: string;
		note: string;
		points?: string;
		disguise?: string;
		location?: string;
		area?: string;
		warning?: string;
		req?: string;
	}
>;

class PenguinStoreFacade {
	data = $state<PenguinMap>({});
	isLoading = $state(false);

	private lastLoadedAt = 0;
	private activeRefresh: Promise<PenguinMap> | null = null;

	constructor() {
		if (typeof window === 'undefined') return;
		this.data = load(PENGUIN_CACHE_KEY, {});
		void this.refreshIfStale();
	}

	getLiveTask(taskId: string) {
		return this.data[taskId] || null;
	}

	getLiveName(taskId: string, initialName: string) {
		return this.data[taskId]?.name || initialName;
	}

	getLiveNote(taskId: string, initialNote: string) {
		return this.data[taskId]?.note || initialNote;
	}

	setData(nextData: PenguinMap) {
		this.data = nextData;
		this.lastLoadedAt = Date.now();
		if (typeof window !== 'undefined') {
			save(PENGUIN_CACHE_KEY, nextData);
		}
	}

	refreshIfStale(force = false) {
		if (typeof window === 'undefined') return Promise.resolve(this.data);
		if (!force && this.activeRefresh) return this.activeRefresh;

		const configuredUrl = String(import.meta.env.PUBLIC_PENGUIN_API_URL || '').trim();
		if (!configuredUrl) {
			return Promise.resolve(this.data);
		}

		const hasCachedData = Object.keys(this.data).length > 0;
		const isFresh = Date.now() - this.lastLoadedAt < PENGUIN_REFRESH_MS;

		if (!force && hasCachedData && isFresh) {
			return Promise.resolve(this.data);
		}

		this.isLoading = true;
		this.activeRefresh = (async () => {
			try {
				const response = await fetch(configuredUrl, {
					headers: { Accept: 'application/json' },
					cache: 'no-store',
				});
				if (!response.ok) return this.data;

				const payload = await response.json();
				const { parsePenguinActives } = await import('../penguin-parser');
				const parsed = parsePenguinActives(payload);
				if (Object.keys(parsed).length > 0) {
					this.setData(parsed);
				}
				return this.data;
			} catch {
				return this.data;
			} finally {
				this.isLoading = false;
				this.activeRefresh = null;
			}
		})();

		return this.activeRefresh;
	}
}

export const penguinStore = new PenguinStoreFacade();

export function usePenguinStore() {
	void penguinStore.refreshIfStale();
	return penguinStore;
}
