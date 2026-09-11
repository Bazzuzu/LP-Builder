# `11_ABSTRACT_OBJECT_DYNAMIC_SECTION.md`

```yaml
METACLASS: ABSTRACT_OBJECT
OBJECT_ID: OBJ-11-DYNAMIC-SECTION-BASE
VERSION: 2.0.0
STATUS: APPROVED
INHERITS_FROM: OBJ-10-BASE-SECTION
DEPENDS_ON: SYS-02-ENUMS, SYS-01-TOKENS
SOURCE_OF_TRUTH: src/sections/_common.js, src/render/html.js, src/ui/fields.js, src/sections/_registry.js
TARGET_AUDIENCE: [LLM_AGENT, BACKEND_DEV, FRONTEND_DEV, ARCHITECT]
```

---

## 1. OBJECT DEFINITION

The abstract base for every modular, repeatable, page-level content block. It adds nothing to the
persisted `Section` shape — a dynamic section is a `Section` whose registered `archetype` is
`'dynamic'`. What it does own is a **shared control contract**: four settings groups in a fixed
order, a heading block, a background, an in-page anchor and an optional CTA, all built by the
factory functions in `src/sections/_common.js`.

That file is the contract. A change to the universal controls is a one-file edit there, not
thirteen — and the opt-outs a section may take (`scale: false`, `sub: false`, `toggle: false`)
are parameters of those factories, not local re-declarations.

---

## 2. RELATIONSHIPS (OOUX ORCA MAPPING)

- **Inherits From (Parent):** `10_ABSTRACT_OBJECT_PAGE_SECTION` — `id`, `key`, `slot_index`,
  `order_in_slot`, `is_visible`, `anchor_id`, `props`, `created_at`, `updated_at`.
- **Belongs To (N:1):** `20_OBJECT_LANDING_PAGE`.
- **Specialized By (Concrete Children):**
  - `36_OBJECT_SECTION_QUICK_FACTS` — display name **Story & Specs**, key `SECTION_QUICK_FACTS`
  - `37_OBJECT_SECTION_MULTI_CARD_GRID`
  - `38_OBJECT_SECTION_LARGE_IMAGE_BANNER`
  - `39_OBJECT_SECTION_TEXT_MEDIA`
  - `40_OBJECT_SECTION_LOGO_MARQUEE`
  - `41_OBJECT_SECTION_FEATURE`
  - `42_OBJECT_SECTION_FAQ`
- **Permitted Slots:** `01`, `03`, `05` — derived from archetype, never declared per section.
- **Multiplicity:** unbounded (`maxInstances('dynamic') === Infinity`).

> The factories in `_common.js` are **not exclusive to this class.** `32_OBJECT_SECTION_TRUST`
> (a dual-role anchor) calls `contentGroup(headingFields())` as well. The contract below describes
> the helpers; membership of this class is decided by `archetype`, not by which helpers a module
> happens to call.

---

## 3. OBJECT LIFECYCLE & ADMIN CTAs

| Action (CTA) | Admin UI Location | System Behavior | Status |
| :--- | :--- | :--- | :--- |
| **Insert** | "Add a section" drawer (`ui/library.js`), opened from any `+ Add section` line | `addSection(key, { slot, props: defaultsFor(key) })` — a fresh `id` and a deep clone of the type's `defaults`; the new section is selected | `BUILT` |
| **Duplicate** | Outline row menu (`⋯`) | `duplicateSection()` → `insertAfter()`: a deep copy directly beneath the source, fresh `id` and timestamps. The list keeps focus; the copy is not selected | `BUILT` |
| **Reorder (Up/Down)** | Outline row menu (`⋯`) | One step, crossing anchors into the neighbouring dynamic slot | `BUILT` |
| **Reorder (Drag)** | Outline drag handle (`⠿`) | `moveSectionTo()`; drop zones are drawn per dynamic slot, including empty ones | `BUILT` |
| **Delete** | Outline row menu (`⋯`) | Confirmation dialog (`ui/confirm.js`) naming the type and the instance label, then `deleteSection()` | `BUILT` |
| **Toggle Visibility** | Outline row menu (`⋯`), labelled *Hide from the page* / *Show on the page* | Flips `is_visible`; the row grows a `◌` flag | `BUILT` |

