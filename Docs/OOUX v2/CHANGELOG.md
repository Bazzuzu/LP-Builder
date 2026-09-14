# CHANGELOG

The history of the model. **The specs describe the system; this file describes how it got
there.** If a change needs a "why not the way it was" justification, that justification lives
here, not in an attribute table.

Entry format: what changed → why the previous version did not work.

---

## Revision 2 — reconciling the model

An audit found 24 contradictions between the documents. The decisions taken are below.

### System level

**`SYS-02-ENUMS` added — the canonical registry.**
`component_key` existed in four incompatible spellings (`'HERO'`, `'SECTION_FOOTER'`,
`'STATIC_CONTACT'`, `SECTION_QUICK_FACTS`), and regions were defined twice with different lists.
All keys were brought to the `SECTION_` prefix.

**Critical:** the publish validator checked `hasComponent('FOOTER')` while the footer declared
`component_key: 'SECTION_FOOTER'`. A correctly assembled page failed with `E004`.

**Regions:** the lists in `20` (6 values) and `50` (8 values) disagreed, and neither contained
the Americas. There is now one list of 10 values in `SYS-02 §2`.

**Positional model: `order_index` → `slot_index` + `order_in_slot`.**
A flat `order_index` with anchors pinned to 0/2/4/6 physically cannot express more than one
dynamic section between two anchors. `slot_index` did not exist as a field at all, even though
`SYS-00 §3.2` prescribed changing it when moving a section across an anchor. For static modules
the default `order_index` was literally "Dynamic Slot Index" — a slot number in an order field.

**Validation levels L0 / L1 / L2.**
Some documents blocked "saving" and others "publishing", and `meta_title` with
`Required: Yes, Default: None` made creating a draft impossible. A draft now always saves,
content completeness is checked at publish, and format is checked per field.

### Lead generation

**`first_name`/`last_name` → `full_name`, `passengers{adults,children,infants}` →
`passengers.total`.** The CRM contract required fields the form does not physically collect: the
Hero has one "Name\*" field and one passenger counter from 1 to 9.

**`cabin_class` became its own field on a price row.** The modal was populating the enum
`'Business' | 'First' | 'Premium Economy'` from `label_1` — a free-text field whose own example
in the spec (`"Business Class"`) is not a member of that enum, and whose neighbour (`"Nonstop"`)
is not about cabin at all.

**`#quote-modal` → `#lead-modal`.** The first spelling corresponded to nothing; CTAs using it led
nowhere.

**Consent and attribution added.** The form collects a name, an email address and a phone number,
including in GDPR jurisdictions, and had neither a consent checkbox nor a link to a policy. The
telemetry carried no `utm_*`, `gclid`, `referrer` or `session_id` — the basics of lead reporting.

**`21_OBJECT_FLIGHT_QUOTE_MODAL` created.** The key object of the funnel existed only as a
hydration function; the modal's fields were described nowhere, while the spec asserted that both
forms are identical.

### Sections

**Hero.** The `cta_button_color` default was `rgba(0,0,0,0.88)` — byte for byte the dark theme's
background: a black button on a black ground out of the box. Replaced with bronze, and a contrast
check was added. The asterisk beside the price was drawn unconditionally while no footnote field
existed — `*` now appears only together with `price_footnote`. The timer had neither a timezone
nor a defined behaviour past zero. There was no rule for what happens to colours when the theme
changes.

**Prices.** `title_font_weight: ['Bold','Italic']` mixed weight and style on one axis. The bulk
import separator `/` occurs inside the content itself (the default column heading is
`"Published / Our Fare"`) with no escaping; replaced with `|`. The convention "an empty field is
a dash" made the value `-` unrepresentable. There was no append/replace mode, no handling of
malformed lines, and no enforcement of the 30-row limit. Region tabs degenerated into a lone
`[All]`, and the behaviour of `Global` rows inside a regional tab was undefined. A price row was
a clickable `div` with no keyboard access.

