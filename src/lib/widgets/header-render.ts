import { createTableSectionHeader } from './table-section-header.ts';

export function createHeaderRow(label: string, blockId: string, options: any = {}) {
	return createTableSectionHeader(label, blockId, options);
}
