# System Architecture Specification: Landing Page Builder — Core Rules

**Version 2 · 11 September 2026**

---

## About this version

Version 1 of this document was written before the builder was built. It is the ancestor of
the OOUX object model and, through it, of the running system. Enough has been decided since
that reading v1 as a description of the product is now misleading in about thirty places.

This version describes **the system as it is built**, keeps the structure and the reading
order of the original, and marks anything that is not simply working:

| Marker | Meaning |
|---|---|
| `PLANNED` | Described, deliberately not built. Do not design around it as if it exists. |
| `DEFECT` | Built and not working. A bug with a number, not an open question. |

Everything unmarked is built and verified against the source.

**Where the detail lives.** This document is the product-level view. The attribute-level
contract — every field name, type, default and validation rule — is `Docs/OOUX v2/`.
Where the two disagree, OOUX v2 wins; it is generated against the code.
`Docs/OOUX v2/ROADMAP.md` holds everything marked `PLANNED` here.
`Docs/OOUX v2/DEFECTS.md` holds everything marked `DEFECT`.

### The seven decisions that changed the product since v1

1. **Three Feature sections became one.** v1 specified *Primary Cards*, *Secondary Cards* and
   *Bullet Points* as three separate section types. They differed in exactly three values:
   icon size, item count, whether a paragraph is shown. They are now one **Feature** section
   with three named presets — `S`, `M`, `L`. See §7.2.
2. **The bulk-import delimiter changed from `/` to `|`.** The v1 separator appears inside the
   content it separates: the default column heading is literally `Published / Our Fare`. Any
   route containing a slash broke the import silently. See §3.6.
3. **Cabin class became its own field on a price row.** v1 had no cabin field, so the lead
   modal had to guess it from *Label 1* — a free-text field whose own v1 example
   (`"Business Class"`) is not a valid cabin value, and whose neighbour (`"Nonstop"`) is not
   about cabin at all. See §3.5.
4. **The Hero CTA default colour changed.** v1's default was `rgba(0,0,0,0.88)` — byte for
   byte the dark theme's own background. Out of the box that is a black button on a black
   ground. It is now bronze. See §2.6.
5. **Layout direction was removed as a universal control.** v1 gave every dynamic section a
   horizontal-orientation switch. Only Text & Media ever had two columns to swap, and it has
   its own `media_side`. Quick Facts, which v1 also listed, has a fixed layout. See §1.4.
6. **The Trust section's status was settled.** v1 marked it "subject to further architectural
   review". It is a mandatory anchor at slot 04. See §1.1.
7. **A FAQ section was added.** Not in v1 at all. See §7.4.

---

# Part 1 — Core Rules

## 1.1 Page hierarchy & layout structure

The page is a fixed sequence of seven **slots**. Four carry mandatory anchors that cannot be
moved, hidden or deleted. Three accept any number of dynamic and static modules.

```
slot 00  │  Hero Section (Above the Fold)          [MANDATORY ANCHOR]
slot 01  │  ▼ Dynamic slot — 0..N sections
slot 02  │  Prices Section                          [MANDATORY ANCHOR]
slot 03  │  ▼ Dynamic slot — 0..N sections
slot 04  │  Trust & Social Proof Section            [MANDATORY ANCHOR]
slot 05  │  ▼ Dynamic slot — 0..N sections
slot 06  │  Global Footer                           [MANDATORY ANCHOR]
```

A section's position is two values, not one: `slot_index` (which container) and
`order_in_slot` (where inside it). v1 implied a single flat ordering, which cannot express
more than one dynamic section between two anchors.

**Moving across an anchor.** Moving up lands a section at the **end** of the slot above;
moving down lands it at the **start** of the slot below. Both are one visual step. The
opposite convention — which an earlier draft specified — makes a section jump a whole slot.

> `PLANNED` — Anchor uniqueness is not enforced. Nothing rejects a second Hero in slot 00.
> It is unreachable through the editor UI but reachable through page import, which validates
> neither keys nor slots nor archetypes.

## 1.2 Component classification

**Mandatory anchors** — Hero, Prices, Trust, Footer. Position fixed, cannot be deleted or
hidden. Trust and Footer additionally draw their content from the global store rather than
from the page.

**Global static modules** — Subscription, Contact Us. Content is site-wide; the page controls
only whether they appear and where. Maximum one of each per page.

