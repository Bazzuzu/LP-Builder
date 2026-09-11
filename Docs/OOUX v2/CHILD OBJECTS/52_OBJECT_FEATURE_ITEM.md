# `52_OBJECT_FEATURE_ITEM.md`

```yaml
METACLASS: CONCRETE_OBJECT
OBJECT_ID: OBJ-52-FEATURE-ITEM
VERSION: 2.0.0
STATUS: APPROVED
DEPENDS_ON: SYS-02-ENUMS
INHERITANCE: CHILD_EMBEDDED_ENTITY
PARENT_ENTITY: OBJ-41-FEATURE-SECTION
SOURCE_OF_TRUTH: src/sections/feature.js
TARGET_AUDIENCE: [LLM_AGENT, BACKEND_DEV, FRONTEND_DEV, UI_DESIGNER]
```

---

## 1. OBJECT DEFINITION

An individual perk, guarantee or benefit inside `41_OBJECT_SECTION_FEATURE`: an icon, a
title, and a paragraph whose existence is decided by the parent's preset. The item has no
presentation settings of its own — its icon box, its layout and whether its copy is shown at
all are consequences of `41 §4.3`.

Items live in the parent's `items` array as plain records: three fields, no identifier.

---

## 2. RELATIONSHIPS (OOUX ORCA MAPPING)

- **Belongs To (N:1):** `41_OBJECT_SECTION_FEATURE`. Cannot exist outside its parent.
- **Parameter Adaptation:** shows or hides `paragraph` per the parent's `has_paragraph`,
  and sizes its icon box to the parent's `icon_size`.
- **Cardinality:** the parent holds up to 4 at all times; `item_count` (3 / 4) decides how
  many are active. Under the `L` preset the count control is hidden and the count is 3.

---

## 3. OBJECT LIFECYCLE & ADMIN CTAs

| Action (CTA) | Admin UI Location | System Behavior | Status |
| :--- | :--- | :--- | :--- |
| **Instantiate** | Parent's **How many** control | Mounted by index per `item_count`. The repeater is `fixed: 'item_count'`, so there is **no per-row Add, Duplicate or Delete**. | `BUILT` |
| **Upload Icon** | Item row, **Icon** field | Uploads or replaces an SVG or PNG. `decorative: true` — the control offers no alt input at all. | `BUILT` |
| **Edit Copy** | Item row, **Title** / **Text** | `title` is plain text; **Text** appears only while the parent's `has_paragraph !== false`. | `BUILT` |
| **Reorder** | Item row, ▲ / ▼ | Move up / move down buttons. No drag handle. | `BUILT` |
| **Deactivate** | Parent's **How many** control, or any preset button | Dropping to 3 deactivates item 4: not rendered, not validated, **kept in the persisted document** (*"1 more item kept for the larger layout."*). Note that pressing **any** preset button also drops the count to 3 — parent §6.2. | `BUILT` |
| **Delete permanently** | — | No control deletes a single item outright. | `BUILT` |

---

## 4. ATTRIBUTES MATRIX

| Attribute Name | Data Type | Required | Default Value | Status | Description & Constraints |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `item_id` | `UUIDv4` | — | — | `PLANNED` | **Does not exist.** Identity is the array index: the renderer maps over `items`, validation writes `items.0.icon`, `items.1.title`, …, and the editor's open-row state is keyed by position. Reordering re-addresses every error after the moved item, and nothing can hold a stable reference to one. v1 specified an auto-generated id; none is generated. |
| `icon` | `Media` | **Yes** | `null` in the seed | `BUILT` | SVG preferred, PNG accepted. `E101` on `items.N.icon` when no asset. Clamped to the parent's `icon_size` (48 or 64 px, square) by an inline `width`/`height` on the box. |
| `icon.alt` | — | — | — | `BUILT` | **No alt field exists.** `decorative: true` removes the input, and the renderer emits `alt=""`. The mandatory `title` beside the icon already carries the meaning, so the icon is decoration — `SYS-02 §6`. |
| `title` | `String` | **Yes** | Preset copy | `BUILT` | `E100` on `items.N.title`. `18px` at `--title-weight` in the `L` and `M` layouts; `16px` at weight `600` in `S`, where it is the whole item. One field name in every configuration — the bullet label and the headline are the same attribute. |
| `paragraph` | `RichText` | If `has_paragraph` | Preset copy | `BUILT` | `RT_BASIC` (bold, italic, strike, colour — no lists, no links). Required and validated while the parent's `has_paragraph !== false` (`E100` on `items.N.paragraph`); otherwise hidden from the panel, omitted from the DOM, not validated, and **retained in storage**, so switching back to `M` or `L` restores it. Rendered at `15px` in soft ink. |

