import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const roots = [
	'README.md',
	'astro.config.mjs',
	'playwright.config.js',
	'svelte.config.js',
	'tsconfig.json',
	'vercel.json',
	'package.json',
	'biome.json',
	'src',
	'tests',
	'tools',
];

const textExtensions = new Set(['.astro', '.css', '.js', '.json', '.md', '.mdx', '.mjs', '.svelte', '.ts']);
const mojibakePattern = /(?:\uFFFD|[\u00C2\u00C3\u00E2\u00F0][\u0080-\u00FF\u2010-\u2040]+)/;

async function collectFiles(entryPath) {
	const fullPath = path.join(repoRoot, entryPath);
	const stat = await fs.stat(fullPath);
	if (stat.isFile()) return [fullPath];

	const files = [];
	for (const child of await fs.readdir(fullPath, { withFileTypes: true })) {
		const childPath = path.join(fullPath, child.name);
		if (child.isDirectory()) {
			files.push(...(await collectFiles(path.relative(repoRoot, childPath))));
			continue;
		}

		if (textExtensions.has(path.extname(child.name))) {
			files.push(childPath);
		}
	}

	return files;
}

const files = (await Promise.all(roots.map((root) => collectFiles(root)))).flat();
const matches = [];

for (const filePath of files) {
	const content = await fs.readFile(filePath, 'utf8');
	if (mojibakePattern.test(content)) {
		matches.push(path.relative(repoRoot, filePath));
	}
}

assert.equal(matches.length, 0, `Found mojibake-style encoding drift in:\n${matches.join('\n')}`);
console.log(`Mojibake audit passed for ${files.length} text files.`);