> `DEFECT D-08` — The one-per-page limit is enforced when inserting from the library, where
> a second copy is offered disabled with the reason. It is **not** enforced on Duplicate: the
> row menu offers it, and the second instance surfaces afterwards as a validation error
> rather than being prevented.

**Dynamic modules** — any number per page, in any dynamic slot: Logo Marquee, Feature, Story
& Specs, Multi-Card Grid, Large Image Banner, Text & Media, FAQ.

## 1.3 Universal controls for dynamic sections

Every dynamic section inherits the same four-group settings panel, in this order:

| Group | Holds | Opens |
|---|---|---|
| **Content** | What the section says: title, subtitle, body, its own repeating content, its button | Open |
| **Media** | Images | Closed |
| **Appearance** | Background, and any section-specific styling | Closed |
| **Advanced** | In-page anchor id | Closed |

The order is the editor's priority order: the group holding the words is the one that opens,
and styling never sits between two content fields.

**Background palette** — three presets plus a custom value behind a disclosure:

| Preset | Value |
|---|---|
| White (default) | `#FFFFFF` |
| Light Grey | `#0000000A` (4% black) |
| Light Bronze / Sand | `#F7F2EE` |

**Section heading** — size `S` / `M` / `L`, alignment Left / Center. Every section type
carries its own default for both. Two sections opt out: Story & Specs has a fixed layout its
heading cannot vary within, and Text & Media offers no subtitle because its body copy takes
that place.

> `DEFECT D-05` — Trust offers both heading controls and consults neither; its title is fixed
> in CSS.

**Size controls read small to large.** `S → M → L`, left to right, everywhere in the editor —
the same direction as the numeric controls beside them.

## 1.4 Builder capabilities

**Multiple instances.** Any dynamic section can appear several times on one page, each with
independent content and styling.

**Reordering.** Sections are dragged in the page-structure panel, including across an anchor
into the neighbouring slot. Move up / move down remain available from each row's menu.

**Horizontal orientation.** Only Text & Media has it, as `media_side`. v1 specified it as a
universal control; it was removed because only one section could honour it, and because the
`RTL` token it used collides with writing direction in a product targeting the Middle East.

**Defaults and templates.** Every section type ships a default payload that populates a fresh
instance. Pages start from a template: three built in (Route, Campaign, Blank), plus any
number saved out of the editor. A saved template freezes a page's content and images; a
built-in template is a list of section types whose copy comes from each type's own defaults.

**Import and export.** A page exports as a standalone HTML file, or as JSON with its images
inlined. That JSON imports back, on any machine.

> `PLANNED` — Publishing does not exist. The validator that decides whether a page may be
> published is written and is called only by the test suite; a page's status is set once on
> creation and never changes. There is no publish action, no unpublish, no archive, no
> scheduled publication and no rollback.

## 1.5 Validation

Three levels, by what they check and when:

| Level | Checks | When |
|---|---|---|
| **L0** | Structure: the four anchors exist, in their slots; no duplicate static modules | Continuously |
| **L1** | Content completeness: required fields, required assets | Continuously |
| **L2** | Field format: email, slug, hex, date order | `PLANNED` |

A draft always saves. Findings are reported in the Issues panel and beside the field that
raised them. A hidden section is skipped entirely by content validation.

> `PLANNED` — Level L2 does not exist. No format is checked anywhere: any value can be
> written to any field. Its error code is declared and never raised.

**Alt text is not required.** v1 implied it through accessibility; an intermediate revision
made it a publish blocker. It is now optional, because it blocked publishing over a caption
nobody had written yet. The editor still suggests alt text from the filename on upload, so
the ordinary path leaves it filled in. The cost is real and deliberate: an image without alt
reaches a screen reader as nothing.

---

# Part 2 — Hero Section

## 2.1 Overview

The primary above-the-fold block. It owns the page's theme, its responsive backgrounds, the
eyebrow/title/paragraph hierarchy, the featured price with its brand marks, and the embedded
lead form.

## 2.2 Theme mode

Light | Dark. Changing it updates, in one move: the header logo, the accreditation badge
assets, the menu trigger and phone styling, the Trustpilot and countdown widget themes, and
the baseline text colours.

A colour still sitting at the *other* theme's default is re-defaulted when the theme changes.
A colour someone actually chose is left alone.

