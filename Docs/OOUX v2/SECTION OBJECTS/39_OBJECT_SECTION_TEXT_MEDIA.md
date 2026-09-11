# `39_OBJECT_SECTION_TEXT_MEDIA.md`

```yaml
METACLASS: CONCRETE_OBJECT
OBJECT_ID: OBJ-39-TEXT-MEDIA
VERSION: 2.0.0
STATUS: APPROVED
DEPENDS_ON: SYS-02-ENUMS
INHERITS_FROM: OBJ-11-DYNAMIC-SECTION-BASE
STRUCTURAL_ROLE: DYNAMIC_CONTENT_MODULE
SOURCE_OF_TRUTH: src/sections/text-media.js
TARGET_AUDIENCE: [LLM_AGENT, BACKEND_DEV, FRONTEND_DEV, UI_DESIGNER]
```

---

## 1. OBJECT DEFINITION

An editorial split: narrative copy beside zero, one or two images, on either side. Three
media densities (**No Photo**, **1 Photo**, **2 Photos**), a side flip, rich typography
(lists, links) and an optional call-to-action button.

The two-photo variant is an overlapping pair, not a side-by-side grid: two absolutely
positioned boxes offset diagonally, with depth coming from a cutout stroke that matches the
section's own background rather than from a shadow.

---

## 2. RELATIONSHIPS (OOUX ORCA MAPPING)

- **Inherits From (Parent):** `11_ABSTRACT_OBJECT_DYNAMIC_SECTION` (inherits `section_id`,
  `slot_index`, `order_in_slot`, `anchor_id`, `position_type: 'Custom'`,
  `is_mandatory: false`, `is_visible: true`, styling tokens).
- **Belongs To (N:1):** `OBJECT_LANDING_PAGE`.
- **Multiplicity / Instance Limit:** **Unbounded (0..N)** — instances commonly alternate
  `media_side` down a page.
- **Permitted Slots:** Dynamic slots `01`, `03`, `05`.
- **Library Group:** `content` ("Content sections").
- **Opens (Optional):** `21_OBJECT_FLIGHT_QUOTE_MODAL` when `cta.href` is `#lead-modal` —
  same delegated-click mechanism as doc 38 §6.2.

---

## 3. OBJECT LIFECYCLE & ADMIN CTAs

Standard dynamic-section lifecycle — `11_ABSTRACT §3` (Insert, Edit, Duplicate, Reorder,
Delete, Toggle Visibility). Insert auto-populates the preset payload in §5.

| Section-specific CTA | System Behavior |
| :--- | :--- |
| **Images (None / 1 / 2)** | Sets `media_mode`; mounts and unmounts the matching uploaders. Unused uploads stay in the document. |
| **Side (Left / Right)** | Sets `media_side`. The control is hidden when `media_mode === 'No Photo'` — there is no media to reposition. |
| **Button** | A switch inside the Content group. On reveals two indented fields, `Label` and `Link`. |

---

## 4. ATTRIBUTES MATRIX

### 4.1 Inherited Styling

From `11_ABSTRACT §4.2`: `bg_color`, `heading_size`, `heading_align`.
**Defaults for this section:** `#FFFFFF` (`BG_WHITE`) / `SIZE_M` / `ALIGN_LEFT`.

| Attribute Name | Data Type | Required | Default Value | Status | Description & Constraints |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `bg_color` | `ColorValue` | Yes | `#FFFFFF` | `BUILT` | Also published as `--section-bg`, which the two-photo cutout stroke reads so the overlap matches whatever the author chose. |
| `heading_size` | `Enum<String>` | Yes | `SIZE_M` | `BUILT` | The title is rendered as `.sec-title` inside the copy column, so the wrapper's `.h-s` / `.h-m` / `.h-l` class does drive it. |
| `heading_align` | `Enum<String>` | Yes | `ALIGN_LEFT` | `BUILT` | `ALIGN_CENTER` sets `text-align:center` on the whole section, copy column included. |

