import assert from 'node:assert/strict';
import { readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const repoRoot = fileURLToPath(new URL('../../', import.meta.url));
const astroDir = path.join(repoRoot, 'dist/_astro');
const warnBytes = 160 * 1024;
const failBytes = 220 * 1024;

const entries = await readdir(astroDir, { withFileTypes: true });
const cssAssets = entries.filter((entry) => entry.isFile() && entry.name.endsWith('.css'));
assert.ok(cssAssets.length > 0, 'No built CSS assets found in dist/_astro.');

const sizedAssets = await Promise.all(
	cssAssets.map(async (entry) => {
		const { size } = await import('node:fs/promises').then(({ stat }) => stat(path.join(astroDir, entry.name)));
		return { name: entry.name, size };
	})
);

const largest = sizedAssets.reduce((current, entry) => (entry.size > current.size ? entry : current));
assert.ok(
	largest.size <= failBytes,
	`CSS asset budget failed. Largest bundle ${largest.name} is ${(largest.size / 1024).toFixed(1)} KB raw; limit is ${(failBytes / 1024).toFixed(0)} KB.`
);

if (largest.size > warnBytes) {
	console.warn(
		`[asset-budget] Warning: largest CSS bundle ${largest.name} is ${(largest.size / 1024).toFixed(1)} KB raw; warning threshold is ${(warnBytes / 1024).toFixed(0)} KB.`
	);
}

console.log(`Asset budget audit passed. Largest CSS bundle: ${largest.name} (${(largest.size / 1024).toFixed(1)} KB raw).`);