The drawer groups types as *Content sections*, *Intermediate & supporting* and *Global static
blocks* (`LIBRARY_GROUPS`). Group membership is the type's own `group` property and is a
navigation aid only — it does not affect slots, multiplicity or validation.

---

## 4. ATTRIBUTES MATRIX

### 4.1 Inherited Invariants

| Invariant | Value | Source | Status |
| :--- | :--- | :--- | :--- |
| Permitted slots | `[1, 3, 5]` | `permittedSlots(key, 'dynamic')` | `BUILT` |
| Instance limit | `Infinity` | `maxInstances('dynamic')` | `BUILT` |
| Deletable | Always | no `ANCHOR_SLOT` entry → `isAnchor()` is false | `BUILT` |
| Content source | The page document (`props`) | `GLOBAL_CONTENT_ARCHETYPES` excludes `'dynamic'` | `BUILT` |

### 4.2 The Settings Panel Contract

Every section's inspector is assembled from `FieldGroup[]` in this order. The inspector
(`ui/inspector.js`) walks the declaration and knows nothing about any particular section; a group
whose fields all evaluate their `when` to false renders not at all.

| Group | Builder | Default state | Contents | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Content** | `contentGroup(fields)` | open | The heading block, the section's own copy, and — where a section has one — its CTA | `BUILT` |
| *(own repeating body)* | declared inline by the section | open | Rows, Items, Facts, Logos, Cards, Questions. The one licensed insertion between Content and Media, and still content | `BUILT` |
| **Media** | `mediaGroup(fields, { open })` | closed (Text & Media and Large Image Banner pass `open: true`) | Image fields and the mode/side selectors that govern them | `BUILT` |
| **Appearance** | `appearanceGroup({ bg, fields })` | closed | `bg_color`, plus anything that changes how the section looks rather than what it says | `BUILT` |
| **Advanced** | `advancedGroup(fields)` | closed | `anchor_id` | `BUILT` |

Group open/closed state is remembered per `key:title` for the session (`openGroups` in the
inspector) and reset by `store.on('reset')` — a page switch or an undo across a page boundary.

### 4.3 Heading Block — `headingFields(opts)`

| Attribute Name | Data Type | Required | Default | Status |
| :--- | :--- | :--- | :--- | :--- |
| `section_title` | `String` | per section (`required` opt) | none — the section's `defaults` supply the copy | `BUILT` |
| `subheading` | `RichText` | No | none | `BUILT` |
| `heading_size` | `Enum<String>` | Yes | `opts.size`, default `SIZE_M` | `BUILT` |
| `heading_align` | `Enum<String>` | Yes | `opts.align`, default `ALIGN_LEFT` | `BUILT` |

**Notes on the above**

* `heading_size` ∈ `SIZE_S | SIZE_M | SIZE_L`; `heading_align` ∈ `ALIGN_LEFT | ALIGN_CENTER`.
  `SIZE_OPTS` always reads small-to-large, left to right, matching every numeric segmented
  control in the editor.
* `subheading` takes the full toolbar (`RT_FULL`: bold, italic, strike, colour, lists, link).
* The help text under `section_title` and `subheading` is *"Hidden when empty."* — the literal
  statement of rule 1 in §5, placed where it is acted on.

**The two opt-outs, and who takes them**

`headingFields` is the real contract, including its negative space. Two flags let a section
decline part of the block; they are the only sanctioned way to do so.

| Opt-out | Effect | Taken by | Status |
| :--- | :--- | :--- | :--- |
| `sub: false` | Drops the `subheading` field entirely. The section's own body copy takes its place as the supporting text, rather than sitting beneath a second optional line | **Story & Specs** (`primary_paragraph` + `secondary_paragraph`), **Text & Media** (`paragraph`) | `BUILT` |
| `scale: false` | Drops **both** `heading_size` and `heading_align`. The value still comes from the section's `defaults` and still reaches the renderer — it simply stops being a choice | **Story & Specs** (heading shares a fixed two-column layout with the fact list, which neither a larger scale nor centring has anywhere to go) | `BUILT` |

`scale: false` removes the pair. There is no way to keep the size control and drop the alignment
control, or the reverse — and there is no section that has asked for one.

**Per-section heading configuration, as declared**

