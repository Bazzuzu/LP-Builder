# `02_SYSTEM_CANONICAL_ENUMS_AND_VALIDATION.md`

```yaml
METACLASS: SYSTEM_SPECIFICATION (NOT AN OBJECT)
DOCUMENT_ID: SYS-02-ENUMS
VERSION: 1.0.0
STATUS: APPROVED
SCOPE: CANONICAL_REGISTRIES_AND_VALIDATION_CONTRACT
TARGET_AUDIENCE: [LLM_AGENT, BACKEND_DEV, FRONTEND_DEV, ARCHITECT]
```

> **This document is the single source of truth for every shared enum, key and constant.**
> Where any other document repeats one of these values, that copy is illustrative only.
> On conflict, this file wins.

---

## 1. COMPONENT KEY REGISTRY

All keys use the uniform `SECTION_` prefix. No other prefix is valid.

| `component_key` | Object doc | Archetype | Permitted slots | Multiplicity |
| :--- | :--- | :--- | :--- | :--- |
| `SECTION_HERO` | 30 | Fixed Anchor | `00` | Exactly 1 |
| `SECTION_PRICES` | 31 | Fixed Anchor | `02` | Exactly 1 |
| `SECTION_TRUST` | 32 | Dual-Role Anchor | `04` | Exactly 1 |
| `SECTION_FOOTER` | 33 | Dual-Role Anchor | `06` | Exactly 1 |
| `SECTION_SUBSCRIPTION` | 34 | Static Module | `01`,`03`,`05` | Max 1 |
| `SECTION_CONTACT` | 35 | Static Module | `01`,`03`,`05` | Max 1 |
| `SECTION_QUICK_FACTS` | 36 | Dynamic Module | `01`,`03`,`05` | 0..N |
| `SECTION_MULTI_CARD_GRID` | 37 | Dynamic Module | `01`,`03`,`05` | 0..N |
| `SECTION_LARGE_IMAGE_BANNER` | 38 | Dynamic Module | `01`,`03`,`05` | 0..N |
| `SECTION_TEXT_MEDIA` | 39 | Dynamic Module | `01`,`03`,`05` | 0..N |
| `SECTION_LOGO_MARQUEE` | 40 | Dynamic Module | `01`,`03`,`05` | 0..N |
| `SECTION_FEATURE` | 41 | Dynamic Module | `01`,`03`,`05` | 0..N | `primaryCards` / `secondaryCards` / `bullets` ⚠ |

---

## 2. REGION ENUM (SINGLE SHARED TAXONOMY)

Used by `LandingPage.target_region` (doc 20) **and** `PriceRowItem.region` (doc 50).
Neither document may define its own list.

```typescript
type Region =
  | 'Global'
  | 'North America'
  | 'Latin America'
  | 'Europe'
  | 'Northern Africa'
  | 'Africa'          // Sub-Saharan. 'Northern Africa' is the disjoint complement.
  | 'Middle East'
  | 'Indian Subcontinent'
  | 'Asia'
  | 'Oceania';
```

* `Global` is a routing/fallback value, not a geography: a `Global` price row is shown under
  every region tab (see doc 31 §5.3).
* The list is closed: a region that is not here cannot be assigned to a page or a price row.

---

## 3. SLOT & ORDER MODEL

A section's position is expressed by **two** integers. `order_index` as a single flat
page-wide counter is deprecated and removed — it could not represent more than one dynamic
section between two anchors.

| Field | Type | Description |
| :--- | :--- | :--- |
| `slot_index` | `Integer` | Which container the section lives in: `00`,`02`,`04`,`06` for anchors (immutable), `01`,`03`,`05` for dynamic containers (mutable for dynamic/static modules). |
| `order_in_slot` | `Integer` | Zero-based order **within that slot only**. Anchors are always `0` (their slot holds exactly one section). |

**Render order:** sort by `slot_index`, then by `order_in_slot`.
**Anchor invariant:** `slot_index` of an anchor is immutable, so
`Hero(00) < Prices(02) < Trust(04) < Footer(06)` holds structurally, without ordering arithmetic.
**Moving across an anchor:** changes `slot_index` and re-seats `order_in_slot` at the target end.

