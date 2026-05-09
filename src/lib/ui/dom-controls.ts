export function replaceInteractiveElement<T extends Element>(element: T | null) {
	if (!element) {
		return null;
	}

	const replacement = element.cloneNode(true) as T;
	element.replaceWith(replacement);
	return replacement;
}

export function setDisplayState(
	element: HTMLElement | null,
	visible: boolean,
	{
		displayValue = 'block',
		stateValue = null,
	}: {
		displayValue?: string;
		stateValue?: { open: string; closed: string } | null;
	} = {}
) {
	if (!element) {
		return;
	}

	element.style.display = visible ? displayValue : 'none';
	element.style.visibility = visible ? 'visible' : 'hidden';
	if (stateValue) {
		element.dataset.display = visible ? stateValue.open : stateValue.closed;
	}
}

export function setPanelOpenState(element: HTMLElement | null, open: boolean, displayValue = 'block') {
	setDisplayState(element, open, {
		displayValue,
		stateValue: { open: 'open', closed: 'closed' },
	});
}

export function isPanelOpen(element: HTMLElement | null) {
	return element?.dataset?.display === 'open';
}

export function positionPanel(panelElement: HTMLElement | null, anchorElement: HTMLElement | null, windowRef = window) {
	if (!panelElement || !anchorElement) return;

	const rect = anchorElement.getBoundingClientRect();
	const margin = 6;
	const minWidth = 320;
	const viewportPadding = 10;
	const width = Math.max(minWidth, panelElement.getBoundingClientRect().width || 0);

	const desiredTop = rect.bottom + margin;
	const desiredLeft = rect.left;

	const top = Math.max(viewportPadding, Math.min(desiredTop, windowRef.innerHeight - viewportPadding - 40));
	const left = Math.max(viewportPadding, Math.min(desiredLeft, windowRef.innerWidth - viewportPadding - width));

	panelElement.style.position = 'fixed';
	panelElement.style.top = `${top}px`;
	panelElement.style.left = `${left}px`;
	panelElement.style.right = 'auto';
}
