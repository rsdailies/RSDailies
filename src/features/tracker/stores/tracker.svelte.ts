import { cleanupReadyCooldowns } from '@features/cooldowns/cooldown-service';
import { checkAutoReset } from '@features/sections/auto-reset';
import { cleanupReadyTimers } from '@features/timers';
import {
	fetchServerProfile,
	getClientServerSyncStatus,
	syncServerProfile,
} from '@features/tracker/services/server-sync';
import {
	getActiveProfile,
	hasCurrentProfileEntries,
	listCurrentProfileEntries,
	load,
	replaceCurrentProfileEntries,
	save,
} from '@shared/storage/storage-service';

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
	private readonly loadedSections = new Set<string>();
	private syncNotice = $state(getClientServerSyncStatus().message);

	constructor() {
		if (typeof window !== 'undefined') {
			void this.initialize();
			this.startBoundaryMonitor();
		}
	}

	async initialize() {
		await this.refreshActiveProfile();
	}

	async refreshActiveProfile() {
		this.pins.load();
		this.collapsed.load();
		for (const key of this.loadedSections) {
			this.loadSection(key);
		}
		this.completions.load('custom');

		const syncStatus = getClientServerSyncStatus();
		this.syncNotice = syncStatus.message;

		if (!syncStatus.enabled || hasCurrentProfileEntries()) return;

		const profileName = getActiveProfile();
		try {
			const response = await fetchServerProfile(profileName);
			if (response.success && response.data) {
				replaceCurrentProfileEntries(response.data);
				this.reloadAll();
				return;
			}

			if (response.message) {
				this.syncNotice = response.message;
			}
		} catch {
			this.syncNotice = 'Server backup could not be reached. Local storage remains active.';
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

	get serverSyncNotice() {
		return this.syncNotice;
	}

	isCollapsedBlock(blockId: string) {
		return this.collapsed.isCollapsed(blockId);
	}

	setCollapsedBlock(blockId: string, collapsed: boolean) {
		this.collapsed.set(blockId, collapsed);
		this.syncToServer();
	}

	loadSection(sectionKey: string) {
		this.loadedSections.add(sectionKey);
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

	restoreGroup(sectionKey: string, taskIds: string[]) {
		this.hidden.restoreGroup(sectionKey, taskIds);
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
		for (const key of this.loadedSections) {
			this.loadSection(key);
		}
		this.completions.load('custom');
		this.pins.load();
		this.collapsed.load();
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
				const response = await syncServerProfile({ profileName, data, timestamp: Date.now() });
				if (response.success) {
					this.syncNotice = getClientServerSyncStatus().message;
					return;
				}

				if (response.message) {
					this.syncNotice = response.message;
				}
			} catch {
				this.syncNotice = 'Server backup could not be reached. Local storage remains active.';
			}
		}, 2000);
	}

	private startBoundaryMonitor() {
		if (typeof window === 'undefined' || this.boundaryTimer !== null) return;
		const check = () => {
			const loadValue = <T>(key: string, fallback?: T) => load(key, fallback as T) as T;

			const boundaryChanged = checkAutoReset({ load: loadValue, save });
			const cooldownsChanged = cleanupReadyCooldowns({ load: loadValue, save });
			const timersChanged = cleanupReadyTimers({ load: loadValue, save });

			if (boundaryChanged || cooldownsChanged || timersChanged) {
				this.reloadAll();
			}
		};
		check();
		this.boundaryTimer = window.setInterval(check, 10000);
	}

	private serverSyncEnabled() {
		return getClientServerSyncStatus().enabled;
	}
}

export const tracker = new TrackerFacade();
