# `00_SYSTEM_ARCHITECTURE_AND_SLOTS.md`

```yaml
METACLASS: SYSTEM_SPECIFICATION (NOT AN OBJECT)
DOCUMENT_ID: SYS-00-ARCH
VERSION: 2.0.0
STATUS: APPROVED
DEPENDS_ON: SYS-02-ENUMS (canonical keys, archetypes, slot model, validation levels)
IMPLEMENTED_BY: src/model/enums.js, src/model/slots.js, src/model/validate.js, src/store/pages.js, src/ui/library.js, src/import.js
TARGET_AUDIENCE: [LLM_AGENT, BACKEND_DEV, FRONTEND_DEV, ARCHITECT]
```

> Every table row and every business rule below carries a `BUILT` / `PLANNED` / `DEFECT`
> marker. The legend is in `../README.md`. There is no "partially".

---

## 1. STRUCTURAL TOPOLOGY & SLOT ENGINE

The page is a **deterministic linear slot tree**: four **fixed anchor slots** at even indices
and three **dynamic container slots** at odd indices, interleaved.

```
PAGE_VIEWPORT_CANVAS
│
├── [SLOT_INDEX: 0] [FIXED_ANCHOR] ────── SECTION_HERO      (above-the-fold)
├── [SLOT_INDEX: 1] [DYNAMIC_CONTAINER] ─ modules [0..N]
├── [SLOT_INDEX: 2] [FIXED_ANCHOR] ────── SECTION_PRICES
├── [SLOT_INDEX: 3] [DYNAMIC_CONTAINER] ─ modules [0..N]
├── [SLOT_INDEX: 4] [FIXED_ANCHOR] ────── SECTION_TRUST     (global data)
├── [SLOT_INDEX: 5] [DYNAMIC_CONTAINER] ─ modules [0..N]
└── [SLOT_INDEX: 6] [FIXED_ANCHOR] ────── SECTION_FOOTER    (global data)
```

| Declaration | Where it lives | Value | Status |
| :--- | :--- | :--- | :--- |
| `ANCHOR_SLOT` | `src/model/enums.js` | `{ SECTION_HERO: 0, SECTION_PRICES: 2, SECTION_TRUST: 4, SECTION_FOOTER: 6 }` | `BUILT` |
| `DYNAMIC_SLOTS` | `src/model/enums.js` | `[1, 3, 5]` | `BUILT` |
| `MANDATORY_ANCHORS` | `src/model/enums.js` | `Object.keys(ANCHOR_SLOT)` — derived, never re-typed | `BUILT` |
| Render order | `inRenderOrder()`, `src/model/slots.js` | sort by `slot_index`, then `order_in_slot` | `BUILT` |

Slot indices are written as plain integers in storage (`0`, not `"00"`). The zero-padded
form in prose is presentational only.

---

## 2. COMPONENT TAXONOMY & CLASSIFICATION MATRIX

Every section type declares exactly one `archetype`, taken from `ARCHETYPE` in
`src/model/enums.js`. The archetype — not a per-section list — derives the permitted slots.

| Archetype (`ARCHETYPE.*`) | Structural behaviour | Data source | Instance limit | Permitted slots | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `ANCHOR` (`'anchor'`) | Position locked, not insertable, not deletable from the library | Page document | Exactly 1 | `0` or `2` | `BUILT` |
| `DUAL_ANCHOR` (`'dual-anchor'`) | Position locked; content read from the global store | Global singleton | Exactly 1 | `4` or `6` | `BUILT` |
| `STATIC` (`'static'`) | Reorderable inside dynamic slots | Global singleton | Max 1 per page | `1`, `3`, `5` | `BUILT` |
| `DYNAMIC` (`'dynamic'`) | Reorderable, fully mutable | Page document | Unbounded `0..N` | `1`, `3`, `5` | `BUILT` |

### 2.1 Derivation, not declaration

`permittedSlots(key, archetype)` in `src/model/enums.js` returns `[ANCHOR_SLOT[key]]` for the
two anchor archetypes and `[...DYNAMIC_SLOTS]` for everything else. No section module
declares its own slot list. — `BUILT`

### 2.2 Which archetype each key carries

`SECTION_HERO` / `SECTION_PRICES` are `ANCHOR`; `SECTION_TRUST` / `SECTION_FOOTER` are
`DUAL_ANCHOR`; `SECTION_SUBSCRIPTION` / `SECTION_CONTACT` are `STATIC`; the remaining seven
keys (`SECTION_QUICK_FACTS`, `SECTION_MULTI_CARD_GRID`, `SECTION_LARGE_IMAGE_BANNER`,
`SECTION_TEXT_MEDIA`, `SECTION_LOGO_MARQUEE`, `SECTION_FEATURE`, `SECTION_FAQ`) are
`DYNAMIC`. The full registry is `SYS-02 §1`. — `BUILT`

