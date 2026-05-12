import {
	copyTextToClipboard,
	getImportExportElements,
	hasImportExportElements,
	readImportToken,
} from './import-export-logic.ts';
import { replaceInteractiveElement } from '../../ui/dom-controls.ts';

export function setupImportExport({
	documentRef = document,
	navigatorRef = navigator,
	buildExportToken = () => '',
	importProfileToken = (_val: string) => {},
	onImport = (_val: string) => window.location.reload(),
} = {}) {
	const elements = getImportExportElements(documentRef);
	if (!hasImportExportElements(elements)) return;

	const { tokenButton, tokenCopy, tokenImport, tokenInput, tokenOutput } = elements;
	if (!tokenButton || !tokenCopy || !tokenImport || !tokenInput || !tokenOutput) return;

	const buttonReplacement = replaceInteractiveElement(tokenButton);
	const copyReplacement = replaceInteractiveElement(tokenCopy);
	const importReplacement = replaceInteractiveElement(tokenImport);
	if (!buttonReplacement || !copyReplacement || !importReplacement) return;

	buttonReplacement.addEventListener('click', () => {
		tokenOutput.value = buildExportToken();
		tokenInput.classList.remove('is-invalid');
	});

	copyReplacement.addEventListener('click', async (event: Event) => {
		event.preventDefault();
		event.stopPropagation();
		await copyTextToClipboard(tokenOutput.value || '', tokenOutput, documentRef, navigatorRef);
	});

	importReplacement.addEventListener('click', (event: Event) => {
		event.preventDefault();
		event.stopPropagation();

		tokenInput.classList.remove('is-invalid');
		const value = readImportToken(tokenInput);

		if (!value) {
			tokenInput.classList.add('is-invalid');
			return;
		}

		importProfileToken(value);
		onImport(value);
	});
}
