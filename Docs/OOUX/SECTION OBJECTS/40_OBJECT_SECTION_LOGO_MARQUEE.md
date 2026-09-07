# `40_OBJECT_SECTION_LOGO_MARQUEE.md`

```yaml
METACLASS: CONCRETE_OBJECT
OBJECT_ID: OBJ-40-LOGO-MARQUEE
VERSION: 1.1.0
STATUS: APPROVED
DEPENDS_ON: SYS-02-ENUMS
INHERITS_FROM: OBJ-11-DYNAMIC-SECTION-BASE
STRUCTURAL_ROLE: DYNAMIC_INTERMEDIATE_MODULE
TARGET_AUDIENCE: [LLM_AGENT, BACKEND_DEV, FRONTEND_DEV, UI_DESIGNER]
```

---

## 1. OBJECT DEFINITION
A lightweight trust-building showcase block displaying partner airlines, industry accreditations, or corporate client logos. Features an automated runtime **Overflow Detection Engine**: if the total width of the logos fits within the container, they render as a static centered row; if they overflow the viewport width, the component seamlessly transitions into an infinite, smooth-scrolling marquee ticker.

---

## 2. RELATIONSHIPS (OOUX ORCA MAPPING)

- **Inherits From (Parent):** `11_ABSTRACT_OBJECT_DYNAMIC_SECTION` (Inherits `section_id`, `slot_index`, `order_in_slot`, `anchor_id`, `position_type: 'Custom'`, `is_mandatory: false`, `is_visible: true`, styling tokens).
- **Belongs To (N:1):** `OBJECT_LANDING_PAGE`.
- **Multiplicity / Instance Limit:** **Unbounded (0..N)** — Can be inserted multiple times per page with independent logo sets and headings.
- **Permitted Slots:** Dynamic Slots `01`, `03`, `05`.
- **Contains (1..N Embedded Assets):** Logo Image Items.

---

## 3. OBJECT LIFECYCLE & ADMIN CTAs

Standard dynamic-section lifecycle — `11_ABSTRACT §3` (Insert, Edit, Duplicate, Reorder,
Delete, Toggle Visibility). Insert auto-populates the preset payload in §5.

| Section-specific CTA | System Behavior |
| :--- | :--- |
| **Add / Upload Logos** | Appends `SVG` / `PNG` files to the collection. |
| **Reorder Logos** | Drag within the logo list; sets horizontal sequence. |
| **Delete Logo** | Removes one logo from the collection. |

---

## 4. ATTRIBUTES MATRIX

### 4.1 Inherited Styling
From `11_ABSTRACT §4.2`: `bg_color`, `heading_size`, `heading_align`.
**Defaults for this section:** `BG_LIGHT_GREY` / `SIZE_S` / `ALIGN_CENTER`.

### 4.2 Section Header Typography (Optional)

| Attribute Name | Data Type | Required | Default Value | Description & Constraints |
| :--- | :--- | :--- | :--- | :--- |
| `section_title` | `String` | No | `null` | Section headline (e.g., *"Featured Partner Airlines"*). Hidden if empty. |
| `subheading` | `RichText` | No | `null` | Explanatory sub-copy. Hidden if empty. |

---

### 4.3 Logo Assets Collection

| Attribute Name | Data Type | Required | Default Value | Description & Constraints |
| :--- | :--- | :--- | :--- | :--- |
| `logos` | `Array<LogoItem>` | **Yes** | 6 Preset Logos | Items: `{ file: File<'SVG'|'PNG'>, alt?: String, href?: String }`. `alt` is optional (decorative brand marks render `alt=""`); `href` makes a logo a link. |
| `speed` | `Integer` | Yes | `30` | Seconds per full marquee cycle, range `10..90`. Only meaningful when the marquee engine activates (§6.1). |

* **CSS Asset Constraints:**
  * **Height:** Fixed strictly at **`36px`** (`height: 36px;`).
  * **Width:** Proportional auto scale (`width: auto; object-fit: contain;`).
  * **Horizontal Gap:** `48px` spacing between logos.

---

## 5. DEFAULT BOILERPLATE PRESET PAYLOAD (SEED DATA)

```yaml
default_preset_payload:
  bg_color: "BG_LIGHT_GREY"
  heading_size: "SIZE_S"
  heading_align: "ALIGN_CENTER"
  section_title: "Direct Contracts With World-Leading Carriers"
  subheading: null
  logos:
    - "preset_emirates.svg"
    - "preset_qatar.svg"
    - "preset_singapore_airlines.svg"
    - "preset_british_airways.svg"
    - "preset_lufthansa.svg"
    - "preset_air_france.svg"
```

---

## 6. BUSINESS RULES & SYSTEM GUARDS (IF -> THEN)

1. **Automated Marquee vs. Static Grid Detection (Core Runtime Invariant):**
   - **CALCULATION:** System measures $\text{Total Width} = \sum(\text{Logo Widths}) + \sum(\text{Gaps})$.
   - **IF** $\text{Total Width} \le \text{Container Viewport Width}$:
     - **THEN** The component renders as a **Centered Static Row** (`display: flex; justify-content: center; align-items: center; flex-wrap: nowrap;`). No marquee animation is initiated.
   - **IF** $\text{Total Width} > \text{Container Viewport Width}$:
     - **THEN** The component automatically activates the **Infinite Marquee Ticker Engine**:
       - Clones the logo array in the DOM to eliminate visual jumping (`duplicate-for-loop`).
       - Applies continuous smooth CSS keyframe animation (`animation: marquee-scroll linear infinite;`).
       - Enables hover pause: `animation-play-state: paused` on user hover/touch.
   - **Reduced-motion override (mandatory):** under
     `@media (prefers-reduced-motion: reduce)` the marquee **never animates**. It falls back to a
     static, horizontally scrollable row with visible overflow affordance. Continuous motion is
     a vestibular trigger; this is an accessibility requirement, not a preference. The same
     rule applies to the Hero countdown's ticking animation.

2. **Mandatory Minimum Asset Guard (L1, `E101`):**
   - **IF** `logos.length === 0`:
     - **THEN** publishing is blocked: `"Logo Showcase requires at least 1 uploaded logo."`
   - **Recommended range:** 4–12. Below 4 a marquee never triggers and the row looks sparse;
     above 12 the cloned track doubles DOM weight for no gain.

3. **Asset Strict Height Normalization:**
   - **ALL LOGOS MUST BE NORMALIZED TO 36PX HEIGHT:**
     - The rendering engine strictly clamps logo display height to `36px`. SVGs with arbitrary viewboxes are constrained via `height: 36px; width: auto;`.
