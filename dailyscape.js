// =============================================================================
// dailyscape.js — Core logic. Edit tasks-config.js for task content.
// =============================================================================

'use strict';

// ---------------------------------------------------------------------------
// Storage helpers
// ---------------------------------------------------------------------------
const STORAGE_KEY_PREFIX = 'rsdailies';

function getActiveProfile() {
  return localStorage.getItem(`${STORAGE_KEY_PREFIX}:active-profile`) || 'default';
}

function storageKey(key) {
  return `${STORAGE_KEY_PREFIX}:${getActiveProfile()}:${key}`;
}

function load(key, fallback = null) {
  try {
    const val = localStorage.getItem(storageKey(key));
    return val !== null ? JSON.parse(val) : fallback;
  } catch { return fallback; }
}

function save(key, value) {
  localStorage.setItem(storageKey(key), JSON.stringify(value));
}

// ---------------------------------------------------------------------------
// Reset time helpers (UTC)
// Daily = 00:00 UTC, Weekly = Wednesday 00:00 UTC, Monthly = 1st 00:00 UTC
// ---------------------------------------------------------------------------
function getNextDaily() {
  const now = new Date();
  const next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
  return next;
}

function getNextWeekly() {
  const now = new Date();
  const day = now.getUTCDay(); // 0=Sun, 3=Wed
  const daysUntilWed = (3 - day + 7) % 7 || 7;
  const next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + daysUntilWed));
  return next;
}

function getNextMonthly() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
}

function formatCountdown(target) {
  const diff = target - Date.now();
  if (diff <= 0) return '00:00:00';
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// ---------------------------------------------------------------------------
// Timer bar
// ---------------------------------------------------------------------------
function updateTimers() {
  document.getElementById('daily-timer').textContent = `Daily reset: ${formatCountdown(getNextDaily())}`;
  document.getElementById('weekly-timer').textContent = `Weekly reset: ${formatCountdown(getNextWeekly())}`;
  document.getElementById('monthly-timer').textContent = `Monthly reset: ${formatCountdown(getNextMonthly())}`;
}

// ---------------------------------------------------------------------------
// Auto-reset: check if tasks need resetting after a reset boundary
// ---------------------------------------------------------------------------
function checkAutoReset() {
  const now = Date.now();
  const lastVisit = load('last-visit', 0);

  const prevDaily = new Date(getNextDaily() - 86400000).getTime();
  const prevWeekly = (() => {
    const d = getNextWeekly();
    d.setUTCDate(d.getUTCDate() - 7);
    return d.getTime();
  })();
  const prevMonthly = (() => {
    const d = getNextMonthly();
    d.setUTCMonth(d.getUTCMonth() - 1);
    return d.getTime();
  })();

  if (lastVisit < prevDaily) clearCompleted(['daily', 'gathering']);
  if (lastVisit < prevWeekly) clearCompleted(['weekly', 'weeklyGathering']);
  if (lastVisit < prevMonthly) clearCompleted(['monthly']);

  save('last-visit', now);
}

function clearCompleted(types) {
  types.forEach(type => {
    save(`completed-${type}`, {});
  });
}

// ---------------------------------------------------------------------------
// Build task rows
// ---------------------------------------------------------------------------
function buildRows(tasks, type) {
  const completed = load(`completed-${type}`, {});
  const hidden = load(`hidden-${type}`, {});
  const tbody = document.getElementById(`${type === 'weeklyGathering' ? 'weekly-gathering' : type}-body`);
  if (!tbody) return;

  tbody.innerHTML = '';

  tasks.forEach(task => {
    if (hidden[task.id]) return;

    const tr = document.createElement('tr');
    tr.dataset.id = task.id;
    tr.draggable = true;
    if (completed[task.id]) tr.classList.add('completed');

    const tdName = document.createElement('td');
    tdName.className = 'task-name';

    const nameLink = task.wiki
      ? `<a href="${task.wiki}" target="_blank" rel="noopener">${task.name}</a>`
      : task.name;
    tdName.innerHTML = nameLink;

    if (task.note) {
      const noteSpan = document.createElement('span');
      noteSpan.className = 'task-note';
      noteSpan.textContent = task.note;
      tdName.appendChild(noteSpan);
    }

    if (task.profit) {
      const profitSpan = document.createElement('span');
      profitSpan.className = 'task-profit';
      profitSpan.dataset.item = task.profit.item;
      profitSpan.dataset.qty = task.profit.qty;
      profitSpan.textContent = 'Loading price...';
      tdName.appendChild(profitSpan);
    }

    if (task.timer) {
      const timerBtn = document.createElement('button');
      timerBtn.className = 'herb-timer-btn';
      timerBtn.textContent = '🌿 Start Herb Run';
      timerBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        startHerbTimer(task, timerBtn);
      });
      tdName.appendChild(timerBtn);
    }

    const tdCheck = document.createElement('td');
    tdCheck.className = 'task-check';
    tdCheck.innerHTML = completed[task.id] ? '✔' : '✘';
    tdCheck.addEventListener('click', () => toggleTask(task.id, type, tr, tdCheck));

    tr.appendChild(tdName);
    tr.appendChild(tdCheck);
    tbody.appendChild(tr);
  });

  enableDragDrop(tbody, type);
}

