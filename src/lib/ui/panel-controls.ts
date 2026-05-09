import { isPanelOpen, setPanelOpenState } from './dom-controls.ts';

let globalClickCloserBound = false;

const FLOATING_CONTROL_SELECTORS = [
	'#views-button-panel',
	'#views-control',
	'#profile-button',
	'#profile-control',
	'#settings-button',
	'#settings-control',
	'#token-button',
	'#token-modal',
	'#custom_add_button',
	'#custom-task-modal',
];

export function closeAllFloatingControls(documentRef = document) {
	['profile-control', 'settings-control', 'views-control'].forEach((id) => {
		const element = documentRef.getElementById(id) as HTMLElement | null;
		if (!element) return;
		setPanelOpenState(element, false);
	});
}

export function setupGlobalClickCloser(documentRef = document) {
	if (globalClickCloserBound) return;
	globalClickCloserBound = true;

	documentRef.addEventListener('click', (event) => {
		const target = event.target;
		if (!(target instanceof Element)) return;

		if (FLOATING_CONTROL_SELECTORS.some((selector) => target.closest(selector))) {
			return;
		}

		closeAllFloatingControls(documentRef);
	});
}

export function bindFloatingPanelTrigger({
	button,
	panel,
	closePanels = () => closeAllFloatingControls(button?.ownerDocument || document),
	onOpen = () => setPanelOpenState(panel, true),
	onClose = () => setPanelOpenState(panel, false),
}: {
	button: HTMLElement | null;
	panel: HTMLElement | null;
	closePanels?: () => void;
	onOpen?: () => void;
	onClose?: () => void;
}) {
	if (!button || !panel) {
		return;
	}

	button.addEventListener('click', (event) => {
		event.preventDefault();
		event.stopPropagation();

		if (isPanelOpen(panel)) {
			onClose();
			return;
		}

		closePanels();
		onOpen();
	});
}
