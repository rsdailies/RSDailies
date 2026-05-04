import test from 'node:test';
import assert from 'node:assert/strict';

import { buildTooltipText } from '../../../../src/ui/primitives/tooltips/tooltip-engine.js';

test('tooltip text stays blank when a task only defines an inline note', () => {
  assert.equal(
    buildTooltipText({
      name: 'Vis wax',
      note: 'Use daily rune combination'
    }),
    ''
  );
});

test('tooltip text uses hover.note when explicitly provided', () => {
  assert.equal(
    buildTooltipText({
      name: 'Vis wax',
      note: 'Use daily rune combination',
      hover: { note: 'Check rune prices before crafting.' }
    }),
    'Check rune prices before crafting.'
  );
});

test('tooltip text supports legacy hoverNote during transition', () => {
  assert.equal(
    buildTooltipText({
      name: 'Vis wax',
      hoverNote: 'Legacy hover note still renders.'
    }),
    'Legacy hover note still renders.'
  );
});
