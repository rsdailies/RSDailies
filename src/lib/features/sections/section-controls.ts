import { restoreTask, restoreAllTasks } from './task-actions.ts';
import { replaceInteractiveElement } from '../../ui/dom-controls.ts';

function rebindButton(documentRef: Document, id: string, onClick: (event: Event) => void) {
	const existing = documentRef.getElementById(id);
	if (!existing) return null;

	const replacement = replaceInteractiveElement(existing);

	replacement.addEventListener('click', (event) => {
		event.preventDefault();
		event.stopPropagation();
		onClick(event);
	});

	return replacement;
}

function removeSectionRestoreControls(sectionKey: string, { documentRef = document } = {}) {
	const hideBtn = documentRef.getElementById(`${sectionKey}_hide_button`);
	if (!hideBtn) return;

	const controlsHost = hideBtn.parentElement;
	if (!controlsHost) return;

	controlsHost.querySelectorAll(`[data-restore-ui="${sectionKey}"]`).forEach((node) => node.remove());
}

export function bindSectionControls(sectionKey: string, opts: { sortable?: boolean } = { sortable: false }, deps: any) {
	const { renderApp, getSectionState, saveSectionValue, resetSectionView, documentRef = document } = deps;

	removeSectionRestoreControls(sectionKey, { documentRef });

	const container = documentRef.getElementById(sectionKey)?.closest('.table_container') || documentRef;

	container.querySelectorAll('.section-restore-all-btn').forEach((btn) => {
		btn.addEventListener('click', (event) => {
			event.preventDefault();
			event.stopPropagation();
			restoreAllTasks(sectionKey, { save: deps.save });
			renderApp();
		});
	});

	container.querySelectorAll('.section-restore-task-btn').forEach((btn) => {
		btn.addEventListener('click', (event) => {
			event.preventDefault();
			event.stopPropagation();
			const taskId = (btn as HTMLElement).dataset.taskId;
			if (taskId) {
				restoreTask(sectionKey, taskId, { load: deps.load, save: deps.save });
				renderApp();
			}
		});
	});

	container.querySelectorAll('.section-clear-completion-btn').forEach((btn) => {
		btn.addEventListener('click', (event) => {
			event.preventDefault();
			event.stopPropagation();
			deps.clearSectionCompletionsOnly(sectionKey);
			renderApp();
		});
	});

	const resetBtn = documentRef.getElementById(`${sectionKey}_reset_button`);
	const isDropdown = resetBtn?.classList.contains('dropdown-toggle');

	if (!isDropdown) {
		rebindButton(documentRef, `${sectionKey}_reset_button`, () => {
			resetSectionView(sectionKey);
			renderApp();
		});
	}

	rebindButton(documentRef, `${sectionKey}_show_hidden_button`, () => {
		const next = !getSectionState(sectionKey).showHidden;
		saveSectionValue(sectionKey, 'showHidden', next);
		renderApp();
	});

	rebindButton(documentRef, `${sectionKey}_hide_button`, () => {
		saveSectionValue(sectionKey, 'hideSection', true);
		renderApp();
	});

	rebindButton(documentRef, `${sectionKey}_unhide_button`, () => {
		saveSectionValue(sectionKey, 'hideSection', false);
		renderApp();
	});

	if (opts.sortable) {
		rebindButton(documentRef, `${sectionKey}_sort_button`, () => {
			const current = getSectionState(sectionKey).sort;
			const next = current === 'default' ? 'alpha' : 'default';
			saveSectionValue(sectionKey, 'sort', next);
			renderApp();
		});
	}
}
