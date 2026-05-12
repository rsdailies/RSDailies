import { buildCustomTask, isValidOptionalUrl } from './builders.ts';
import { readTaskForm, resetCustomTaskForm, syncTimerVisibility } from './form.ts';
import { promptAddCustomTask } from './prompt.ts';
import { replaceInteractiveElement } from '../../ui/dom-controls.ts';

export function setupCustomAdd(deps: any) {
	const { getCustomTasks, saveCustomTasks, renderApp, bootstrapRef = (window as any).bootstrap, documentRef = document } = deps;
	const existingAddBtn = documentRef.getElementById('custom_add_button');
	if (!existingAddBtn) return;

	const addBtn = replaceInteractiveElement(existingAddBtn);
	const modalEl = documentRef.getElementById('custom-task-modal');
	let saveBtn = documentRef.getElementById('custom-task-save');
	const nameInput = documentRef.getElementById('custom-task-name') as HTMLInputElement | null;
	const noteInput = documentRef.getElementById('custom-task-note') as HTMLInputElement | null;
	const wikiInput = documentRef.getElementById('custom-task-wiki') as HTMLInputElement | null;
	const resetSelect = documentRef.getElementById('custom-task-reset') as HTMLSelectElement | null;
	const alertInput = documentRef.getElementById('custom-task-alert') as HTMLInputElement | null;
	const timerBlock = documentRef.getElementById('custom-task-timer-block') as HTMLElement | null;
	const timerMinsInput = documentRef.getElementById('custom-task-timer-mins') as HTMLInputElement | null;
	const form = documentRef.getElementById('custom-task-form') as HTMLFormElement | null;

	const hasModal = !!(
		modalEl &&
		saveBtn &&
		nameInput &&
		noteInput &&
		wikiInput &&
		resetSelect &&
		alertInput &&
		timerBlock &&
		timerMinsInput &&
		form
	);
	const bootstrapModal = hasModal && bootstrapRef?.Modal ? bootstrapRef.Modal.getOrCreateInstance(modalEl) : null;

	if (!bootstrapModal || !saveBtn || !nameInput || !noteInput || !wikiInput || !resetSelect || !alertInput || !timerBlock || !timerMinsInput || !form) {
		addBtn.addEventListener('click', (event: Event) => {
			event.preventDefault();
			promptAddCustomTask(deps);
		});
		return;
	}

	const activeSaveBtn = replaceInteractiveElement(saveBtn);
	resetSelect.addEventListener('change', () => syncTimerVisibility(resetSelect, timerBlock, alertInput));

	addBtn.addEventListener('click', (event: Event) => {
		event.preventDefault();
		resetCustomTaskForm({ nameInput, noteInput, wikiInput, resetSelect, alertInput, timerMinsInput, timerBlock });
		syncTimerVisibility(resetSelect, timerBlock, alertInput);
		bootstrapModal.show();
		window.setTimeout(() => nameInput.focus(), 50);
	});

	form.addEventListener('submit', (event: Event) => {
		event.preventDefault();
		activeSaveBtn.click();
	});

	activeSaveBtn.addEventListener('click', (event: Event) => {
		event.preventDefault();
		nameInput.classList.remove('is-invalid');
		wikiInput.classList.remove('is-invalid');

		const formValues = readTaskForm({ nameInput, noteInput, wikiInput, resetSelect, alertInput, timerMinsInput });
		if (!formValues.rawName) {
			nameInput.classList.add('is-invalid');
			nameInput.focus();
			return;
		}
		if (!isValidOptionalUrl(formValues.rawWiki)) {
			wikiInput.classList.add('is-invalid');
			wikiInput.focus();
			return;
		}

		const task = buildCustomTask(formValues);
		const existing = Array.isArray(getCustomTasks()) ? getCustomTasks() : [];
		saveCustomTasks([...existing, task]);
		bootstrapModal.hide();
		renderApp();
	});
}
