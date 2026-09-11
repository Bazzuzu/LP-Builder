# `41_OBJECT_SECTION_FEATURE.md`

```yaml
METACLASS: CONCRETE_OBJECT
OBJECT_ID: OBJ-41-FEATURE-SECTION
VERSION: 2.0.0
STATUS: APPROVED
DEPENDS_ON: SYS-02-ENUMS
INHERITS_FROM: OBJ-11-DYNAMIC-SECTION-BASE
STRUCTURAL_ROLE: DYNAMIC_INTERMEDIATE_MODULE
SOURCE_OF_TRUTH: src/sections/feature.js
TARGET_AUDIENCE: [LLM_AGENT, BACKEND_DEV, FRONTEND_DEV, UI_DESIGNER]
```

---

## 1. OBJECT DEFINITION

A value-proposition block: a row of icon + title (+ paragraph) items. One object with three
presentation values and three named presets over them — not three different components.

The presets are named **`S` / `M` / `L`**, declared in that order because every size control
in the editor runs small-to-large. They map 1:1 onto v1's names:

| v2 | v1 | Item layout |
| :--- | :--- | :--- |
| `L` | Highlighted | Vertical stack, centred when the section header is centred |
| `M` | Standard | Icon left, title + paragraph right, left-aligned |
| `S` | Compact | Icon + single-line label in a row, divided like a stat strip |

---

## 2. RELATIONSHIPS (OOUX ORCA MAPPING)

- **Inherits From (Parent):** `11_ABSTRACT_OBJECT_DYNAMIC_SECTION`.
- **Belongs To (N:1):** `OBJECT_LANDING_PAGE`. Dynamic slots `01`, `03`, `05`.
  Multiplicity `0..N`.
- **Library Group:** `intermediate` ("Intermediate & supporting").
- **Contains (3..4 Embedded Items):** `52_OBJECT_FEATURE_ITEM`.

---

## 3. OBJECT LIFECYCLE & ADMIN CTAs

Standard dynamic-section lifecycle — `11_ABSTRACT §3` (Insert, Edit, Duplicate, Reorder,
Delete, Toggle Visibility).

| Action (CTA) | System Behavior | Status |
| :--- | :--- | :--- |
| **Insert** | Injects the seed in §5 — the `L` configuration with four items. | `BUILT` |
| **Insert → choose a preset first** | v1 specified a prompt at insertion time. There is none: a section is inserted, then a preset is picked in its panel. | `PLANNED` |
| **Size (S / M / L)** | A `preset` control at the head of the Items group. Picking one writes four props at once (§4.3); each stays independently editable afterwards. A button reads as active when every prop it would write already matches. | `BUILT` |
| **How many (3 / 4)** | Sets `item_count`. Hidden while `icon_size === 64` (i.e. under `L`). | `BUILT` |

---

## 4. ATTRIBUTES MATRIX

### 4.1 Inherited Styling

From `11_ABSTRACT §4.2`: `bg_color`, `heading_size`, `heading_align`.
**Defaults for this section:** `#FFFFFF` (`BG_WHITE`) / **`SIZE_L`** / `ALIGN_CENTER`.
(v1 recorded `SIZE_M`; the seed is `SIZE_L`, matching the `L` preset it ships with.)

| Attribute Name | Data Type | Required | Default Value | Status | Description & Constraints |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `bg_color` | `ColorValue` | Yes | `#FFFFFF` | `BUILT` | Three brand presets first. |
| `heading_size` | `Enum<String>` | Yes | `SIZE_L` | `BUILT` | Segmented S/M/L in the Content group, and **also written by the preset control** (§4.3). Read by `.sec-title`. |
| `heading_align` | `Enum<String>` | Yes | `ALIGN_CENTER` | `BUILT` | `ALIGN_CENTER` additionally centres `L`'s items (`.sec.a-center .ft-item{align-items:center}`); the `M` and `S` layouts pin their own alignment and ignore it. |

### 4.2 Section Header (Content group)

| Attribute Name | Data Type | Required | Default Value | Status | Description & Constraints |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `section_title` | `String` | No | Preset | `BUILT` | Hidden when empty. |
| `subheading` | `RichText` | No | Preset | `BUILT` | `RT_FULL`. Hidden when empty. |