### 4.2 Narrative Content (Content group)

| Attribute Name | Data Type | Required | Default Value | Status | Description & Constraints |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `section_title` | `String` | **Yes** | Preset | `BUILT` | **MANDATORY** (`required: true`, `E100`), although `11_ABSTRACT §4.3` marks the inherited field optional. |
| `paragraph` | `RichText` | **Yes** | Preset | `BUILT` | **MANDATORY** (`E100`). `RT_FULL`: bold, italic, strike, colour, `ul`, `ol`, link. Rendered at `17px` in soft ink. |
| `subheading` | — | — | — | `BUILT` | **Not offered.** `headingFields({ sub: false })` — the body copy is this section's whole point, so `paragraph` takes the subheading's place rather than sitting under one. |

### 4.3 Call-to-Action (inside the Content group)

Built with `ctaFields('cta')` — **fields, not a group**. The button lives at the end of
Content behind its own switch; v1 gave it a collapsed panel of its own. Whether a section
ends in a call to action is the same kind of decision as what it says.

| Attribute Name | Data Type | Required | Default Value | Status | Description & Constraints |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `cta.on` | `Boolean` | Yes | `true` in the seed (`false` as the field default) | `BUILT` | Labelled **Button** — named after the thing it turns on, not after the turning on. Owns the two fields below it: `when` reveals them, `sub` indents them. |
| `cta.label` | `String` | If `cta.on` | `"Plan the Trip"` in the seed (`"Learn more"` as the field default) | `BUILT` | `E100` when the switch is on and this is blank. |
| `cta.href` | `String` | If `cta.on` | `"#lead-modal"` | `BUILT` | Help: *relative path, absolute URL, or `#lead-modal` to open the lead form.* Resolution and the external-link attributes are doc 38 §6.2. |

Rendered with `class="btn btn-secondary"` — light neutral fill, dark text — not the dark
`.btn` used by Hero and Large Image Banner. A section opts into Secondary per CTA; it is not
a global default.

### 4.4 Media (Media group, open by default)

| Attribute Name | Data Type | Required | Default Value | Status | Description & Constraints |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `media_mode` | `Enum<String>` | Yes | `'1 Photo'` | `BUILT` | `No Photo` \| `1 Photo` \| `2 Photos`. Labelled **Images**, shown as None / 1 / 2. |
| `media_side` | `Enum<String>` | Yes | `'Right'` | `BUILT` | `Left` \| `Right`. Hidden while `media_mode === 'No Photo'`. |
| `image_single` | `Media` | If `1 Photo` | `null` | `BUILT` | Declared `ratio: '1:1'`; rendered `aspect-ratio:1/1`, `object-fit:cover`, `16px` radius. |
| `image_large` | `Media` | If `2 Photos` | `null` | `BUILT` | The big box: bottom-right, `72%` wide, `z-index:2`. |
| `image_small` | `Media` | If `2 Photos` | `null` | `BUILT` | The small box: top-left, `42%` wide, `z-index:1`. |
| `*.alt` | `String` | No | Filename guess | `BUILT` | Alt text does not block publishing (`_common.needMedia`, system-wide). |

---

## 5. DEFAULT BOILERPLATE PRESET PAYLOAD (SEED DATA)

Verbatim from `defaults` in `src/sections/text-media.js`.

```yaml
default_preset_payload:
  bg_color: "#FFFFFF"
  heading_size: "SIZE_M"
  heading_align: "ALIGN_LEFT"
  media_mode: "1 Photo"
  media_side: "Right"
  section_title: "London Executive Guide"
  paragraph: "<p>Flying Business Class across the Atlantic is a race against the clock. On the 7-hour sprint from New York to London, sleep is the ultimate metric. Carriers like American Airlines (Flagship First) and British Airways (Club Suite) prioritize 180-degree lie-flat beds and direct aisle access. Skip the in-flight meal, maximize your rest, and utilize the LHR Arrivals Lounges for a shower and espresso before heading straight to the City.</p>"
  image_single: null
  image_large: null
  image_small: null
  cta:
    on: true
    label: "Plan the Trip"
    href: "#lead-modal"
```

