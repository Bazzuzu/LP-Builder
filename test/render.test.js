import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderPage } from '../src/render/page.js';
import { globalDefaults } from '../src/presets/global-defaults.js';
import { fixturePage, registry } from '../scripts/fixture.js';

const render = (page, mode = 'export') =>
  renderPage(page, { registry, globals: globalDefaults(), mode });

/** Order of section markers in the output. */
const order = (html) => [...html.matchAll(/<!-- s:(\w+) -->/g)].map((m) => m[1]);

test('sections render in slot order, not array order', () => {
  const page = fixturePage();
  // Shuffle the array: render order must come from slot_index/order_in_slot alone.
  page.sections.reverse();
  const html = render(page);
  const seen = ['Unrivalled comfort', 'Why discerning travellers', 'London Executive Guide',
    'Direct contracts', 'Our fares to London', 'Emirates A380 blueprint', 'Curated in-flight',
    'by Thousands of Business Class', 'Best Business Class Deals', 'Contact Us',
    'Business Travel Group LLC'].map((t) => html.indexOf(t));
  assert.ok(seen.every((i) => i > -1), 'every section rendered');
  assert.deepEqual(seen, [...seen].sort((a, b) => a - b), 'and in the documented order');
});

test('a hidden section is absent from the output entirely', () => {
  const html = render(fixturePage());
  assert.equal(html.includes('Draft block nobody should see'), false);
});

test('only the CSS of section types the page uses ships with it', () => {
  const html = render(fixturePage());
  assert.ok(html.includes('@keyframes mq-scroll'), 'used type css present');
  const page = fixturePage();
  page.sections = page.sections.filter((s) => s.key !== 'SECTION_LOGO_MARQUEE');
  assert.equal(render(page).includes('@keyframes mq-scroll'), false, 'unused type css dropped');
});

test('anchor_id becomes the section id for in-page links', () => {
  assert.match(render(fixturePage()), /<section class="sec [^"]*" id="lounges"/);
});

test('preview wraps sections for selection, export does not', () => {
  assert.ok(render(fixturePage(), 'preview').includes('data-section-id="tm1"'));
  assert.equal(render(fixturePage()).includes('data-section-id'), false);
  assert.equal(render(fixturePage()).includes('lpb-edit'), false);
});

test('a hairline divider appears between two sections sharing a flat background', () => {
  const page = fixturePage();
  // Feature and Text & Media both default to white and sit back to back: a seam belongs
  // between them. Logo Marquee after them defaults to a different tint: no seam there.
  const feat = page.sections.find((s) => s.id === 'feat');
  const tm1 = page.sections.find((s) => s.id === 'tm1');
  const mq = page.sections.find((s) => s.id === 'mq');
  assert.equal(feat.props.bg_color, tm1.props.bg_color);
  assert.notEqual(tm1.props.bg_color, mq.props.bg_color);
  const html = render(page, 'preview');
  assert.match(html, /<div class="lpb-divider"><\/div><div class="lpb-sec" data-section-id="tm1">/);
  assert.doesNotMatch(html, /<div class="lpb-divider"><\/div><div class="lpb-sec" data-section-id="mq">/);
});

test('no divider grows before the very first section', () => {
  const html = render(fixturePage(), 'preview');
  const beforeFirstSection = html.slice(html.indexOf('<body'), html.indexOf('class="lpb-sec"'));
  assert.equal(beforeFirstSection.includes('<div class="lpb-divider">'), false);
});

test('author text is escaped, never executed', () => {
  const page = fixturePage();
  page.sections.find((s) => s.id === 'hero').props.price_main_value = '<script>alert(1)</script>';
  const html = render(page);
  assert.equal(html.includes('<script>alert(1)</script>'), false);
  assert.ok(html.includes('&lt;script&gt;'));
});

test('an unknown section key leaves a comment instead of breaking the page', () => {
  const page = fixturePage();
  page.sections.push({ id: 'ghost', key: 'SECTION_NOPE', slot_index: 5, order_in_slot: 0,
    is_visible: true, anchor_id: null, props: {}, created_at: 0, updated_at: 0 });
  const html = render(page);
  assert.match(html, /unknown section type: SECTION_NOPE/);
  assert.ok(html.includes('Business Travel Group LLC'), 'the rest of the page still renders');
});

test('a renderer that throws does not take the page down', () => {
  const page = fixturePage();
  const broken = { ...registry, SECTION_TRUST: { ...registry.SECTION_TRUST,
    render: () => { throw new Error('boom'); } } };
  const html = renderPage(page, { registry: broken, globals: globalDefaults(), mode: 'export' });
  assert.match(html, /render error in SECTION_TRUST: boom/);
  assert.ok(html.includes('Business Travel Group LLC'));
});

test('the lead modal and the runtime are always present', () => {
  const html = render(fixturePage());
  assert.ok(html.includes('id="lead-modal"'));
  assert.ok(html.includes('aria-modal="true"'));
  assert.ok(html.includes('prefers-reduced-motion'), 'reduced-motion rule shipped');
});

test('page meta reaches the head', () => {
  const html = render(fixturePage());
  assert.ok(html.includes('<title>Business Class JFK → LHR from $1,234</title>'));
  assert.ok(html.includes('name="description" content="Private consolidator fares'));
  assert.equal(html.includes('noindex'), false, 'robots only when the flag is set');
});

test('noindex_nofollow emits the robots tag', () => {
  const page = fixturePage();
  page.meta.noindex_nofollow = true;
  assert.ok(render(page).includes('content="noindex, nofollow"'));
});

test('an empty header renders no header wrapper at all', () => {
  // 11_ABSTRACT §5.1: with both title and subheading empty the wrapper disappears, so an
  // unused header leaves no vertical gap. Cleared on every dynamic section on the page.
  const page = fixturePage();
  for (const s of page.sections) {
    if (s.props.section_title !== undefined) { s.props.section_title = null; s.props.subheading = null; }
  }
  const html = render(page);
  // Match the markup, not the stylesheet — `.sec-head{...}` always lives in BASE_CSS.
  assert.equal(html.includes('<div class="sec-head">'), false);
  assert.ok(html.includes('class="sec h-m a-left"'), 'the section itself still renders');
});

test('a null page renders a valid empty document', () => {
  assert.match(render(null), /^<!doctype html>/);
});
