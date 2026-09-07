# `41_OBJECT_SECTION_FEATURE.md`

```yaml
METACLASS: CONCRETE_OBJECT
OBJECT_ID: OBJ-41-FEATURE-SECTION
VERSION: 2.0.0
STATUS: APPROVED
INHERITS_FROM: OBJ-11-DYNAMIC-SECTION-BASE
DEPENDS_ON: SYS-02-ENUMS
TARGET_AUDIENCE: [LLM_AGENT, BACKEND_DEV, FRONTEND_DEV, UI_DESIGNER]
```

---

## 1. OBJECT DEFINITION
A value-proposition block: a row of icon + title (+ optional paragraph) items. One object with
**three parameters** and three named presets over them — not three different components.

---

## 2. RELATIONSHIPS (OOUX ORCA MAPPING)

- **Inherits From (Parent):** `11_ABSTRACT_OBJECT_DYNAMIC_SECTION`.
- **Belongs To (N:1):** `OBJECT_LANDING_PAGE`. Slots `01`, `03`, `05`. Multiplicity `0..N`.
- **Contains (3..4 Embedded Items):** `52_OBJECT_FEATURE_ITEM`.

---

## 3. OBJECT LIFECYCLE & ADMIN CTAs

Standard dynamic-section lifecycle — `11_ABSTRACT §3` (Insert, Edit, Duplicate, Reorder, Delete,
Toggle Visibility). Section-specific behaviour:

| Action (CTA) | System Behavior |
| :--- | :--- |
| **Insert** | Prompts for a preset, then injects that preset's payload (§5). |
| **Switch Preset / Parameters** | Re-parameterises in place. Content migrates without loss (§6.1). |

---

## 4. ATTRIBUTES MATRIX

### 4.1 Inherited Styling
From `11_ABSTRACT §4.2`: `bg_color`, `heading_size`, `heading_align`.
**Defaults for this section:** `BG_WHITE` / `SIZE_M` / `ALIGN_CENTER`.

### 4.2 Section Header (Optional)

| Attribute | Type | Required | Default | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `section_title` | `String` | No | `null` | Hidden if empty. |
| `subheading` | `RichText` | No | `null` | Hidden if empty. |

### 4.3 Presentation Parameters

The section is driven by three internal values, but only one of them is an independent
admin control. `icon_size` and `has_paragraph` are **consequences of the chosen preset**, not
separate settings — a 64px icon only ever belongs to Highlighted, and "no paragraph" is not a
toggle layered onto Compact, it is what Compact *is*. Exposing them as independent controls
invited combinations no design calls for and hid the fact that the three presets are three
different layouts, not one layout with two dials.

| Attribute | Type | Required | Default | Values | Admin-editable? |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `item_count` | `Enum` | Yes | `3` | `3` \| `4` | **Yes** — independent of preset |
| `icon_size` | `Enum` | Yes | `48` | `48` \| `64` (px, square) | No — set by preset only |
| `has_paragraph` | `Boolean` | Yes | `true` | `false` renders icon + title only | No — set by preset only |

| Preset | `icon_size` | `item_count` | `has_paragraph` | Item layout | Use |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Highlighted** | `64` | `3` | `true` | Vertical stack, centred | Primary value proposition, high prominence |
| **Standard** | `48` | `3` or `4` | `true` | Horizontal: icon left, title+paragraph right, left-aligned | Secondary feature row |
| **Compact** | `48` | `3` or `4` | `false` | Horizontal: icon + single-line label, divided like a stat strip | Perk bullets, minimum vertical cost |

The three presets therefore read as three visually distinct layouts (see the reference sketches
in the design file), not the same card shrunk and stripped of copy. `item_count = 4` with
`icon_size = 64` cannot occur, since `icon_size` never varies independently of the preset that
set it.

