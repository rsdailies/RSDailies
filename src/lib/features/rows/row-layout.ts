import { getTrackerSection } from '../sections/section-registry.ts';

export function appendWeeklyCollapseButton(nameCell: Element | null, task: any, context: any = {}) {
	const { isCollapsedBlock, setCollapsedBlock, renderApp, isOverviewPanel = false } = context;
	if (isOverviewPanel) return;
	if (!Array.isArray(task?.children) || task.children.length === 0) return;
	if (!nameCell || !isCollapsedBlock || !setCollapsedBlock || !renderApp) return;

	const blockId = `row-collapse-${task.id}`;
	const collapsed = isCollapsedBlock(blockId);
	const btn = document.createElement('button');
	btn.type = 'button';
	btn.className = 'btn btn-secondary btn-sm mini-collapse-btn';
	btn.textContent = collapsed ? '\u25B6' : '\u25BC';
	btn.title = collapsed ? 'Expand child rows' : 'Collapse child rows';
	btn.setAttribute('aria-label', btn.title);
	btn.addEventListener('click', (event: Event) => {
		event.preventDefault();
		event.stopPropagation();
		setCollapsedBlock(blockId, !isCollapsedBlock(blockId));
		renderApp();
	});

	const actionHost = nameCell.querySelector('.row-actions') || nameCell;
	actionHost.appendChild(btn);
}

export function appendSectionBadge(nameCell: Element | null, sectionKey: string) {
	if (!nameCell) return;
	const badge = document.createElement('span');
	badge.className = 'overview-section-badge';
	const sec = getTrackerSection(sectionKey) as any;
	badge.textContent = sec?.shortLabel || sec?.label || sectionKey;
	
	const link = nameCell.querySelector('a');
	if (link) {
		link.after(badge);
	} else {
		nameCell.appendChild(badge);
	}
}

export function hideRowActionsForOverview(row: Element | null) {
	if (!row) return;
	row.querySelectorAll<HTMLElement>('.hide-button, .mini-collapse-btn').forEach((element) => {
		element.style.display = 'none';
	});
}

export function syncRowActionLayout(nameCell: HTMLElement | null) {
	if (!nameCell) return;
	const actions = nameCell.querySelector<HTMLElement>('.row-actions');
	if (!actions) {
		nameCell.style.removeProperty('--row-action-width');
		return;
	}

	const visibleActions = [...actions.children].filter((element) => {
		const htmlElement = element as HTMLElement;
		return !htmlElement.hidden && htmlElement.style.display !== 'none';
	});

	if (visibleActions.length === 0) {
		nameCell.style.setProperty('--row-action-width', '0px');
		return;
	}

	const actionSize = 32;
	const actionGap = 6;
	const actionWidth = visibleActions.length * actionSize + (visibleActions.length - 1) * actionGap;
	nameCell.style.setProperty('--row-action-width', `${actionWidth}px`);
}

export function shouldIgnoreToggleClick(event: any) {
	return !!event?.target?.closest?.('a, button, select, option, input, textarea, .pin-button, .hide-button, .delete-button, .mini-collapse-btn');
}
