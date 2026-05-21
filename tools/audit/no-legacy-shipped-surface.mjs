import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = fileURLToPath(new URL('../../', import.meta.url));
const targets = ['src/app', 'src/features', 'src/shared', 'src/entities', 'src/pages'];
const forbiddenPatterns = [
	/lib\/runtime\//,
	/lib\/widgets\//,
	/ui\/dom-controls\.ts/,
	/ui\/panel-controls\.ts/,
	/ui\/profile-view\.ts/,
	/ui\/tooltip-engine\.ts/,
	/styles\/legacy-tracker\//,
];

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

assert.equal(matches.length, 0, `Found legacy imperative imports on the shipped app surface:\n${matches.join('\n')}`);
console.log('Legacy shipped-surface audit passed.');