// ---------------------------------------------------------------------------
// Toggle task completion
// ---------------------------------------------------------------------------
function toggleTask(id, type, tr, tdCheck) {
  const completed = load(`completed-${type}`, {});
  completed[id] = !completed[id];
  save(`completed-${type}`, completed);
  tr.classList.toggle('completed', !!completed[id]);
  tdCheck.textContent = completed[id] ? '✔' : '✘';
}

// ---------------------------------------------------------------------------
// Herb Run Timer
// ---------------------------------------------------------------------------
function startHerbTimer(task, btn) {
  const settings = load('settings', {});
  const ticks = settings.herbTicks || task.growthTicks || 4;
  const growthMs = ticks * 5 * 60 * 1000; // each tick = 5 min
  const readyAt = Date.now() + growthMs;
  save(`herb-timer`, readyAt);

  btn.disabled = true;

  const interval = setInterval(() => {
    const remaining = readyAt - Date.now();
    if (remaining <= 0) {
      clearInterval(interval);
      btn.textContent = '🌿 Herbs Ready! Click to reset';
      btn.disabled = false;
      btn.classList.add('ready');
      if (Notification.permission === 'granted') {
        new Notification('RSDailies', { body: 'Your herb run is ready!' });
      }
      btn.onclick = () => {
        btn.textContent = '🌿 Start Herb Run';
        btn.classList.remove('ready');
        btn.disabled = false;
        btn.onclick = null;
        btn.addEventListener('click', (e) => { e.stopPropagation(); startHerbTimer(task, btn); });
      };
    } else {
      const m = Math.floor(remaining / 60000);
      const s = Math.floor((remaining % 60000) / 1000);
      btn.textContent = `🌿 ${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')} until ready`;
    }
  }, 1000);
}

// ---------------------------------------------------------------------------
// Drag and drop reordering
// ---------------------------------------------------------------------------
function enableDragDrop(tbody, type) {
  let dragRow = null;

  tbody.addEventListener('dragstart', e => {
    dragRow = e.target.closest('tr');
    dragRow.classList.add('dragging');
  });
  tbody.addEventListener('dragover', e => {
    e.preventDefault();
    const target = e.target.closest('tr');
    if (target && target !== dragRow) {
      const rect = target.getBoundingClientRect();
      const mid = rect.top + rect.height / 2;
      tbody.insertBefore(dragRow, e.clientY < mid ? target : target.nextSibling);
    }
  });
  tbody.addEventListener('dragend', () => {
    dragRow.classList.remove('dragging');
    const order = [...tbody.querySelectorAll('tr')].map(r => r.dataset.id);
    save(`order-${type}`, order);
    dragRow = null;
  });
}