## 2.3 Backgrounds

| | Desktop | Mobile |
|---|---|---|
| Image | PNG, JPG, WebP | PNG, JPG, WebP — falls back to the desktop image when empty |
| Overlay colour | Black / White, custom available | Black / White, custom available |
| Overlay opacity | 0–100%, default 50% | 0–100%, default 50% |

Colour and opacity are one control on one line, labelled **Overlay**, under the background it
belongs to. A scrim is one decision, not two.

**Fallback colour** — used when no image is uploaded. Dark theme defaults to ink, Light theme
to sand. One value covers both widths.

> `DEFECT D-03` — The mobile overlay is editable and has no effect. The rendered scrim is
> built from the desktop pair only, at every width.
>
> `PLANNED` — A separate mobile fallback colour. v1 specified one; there is a single fallback.

## 2.4 Eyebrow

A micro-content line above the H1. Five modes:

| Mode | Fields | Behaviour |
|---|---|---|
| **None** | — | Not rendered |
| **Text** | Text, optional inline badge (icon, label, colour) | A line of text, optionally with a pill beside it |
| **Timer** | Prefix, end date, **timezone**, **behaviour at zero**, optional inline badge | Counts down to the deadline |
| **Logo** | Image | 10:1 container, e.g. 560×56 |
| **Badge** | Icon, label, colour | A standalone pill |

**Timer, two additions over v1.** The end date is entered and displayed in an explicit
timezone, so every visitor sees the same deadline rather than their own local reading of it.
What happens at zero is a choice: hide the eyebrow, show "Offer ended", or freeze at zero.
v1 specified neither, which left the most visible element on the page undefined at the exact
moment it matters.

Badge icons are image uploads, not entries from an icon registry — no such registry exists.

> `PLANNED` — A Logo eyebrow with no image uploaded passes validation and renders a
> placeholder. Every other mode validates its required content.

## 2.5 Title, paragraph and price

**Title (H1)** — three size presets, not two:

| Preset | Size | Line height | Letter spacing |
|---|---|---|---|
| `S` | 40px | 44px | normal |
| `M` | 48px | 49.92px | 0.48px |
| `L` (default) | 56px | 60.48px | normal |

Rich text: bold, italic, strikethrough, per-selection colour, line breaks.

**Paragraph** — the same plus lists and links.

**Price block** — three stacked fields: a label above, the price itself, a label below. The
price is plain text: digits and separators only, because the currency symbol comes from the
page's own currency setting rather than being typed.

> `PLANNED` — v1 specified that a leading currency symbol typed by an author is stripped on
> save. Nothing strips it.

**Brand marks.** Two optional slots, each with its own toggle: one beside the price
(container ratio 2:1 — v1 said 1:2, which is the wrong orientation) and one below it (10:1,
560×56). Both live in the **Media** group with the backgrounds, not in a group of their own.

**The price footnote does not exist as a Hero field.** The disclaimer lives once in the
Footer's global legal text, and the asterisk appears beside the price only when that text is
non-empty. One disclaimer shared by every page, instead of one per Hero to keep in sync.

## 2.6 Lead form

The embedded half of the lead engine.

- **Button label** — text, default "Check Your Price".
- **Button colour** and **text colour** — brand swatches first, custom behind a disclosure.
  Default bronze `#B8876E`, white text.

v1's default was `rgba(0,0,0,0.88)`, identical to the dark theme's background: a black button
on a black ground on a fresh page.

**Fields:** trip type and cabin/travellers selectors, From / To with a swap control,
departure and return dates, name, email, country code + phone.

> `DEFECT D-01` — **The form does not submit.** No handler is bound to it. Pressing the
> button performs a native form submission, which reloads the page and discards everything
> typed. Its inputs additionally carry no field names, so there would be nothing to serialise.
>
> `PLANNED` — The trip type, cabin and traveller controls are drawn as static text and
> collect nothing. Making them real fields changes the lead payload, which is why they were
> not faked as working inputs.
>
> `PLANNED` — There is no consent checkbox. The form collects a name, an email address and a
> phone number, including in jurisdictions where consent is required before it may.

---

# Part 3 — Prices Section

## 3.1 Overview

Fare comparison beside sticky media, with optional regional filtering and a direct path into
the lead modal.

## 3.2 Media column

