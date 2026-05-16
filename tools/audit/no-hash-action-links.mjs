import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const repoRoot = fileURLToPath(new URL('../../', import.meta.url));
const targets = ['src/components', 'src/layouts', 'src/pages', 'src/lib', 'tests'];
const forbiddenPatterns = [/href=\s*["']#["']/g, /\|\|\s*["']#["']/g, /\?\?\s*["']#["']/g];
const matches = [];

async function walk(currentPath) {
	const entries = await readdir(currentPath, { withFileTypes: true });
	for (const entry of entries) {
		const fullPath = path.join(currentPath, entry.name);
		if (entry.isDirectory()) {
			await walk(fullPath);
			continue;
		}
		if (!/\.(astro|svelte|ts|js|mjs)$/.test(entry.name)) continue;
		const text = await readFile(fullPath, 'utf8');
		if (forbiddenPatterns.some((pattern) => pattern.test(text))) {
			matches.push(path.relative(repoRoot, fullPath));
		}
	}
}

for (const target of targets) {
	await walk(path.join(repoRoot, target));
}

assert.equal(matches.length, 0, `Found hash-based action links in:\n${matches.join('\n')}`);
console.log('Hash action-link audit passed.');
