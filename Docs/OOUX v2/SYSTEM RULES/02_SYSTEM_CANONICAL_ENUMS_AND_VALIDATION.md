# `02_SYSTEM_CANONICAL_ENUMS_AND_VALIDATION.md`

```yaml
METACLASS: SYSTEM_SPECIFICATION (NOT AN OBJECT)
DOCUMENT_ID: SYS-02-ENUMS
VERSION: 2.0.0
STATUS: APPROVED
SCOPE: CANONICAL_REGISTRIES_AND_VALIDATION_CONTRACT
IMPLEMENTED_BY: src/model/enums.js, src/model/validate.js, src/sections/_registry.js, src/sections/_common.js, src/render/html.js
TARGET_AUDIENCE: [LLM_AGENT, BACKEND_DEV, FRONTEND_DEV, ARCHITECT]
```

> **This document is the single source of truth for every shared enum, key and constant.**
> Where any other document repeats one of these values, that copy is illustrative. On
> conflict, this file wins — and where this file and `src/model/enums.js` differ, the code
> wins and the row is marked `DEFECT`.
>
> Every table row and every business rule carries a `BUILT` / `PLANNED` / `DEFECT` marker.
> The legend is in `../README.md`.

---

## 1. COMPONENT KEY REGISTRY

All keys use the uniform `SECTION_` prefix. No other prefix is valid. The authority is
`COMPONENT_KEYS` in `src/model/enums.js`; there are **thirteen** keys.

| `component_key` | Object doc | Archetype | Permitted slots | Multiplicity | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `SECTION_HERO` | `30` | `anchor` | `0` | Exactly 1 | `BUILT` |
| `SECTION_PRICES` | `31` | `anchor` | `2` | Exactly 1 | `BUILT` |
| `SECTION_TRUST` | `32` | `dual-anchor` | `4` | Exactly 1 | `BUILT` |
| `SECTION_FOOTER` | `33` | `dual-anchor` | `6` | Exactly 1 | `BUILT` |
| `SECTION_SUBSCRIPTION` | `34` | `static` | `1`,`3`,`5` | Max 1 | `BUILT` |
| `SECTION_CONTACT` | `35` | `static` | `1`,`3`,`5` | Max 1 | `BUILT` |
| `SECTION_QUICK_FACTS` | `36` | `dynamic` | `1`,`3`,`5` | `0..N` | `BUILT` |
| `SECTION_MULTI_CARD_GRID` | `37` | `dynamic` | `1`,`3`,`5` | `0..N` | `BUILT` |
| `SECTION_LARGE_IMAGE_BANNER` | `38` | `dynamic` | `1`,`3`,`5` | `0..N` | `BUILT` |
| `SECTION_TEXT_MEDIA` | `39` | `dynamic` | `1`,`3`,`5` | `0..N` | `BUILT` |
| `SECTION_LOGO_MARQUEE` | `40` | `dynamic` | `1`,`3`,`5` | `0..N` | `BUILT` |
| `SECTION_FEATURE` | `41` | `dynamic` | `1`,`3`,`5` | `0..N` | `BUILT` |
| `SECTION_FAQ` | `42` | `dynamic` | `1`,`3`,`5` | `0..N` | `BUILT` |

`SECTION_FAQ` is the thirteenth row and is new in v2. It has existed in `COMPONENT_KEYS`, in
`src/sections/faq.js` and in the registry all along; v1 documented twelve keys and had no
document for it. Its spec is `42_OBJECT_SECTION_FAQ.md`. Its own module still carries
`doc: 0` — the "no document" marker — which is now wrong. — `DEFECT`

### 1.1 The registry drift guard

`src/sections/_registry.js` throws at module load unless the set of registered section
modules is **exactly equal** to `COMPONENT_KEYS`: it reports keys missing from the registry,
keys registered but not canonical, and duplicate keys among the modules. — `BUILT`

