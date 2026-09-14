# OOUX model of the landing-page builder — version 2

## What changed against v1

v1 described the **target** system and deliberately avoided referring to the code: the
reconciliation lived in one place, `BACKLOG.md`. The idea was right, but over a few revisions
that table fell behind reality — it cited files that no longer exist and listed as unbuilt
things that already worked. The documentation looked authoritative and was not.

**v2 describes the system as it is.** Every attribute and every rule carries an implementation
marker. A spec can no longer drift quietly: a divergence is now either a `PLANNED` marker or a
`DEFECT` marker, and both are visible in the table itself.

v1 remains alongside, in `Docs/OOUX/`, as a historical snapshot. It is not maintained.

---

## Implementation markers

The fifth column of every attribute table, and a suffix on every business rule.

| Marker | Meaning | What to do about it |
|---|---|---|
| `BUILT` | Implemented and working. Verified against `src/`. | Nothing. This is the contract. |
| `PLANNED` | Described, deliberately not implemented. | An entry in `ROADMAP.md`. It may not be referenced as existing behaviour. |
| `DEFECT` | Implemented but not working: a field is collected and never read, a rule is described and never fires. | An entry in `DEFECTS.md` with a finding id. This is a bug, not a divergence. |

**The marking rule:** there is no "partial" marker. If an attribute is read but not fully, it is
`DEFECT`, and the limitation is described in a note. The compromise between "works" and "does not
work" is what let v1 drift from the code in the first place.

---

## How to read these documents

1. **A spec describes what the code does.** If you find a divergence, it is a bug in the
   documentation or a bug in the code — never "by design".
2. **`SYSTEM RULES/02_SYSTEM_CANONICAL_ENUMS_AND_VALIDATION.md` is the source of truth** for
   `component_key`, regions, the slot model, validation levels and global constants. If another
   file repeats one of those values, that is a copy; SYS-02 wins.
3. Then general to particular: system rules → abstract classes → root objects → sections →
   child objects.
4. `01` and `02` at the root are **derived** overviews. They carry no rules, only navigation.
5. Section documents contain **only what is theirs**. The shared lifecycle and the shared styling
   attributes are described once, in base classes `10` and `11`, and are never copied out of them.
6. Why something is the way it is, and what it used to be, is in `CHANGELOG.md`. The specs carry
   no history.

---

## Document statuses

| Status | Meaning |
|---|---|
| `APPROVED` | Self-consistent, no open questions |
| `DRAFT` | Open questions remain inside, marked in the text |

---

## Three registers, each with one job

| File | What it holds | What it does not |
|---|---|---|
| `ROADMAP.md` | Everything marked `PLANNED`, plus objects deliberately left unmodelled | Bugs |
| `DEFECTS.md` | Everything marked `DEFECT`: the code exists, the behaviour does not | Plans |
| `CHANGELOG.md` | The history of decisions and the reasoning behind model changes | The current state |

There is no longer a summary "divergences from the implementation" table. Its job is done by the
markers inside the specs — at the point where a divergence arises, rather than in a separate file
that nobody remembers to update.

---

## Structure

```
├── README.md                                   # this file
├── CHANGELOG.md                                # decision history and the reasoning behind changes
├── ROADMAP.md                                  # PLANNED + unmodelled objects
├── DEFECTS.md                                  # DEFECT: described, implemented, not working
├── 01-object-map.md                            # object map (derived)
├── 02-system-taxonomy.md                       # sections + variant parameters (derived)
│
├── [ SYSTEM RULES (NOT OBJECTS) ]
│   ├── 00_SYSTEM_ARCHITECTURE_AND_SLOTS.md     # topology, slot_index + order_in_slot, L0
│   ├── 01_SYSTEM_GLOBAL_DESIGN_TOKENS.md       # backgrounds, type scale (S/M/L), CSS variable names
│   ├── 02_SYSTEM_CANONICAL_ENUMS_AND_VALIDATION.md  # ★ registries, validation levels, error codes
│   └── 99_SYSTEM_LEAD_GENERATION_WORKFLOW.md   # lead triggers, CRM payload, attribution
│
├── [ ABSTRACT CLASSES ]
│   ├── 10_ABSTRACT_OBJECT_PAGE_SECTION.md      # base section: slot, order, anchor_id, alt
│   └── 11_ABSTRACT_OBJECT_DYNAMIC_SECTION.md   # dynamic base: background, header, button
│
├── [ ROOT OBJECTS ]
│   ├── 20_OBJECT_LANDING_PAGE.md               # page: SEO, GEO, URL, status, slots
│   └── 21_OBJECT_FLIGHT_QUOTE_MODAL.md         # ★ lead-form modal (field contract + payload)
│
├── [ SECTION OBJECTS ]
│   ├── 30_OBJECT_SECTION_HERO.md               # Hero (slot 00)
│   ├── 31_OBJECT_SECTION_PRICES.md             # Prices (slot 02)
│   ├── 32_OBJECT_SECTION_TRUST.md              # Trust (slot 04, dual-role)
│   ├── 33_OBJECT_SECTION_FOOTER.md             # Footer (slot 06, dual-role)
│   ├── 34_OBJECT_SECTION_STATIC_SUBSCRIPTION.md# Subscription (static module, max 1)
│   ├── 35_OBJECT_SECTION_STATIC_CONTACT.md     # Contact Us (static module, max 1)
│   ├── 36_OBJECT_SECTION_QUICK_FACTS.md        # Story & Specs (2–4 facts, 3 photos)
│   ├── 37_OBJECT_SECTION_MULTI_CARD_GRID.md    # Multi-Card Grid (2/3/4)
│   ├── 38_OBJECT_SECTION_LARGE_IMAGE_BANNER.md # Large Image Banner
│   ├── 39_OBJECT_SECTION_TEXT_MEDIA.md         # Text & Media (0/1/2 photos)
│   ├── 40_OBJECT_SECTION_LOGO_MARQUEE.md       # Logo Marquee
│   ├── 41_OBJECT_SECTION_FEATURE.md            # Feature (presets S/M/L)
│   └── 42_OBJECT_SECTION_FAQ.md                # ★ FAQ (added in v2)
│
└── [ CHILD OBJECTS ]
    ├── 50_OBJECT_PRICE_ROW_ITEM.md             # price-table row (for 31)
    ├── 51_OBJECT_MEDIA_CARD_ITEM.md            # grid card (for 37)
    └── 52_OBJECT_FEATURE_ITEM.md               # feature item (for 41)
```

★ — `42` describes a section that existed in the code and in no v1 document. Closing that gap is
precisely what v2 is for.

---

## What this model still does not protect against

The registry guard in `src/sections/_registry.js` compares the list of modules against
`COMPONENT_KEYS` in `enums.js` — two files edited by the same hand. It does not read the spec. A
key added to the code and not added here is a key it will not catch; that is exactly how
`SECTION_FAQ` lived in the system without a document. A test that reads the key table out of
`SYS-02 §1` is an entry in `ROADMAP.md`.
