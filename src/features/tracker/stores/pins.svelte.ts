import { StorageKeyBuilder } from '@shared/storage/keys-builder';
import { load, save } from '@shared/storage/storage-service';

type BoolMap = Record<string, boolean>;

function objectValue<T>(value: unknown, fallback: T): T {
	return value && typeof value === 'object' ? (value as T) : fallback;
}

export class PinsStore {
	private state = $state<BoolMap>({});

	get map() {
		return this.state;
	}

	set map(value: BoolMap) {
		this.state = value;
	}

	load() {
		this.state = objectValue(load(StorageKeyBuilder.overviewPins(), {}), {});
	}

	toggle(sectionKey: string, taskId: string) {
		const pinId = `${sectionKey}::${taskId}`;
		const next = { ...this.state };
		if (next[pinId]) delete next[pinId];
		else next[pinId] = true;
		this.state = next;
		save(StorageKeyBuilder.overviewPins(), next);
	}
}
