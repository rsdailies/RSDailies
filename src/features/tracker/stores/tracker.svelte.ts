import { load, save, listCurrentProfileEntries, getActiveProfile } from '@shared/storage/storage-service';
import { StorageKeyBuilder } from '@shared/storage/keys-builder';
import { nextDailyBoundary, nextMonthlyBoundary, nextWeeklyBoundary } from '@shared/time/boundaries';
import { actions } from 'astro:actions';

type BoolMap = Record<string, boolean>;
type SectionMap = Record<string, BoolMap>;

function objectValue<T>(value: unknown, fallback: T): T {
	return value && typeof value === 'object' ? (value as T) : fallback;
}

class TrackerStore {
	completed = $state<SectionMap>({});
	hidden = $state<SectionMap>({});
	pins = $state<BoolMap>({});
	collapsedBlocks = $state<BoolMap>({});
	private boundaryTimer: number | null = null;
	private syncDebounceTimer: number | null = null;

	constructor() {
		if (typeof window !== 'undefined') {
			this.initialize();
			this.startBoundaryMonitor();
		}
	}

	/**
	 * Bootstraps the store by loading local data and attempting a server-side sync
	 * if local data appears to be missing or stale.
	 */
	async initialize() {
		this.loadPins();
		this.collapsedBlocks = objectValue(load(StorageKeyBuilder.collapsedBlocks(), {}), {});
		
		// If pins are empty, try to fetch from server as a backup
		if (Object.keys(this.pins).length === 0) {
			console.log('[TrackerStore] Local pins empty, checking server backup...');
			const profileName = getActiveProfile();
			try {
				const { data, error } = await actions.fetchProfile({ profileName });
				if (data?.success && data.data) {
					console.log('[TrackerStore] Restoring from server backup');
					// This logic would need to re-seed localStorage.
					// For now, we just signal that the infrastructure is ready.
					this.pins = objectValue(data.data[StorageKeyBuilder.overviewPins()], {});
					// Trigger a full reload of the UI
					this.reloadAll();
				}
			} catch (e) {
				// Silent fail if no backup or network issue
			}
		}
	}

	/**
	 * Pushes the current profile state to the server via Astro Actions.
	 * Debounced to prevent excessive network calls during rapid UI interaction.
	 */
	async syncToServer() {
		if (typeof window === 'undefined') return;

		if (this.syncDebounceTimer) {
			window.clearTimeout(this.syncDebounceTimer);
		}

		this.syncDebounceTimer = window.setTimeout(async () => {
			const profileName = getActiveProfile();
			const data = listCurrentProfileEntries();
			
			try {
				const { error } = await actions.syncProfile({
					profileName,
					data,
					timestamp: Date.now(),
				});

				if (error) {
					console.error('[TrackerStore] Failed to sync to server:', error);
				} else {
					console.log(`[TrackerStore] Successfully synced profile "${profileName}"`);
				}
			} catch (e) {
				console.error('[TrackerStore] Error during sync:', e);
			}
		}, 2000); // 2 second debounce
	}

	isCollapsedBlock(blockId: string) {
		return !!this.collapsedBlocks[blockId];
	}

	setCollapsedBlock(blockId: string, collapsed: boolean) {
		const next = { ...this.collapsedBlocks };
		if (collapsed) next[blockId] = true;
		else delete next[blockId];
		this.collapsedBlocks = next;
		save(StorageKeyBuilder.collapsedBlocks(), next);
		this.syncToServer();
	}



	loadSection(sectionKey: string) {
		if (typeof window === 'undefined') return;
		this.completed[sectionKey] = objectValue(load(StorageKeyBuilder.sectionCompletion(sectionKey), {}), {});
		this.hidden[sectionKey] = objectValue(load(StorageKeyBuilder.sectionHiddenRows(sectionKey), {}), {});
		this.completed = { ...this.completed };
		this.hidden = { ...this.hidden };
	}

	loadPins() {
		this.pins = objectValue(load(StorageKeyBuilder.overviewPins(), {}), {});
	}

	toggleComplete(sectionKey: string, taskId: string) {
		const section = { ...(this.completed[sectionKey] || {}) };
		if (section[taskId]) delete section[taskId];
		else section[taskId] = true;
		this.completed[sectionKey] = section;
		this.completed = { ...this.completed };
		save(StorageKeyBuilder.sectionCompletion(sectionKey), section);
		this.syncToServer();
	}

	hide(sectionKey: string, taskId: string) {
		const section = { ...(this.hidden[sectionKey] || {}) };
		section[taskId] = true;
		this.hidden[sectionKey] = section;
		this.hidden = { ...this.hidden };
		save(StorageKeyBuilder.sectionHiddenRows(sectionKey), section);
		this.syncToServer();
	}

	restore(sectionKey: string, taskId: string) {
		const section = { ...(this.hidden[sectionKey] || {}) };
		delete section[taskId];
		this.hidden[sectionKey] = section;
		this.hidden = { ...this.hidden };
		save(StorageKeyBuilder.sectionHiddenRows(sectionKey), section);
		this.syncToServer();
	}

	restoreAll(sectionKey: string) {
		this.hidden[sectionKey] = {};
		this.hidden = { ...this.hidden };
		save(StorageKeyBuilder.sectionHiddenRows(sectionKey), {});
		this.syncToServer();
	}

	clearCompletions(sectionKey: string) {
		this.completed[sectionKey] = {};
		this.completed = { ...this.completed };
		save(StorageKeyBuilder.sectionCompletion(sectionKey), {});
		this.syncToServer();
	}

	clearGroupCompletions(sectionKey: string, taskIds: string[]) {
		const section = { ...(this.completed[sectionKey] || {}) };
		for (const taskId of taskIds) delete section[taskId];
		this.completed[sectionKey] = section;
		this.completed = { ...this.completed };
		save(StorageKeyBuilder.sectionCompletion(sectionKey), section);
		this.syncToServer();
	}

	togglePin(sectionKey: string, taskId: string) {
		const pinId = `${sectionKey}::${taskId}`;
		const next = { ...this.pins };
		if (next[pinId]) delete next[pinId];
		else next[pinId] = true;
		this.pins = next;
		save(StorageKeyBuilder.overviewPins(), next);
		this.syncToServer();
	}

	reloadAll() {
		for (const key of Object.keys(this.completed)) this.loadSection(key);
		this.loadPins();
	}

	private startBoundaryMonitor() {
		if (typeof window === 'undefined' || this.boundaryTimer !== null) return;
		const check = () => {
			const now = Date.now();
			const boundaries = [
				{ key: 'last_daily_reset_time', sections: ['rs3daily', 'osrsdaily', 'gathering'], next: nextDailyBoundary },
				{ key: 'last_weekly_reset_time', sections: ['rs3weekly', 'osrsweekly'], next: nextWeeklyBoundary },
				{ key: 'last_monthly_reset_time', sections: ['rs3monthly', 'osrsmonthly'], next: nextMonthlyBoundary },
			];
			for (const boundary of boundaries) {
				const last = load<number>(boundary.key, 0);
				if (!last) { save(boundary.key, now); continue; }
				if (now >= boundary.next(new Date(last)).getTime()) {
					for (const section of boundary.sections) this.clearCompletions(section);
					save(boundary.key, now);
				}
			}
		};
		check();
		this.boundaryTimer = window.setInterval(check, 30000);
	}
}

export const tracker = new TrackerStore();
