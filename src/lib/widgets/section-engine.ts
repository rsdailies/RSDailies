import { appendRows, finalizeSubgroupBlock, markLastVisibleRow } from './section-common.ts';

export function renderUnifiedSection(tbody: HTMLElement, blocks: any[], context: any) {
	if (!tbody || !Array.isArray(blocks)) return;

	const { markLastVisibleRow: markLast = markLastVisibleRow } = context;
	const allVisibleRows: HTMLElement[] = [];

	blocks.forEach((block, index) => {
		const { id, kind, title, tasks = [], headerMode = 'default', rightText = '', onResetClick = null, restoreOptions = null, onRestoreSelect = null } = block;

		const blockRows: HTMLElement[] = [];
		tasks.forEach((task: any) => {
			const row = context.createRow(context.sectionKey, task, { context: context.context });
			if (row) blockRows.push(row);
		});

		if (kind === 'subgroup') {
			const collapsed = context.isCollapsedBlock(id);
			const headerRow = context.createHeaderRow(title, id, {
				rightText,
				onResetClick,
				restoreOptions,
				onRestoreSelect,
				context: context.context,
			});

			if (headerMode === 'attached') {
				headerRow.classList.add('subgroup-attached-header');
			}

			finalizeSubgroupBlock(headerRow, blockRows, {
				collapsed,
				skipEdgeClasses: index < blocks.length - 1,
			});

			tbody.appendChild(headerRow);
			if (!collapsed) {
				appendRows(tbody, blockRows);
				allVisibleRows.push(...blockRows);
			}
			return;
		}

		if (kind === 'rows') {
			appendRows(tbody, blockRows);
			allVisibleRows.push(...blockRows);
		}
	});

	markLast(allVisibleRows);
}
