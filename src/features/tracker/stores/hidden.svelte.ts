import { StorageKeyBuilder } from '@shared/storage/keys-builder';
import { load, save } from '@shared/storage/storage-service';

type BoolMap = Record<string, boolean>;
type SectionMap = Record<string, BoolMap>;

function objectValue<T>(value: unknown, fallback: T): T {
	return value && typeof value === 'object' ? (value as T) : fallback;
}

export class HiddenStore {
	private state = $state<SectionMap>({});

	get map() {
		return this.state;
	}

	load(sectionKey: string) {
		if (typeof window === 'undefined') return;
		this.state[sectionKey] = objectValue(load(StorageKeyBuilder.sectionHiddenRows(sectionKey), {}), {});
		this.state = { ...this.state };
	}

	hide(sectionKey: string, taskId: string) {
		const section = { ...(this.state[sectionKey] || {}) };
		section[taskId] = true;
		this.state[sectionKey] = section;
		this.state = { ...this.state };
		save(StorageKeyBuilder.sectionHiddenRows(sectionKey), section);
	}

	restore(sectionKey: string, taskId: string) {
		const section = { ...(this.state[sectionKey] || {}) };
		delete section[taskId];
		this.state[sectionKey] = section;
		this.state = { ...this.state };
		save(StorageKeyBuilder.sectionHiddenRows(sectionKey), section);
	}

	restoreAll(sectionKey: string) {
		this.state[sectionKey] = {};
		this.state = { ...this.state };
		save(StorageKeyBuilder.sectionHiddenRows(sectionKey), {});
	}
}
