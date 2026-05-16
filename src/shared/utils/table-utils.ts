import { StorageKeyBuilder } from './storage/keys-builder.ts';
import { SECTION_CONTAINER_IDS, SECTION_TABLE_IDS } from './section-ids.ts';

export function getContainerId(sectionKey: string) {
	return SECTION_CONTAINER_IDS[sectionKey] || `table-${sectionKey}`;
}

export function getTableId(sectionKey: string) {
	return SECTION_TABLE_IDS[sectionKey] || `${sectionKey}-table`;
}

export function slugify(input: unknown) {
	if (!input) return '';
	return String(input)
		.toLowerCase()
		.trim()
		.replace(/\s+/g, '-')
		.replace(/[^\w-]+/g, '')
		.replace(/--+/g, '-');
}

export function applyOrderingAndSort(
	sectionKey: string,
	tasks: any[],
	{ load }: { load: <T = any>(key: string, fallback?: T) => T }
) {
	const order = load<string[]>(StorageKeyBuilder.sectionOrder(sectionKey), []);
	const sort = load<string>(StorageKeyBuilder.sectionSort(sectionKey), 'default');

	const results = [...tasks];

	if (order.length > 0) {
		const orderMap = new Map<string, number>();
		order.forEach((id, idx) => orderMap.set(id, idx));

		results.sort((a, b) => {
			const idxA = orderMap.has(a.id) ? (orderMap.get(a.id) as number) : 9999;
			const idxB = orderMap.has(b.id) ? (orderMap.get(b.id) as number) : 9999;
			return idxA - idxB;
		});
	}

	if (sort === 'alpha' || sort === 'wiki') {
		results.sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')));
	}

	return results;
}
