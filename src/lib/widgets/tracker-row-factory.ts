import { getTrackerSection } from '../domain/legacy-mode-content.ts';
import {
	getCustomTasks,
	getOverviewPins,
	saveCustomTasks,
	saveOverviewPins,
} from '../features/sections/section-state-service.ts';
import { TIMER_SECTION_KEY } from '../features/timers/timer-runtime.ts';
import { StorageKeyBuilder } from '../shared/storage/keys-builder.ts';
import { formatDurationMs } from '../shared/time/formatters.ts';
import { attachTooltip } from '../ui/tooltip-engine.ts';

export const ROW_RENDER_MODES = Object.freeze({
	STANDARD: 'standard',
	RIGHT_SIDE_CHILD: 'right-side-child',
	OVERVIEW: 'overview',
	CUSTOM: 'custom',
});

export const ROW_CLASS_NAMES = Object.freeze({
	CUSTOM: 'custom-task-row',
	OVERVIEW: 'overview-row',
	CHILD_NAME: 'activity_child_name',
});

function normalizeMinutes(value: unknown) {
	const numeric = Number.isFinite(value) ? Number(value) : parseInt(String(value), 10);
	return Number.isFinite(numeric) ? numeric : null;
}

function getCustomTimerText(taskId: string, task: any, load?: <T = any>(key: string, fallback?: T) => T) {
	const cooldownMinutes = normalizeMinutes(task?.cooldownMinutes);
	if (!Number.isFinite(cooldownMinutes) || cooldownMinutes < 1) return '';

	const cooldowns = load?.(StorageKeyBuilder.cooldowns(), {}) || {};
	const active = cooldowns?.[taskId];
	if (active?.readyAt && active.readyAt > Date.now()) {
		return formatDurationMs(active.readyAt - Date.now());
	}

	return formatDurationMs(cooldownMinutes * 60 * 1000);
}

function createTimerColumn(text = '') {
	const cell = document.createElement('td');
	cell.className = 'activity_notes custom-task-timer';
	cell.textContent = text || '';
	return cell;
}

export function childStorageKey(sectionKey: string, parentId: string, childId: string) {
	return StorageKeyBuilder.childTaskStorageId(sectionKey, parentId, childId);
}

