# `37_OBJECT_SECTION_MULTI_CARD_GRID.md`

```yaml
METACLASS: CONCRETE_OBJECT
OBJECT_ID: OBJ-37-MULTI-CARD-GRID
VERSION: 2.0.0
STATUS: APPROVED
DEPENDS_ON: SYS-02-ENUMS
INHERITS_FROM: OBJ-11-DYNAMIC-SECTION-BASE
STRUCTURAL_ROLE: DYNAMIC_CONTENT_MODULE
SOURCE_OF_TRUTH: src/sections/multi-card-grid.js
TARGET_AUDIENCE: [LLM_AGENT, BACKEND_DEV, FRONTEND_DEV, UI_DESIGNER]
```

---

## 1. OBJECT DEFINITION

A modular showcase grid of **2, 3 or 4 media cards** — cabin features, partner highlights,
travel perks. It runs either as a pure image gallery or as fully written content cards, and
an all-or-nothing consistency invariant (§6.2) is what keeps it from becoming a half-written
mixture of the two. An optional footnote closes the block.

---

## 2. RELATIONSHIPS (OOUX ORCA MAPPING)

- **Inherits From (Parent):** `11_ABSTRACT_OBJECT_DYNAMIC_SECTION` (inherits `section_id`,
  `slot_index`, `order_in_slot`, `anchor_id`, `position_type: 'Custom'`,
  `is_mandatory: false`, `is_visible: true`, styling tokens).
- **Belongs To (N:1):** `OBJECT_LANDING_PAGE`.
- **Multiplicity / Instance Limit:** **Unbounded (0..N)** — `archetype: DYNAMIC`.
- **Permitted Slots:** Dynamic slots `01`, `03`, `05`.
- **Library Group:** `content` ("Content sections").
- **Contains (2..4 Embedded Items):** `51_OBJECT_MEDIA_CARD_ITEM`.

---

## 3. OBJECT LIFECYCLE & ADMIN CTAs

Standard dynamic-section lifecycle — `11_ABSTRACT §3` (Insert, Edit, Duplicate, Reorder,
Delete, Toggle Visibility). Insert auto-populates the preset payload in §5.

| Section-specific CTA | System Behavior |
| :--- | :--- |
| **How many (2 / 3 / 4)** | Sets `card_count`. Activates the leading N cards; the rest stay in the document (§6.3). |
| **Edit card** | Opens the card's own three fields (image, title, text) inside the repeater row. |
| **Reorder cards** | ▲ / ▼ move buttons on each row; no drag handle. The repeater is `fixed: 'card_count'`, so it offers no per-row Add, Duplicate or Delete — the count control owns how many cards exist. |

---

## 4. ATTRIBUTES MATRIX

### 4.1 Inherited Styling

From `11_ABSTRACT §4.2`: `bg_color`, `heading_size`, `heading_align`.
**Defaults for this section:** `#FFFFFF` (`BG_WHITE`) / `SIZE_M` / `ALIGN_CENTER`.

| Attribute Name | Data Type | Required | Default Value | Status | Description & Constraints |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `bg_color` | `ColorValue` | Yes | `#FFFFFF` | `BUILT` | Three brand presets first, free value allowed. |
| `heading_size` | `Enum<String>` | Yes | `SIZE_M` | `BUILT` | Segmented S/M/L. Drives `.h-s` / `.h-m` / `.h-l` on the wrapper, which this section's header actually reads (`.sec-title`). |
| `heading_align` | `Enum<String>` | Yes | `ALIGN_CENTER` | `BUILT` | Left / Center. Centring applies to the header; the cards themselves stay `text-align:left` regardless. |

### 4.2 Section Header (Content group)

| Attribute Name | Data Type | Required | Default Value | Status | Description & Constraints |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `section_title` | `String` | No | Preset | `BUILT` | Hidden when empty. |
| `subheading` | `RichText` | No | Preset | `BUILT` | `RT_FULL`. Hidden when empty. Both empty → the whole header wrapper disappears (`11_ABSTRACT §5.1`). |
| `footnote` | `RichText` | No | `""` | `BUILT` | **Not in v1.** Optional small print under the grid, e.g. an availability disclaimer. `RT_BASIC` (bold, italic, strike, colour — no lists, no links). Rendered as `.mcg-note`: 32px above, centred, `12.5px`, faint ink. Suppressed when blank. |

### 4.3 Grid Configuration (Cards group)