The guard compares two files that are edited by the same hand. It does not read this
document, so a key added to both `enums.js` and the registry and omitted here passes
silently. That is exactly how `SECTION_FAQ` lived in the system without a spec. A test that
reads this table is a `ROADMAP.md` item. — `PLANNED`

---

## 2. REGION ENUM (SINGLE SHARED TAXONOMY)

`REGIONS` in `src/model/enums.js`. Used by `PageDoc.route.target_region` (doc 20, offered as
a select in `src/ui/pages.js`) **and** by `PriceRowItem.region` (doc 50,
`src/sections/prices.js`). Neither defines its own list. — `BUILT`

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

| Rule | Status |
| :--- | :--- |
| `'Global'` is a routing fallback, not a geography. The published runtime's region filter keeps a row visible under every tab: `row.hidden = !(want === 'all' \|\| r === want \|\| r === 'Global')` (`RUNTIME_JS`). | `BUILT` |
| The list is closed for the two UI controls, which are both `<select>`s built from `REGIONS`. It is **not** enforced on stored data: no validator rejects a region outside the list, and import writes `route.target_region` through verbatim. | `PLANNED` |
| A new page defaults to `target_region: 'Global'` (`newPageDoc`). | `BUILT` |

---

## 3. SLOT & ORDER MODEL

A section's position is two integers. A single flat page-wide `order_index` does not exist
anywhere in `src/`.

| Field | Type | Description | Status |
| :--- | :--- | :--- | :--- |
| `slot_index` | `Integer` | The container: `0`,`2`,`4`,`6` for anchors (immutable), `1`,`3`,`5` for dynamic containers (mutable for `static` and `dynamic` modules). | `BUILT` |
| `order_in_slot` | `Integer` | Zero-based order **within that slot only**. Anchors are always `0`. Re-densified to `0..n-1` by `repack()` after every mutation. | `BUILT` |

**Render order:** `inRenderOrder()` sorts by `slot_index`, then `order_in_slot`. — `BUILT`
**Anchor invariant:** an anchor's `slot_index` is a constant from `ANCHOR_SLOT`, so
`Hero(0) < Prices(2) < Trust(4) < Footer(6)` holds structurally. — `BUILT`

The full mutation contract — append, insert-after, move up/down, move-to, remove, and the
half-step sentinels `repack()` resolves — is `SYS-00 §3`.

---

## 4. VALIDATION LEVELS

Every rule in every object document belongs to exactly one level.

| Level | When enforced | Blocks | Implementation | Status |
| :--- | :--- | :--- | :--- | :--- |
| **L0 — Structural** | On every document change, debounced 250 ms (`runValidation`, `src/main.js`) | Nothing. It is advisory: it lights the Issues dot and fills the Issues panel. | `validateStructure()`, `src/model/validate.js` | `BUILT` |
| **L1 — Content completeness** | Same pass | Nothing, for the same reason. | `validateContent()` → each section type's own `validate(props, ctx)` | `BUILT` |
| **L2 — Field format** | Nowhere | Nothing | No implementation exists. `setSectionProp()` (`src/store/pages.js`) writes any value to any path unconditionally: it resolves the dot path, assigns, stamps `updated_at` and commits. No field descriptor declares a format, no regex is applied, no save is refused. | `PLANNED` |

### 4.1 Consequences that are real today

