import { HEADER_CLASSES, HEADER_CONTROL_TEXT } from './header-constants.ts';
import { renderHeaderFrameHtml } from './header-frame.ts';

function renderControlButton(id: string, className: string, text: string, variant = 'secondary', options: { dropdown?: boolean } = {}) {
	const dropdownAttrs = options.dropdown
		? `class="btn btn-${variant} btn-sm active primitive-btn ${className} dropdown-toggle no-caret" data-bs-toggle="dropdown" aria-expanded="false"`
		: `class="btn btn-${variant} btn-sm active primitive-btn ${className}"`;

	return `<button id="${id}" type="button" ${dropdownAttrs}>${text}</button>`;
}

function renderRestoreDropdownItems(sectionId: string, hiddenRows: Record<string, any>, completed: Record<string, any>, tasks: any[]) {
	const hiddenIds = Object.keys(hiddenRows).filter((id) => !completed[id]);

	let hiddenItemsHtml = '';
	if (hiddenIds.length > 0) {
		hiddenItemsHtml =
			hiddenIds
				.map((id) => {
					const task = tasks.find((entry) => entry.id === id) || { name: hiddenRows[id] || id };
					return `<li><button class="dropdown-item section-restore-task-btn" type="button" data-task-id="${id}">${task.name}</button></li>`;
				})
				.join('') + '<li><hr class="dropdown-divider"></li>';
	}

	return `
<ul class="dropdown-menu dropdown-menu-dark dropdown-menu-end section-restore-dropdown" aria-labelledby="${sectionId}_reset_button">
  <li><button class="dropdown-item section-restore-all-btn" type="button">Restore All</button></li>
  <li><hr class="dropdown-divider"></li>
  ${hiddenItemsHtml}
  <li><button class="dropdown-item section-clear-completion-btn" type="button">Clear Completed</button></li>
</ul>`.trim();
}

function renderHeaderControls(section: any, deps: any = {}) {
	const { hiddenRows = {}, completed = {}, sectionTasks = [] } = deps;
	const hiddenCount = Object.keys(hiddenRows).length;
	const shell = section.shell || {};
	let html = '';

	if (shell.countdownId) {
		html += `<span id="${shell.countdownId}" class="${HEADER_CLASSES.status} section-panel-countdown">--:--:--</span>`;
	}

	if (shell.showAddButton) {
		html += renderControlButton(`${section.id}_add_button`, 'section-panel-add-button', '+ Add', 'primary');
	}

	if (shell.showResetButton) {
		if (hiddenCount >= 2) {
			html += `
<div class="dropdown d-inline-block">
  ${renderControlButton(`${section.id}_reset_button`, 'section-panel-reset-button', HEADER_CONTROL_TEXT.reset, 'secondary', { dropdown: true })}
  ${renderRestoreDropdownItems(section.id, hiddenRows, completed, sectionTasks)}
</div>`;
		} else {
			html += renderControlButton(`${section.id}_reset_button`, 'section-panel-reset-button', HEADER_CONTROL_TEXT.reset);
		}
	}

	html += renderControlButton(`${section.id}_hide_button`, 'hide_button section-panel-toggle-button', HEADER_CONTROL_TEXT.hide);
	html += renderControlButton(`${section.id}_unhide_button`, 'unhide_button section-panel-toggle-button', HEADER_CONTROL_TEXT.show);

	return html;
}

export function renderSectionPanelHeader(section: any, colspan: number, deps: any = {}) {
	return renderHeaderFrameHtml({
		label: section.label,
		colspan,
		controlsHtml: renderHeaderControls(section, deps),
		barClassName: 'section-panel-header',
		titleClassName: 'section-panel-title',
		controlsClassName: 'section-panel-controls',
	});
}
