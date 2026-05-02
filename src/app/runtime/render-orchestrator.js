import {
  renderOverviewPanel,
  applyPageModeVisibility,
  collectOverviewItems
} from '../../ui/components/overview/index.js';
import { createRow } from '../../ui/components/tracker/rows/index.js';
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
import { GAMES, getSelectedGame } from '../../core/state/GameContext.js';

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

  const game = getSelectedGame() === GAMES.OSRS ? GAMES.OSRS : GAMES.RS3;
  const uiContext = createUiContext(deps, () => renderApp(deps));
  const sections = getResolvedSections(game);
  const sectionDefinitions = getTrackerSections(game);
  const allSectionDefinitions = getTrackerSections();
  const sectionKeys = allSectionDefinitions.map((section) => section.id);
  const mode = getPageMode(game);
  const visibleSectionIds = new Set(getTrackerPageSectionIds(mode, game));

  reorderDashboardSections(sectionKeys);
  applyPageModeVisibility(mode);

  const dashboard = document.getElementById('dashboard-container');
  if (dashboard) dashboard.style.display = '';

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
