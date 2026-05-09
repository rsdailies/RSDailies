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
	importProfileToken = () => {},
	onImport = () => window.location.reload(),
} = {}) {
	const elements = getImportExportElements(documentRef);
	if (!hasImportExportElements(elements)) return;

	const buttonReplacement = replaceInteractiveElement(elements.tokenButton);
	const copyReplacement = replaceInteractiveElement(elements.tokenCopy);
	const importReplacement = replaceInteractiveElement(elements.tokenImport);

	buttonReplacement.addEventListener('click', () => {
		elements.tokenOutput.value = buildExportToken();
		elements.tokenInput.classList.remove('is-invalid');
	});

	copyReplacement.addEventListener('click', async (event) => {
		event.preventDefault();
		event.stopPropagation();
		await copyTextToClipboard(elements.tokenOutput.value || '', elements.tokenOutput, documentRef, navigatorRef);
	});

	importReplacement.addEventListener('click', (event) => {
		event.preventDefault();
		event.stopPropagation();

		elements.tokenInput.classList.remove('is-invalid');
		const value = readImportToken(elements.tokenInput);

		if (!value) {
			elements.tokenInput.classList.add('is-invalid');
			return;
		}

		importProfileToken(value);
		onImport(value);
	});
}