### 4.3 Presentation Parameters (Items group)

`icon_size` and `has_paragraph` are **consequences of the chosen preset**, not separate
controls: a 64px icon only ever belongs to `L`, and "no paragraph" is not a toggle layered
onto `S` — it is what `S` *is*. Neither has a field of its own in the panel; both are
persisted props that the preset writes and the renderer reads.

| Attribute Name | Data Type | Required | Default Value | Status | Description & Constraints |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `item_count` | `Enum<Number>` | Yes | `3` | `BUILT` | `3` \| `4`. The one dimension documented as independent of the preset — but see §6.2, which is why this row is not the whole story. Hidden from the panel while `icon_size === 64`. |
| `icon_size` | `Enum<Number>` | Yes | `64` | `BUILT` | `48` \| `64`, px, square. No direct control. Written by the preset; also the stored flag the renderer and the `item_count` visibility rule read to tell `L` from `M`/`S`. (v1 recorded a default of `48`; the seed is `64`.) |
| `has_paragraph` | `Boolean` | Yes | `true` | `BUILT` | No direct control. `false` renders and validates icon + title only, and hides the paragraph field on every item. |
| `_preset` | — | — | — | `BUILT` | The control's key. **Nothing is stored under it** — `kind: 'preset'` writes the props in `applies` and keeps no record of which button was pressed. Which preset is active is derived by comparing the four values back. |

**Preset table — exactly what each button writes:**

| Preset | `icon_size` | `item_count` | `has_paragraph` | `heading_size` | Layout class | Section padding |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **S** | `48` | `3` | `false` | `SIZE_S` | `.bullets` | `40px` (`.ft-sec-compact`) |
| **M** | `48` | `3` | `true` | `SIZE_M` | `.row` | `80px` |
| **L** | `64` | `3` | `true` | `SIZE_L` | *(none)* | `80px` |

Two things in that table v1 did not describe:

* **Each preset also writes `heading_size`** — so `L`/`M`/`S` mean the same thing for the
  icon and for the section heading above it. Picking a preset therefore changes a field that
  lives in a *different group* (Content), which the control's help text states.
* **Each preset also writes `item_count: 3`.** That is the defect in §6.2.

**Presets carry no content payload** — `PLANNED`. v1 §5 specified three distinct copy
payloads (`preset_highlighted`, `preset_standard`, `preset_compact`). `PRESETS` in the module
holds four presentation values and nothing else; switching preset never touches `items`,
`section_title` or `subheading`.

### 4.4 Item Schema

Every item is a `52_OBJECT_FEATURE_ITEM`: `icon` (required), `title` (required),
`paragraph` (required when `has_paragraph !== false`, retained but neither shown nor
validated otherwise). The repeater is `min: 3`, `max: 4`, `fixed: 'item_count'`.

---

## 5. DEFAULT BOILERPLATE PRESET PAYLOAD (SEED DATA)

Verbatim from `defaults` in `src/sections/feature.js` — one payload, not three. It is the
`L` configuration, and it ships **four** items so that switching to `M`/`S` and raising the
count to 4 finds a written item waiting.

```yaml
default_preset_payload:
  bg_color: "#FFFFFF"
  heading_size: "SIZE_L"
  heading_align: "ALIGN_CENTER"
  section_title: "Why discerning travellers book with us"
  subheading: "<p>Industry-leading contracts paired with white-glove concierge management.</p>"
  icon_size: 64
  item_count: 3
  has_paragraph: true
  items:
    - icon: null
      title: "Wholesale fare privilege"
      paragraph: "<p>Up to 70% off published business and first class fares via private consolidator contracts.</p>"
    - icon: null
      title: "Dedicated personal agent"
      paragraph: "<p>Direct access to a senior specialist who manages your booking, seats and routing 24/7.</p>"
    - icon: null
      title: "Complete journey protection"
      paragraph: "<p>Flight monitoring, fee-free date changes and emergency re-routing assistance.</p>"
    - icon: null                       # inactive at item_count 3, retained
      title: "Best fare guarantee"
      paragraph: "<p>Matched or bettered against any comparable quote.</p>"
```

---

## 6. BUSINESS RULES & SYSTEM GUARDS (IF -> THEN)