// ---------------------------------------------------------------------------
// GE Profit fetching
// ---------------------------------------------------------------------------
async function fetchProfits() {
  const spans = document.querySelectorAll('.task-profit');
  if (!spans.length) return;

  const items = [...new Set([...spans].map(s => s.dataset.item))];
  const url = `https://runescape.wiki/api.php?action=ask&query=[[Exchange:${items.join('||Exchange:')}]]|?Exchange:Price&format=json&origin=*`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    const results = data?.query?.results || {};

    spans.forEach(span => {
      const item = span.dataset.item;
      const qty = parseInt(span.dataset.qty, 10);
      const priceData = results[`Exchange:${item}`];
      const price = priceData?.printouts?.['Exchange:Price']?.[0]?.num;
      if (price) {
        const total = Math.round(price * qty);
        span.textContent = `~${total.toLocaleString()} gp`;
      } else {
        span.textContent = '';
      }
    });
  } catch {
    spans.forEach(s => s.textContent = '');
  }
}

// ---------------------------------------------------------------------------
// Custom tasks
// ---------------------------------------------------------------------------
function loadCustomTasks() {
  const tasks = load('custom-tasks', []);
  const tbody = document.getElementById('custom-tasks-body');
  tbody.innerHTML = '';

  tasks.forEach((task, i) => {
    const completed = load('completed-custom', {});
    const tr = document.createElement('tr');
    if (completed[task.id]) tr.classList.add('completed');

    const tdName = document.createElement('td');
    tdName.className = 'task-name';
    tdName.innerHTML = `<strong>${task.name}</strong>`;
    if (task.note) {
      const n = document.createElement('span');
      n.className = 'task-note';
      n.textContent = task.note;
      tdName.appendChild(n);
    }

    // Reset type badge
    const badge = document.createElement('span');
    badge.className = `reset-badge reset-${task.reset || 'daily'}`;
    badge.textContent = task.reset || 'daily';
    tdName.appendChild(badge);

    // Delete button
    const delBtn = document.createElement('button');
    delBtn.className = 'delete-task-btn';
    delBtn.textContent = '✕';
    delBtn.title = 'Delete task';
    delBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteCustomTask(task.id);
    });
    tdName.appendChild(delBtn);

    const tdCheck = document.createElement('td');
    tdCheck.className = 'task-check';
    tdCheck.textContent = completed[task.id] ? '✔' : '✘';
    tdCheck.addEventListener('click', () => toggleTask(task.id, 'custom', tr, tdCheck));

    tr.appendChild(tdName);
    tr.appendChild(tdCheck);
    tbody.appendChild(tr);
  });
}

function deleteCustomTask(id) {
  const tasks = load('custom-tasks', []).filter(t => t.id !== id);
  save('custom-tasks', tasks);
  loadCustomTasks();
}

function showAddCustomTaskModal() {
  const name = prompt('Task name:');
  if (!name?.trim()) return;
  const note = prompt('Note (optional):') || '';
  const reset = prompt('Reset type (daily / weekly / monthly):') || 'daily';

  const task = {
    id: `custom-${Date.now()}`,
    name: name.trim(),
    note: note.trim(),
    reset: ['daily', 'weekly', 'monthly'].includes(reset.toLowerCase()) ? reset.toLowerCase() : 'daily'
  };

  const tasks = load('custom-tasks', []);
  tasks.push(task);
  save('custom-tasks', tasks);
  loadCustomTasks();
}

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------
function loadSettings() {
  const settings = load('settings', {});
  const el = (id) => document.getElementById(id);
  if (settings.splitDailies) el('setting-split-dailies').checked = true;
  if (settings.splitWeeklies) el('setting-split-weeklies').checked = true;
  if (settings.herbTicks === 3) el('setting-3tick-herbs').checked = true;
  if (settings.browserNotif) el('setting-browser-notif').checked = true;
  if (settings.webhookUrl) el('setting-webhook-url').value = settings.webhookUrl;
}