One or two images. With two, they overlap as a pair rather than sitting side by side: a small
image top-left, a large one bottom-right, each with a cutout stroke in the section's own
background colour. Square aspect, JPG/PNG/WebP.

The column is sticky while the table scrolls.

> `PLANNED` — Media is not validated. A Prices section with no image uploaded passes and
> renders placeholders.

## 3.3 Section header

Title and optional subtitle. Both hide when empty.

**Per-section typography controls were removed.** v1 gave the title its own colour, weight
and italic toggles. They duplicated the shared heading component, placed three styling
controls between two content fields, and were the one place an author could quietly produce
an off-brand page. The heading now takes the system's own type scale.

## 3.4 Table settings

- **Column headings** — left (default "Route & Cabin") and right (default "Published / Our
  Fare"). An empty heading hides that column's header.
- **Region tabs** — off by default. When on, tabs render only if the rows actually span two
  or more regions besides Global.
- **Master toggles** — show route details, show price badges, show published fares, show
  airline logos. Each hides its element across every row at once.

## 3.5 Price row

| Field | Type | Required | Notes |
|---|---|---|---|
| Title | Text | Yes | Route or destination |
| Detail 1 | Text | No | e.g. "Business Class" |
| Detail 2 | Text | No | e.g. "Nonstop" |
| Our fare | Text | Yes | |
| Published fare | Text | No | Struck through; subject to the master toggle |
| **Cabin** | Business / First / Premium Economy | Yes, defaults to Business | Machine-readable; hydrates the lead modal |
| Badge above price | Text | No | Optionally struck through |
| Airline logo | Image | No | 1:1 |
| Region | Global + 9 regions | Global | |

**Cabin is new in v2.** Without it the modal had to read cabin from *Detail 1*, a free-text
field. The regions list now includes North America and Latin America, which v1's did not —
an omission in a product selling transatlantic fares.

**Per-row text colour was removed**, with the section's typography controls.

> `DEFECT D-04` — A row added with "+ Add row" receives no internal id, while seeded and
> bulk-imported rows do. Duplicating a row copies its id, so one page can hold two rows
> claiming to be the same one.

Limits: at least 1 row, at most 30.

## 3.6 Bulk import

Pasting a block of delimited lines, one row per line.

```
Route | Fare | Published fare | Cabin | Detail | Badge | Region
```

```
London (LHR)|1,234|4,321|Business|Nonstop|Special Fare|Europe
Paris (CDG)|1,180|3,900|Business|1 stop||Europe
Tokyo (HND)|2,940|7,450|First|Nonstop||Asia
```

**The delimiter is `|`, not `/`.** v1's slash appears inside the data it separates — the
right column's own default heading is `Published / Our Fare`.

**An empty cell is empty.** v1's convention of writing `–` for a blank made the literal value
`–` impossible to enter.

**Import is all-or-nothing.** If any line fails to parse, nothing is written and every
failing line is reported with its number. Import can append or replace, and refuses a paste
that would exceed the 30-row limit.

## 3.7 Clicking a row

A row is a real button, so keyboard activation works without extra wiring. Clicking opens the
lead modal and passes the destination.

> `DEFECT D-06` — The cabin is read off the row and written into an element that does not
> exist in the modal. The value is carried the whole way and dropped at the last step.
>
> `PLANNED` — The row's id and fare are not passed at all, so no lead can be attributed to
> the row or the price that produced it.

## 3.8 Footnote

Optional rich text under the table, with links. Hidden when empty.

---

# Part 4 — Trust & Social Proof Section

## 4.1 Overview

Credibility through ratings, accreditations and a VIP endorsement. Content is global; the
page controls the layout and which blocks appear.

The section is always dark. Unlike other sections it has no background control — a
social-proof band reads as a distinct beat against the rest of the page.

## 4.2 Display modes

**Extended** (default) — full multi-column layout.
**Compact** — a low-profile variant for content-dense pages. It hides the review body text,
the video block and the two-column grid, and reduces the section's vertical padding.

> `PLANNED` — v1 specified that Compact collapses the reviews into a single-row slider and
> drops the celebrity portrait. It does neither: the review track is the same multi-item row
> in both modes, and the portrait stays.

## 4.3 Page-level controls

| Control | Options |
|---|---|
| Density | Extended / Compact |
| Trustpilot feed | On / Off |
| Video & VIP testimonial | On / Off |
| Accreditation badges | On / Off — always hidden in Compact |

The section also carries its own title and subtitle, which v1 did not describe.

> `DEFECT D-05` — Heading size and alignment are offered and consulted by nothing.

## 4.4 Global content

Trustpilot score, review count and rating label; a list of celebrity endorsements with
portrait, quote and optional video; accreditation badges.

> `PLANNED` — Nothing fetches a live Trustpilot feed. Every value is hand-maintained in
> Global Settings; the business-unit id ships empty and the cache setting is never read.

**Migration notes have been removed from this section.** v1 §3 was a list of instructions to
the development team — remove this wrapper, delete these three cards, apply that padding
token. That is history, not specification. It is in `Docs/OOUX v2/CHANGELOG.md`.

One observation from that migration is still open, and is a content decision rather than a
bug: *24/7* is asserted by Contact and by the Feature section's own default copy, and
accreditations appear three times on a single page — as badges in the Hero, as seals in the
Footer, and again in Feature's defaults.

---

# Part 5 — Global Static Sections

Pre-designed blocks with fixed layouts and site-wide content. A page toggles them on or off
and nothing else.

## 5.1 Subscription

Standardised copy, an email field, a button, a privacy note and a photograph.

> `PLANNED` — None of the form behaviour exists. No email validation, no disabled submit, no
> inline error, no endpoint, no success or already-subscribed states. Submitting reloads the
> page.
>
> `PLANNED` — Phase 2: editable headings, configurable incentive copy, selectable background.

The footer additionally renders its own newsletter block, from a different branch of the
global store, on every page. v1 described one subscription module; there are two, with the
same five fields and different copy.

## 5.2 Contact Us

Three channels — chat, phone, email — each with a title, a description and a call to action.

v1 specified different channels entirely: a primary phone, an international phone and a
support email, each with a display number, a protocol URI and a label. None of those field
names exist, and there is no international-concierge channel.

> `PLANNED` — Operating hours and office location. v1 listed both; neither is stored or
> rendered.
>
> `PLANNED` — v1 required every phone and email to be clickable. Nothing guarantees it:
> `tel:` and `mailto:` links are typed by hand into the description field. The shipped
> content happens to be correct.

The concierge number in Global Settings and the one in the Hero's site header are different
numbers. The header's is hardcoded markup rather than data — see the note on `SITE_HEADER` in
the roadmap.

---

# Part 6 — Content Sections Library

All content sections share the background palette and heading controls from §1.3.

## 6.1 Story & Specs

*Named "Quick Facts" in v1. The internal key is unchanged.*

Narrative copy beside a three-image showcase, above a list of labelled facts.

| Field | Required |
|---|---|
| Title | Yes |
| Lead text | Yes |
| Footnote | No |
| Facts (2–4), each a label and a caption | First two required |
| Two thumbnails and one featured image | No |

**Facts are a list, not four numbered fields.** v1 specified `Card 1` through `Card 4` as
eight separate attributes. A fact with only one of its two halves filled is a validation
error, not a silent drop — the one place in v1 where losing content was not an error.

**Media height.** The showcase sits between 400px and 640px. The implementation is a minimum
with an auto maximum plus a height cap, not a `clamp()`: two fixed lengths in a CSS grid row
definition always resolve to the larger one, so the "maximum" would have been the only value
that ever applied. Below 1024px the column stacks and both bounds are replaced.

**No media-side control.** v1 listed one; the layout is fixed.

> `DEFECT D-05` — Heading size and alignment are stored and have no effect here either. The
> controls were removed from the panel, which is why this is invisible rather than confusing.

## 6.2 Multi-Card Grid

Two, three or four cards: either all pictures, or all pictures with copy.

Cards beyond the selected count are kept, not deleted — switching back restores them.

**All-or-nothing text.** Either every active card has a title and a paragraph, or none do,
rendering a pure image grid. Filling in one card's text makes the others' text required.

An optional footnote sits under the grid.

## 6.3 Large Image Banner

A full-width image, a headline, supporting copy and a call to action. The button is always
shown — it is the point of the section.

Its CTA target may be a relative path, an absolute URL, or `#lead-modal` to open the lead
form. External links open in a new tab with the appropriate rel attributes.

> `PLANNED` — A fragment link that is neither `#lead-modal` nor an existing anchor id is not
> rejected.

## 6.4 Text & Media

Editorial copy beside zero, one or two images, on either side.

- **Images**: None / 1 / 2. Two images overlap as a pair, matching the Prices collage.
- **Side**: Left / Right — hidden when there is no image to place.
- **Button**: an item inside Content with a toggle, not a group of its own. Whether the
  section ends in a call to action is part of what it says.

**"No photo" keeps two columns.** v1 made this mode a single full-width block — the only
variant breaking the two-column rhythm the other two hold. The title now keeps a column of
its own and the paragraph and button move into the second.

> `DEFECT D-07` — On mobile the intended order is Title → Media → Paragraph → Button. The
> rendered order is Title → Paragraph → Button → Media. A comment in the source claims the
> intended order is produced; it is not.

---

# Part 7 — Intermediate & Supporting Sections

## 7.1 Logo Marquee

Partner logos at a fixed 36px height, 64px apart.

If they fit, they render as a centred static row. If they overflow, the component becomes an
infinite ticker: the track is cloned once to remove the visual jump, the animation pauses on
hover, and the cycle duration is adjustable between 10 and 90 seconds.

**Reduced motion.** Under `prefers-reduced-motion: reduce` the marquee never animates; it
falls back to a static, horizontally scrollable row. Continuous motion is a vestibular
trigger. The same applies to the Hero countdown. v1 specified no such fallback.

At least one logo is required. Alt text is optional — a purely decorative brand mark renders
with an empty alt attribute rather than a guessed one.

## 7.2 Feature

**One section, three presets.** This replaces v1's Primary Cards, Secondary Cards and Bullet
Points.

| Preset | Icon | Items | Paragraph | Heading |
|---|---|---|---|---|
| `S` | 48px | 3 or 4 | No | `SIZE_S` |
| `M` | 48px | 3 or 4 | Yes | `SIZE_M` |
| `L` | 64px | 3 | Yes | `SIZE_L` |

The presets are not three sizes of one layout. `L` is a vertical centred stack; `M` is a
horizontal row with the icon at the left of each item; `S` adds vertical dividers between
items. Icon size and paragraph visibility are consequences of the preset, not independent
switches — 64px belongs only to `L`, and the absence of a paragraph is what `S` *is*.

Each item has an icon, a title and — in `S` and `M` — a paragraph. Icons render without a
background chip: the tint v1 implied darkened semi-transparent icons.

> `DEFECT` — Every preset writes the item count, so pressing any preset button drops a
> four-item `M` or `S` back to three. The items survive; the setting does not. The item count
> is documented, in the panel and here, as independent of the preset.
>
> `PLANNED` — Presets carry layout only, not content. v1 specified that inserting a preset
> seeds its own standard copy and icons, and that it fills empty fields only. A new Feature
> section gets one fixed default payload regardless of preset.

## 7.3 Story & Specs, Multi-Card Grid, Large Image Banner, Text & Media

See Part 6. v1 split these across two chapters; they are one library.

## 7.4 FAQ

**New in v2 — not in v1 at all.**

Collapsible questions and answers in one or two columns, each entry a question and a rich-text
answer. Between 1 and 20 entries. Whether answers start open is a setting.

Built on the browser's own disclosure element, so the accordion works in the exported file
with no JavaScript at all — the document the preview shows is the document that ships.

The rule under each entry is dropped for the bottom row, so the list closes on text rather
than on a line.

---

## Appendix — What is not built

Everything marked `PLANNED` above, gathered with the rest, is in
`Docs/OOUX v2/ROADMAP.md`. The largest items:

- **Publishing.** No publish, unpublish, archive, preview, scheduling or rollback.
- **Level L2 validation.** No format checking anywhere.
- **The lead pipeline.** Neither form reaches a CRM. There is no network call in the product
  at all, no consent capture and no attribution or UTM telemetry.
- **Redirects.** Changing a published page's slug silently breaks its SEO.
- **Structured data.** No JSON-LD for fares, FAQ or breadcrumbs.
- **Localisation.** Target country and region are stored and read by nothing.

Everything marked `DEFECT` is in `Docs/OOUX v2/DEFECTS.md`, with what happens and where.
The one to read first is not in this document's own scope: **the lead modal tells a visitor
that a specialist will contact them, and discards the lead.** Until there is a pipeline, that
message should say it is a demonstration, or there should be no submission at all.