**Trust.** §4.2 contained migration instructions ("DEPRECATED", "PERMANENTLY DELETED", "apply the
padding token from Figma") instead of describing the object; moved into this file (see below).
The `Compact` mode had no structural description at all. The global store was the only one
without a schema.

**Quick Facts.** A partially filled card (title present, paragraph empty) was silently dropped
from the layout — the only place in the system where losing content was not a validation error.
`layout_direction: LTR|RTL` was replaced with `media_side`.

**Multi-Card Grid.** "The array length is strictly equal to `card_count`" contradicted the rule
about retaining data when the count is reduced. The mobile layout was described as "a stack or a
carousel" — two different components in one phrase.

**Text & Media.** The same control was called `media_position` here, `alignment` in
`03-subtype-schemas` and `layout_direction` in the base class. `media_side` was kept.

**Logo Marquee.** An infinite animation with no exception for `prefers-reduced-motion` is a
vestibular trigger. The `speed` field was not described.

**Feature.** See the separate section below.

**Landing Page.** Changing the slug of a published page silently destroyed its SEO — a mandatory
301 was added. Unpublish returned "404 or a redirect" (an unresolved choice) — fixed at `410`.
Duplication unconditionally appended `-copy`, which on repetition produced a collision and chains
of `-copy-copy`.

### Base classes

**`layout_direction` removed.** It was mandatory for every dynamic section, meaningful for two,
duplicated `media_position` on Text & Media, and its `RTL` token conflicts with writing direction
in a product targeting the Middle East.

**Switching a variant became non-destructive.** The previous rule overwrote every field with the
target variant's preset. Highlighted and Standard differ only in icon size — an administrator
adjusting a section's visual weight lost all of its text. Meanwhile Multi-Card Grid already
promised data retention for the equivalent action.

**Toggle Visibility.** The base class permitted toggling "for all sections" while four
descendants declared it blocked.

**The `alt` contract.** No alt field existed for any image — not for `og_image`, not for the Hero
background, not for the cards. Introduced centrally in `SYS-02 §6`.

**`anchor_id`.** Sections had no identifier for in-page links, while CTAs declared support for
relative paths.

---

## Revision 3 — readability

**This file was created.** In revision 2 the justifications for changes were written directly
into the attribute tables (26 insertions of the form "*Renamed from…*", "*Previously…*"). Useful
for reading a diff, noise for reading a spec: the document began explaining its own history
instead of describing the system. Exactly what Trust §4.2 was criticised for in revision 2.

**The specs were decoupled from the code.** The "IMPLEMENTATION STATUS" sections and the
references to `src/` were removed from the object documents. The documentation became
self-contained and described the target system; reconciliation with the current implementation
lived in one place, `BACKLOG.md`. The `APPROVED_SPEC_AHEAD` status was abolished.

**The Feature section was collapsed.** Three variants (`Highlighted` / `Standard` / `Compact`)
were described by three schemas, three presets and three validation branches, differing in
exactly three parameters: icon size, item count, presence of a paragraph. It is now one object
with parameters and a table of three named presets. The document shrank by roughly half.

**Copy-paste removed from the sections.** The tables "Inherited Dynamic Styling Overrides" and
"Lifecycle & Admin CTAs" were repeated almost verbatim in six documents. Replaced with a
reference to the base class plus one line of that section's own defaults.

**`03-subtype-schemas.md` deleted,** its selector table moved into `02-system-taxonomy.md`. The
file existed as a summary, drifted from its sources twice (Quick Facts cards, the Card 4 field in
Standard, the control name in Text & Media) and was a third source of truth where one was needed.

---

## Appendix: the Trust v2.0.0 migration (historical)

From `32_OBJECT_SECTION_TRUST.md §4.2`, where this description was mistakenly formatted as a
specification:

* The outer Trustpilot container, its background plate and nested borders were removed.
* The `24/7 Support`, `SSL Secured` and `PCI DSS Compliant` cards were removed from the markup.
* The celebrity review block's padding was brought onto the brand padding token.

⚠ A related observation, still open: "24/7" continues to be asserted by `operational_notice` in
Contact and by the Feature `Compact` preset; accreditations are shown three times — as badges in
the Hero, as seals in the footer, and by the Feature `Standard` preset. This is a content
decision, carried into `ROADMAP.md`.

---

## Revision 4 — corrections found during implementation

**`SYS-00 §3.1`, moving a section across an anchor: the directions were reversed.** It prescribed
`order_in_slot = 0` when moving up and `len(slot)` when moving down. That is backwards: a section
moving up would land at the start of the slot above, jumping it entirely instead of stepping one
position. Correct is the opposite — up to the end of the slot, down to the start. Found while
writing `src/model/slots.js`.

**`SYS-00 §5` and `SYS-02 §4` disagreed on the publish condition.** The first required L0+L1, the
second L0+L1+L2. Brought to the SYS-02 canon: all three levels are checked. In practice L2 is
already empty by publish time, but an imported or hand-edited document would otherwise slip past
the format check.

**`E005` and `E008` overlapped on anchors.** An anchor in the wrong slot violates both rules at
once and received two codes for one error. Anchors were taken out from under `E008`: their
placement is described by `E005`, and `E008` remains about modules in a forbidden slot.

---

## Revision 5 — Feature: a preset instead of independent parameters

**`icon_size` and `has_paragraph` stopped being independent fields.** Revision 3 collapsed Feature
into one object with three parameters, presenting Highlighted/Standard/Compact as shorthand for
their combinations — a model that read more cleanly on paper. In practice `icon_size` and
`has_paragraph` never change on their own: 64px belongs only to Highlighted, and the absence of a
paragraph is not a switch layered on top of Compact but what Compact *is*. Independent controls
for them let an inspector assemble combinations that exist in no design, and masked the fact that
the three presets are three different layouts rather than one layout with two toggles. Both
parameters remain in the internal representation (`props`), but the control for choosing them was
removed from the inspector — they are set only through `_preset`. `item_count` stayed an
independent field: it is the one dimension that genuinely varies separately from the preset.

**Presets got their own layouts, not just an icon size.** The referenced sketches showed that
Standard is not Highlighted with a smaller icon: it is a horizontal row (icon left, title and
paragraph right, left-aligned), while Highlighted is a vertical centred stack. Compact
additionally received vertical dividers between items. `41_OBJECT_SECTION_FEATURE.md §4.3` and
`§6.4` were updated accordingly.

---

## Revision 6 — Text & Media: the title column does not depend on having a photo

**The `No Photo` mode no longer collapses into a single column.** Previously, with no photo the
section became one full-width block (clamped at 780px) — the only mode breaking the two-column
rhythm that `1 Photo` and `2 Photos` hold. The title now always occupies a column of its own (at
the top, with empty space beneath it — which is expected, not a layout bug), and `subtitle` +
`paragraph` + CTA move into the second column, where the image would have been. `media_side`
remains hidden in this mode — there is nothing to position.

**A `subtitle` field was added.** An optional bold line between the title and the paragraph — the
schema previously had only the pair "title + paragraph", with no intermediate level. Hidden when
empty.

---

## Revision 7 — Text & Media: Subtitle removed

**The `subtitle` field added in revision 6 was reverted.** Tried against a real mockup, a
subheading between the title and the paragraph turned out to be a superfluous element — the
mockup did without it. The rest of revision 6 (the two-column layout in `No Photo`, where the
title holds a column of its own and the paragraph and CTA move into the second) stands; that is a
separate and independently correct decision.

---

## Revision 8 — reconciliation with the code, and the rebuild of the model (v2)

**What happened.** A reconciliation of all 28 v1 documents against `src/` found 148 divergences:
33 high severity, 63 medium, 52 low. Sorted by what to do about them rather than by severity:
7 bugs (code written and not working), 44 unbuilt items, 83 decisions taken in the code and not
reflected in the spec, 14 things that grew in the code and are mentioned nowhere.

**Why v1 drifted.** Revision 3 decoupled the specs from the code: the documentation describes the
target system, reconciliation lives in one place — `BACKLOG.md`. The principle was right, the
execution was not. One table serving 28 documents stays current exactly as long as someone
remembers it. By the time of the reconciliation it cited three files that do not exist in the
project (`src/store.js`, `src/schema/common.js`, `src/presets/templates.js`) and listed four
implemented things as unbuilt. The document looked authoritative and was not.

The clearest symptom is the line "FAQ section. In neither the spec nor the code" — written at a
time when `src/sections/faq.js` was already registered and shipping to users.

**What changed in v2.**

The specs describe the system as it is. Every attribute and every rule carries a
`BUILT` / `PLANNED` / `DEFECT` marker. A divergence can no longer be quiet: it is either marked
or it does not exist. There is deliberately no "partial" marker — the compromise between "works"
and "does not work" is exactly what let v1 drift from the code while remaining formally true.

The summary divergence table is abolished. Its job is done by the markers inside the specs — at
the point where a divergence arises, rather than in a separate file nobody remembers to open. In
its place, three registers with non-overlapping roles: `ROADMAP.md` (not done), `DEFECTS.md`
(done, not working), `CHANGELOG.md` (why).

**`42_OBJECT_SECTION_FAQ` added.** The section existed in the code, was registered, could be
inserted into a page, and had no document. The registry guard did not catch it and could not: it
compares `_registry.js` against `enums.js` — two files edited by the same hand — and does not
read the spec. A test that reads the key table out of `SYS-02 §1` is an entry in `ROADMAP.md`.

**Decisions recorded after the fact.** Taken in the code and described nowhere: alt text stopped
blocking publication (`SYS-02 §6`); the Prices heading's typography overrides were removed in
favour of the shared heading component; Story & Specs lost its heading size and alignment
controls; the Feature presets were renamed to `S` / `M` / `L`; the CTA became a nested
`cta: { on, label, href }` everywhere instead of three flat fields; the container spec
(1280px, 80px gutters) was applied to most sections.

**One bug fixed during the rebuild.** FAQ divider suppression was computed from the desktop
column count while the corrective rules sat in the `≤767px` media query, although the grid
collapses at `≤1023px`. In the 768–1023 band a two-column FAQ lost a divider mid-list. Found
while writing `42` — that is, writing a spec against the code worked as a code review, which was
one of the goals of this revision.

**What v2 does not do.** It does not fix the other eight defects and implements no item from
`ROADMAP.md`. This is documentation, not a sprint. Its job is to make both lists exist and be
accurate.
