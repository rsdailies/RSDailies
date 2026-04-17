export function formatOverviewCountdown(kind, targetMs, { formatDurationMs }) {
  const diff = targetMs - Date.now();
  if (diff <= 0) return 'READY';
  return `${kind} in ${formatDurationMs(diff)}`;
}

function normalizeSectionsObject(sections) {
  if (!sections || typeof sections !== 'object') return [];

  return [
    { key: 'custom', tasks: Array.isArray(sections.custom) ? sections.custom : [] },
    { key: 'rs3daily', tasks: Array.isArray(sections.rs3daily) ? sections.rs3daily : [] },
    { key: 'gathering', tasks: Array.isArray(sections.gathering) ? sections.gathering : [] },
    { key: 'rs3weekly', tasks: Array.isArray(sections.rs3weekly) ? sections.rs3weekly : [] },
    { key: 'rs3monthly', tasks: Array.isArray(sections.rs3monthly) ? sections.rs3monthly : [] },
    { key: 'rs3farming', groups: Array.isArray(sections.rs3farming) ? sections.rs3farming : [] }
  ];
}

export function collectOverviewItems(sections, { getOverviewPins, load }) {
  const pins = getOverviewPins(load);
  const items = [];
  const normalizedSections = Array.isArray(sections) ? sections : normalizeSectionsObject(sections);

  normalizedSections.forEach((section) => {
    if (Array.isArray(section.tasks)) {
      section.tasks.forEach((task) => {
        const pinId = `${section.key}::${task.id}`;
        if (pins[pinId]) {
          items.push({ task, sectionKey: section.key });
        }

        if (Array.isArray(task.children)) {
          task.children.forEach((child) => {
            const childPinId = `${section.key}::${task.id}::${child.id}`;
            if (pins[childPinId]) {
              items.push({ task: child, sectionKey: section.key });
            }
          });
        }
      });
    }

    if (section.key === 'rs3farming' && Array.isArray(section.groups)) {
      section.groups.forEach((group) => {
        if (!Array.isArray(group.subgroups)) return;

        group.subgroups.forEach((sub) => {
          if (sub.isTimer && sub.timerTask) {
            const pinId = `rs3farming::${sub.timerTask.id}`;
            if (pins[pinId]) {
              items.push({ task: sub.timerTask, sectionKey: 'rs3farming' });
            }
          } else if (Array.isArray(sub.tasks)) {
            sub.tasks.forEach((t) => {
              const pinId = `rs3farming::${t.id}`;
              if (pins[pinId]) {
                items.push({ task: t, sectionKey: 'rs3farming' });
              }
            });
          }
        });
      });
    }
  });

  return items;
}

export function applyPageModeVisibility(mode) {
  const dashboard = document.getElementById('dashboard-container');
  const overviewMount = document.getElementById('overview-mount');

  if (!dashboard || !overviewMount) return;

  if (mode === 'overview') {
    dashboard.style.display = 'none';
    overviewMount.style.display = '';
  } else {
    dashboard.style.display = '';
    overviewMount.style.display = '';
  }
}

export function ensureOverviewLayout() {
  return document.getElementById('overview-content');
}

export function renderOverviewPanel(sections, {
  getPageMode,
  getOverviewPins,
  load,
  applyPageModeVisibility,
  ensureOverviewLayout,
  collectOverviewItems,
  createRow,
  context
}) {
  const mode = getPageMode();
  applyPageModeVisibility(mode);

  const overview = ensureOverviewLayout();
  if (!overview) return;

  overview.innerHTML = '';

  if (mode !== 'overview') {
    return;
  }

  const items = collectOverviewItems(sections, { getOverviewPins, load });

  if (items.length === 0) {
    overview.innerHTML = '<div class="card rs3-card"><div class="card-body text-muted">No pinned items yet.</div></div>';
    return;
  }

  const table = document.createElement('table');
  table.className = 'table table-dark table-hover rs3-table mb-0';

  const tbody = document.createElement('tbody');

  items.forEach(({ task, sectionKey }) => {
    const row = createRow(sectionKey, task, {
      context: {
        ...context,
        isOverviewPanel: true
      }
    });
    if (row) tbody.appendChild(row);
  });

  table.appendChild(tbody);
  overview.appendChild(table);
}