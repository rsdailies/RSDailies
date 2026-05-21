import assert from 'node:assert/strict';
import { constants } from 'node:fs';
import { access, readFile, readdir, stat } from 'node:fs/promises';
import { builtinModules } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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

const builtinSpecifiers = new Set([...builtinModules, ...builtinModules.map((name) => `node:${name}`)]);
const allowedVirtualImports = new Set(['astro:actions', 'astro:content', 'astro/loaders', 'astro/zod']);
const allowedAliasPrefixes = ['@app/', '@entities/', '@features/', '@shared/'];
const packageAllowlist = new Set(Object.keys(allDeps));
const unresolvedImports = [];

function getPackageName(specifier) {
	if (specifier.startsWith('@')) {
		const [scope, name] = specifier.split('/');
		return scope && name ? `${scope}/${name}` : specifier;
	}

	return specifier.split('/')[0];
}

async function collectUnresolvedImports(relativeTarget) {
	const fullTarget = path.join(repoRoot, relativeTarget);
	const targetStat = await stat(fullTarget);

	if (targetStat.isDirectory()) {
		const entries = await readdir(fullTarget, { withFileTypes: true });
		for (const entry of entries) {
			await collectUnresolvedImports(path.join(relativeTarget, entry.name));
		}
		return;
	}

	if (!/\.(ts|js|mjs|astro|svelte)$/.test(relativeTarget)) return;

	const text = await readFile(fullTarget, 'utf8');
	const code = text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
	const importMatches = code.matchAll(
		/(?:import|export)\s+[^'"]*?from\s+['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)/g,
	);

	for (const match of importMatches) {
		const specifier = match[1] || match[2];
		if (
			!specifier ||
			specifier.startsWith('.') ||
			specifier.startsWith('/') ||
			allowedAliasPrefixes.some((prefix) => specifier.startsWith(prefix)) ||
			builtinSpecifiers.has(specifier) ||
			allowedVirtualImports.has(specifier)
		) {
			continue;
		}

		const packageName = getPackageName(specifier);
		if (!packageAllowlist.has(packageName)) {
			unresolvedImports.push(`${relativeTarget} -> ${specifier}`);
		}
	}
}

for (const target of ['src', 'tests', 'tools', 'astro.config.mjs', 'playwright.config.js', 'svelte.config.js']) {
	await collectUnresolvedImports(target);
}

assert.equal(
	unresolvedImports.length,
	0,
	`Found direct imports without matching declared dependencies:\n${unresolvedImports.join('\n')}`,
);

let duplicateConfigExists = true;
try {
	await access(path.join(repoRoot, 'src/content/config.ts'), constants.F_OK);
} catch {
	duplicateConfigExists = false;
}

assert.equal(duplicateConfigExists, false, 'Duplicate content config file still exists at src/content/config.ts.');
console.log('Dependency audit passed.');
