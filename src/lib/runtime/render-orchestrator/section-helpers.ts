import { SECTION_CONTAINER_IDS, SECTION_TABLE_IDS } from '../../shared/section-ids.ts';

export function getSectionElements(sectionKey: string) {
	const container = document.getElementById(SECTION_CONTAINER_IDS[sectionKey]);
	const table = document.getElementById(SECTION_TABLE_IDS[sectionKey]);
	const thead = table?.querySelector('thead') || null;
	const tbody = table?.querySelector('tbody') || null;
	return { container, table, thead, tbody };
}

export function reorderDashboardSections(sectionKeys: string[]) {
	const dashboard = document.getElementById('dashboard-container');
	if (!dashboard) return;
	sectionKeys.forEach((sectionKey) => {
		const container = document.getElementById(SECTION_CONTAINER_IDS[sectionKey]);
		if (container) dashboard.appendChild(container);
	});
}

export function setSectionHiddenState(sectionKey: string, hidden: boolean, showHidden = false) {
	const { container, tbody } = getSectionElements(sectionKey);
	if (!container || !tbody) return;
	container.dataset.hide = hidden ? 'hide' : 'show';
	container.dataset.showHidden = showHidden ? 'true' : 'false';
	container.classList.toggle('section-hidden', hidden);
	(tbody as HTMLElement).style.display = hidden ? 'none' : '';

	const hideBtn = document.getElementById(`${sectionKey}_hide_button`) as HTMLElement | null;
	const unhideBtn = document.getElementById(`${sectionKey}_unhide_button`) as HTMLElement | null;
	if (hideBtn) hideBtn.style.display = hidden ? 'none' : '';
	if (unhideBtn) unhideBtn.style.display = hidden ? '' : 'none';
}

export function setSectionModeVisibility(sectionKey: string, visibleSectionIds: Set<string>) {
	const { container } = getSectionElements(sectionKey);
	if (!container) return false;

	const shouldShow = visibleSectionIds.has(sectionKey);

	(container as HTMLElement).style.display = shouldShow ? '' : 'none';
	return shouldShow;
}

export function clearAllSectionBodies(sectionKeys: string[]) {
	sectionKeys.forEach((key) => {
		const { tbody } = getSectionElements(key);
		if (tbody) tbody.innerHTML = '';
	});
}

function clearSectionEdgeMarkers(sectionKeys: string[]) {
	sectionKeys.forEach((key) => {
		const { container } = getSectionElements(key);
		if (!container) return;
		container.classList.remove('last-visible-section', 'visible-open-section', 'visible-hidden-section');
	});
}

export function markVisibleSectionEdges(sectionKeys: string[]) {
	clearSectionEdgeMarkers(sectionKeys);
	const visibleContainers = sectionKeys
		.map((key) => getSectionElements(key).container)
		.filter((container) => container && (container as HTMLElement).style.display !== 'none') as HTMLElement[];

	if (visibleContainers.length === 0) return;
	visibleContainers.forEach((container) => {
		const isHidden = container.dataset.hide === 'hide';
		container.classList.add(isHidden ? 'visible-hidden-section' : 'visible-open-section');
	});
	visibleContainers[visibleContainers.length - 1].classList.add('last-visible-section');
}
