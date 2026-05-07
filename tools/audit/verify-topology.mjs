import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];
const mustExist = [
  'src/app/shell/html/index.html',
  'src/app/shell/runtime/layout-loader.js',
  'src/app/shell/runtime/render-app-shell.js',
  'src/app/shell/runtime/section-panel.js',
  'src/app/registries/unified-registry.js',
  'src/app/runtime/render-orchestrator.js',
  'src/app/renderers/tracker-section-renderer.js',
  'src/domain/content/content-loader.js',
  'src/domain/content/validate-content.js',
  'src/shared/lib/storage/storage-service.js',
  'src/shared/lib/storage/keys-builder.js',
  'src/shared/lib/storage/migrations.js',
  'src/shared/state/game-context.js',
  'src/shared/ui/controls.js',
  'src/shared/ui/panel-controls.js',
  'src/theme/tokens/tokens.css',
  'src/theme/base/base.css',
  'src/widgets/headers/header.render.js',
  'src/widgets/tracker/rows/row.render.js',
  'src/widgets/tracker/sections/renderers/section-engine.js',
  'src/widgets/tracker/rows/templates/row-sample.html',
  'src/app/boot/bootstrap.js'
];
for (const rel of mustExist) {
  if (!fs.existsSync(path.join(root, rel))) failures.push('Missing required file: ' + rel);
}
const forbidden = [
  'src/ui',
  'src/core',
  'src/app/shell/styles',
  'src/features/profiles/ui',
  'src/features/settings/ui',
  'src/features/views/ui',
  'src/features/sections/ui',
  'src/app/runtime/legacy',
  'src/ui/components',
  'src/core/dom',
  'src/core/utils',
  'src/core/state'
];
for (const rel of forbidden) {
  if (fs.existsSync(path.join(root, rel))) failures.push('Forbidden removed or misplaced path remains: ' + rel);
}
const registryFile = fs.readFileSync(path.join(root, 'src/app/registries/unified-registry.js'), 'utf8');
if (registryFile.includes("game: 'rs3'")) failures.push('Registry still hardcodes RS3-only resolution: src/app/registries/unified-registry.js');
const resolveContentFile = fs.readFileSync(path.join(root, 'src/domain/content/content-loader.js'), 'utf8');
if (resolveContentFile.includes("game: 'rs3'")) failures.push('Content resolver still hardcodes RS3-only section resolution: src/domain/content/content-loader.js');

const sectionRendererFile = fs.readFileSync(path.join(root, 'src/app/renderers/tracker-section-renderer.js'), 'utf8');
if (/switch\s*\(\s*sectionDefinition\.renderVariant\s*\)/.test(sectionRendererFile)) failures.push('Tracker section renderer still uses central switch dispatch: src/app/renderers/tracker-section-renderer.js');
function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const next = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(next, out);
    else out.push(next);
  }
  return out;
}
for (const file of walk(path.join(root, 'src'))) {
  if (!/\.(js|html|css|md)$/.test(file)) continue;
  const rel = path.relative(root, file);
  const text = fs.readFileSync(file, 'utf8');
  if (text.includes('src/app/shell')) failures.push('Stale app shell reference: ' + rel);
  if (/from ['"].*src\/app\/shell/.test(text)) failures.push('Stale shell import: ' + rel);
  if (text.includes('ui/features/tables/ui/rows')) failures.push('Stale rows compatibility reference: ' + rel);
  if (text.includes('ui/features/import-export') || text.includes('features/import-export')) failures.push('Stale import/export reference: ' + rel);
  if (text.includes('ui/features/sections/ui') || text.includes('features/sections/ui')) failures.push('Stale section UI reference: ' + rel);
  if (text.includes('ui/features/farming') || text.includes('features/farming/styles')) failures.push('Stale farming UI style reference: ' + rel);
  if (text.includes('ui/features/profiles') || text.includes('features/profiles/ui')) failures.push('Stale profile UI reference: ' + rel);
  if (text.includes('ui/features/views') || text.includes('features/views/ui')) failures.push('Stale views UI reference: ' + rel);
  if (text.includes('ParentHandler') || text.includes('SubParentHandler') || text.includes('SubParentLogic')) failures.push('Stale handler naming remains: ' + rel);
}
if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log('Topology audit passed. Canonical UI tracker rows, columns, headers, timer platform files, custom tasks, and import/export are present with removed paths forbidden.');