1. **Parameter Change — Non-Destructive — `BUILT`**
   - `icon` and `title` are never touched: every configuration has both.
   - `paragraph` values are **retained in the persisted document** when `has_paragraph`
     becomes `false`, and reappear when it is `true` again — the field is hidden by a `when`
     clause and skipped by validation, never cleared.
   - Item 4 is retained when `item_count` drops to `3` (`activeItems()` slices, nothing
     deletes) and comes back on the way up.

2. **Preset Switching Resets `item_count` — `DEFECT`**
   - **Documented (§4.3, and v1 §4.3):** `item_count` is the one parameter independent of
     the preset, admin-editable at `3` or `4` under `M` and `S`.
   - **Actual:** every entry in `PRESETS` carries `item_count: 3`, and the `preset` control
     writes **every** key in the chosen entry. So an `M` or `S` section the author raised to
     4 items silently drops back to 3 the moment any preset button is pressed — including
     the button for the preset it is already on, whose remaining values are already correct.
   - The fourth item is retained (rule 1), so nothing is lost but the setting; it still
     contradicts the independence this doc and the panel both claim, and it is invisible at
     the moment it happens.
   - The fix is to drop `item_count` from the three `PRESETS` entries, since `L` already
     enforces 3 through the `when` clause that hides the control.

3. **Mandatory Content (L1, `E100` / `E101`) — `BUILT`**
   - Every **active** item (the first `item_count`) requires `icon` (`E101` on
     `items.N.icon`) and `title` (`E100` on `items.N.title`).
   - **IF** `has_paragraph !== false`: every active item additionally requires `paragraph`
     (`E100` on `items.N.paragraph`).
   - Inactive items are neither rendered nor validated.

4. **Icon Geometry — `BUILT`**
   - The icon box is clamped to `icon_size` square via an inline `width`/`height`, with
     `border-radius:14px`, and the asset renders `width:100%; height:100%;
     object-fit:contain`, so no uploaded aspect ratio can shift the layout.
   - **There is no background tint on the box.** v1 §6.3 specified a "badge" fill; it was
     removed deliberately — a filled icon, often a semi-transparent PNG, sitting on a grey
     chip just reads as darkened and muddy. The radius and the `contain` fit stayed. The
     empty-state placeholder paints its own full-coverage background, so the box needs none
     either way.
   - Icons sit beside a mandatory title, so they are decorative: `decorative: true`, no alt
     field, `alt=""` in the output.

5. **Responsive Grid — `BUILT`** *(these are the real rules; they are not v1 §6.4's)*
   - **Desktop (`≥1024px`):** `.n3` → 3 equal columns, `.n4` → 4, `gap:40px`, whichever
     layout class is active.
   - **Tablet (`768–1023px`):**
     - `L` with 3 items → **1 column** (`.ft.n3{grid-template-columns:1fr}`). v1 said three
       items stay in a row; they do not — a 64px icon over a paragraph needs the width.
     - `M` with 3 or 4 items → **2 columns** (`.ft.row.n3`, and `.ft.n4`).
     - `S` with 3 or 4 items → **2 columns** (`.ft.bullets.n3`, `.ft.bullets.n4`).
     - `L` with 4 items is not reachable through the UI: the count control is hidden under
       `L`, and every preset writes `item_count: 3` (§6.2). Were the prop set some other
       way, `.ft.n4` would give it 2 columns.
   - **Mobile (`<768px`):** `L` and `M` stack to **1 column**; `S` keeps a **2-column** grid
     of icon + label pills, with the divider moved so it separates the two columns of each
     row (`:nth-child(2n)` keeps the left border, `:nth-child(odd)` drops it) instead of
     drawing a single strip.
   - The container drops to `--gutter` and `--section-y`, and `S` loses its half-height
     rhythm — both `.ft-sec` and `.ft-sec.ft-sec-compact` get the same `--section-y`.

6. **Container — `BUILT`**
   - `.ft-sec .wrap{padding-left:80px; padding-right:80px}` — **padding only**. This section
     does not override `max-width`, so it keeps the shared `--container` (`1180px`), unlike
     Prices / FAQ / Story & Specs / Multi-Card Grid, which cap at `1280px`.
   - Vertical rhythm: `80px` for `L` and `M`; `40px` for `S`, which is already the dense
     preset.
   - Header-to-grid gap: `40px`.
