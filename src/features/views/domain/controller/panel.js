import { getPageMode, syncStoredViewModeToPageMode, setPageMode } from '../model.js';
import { positionPanel } from '../../../../ui/components/views/view-panel.js';
import { replaceInteractiveElement, setPanelOpenState } from '../../../../core/dom/controls.js';
import { bindFloatingPanelTrigger } from '../../../../core/dom/panel-controls.js';
import { subscribeToGameChanges } from '../../../../core/state/game-context.js';
import { upsertPrimaryNavLinks } from './panel/primary-nav.js';
import { getActiveGame, syncViewsButtonLabel } from './panel/shared.js';
import { renderViewsList } from './panel/views-list.js';

export function closeFloatingControls(documentRef = document) {
  ['profile-control', 'settings-control', 'views-control'].forEach((id) => {
    const element = documentRef.getElementById(id);
    if (!element) return;
    setPanelOpenState(element, false);
  });
}

export function setupViewsControl({
  renderApp = () => {},
  documentRef = document,
  windowRef = window,
  closeAllFloatingControls = () => closeFloatingControls(documentRef),
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
    closeAllFloatingControls();
    renderList();
    setPanelOpenState(panel, true);
    positionPanel(panel, button, windowRef);
  }

  const initialGame = getActiveGame();
  upsertPrimaryNavLinks(documentRef, applyMode, initialGame);
  const currentMode = getPageMode(initialGame);
  setPageMode(currentMode, initialGame);
  syncViewsButtonLabel(button, currentMode, initialGame);

  bindFloatingPanelTrigger({
    button,
    panel,
    closePanels: closeAllFloatingControls,
    onOpen: openPanel,
  });

  documentRef.addEventListener('page-mode-sync', (event) => {
    const game = event?.detail?.game || getActiveGame();
    const mode = event?.detail?.mode || getPageMode(game);
    syncViewsButtonLabel(button, mode, game);
    renderList();
  });

  subscribeToGameChanges((game) => {
    const activeGame = getActiveGame(game);
    const nextMode = syncStoredViewModeToPageMode(activeGame);
    setPageMode(nextMode, activeGame);
    upsertPrimaryNavLinks(documentRef, applyMode, activeGame);
    renderList(activeGame);
    syncViewsButtonLabel(button, nextMode, activeGame);
    renderApp();
  });
}
