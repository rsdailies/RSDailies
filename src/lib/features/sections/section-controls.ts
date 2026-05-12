import { restoreTask, restoreAllTasks } from './task-actions.ts';
import { replaceInteractiveElement } from '../../ui/dom-controls.ts';
import { tracker } from '../../../stores/tracker.svelte';

function rebindButton(documentRef: Document, id: string, onClick: (event: Event) => void) {
	const existing = documentRef.getElementById(id);
	if (!existing) return null;

	const replacement = replaceInteractiveElement(existing);
	if (!replacement) return null;

	replacement.addEventListener('click', (event: Event) => {
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
	const { getSectionState, saveSectionValue, resetSectionView, documentRef = document } = deps;

	removeSectionRestoreControls(sectionKey, { documentRef });

	const container = (
		documentRef.getElementById(`${sectionKey}-container`) ||
		documentRef.getElementById(sectionKey)?.closest('.table_container') ||
		documentRef
	) as Element;

	container.querySelectorAll<HTMLElement>('.section-restore-all-btn').forEach((btn: HTMLElement) => {
		btn.addEventListener('click', (event: Event) => {
			event.preventDefault();
			event.stopPropagation();
			restoreAllTasks(sectionKey, { save: deps.save });
			tracker.reloadAll();
		});
	});

	container.querySelectorAll<HTMLElement>('.section-restore-task-btn').forEach((btn: HTMLElement) => {
		btn.addEventListener('click', (event: Event) => {
			event.preventDefault();
			event.stopPropagation();
			const taskId = btn.dataset.taskId;
			if (taskId) {
				restoreTask(sectionKey, taskId, { load: deps.load, save: deps.save });
				tracker.reloadAll();
			}
		});
	});

	container.querySelectorAll<HTMLElement>('.section-clear-completion-btn').forEach((btn: HTMLElement) => {
		btn.addEventListener('click', (event: Event) => {
			event.preventDefault();
			event.stopPropagation();
			deps.clearSectionCompletionsOnly(sectionKey);
			tracker.reloadAll();
		});
	});

	const resetBtn = documentRef.getElementById(`${sectionKey}_reset_button`);
	const isDropdown = resetBtn?.classList.contains('dropdown-toggle');

	if (!isDropdown) {
		rebindButton(documentRef, `${sectionKey}_reset_button`, () => {
			resetSectionView(sectionKey);
			tracker.reloadAll();
		});
	}

	rebindButton(documentRef, `${sectionKey}_show_hidden_button`, () => {
		const next = !getSectionState(sectionKey).showHidden;
		saveSectionValue(sectionKey, 'showHidden', next);
		tracker.reloadAll();
	});

	rebindButton(documentRef, `${sectionKey}_hide_button`, () => {
		saveSectionValue(sectionKey, 'hideSection', true);
		tracker.reloadAll();
	});

	rebindButton(documentRef, `${sectionKey}_unhide_button`, () => {
		saveSectionValue(sectionKey, 'hideSection', false);
		tracker.reloadAll();
	});

	if (opts.sortable) {
		rebindButton(documentRef, `${sectionKey}_sort_button`, () => {
			const current = getSectionState(sectionKey).sort;
			const next = current === 'default' ? 'alpha' : 'default';
			saveSectionValue(sectionKey, 'sort', next);
			tracker.reloadAll();
		});
	}
}