---

## 5. DEFAULT SEED PAYLOAD (FROM THE PARENT)

Items are seeded by the parent's `defaults.items` (doc 41 §5) — this object has no preset of
its own, and **the parent's `S`/`M`/`L` presets carry no content either** (doc 41 §4.3,
`PLANNED`). The seed is one list of four, written for the `L` configuration:

```yaml
seeded_items:
  - icon: null
    title: "Wholesale fare privilege"
    paragraph: "<p>Up to 70% off published business and first class fares via private consolidator contracts.</p>"
  - icon: null
    title: "Dedicated personal agent"
    paragraph: "<p>Direct access to a senior specialist who manages your booking, seats and routing 24/7.</p>"
  - icon: null
    title: "Complete journey protection"
    paragraph: "<p>Flight monitoring, fee-free date changes and emergency re-routing assistance.</p>"
  - icon: null            # inactive at item_count 3
    title: "Best fare guarantee"
    paragraph: "<p>Matched or bettered against any comparable quote.</p>"
```

Every seeded item ships with `icon: null`, so a freshly inserted Feature section is **not**
publishable: each active item raises `E101` until an icon is uploaded.

---

## 6. BUSINESS RULES & PARAMETER ADAPTATION (IF -> THEN)

1. **Adaptation Matrix (driven entirely by parent parameters, `41 §4.3`) — `BUILT`**

   | Parent parameter | Effect on this item |
   | :--- | :--- |
   | `icon_size: 48` | 48px square box; the item renders in the `M` row layout (icon left, copy right) or the `S` bullet layout. |
   | `icon_size: 64` | 64px square box; the item renders as the `L` vertical stack, centred when the section is centred. |
   | `has_paragraph: true` | `paragraph` shown in the panel and required (L1). |
   | `has_paragraph: false` | `paragraph` hidden, omitted from the DOM, not validated, value kept. |
   | `item_count` | Items beyond the count are inactive: not rendered, not validated, kept. |

2. **Mandatory Content (L1, `E100` / `E101`) — `BUILT`**
   - Every **active** item requires `icon` and `title`; with `has_paragraph !== false` it
     also requires `paragraph`. Inactive items raise nothing.

3. **Icon Geometry — `BUILT`**
   - The asset renders `width:100%; height:100%; object-fit:contain` inside the
     parent-dictated box, so no upload can shift the layout. The box keeps its `14px` radius.
   - **The box has no background tint.** v1 §6.3 and this document's v1 §4 described a
     "badge" fill; it was removed deliberately, because a semi-transparent PNG icon on a grey
     chip reads as darkened and muddy. The empty-state placeholder paints its own background,
     so the box needs none of its own either way.

4. **Icon Alt Text — `BUILT`**
   - `alt=""`, always, with no field offered. See §4.

5. **Preset Hydration — `PLANNED`**
   - v1 specified that the parent's presets seed `icon`, `title` and `paragraph`, and that a
     parameter change fills empty fields only. **Neither happens.** The parent's presets
     write four presentation values and never touch `items`; the only content this object
     ever receives is the one-time `defaults` payload at insertion. Nothing is overwritten,
     because nothing is written — the non-destructive guarantee in `11_ABSTRACT §6.2` holds
     here by absence rather than by implementation.