| Rule | Status |
| :--- | :--- |
| A Draft is always savable with empty mandatory fields. `commit()` persists first; validation is a separate observer. | `BUILT` |
| `Published` requires L0 + L1 + L2 to pass. `canPublish()` implements exactly that (`{ ok: issues.length === 0, blocking: issues }`) and is called from `test/validate.test.js` and nowhere else. There is no publish action in the product. | `PLANNED` |
| **Hidden sections skip every level, not just L1.** `validateContent()` tests `if (!s.is_visible) continue;` before calling the section's validator, so an invisible section contributes no L1 and no L2 issues. It still contributes L0 issues, because `validateStructure()` never looks at `is_visible`. v1 §4 said L2 still applies to a hidden section; with no L2 implementation at all that statement was doubly wrong. | `BUILT` |
| Global-content sections are still validated when visible: their page-level switches are local even though their copy lives in the global store (Trust's `E104` is the case in point). | `BUILT` |
| Export is gated advisorily, not by level: `src/main.js` counts issues with `level !== 'L2'` and shows an "Export with open issues?" confirmation. It never refuses. | `BUILT` |

### 4.2 Error code registry

`ERR` in `src/model/enums.js`. `issue(code, extra)` in `src/model/validate.js` is the only
constructor that reads it; it falls back to level `L1` and the message `'Validation error.'`
for an unknown code. An `Issue` is `{ level, code, message, sectionId?, path? }`.

| Code | Level | Message in `ERR` | Emitted by | Status |
| :--- | :--- | :--- | :--- | :--- |
| `E001` | L0 | Missing mandatory Hero section. | `validateStructure`, via `MISSING_ANCHOR_CODE` | `BUILT` |
| `E002` | L0 | Missing mandatory Prices section. | same | `BUILT` |
| `E003` | L0 | Missing mandatory Trust section. | same | `BUILT` |
| `E004` | L0 | Missing mandatory Footer section. | same | `BUILT` |
| `E005` | L0 | Fixed anchor slot sequence violation. | `validateStructure`; one issue per offending section, with `sectionId` and an overridden message naming expected vs found slot | `BUILT` |
| `E006` | L0 | Duplicate Subscription section. | `validateStructure`, via `DUPLICATE_STATIC_CODE` | `BUILT` |
| `E007` | L0 | Duplicate Contact section. | same | `BUILT` |
| `E008` | L0 | Section assigned to a slot its archetype does not permit. | `validateStructure`, non-anchor sections only. Anchors are exempt: a misplaced anchor reports `E005` alone, so one mistake yields one code. | `BUILT` |
| `E008` (second meaning) | L0 | — overridden to `Unknown component key: {key}.` | `validateStructure`, `if (!type)` branch, when a section's key is absent from the registry. One code carries two unrelated meanings, which v1's registry did not document and no consumer can tell apart except by parsing the message string. | `BUILT` — the reuse itself is a modelling fault, listed below |
| `E100` | L1 | Required content field is empty. | `needText()` / `needRich()` (`_common.js`); also raised directly by `src/sections/faq.js` (empty `items`) and `src/sections/quick-facts.js` (per-card fields) | `BUILT` |
| `E101` | L1 | Required media asset is missing. | `needMedia()` (`_common.js`); also raised directly by `src/sections/logo-marquee.js` (zero logos) | `BUILT` |
| `E102` | L1 | Text-consistency violation in Multi-Card Grid. | `src/sections/multi-card-grid.js` | `BUILT` |
| `E103` | L1 | Prices section has no rows. | `src/sections/prices.js` | `BUILT` |
| `E104` | L1 | Trust section has every sub-module disabled. | `src/sections/trust.js` | `BUILT` |
| `E200` | L2 | Field format is invalid. | Nothing. The code is declared in `ERR` and no call site anywhere in `src/` constructs it. It is the whole of level L2. | `PLANNED` |
| `E201` | L2 | Slug is already in use. | Nothing goes through `issue()`. The page-settings dialog (`src/ui/pages.js`) calls `store.isSlugTaken()` and, on a clash, writes the **hardcoded string** `'E201: that slug is already in use by another page.'` into an error box and returns `false` to keep the modal open. The code in `ERR` is dead; the message shown is a literal that can drift from it, and the condition never reaches the Issues panel, the issue count or `canPublish()`. | `DEFECT` |

### 4.3 Registry-level faults

| Fault | Status |
| :--- | :--- |
| `E008` carries two unrelated meanings (illegal slot; unknown component key). They need separate codes, since a consumer cannot distinguish them without string-matching the message. | `DEFECT` |
| `E008` is documented in `SYS-00 §3.1` as the response to a rejected move. No mutator emits issues, and `moveTo()` refuses an illegal slot before it can be written, so that emission is unreachable. A rejected drag is silent. | `DEFECT` |
| No code exists for a duplicated **anchor**. `validateStructure()` iterates every match of an anchor key and only checks each one's slot, so two `SECTION_HERO` sections both in slot `0` produce no issue. Reachable through import. | `PLANNED` |
| Slug uniqueness has no L0/L1 representation at all; see `E201` above. | `DEFECT` |

---

## 5. GLOBAL CONSTANTS

| Constant | Declared value | Where it is actually read | Status |
| :--- | :--- | :--- | :--- |
| `LEAD_ANCHOR` | `'#lead-modal'` | **Nowhere.** The string is re-typed as a literal in at least four places: the modal's `id` in `src/render/page.js`, the click selector `a[href="#lead-modal"]` in `RUNTIME_JS`, the `ctaLink()` fallback href in `src/render/html.js`, and the default CTA href in `ctaFields()` (`src/sections/_common.js`). The constant exists and governs nothing. | `DEFECT` |
| `BREAKPOINT` | `{ MOBILE_MAX: 767, TABLET_MIN: 768, DESKTOP_MIN: 1024 }` | **Nowhere.** Every responsive rule in `src/` is written as a literal `@media (max-width:767px)`. The `768–1023px` tablet band and the `1024px` desktop minimum are not expressed in any stylesheet; the CSS is a single two-state breakpoint. | `DEFECT` |
| `INK` | `'#000000E0'` (88% black, 8-digit hex) | `INK_PRESETS`, consumed by `src/sections/hero.js`. Declared a second time, independently, as `--ink: rgba(0,0,0,.88)` in `TOKENS_CSS`. The hex form is canonical; see `SYS-01 §2.2`. | `BUILT` (the duplicate declaration is the `DEFECT`) |
| `BG_LIGHT_GREY` | `'#0000000A'` | `BG_PRESETS`, and as `SECTION_LOGO_MARQUEE`'s default background. Declared a second time as `--bg-light-grey: rgba(0,0,0,.04)`. Hex is canonical. | `BUILT` (duplicate declaration is the `DEFECT`) |
| `BG_LIGHT_BRONZE` | `'#F7F2EE'` | `BG_PRESETS`; also declared as `--bg-light-bronze`. | `BUILT` |
| `BRONZE` | `'#B8876E'` | `ACCENT_PRESETS`, `INK_PRESETS`, `src/sections/hero.js`; also `--bronze`. | `BUILT` |
| `BG_PRESETS` | three `{ value, label, token }` records | `appearanceGroup()` in `src/sections/_common.js` — every dynamic section's background picker | `BUILT` |
| `ACCENT_PRESETS` / `INK_PRESETS` / `SCRIM_PRESETS` | see `SYS-01 §2.3` | `src/sections/hero.js` | `BUILT` |
| `CABIN_CLASSES` | `['Business','First','Premium Economy']` | `src/sections/prices.js` (the row cabin select), `src/sections/hero.js` (the first value labels a decorative pill) | `BUILT` |
| `PAGE_TYPES` | `['RoutePage','CampaignPage','HomePage']` | `src/ui/pages.js` page-settings select | `BUILT` |
| `REGIONS` | see §2 | `src/ui/pages.js`, `src/sections/prices.js` | `BUILT` |
| `ARCHETYPE` | four string values | Every section module, plus `src/ui/library.js` | `BUILT` |
| `GLOBAL_CONTENT_ARCHETYPES` | `['dual-anchor','static']` | `src/ui/inspector.js` | `BUILT` |
| `LEVEL` | `{ L0, L1, L2 }` | `src/model/validate.js` and six section validators | `BUILT` |
| `permittedSlots()` | derived from archetype | `src/model/validate.js` | `BUILT` |
| `maxInstances(archetype)` | `Infinity` for `dynamic`, else `1` | **Nowhere.** Multiplicity is enforced instead by `E006`/`E007` in `validateStructure()` and by the disabled library card in `src/ui/library.js`, neither of which calls this function. Dead declaration. | `DEFECT` |
| `PAGE_STATUSES` | `['Draft','Published','Archived']` | **Nowhere.** The same three values are re-typed as a union in the `PageDoc` typedef (`src/model/types.js`), and only `'Draft'` is ever assigned. | `DEFECT` |
| `HEADING_SIZES` | `['SIZE_S','SIZE_M','SIZE_L']` | **Nowhere** — it appears only inside a comment in `src/sections/_common.js`. The live list is `SIZE_OPTS` in that file, which re-types the three values with their labels. | `DEFECT` |
| `HEADING_ALIGNS` | `['ALIGN_LEFT','ALIGN_CENTER']` | **Nowhere.** The live list is `ALIGN_OPTS` in `src/sections/_common.js`, and `ALIGN_CLASS` in `src/render/html.js` re-types them a third time. | `DEFECT` |

---

## 6. MEDIA FIELD CONTRACT

Applies to every media attribute in every document. A media value is
`{ asset?: string, url?: string, alt?: string }` (`MediaValue`, `src/render/html.js`).

| Rule | Status |
| :--- | :--- |
| Every image attribute `X` carries a sibling `X_alt`, edited in the same widget as the asset (`imgField()`, `src/sections/_common.js`). It is stored as `alt` inside the media value, not as a separate `X_alt` key. | `BUILT` |
| **Alt text is not an L1 publish blocker for any image, content or decorative.** `needMedia()` returns an issue only when both `asset` and `url` are absent: `(!v?.asset && !v?.url)`. It never inspects `alt`. This is a deliberate decision — the previous behaviour blocked publishing a whole page over a caption nobody had written yet — and it supersedes v1 §6, which made `X_alt` an `E100` requirement for content images. | `BUILT` |
| **The accessibility cost is real and unmitigated.** An image saved without alt text reaches a screen reader as nothing at all, and no validation level, no warning and no Issues row reports it. The only mitigation in place is that the editor pre-fills a guess from the uploaded filename, so the usual path leaves `alt` populated — a default, not a guarantee, and an author who clears it gets no signal. A non-blocking L1 *warning* severity does not exist in the model. | `PLANNED` |
| `decorative: true` on a field descriptor hides the alt input entirely. It is now a UI concern only and has no validation meaning. | `BUILT` |
| `img()` always emits an `alt` attribute — `alt=""` for a decorative asset or an empty value, never omitted — which is what a screen reader needs in order to skip the image. | `BUILT` |
| A media field with neither `asset` nor `url` renders a labelled striped placeholder (`.ph`) rather than a broken image. | `BUILT` |
| Aspect ratios quoted in object documents are **container** ratios applied with `object-fit`, not upload constraints. The `ratio` option on `imgField()` is passed to the widget as a crop hint. | `BUILT` |

---

## 7. STATUS LEGEND FOR v2 DOCUMENTS

Two orthogonal axes. The **document** status sits in the YAML header; the **implementation**
marker sits in every table row and after every business rule.

| Document status | Meaning |
| :--- | :--- |
| `APPROVED` | Internally consistent, no open questions. Unbuilt behaviour is not an open question — it is a `PLANNED` marker. |
| `DRAFT` | Open questions remain inside the document; they are flagged in the text. |

| Implementation marker | Meaning |
| :--- | :--- |
| `BUILT` | Implemented and working. Verified against `src/`. This is the contract. |
| `PLANNED` | Described, deliberately not implemented. Belongs in `ROADMAP.md`. Must not be cited as existing behaviour. |
| `DEFECT` | Implemented but not working: a field collected and never read, a rule described that never fires, a constant declared that nothing imports. Belongs in `DEFECTS.md`. |

There is no "partially". An attribute that is read but not fully read is `DEFECT`, with the
limit described in the note beside it. The v1 arrangement — a single `BACKLOG.md` holding
every divergence, far from the rule it contradicted — is what let the specification drift
from the code unnoticed.
