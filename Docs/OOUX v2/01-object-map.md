# Object Map

```yaml
METACLASS: DERIVED_OVERVIEW (NOT AN OBJECT)
DOCUMENT_ID: MAP-01-OBJECT-MAP
VERSION: 2.0.0
STATUS: APPROVED
DEPENDS_ON: SYS-00-ARCH, SYS-02-ENUMS
TARGET_AUDIENCE: [LLM_AGENT, BACKEND_DEV, FRONTEND_DEV, ARCHITECT]
```

A derived document. The canonical topology is `SYSTEM RULES/00_SYSTEM_ARCHITECTURE_AND_SLOTS.md`;
the canonical key list is `SYS-02 §1`. This is a map only — it carries no rules of its own.

---

## 1. Tree

```
[Landing Page Container]  (20_OBJECT_LANDING_PAGE)          localStorage `lpb.state.v2`
   │
   ├── [Slot 00: FIXED ANCHOR] ──> [Hero]                   page-specific, exactly 1
   │
   ├── [Slot 01: DYNAMIC CONTAINER] ──> [0..N dynamic / static modules]
   │
   ├── [Slot 02: FIXED ANCHOR] ──> [Prices] ── 1:N ──> [Price Row Item] (50)
   │
   ├── [Slot 03: DYNAMIC CONTAINER] ──> [0..N dynamic / static modules]
   │
   ├── [Slot 04: DUAL-ROLE ANCHOR] ──> [Trust]              global data, page-level layout
   │
   ├── [Slot 05: DYNAMIC CONTAINER] ──> [0..N dynamic / static modules]
   │
   └── [Slot 06: DUAL-ROLE ANCHOR] ──> [Footer]             global data, read-only on the page

Contents of any dynamic container (01 / 03 / 05):
   ├── [Story & Specs]          0..N   ── 2..4 facts + 3 images                (36)
   ├── [Multi-Card Grid]        0..N   ── 1:N ──> [Media Card Item] (2|3|4)    (37, 51)
   ├── [Large Image Banner]     0..N   ── one image + a mandatory CTA          (38)
   ├── [Text & Media]           0..N   ── media_mode: 0 | 1 | 2 photos         (39)
   ├── [Logo Marquee]           0..N   ── 1:N ──> [Logo Item]                  (40)
   ├── [Feature]                0..N   ── 1:N ──> [Feature Item] (3|4)         (41, 52)
   ├── [FAQ]                    0..N   ── 1:N ──> [FAQ Item] (1..20)           (42) ★
   ├── [Static Subscription]    max 1 per page      (global content)           (34)
   └── [Static Contact]         max 1 per page      (global content)           (35)

Outside the section tree:
   └── [Flight Quote Modal] (21) — one overlay per rendered document (both in the
                                    preview and in the export), DOM id `lead-modal`;
                                    opened by a price row or any CTA with href `#lead-modal`

Outside the page:
   └── [Global Content Store] — localStorage `lpb.globals.v2`: footer, contact, trust,
                                subscription. The page reads it; the page editor does not
                                write to it.
```

★ — `FAQ` existed in the code and in none of the v1 documents.

---

## 2. Composition

| Object | `component_key` | Slots | Multiplicity per page | Status |
|---|---|---|---|---|
| Hero (30) | `SECTION_HERO` | `00` | exactly 1 | `BUILT` |
| Prices (31) | `SECTION_PRICES` | `02` | exactly 1 | `BUILT` |
| Trust (32) | `SECTION_TRUST` | `04` | exactly 1 | `BUILT` |
| Footer (33) | `SECTION_FOOTER` | `06` | exactly 1 | `BUILT` |
| Subscription (34) | `SECTION_SUBSCRIPTION` | `01`,`03`,`05` | max 1 | `BUILT` |
| Contact Us (35) | `SECTION_CONTACT` | `01`,`03`,`05` | max 1 | `BUILT` |
| Story & Specs (36) | `SECTION_QUICK_FACTS` | `01`,`03`,`05` | 0..N | `BUILT` |
| Multi-Card Grid (37) | `SECTION_MULTI_CARD_GRID` | `01`,`03`,`05` | 0..N | `BUILT` |
| Large Image Banner (38) | `SECTION_LARGE_IMAGE_BANNER` | `01`,`03`,`05` | 0..N | `BUILT` |
| Text & Media (39) | `SECTION_TEXT_MEDIA` | `01`,`03`,`05` | 0..N | `BUILT` |
| Logo Marquee (40) | `SECTION_LOGO_MARQUEE` | `01`,`03`,`05` | 0..N | `BUILT` |
| Feature (41) | `SECTION_FEATURE` | `01`,`03`,`05` | 0..N | `BUILT` |
| FAQ (42) | `SECTION_FAQ` | `01`,`03`,`05` | 0..N | `BUILT` |
| Flight Quote Modal (21) | — (not a section) | outside the tree | exactly 1 per document | `BUILT` |

> **A display name is not a key.** In the editor, section 36 is called **Story & Specs**; its
> key `SECTION_QUICK_FACTS` is unchanged — renaming a key touches the canonical registry, the
> spec's filename and every page already saved. The rule is general: names in this table come
> from a module's `name` field, keys from `COMPONENT_KEYS`, and the two need not match.

---

## 3. Relationships

| Relationship | Mechanism | Status |
|---|---|---|
| Page 1:N Section | the `PageDoc.sections` array; order is `slot_index`, then `order_in_slot` | `BUILT` |
| Section N:1 Page | a section does not exist outside a page; there is no separate store | `BUILT` |
| Prices 1:N Price Row Item | `props.rows[]` | `BUILT` |
| Multi-Card Grid 1:N Media Card Item | `props.cards[]`; `card_count` are active, the rest are retained | `BUILT` |
| Feature 1:N Feature Item | `props.items[]`; `item_count` are active, the rest are retained | `BUILT` |
| Logo Marquee 1:N Logo Item | `props.logos[]` | `BUILT` |
| FAQ 1:N FAQ Item | `props.items[]`, up to 20 | `BUILT` |
| Price Row → Modal | `<button data-row-quote data-destination data-cabin>` | `BUILT` |
| CTA → Modal | delegated click on `a[href="#lead-modal"], [data-lead-open]` | `BUILT` |
| Page → Modal (route defaults) | the modal does not read the page's `default_origin` / `default_destination` | `DEFECT` |
| Trust / Footer / Subscription / Contact → Global Store | `GLOBAL_CONTENT_ARCHETYPES`, `ctx.globals` | `BUILT` |
| Modal → CRM | no request is sent and no payload is assembled | `PLANNED` |

---

**A section's position** is `slot_index` + `order_in_slot` (`SYS-02 §3`). Each anchor owns a slot
of its own, so the order `Hero(0) < Prices(2) < Trust(4) < Footer(6)` is guaranteed structurally
rather than arithmetically. An anchor's mandatoriness and immobility are **derived** from
`ANCHOR_SLOT` and `archetype` — there are no `position_type` or `is_mandatory` fields on the
document (`10_ABSTRACT §4.3`).
