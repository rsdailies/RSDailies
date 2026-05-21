import { StorageKeyBuilder } from '@shared/storage/keys-builder';
import { load, save } from '@shared/storage/storage-service';

type BoolMap = Record<string, boolean>;
type SectionMap = Record<string, BoolMap>;

function objectValue<T>(value: unknown, fallback: T): T {
	return value && typeof value === 'object' ? (value as T) : fallback;
}

export class CompletionsStore {
	private state = $state<SectionMap>({});

	get map() {
		return this.state;
	}

	load(sectionKey: string) {
		if (typeof window === 'undefined') return;
		this.state[sectionKey] = objectValue(load(StorageKeyBuilder.sectionCompletion(sectionKey), {}), {});
		this.state = { ...this.state };
	}

	toggle(sectionKey: string, taskId: string) {
		const section = { ...(this.state[sectionKey] || {}) };
		if (section[taskId]) delete section[taskId];
		else section[taskId] = true;
		this.state[sectionKey] = section;
		this.state = { ...this.state };
		save(StorageKeyBuilder.sectionCompletion(sectionKey), section);
	}

	clear(sectionKey: string) {
		this.state[sectionKey] = {};
		this.state = { ...this.state };
		save(StorageKeyBuilder.sectionCompletion(sectionKey), {});
	}

	clearGroup(sectionKey: string, taskIds: string[]) {
		const section = { ...(this.state[sectionKey] || {}) };
		for (const taskId of taskIds) delete section[taskId];
		this.state[sectionKey] = section;
		this.state = { ...this.state };
		save(StorageKeyBuilder.sectionCompletion(sectionKey), section);
	}
}
