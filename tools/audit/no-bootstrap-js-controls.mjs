import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const repoRoot = fileURLToPath(new URL('../../', import.meta.url));
const targets = [
	'src/components',
	'src/layouts',
	'src/pages',
	'src/lib',
	'tests',
];

const matches = [];

for (const relativeTarget of targets) {
	const absoluteTarget = path.join(repoRoot, relativeTarget);
	const stack = [absoluteTarget];
	while (stack.length > 0) {
		const current = stack.pop();
		const stat = await import('node:fs/promises').then(({ stat }) => stat(current));
		if (stat.isDirectory()) {
			const entries = await import('node:fs/promises').then(({ readdir }) => readdir(current, { withFileTypes: true }));
			for (const entry of entries) stack.push(path.join(current, entry.name));
			continue;
		}
		if (!/\.(astro|svelte|ts|js|mjs|css|json)$/.test(current)) continue;
		const text = await readFile(current, 'utf8');
		if (text.includes('data-bs-') || text.includes('bootstrap/dist/css') || /from\s+['"]bootstrap['"]/.test(text)) {
			matches.push(path.relative(repoRoot, current));
		}
	}
}

assert.equal(matches.length, 0, `Found Bootstrap JS controls in:\n${matches.join('\n')}`);
console.log('Bootstrap JS control audit passed.');
