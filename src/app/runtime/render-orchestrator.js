import {
  renderOverviewPanel,
  applyPageModeVisibility,
  collectOverviewItems
} from '../../widgets/overview/index.js';
import { createRow } from '../../widgets/tracker/rows/index.js';
import {
  clearAllSectionBodies,
  markVisibleSectionEdges,
  reorderDashboardSections,
} from './render-orchestrator/section-helpers.js';
import { createUiContext } from './render-orchestrator/overview-ui-context.js';
import {
  hideAllSortButtons,
  movePenguinsBlockToBottom
} from './render-orchestrator/panel-helpers.js';
import { getTrackerPageSectionIds, getTrackerSections } from '../registries/unified-registry.js';
import { renderTrackerSections } from './render-orchestrator/section-orchestrator.js';
import { GAMES, getSelectedGame } from '../../shared/state/game-context.js';
import { renderLandingPage } from '../renderers/landing-renderer.js';

export function renderApp(deps) {
  const {
    cleanupReadyTimers,
    cleanupReadyCooldowns,
    hideTooltip,
    getResolvedSections,
    getPageMode,
    getOverviewPins,
    fetchProfits,
    updateProfileHeader
  } = deps;

  cleanupReadyTimers();
  cleanupReadyCooldowns();
  hideTooltip();

  const game = getSelectedGame();
  const landingMount = document.getElementById('landing-mount');
  const overviewMount = document.getElementById('overview-mount');
  const dashboard = document.getElementById('dashboard-container');
  
  if (!game) {
    if (landingMount) landingMount.style.display = '';
    if (overviewMount) overviewMount.style.display = 'none';
    if (dashboard) dashboard.style.display = 'none';

    renderLandingPage({ ...deps, renderApp: () => renderApp(deps) });
    return;
  }

  // Clear landing mount when game is selected
  if (landingMount) {
    landingMount.style.display = 'none';
    landingMount.innerHTML = '';
  }
  if (overviewMount) overviewMount.style.display = '';
  if (dashboard) dashboard.style.display = '';

  const uiContext = createUiContext(deps, () => renderApp(deps));
  const sections = getResolvedSections(game);
  const sectionDefinitions = getTrackerSections(game);
  const allSectionDefinitions = getTrackerSections();
  const sectionKeys = allSectionDefinitions.map((section) => section.id);
  const mode = getPageMode(game);
  const visibleSectionIds = new Set(getTrackerPageSectionIds(mode, game));

  reorderDashboardSections(sectionKeys);
  applyPageModeVisibility(mode);

  clearAllSectionBodies(sectionKeys);

  // Delegate section rendering to orchestrator
  renderTrackerSections(sections, visibleSectionIds, deps, uiContext);

  movePenguinsBlockToBottom();
  markVisibleSectionEdges(sectionKeys);

  renderOverviewPanel(sections, {
    getPageMode: () => getPageMode(game),
    getOverviewPins,
    load: deps.load,
    applyPageModeVisibility,
    ensureOverviewLayout: () => document.getElementById('overview-content'),
    collectOverviewItems,
    createRow,
    context: { ...uiContext, isOverviewPanel: true }
  });

  hideAllSortButtons();
  fetchProfits();
  updateProfileHeader();

  sectionDefinitions
    .filter((section) => section.supportsTaskNotifications)
    .forEach((section) => {
      const key = section.id;
      const tasks = sections[key];
      if (Array.isArray(tasks)) {
        tasks.forEach((task) => deps.maybeNotifyTaskAlert(task, key));
      }
    });
}
