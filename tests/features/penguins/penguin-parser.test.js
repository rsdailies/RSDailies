import assert from 'node:assert/strict';
import test from 'node:test';

import { parsePenguinActives } from '../../../src/features/penguins/penguin-parser.ts';

test('parsePenguinActives sorts penguins by weight and formats notes', () => {
	const parsed = parsePenguinActives({
		Activepenguin: [
			{
				name: 'B',
				weight: 2,
				points: 1,
				disguise: 'Crate',
				last_location: 'Last seen: seers',
			},
			{
				name: 'A',
				weight: 1,
				points: 2,
				disguise: 'Bush',
				last_location: 'Location: varrock',
				confined_to: 'north wall',
			},
		],
	});

	assert.equal(parsed['penguin-1'].name, 'A');
	assert.equal(parsed['penguin-1'].location, 'Varrock');
	assert.match(parsed['penguin-1'].note, /2-point/);
	assert.match(parsed['penguin-1'].note, /Area: north wall/);
	assert.equal(parsed['penguin-2'].name, 'B');
});

test('parsePenguinActives includes the active polar bear when present', () => {
	const parsed = parsePenguinActives({
		Bear: [
			{ name: 'Inactive Bear', location: 'ardougne', active: '0' },
			{ name: 'Polar Bear', location: 'taverley', active: '1' },
		],
	});

	assert.equal(parsed['penguin-polar-bear'].name, 'Polar Bear');
	assert.equal(parsed['penguin-polar-bear'].location, 'Taverley');
	assert.match(parsed['penguin-polar-bear'].note, /Polar Bear/);
});
