# `10_ABSTRACT_OBJECT_PAGE_SECTION.md`

```yaml
METACLASS: ABSTRACT_OBJECT
OBJECT_ID: OBJ-10-BASE-SECTION
VERSION: 2.0.0
STATUS: APPROVED
INHERITANCE: ROOT_ABSTRACT_CLASS
DEPENDS_ON: SYS-02-ENUMS (component keys, slot model, validation levels, media contract)
SOURCE_OF_TRUTH: src/model/types.js, src/model/enums.js, src/model/slots.js, src/store/pages.js
TARGET_AUDIENCE: [LLM_AGENT, BACKEND_DEV, FRONTEND_DEV, ARCHITECT]
```

---

## 1. OBJECT DEFINITION

The foundational abstract base entity for any horizontal block rendered within a `LandingPage`.
It owns the positional model (`slot_index` + `order_in_slot`), the render-visibility flag, the
optional in-page anchor and the audit timestamps. It carries **no content of its own**: every
content field a concrete section declares lives inside `props`, and every global-content section
reads its copy from the global store instead.

The runtime shape is the `Section` typedef in `src/model/types.js`. This document describes that
shape — not an intended one.

---

## 2. RELATIONSHIPS (OOUX ORCA MAPPING)

- **Belongs To (N:1):** `20_OBJECT_LANDING_PAGE`. A section is an element of `PageDoc.sections`
  and has no independent storage.
- **Specialized By (Inheritance Tree):**
  - **Concrete Anchors** (`archetype: 'anchor'`, page-level data):
    - `30_OBJECT_SECTION_HERO` — slot `00`
    - `31_OBJECT_SECTION_PRICES` — slot `02`
  - **Concrete Dual-Role Anchors** (`archetype: 'dual-anchor'`, global data):
    - `32_OBJECT_SECTION_TRUST` — slot `04`
    - `33_OBJECT_SECTION_FOOTER` — slot `06`
  - **Concrete Statics** (`archetype: 'static'`, global data, max 1 per page):
    - `34_OBJECT_SECTION_STATIC_SUBSCRIPTION`
    - `35_OBJECT_SECTION_STATIC_CONTACT`
  - **Abstract Dynamic Subclass:**
    - `11_ABSTRACT_OBJECT_DYNAMIC_SECTION` — parent of the seven dynamic modules
      (`36`, `37`, `38`, `39`, `40`, `41`, `42`).

---

## 3. OBJECT LIFECYCLE & ADMIN CTAs

| Action (CTA) | Admin Permission Rule | System Behavior | Status |
| :--- | :--- | :--- | :--- |
| **Insert** | Dynamic and static types only; anchors are created with the page | `addSection()` → `appendToSlot()`; `order_in_slot = len(slot)`, then `repack()` | `BUILT` |
| **Reorder (Up/Down)** | Non-anchors only (`isAnchor()` guard in `slots.js`) | `moveUp` / `moveDown`: swap with the sibling, or cross the anchor into the neighbouring dynamic slot (end when moving up, start when moving down) | `BUILT` |
| **Reorder (Drag & drop)** | Non-anchors, dynamic target slots only | `moveTo(sections, id, slot, index)`; a drop that changes nothing returns `false` and leaves history untouched | `BUILT` |
| **Duplicate** | Offered on non-anchor rows only | `duplicateSection()` → `insertAfter()`, fresh `id`, fresh timestamps, deep-cloned `props` | `BUILT` |
| **Toggle Visibility** | UI offers it on non-anchor rows only | `toggleVisibility(id)` flips `is_visible`; a hidden section is dropped from the rendered document and skipped by L1 | `BUILT` |
| **Delete** | UI offers it on non-anchor rows only | `deleteSection(id)` → `removeSection()` + `repack()`; child items inside `props` go with it | `BUILT` |
| **Mandatory-anchor delete guard (model level)** | v1 required `canDelete() === false` for anchors | No such guard exists. `store.deleteSection()` removes any id it is given, anchors included; only the outline's omission of the menu prevents it | `DEFECT` |
| **Mandatory-anchor visibility guard (model level)** | v1 required `canToggleVisibility() === false` for anchors | No such guard exists. `store.toggleVisibility()` accepts any id, anchors included | `DEFECT` |
| **Disabled control on anchors** | v1 required the Delete / Hide control be *rendered permanently disabled* | Anchor rows render no `⋯` menu at all (`src/ui/outline.js`); the affordance is a padlock glyph with the title *"Fixed position — every page has this section"* | `PLANNED` |

