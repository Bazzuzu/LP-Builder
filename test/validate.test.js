import { test } from 'node:test';
import assert from 'node:assert/strict';
import { canPublish, validateContent, validatePage, validateStructure } from '../src/model/validate.js';
import { anchors, dyn, page, registry, sec } from './helpers.js';

const codes = (issues) => issues.map((i) => i.code).sort();

test('a well-formed page has no structural issues', () => {
  assert.deepEqual(validateStructure(page(anchors()), registry()), []);
});

test('each missing anchor reports its own code', () => {
  const only = anchors().filter((s) => s.key === 'SECTION_HERO');
  assert.deepEqual(codes(validateStructure(page(only), registry())), ['E002', 'E003', 'E004']);
});

test('an anchor outside its pinned slot is E005', () => {
  const s = anchors();
  s.find((x) => x.key === 'SECTION_TRUST').slot_index = 5;
  const found = validateStructure(page(s), registry());
  assert.equal(found.length, 1);
  assert.equal(found[0].code, 'E005');
  assert.match(found[0].message, /must occupy slot 4/);
});

test('duplicate static modules are E006 and E007', () => {
  const s = [...anchors(),
    sec('SECTION_SUBSCRIPTION', 1, 0, { id: 'sub1' }), sec('SECTION_SUBSCRIPTION', 3, 0, { id: 'sub2' }),
    sec('SECTION_CONTACT', 1, 1, { id: 'c1' }), sec('SECTION_CONTACT', 5, 0, { id: 'c2' })];
  assert.deepEqual(codes(validateStructure(page(s), registry())), ['E006', 'E007']);
});

test('one static module per page is fine', () => {
  const s = [...anchors(), sec('SECTION_SUBSCRIPTION', 3, 0, { id: 'sub' })];
  assert.deepEqual(validateStructure(page(s), registry()), []);
});

test('a dynamic section parked in an anchor slot is E008', () => {
  const s = [...anchors(), dyn('x', 2, 1)];
  const found = validateStructure(page(s), registry());
  assert.equal(found[0].code, 'E008');
  assert.match(found[0].message, /allowed: 1, 3, 5/);
});

test('an unknown component key is E008, not a crash', () => {
  const s = [...anchors(), sec('SECTION_MADE_UP', 1, 0, { id: 'ghost' })];
  const found = validateStructure(page(s), registry());
  assert.equal(found[0].code, 'E008');
  assert.match(found[0].message, /Unknown component key/);
});

/* ------------------------------------------------------------------ L1 */

const withValidator = () => registry({
  SECTION_TEXT_MEDIA: {
    archetype: 'dynamic',
    validate: (props) => (props.title ? [] : [{ level: 'L1', code: 'E100', path: 'title', message: 'Title required.' }]),
  },
});

test('content issues carry the id of the section they came from', () => {
  const s = [...anchors(), dyn('tm', 1, 0)];
  const found = validateContent(page(s), withValidator());
  assert.equal(found.length, 1);
  assert.equal(found[0].sectionId, 'tm');
  assert.equal(found[0].level, 'L1');
});

test('a hidden section is skipped by content validation', () => {
  const hidden = dyn('tm', 1, 0);
  hidden.is_visible = false;
  assert.deepEqual(validateContent(page([...anchors(), hidden]), withValidator()), []);
});

test('a filled section passes', () => {
  const filled = dyn('tm', 1, 0);
  filled.props = { title: 'Seamless Airport Sanctuary' };
  assert.deepEqual(validateContent(page([...anchors(), filled]), withValidator()), []);
});

/* ------------------------------------------------------- the publish gate */

test('publishing is blocked while any level has findings', () => {
  const s = [...anchors(), dyn('tm', 1, 0)];
  const r = canPublish(page(s), withValidator());
  assert.equal(r.ok, false);
  assert.deepEqual(codes(r.blocking), ['E100']);
});

test('publishing is allowed once everything is clean', () => {
  const filled = dyn('tm', 1, 0);
  filled.props = { title: 'Done' };
  assert.equal(canPublish(page([...anchors(), filled]), withValidator()).ok, true);
});

test('a draft with holes still validates without throwing, grouped by level', () => {
  // The editor calls this on every change: it must describe the damage, never refuse to run.
  const r = validatePage(page([dyn('tm', 1, 0)]), withValidator());
  assert.deepEqual(codes(r.L0), ['E001', 'E002', 'E003', 'E004']);
  assert.deepEqual(codes(r.L1), ['E100']);
  assert.deepEqual(r.L2, []);
});