---

## 6. BUSINESS RULES & SYSTEM GUARDS (IF -> THEN)

1. **"No Photo" — Second Column Repurposed, Not Removed — `BUILT`**
   - **IF** `media_mode === 'No Photo'`:
     - **THEN** the layout stays two columns. `section_title` occupies the first column
       alone (`.tm-title-col`, its own bottom margin zeroed), and `paragraph` + the CTA move
       into the second, in the slot the media would otherwise fill.
     - **THEN** the `media_side` control is hidden — there is nothing to reposition.
   - This is v1 §6.1 **as revised**, and it is implemented: the earlier one-column,
     780px-clamped variant is gone. The title keeps a column of its own whether or not there
     is a photo.

2. **Image Requirement Invariant (L1, `E101`) — `BUILT`**
   - **IF** `media_mode === '1 Photo'` **AND** `image_single` has no asset → `E101`.
   - **IF** `media_mode === '2 Photos'` **AND** either `image_large` or `image_small` has no
     asset → `E101` on each missing one.
   - Images belonging to an inactive mode are retained and never validated, so switching
     modes destroys no upload. Alt text is not part of the guard.

3. **CTA Field Prerequisite (L1, `E100`) — `BUILT`**
   - **IF** `cta.on === true`: both `cta.label` and `cta.href` are required before
     publishing.
   - **IF** `cta.on` is falsy: neither is validated, both are retained, and no anchor is
     emitted.

4. **Horizontal Layout — `BUILT`**
   - Desktop grid is `1fr 1fr` with an `80px` gap, `align-items:center`.
   - The DOM order is always **copy, then media**. `media_side === 'Left'` adds `.media-left`
     to the grid, which sets `order:2` on the copy column — so the media paints first and the
     copy second, without changing the reading order of the source.
   - `media_side === 'Right'` (default): `[copy] [media]`.
   - The media column is `position: sticky; top: var(--header-offset)` on desktop, so a tall
     copy column scrolls past a pinned image.

5. **Mobile Stacking Order — `DEFECT`**
   - **Documented (v1 §6.4, and repeated in a comment in the module):** below the
     breakpoint the section stacks `[Title] → [Media] → [Paragraph] → [CTA]`.
   - **Actual:** the renderer emits one `.tm-copy` block containing title, paragraph and CTA
     together, followed by `.tm-media`. At `≤1023px` the grid drops to one column and
     `.tm.media-left .tm-copy` is reset to `order:0`; **no media query reorders anything
     else**, and the media element is not a child of the copy block, so it cannot be
     interleaved. The produced order is **Title → Paragraph → CTA → Media**, for both
     `media_side` values.
   - The comment above the `return` in `src/sections/text-media.js` ("the grid handles it by
     stacking the copy block, which already carries that internal order") asserts the
     documented order is satisfied. It is not: the copy block carries three of the four
     elements, and the fourth sits after all of them.
   - Fixing it needs either a `order`-based rule inside a mobile media query or a media
     element emitted between the title and the paragraph. Neither exists.

6. **Responsive Container — `BUILT`**
   - **Desktop:** `.tm-sec .wrap{max-width:1280px; padding-left/right:80px}`,
     section padding `80px` top and bottom.
   - **`≤1023px`:** one column, gap `28px`; `.tm-media` becomes `position:relative` —
     deliberately relative and not static, because the two-photo overlap positions its boxes
     against this element and `static` would send them to the nearest positioned ancestor
     instead.
   - **`≤767px`:** the container falls back to `--container` / `--gutter` / `--section-y`.
