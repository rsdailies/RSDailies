import { TIMER_SECTION_KEY } from '../timers/timer-runtime.ts';
import { attachTooltip } from '../../ui/tooltip-engine.ts';
import { ROW_CLASS_NAMES } from './constants.ts';

function disableLink(link: HTMLAnchorElement | null) {
	if (!link) return;
	link.href = '#';
	link.addEventListener('click', (event) => event.preventDefault());
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