function saveSettings() {
  const settings = {
    splitDailies: document.getElementById('setting-split-dailies').checked,
    splitWeeklies: document.getElementById('setting-split-weeklies').checked,
    herbTicks: document.getElementById('setting-3tick-herbs').checked ? 3 : 4,
    browserNotif: document.getElementById('setting-browser-notif').checked,
    webhookUrl: document.getElementById('setting-webhook-url').value.trim()
  };
  save('settings', settings);

  if (settings.browserNotif && Notification.permission === 'default') {
    Notification.requestPermission();
  }
  alert('Settings saved.');
}

// ---------------------------------------------------------------------------
// Import / Export
// ---------------------------------------------------------------------------
function buildExportToken() {
  const profile = getActiveProfile();
  const data = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith(`${STORAGE_KEY_PREFIX}:${profile}:`)) {
      data[key] = localStorage.getItem(key);
    }
  }
  return btoa(JSON.stringify(data));
}

function importToken(token) {
  try {
    const data = JSON.parse(atob(token));
    Object.entries(data).forEach(([k, v]) => localStorage.setItem(k, v));
    location.reload();
  } catch {
    document.getElementById('import-error').classList.remove('hidden');
  }
}

// ---------------------------------------------------------------------------
// Dropdowns and panels
// ---------------------------------------------------------------------------
function setupDropdowns() {
  document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
    toggle.addEventListener('click', e => {
      e.preventDefault();
      const parent = toggle.closest('.dropdown');
      parent.classList.toggle('open');
    });
  });

  // Close dropdowns when clicking outside
  document.addEventListener('click', e => {
    if (!e.target.closest('.dropdown')) {
      document.querySelectorAll('.dropdown.open').forEach(d => d.classList.remove('open'));
    }
  });
}

// ---------------------------------------------------------------------------
// Compact mode
// ---------------------------------------------------------------------------
function setupCompactToggle() {
  const isCompact = load('compact', false);
  if (isCompact) document.body.classList.add('compact');

  document.getElementById('compact-toggle').addEventListener('click', e => {
    e.preventDefault();
    document.body.classList.toggle('compact');
    save('compact', document.body.classList.contains('compact'));
  });
}

// ---------------------------------------------------------------------------
// Import/Export panel toggle
// ---------------------------------------------------------------------------
function setupImportExport() {
  const panel = document.getElementById('import-export-panel');
  document.getElementById('import-export-toggle').addEventListener('click', e => {
    e.preventDefault();
    panel.classList.toggle('hidden');
    if (!panel.classList.contains('hidden')) {
      document.getElementById('export-token').value = buildExportToken();
    }
  });

  document.getElementById('copy-token-btn').addEventListener('click', () => {
    const ta = document.getElementById('export-token');
    ta.select();
    document.execCommand('copy');
  });

  document.getElementById('import-btn').addEventListener('click', () => {
    importToken(document.getElementById('import-token').value.trim());
  });
}

// ---------------------------------------------------------------------------
// Init
// ---------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  checkAutoReset();
  updateTimers();
  setInterval(updateTimers, 1000);

  const cfg = window.TASKS_CONFIG;
  buildRows(cfg.dailies, 'dailies');
  buildRows(cfg.gathering, 'gathering');
  buildRows(cfg.weeklies, 'weeklies');
  buildRows(cfg.weeklyGathering, 'weeklyGathering');
  buildRows(cfg.monthlies, 'monthlies');
  loadCustomTasks();
  loadSettings();
  fetchProfits();
  setupDropdowns();
  setupCompactToggle();
  setupImportExport();

  document.getElementById('add-custom-task-btn').addEventListener('click', showAddCustomTaskModal);
  document.getElementById('save-settings-btn').addEventListener('click', saveSettings);
});