`GLOBAL_CONTENT_ARCHETYPES` (`[DUAL_ANCHOR, STATIC]`) is the single place the "content comes
from the global store" rule is expressed; `src/ui/inspector.js` reads it to redirect the
author to the globals panel. — `BUILT`

---

## 3. SLOT ALLOCATION & REORDERING ENGINE

### 3.1 Positional model (`slot_index` + `order_in_slot`)

| Field | Type | Default on creation | Description & constraints | Status |
| :--- | :--- | :--- | :--- | :--- |
| `slot_index` | `Integer` | `ANCHOR_SLOT[key] ?? slot ?? 1` (`newSection`, `src/store/pages.js`) | Which container holds the section. Immutable for anchors; mutable across `1`,`3`,`5` for modules. | `BUILT` |
| `order_in_slot` | `Integer` | `0`, then overwritten by `appendToSlot` | Zero-based order **within that slot only**. `repack()` re-densifies to `0..n-1` after every mutation. | `BUILT` |

A single flat page-wide `order_index` does not exist in the model and is not accepted
anywhere in `src/`. — `BUILT`

### 3.2 Business rules

1. **Anchor immutability invariant — `BUILT`.**
   `isAnchor()` (`src/model/slots.js`) is the guard, and every mutator — `moveUp`, `moveDown`,
   `moveTo` — returns `false` immediately for an anchor. Because `ANCHOR_SLOT` values are
   constants, `Hero(0) < Prices(2) < Trust(4) < Footer(6)` holds structurally with no ordering
   arithmetic.

2. **Reorder within a slot — `BUILT`.**
   `moveUp` / `moveDown` swap `order_in_slot` with the adjacent sibling, then `repack()`.

3. **Move across an anchor — `BUILT`.**
   `moveUp` sets `slot_index = prevDynamicSlot(...)` and
   `order_in_slot = sectionsInSlot(target).length` (lands **last**, directly above the anchor
   it just crossed). `moveDown` sets `slot_index = nextDynamicSlot(...)` and
   `order_in_slot = -1`, a prepend sentinel that `repack()` resolves to `0` (lands **first**,
   directly below the anchor). At the ends of the page `prevDynamicSlot` / `nextDynamicSlot`
   return `null` and the move is refused.

4. **Drag-and-drop to an explicit gap — `BUILT`.**
   `moveTo(sections, id, slot, index)` is what a drop resolves to. `index` counts the target
   slot's **other** sections, so it names the gap, not a final array position. The landing
   value is a half-step (`-0.5` for the head, `others[at-1].order_in_slot + 0.5` otherwise)
   that `repack()` turns back into dense integers. A drop that changes nothing returns
   `false`, so `commit()` leaves history untouched and the author gets no empty undo step.

5. **A move into a slot the archetype does not permit is rejected — `BUILT`, silently.**
   `moveTo` returns `false` unless `DYNAMIC_SLOTS.includes(slot)`. Since every non-anchor
   archetype permits exactly `DYNAMIC_SLOTS`, the slot-type test and the archetype test are
   equivalent today.

6. **A rejected move reports `E008` to the author — `DEFECT`.**
   No mutator in `src/model/slots.js` produces an `Issue`; they return booleans. `E008` is
   emitted only by `validateStructure()` over stored state, and that path cannot be reached
   by a move because `moveTo` refuses the illegal slot before it is written. The condition is
   unreachable: a rejected drag is silent, with no message, no toast and no issue row. See
   `SYS-02 §4.1`.

7. **Insertion — `BUILT`.** `appendToSlot()` sets
   `order_in_slot = sectionsInSlot(slot).length`, pushes, repacks.

8. **Duplication — `BUILT`.** `insertAfter()` seats the clone at
   `source.order_in_slot + 0.5`, which `repack()` resolves to the position directly beneath
   the source. A missing `refId` falls back to appending to slot `1`.

9. **Deletion — `BUILT`.** `removeSection()` splices and repacks. `deleteSection()` in the
   store clears the selection when the deleted section was selected.

### 3.3 Multi-instance handling

| Rule | Status |
| :--- | :--- |
| Any `DYNAMIC` module may be instantiated N times on one page. | `BUILT` |
| Each instance receives a unique id from `uid('sec')` (`src/util.js`) — a prefixed random id, **not** a UUIDv4. v1's UUIDv4 claim is wrong. | `BUILT` |
| Props, media references and visual overrides are isolated per instance: `newSection` deep-clones its `props` and `duplicateSection` deep-clones the source. | `BUILT` |
| Imported sections are re-issued fresh ids (`sectionsFrom()`, `src/import.js`), so an imported page cannot collide with one already open. | `BUILT` |

---

## 4. PRESET & TEMPLATE INJECTION PIPELINE

