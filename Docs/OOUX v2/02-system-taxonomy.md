# System Taxonomy

```yaml
METACLASS: DERIVED_OVERVIEW (NOT AN OBJECT)
DOCUMENT_ID: MAP-02-TAXONOMY
VERSION: 2.0.0
STATUS: APPROVED
DEPENDS_ON: SYS-02-ENUMS, OBJ-11-DYNAMIC-SECTION-BASE
TARGET_AUDIENCE: [LLM_AGENT, BACKEND_DEV, FRONTEND_DEV, UI_DESIGNER]
```

A derived document. The canonical keys, regions and slots are in `SYS-02 §1`. The rules live in
the section files; this is a summary, so that everything can be compared on one screen.

---

## 1. Sections

Thirteen `COMPONENT_KEYS`. The registry in `src/sections/_registry.js` throws at load time if the
set of registered modules does not match this list exactly.

| Section | `component_key` | Slots | Content source | Multi-instance | Status |
|---|---|---|---|---|---|
| Hero | `SECTION_HERO` | `00` | Page-specific | No (exactly 1) | `BUILT` |
| Prices | `SECTION_PRICES` | `02` | Page-specific | No (exactly 1) | `BUILT` |
| Trust | `SECTION_TRUST` | `04` | Global site-wide | No (exactly 1) | `BUILT` |
| Footer | `SECTION_FOOTER` | `06` | Global site-wide | No (exactly 1) | `BUILT` |
| Subscription | `SECTION_SUBSCRIPTION` | `01`,`03`,`05` | Global site-wide | Max 1 per page | `BUILT` |
| Contact Us | `SECTION_CONTACT` | `01`,`03`,`05` | Global site-wide | Max 1 per page | `BUILT` |
| Story & Specs | `SECTION_QUICK_FACTS` | `01`,`03`,`05` | Page-specific | Yes (0..N) | `BUILT` |
| Multi-Card Grid | `SECTION_MULTI_CARD_GRID` | `01`,`03`,`05` | Page-specific | Yes (0..N) | `BUILT` |
| Large Image Banner | `SECTION_LARGE_IMAGE_BANNER` | `01`,`03`,`05` | Page-specific | Yes (0..N) | `BUILT` |
| Text & Media | `SECTION_TEXT_MEDIA` | `01`,`03`,`05` | Page-specific | Yes (0..N) | `BUILT` |
| Logo Marquee | `SECTION_LOGO_MARQUEE` | `01`,`03`,`05` | Page-specific | Yes (0..N) | `BUILT` |
| Feature | `SECTION_FEATURE` | `01`,`03`,`05` | Page-specific | Yes (0..N) | `BUILT` |
| FAQ | `SECTION_FAQ` | `01`,`03`,`05` | Page-specific | Yes (0..N) | `BUILT` |

