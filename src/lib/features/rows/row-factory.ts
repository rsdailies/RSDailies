import { appendSectionBadge, appendWeeklyCollapseButton, hideRowActionsForOverview, syncRowActionLayout } from './row-layout.ts';
import { bindPinButton } from './row-pin.ts';
import { bindHideButton } from './row-hide.ts';
import { bindRowOrdering } from './row-order.ts';
import { createToggleTaskHandler } from './row-toggle.ts';
import { createBaseRowShell, populateBaseRowContent } from './row-shell.ts';
import { createTimerColumn, getCustomTimerText } from './row-timers.ts';
import { childStorageKey } from './row-ids.ts';

export function attachBaseRowBehaviors(rowParts: any, task: any, options: any = {}) {
	const {
		sectionKey,
		taskId,
		isCustom = false,
		customStorageId = null,
		renderNameOnRight = false,
		context = {},
		overviewPinId = null,
	} = options;
	const {
		load,
		save,
		getTaskState,
		createInlineActions,
		hideTask,
		setTaskCompleted,
		clearTimer,
		startTimer,
		startCooldown,
		getTableId,
		isCollapsedBlock,
		setCollapsedBlock,
		isOverviewPanel = false,
	} = context;
	const { row, nameCell, pinBtn, hideBtn, notesCell, statusCell, desc, checkOff, checkOn } = rowParts;

	appendWeeklyCollapseButton(nameCell, task, { isCollapsedBlock, setCollapsedBlock, isOverviewPanel });
	if (isOverviewPanel) appendSectionBadge(nameCell, sectionKey);

	const actions = createInlineActions?.(task, isCustom);
	if (actions && !isOverviewPanel && desc) desc.appendChild(actions);

	bindPinButton(pinBtn, sectionKey, task, { overviewPinId, customStorageId, load, save });
	bindHideButton(hideBtn, sectionKey, taskId, task, { isCustom, isOverviewPanel, customStorageId, load, save, hideTask });

	const toggleTask = createToggleTaskHandler(sectionKey, taskId, task, {
		load,
		save,
		getTaskState,
		setTaskCompleted,
		clearTimer,
		startTimer,
		startCooldown,
	});

	if (isCustom && !renderNameOnRight && notesCell && statusCell) {
		notesCell.classList.add('custom-task-notes');
		statusCell.classList.add('custom-task-status');

		const timerText = getCustomTimerText(taskId, task, load);
		const customTimerCell = createTimerColumn(timerText);
		row.insertBefore(customTimerCell, notesCell);
		customTimerCell.addEventListener('click', toggleTask);
	}

	notesCell?.addEventListener('click', toggleTask);
	statusCell?.addEventListener('click', toggleTask);

	if (!isOverviewPanel) bindRowOrdering(row, sectionKey, { getTableId, save });
	else {
		hideRowActionsForOverview(row);
		row.removeAttribute('draggable');
	}

	if (renderNameOnRight) {
		if (checkOff) checkOff.style.display = '';
		if (checkOn) checkOn.style.display = '';
	}

	syncRowActionLayout(nameCell);
}

export function createBaseRow(sectionKey: string, task: any, options: any = {}) {
	const { isCustom = false, extraClass = '', customStorageId = null, renderNameOnRight = false, context = {} } = options;
	const { getTaskState, cloneRowTemplate, isOverviewPanel = false, overviewPinId = null } = context;

	const taskId = customStorageId || task.id;
	const taskState = typeof getTaskState === 'function' ? getTaskState(sectionKey, taskId, task) : false;
	const rowParts = createBaseRowShell(sectionKey, taskId, taskState, {
		cloneRowTemplate,
		isCustom,
		extraClass,
		isOverviewPanel,
	});
	if (!rowParts) return null;

	const { nameCell, nameLink, notesCell, statusCell, desc, checkOff, checkOn, row } = rowParts;
	if (!nameCell || !nameLink || !notesCell || !statusCell || !desc || !checkOff || !checkOn) return row;

	populateBaseRowContent(rowParts, task, {
		renderNameOnRight,
		appendRowText: context.appendRowText,
	});
	attachBaseRowBehaviors(rowParts, task, {
		sectionKey,
		taskId,
		isCustom,
		customStorageId,
		renderNameOnRight,
		context,
		overviewPinId,
	});

	return row;
}

export function createRow(sectionKey: string, task: any, options: any = {}) {
	const { isCustom = false, extraClass = '', context = {} } = options;
	return createBaseRow(sectionKey, task, {
		isCustom,
		extraClass,
		renderNameOnRight: false,
		context,
	});
}

export function createRightSideChildRow(sectionKey: string, task: any, parentId: string, options: any = {}) {
	const { extraClass = '', context = {} } = options;
	return createBaseRow(sectionKey, task, {
		extraClass,
		customStorageId: childStorageKey(sectionKey, parentId, task.id),
		renderNameOnRight: true,
		context,
	});
}
