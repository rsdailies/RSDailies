import { load, save } from '../../core/storage/storage-service.js';
import { 
  getTrackerPageMode, 
  isTrackerPageMode, 
  normalizeTrackerPageMode, 
  getDefaultTrackerPageMode,
  getTrackerPrimaryNavItems,
  getTrackerViewsPanelGroups
} from '../../core/domain/content/content-loader.js';
import { GAMES, getSelectedGame, subscribeToGameChanges } from '../../core/state/game-context.js';
import { replaceInteractiveElement, setPanelOpenState, positionPanel } from '../../core/dom/controls.js';
import { bindFloatingPanelTrigger, closeAllFloatingControls } from '../../core/dom/panel-controls.js';

/**
 * View Controller
 * 
 * authoritatively manages page mode (view) state, persistence, 
 * and the UI lifecycle for view selection controls.
 * 
 * Consolidated from the legacy 'views' feature.
 */

// ============ Domain Logic ============

function getActiveGame(game = getSelectedGame()) {
  return game === GAMES.OSRS ? GAMES.OSRS : GAMES.RS3;
}

function getGamePageModeKey(game) {
  return `pageMode:${game}`;
}

export function syncStoredViewModeToPageMode(game = getActiveGame()) {
  const activeGame = getActiveGame(game);
  const key = getGamePageModeKey(activeGame);
  const current = load(key, null);
  
  if (typeof current === 'string' && isTrackerPageMode(current, activeGame)) {
    return current;
  }

  // Legacy Migration
  let sourceMode = null;
  if (activeGame === GAMES.RS3) {
    sourceMode = load('pageMode', null) || load('viewMode', null);
  }

  const migrated = normalizeTrackerPageMode(sourceMode, null, activeGame);
  save(key, migrated);

  if (activeGame === GAMES.RS3) {
    save('pageMode', migrated);
  }

  return migrated;
}

export function getPageMode(game = getActiveGame()) {
  const activeGame = getActiveGame(game);
  const mode = load(getGamePageModeKey(activeGame), null);
  
  if (typeof mode === 'string' && isTrackerPageMode(mode, activeGame)) {
    return mode;
  }

  return syncStoredViewModeToPageMode(activeGame);
}

export function setPageMode(mode, game = getActiveGame()) {
  const activeGame = getActiveGame(game);
  const normalized = normalizeTrackerPageMode(mode, null, activeGame);

  save(getGamePageModeKey(activeGame), normalized);

  if (activeGame === GAMES.RS3) {
    save('pageMode', normalized);
  }

  try {
    document.dispatchEvent(new CustomEvent('page-mode-sync', { detail: { mode: normalized, game: activeGame } }));
  } catch {
    // noop
  }

  return normalized;
}

// ============ UI Helpers ============

function syncViewsButtonLabel(button, mode, game) {
  if (!button) return;
  const activeGame = getActiveGame(game);
  const modeDef = getTrackerPageMode(mode, activeGame) 
    || getTrackerPageMode(getDefaultTrackerPageMode(activeGame), activeGame);
  button.textContent = modeDef?.buttonLabel || modeDef?.label || 'Overview';
}

function renderViewsList(list, onSelectView, game) {
  if (!list) return;
  list.innerHTML = '';
  
  getTrackerViewsPanelGroups(getActiveGame(game)).forEach((group) => {
    const heading = document.createElement('li');
    heading.className = 'profile-row';
    heading.style.fontWeight = '700';
    heading.style.opacity = '0.9';
    heading.style.paddingTop = '6px';
    heading.textContent = group.heading;
    list.appendChild(heading);

    group.items.forEach((view) => {
      const item = document.createElement('li');
      item.className = 'profile-row';
      const link = document.createElement('a');
      link.href = '#';
      link.className = 'profile-link';
      link.textContent = view.label;
      link.addEventListener('click', (event) => {
        event.preventDefault();
        onSelectView?.(view.mode);
      });
      item.appendChild(link);
      list.appendChild(item);
    });
  });
}