> A deleted anchor is recoverable only through undo (`Cmd/Ctrl+Z`), and the page then fails L0
> with `E001`–`E004` until the anchor is restored. The structural validator catches the state;
> nothing prevents reaching it.

---

## 4. ATTRIBUTES MATRIX

### 4.1 Structural & System Attributes

| Attribute Name | Data Type | Required | Default | Status |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `String` | Yes | `AUTO_GEN` | `BUILT` |
| `key` | `Enum<ComponentKey>` | Yes | none | `BUILT` |
| `slot_index` | `Integer` | Yes | anchor slot, else the requested slot, else `1` | `BUILT` |
| `order_in_slot` | `Integer` | Yes | `0`, resolved by `repack()` | `BUILT` |
| `anchor_id` | `String \| null` | No | `null` | `BUILT` |
| `is_visible` | `Boolean` | Yes | `true` | `BUILT` |
| `props` | `Record<String, any>` | Yes | the type's `defaults`, deep-cloned | `BUILT` |

**Notes on the above**

* `id` is **not** a UUIDv4 and the field is **not** named `section_id`. `uid('sec')` produces
  `sec_` followed by 7 base-36 characters from `Math.random()` — roughly 36⁷ ≈ 7.8 × 10¹⁰ values,
  scoped to one browser's `localStorage`. It is an editor-session identifier, not a database key.
* `key` is one of the thirteen values in `COMPONENT_KEYS` (`SYS-02 §1`). It is the discriminator
  the registry, the renderer and the validator all key on.
* `slot_index` is immutable in practice for anchors: `newSection()` overrides any requested slot
  with `ANCHOR_SLOT[key]`, and `moveUp` / `moveDown` / `moveTo` all refuse anchors outright.
  Nothing re-checks it after a hand-edited import, which is why L0 `E005` exists.
* `order_in_slot` is dense (`0..n-1`) after every mutation. The mutators write sentinel values
  (`-0.5` to prepend, `x + 0.5` to follow, `len` to append) and `repack()` resolves them.
* `anchor_id` becomes the section's DOM `id`. Every renderer emits it — `dynamicShell()` for the
  seven dynamic types, and an explicit `attr('id', section.anchor_id)` in `hero.js`, `prices.js`,
  `trust.js`, `footer.js`, `subscription.js` and `contact.js`. Its editability and its validation
  are separate concerns; see §5 rules 4 and 5.
* `props` is a free-form bag. There is no per-key schema enforcement at write time:
  `setSectionProp()` writes whatever dot path it is given, creating intermediate objects and
  arrays as needed. Field descriptors constrain the *editor*, not the *store*.

### 4.2 Audit & Telemetry Attributes

| Attribute Name | Data Type | Required | Default | Status |
| :--- | :--- | :--- | :--- | :--- |
| `created_at` | `Integer` (epoch ms) | Yes | `Date.now()` | `BUILT` |
| `updated_at` | `Integer` (epoch ms) | Yes | `Date.now()` | `BUILT` |

**Notes on the above**

* Both are **epoch milliseconds**, not ISO8601 strings. v1 declared `ISO8601`; nothing in the
  codebase has ever written one.
* `updated_at` is refreshed by `setSectionProp()`, `patchSection()` and `toggleVisibility()`.
  It is **not** refreshed by a reorder: `moveUp` / `moveDown` / `moveTo` mutate `order_in_slot`
  and `slot_index` through `slots.js`, which knows nothing about timestamps. Moving a section is
  therefore invisible in its own audit trail, though `PageDoc.updated_at` does advance.

### 4.3 Derived, Not Stored

v1 declared `position_type` and `is_mandatory` as stored immutable columns. Neither exists.
Mandatoriness and mobility are **computed** from `key` and `archetype` every time they are needed.

| Derived Predicate | Source | Replaces | Status |
| :--- | :--- | :--- | :--- |
| `isAnchor(section)` | `ANCHOR_SLOT[section.key] !== undefined` (`src/model/slots.js`) | `position_type === 'Fixed'`, `is_mandatory === true` | `BUILT` |
| `permittedSlots(key, archetype)` | `[ANCHOR_SLOT[key]]` for anchors and dual-anchors, `[1, 3, 5]` otherwise (`src/model/enums.js`) | `position_type` slot mobility | `BUILT` |
| `maxInstances(archetype)` | `Infinity` for `dynamic`, `1` for everything else | v1's per-document multiplicity prose | `BUILT` |
| `MANDATORY_ANCHORS` | `Object.keys(ANCHOR_SLOT)` — `SECTION_HERO`, `SECTION_PRICES`, `SECTION_TRUST`, `SECTION_FOOTER` | `is_mandatory` | `BUILT` |

