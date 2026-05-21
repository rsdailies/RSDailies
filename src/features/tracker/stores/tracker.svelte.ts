import { cleanupReadyCooldowns } from '@features/cooldowns/cooldown-service';
import { checkAutoReset } from '@features/sections/auto-reset';
import { cleanupReadyTimers } from '@features/timers';
import { fetchServerProfile, syncServerProfile } from '@features/tracker/services/server-sync';
import { StorageKeyBuilder } from '@shared/storage/keys-builder';
import { getActiveProfile, listCurrentProfileEntries, load, save } from '@shared/storage/storage-service';

import { CollapsedStore } from './collapsed.svelte';
import { CompletionsStore } from './completions.svelte';
import { HiddenStore } from './hidden.svelte';
import { PinsStore } from './pins.svelte';

class TrackerFacade {
	readonly completions = new CompletionsStore();
	readonly hidden = new HiddenStore();
	readonly pins = new PinsStore();
	readonly collapsed = new CollapsedStore();

	private boundaryTimer: number | null = null;
	private syncDebounceTimer: number | null = null;

	constructor() {
		if (typeof window !== 'undefined') {
			this.initialize();
			this.startBoundaryMonitor();
		}
	}

	async initialize() {
		this.pins.load();
		this.collapsed.load();

		if (!this.serverSyncEnabled()) return;

		if (Object.keys(this.pins.map).length === 0) {
			const profileName = getActiveProfile();
			try {
				const data = await fetchServerProfile(profileName);
				if (data?.success && data.data) {
					this.pins.map = (data.data[StorageKeyBuilder.overviewPins()] as Record<string, boolean>) || {};
					this.reloadAll();
				}
			} catch {}
		}
	}

	get completed() {
		return this.completions.map;
	}
	get hiddenRows() {
		return this.hidden.map;
	}
	get overviewPins() {
		return this.pins.map;
	}

	isCollapsedBlock(blockId: string) {
		return this.collapsed.isCollapsed(blockId);
	}

	setCollapsedBlock(blockId: string, collapsed: boolean) {
		this.collapsed.set(blockId, collapsed);
		this.syncToServer();
	}

	loadSection(sectionKey: string) {
		this.completions.load(sectionKey);
		this.hidden.load(sectionKey);
	}

	toggleComplete(sectionKey: string, taskId: string) {
		this.completions.toggle(sectionKey, taskId);
		this.syncToServer();
	}

	hide(sectionKey: string, taskId: string) {
		this.hidden.hide(sectionKey, taskId);
		if (this.pins.map[`${sectionKey}::${taskId}`]) {
			this.pins.toggle(sectionKey, taskId);
		}
		this.syncToServer();
	}

	restore(sectionKey: string, taskId: string) {
		this.hidden.restore(sectionKey, taskId);
		this.syncToServer();
	}

	restoreAll(sectionKey: string) {
		this.hidden.restoreAll(sectionKey);
		this.syncToServer();
	}

	clearCompletions(sectionKey: string) {
		this.completions.clear(sectionKey);
		this.syncToServer();
	}

	clearGroupCompletions(sectionKey: string, taskIds: string[]) {
		this.completions.clearGroup(sectionKey, taskIds);
		this.syncToServer();
	}

	togglePin(sectionKey: string, taskId: string) {
		this.pins.toggle(sectionKey, taskId);
		this.syncToServer();
	}

	reloadAll() {
		for (const key of Object.keys(this.completed)) {
			this.loadSection(key);
		}
		this.pins.load();
	}

	async syncToServer() {
		if (typeof window === 'undefined') return;
		if (!this.serverSyncEnabled()) return;

		if (this.syncDebounceTimer) {
			window.clearTimeout(this.syncDebounceTimer);
		}

		this.syncDebounceTimer = window.setTimeout(async () => {
			const profileName = getActiveProfile();
			const data = listCurrentProfileEntries();
			try {
				await syncServerProfile({ profileName, data, timestamp: Date.now() });
			} catch {}
		}, 2000);
	}

	private startBoundaryMonitor() {
		if (typeof window === 'undefined' || this.boundaryTimer !== null) return;
		const check = () => {
			const loadValue = <T>(key: string, fallback?: T) => load(key, fallback as T) as T;

			// 1. Run game-time boundary auto-resets
			const boundaryChanged = checkAutoReset({ load: loadValue, save });

			// 2. Check and clean up task cooldowns
			const cooldownsChanged = cleanupReadyCooldowns({ load: loadValue, save });

			// 3. Check and clean up active timer states
			const timersChanged = cleanupReadyTimers({ load: loadValue, save });

			if (boundaryChanged || cooldownsChanged || timersChanged) {
				this.reloadAll();
			}
		};
		check();
		this.boundaryTimer = window.setInterval(check, 10000); // Check every 10s for snappy UI reactivity
	}

	private serverSyncEnabled() {
		return String(import.meta.env.PUBLIC_ENABLE_SERVER_SYNC || '').toLowerCase() === 'true';
	}
}

export const tracker = new TrackerFacade();