| Section | `required` | `sub` | `scale` | `heading_size` default | `heading_align` default | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Story & Specs (36) | yes | `false` | `false` | `SIZE_M` | `ALIGN_LEFT` | `BUILT` |
| Multi-Card Grid (37) | no | yes | yes | `SIZE_M` | `ALIGN_CENTER` | `BUILT` |
| Large Image Banner (38) | yes | yes | yes | `SIZE_L` | `ALIGN_CENTER` | `BUILT` |
| Text & Media (39) | yes | `false` | yes | `SIZE_M` | `ALIGN_LEFT` | `BUILT` |
| Logo Marquee (40) | no | yes | yes | `SIZE_S` | `ALIGN_CENTER` | `BUILT` |
| Feature (41) | no | yes | yes | `SIZE_L` | `ALIGN_CENTER` | `BUILT` |
| FAQ (42) | no | yes | yes | `SIZE_L` | `ALIGN_LEFT` | `BUILT` |

> Feature's `heading_size` is additionally rewritten by its `_preset` control: picking **S / M / L**
> writes `heading_size` alongside `icon_size`, `item_count` and `has_paragraph`, so the section
> heading and the icons mean the same thing by the same letter. — `BUILT`

### 4.4 Background — `appearanceGroup({ bg, fields })`

| Attribute Name | Data Type | Required | Default | Status |
| :--- | :--- | :--- | :--- | :--- |
| `bg_color` | `ColorValue` (hex, 6 or 8 digits) | Yes | `opts.bg` — `#FFFFFF` everywhere except Logo Marquee (`BG_LIGHT_GREY`, `#0000000A`) | `BUILT` |

**Notes on the above**

* The widget offers `BG_PRESETS` first — White `#FFFFFF`, Light grey `#0000000A`, Sand `#F7F2EE`
  — with the free picker, the hex box and the alpha slider behind a *Custom* disclosure that
  opens by default when the stored value is not one of the three. `alpha: true`, so translucent
  backgrounds are expressible and are written as `#RRGGBBAA`.
* There is **no L2 colour-format validation.** The widget can only produce hex, but an imported
  or hand-edited document carrying `rgb(…)` or a named colour is stored and emitted as-is.
* Sections may append their own appearance fields through `fields`. Only Logo Marquee does, with
  `speed` (range `10..90`, default `30`, unit `s`).
* `dynamicShell()` writes the value twice: as `background`, and as the custom property
  `--section-bg`, so a descendant can match the section's own background exactly.
* `render/page.js` inserts a `.lpb-divider` hairline between two adjacent sections resolving to
  the same background, comparing `props.bg_color` where there is one and the type's `fixedBg`
  where there is not.

### 4.5 In-Page Anchor — `advancedGroup(fields)`

| Attribute Name | Data Type | Required | Default | Status |
| :--- | :--- | :--- | :--- | :--- |
| `anchor_id` | `String \| null` | No | `null` | `BUILT` |

`scope: 'section'` — the inspector writes this one onto the `Section` itself via
`patchSection()`, not into `props`. Its validation gap and its editability gap are recorded in
`10_ABSTRACT §5` rules 4 and 5 and are not repeated here.

### 4.6 Call To Action — `ctaFields(key, opts)` / `ctaGroup(key, opts)`

A CTA is **one nested object**, not three flat props.

```js
cta: { on: Boolean, label: String, href: String }
```

| Attribute Name | Data Type | Required | Default | Status |
| :--- | :--- | :--- | :--- | :--- |
| `cta.on` | `Boolean` | only when `toggle: true` | `false` (field default); a section's own `defaults` may override | `BUILT` |
| `cta.label` | `String` | when the button renders | `opts.label` | `BUILT` |
| `cta.href` | `String` | when the button renders | `#lead-modal` | `BUILT` |

**Notes on the above**

* v1's `cta_label`, `cta_url` and `show_cta_button` **do not exist**. Any document, template or
  agent still writing those three keys produces a section with no button: `ctaLink()` reads
  `cta.label` and renders nothing without it.
* `toggle: false` drops `cta.on` and makes the button unconditional. The switch, when present, is
  labelled **"Button"** — every switch in the editor is named after the thing it turns on — and
  it owns the two fields under it: `when` reveals them and `sub` indents them.
* `ctaFields` returns a plain array so a section can end its **Content** group with the button;
  `ctaGroup` wraps the same array in a collapsed group of its own, titled *Button* by default.