export function buildPinId(sectionKey: string, task: any, options: { overviewPinId?: string | null; customStorageId?: string | null } = {}) {
	if (options.overviewPinId) return options.overviewPinId;
	if (typeof options.customStorageId === 'string' && options.customStorageId.includes('::')) return options.customStorageId;
	return StorageKeyBuilder.overviewPinStorageId(sectionKey, task.id);
}

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
	btn.addEventListener('click', (event) => {
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
	badge.textContent = getTrackerSection(sectionKey)?.shortLabel || getTrackerSection(sectionKey)?.label || sectionKey;
	nameCell.appendChild(badge);
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

export function isFarmingChildStorageId(sectionKey: string, taskId: string, task: any) {
	return (
		sectionKey === TIMER_SECTION_KEY &&
		typeof taskId === 'string' &&
		taskId.startsWith(`${TIMER_SECTION_KEY}::`) &&
		taskId.split('::').length >= 3 &&
		!task?.isTimerParent
	);
}

export function shouldIgnoreToggleClick(event: any) {
	return !!event?.target?.closest?.('a, button, select, option, input, textarea, .pin-button, .hide-button, .delete-button, .mini-collapse-btn');
}

export function persistOrderFromTable(sectionKey: string, { getTableId, save }: any) {
	const tableId = getTableId?.(sectionKey);
	if (!tableId) return;

	const table = document.getElementById(tableId);
	if (!table) return;

	const rows = Array.from(table.querySelectorAll('tbody tr[data-id]'));
	const order = rows.map((row) => row.dataset.id).filter(Boolean);
	save(`order:${sectionKey}`, order);
}

export function bindRowOrdering(row: HTMLElement | null, sectionKey: string, { getTableId, save }: any) {
	if (!row || !row.dataset?.id) return;

	const tableId = getTableId?.(sectionKey);
	if (!tableId) return;

	row.setAttribute('draggable', 'true');

	row.addEventListener('dragstart', (event: DragEvent) => {
		event.dataTransfer?.setData('text/plain', row.dataset.id || '');
		row.classList.add('dragging');
	});

	row.addEventListener('dragend', () => {
		row.classList.remove('dragging');
	});

	row.addEventListener('dragover', (event: DragEvent) => {
		event.preventDefault();
		const dragging = document.querySelector<HTMLElement>('.dragging');
		if (!dragging || dragging === row) return;

		const rect = row.getBoundingClientRect();
		const offset = event.clientY - rect.top;

		if (offset > rect.height / 2) row.after(dragging);
		else row.before(dragging);
	});

	row.addEventListener('drop', () => {
		persistOrderFromTable(sectionKey, { getTableId, save });
	});
}

export function createToggleTaskHandler(
	sectionKey: string,
	taskId: string,
	task: any,
	{ load, save, getTaskState, setTaskCompleted, clearTimer, startTimer, startCooldown, renderApp }: any
) {
	return function toggleTask() {
		const state = getTaskState(sectionKey, taskId, task);
		const isCompleted = state === 'true' || state === 'hide';
		const cooldownMinutes = Number.isFinite(task?.cooldownMinutes)
			? task.cooldownMinutes
			: Number.isFinite(task?.cooldown)
				? task.cooldown
				: parseInt(task?.cooldownMinutes ?? task?.cooldown, 10);

		if (isCompleted) {
			setTaskCompleted(sectionKey, taskId, false, { load, save });
		} else {
			setTaskCompleted(sectionKey, taskId, true, { load, save });

			if (sectionKey === TIMER_SECTION_KEY) {
				clearTimer(taskId, { load, save });
				startTimer(task, { load, save });
			}

			if (Number.isFinite(cooldownMinutes) && cooldownMinutes > 0) {
				startCooldown(taskId, cooldownMinutes, { load, save });
			}
		}

		renderApp();
	};
}

function getHiddenRows(sectionKey: string, load: <T = any>(key: string, fallback?: T) => T) {
	return { ...(load(StorageKeyBuilder.sectionHiddenRows(sectionKey), {}) || {}) };
}

function saveHiddenRows(sectionKey: string, value: any, save: (key: string, value: any) => void) {
	save(StorageKeyBuilder.sectionHiddenRows(sectionKey), value);
}

function getRemovedRows(sectionKey: string, load: <T = any>(key: string, fallback?: T) => T) {
	return { ...(load(StorageKeyBuilder.sectionRemovedRows(sectionKey), {}) || {}) };
}

function saveRemovedRows(sectionKey: string, value: any, save: (key: string, value: any) => void) {
	save(StorageKeyBuilder.sectionRemovedRows(sectionKey), value);
}

function removeRowViaX(sectionKey: string, taskId: string, task: any, { load, save }: any) {
	const hiddenRows = getHiddenRows(sectionKey, load);
	const removedRows = getRemovedRows(sectionKey, load);
	hiddenRows[taskId] = task?.name || taskId;
	removedRows[taskId] = task?.name || taskId;
	saveHiddenRows(sectionKey, hiddenRows, save);
	saveRemovedRows(sectionKey, removedRows, save);
}

function bindPinButton(pinBtn: HTMLElement | null, sectionKey: string, task: any, { overviewPinId, customStorageId, load, save, renderApp }: any) {
	if (!pinBtn) return;
	const pinId = buildPinId(sectionKey, task, { overviewPinId, customStorageId });
	const pins = getOverviewPins({ load });
	const pinned = !!pins[pinId];
	pinBtn.textContent = pinned ? '\u2605' : '\u2606';
	pinBtn.title = pinned ? 'Unpin from Overview' : 'Pin to Overview';
	pinBtn.setAttribute('aria-label', pinBtn.title);
	pinBtn.addEventListener('click', (event) => {
		event.preventDefault();
		event.stopPropagation();
		const nextPins = { ...getOverviewPins({ load }) };
		if (nextPins[pinId]) delete nextPins[pinId];
		else nextPins[pinId] = Date.now();
		saveOverviewPins(nextPins, { save });
		renderApp();
	});
}

function bindHideButton(
	hideBtn: HTMLElement | null,
	sectionKey: string,
	taskId: string,
	task: any,
	{ isCustom, isOverviewPanel, customStorageId, load, save, hideTask, renderApp }: any
) {
	if (!hideBtn) return;
	if (isOverviewPanel) {
		hideBtn.style.display = 'none';
		return;
	}

	hideBtn.addEventListener('click', (event) => {
		event.preventDefault();
		event.stopPropagation();
		if (isCustom) {
			if (!confirm(`Delete custom task "${task.name}"?`)) return;
			const next = getCustomTasks({ load }).filter((customTask) => customTask.id !== task.id);
			saveCustomTasks(next, { save });

			const completed = load(StorageKeyBuilder.sectionCompletion('custom'), {});
			const hiddenRows = load(StorageKeyBuilder.sectionHiddenRows('custom'), {});
			const removedRows = load(StorageKeyBuilder.sectionRemovedRows('custom'), {});
			const notified = load('notified:custom', {});

			delete completed[task.id];
			delete hiddenRows[task.id];
			delete removedRows[task.id];
			delete notified[task.id];

			save(StorageKeyBuilder.sectionCompletion('custom'), completed);
			save(StorageKeyBuilder.sectionHiddenRows('custom'), hiddenRows);
			save(StorageKeyBuilder.sectionRemovedRows('custom'), removedRows);
			save('notified:custom', notified);

			const pins = { ...getOverviewPins({ load }) };
			delete pins[StorageKeyBuilder.overviewPinStorageId('custom', task.id)];
			saveOverviewPins(pins, { save });
		} else {
			hideTask(sectionKey, taskId, { load, save });
			removeRowViaX(sectionKey, taskId, task, { load, save });
			const pins = { ...getOverviewPins({ load }) };
			delete pins[buildPinId(sectionKey, task, { customStorageId })];
			saveOverviewPins(pins, { save });
		}

		renderApp();
	});
}

export function createBaseRowShell(sectionKey: string, taskId: string, taskState: unknown, options: any = {}) {
	const { cloneRowTemplate, isCustom = false, extraClass = '', isOverviewPanel = false } = options;

	const row = cloneRowTemplate?.();
	if (!row) return null;

	row.dataset.id = taskId;
	row.dataset.completed = String(taskState ?? '');

	if (extraClass) row.classList.add(extraClass);
	if (isCustom) row.classList.add(ROW_CLASS_NAMES.CUSTOM);
	if (isOverviewPanel) row.classList.add(ROW_CLASS_NAMES.OVERVIEW);

	const nameCell = row.querySelector<HTMLElement>('.activity_name');
	const nameLink = nameCell?.querySelector<HTMLAnchorElement>('a') || null;
	const pinBtn = nameCell?.querySelector<HTMLElement>('.pin-button') || null;
	const hideBtn = nameCell?.querySelector<HTMLElement>('.hide-button') || null;
	const notesCell = row.querySelector<HTMLElement>('.activity_notes');
	const statusCell = row.querySelector<HTMLElement>('.activity_status');
	const desc = row.querySelector<HTMLElement>('.activity_desc');
	const checkOff = statusCell?.querySelector<HTMLElement>('.activity_check_off') || null;
	const checkOn = statusCell?.querySelector<HTMLElement>('.activity_check_on') || null;

	return {
		row,
		sectionKey,
		nameCell,
		nameLink,
		pinBtn,
		hideBtn,
		notesCell,
		statusCell,
		desc,
		checkOff,
		checkOn,
	};
}

function disableLink(link: HTMLAnchorElement | null) {
	if (!link) return;
	link.href = '#';
	link.addEventListener('click', (event) => event.preventDefault());
}

export function populateBaseRowContent(rowParts: any, task: any, options: any = {}) {
	const { renderNameOnRight = false, appendRowText = () => {} } = options;
	const { sectionKey, nameLink, desc } = rowParts;

	if (!nameLink || !desc) return;

	if (renderNameOnRight) {
		desc.textContent = '';

		if (sectionKey === TIMER_SECTION_KEY) {
			if (task.wiki) nameLink.href = task.wiki;
			else disableLink(nameLink);

			nameLink.textContent = task.name;
			attachTooltip(nameLink, task);
		} else {
			nameLink.textContent = '';
			disableLink(nameLink);

			const nameLine = document.createElement('span');
			nameLine.className = `activity_note_line ${ROW_CLASS_NAMES.CHILD_NAME}`;
			nameLine.textContent = task.name;
			desc.appendChild(nameLine);
		}

		appendRowText(desc, task, sectionKey);
		return;
	}

	if (task.wiki) nameLink.href = task.wiki;
	else disableLink(nameLink);

	nameLink.textContent = task.name;
	desc.textContent = '';
	appendRowText(desc, task, sectionKey);
	attachTooltip(nameLink, task);
}

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
		renderApp,
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

	appendWeeklyCollapseButton(nameCell, task, { isCollapsedBlock, setCollapsedBlock, renderApp, isOverviewPanel });
	if (isOverviewPanel) appendSectionBadge(nameCell, sectionKey);

	const actions = createInlineActions?.(task, isCustom);
	if (actions && !isOverviewPanel && desc) desc.appendChild(actions);

	bindPinButton(pinBtn, sectionKey, task, { overviewPinId, customStorageId, load, save, renderApp });
	bindHideButton(hideBtn, sectionKey, taskId, task, { isCustom, isOverviewPanel, customStorageId, load, save, hideTask, renderApp });

	const toggleTask = createToggleTaskHandler(sectionKey, taskId, task, {
		load,
		save,
		getTaskState,
		setTaskCompleted,
		clearTimer,
		startTimer,
		startCooldown,
		renderApp,
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