function upsertPrimaryNavLinks(documentRef, onSelectMode, game) {
  const navList = documentRef.querySelector('#navbarSupportedContent .navbar-nav.me-auto');
  if (!navList) return;

  navList.querySelectorAll('[data-primary-page-link="true"]').forEach((node) => node.remove());
  const resourcesItem = navList.querySelector('.nav-item.dropdown');

  getTrackerPrimaryNavItems(getActiveGame(game)).forEach((definition) => {
    const li = documentRef.createElement('li');
    li.dataset.primaryPageLink = 'true';

    if (definition.type === 'dropdown') {
      li.className = 'nav-item dropdown';
      const toggle = documentRef.createElement('a');
      toggle.className = 'nav-link dropdown-toggle';
      toggle.href = '#';
      toggle.role = 'button';
      toggle.textContent = definition.label;

      const menu = documentRef.createElement('ul');
      menu.className = 'dropdown-menu';

      toggle.addEventListener('click', (event) => {
        event.preventDefault();
        const nextOpen = !li.classList.contains('show');
        li.classList.toggle('show', nextOpen);
        menu.classList.toggle('show', nextOpen);
      });

      definition.items.forEach((itemDef) => {
        const item = documentRef.createElement('li');
        const link = documentRef.createElement('a');
        link.className = 'dropdown-item';
        link.href = '#';
        link.textContent = itemDef.label;
        link.addEventListener('click', (event) => {
          event.preventDefault();
          li.classList.remove('show');
          menu.classList.remove('show');
          onSelectMode(itemDef.mode);
        });
        item.appendChild(link);
        menu.appendChild(item);
      });
      li.appendChild(toggle);
      li.appendChild(menu);
    } else {
      li.className = 'nav-item';
      const link = documentRef.createElement('a');
      link.className = 'nav-link';
      link.href = '#';
      link.textContent = definition.label;
      link.addEventListener('click', (event) => {
        event.preventDefault();
        onSelectMode(definition.mode);
      });
      li.appendChild(link);
    }

    if (resourcesItem) navList.insertBefore(li, resourcesItem);
    else navList.appendChild(li);
  });
}

// ============ UI Lifecycle ============

export const closeFloatingControls = closeAllFloatingControls;

export function setupViewsControl({
  renderApp = () => {},
  documentRef = document,
  windowRef = window,
  closeAll = () => closeAllFloatingControls(documentRef),
} = {}) {
  syncStoredViewModeToPageMode();
  const panelButton = documentRef.getElementById('views-button-panel');
  const panel = documentRef.getElementById('views-control');
  const list = documentRef.getElementById('views-list');
  if (!panelButton || !panel || !list) return;

  const button = replaceInteractiveElement(panelButton);
  const panelTitle = panel.querySelector('strong');
  if (panelTitle && panelTitle.textContent.trim().toLowerCase() === 'views') {
    panelTitle.remove();
  }

  function applyMode(mode) {
    const game = getActiveGame();
    setPageMode(mode, game);
    syncViewsButtonLabel(button, mode, game);
    setPanelOpenState(panel, false);
    renderApp();
  }

  function renderList(game = getActiveGame()) {
    renderViewsList(list, applyMode, game);
  }

  function openPanel() {
    closeAll();
    renderList();
    setPanelOpenState(panel, true);
    positionPanel(panel, button, windowRef);
  }

  const initialGame = getActiveGame();
  upsertPrimaryNavLinks(documentRef, applyMode, initialGame);
  const currentMode = getPageMode(initialGame);
  syncViewsButtonLabel(button, currentMode, initialGame);

  bindFloatingPanelTrigger({
    button,
    panel,
    closePanels: closeAll,
    onOpen: openPanel,
  });

  documentRef.addEventListener('page-mode-sync', (event) => {
    const game = event?.detail?.game || getActiveGame();
    const mode = event?.detail?.mode || getPageMode(game);
    syncViewsButtonLabel(button, mode, game);
    renderList(game);
  });

  subscribeToGameChanges((game) => {
    const activeGame = getActiveGame(game);
    const nextMode = syncStoredViewModeToPageMode(activeGame);
    upsertPrimaryNavLinks(documentRef, applyMode, activeGame);
    renderList(activeGame);
    syncViewsButtonLabel(button, nextMode, activeGame);
    renderApp();
  });
}
