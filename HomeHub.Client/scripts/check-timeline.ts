import assert from 'node:assert/strict';
import { layoutOverlaps } from '../src/lib/timeline.ts';

const placed = layoutOverlaps([
  { item: 'school', start: 540, end: 600 },
  { item: 'dentist', start: 570, end: 630 },
  { item: 'dinner', start: 1080, end: 1140 },
]);

const byItem = Object.fromEntries(placed.map((entry) => [entry.item, entry]));

assert.equal(byItem.school.columns, 2);
assert.equal(byItem.school.column, 0);
assert.equal(byItem.dentist.columns, 2);
assert.equal(byItem.dentist.column, 1);
assert.equal(byItem.dinner.columns, 1);
assert.equal(byItem.dinner.column, 0);

const reused = layoutOverlaps([
  { item: 'a', start: 540, end: 600 },
  { item: 'b', start: 570, end: 630 },
  { item: 'c', start: 600, end: 660 },
]);
const reusedByItem = Object.fromEntries(reused.map((entry) => [entry.item, entry]));

assert.equal(reusedByItem.c.column, 0);
assert.equal(reusedByItem.c.columns, 2);

console.log('Timeline checks passed.');