```
[User trigger: Add a section in slot N]   (src/ui/library.js — openLibrary)
         │
         ▼
[insertableTypes(): archetype 'dynamic' or 'static' only; anchors are never offered]
         │
         ├── IF (STATIC and key already on the page)
         │        └─> the library card is rendered disabled, with the reason in its body:
         │            "Already on this page — only one is permitted."
         │
         └── ELSE
                  ▼
         [defaultsFor(key) — structuredClone of the type's own `defaults` object]
                  ▼
         [store.addSection(key, { slot, props }) -> newSection() -> appendToSlot()]
                  ▼
         [commit(): snapshot for undo, persist to localStorage, emit('doc')]
```

| Step | Status |
| :--- | :--- |
| Anchors are excluded from the library; they arrive with the page template (`pageFromTemplate`, `src/presets/page-templates.js`). | `BUILT` |
| Insert injects the section type's full `defaults` payload, so a new section is never blank. | `BUILT` |
| Static-module uniqueness is enforced **on insert** by disabling the library card. | `BUILT` |
| Static-module uniqueness is enforced **on duplicate** — `duplicateSection()` (`src/store/pages.js`) clones any section by id with no archetype check, so Duplicate produces a second `SECTION_SUBSCRIPTION` or `SECTION_CONTACT` on the same page. The resulting document is then reported by `E006` / `E007`, but nothing prevents the action and nothing blocks the page. | `DEFECT` |
| Import applies no archetype, slot or key checks (`sectionsFrom()` only re-ids and repacks), so a bundle may introduce duplicates, unknown keys and illegal slots. This is the only path by which `E008` and duplicate anchors become reachable. | `DEFECT` |

---

## 5. PAGE INTEGRITY INVARIANTS — L0 (STRUCTURAL)

`validateStructure(page, registry)` in `src/model/validate.js` is the whole of L0. It reads
the page document and the section registry and returns `Issue[]`; it never mutates and never
throws. Level definitions and the error registry are `SYS-02 §4`.

| # | Invariant | Code | Implementation | Status |
| :--- | :--- | :--- | :--- | :--- |
| 1 | Each of the four mandatory anchors is present. | `E001`–`E004` via `MISSING_ANCHOR_CODE` | Loop over `MANDATORY_ANCHORS` | `BUILT` |
| 2 | Each anchor present occupies its immutable slot. | `E005`, one issue per offending section, carrying `sectionId` and a message naming expected vs found | Same loop | `BUILT` |
| 3 | Each static module appears at most once. | `E006` / `E007` via `DUPLICATE_STATIC_CODE` | `countOf(key) > 1` | `BUILT` |
| 4 | Every **non-anchor** section sits in a slot its archetype permits. | `E008` | `permittedSlots(s.key, type.archetype).includes(s.slot_index)` | `BUILT` |
| 5 | Every section's key resolves to a registered type. | `E008` again, with the message `Unknown component key: {key}.` | Same loop, `if (!type)` branch | `BUILT` — but the code reuse is undocumented in v1's registry; see `SYS-02 §4.1` |
| 6 | Each anchor appears at most once. | — | Not implemented. The anchor loop filters by key and iterates **all** matches; two `SECTION_HERO` sections both in slot `0` produce no issue of any kind. Reachable via import. | `PLANNED` |

**Anchors are deliberately exempt from rule 4.** A misplaced anchor is already described
precisely by `E005`, and emitting both codes would report one mistake twice. — `BUILT`

---

## 6. PAGE LIFECYCLE & THE PUBLISH GATE

| Rule | Status |
| :--- | :--- |
| `status` is one of `'Draft' \| 'Published' \| 'Archived'` (`PageDoc`, `src/model/types.js`). | `BUILT` |
| `status` is written exactly once, to `'Draft'`, by `newPageDoc()` (`src/store/pages.js`). No other assignment to `status` exists in `src/`; import does not carry a source status over. Every page in the system is therefore permanently a Draft. | `DEFECT` |
| A `Draft` saves regardless of L0 and L1 — `commit()` persists unconditionally and validation runs afterwards, as an advisory pass. | `BUILT` |
| `canPublish(page, registry, ctx)` exists in `src/model/validate.js` and returns `{ ok, blocking }`. It has **no call site outside `test/validate.test.js`**. | `PLANNED` |
| A `Draft -> Published` transition exists. There is no publish action, no publish button, no state machine and no gate. | `PLANNED` |
| L0 + L1 issues are surfaced advisorily: `runValidation()` in `src/main.js` runs `validatePage` on every document change (debounced 250 ms), counts `L0.length + L1.length` as "blocking", lights the topbar dot and fills the Issues panel. Nothing is actually blocked by it. | `BUILT` |
| **Export** is explicitly not publish: `src/main.js` lets an author export an incomplete page, but interposes an "Export with open issues?" confirmation when any non-`L2` issue is open. | `BUILT` |
