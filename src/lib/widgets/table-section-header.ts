import { HEADER_CLASSES } from './header-constants.ts';
import { createHeaderFrameRow } from './header-frame.ts';
import { createCollapseButton } from './collapse-button.ts';
import { createResetButton } from './reset-button.ts';
import { createRestoreMenu } from './restore-menu.ts';

export function createTableSectionHeader(label: string, blockId: string, options: any = {}) {
	const {
		className = '',
		rightText = '',
		onRightClick = null,
		onResetClick = null,
		restoreOptions = [],
		onRestoreSelect = null,
		collapsible = true,
		context = {},
	} = options;

	const controls: Node[] = [];

	if (rightText) {
		const status = document.createElement('span');
		status.className = HEADER_CLASSES.status;
		status.textContent = rightText;
		controls.push(status);
	}

	if (onResetClick) controls.push(createResetButton(onResetClick));

	const restoreMenu = createRestoreMenu(restoreOptions, onRestoreSelect);
	if (restoreMenu) controls.push(restoreMenu);

	const collapse = collapsible && blockId ? createCollapseButton(blockId, context) : null;
	if (collapse) controls.push(collapse);

	const { row, controlsHost } = createHeaderFrameRow({
		label,
		controls,
		rowClassName: [HEADER_CLASSES.row, className].filter(Boolean).join(' '),
		titleIsHtml: true,
	});

	if (onRightClick) {
		controlsHost.classList.add(HEADER_CLASSES.clickable);
		controlsHost.addEventListener('click', (event: Event) => {
			if ((event.target as Element | null)?.closest('.mini-collapse-btn')) return;
			if ((event.target as Element | null)?.closest('.mini-reset-btn, select')) return;
			onRightClick();
		});
	}

	return row;
}
