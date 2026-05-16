import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const repoRoot = fileURLToPath(new URL('../../', import.meta.url));
const routes = [
	{ route: '/rs3/tasks', file: 'dist/rs3/tasks/index.html', heading: 'Daily Tasks' },
	{ route: '/rs3/gathering', file: 'dist/rs3/gathering/index.html', heading: 'Gathering' },
	{ route: '/rs3/timers', file: 'dist/rs3/timers/index.html', heading: 'Timers' },
	{ route: '/osrs/tasks', file: 'dist/osrs/tasks/index.html', heading: 'Daily Tasks' },
];

for (const route of routes) {
	const html = await readFile(path.join(repoRoot, route.file), 'utf8');
	const h1Matches = [...html.matchAll(/<h1\b[^>]*>(.*?)<\/h1>/gi)];
	assert.equal(h1Matches.length, 1, `${route.route} must render exactly one h1.`);
	const headingText = h1Matches[0][1].replace(/<[^>]+>/g, '').trim();
	assert.equal(headingText, route.heading, `${route.route} rendered unexpected h1 text.`);
}

console.log(`Heading audit passed for ${routes.length} canonical routes.`);
