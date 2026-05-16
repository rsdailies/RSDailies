import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const repoRoot = fileURLToPath(new URL('../../', import.meta.url));
const targets = [
	'src/components',
	'src/layouts',
	'src/pages',
	'src/styles',
];

const forbiddenTokens = [
	'alert',
	'alert-secondary',
	'align-text-top',
	'badge',
	'bg-dark',
	'bg-secondary',
	'btn',
	'btn-close',
	'btn-danger',
	'btn-lg',
	'btn-outline-danger',
	'btn-outline-primary',
	'btn-primary',
	'btn-secondary',
	'btn-sm',
	'btn-warning',
	'col-12',
	'col-auto',
	'container-fluid',
	'container-xl',
	'd-inline-block',
	'dropdown',
	'dropdown-divider',
	'dropdown-header',
	'dropdown-item',
	'dropdown-menu',
	'dropdown-toggle',
	'fixed-top',
	'form-check',
	'form-check-input',
	'form-check-label',
	'form-control',
	'form-group',
	'form-label',
	'form-select',
	'form-text',
	'g-3',
	'h5',
	'invalid-feedback',
	'mb-0',
	'mb-3',
	'mt-1',
	'ms-auto',
	'me-auto',
	'nav-item',
	'nav-link',
	'nav-pills',
	'navbar',
	'navbar-brand',
	'navbar-collapse',
	'navbar-expand-lg',
	'navbar-nav',
	'navbar-toggler',
	'navbar-toggler-icon',
	'py-2',
	'row',
	'table',
	'table-dark',
	'table-hover',
	'text-center',
	'w-100',
];

const escapedTokens = forbiddenTokens.map((token) => token.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'));
const tokenPattern = new RegExp(`(?<![-\\w])(?:${escapedTokens.join('|')})(?![-\\w])`);
const selectorPattern = new RegExp(`(?<![-\\w])\\.(?:${escapedTokens.join('|')})(?![-\\w])`);
const classAttrPattern = /class\s*=\s*(?:"[^"]*"|'[^']*'|`[^`]*`|\{`[\s\S]*?`\})/g;

const matches = [];

for (const relativeTarget of targets) {
	const absoluteTarget = path.join(repoRoot, relativeTarget);
	const stack = [absoluteTarget];
	while (stack.length > 0) {
		const current = stack.pop();
		const currentStat = await stat(current);
		if (currentStat.isDirectory()) {
			const entries = await readdir(current, { withFileTypes: true });
			for (const entry of entries) stack.push(path.join(current, entry.name));
			continue;
		}
		if (!/\.(astro|svelte|css)$/.test(current)) continue;
		const text = await readFile(current, 'utf8');
		if (current.endsWith('.css')) {
			if (selectorPattern.test(text)) {
				matches.push(path.relative(repoRoot, current));
			}
			continue;
		}
		const classAttrs = text.match(classAttrPattern) || [];
		if (classAttrs.some((value) => tokenPattern.test(value))) {
			matches.push(path.relative(repoRoot, current));
		}
	}
}

assert.equal(matches.length, 0, `Found Bootstrap-flavored class vocabulary in:\n${matches.join('\n')}`);
console.log('Bootstrap-flavored class vocabulary audit passed.');
