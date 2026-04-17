import {
  renderStandardSection,
  renderWeekliesWithChildren,
  renderGroupedGathering,
  renderGroupedFarming,
  formatFarmingDurationNote,
  buildFarmingLocationTask
} from '../../../ui/sections/renderers.js';
import {
  renderOverviewPanel,
  applyPageModeVisibility,
  collectOverviewItems
} from '../../../ui/overview/render.js';
import { createHeaderRow } from '../../../ui/rows/headers.js';
import { createRow, createRightSideChildRow } from '../../../ui/rows/factory.js';
import { applyOrderingAndSort } from '../../../ui/table/utils.js';
import { SECTION_CONTAINER_IDS, SECTION_TABLE_IDS } from '../../../core/ids/section-ids.js';
import { formatDurationMs as formatDurationMsCore } from '../../../core/time/formatters.js';

function getSectionElements(sectionKey) {
  const container = document.getElementById(SECTION_CONTAINER_IDS[sectionKey]);
  const table = document.getElementById(SECTION_TABLE_IDS[sectionKey]);
  const tbody = table?.querySelector('tbody') || null;

  return { container, table, tbody };
}

function setSectionHiddenState(sectionKey, hidden) {
  const { container, tbody } = getSectionElements(sectionKey);
  if (!container || !tbody) return;

  container.classList.toggle('section-hidden', hidden);
  tbody.style.display = hidden ? 'none' : '';

  const hideBtn = document.getElementById(`${sectionKey}_hide_button`);
  const unhideBtn = document.getElementById(`${sectionKey}_unhide_button`);

  if (hideBtn) hideBtn.style.display = hidden ? 'none' : '';
  if (unhideBtn) unhideBtn.style.display = hidden ? '' : 'none';
}

/**
 * Recovery behavior:
 * For any non-overview page mode, show the full dashboard.
 * This avoids stale legacy pageMode values like "gathering" or "custom"
 * trapping the UI into only one visible section while the new views system
 * is still being stabilized.
 */
function setSectionModeVisibility(sectionKey, mode) {
  const { container } = getSectionElements(sectionKey);
  if (!container) return false;

  const shouldShow = mode !== 'overview';
  container.style.display = shouldShow ? '' : 'none';
  return shouldShow;
}

function clearAllSectionBodies(sectionKeys) {
  sectionKeys.forEach((key) => {
    const { tbody } = getSectionElements(key);
    if (tbody) tbody.innerHTML = '';
  });
}