Deriving rather than storing removes a whole class of drift — a hand-edited document cannot claim
a Hero is optional — but it also means the guard has to be *applied* wherever it matters, and §3
records the two places where it is not.

---

## 5. BUSINESS LOGIC & STRUCTURAL INVARIANTS

1. **Render order.** Sections render sorted by `slot_index`, then `order_in_slot`
   (`inRenderOrder()`), so the anchor sequence `Hero(0) < Prices(2) < Trust(4) < Footer(6)` holds
   structurally and no arithmetic can violate it. — `BUILT`

2. **DOM rendering guard.** `renderPage()` filters to `s.is_visible !== false` before rendering.
   A hidden section is absent from both the preview and the export — not hidden with CSS. — `BUILT`

3. **Content-validation scope.** `validateContent()` skips any section with
   `is_visible === false`, so a hidden, half-filled block never blocks the page. Structural
   checks (L0) still see it. — `BUILT`

4. **`anchor_id` is editable only on dynamic sections.** The control comes from
   `advancedGroup()` in `_common.js`, and only the seven dynamic modules include that group.
   Hero, Prices, Trust, Footer, Subscription and Contact **render** `anchor_id` faithfully but
   expose no field to set it — so the six sections a nav link most obviously wants to reach are
   the six that cannot be given an anchor through the UI. — `DEFECT`

5. **`anchor_id` has no format and no uniqueness check.** `writeValue()` in `inspector.js` stores
   the raw string (or `null` when blank) via `patchSection()`. v1 specified the regex
   `^[a-z0-9-]+$` and per-page uniqueness at L2; neither is implemented, and no `E200` is ever
   raised for this field. Two sections may carry the same `id`, and `#My Anchor` is accepted. — `PLANNED`

6. **Unknown component keys degrade, they do not throw.** `renderPage()` emits
   `<!-- unknown section type: KEY -->` and `validateStructure()` raises `E008` with
   *"Unknown component key"*. A section whose type was removed cannot take the editor down. — `BUILT`

7. **A render error is contained to its own section.** `renderPage()` wraps each
   `type.render()` in `try/catch`, logs, and substitutes an HTML comment naming the failing key.
   One broken block never blanks the page. — `BUILT`

8. **Every mutation is undoable.** All section CRUD goes through `store.commit()`, which snapshots
   the whole page list (60 steps), persists to `localStorage`, and coalesces rapid edits to the
   same field path within 700 ms into one undo step. — `BUILT`

9. **Registry drift guard.** `src/sections/_registry.js` throws at load time if the set of
   registered module keys is not exactly `COMPONENT_KEYS`. It compares code against code — it does
   not read this specification, which is precisely how `SECTION_FAQ` lived in the system with no
   document of its own. A test that reads the key table out of `SYS-02 §1` is not written. — `PLANNED`

---

## 6. UNIVERSAL MEDIA CONTRACT

Every image field is a `MediaValue`: `{ asset?: string, url?: string, alt?: string }`. `asset` is
an id in the IndexedDB asset store; `url` is a direct or imported data URL. `img()` in
`render/html.js` resolves `url` first, then `asset`, and falls back to a labelled placeholder box
when neither is present.

1. **An image field is complete when it has an asset.** `needMedia()` raises `E101` only when
   both `asset` and `url` are absent. — `BUILT`

2. **`alt` is always emitted, never demanded.** `img()` writes `alt=""` for a field declared
   `decorative: true` and `media.alt || ''` otherwise. v1 (`SYS-02 §6`) made a missing `alt` an
   L1 issue; that requirement is not implemented, because it blocked publishing over a caption
   nobody had written yet. The editor pre-fills a guess from the filename
   (`humanizeFilename()`), so the usual path still ships an `alt`. — `PLANNED`

3. **`decorative` is a UI decision, not a validation one.** It hides the alt input in the image
   widget and forces `alt=""` at render. It no longer changes whether anything is required. — `BUILT`