### 4.4 Item Schema
Every item is a `52_OBJECT_FEATURE_ITEM`: `icon` (required), `title` (required), `paragraph`
(required when `has_paragraph === true`, retained but not rendered when `false`).

---

## 5. DEFAULT PRESET PAYLOADS

```yaml
preset_highlighted:            # icon_size 64, item_count 3, has_paragraph true
  section_title: "Why Discerning Travelers Book With Us"
  subheading: "Industry-leading contracts paired with white-glove concierge management."
  items:
    - { icon: "icon_best_fare.svg",   title: "Wholesale Fare Privilege",
        paragraph: "Up to 70% off published business and first class fares via private consolidator contracts." }
    - { icon: "icon_concierge.svg",   title: "Dedicated Personal Agent",
        paragraph: "Direct access to a senior specialist who manages your booking, seats and routing 24/7." }
    - { icon: "icon_flexibility.svg", title: "Complete Journey Protection",
        paragraph: "Flight monitoring, fee-free date changes and emergency re-routing assistance." }

preset_standard:              # icon_size 48, item_count 3, has_paragraph true
  section_title: "The Business Class Standard"
  subheading: null
  items:
    - { icon: "icon_shield.svg", title: "IATA & ARC Licensed",
        paragraph: "Fully accredited bonded travel seller meeting international financial standards." }
    - { icon: "icon_lock.svg",   title: "Transparent Invoicing",
        paragraph: "All-inclusive pricing with zero hidden booking or card processing fees." }
    - { icon: "icon_plane.svg",  title: "Mileage Earning Eligible",
        paragraph: "All tickets earn standard frequent flyer elite qualifying miles." }

preset_compact:               # icon_size 48, item_count 3, has_paragraph false
  section_title: null
  subheading: null
  items:
    - { icon: "icon_clock.svg",    title: "24/7 Concierge Support" }
    - { icon: "icon_tag.svg",      title: "Best Fare Guarantee" }
    - { icon: "icon_calendar.svg", title: "Flexible Ticket Changes" }
```

---

## 6. BUSINESS RULES & SYSTEM GUARDS (IF -> THEN)

1. **Parameter Change — Non-Destructive:**
   - **IF** any of `icon_size`, `item_count`, `has_paragraph` changes (directly or via a preset):
     - **THEN** `icon` and `title` are untouched — every configuration has both.
     - **THEN** `paragraph` values are **retained in the persisted document** when
       `has_paragraph` becomes `false`, and reappear when it is set back to `true`.
     - **THEN** item 4 is retained when `item_count` drops to `3`, and restored on the way back.
     - **THEN** preset content seeds **empty fields only**; admin-entered copy is never
       overwritten.

2. **Mandatory Content (L1, `E100`/`E101`):**
   - Every **active** item (the first `item_count`) requires `icon` and `title`.
   - **IF** `has_paragraph === true`: every active item additionally requires `paragraph`.
   - Inactive items are neither rendered nor validated.

3. **Icon Geometry:**
   - The icon container is clamped to `icon_size` square, with a light background tint and
     rounded corners (a "badge"), and the asset renders with `object-fit: contain` to prevent
     layout shift regardless of the uploaded asset's own aspect ratio.
   - Icons sit beside a mandatory title, so they are decorative: rendered with `alt=""`
     (`SYS-02-ENUMS §6`).

4. **Responsive Grid:**
   - **Desktop (`>= 1024px`):** `item_count` equal columns, using the item layout of the
     active preset (§4.3).
   - **Tablet (`768–1023px`):** Highlighted and Compact collapse 4 items to a `2x2` grid; 3
     items stay in a row. Standard collapses to `2x2` at 3 items too, so the icon-left rows
     keep enough width to stay legible.
   - **Mobile (`< 768px`):** Highlighted and Standard stack to a single column (their item
     layout differs, but both need the full width once a paragraph is present). Compact
     renders a `2x2` grid of icon + label pills, dividers repositioned to separate rows
     rather than a single line.
