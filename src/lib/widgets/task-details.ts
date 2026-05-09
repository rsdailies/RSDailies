function createTextEntry(kind: string, text: unknown) {
	const normalized = typeof text === 'string' ? text.trim() : '';
	if (!normalized) return null;
	return { kind, text: normalized };
}

function createProfitEntry(item: unknown, qty: unknown) {
	const normalizedItem = typeof item === 'string' ? item.trim() : '';
	const normalizedQty = Number.isFinite(qty) ? Number(qty) : parseInt(String(qty), 10);
	if (!normalizedItem || !Number.isFinite(normalizedQty)) return null;
	return { kind: 'profit', item: normalizedItem, qty: normalizedQty };
}

function synthesizeTaskDetailEntries(task: any) {
	return [
		createTextEntry('note', task?.note),
		createProfitEntry(task?.profit?.item, task?.profit?.qty),
		createTextEntry('duration', task?.durationNote),
		createTextEntry('location', task?.locationNote),
	].filter(Boolean);
}

function normalizeDetailEntry(entry: any) {
	if (!entry) return null;
	if (typeof entry === 'string') return createTextEntry('note', entry);
	if (typeof entry !== 'object') return null;

	if (entry.kind === 'profit') {
		return createProfitEntry(entry.item, entry.qty);
	}

	return createTextEntry(entry.kind || 'note', entry.text);
}

export function getTaskDetailEntries(task: any) {
	const sourceEntries =
		Array.isArray(task?.detailLines) && task.detailLines.length > 0
			? task.detailLines.map(normalizeDetailEntry).filter(Boolean)
			: synthesizeTaskDetailEntries(task);

	const seen = new Set<string>();
	return sourceEntries.filter((entry: any) => {
		const key =
			entry.kind === 'profit' ? `profit:${entry.item}:${entry.qty}` : `${entry.kind}:${String(entry.text).toLowerCase()}`;
		if (seen.has(key)) return false;
		seen.add(key);
		return true;
	});
}

function appendDetailText(container: HTMLElement, className: string, text: string) {
	const span = document.createElement('span');
	span.className = className;
	span.textContent = text;
	container.appendChild(span);
}

function appendProfit(container: HTMLElement, item: string, qty: number) {
	const span = document.createElement('span');
	span.className = 'item_profit';
	span.dataset.item = item;
	span.dataset.qty = String(qty);
	span.textContent = '\u2026';
	container.appendChild(span);
}

export function appendTaskDetails(container: HTMLElement, task: any) {
	getTaskDetailEntries(task).forEach((entry: any) => {
		if (entry.kind === 'profit') {
			appendProfit(container, entry.item, entry.qty);
			return;
		}

		const className =
			entry.kind === 'duration'
				? 'activity_duration_note'
				: entry.kind === 'location'
					? 'activity_location_note'
					: 'activity_note_line';

		appendDetailText(container, className, entry.text);
	});
}