export function renderApp(deps) {
  const {
    load,
    save,
    getTaskState,
    getResolvedSections,
    cleanupReadyFarmingTimers,
    cleanupReadyCooldowns,
    hideTooltip,
    getFarmingHeaderStatus,
    hideTask,
    setTaskCompleted,
    clearFarmingTimer,
    startFarmingTimer,
    startCooldown,
    isCollapsedBlock,
    setCollapsedBlock,
    getCustomTasks,
    saveCustomTasks,
    fetchProfits,
    updateProfileHeader,
    maybeNotifyTaskAlert,
    bindSectionControls,
    getPageMode,
    getOverviewPins
  } = deps;

  cleanupReadyFarmingTimers();
  cleanupReadyCooldowns();
  hideTooltip();

  const uiContext = {
    load,
    save,
    getTaskState,
    cloneRowTemplate: () =>
      document.getElementById('sample_row')?.content?.firstElementChild?.cloneNode(true) || null,
    createInlineActions: (task, isCustom) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'activity_inline_actions';

      if (isCustom) {
        const delBtn = document.createElement('button');
        delBtn.className = 'btn btn-danger btn-sm inline-danger';
        delBtn.type = 'button';
        delBtn.textContent = 'Delete';
        delBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();

          if (!confirm(`Delete custom task "${task.name}"?`)) return;

          const next = getCustomTasks().filter((t) => t.id !== task.id);
          saveCustomTasks(next);

          const completed = load('completed:custom', {});
          const hiddenRows = load('hiddenRows:custom', {});
          const notified = load('notified:custom', {});

          delete completed[task.id];
          delete hiddenRows[task.id];
          delete notified[task.id];

          save('completed:custom', completed);
          save('hiddenRows:custom', hiddenRows);
          save('notified:custom', notified);

          renderApp(deps);
        });

        wrapper.appendChild(delBtn);
      }

      return wrapper.children.length ? wrapper : null;
    },
    appendRowText: (desc, task) => {
      if (task.note) {
        const span = document.createElement('span');
        span.className = 'activity_note_line';
        span.textContent = task.note;
        desc.appendChild(span);
      }

      if (task.profit?.item && task.profit?.qty) {
        const span = document.createElement('span');
        span.className = 'item_profit';
        span.dataset.item = task.profit.item;
        span.dataset.qty = String(task.profit.qty);
        span.textContent = '\u2026';
        desc.appendChild(span);
      }

      if (task.durationNote) {
        const span = document.createElement('span');
        span.className = 'activity_duration_note';
        span.textContent = task.durationNote;
        desc.appendChild(span);
      }

      if (task.locationNote) {
        const span = document.createElement('span');
        span.className = 'activity_location_note';
        span.textContent = task.locationNote;
        desc.appendChild(span);
      }
    },
    renderApp: () => renderApp(deps),
    hideTask,
    setTaskCompleted,
    clearFarmingTimer,
    startFarmingTimer,
    startCooldown,
    getTableId: (sectionKey) => SECTION_TABLE_IDS[sectionKey],
    isCollapsedBlock,
    setCollapsedBlock
  };

  const sections = getResolvedSections();
  const sectionKeys = ['custom', 'rs3farming', 'rs3daily', 'gathering', 'rs3weekly', 'rs3monthly'];
  const mode = getPageMode();

  applyPageModeVisibility(mode);
  clearAllSectionBodies(sectionKeys);

  sectionKeys.forEach((key) => {
    const { tbody } = getSectionElements(key);
    if (!tbody) return;

    const sectionTasks = key === 'rs3farming' ? sections.rs3farming : sections[key];
    const hidden = !!load(`hideSection:${key}`, false);
    const visibleByMode = setSectionModeVisibility(key, mode);

    if (!visibleByMode) {
      return;
    }

    setSectionHiddenState(key, hidden);

    if (hidden) {
      bindSectionControls(key, { sortable: true });
      return;
    }

    if (!sectionTasks) {
      bindSectionControls(key, { sortable: true });
      return;
    }

    const sortedTasks = key === 'rs3farming'
      ? []
      : applyOrderingAndSort(
        key,
        Array.isArray(sectionTasks) ? sectionTasks : [],
        { load }
      );

    if (key === 'rs3farming') {
      renderGroupedFarming(tbody, sectionTasks, {
        isCollapsedBlock,
        getFarmingHeaderStatus,
        formatFarmingDurationNote,
        buildFarmingLocationTask,
        createHeaderRow,
        createRow,
        createRightSideChildRow,
        formatDurationMs: formatDurationMsCore,
        context: uiContext
      });
    } else if (key === 'gathering') {
      renderGroupedGathering(tbody, sortedTasks, {
        isCollapsedBlock,
        createHeaderRow,
        createRow,
        context: uiContext
      });
    } else if (key === 'rs3weekly') {
      renderWeekliesWithChildren(tbody, sortedTasks, {
        isCollapsedBlock,
        createRow,
        createRightSideChildRow,
        context: uiContext
      });
    } else {
      renderStandardSection(tbody, key, sortedTasks, {
        createRow,
        context: uiContext
      });
    }

    bindSectionControls(key, { sortable: true });
  });

  renderOverviewPanel(sections, {
    getPageMode,
    getOverviewPins,
    load,
    applyPageModeVisibility,
    ensureOverviewLayout: () => document.getElementById('overview-content'),
    collectOverviewItems,
    createRow,
    context: uiContext
  });

  fetchProfits();
  updateProfileHeader();

  ['custom', 'rs3daily', 'gathering', 'rs3weekly', 'rs3monthly'].forEach((key) => {
    const tasks = sections[key];
    if (Array.isArray(tasks)) {
      tasks.forEach((task) => maybeNotifyTaskAlert(task, key));
    }
  });
}