---

## 4. VALIDATION LEVELS

Every rule in every object document belongs to exactly one level. Documents that say
"blocks saving" without qualification are to be read as **L2** unless listed here.

| Level | When enforced | Blocks | Purpose |
| :--- | :--- | :--- | :--- |
| **L0 — Structural** | On publish | Publish | Page skeleton integrity (anchors, order, uniqueness). |
| **L1 — Content completeness** | On publish | Publish (not save) | Mandatory content fields per section. A draft may be incomplete. |
| **L2 — Field format** | On save (per field) | Save of that field | Type/format/regex: email, slug, hex color, date order, price mask. |

**Consequence:** a `Draft` is always savable even with empty mandatory fields — presets exist so
this is rare, but a content manager who clears a field is never trapped in an unsavable editor.
`Published` requires L0 + L1 + L2 to all pass.

**Hidden sections:** if `is_visible === false`, L1 is **skipped** for that section (it is not in
the output). L0 and L2 still apply.

### 4.1 Error code registry

| Code | Level | Message |
| :--- | :--- | :--- |
| `E001` | L0 | Missing mandatory `SECTION_HERO`. |
| `E002` | L0 | Missing mandatory `SECTION_PRICES`. |
| `E003` | L0 | Missing mandatory `SECTION_TRUST`. |
| `E004` | L0 | Missing mandatory `SECTION_FOOTER`. |
| `E005` | L0 | Fixed anchor slot sequence violation. |
| `E006` | L0 | Duplicate `SECTION_SUBSCRIPTION`. |
| `E007` | L0 | Duplicate `SECTION_CONTACT`. |
| `E008` | L0 | Section assigned to a slot its archetype does not permit (§1). Anchors are exempt: a misplaced anchor reports `E005` only, so one mistake yields one code. |
| `E100` | L1 | Required content field empty (`{section}.{field}`). |
| `E101` | L1 | Required media asset missing (`{section}.{field}`). |
| `E102` | L1 | Text-consistency violation in Multi-Card Grid (doc 37 §6.2). |
| `E103` | L1 | Prices section has zero rows (doc 31 §5.1). |
| `E104` | L1 | Trust section has every sub-module disabled (doc 32 §5.3). |
| `E200` | L2 | Field format invalid (`{field}`). |
| `E201` | L2 | Slug already in use. |

---

## 5. GLOBAL CONSTANTS

| Constant | Value | Notes |
| :--- | :--- | :--- |
| Lead modal anchor | `#lead-modal` | The **only** valid magic CTA href. The earlier `#quote-modal` spelling is retired; it never matched the implementation and any CTA using it navigates nowhere. |
| Mobile breakpoint | `< 768px` | |
| Desktop breakpoint | `>= 1024px` | `768–1023px` is the tablet band. |
| Default ink | `rgba(0, 0, 0, 0.88)` | |

---

## 6. MEDIA FIELD CONTRACT (APPLIES TO EVERY `File` ATTRIBUTE IN EVERY DOCUMENT)

Every image attribute `X` implicitly carries a sibling `X_alt: String`.

* **Content images** (hero background, card images, banner, quick-facts gallery): `X_alt`
  is an **L1** requirement — publishing without it fails with `E100`.
* **Decorative / brand assets** (logo marquee items, airline logos, accreditation seals):
  `X_alt` is optional; when empty the renderer must emit `alt=""` (explicitly empty, never
  omitted) so screen readers skip it.
* Aspect ratios quoted in object documents are **container** ratios enforced via
  `object-fit: cover` (photos) or `contain` (logos/icons). They are not upload constraints.

---

## 7. STATUS LEGEND FOR OBJECT DOCUMENTS

These documents are the specification. They describe the target system and are read
independently of any current implementation; where the two differ, the gap is recorded once in
`BACKLOG.md`, never inside an object document.

| Status | Meaning |
| :--- | :--- |
| `APPROVED` | Internally consistent, no open questions. Build to it. |
| `DRAFT` | Open questions remain inside the document; read the §they are flagged in before building. |
