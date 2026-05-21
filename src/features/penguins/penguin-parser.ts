function sanitizeText(value: unknown) {
	return String(value || '')
		.replace(/\s+/g, ' ')
		.trim();
}

function cleanLocation(text: string) {
	let clean = String(text || '')
		.replace(/(Last seen:|Location:)\s*/i, '')
		.replace(/\(#\d+\)\s*/g, '')
		.trim();
	if (clean) {
		clean = clean.charAt(0).toUpperCase() + clean.slice(1);
	}
	return clean;
}

function buildPenguinNote(entry: any) {
	const parts = [];

	if (entry.points) parts.push(`${entry.points}-point`);
	if (entry.disguise) parts.push(entry.disguise);
	if (entry.last_location) parts.push(cleanLocation(entry.last_location));
	if (entry.confined_to) parts.push(`Area: ${sanitizeText(entry.confined_to)}`);
	if (entry.warning) parts.push(`Warning: ${sanitizeText(entry.warning)}`);
	if (entry.requirements) parts.push(`Req: ${sanitizeText(entry.requirements)}`);

	return parts.join(' | ');
}

function buildPolarBearNote(entry: any) {
	const parts = [];

	if (entry.name) parts.push(sanitizeText(entry.name));
	if (entry.location) parts.push(cleanLocation(entry.location));

	return parts.join(' | ');
}

export function parsePenguinActives(payload: any) {
	const penguins = Array.isArray(payload?.Activepenguin) ? [...payload.Activepenguin] : [];
	const bear = Array.isArray(payload?.Bear) ? payload.Bear.find((entry: any) => String(entry?.active) === '1') : null;

	penguins.sort((left: any, right: any) => {
		const leftWeight = Number(left?.weight) || Number.MAX_SAFE_INTEGER;
		const rightWeight = Number(right?.weight) || Number.MAX_SAFE_INTEGER;
		return leftWeight - rightWeight;
	});

	const parsed: Record<
		string,
		{
			name: string;
			note: string;
			points?: string;
			disguise?: string;
			location?: string;
			area?: string;
			warning?: string;
			req?: string;
		}
	> = {};

	penguins.slice(0, 12).forEach((entry: any, index: number) => {
		parsed[`penguin-${index + 1}`] = {
			name: sanitizeText(entry?.name) || `Penguin ${index + 1}`,
			points: entry.points ? `${entry.points} point${entry.points > 1 ? 's' : ''}` : '1 point',
			disguise: entry.disguise || '',
			location: cleanLocation(entry.last_location),
			area: entry.confined_to ? `Area: ${sanitizeText(entry.confined_to)}` : '',
			warning: entry.warning ? `Warning: ${sanitizeText(entry.warning)}` : '',
			req: entry.requirements ? `Req: ${sanitizeText(entry.requirements)}` : '',
			note: buildPenguinNote(entry),
		};
	});

	if (bear) {
		parsed['penguin-polar-bear'] = {
			name: 'Polar Bear',
			points: '2 points',
			disguise: bear.name || '',
			location: cleanLocation(bear.location),
			area: '',
			warning: '',
			req: '',
			note: buildPolarBearNote(bear),
		};
	}

	return parsed;
}