**Archetypes** (`SYS-00 §2`, a module's `archetype` field): Fixed Anchor — Hero, Prices.
Dual-Role Anchor — Trust, Footer (position is local, data is global). Static Module —
Subscription, Contact. Dynamic Module — the other **seven**.

**Slots and multiplicity are derived, not declared per section**: `permittedSlots(key, archetype)`
and `maxInstances(archetype)` in `src/model/enums.js`. No module lists its own slots.

**Story & Specs** is the display name of section 36; the key `SECTION_QUICK_FACTS` is unchanged.

### 1.1 Groups in the "Add a section" catalogue

Navigational grouping in the insert drawer (`LIBRARY_GROUPS`). It affects neither slots nor
multiplicity nor validation.

| Group | UI heading | Sections | Status |
|---|---|---|---|
| `content` | Content sections | Story & Specs, Multi-Card Grid, Large Image Banner, Text & Media, FAQ | `BUILT` |
| `intermediate` | Intermediate & supporting | Logo Marquee, Feature | `BUILT` |
| `global` | Global static blocks | Subscription, Contact Us | `BUILT` |

Anchors do not appear in the catalogue: `insertableTypes()` returns only `dynamic` and `static`.
A static module already on the page is shown as a **disabled** card with the reason, rather than
disappearing.

---

## 2. Parameters and variant selectors

| Section | Parameter | Values | What it changes | Status |
|---|---|---|---|---|
| Hero | `title_preset` | `S` \| `M` \| `L` | Headline size | `BUILT` |
| Hero | `eyebrow_mode` | `None` \| `Text` \| `Timer` \| `Logo` \| `Badge` | Micro-content above the headline | `BUILT` |
| Hero | `on_expiry` | `HideEyebrow` \| `ShowExpiredLabel` \| `FreezeAtZero` | Timer behaviour past the deadline | `BUILT` |
| Hero | `theme_mode` | `Light` \| `Dark` | Logo, badges, text colour, background default | `BUILT` |
| Prices | `media_layout_type` | `1 Image` \| `2 Images` | The sticky column | `BUILT` |
| Prices | `region_tabs_enabled` | `bool` | Region tabs (needs ≥2 non-`Global` values) | `BUILT` |
| Trust | `layout_mode` | `Extended` \| `Compact` | Layout density | `BUILT` |
| Story & Specs | `media_side` | `Left` \| `Right` | — the parameter no longer exists: the layout is fixed | `PLANNED` |
| Multi-Card Grid | `card_count` | `2` \| `3` \| `4` | Number of active cards | `BUILT` |
| Text & Media | `media_mode` | `No Photo` \| `1 Photo` \| `2 Photos` | The media column | `BUILT` |
| Text & Media | `media_side` | `Left` \| `Right` | Which side the media column sits on | `BUILT` |
| Feature | `_preset` | `S` \| `M` \| `L` | Writes `icon_size`, `item_count`, `has_paragraph`, `heading_size` | `BUILT` |
| Feature | `item_count` | `3` \| `4` | Item count; the control is hidden when `icon_size === 64` (preset `L` is fixed at 3) | `BUILT` |
| Feature | `icon_size`, `has_paragraph` | — | No controls of their own: consequences of the preset only | `BUILT` |
| Logo Marquee | `speed` | `10..90` s | Seconds per full ticker cycle | `BUILT` |
| FAQ | `columns` | `1` \| `2` | Column count | `BUILT` |
| FAQ | `start_open` | `bool` | Whether answers are expanded on load | `BUILT` |

**Story & Specs `media_side`.** v1 described a media-column flip; the code has none — the section
declares itself "Fixed layout, no media-side flip", and only Text & Media declares `media_side`.
A column flip is not a shared attribute of the base class and never was.

**Feature presets** are not separate components but one of three coherent combinations:
`S` = 48 / 3 / no paragraph / `SIZE_S`, `M` = 48 / 3 / with paragraph / `SIZE_M`,
`L` = 64 / 3 / with paragraph / `SIZE_L`. A preset button is highlighted only when **all** of its
keys already match.

---

## 3. Universal controls of a dynamic section

The full contract is `11_ABSTRACT §4`. What follows is the summary of opt-outs: the only
sanctioned way for a section to decline part of the shared block.

| Factory flag | What it removes | Who takes it | Status |
|---|---|---|---|
| `sub: false` (`headingFields`) | The `subheading` field entirely | Story & Specs, Text & Media | `BUILT` |
| `scale: false` (`headingFields`) | The **pair** `heading_size` + `heading_align` | Story & Specs | `BUILT` |
| `toggle: false` (`ctaFields` / `ctaGroup`) | The `cta.on` switch; the button becomes unconditional | Large Image Banner | `BUILT` |
| `open: true` (`mediaGroup`) | Removes nothing — opens the "Media" group on arrival | Text & Media, Large Image Banner | `BUILT` |

`scale: false` drops both controls together: removing the size while keeping the alignment is not
possible, and no section needs it. The value itself does not disappear — it comes from the
section's `defaults` and still reaches the renderer; it simply stops being the author's choice.

**Panel group order** is always `Content` → (the section's own repeating-content group) → `Media`
→ `Appearance` → `Advanced`. A group whose every field is hidden by a `when` condition is not
drawn at all. — `BUILT`

---

## 4. CTA

| Shape | Storage | Who uses it | Status |
|---|---|---|---|
| `cta: { on, label, href }` | a nested object in `props` | Text & Media (with a switch, inside `Content`), Large Image Banner (no switch, its own `Button` group) | `BUILT` |
| `cta_label` / `cta_url` / `show_cta_button` | — | v1's flat triple does not exist in the code; a document or preset writing these keys produces a section with no button | `PLANNED` |

`#lead-modal` (`LEAD_ANCHOR`) is the system's only magic href: the runtime intercepts it and opens
`21_OBJECT_FLIGHT_QUOTE_MODAL`. Everything else is an ordinary link; an `https?://` target
additionally gets `target="_blank" rel="noopener noreferrer"`.

---

## 5. The general rule for changing a parameter

Non-destructive migration (`11_ABSTRACT §5.5–5.8`):

| Mechanism | Behaviour | Status |
|---|---|---|
| A repeater with `fixed: '<prop>'` | Renders the first *n* and **retains** the rest in the document; the inspector says "N more items kept for the larger layout" | `BUILT` |
| The `preset` widget with `applies` | Writes only the keys it declares; never touches content fields | `BUILT` |
| A field hidden by a `when` condition | Is neither drawn nor written; the stored value is left untouched | `BUILT` |
| `defaults` | Applied exactly once, on insert; nothing re-applies them later | `BUILT` |
