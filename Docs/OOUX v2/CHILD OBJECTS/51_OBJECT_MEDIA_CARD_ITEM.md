# `51_OBJECT_MEDIA_CARD_ITEM.md`

```yaml
METACLASS: CONCRETE_OBJECT
OBJECT_ID: OBJ-51-MEDIA-CARD-ITEM
VERSION: 2.0.0
STATUS: APPROVED
DEPENDS_ON: SYS-02-ENUMS
INHERITANCE: CHILD_EMBEDDED_ENTITY
PARENT_ENTITY: OBJ-37-MULTI-CARD-GRID
SOURCE_OF_TRUTH: src/sections/multi-card-grid.js
TARGET_AUDIENCE: [LLM_AGENT, BACKEND_DEV, FRONTEND_DEV, UI_DESIGNER]
```

---

## 1. OBJECT DEFINITION

An individual card inside a `37_OBJECT_SECTION_MULTI_CARD_GRID`: one mandatory image with
optional headline and copy. Its text is not valid or invalid on its own — validity is a
property of the whole row of siblings, enforced by the parent (§6.2).

Cards live in the parent's `cards` array as plain records. There is no card entity in
storage, no identifier, and no way to address one except by its position.

---

## 2. RELATIONSHIPS (OOUX ORCA MAPPING)

- **Belongs To (N:1):** `37_OBJECT_SECTION_MULTI_CARD_GRID`. Cannot exist outside its parent.
- **Sibling Co-dependency:** bound to the other **active** cards of the same grid by the
  all-or-nothing text invariant (§6.2).
- **Cardinality:** the parent holds up to 4 at all times; `card_count` (2 / 3 / 4) decides
  how many are active.

---

## 3. OBJECT LIFECYCLE & ADMIN CTAs

| Action (CTA) | Admin UI Location | System Behavior | Status |
| :--- | :--- | :--- | :--- |
| **Instantiate** | Parent's **How many** control | Cards are mounted by index as `card_count` rises. The repeater is `fixed: 'card_count'`, so it offers **no per-row Add, Duplicate or Delete** — the count control owns how many cards exist. | `BUILT` |
| **Upload Image** | Card row, **Image** field | Uploads or replaces the asset. Alt text is edited in the same control. | `BUILT` |
| **Edit Copy** | Card row, **Title** / **Text** | `title` is plain text, `paragraph` is `RT_BASIC`. | `BUILT` |
| **Reorder** | Card row, ▲ / ▼ | Move up / move down buttons swap this card with a neighbour. There is no drag handle. | `BUILT` |
| **Deactivate** | Parent's **How many** control | Lowering the count deactivates trailing cards: omitted from the DOM, skipped by validation, **kept in the persisted document**. The panel says so out loud — *"N more items kept for the larger layout."* | `BUILT` |
| **Delete permanently** | — | No control deletes a single card outright. | `BUILT` |

---

## 4. ATTRIBUTES MATRIX

| Attribute Name | Data Type | Required | Default Value | Status | Description & Constraints |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `card_id` | `UUIDv4` | — | — | `PLANNED` | **Does not exist.** Identity is the array index: the renderer maps over `cards`, validation writes `cards.0.image`, `cards.1.image`, …, and the editor keys its rows by position too. The consequence is real — reordering cards re-addresses every error and every open-row state after the moved one, and nothing outside the array can hold a stable reference to a card. v1 specified an auto-generated id; none is generated. |
| `image` | `Media` | **Yes** | `null` | `BUILT` | `E101` when neither `asset` nor `url` is present, reported on `cards.N.image`. Rendered `width:100%`, `aspect-ratio:4/3`, `object-fit:cover`, `14px` radius. |
| `image.alt` | `String` | No | Filename guess | `BUILT` | Edited inside the image control. **No longer blocks publishing** — see §6.1. Always emitted, empty when unset, because `alt=""` is what lets a screen reader skip an image rather than read a URL. |
| `title` | `String` | No | `null` / `""` | `BUILT` | Optional headline, `18px` at `--title-weight`, 14px under the image. Subject to §6.2. Suppressed from the DOM when blank. |
| `paragraph` | `RichText` | No | `null` / `""` | `BUILT` | Optional copy, `RT_BASIC` (bold, italic, strike, colour — no lists, no links), `15px` soft ink. Subject to §6.2. Suppressed when blank, measured with tags stripped so an empty `<p></p>` counts as blank. |

---

## 5. DEFAULT SEED PAYLOAD (FROM THE PARENT)

Cards are seeded by the parent's `defaults.cards` (doc 37 §5) — this object has no preset of
its own. Four records ship; the fourth is deliberately empty and inactive at the default
count of `3`.

```yaml
seeded_cards:
  - image: null
    title: "Michelin-inspired dining"
    paragraph: "<p>Multi-course à la carte menus paired with sommelier-selected champagnes.</p>"
  - image: null
    title: "Turn-down service"
    paragraph: "<p>Full lie-flat suites fitted with Italian cotton linens.</p>"
  - image: null
    title: "Chauffeur & lounge access"
    paragraph: "<p>Private terminal escorts and lounge sanctuary access worldwide.</p>"
  - image: null            # inactive at card_count 3
    title: ""
    paragraph: ""
```

Every seeded card ships with `image: null`, so a freshly inserted grid is **not**
publishable: each active card raises `E101` until an asset is uploaded.

---

## 6. BUSINESS RULES & SYSTEM GUARDS (IF -> THEN)

1. **Mandatory Visual Asset Guard (L1, `E101`) — `BUILT`**
   - **IF** this card is **active** and has no image asset:
     - **THEN** the parent blocks publishing: *"Card N image is required."*
   - Inactive cards are retained and never validated.
   - **Alt text is not part of the guard.** v1 made a missing `image_alt` an L1 error; the
     rule was removed system-wide in `_common.needMedia`, deliberately, because it blocked
     publishing a whole page over a caption nobody had written yet. The cost is stated
     plainly there: an image with no alt reaches a screen reader as nothing. The filename
     guess is what keeps the usual path from producing one.

2. **Parent-Enforced All-or-Nothing Sibling Text Invariant (L1, `E102`) — `BUILT`**
   - **IF** this card has a non-empty `title` **or** `paragraph`:
     - **THEN** every other **active** card must have **both** filled.
   - **IF** any active card is short of either:
     - **THEN** the parent raises one `E102` on `cards` — *"Text consistency violation:
       either every card has a title and a paragraph, or all cards are image-only."*
   - The error belongs to the grid, not to this card: it is reported on the array, and it is
     resolved either by writing the missing copy, by clearing all of it, or by lowering
     `card_count` past the offending card.

3. **Retention Across Count Changes — `BUILT`**
   - Deactivation never writes to the card. `activeCards()` slices the array for rendering
     and validation; the stored records are untouched, survive reload and re-publish, and
     return in full when the count goes back up.

4. **Responsive Geometry — `BUILT`**
   - The card has no dimensions of its own: it fills whichever column the parent's grid
     gives it (2/3/4 columns on desktop, 2 at tablet, 1 on mobile — doc 37 §6.5).
   - Its image is what holds the shape: a fixed `4/3` box cropped with `object-fit:cover`,
     so sibling cards stay vertically aligned no matter what aspect ratios were uploaded.
     The empty-state placeholder occupies the same `4/3` box, so a card without an upload
     reserves exactly the space its image will take.
   - The card's text is `text-align:left` regardless of the section's `heading_align`.