* `ctaLink()` (`render/html.js`) adds `target="_blank" rel="noopener noreferrer"` to any
  `href` matching `^https?://`. `#lead-modal` — the single magic href, `LEAD_ANCHOR` — is
  intercepted by the runtime and opens `21_OBJECT_FLIGHT_QUOTE_MODAL`. Everything else is a
  plain link.

**Who declares a CTA**

| Section | Form | Placement | Status |
| :--- | :--- | :--- | :--- |
| Text & Media (39) | `ctaFields('cta')` — toggled, default `on: true`, label *"Plan the Trip"* | Last fields of the **Content** group | `BUILT` |
| Large Image Banner (38) | `ctaGroup('cta', { toggle: false, label: 'Request a custom itinerary' })` | Its own **Button** group, between Content and Media; `cta.label` and `cta.href` are L1-required | `BUILT` |
| Story & Specs, Multi-Card Grid, Logo Marquee, Feature, FAQ | none | — | `BUILT` |

---

## 5. BUSINESS RULES & SYSTEM GUARDS (IF → THEN)

1. **Header Container Suppression.** `sectionHeader()` returns an empty string when
   `section_title` is blank **and** `subheading` carries no visible content (`blankRich()` strips
   tags, `&nbsp;` and whitespace before deciding). No wrapper, no margin, no empty band. — `BUILT`

2. **Heading alignment is shared, never independent.** `dynamicShell()` puts one class on the
   `<section>` — `a-left` or `a-center` — and both the title and the subheading inherit it.
   There is no per-element alignment and no way to express one. — `BUILT`

3. **Multi-instance isolation.** Each instance owns its own `props`, deep-cloned on insert and
   on duplicate (`structuredClone`). Nothing is shared by reference; editing one Text & Media
   cannot reach another. — `BUILT`

4. **Default boilerplate injection.** `addSection()` is always called with
   `props: defaultsFor(key)`, which is `structuredClone(type.defaults)`. Every dynamic type
   declares a complete payload — background, heading scale, alignment, real copy, real items — so
   a freshly inserted section is never blank. — `BUILT`

5. **Variant change is non-destructive — count-driven variants.** A repeater declaring
   `fixed: '<prop>'` (Multi-Card Grid `card_count`, Feature `item_count`) renders only the first
   *n* stored items and **keeps the rest in the document**, with the inspector saying so:
   *"N more items kept for the larger layout."* Dropping a 4-card grid to 2 and back restores
   cards 3 and 4 with their copy intact. — `BUILT`

6. **Variant change is non-destructive — preset-driven variants.** The `preset` widget writes
   only the keys its `applies` map declares (Feature: `icon_size`, `item_count`, `has_paragraph`,
   `heading_size`). No content field is touched, and the button shows as active only when every
   declared key already matches. — `BUILT`

7. **Variant change is non-destructive — `when`-gated fields.** A field hidden by its `when`
   predicate is not rendered and not written; its stored value survives untouched. Turning a CTA
   off and on again returns the label that was there, and switching Text & Media to *No Photo*
   keeps both image fields. — `BUILT`

8. **Preset values never overwrite authored content.** `defaults` are injected once, at insert.
   Nothing re-applies them afterwards, so there is no path by which a later edit can restore a
   preset over something an author wrote. — `BUILT`

9. **The panel does not repaint under a live caret.** The inspector skips a repaint while focus
   sits in a text input, a rich-text region, a colour picker or a range slider — anything holding
   an edit a rebuild would destroy. Buttons, selects and checkboxes repaint immediately, so a
   `when` condition reveals its field on the same click that satisfied it. — `BUILT`

---

## 6. DEFAULT PRESET INJECTION CONTRACT

Every concrete dynamic type MUST declare a `defaults` object covering at minimum `bg_color`,
`heading_size`, `heading_align` and its own required content. `defaultsFor(key)` deep-clones it;
`newSection()` deep-clones again on the way into the document. — `BUILT`

Two further paths produce sections without going through the library drawer, and both are new in
v2 (see `20_OBJECT_LANDING_PAGE §3`):

* **Built-in page templates** name component keys per slot and let each type's own `defaults`
  supply the copy — so the templates never duplicate a word and never drift. — `BUILT`
* **Saved templates and imported page bundles** carry whole sections with their authored content
  and their images; `sectionsFrom()` re-ids them and `repack()` re-seats them. — `BUILT`
