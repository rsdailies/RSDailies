import { getTrackerSections } from '../features/sections/section-registry.ts';
import { buildSectionPanelHtml } from './section-panel.ts';

export function renderAppView(documentRef = document) {
	const dashboardMount = documentRef.getElementById('dashboard-mount');
	if (!dashboardMount) {
		return;
	}

	dashboardMount.innerHTML = getTrackerSections().map(buildSectionPanelHtml).join('\n');
}
