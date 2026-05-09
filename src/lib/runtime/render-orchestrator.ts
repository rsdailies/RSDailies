import { renderOverviewPanel, applyPageModeVisibility, collectOverviewItems } from '../widgets/overview.ts';
import { createRow } from '../widgets/tracker-rows.ts';
import { renderLandingPage } from '../renderers/landing-renderer.ts';
import { GAMES, getSelectedGame } from './game-context.ts';
import { getTrackerPageSectionIds, getTrackerSections } from '../domain/legacy-mode-content.ts';
import { clearAllSectionBodies, markVisibleSectionEdges, reorderDashboardSections } from './render-orchestrator/section-helpers.ts';
import { createUiContext } from './render-orchestrator/overview-ui-context.ts';
import { hideAllSortButtons, movePenguinsBlockToBottom } from './render-orchestrator/panel-helpers.ts';
import { renderTrackerSections } from './render-orchestrator/section-orchestrator.ts';

export function renderApp(deps: any) {
	const {
		cleanupReadyTimers,
		cleanupReadyCooldowns,
		hideTooltip,
		getResolvedSections,
		getPageMode,
		getOverviewPins,
		fetchProfits,
		updateProfileHeader,
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
		context: { ...uiContext, isOverviewPanel: true },
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
