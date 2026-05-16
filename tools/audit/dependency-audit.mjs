import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const repoRoot = fileURLToPath(new URL('../../', import.meta.url));
const packageJson = JSON.parse(await readFile(path.join(repoRoot, 'package.json'), 'utf8'));
const allDeps = { ...(packageJson.dependencies || {}), ...(packageJson.devDependencies || {}) };
const forbiddenDeps = [
	'bootstrap',
	'@astrojs/react',
	'react',
	'react-dom',
	'@types/react',
	'@types/react-dom',
	'nanostores',
	'@nanostores/react',
	'@nanostores/persistent',
];

for (const dep of forbiddenDeps) {
	assert.ok(!(dep in allDeps), `Unexpected dependency still present: ${dep}`);
}

let duplicateConfigExists = true;
try {
	await access(path.join(repoRoot, 'src/content/config.ts'), constants.F_OK);
} catch {
	duplicateConfigExists = false;
}

assert.equal(duplicateConfigExists, false, 'Duplicate content config file still exists at src/content/config.ts.');
console.log('Dependency audit passed.');
