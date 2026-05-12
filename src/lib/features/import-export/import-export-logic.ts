import { IMPORT_EXPORT_ELEMENT_IDS } from './import-export-constants.ts';

export function getImportExportElements(documentRef = document) {
	return {
		tokenButton: documentRef.getElementById(IMPORT_EXPORT_ELEMENT_IDS.button),
		tokenModal: documentRef.getElementById(IMPORT_EXPORT_ELEMENT_IDS.modal),
		tokenOutput: documentRef.getElementById(IMPORT_EXPORT_ELEMENT_IDS.output) as HTMLInputElement | null,
		tokenInput: documentRef.getElementById(IMPORT_EXPORT_ELEMENT_IDS.input) as HTMLInputElement | null,
		tokenCopy: documentRef.getElementById(IMPORT_EXPORT_ELEMENT_IDS.copy),
		tokenImport: documentRef.getElementById(IMPORT_EXPORT_ELEMENT_IDS.import),
	};
}

export function hasImportExportElements(elements: any) {
	return Boolean(
		elements.tokenButton &&
			elements.tokenModal &&
			elements.tokenOutput &&
			elements.tokenInput &&
			elements.tokenCopy &&
			elements.tokenImport
	);
}

export async function copyTextToClipboard(
	text: string,
	fallbackTarget: HTMLInputElement,
	documentRef = document,
	navigatorRef = navigator
) {
	try {
		await navigatorRef.clipboard.writeText(text);
	} catch {
		fallbackTarget.focus();
		fallbackTarget.select();
		(documentRef as any).execCommand('copy');
	}
}

export function readImportToken(input: HTMLInputElement) {
	return String(input.value || '').trim();
}
