export type AppModalId = 'import-export' | 'custom-task';

class AppShellState {
	activeModal = $state<AppModalId | null>(null);
	private returnFocusTarget: HTMLElement | null = null;

	openModal(modalId: AppModalId, returnFocusTarget: HTMLElement | null = null) {
		this.activeModal = modalId;
		this.returnFocusTarget = returnFocusTarget;
	}

	closeModal() {
		const focusTarget = this.returnFocusTarget;
		this.activeModal = null;
		this.returnFocusTarget = null;
		if (focusTarget && typeof window !== 'undefined') {
			window.requestAnimationFrame(() => focusTarget.focus());
		}
	}

	isModalOpen(modalId: AppModalId) {
		return this.activeModal === modalId;
	}
}

export const appShellState = new AppShellState();
