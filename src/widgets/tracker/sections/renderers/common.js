export function centeredHeaderLabel(text) {
  return `<span style="display:block;width:100%;text-align:center;">${text}</span>`;
}

export function appendRows(tbody, rows) {
  rows.forEach((row) => {
    if (row) tbody.appendChild(row);
  });
}

function clearEdgeClasses(row) {
  if (!row) return;
  row.classList.remove('block-end-row', 'subsection-end-row');
}

function isVisibleRow(row) {
  return !!row && row.dataset.completed !== 'hide';
}

export function markLastVisibleRow(rows, options = {}) {
  const { fallbackRow = null, skipEdgeClasses = false } = options;
  const list = Array.isArray(rows) ? rows.filter(Boolean) : [];

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

export function finalizeSubgroupBlock(headerRow, rows, options = {}) {
  if (!headerRow) return null;

  const { collapsed = false, skipEdgeClasses = false } = options;
  headerRow.classList.add('subgroup-header-row');
    headerRow.classList.remove(
      'subgroup-open-row',
      'subgroup-terminal-row',
      'collapsed-subgroup-row',
      'subgroup-last-row'
    );
    if (!skipEdgeClasses) {
      headerRow.classList.remove('block-end-row', 'subsection-end-row');
    }

    const visibleRows = Array.isArray(rows) ? rows.filter(isVisibleRow) : [];
    const terminalRow = markLastVisibleRow(visibleRows, { skipEdgeClasses });
  if (collapsed || visibleRows.length === 0 || !terminalRow) {
    headerRow.classList.add(
      'subgroup-terminal-row',
      'collapsed-subgroup-row',
      'subgroup-last-row'
    );
    if (!skipEdgeClasses) {
      headerRow.classList.add('block-end-row', 'subsection-end-row');
    }
    return headerRow;
  }

  headerRow.classList.add('subgroup-open-row');
  return terminalRow;
}
