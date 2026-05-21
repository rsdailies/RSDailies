import { StorageKeyBuilder } from '@shared/storage/keys-builder';
import { load, save } from '@shared/storage/storage-service';

type BoolMap = Record<string, boolean>;

function objectValue<T>(value: unknown, fallback: T): T {
	return value && typeof value === 'object' ? (value as T) : fallback;
}

export class CollapsedStore {
	private state = $state<BoolMap>({});

	get map() {
		return this.state;
	}

	load() {
		this.state = objectValue(load(StorageKeyBuilder.collapsedBlocks(), {}), {});
	}

	isCollapsed(blockId: string) {
		return !!this.state[blockId];
	}

	set(blockId: string, collapsed: boolean) {
		const next = { ...this.state };
		if (collapsed) next[blockId] = true;
		else delete next[blockId];
		this.state = next;
		save(StorageKeyBuilder.collapsedBlocks(), next);
	}
}
