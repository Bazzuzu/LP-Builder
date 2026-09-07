import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as slots from '../src/model/slots.js';
import { anchors, dyn, sec } from './helpers.js';

const ids = (list) => list.map((s) => s.id).join(',');

test('render order sorts by slot, then by order within slot', () => {
  const s = [dyn('b', 1, 1), dyn('d', 3, 0), dyn('a', 1, 0), ...anchors()];
  assert.equal(ids(slots.inRenderOrder(s)), 'hero,a,b,prices,d,trust,footer');
});

test('repack makes order dense per slot and leaves other slots alone', () => {
  const s = [dyn('a', 1, 5), dyn('b', 1, 9), dyn('c', 3, 2)];
  slots.repack(s);
  assert.deepEqual(s.map((x) => x.order_in_slot), [0, 1, 0]);
});

test('appendToSlot puts the section last in its slot', () => {
  const s = [dyn('a', 1, 0), dyn('b', 1, 1)];
  slots.appendToSlot(s, dyn('c', 0, 0), 1);
  assert.equal(ids(slots.sectionsInSlot(s, 1)), 'a,b,c');
});

test('insertAfter places a duplicate directly beneath its source', () => {
  const s = [dyn('a', 1, 0), dyn('b', 1, 1), dyn('c', 1, 2)];
  slots.insertAfter(s, dyn('a-copy', 0, 0), 'a');
  assert.equal(ids(slots.sectionsInSlot(s, 1)), 'a,a-copy,b,c');
});

test('moveUp swaps with the sibling above inside the same slot', () => {
  const s = [dyn('a', 1, 0), dyn('b', 1, 1), dyn('c', 1, 2)];
  assert.equal(slots.moveUp(s, 'c'), true);
  assert.equal(ids(slots.sectionsInSlot(s, 1)), 'a,c,b');
});

test('moveDown swaps with the sibling below inside the same slot', () => {
  const s = [dyn('a', 1, 0), dyn('b', 1, 1), dyn('c', 1, 2)];
  assert.equal(slots.moveDown(s, 'a'), true);
  assert.equal(ids(slots.sectionsInSlot(s, 1)), 'b,a,c');
});

test('moving up across an anchor lands LAST in the slot above', () => {
  // The section crosses Prices upward, so it must appear directly above Prices —
  // at the end of slot 1, not at its start.
  const s = [dyn('a', 1, 0), dyn('b', 1, 1), dyn('d', 3, 0), ...anchors()];
  assert.equal(slots.moveUp(s, 'd'), true);
  assert.equal(s.find((x) => x.id === 'd').slot_index, 1);
  assert.equal(ids(slots.sectionsInSlot(s, 1)), 'a,b,d');
  assert.equal(ids(slots.inRenderOrder(s)), 'hero,a,b,d,prices,trust,footer');
});

test('moving down across an anchor lands FIRST in the slot below', () => {
  const s = [dyn('a', 1, 0), dyn('b', 1, 1), dyn('d', 3, 0), ...anchors()];
  assert.equal(slots.moveDown(s, 'b'), true);
  assert.equal(s.find((x) => x.id === 'b').slot_index, 3);
  assert.equal(ids(slots.sectionsInSlot(s, 3)), 'b,d');
  assert.equal(ids(slots.inRenderOrder(s)), 'hero,a,prices,b,d,trust,footer');
});

test('a section moved down then up returns to where it started', () => {
  const s = [dyn('a', 1, 0), dyn('b', 1, 1), ...anchors()];
  slots.moveDown(s, 'b');
  slots.moveUp(s, 'b');
  assert.equal(ids(slots.inRenderOrder(s)), 'hero,a,b,prices,trust,footer');
});

test('the first section of the first dynamic slot cannot move up', () => {
  const s = [dyn('a', 1, 0), ...anchors()];
  assert.equal(slots.canMoveUp(s, 'a'), false);
  assert.equal(slots.moveUp(s, 'a'), false);
});

test('the last section of the last dynamic slot cannot move down', () => {
  const s = [dyn('z', 5, 0), ...anchors()];
  assert.equal(slots.canMoveDown(s, 'z'), false);
  assert.equal(slots.moveDown(s, 'z'), false);
});

test('anchors never move', () => {
  const s = [dyn('a', 1, 0), ...anchors()];
  for (const id of ['hero', 'prices', 'trust', 'footer']) {
    assert.equal(slots.canMoveUp(s, id), false, `${id} moved up`);
    assert.equal(slots.canMoveDown(s, id), false, `${id} moved down`);
    assert.equal(slots.moveUp(s, id), false);
    assert.equal(slots.moveDown(s, id), false);
  }
  assert.equal(ids(slots.inRenderOrder(s)), 'hero,a,prices,trust,footer');
});

test('static modules travel the same path as dynamic ones', () => {
  const s = [sec('SECTION_CONTACT', 3, 0, { id: 'contact' }), dyn('a', 1, 0), ...anchors()];
  assert.equal(slots.moveUp(s, 'contact'), true);
  assert.equal(ids(slots.sectionsInSlot(s, 1)), 'a,contact');
});

test('removing a section closes the gap it leaves', () => {
  const s = [dyn('a', 1, 0), dyn('b', 1, 1), dyn('c', 1, 2)];
  assert.equal(slots.removeSection(s, 'b'), true);
  assert.deepEqual(slots.sectionsInSlot(s, 1).map((x) => x.order_in_slot), [0, 1]);
  assert.equal(slots.removeSection(s, 'nope'), false);
});
