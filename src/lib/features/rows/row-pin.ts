import { getOverviewPins, saveOverviewPins } from '../sections/section-state-service.ts';
import { buildPinId } from './row-ids.ts';

export function bindPinButton(
	pinBtn: HTMLElement | null,
	sectionKey: string,
	task: any,
	{ overviewPinId, customStorageId, load, save, renderApp }: any
) {
	if (!pinBtn) return;
	const pinId = buildPinId(sectionKey, task, { overviewPinId, customStorageId });
	const pins = getOverviewPins({ load });
	const pinned = !!pins[pinId];
	pinBtn.textContent = pinned ? '\u2605' : '\u2606';
	pinBtn.title = pinned ? 'Unpin from Overview' : 'Pin to Overview';
	pinBtn.setAttribute('aria-label', pinBtn.title);
	pinBtn.addEventListener('click', (event) => {
		event.preventDefault();
		event.stopPropagation();
		const nextPins = { ...getOverviewPins({ load }) };
		if (nextPins[pinId]) delete nextPins[pinId];
		else nextPins[pinId] = Date.now();
		saveOverviewPins(nextPins, { save });
		renderApp();
	});
}
