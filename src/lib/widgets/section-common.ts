export function centeredHeaderLabel(text: string) {
	return `<span style="display:block;width:100%;text-align:center;">${text}</span>`;
}

export function appendRows(tbody: HTMLElement, rows: (HTMLElement | null)[]) {
	rows.forEach((row) => {
		if (row) tbody.appendChild(row);
	});
}

function clearEdgeClasses(row: HTMLElement | null) {
	if (!row) return;
	row.classList.remove('block-end-row', 'subsection-end-row');
}

function isVisibleRow(row: HTMLElement | null) {
	return !!row && row.dataset.completed !== 'hide';
}

export function markLastVisibleRow(rows: (HTMLElement | null)[], options: { fallbackRow?: HTMLElement | null; skipEdgeClasses?: boolean } = {}) {
	const { fallbackRow = null, skipEdgeClasses = false } = options;
	const list = Array.isArray(rows) ? rows.filter(Boolean) as HTMLElement[] : [];

	if (!skipEdgeClasses) {
		list.forEach(clearEdgeClasses);
		clearEdgeClasses(fallbackRow);
	}

	const visibleRows = list.filter(isVisibleRow);
	const target = visibleRows[visibleRows.length - 1] || fallbackRow || null;
	if (!target) return null;

	if (!skipEdgeClasses) {
		target.classList.add('block-end-row', 'subsection-end-row');
	}
	return target;
}

export function finalizeSubgroupBlock(
	headerRow: HTMLElement | null,
	rows: (HTMLElement | null)[],
	options: { collapsed?: boolean; skipEdgeClasses?: boolean } = {}
) {
	if (!headerRow) return null;

	const { collapsed = false, skipEdgeClasses = false } = options;
	headerRow.classList.add('subgroup-header-row');
	headerRow.classList.remove('subgroup-open-row', 'subgroup-terminal-row', 'collapsed-subgroup-row', 'subgroup-last-row');
	if (!skipEdgeClasses) {
		headerRow.classList.remove('block-end-row', 'subsection-end-row');
	}

	const visibleRows = Array.isArray(rows) ? (rows.filter(isVisibleRow) as HTMLElement[]) : [];
	const terminalRow = markLastVisibleRow(visibleRows, { skipEdgeClasses });
	if (collapsed || visibleRows.length === 0 || !terminalRow) {
		headerRow.classList.add('subgroup-terminal-row', 'collapsed-subgroup-row', 'subgroup-last-row');
		if (!skipEdgeClasses) {
			headerRow.classList.add('block-end-row', 'subsection-end-row');
		}
		return headerRow;
	}

	headerRow.classList.add('subgroup-open-row');
	return terminalRow;
}
