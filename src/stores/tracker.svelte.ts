import { load, save } from '../lib/shared/storage/storage-service.ts';
import { StorageKeyBuilder } from '../lib/shared/storage/keys-builder.ts';
import { nextDailyBoundary, nextMonthlyBoundary, nextWeeklyBoundary } from '../lib/shared/time/boundaries.ts';

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

	constructor() {
		if (typeof window !== 'undefined') {
			this.loadPins();
			this.collapsedBlocks = objectValue(load(StorageKeyBuilder.collapsedBlocks(), {}), {});
			this.startBoundaryMonitor();
		}
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
	}

	hide(sectionKey: string, taskId: string) {
		const section = { ...(this.hidden[sectionKey] || {}) };
		section[taskId] = true;
		this.hidden[sectionKey] = section;
		this.hidden = { ...this.hidden };
		save(StorageKeyBuilder.sectionHiddenRows(sectionKey), section);
	}

	restore(sectionKey: string, taskId: string) {
		const section = { ...(this.hidden[sectionKey] || {}) };
		delete section[taskId];
		this.hidden[sectionKey] = section;
		this.hidden = { ...this.hidden };
		save(StorageKeyBuilder.sectionHiddenRows(sectionKey), section);
	}

	restoreAll(sectionKey: string) {
		this.hidden[sectionKey] = {};
		this.hidden = { ...this.hidden };
		save(StorageKeyBuilder.sectionHiddenRows(sectionKey), {});
	}

	clearCompletions(sectionKey: string) {
		this.completed[sectionKey] = {};
		this.completed = { ...this.completed };
		save(StorageKeyBuilder.sectionCompletion(sectionKey), {});
	}

	clearGroupCompletions(sectionKey: string, taskIds: string[]) {
		const section = { ...(this.completed[sectionKey] || {}) };
		for (const taskId of taskIds) delete section[taskId];
		this.completed[sectionKey] = section;
		this.completed = { ...this.completed };
		save(StorageKeyBuilder.sectionCompletion(sectionKey), section);
	}

	togglePin(sectionKey: string, taskId: string) {
		const pinId = `${sectionKey}::${taskId}`;
		const next = { ...this.pins };
		if (next[pinId]) delete next[pinId];
		else next[pinId] = true;
		this.pins = next;
		save(StorageKeyBuilder.overviewPins(), next);
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