| Attribute Name | Data Type | Required | Default Value | Status | Description & Constraints |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `card_count` | `Enum<Number>` | Yes | `3` | `BUILT` | `2` \| `3` \| `4`. Selects how many leading `cards` are *active* — rendered, validated, and counted for the `.n2` / `.n3` / `.n4` grid class. |
| `cards` | `Array<MediaCard>` | Yes | 4 items (4th blank) | `BUILT` | `min: 2`, `max: 4`, `fixed: 'card_count'`. Holds up to four entries at all times; entries past the count are retained, not deleted. Child schema: `51_OBJECT_MEDIA_CARD_ITEM`. |

The seed carries **four** cards. The fourth is deliberately blank (`title: ''`,
`paragraph: ''`, `image: null`) and inactive at the default count of 3 — switching to 4
reveals an empty card to fill in, and switching back hides it again with nothing lost.

---

## 5. DEFAULT BOILERPLATE PRESET PAYLOAD (SEED DATA)

Verbatim from `defaults` in `src/sections/multi-card-grid.js`.

```yaml
default_preset_payload:
  bg_color: "#FFFFFF"
  heading_size: "SIZE_M"
  heading_align: "ALIGN_CENTER"
  section_title: "Curated in-flight excellence"
  subheading: "<p>Uncompromising luxury across every stage of your transatlantic journey.</p>"
  card_count: 3
  cards:
    - image: null
      title: "Michelin-inspired dining"
      paragraph: "<p>Multi-course à la carte menus paired with sommelier-selected champagnes.</p>"
    - image: null
      title: "Turn-down service"
      paragraph: "<p>Full lie-flat suites fitted with Italian cotton linens.</p>"
    - image: null
      title: "Chauffeur & lounge access"
      paragraph: "<p>Private terminal escorts and lounge sanctuary access worldwide.</p>"
    - image: null            # inactive at card_count 3, retained
      title: ""
      paragraph: ""
  footnote: ""
```

---

## 6. BUSINESS RULES & SYSTEM GUARDS (IF -> THEN)

1. **Card Image Mandatory Invariant (L1, `E101`) — `BUILT`**
   - **IF** an **active** card has no `image` asset (neither `asset` nor `url`):
     - **THEN** publishing is blocked: *"Card N image is required."*, reported on
       `cards.N.image`.
   - Inactive cards (index ≥ `card_count`) are not validated.
   - **Alt text does not block publishing.** v1 required `image_alt` and made a missing
     caption an unpublishable page; the rule was removed system-wide in `_common.needMedia`,
     deliberately. The cost is stated there and here: an image with no alt reaches a screen
     reader as nothing. The editor pre-fills a guess from the filename, so the usual path
     still leaves alt filled in.

2. **The "All-or-Nothing" Text Consistency Invariant (L1, `E102`) — `BUILT`**
   - The grid is either **100% pure imagery** or **100% written cards**.
   - **IF** any active card has a non-empty `title` **or** a non-empty `paragraph` (measured
     with tags stripped), **AND** any active card is missing either of them:
     - **THEN** publishing is blocked with one `E102` on `cards`: *"Text consistency
       violation: either every card has a title and a paragraph, or all cards are
       image-only."*
   - Evaluated across **active** cards only, so lowering `card_count` past a half-written
     card resolves the error.

3. **Card Count Switching — Data Retention — `BUILT`**
   - **IF** `card_count` drops from `4` to `2`:
     - **THEN** cards 3 and 4 are omitted from the DOM and skipped by validation, while
       their media and copy stay in the **persisted section document**. `activeCards()` only
       slices; nothing deletes. Switching back restores them with no re-upload.

4. **Rendering — `BUILT`**
   - The shared section header renders above the grid (`dynamicShell` default), with a 40px
     gap to the first card row.
   - Each card emits its image, then the title if non-blank, then the paragraph if non-blank
     — so an image-only grid produces no empty text nodes and no stray spacing.
   - The footnote, when present, follows the grid outside it.

5. **Responsive Column Adaptation — `BUILT`**
   - **Desktop (`≥1024px`):** `.n2` / `.n3` / `.n4` → 2, 3 or 4 equal columns,
     `gap: 40px`. Container `max-width:1280px`, `padding: 0 80px`, section padding `80px 0`.
   - **Tablet (`768–1023px`):** `.n3` and `.n4` collapse to **2 columns**; `.n2` is already
     two and is untouched.
   - **Mobile (`<768px`):** every variant collapses to a **single column**, and the
     container falls back to `--container` / `--gutter` / `--section-y`. The swipe carousel
     v1 rejected is still not built and is not planned.

6. **Card Geometry — `BUILT`**
   - Every card image is `width:100%`, `aspect-ratio: 4/3`, `object-fit: cover`, clipped to
     `14px`. The empty-state placeholder holds the same 4:3 box, so a card with no upload
     occupies exactly the space its image will.
   - Title: `18px`, `--title-weight`, 14px below the image. Paragraph: `15px`, soft ink,
     6px below the title.
