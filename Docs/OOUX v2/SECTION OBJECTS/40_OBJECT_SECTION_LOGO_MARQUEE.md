# `40_OBJECT_SECTION_LOGO_MARQUEE.md`

```yaml
METACLASS: CONCRETE_OBJECT
OBJECT_ID: OBJ-40-LOGO-MARQUEE
VERSION: 2.0.0
STATUS: APPROVED
DEPENDS_ON: SYS-02-ENUMS
INHERITS_FROM: OBJ-11-DYNAMIC-SECTION-BASE
STRUCTURAL_ROLE: DYNAMIC_INTERMEDIATE_MODULE
SOURCE_OF_TRUTH: src/sections/logo-marquee.js, src/render/runtime.js
TARGET_AUDIENCE: [LLM_AGENT, BACKEND_DEV, FRONTEND_DEV, UI_DESIGNER]
```

---

## 1. OBJECT DEFINITION

A lightweight trust block showing partner airlines, accreditations or corporate client
logos. It carries a runtime **overflow detection** step: if the logos fit the container they
render as a static centred row; if they overflow, the component turns itself into an
infinite smooth-scrolling ticker with a cloned track.

---

## 2. RELATIONSHIPS (OOUX ORCA MAPPING)

- **Inherits From (Parent):** `11_ABSTRACT_OBJECT_DYNAMIC_SECTION` (inherits `section_id`,
  `slot_index`, `order_in_slot`, `anchor_id`, `position_type: 'Custom'`,
  `is_mandatory: false`, `is_visible: true`, styling tokens).
- **Belongs To (N:1):** `OBJECT_LANDING_PAGE`.
- **Multiplicity / Instance Limit:** **Unbounded (0..N)** — independent logo sets and
  headings per instance.
- **Permitted Slots:** Dynamic slots `01`, `03`, `05`.
- **Library Group:** `intermediate` ("Intermediate & supporting").
- **Contains (1..N Embedded Assets):** logo items — `{ file, alt, href }`. No child object
  document: three fields, not an entity.

---

## 3. OBJECT LIFECYCLE & ADMIN CTAs

Standard dynamic-section lifecycle — `11_ABSTRACT §3` (Insert, Edit, Duplicate, Reorder,
Delete, Toggle Visibility). Insert auto-populates the preset payload in §5.

| Section-specific CTA | System Behavior |
| :--- | :--- |
| **+ Add logo** | Appends one empty logo row. |
| **↑ Upload files** | `multiUpload: true` — a multi-file picker appends one row per file, each with its alt text pre-filled from the filename. |
| **Reorder logos** | ▲ / ▼ move buttons on each row set the horizontal sequence. There is no drag handle. |
| **Duplicate / Delete logo** | Per-row buttons. Delete is disabled at `min: 1`, and an empty collection is an `E101` anyway (§6.2). |
| **Ticker speed** | A `10..90 s` range slider in the Appearance group. |

---

## 4. ATTRIBUTES MATRIX

### 4.1 Inherited Styling

From `11_ABSTRACT §4.2`: `bg_color`, `heading_size`, `heading_align`.
**Defaults for this section:** `BG_LIGHT_GREY` (`#0000000A`) / `SIZE_S` / `ALIGN_CENTER`.

| Attribute Name | Data Type | Required | Default Value | Status | Description & Constraints |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `bg_color` | `ColorValue` | Yes | `#0000000A` | `BUILT` | The 4%-black tint, so the strip separates from the white sections around it without introducing a new colour. |
| `heading_size` | `Enum<String>` | Yes | `SIZE_S` | `BUILT` | Segmented S/M/L; read by `.sec-title`. |
| `heading_align` | `Enum<String>` | Yes | `ALIGN_CENTER` | `BUILT` | Left / Center. |

### 4.2 Section Header (Content group)

| Attribute Name | Data Type | Required | Default Value | Status | Description & Constraints |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `section_title` | `String` | No | Preset | `BUILT` | Hidden when empty. |
| `subheading` | `RichText` | No | `null` | `BUILT` | `RT_FULL`. Hidden when empty. Both empty → the header wrapper is not emitted at all. |

### 4.3 Logo Collection (own group, between Content and Appearance)

| Attribute Name | Data Type | Required | Default Value | Status | Description & Constraints |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `logos` | `Array<LogoItem>` | **Yes** | 6 preset entries | `BUILT` | `min: 1`. Panel help: *four to twelve reads best — fewer never triggers the ticker, more just doubles the DOM.* Advisory only; the only enforced bound is §6.2. |
| `logos[].file` | `Media` | No | `null` | `BUILT` | `decorative: true`, so the control offers no alt input of its own — the row's own `alt` field carries it. SVG or PNG. An empty slot renders a compact `36px` placeholder chip. |
| `logos[].alt` | `String` | No | Preset name | `BUILT` | Help: *leave empty for a purely decorative mark.* Empty alt renders `alt=""`, which is what a screen reader needs to skip a decorative brand mark. Also used as the repeater row's title. |
| `logos[].href` | `String` | No | `""` | `BUILT` | Optional. A logo with a link renders as `<a>`, one without as `<span>`. |

### 4.4 Appearance

| Attribute Name | Data Type | Required | Default Value | Status | Description & Constraints |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `speed` | `Integer` | Yes | `30` | `BUILT` | **Lives in the Appearance group**, beside `bg_color` — it changes how the section looks, not what it says. Seconds per full cycle, range `10..90`, clamped again at render (`Math.min(90, Math.max(10, …))`). Published as the inline custom property `--mq-speed`. Only has an effect once the ticker activates (§6.1). |

* **CSS asset constraints:**
  * **Height:** fixed at **`36px`** (`height:36px`), placeholders included.
  * **Width:** proportional (`width:auto; object-fit:contain`).
  * **Horizontal gap:** **`64px`** between logos (`.mq-track{gap:64px}`) — not the `48px`
    v1 specified.

---

## 5. DEFAULT BOILERPLATE PRESET PAYLOAD (SEED DATA)

Verbatim from `defaults` in `src/sections/logo-marquee.js`. The six entries are generated
from a name list, so each seeds **alt text only** — no asset ships with the preset.

```yaml
default_preset_payload:
  bg_color: "#0000000A"          # BG_LIGHT_GREY
  heading_size: "SIZE_S"
  heading_align: "ALIGN_CENTER"
  section_title: "Direct contracts with world-leading carriers"
  subheading: null
  speed: 30
  logos:
    - { file: null, alt: "Emirates",           href: "" }
    - { file: null, alt: "Qatar Airways",      href: "" }
    - { file: null, alt: "Singapore Airlines", href: "" }
    - { file: null, alt: "British Airways",    href: "" }
    - { file: null, alt: "Lufthansa",          href: "" }
    - { file: null, alt: "Air France",         href: "" }
```

---

## 6. BUSINESS RULES & SYSTEM GUARDS (IF -> THEN)

1. **Automated Marquee vs. Static Row Detection (core runtime invariant) — `BUILT`**
   - **MEASUREMENT:** for every `[data-marquee]` box the runtime compares the track's
     `scrollWidth` against the box's `clientWidth + 1` (the 1px slack keeps sub-pixel
     rounding from flapping the state).
   - **IF** the track fits:
     - **THEN** the row stays static and centred: `.mq-track{display:flex; gap:64px;
       align-items:center; justify-content:center}`, with the box clipping at
       `overflow:hidden`. No animation, no clone.
   - **IF** the track overflows **and** motion is allowed:
     - **THEN** the box gains `.is-marquee`: the track switches to
       `justify-content:flex-start; width:max-content` and runs
       `animation: mq-scroll linear infinite` for `var(--mq-speed, 30s)`.
     - **THEN** the track's `innerHTML` is duplicated **once** (guarded by
       `dataset.cloned`), and the keyframe translates from `0` to `-50%` — the clone is what
       makes the loop seamless.
     - **THEN** hovering the box pauses it: `.mq.is-marquee:hover .mq-track
       {animation-play-state:paused}`.
   - **Re-measurement:** the same function is bound to `window.resize`, so a viewport change
     can promote a static row to a ticker and demote it back. The clone, once made, is kept.

2. **Mandatory Minimum Asset Guard (L1, `E101`) — `BUILT`**
   - **IF** `logos.length === 0`:
     - **THEN** publishing is blocked: *"Logo showcase requires at least 1 logo."*
   - Note what is **not** checked: an entry with `file: null` passes. The seed itself is six
     such entries, so a freshly inserted marquee publishes as six placeholder chips.
   - The 4–12 recommendation is editor help text, not a guard.

3. **Reduced-Motion Override (mandatory) — `BUILT`**
   - **IF** `matchMedia('(prefers-reduced-motion: reduce)')` matches:
     - **THEN** the ticker **never** animates. An overflowing track gets `.is-scroll`
       instead of `.is-marquee` — `overflow-x:auto`, a horizontally scrollable row — and the
       clone is not made.
   - Continuous motion is a vestibular trigger; this is an accessibility requirement, not a
     preference. The base stylesheet additionally flattens every animation and transition
     under the same query.

4. **Asset Height Normalization — `BUILT`**
   - Every logo is clamped to `36px` tall with `width:auto; object-fit:contain`, so an SVG
     with an arbitrary viewBox cannot change the strip's height. Items are
     `flex: 0 0 auto` — the row never squeezes a logo to make things fit; it overflows, and
     overflowing is what turns on the ticker.

5. **Link Handling — `BUILT`**
   - A logo with `href` renders as `<a class="mq-item" href="…" target="_blank"
     rel="noopener noreferrer">`. **Every** linked logo gets those attributes, regardless of
     whether the URL is external — this section does not use the shared `ctaLink()` test
     (doc 38 §6.2), it hardcodes them. A partner logo linking to a partner's site is the
     only case the field exists for.

6. **Container & Rhythm — `BUILT`**
   - `.mq-sec{padding:40px 0}` and `.mq-sec .wrap{max-width:1280px; padding:0 80px}` — half
     the vertical rhythm of a content section, because this is a strip and not a chapter.
   - **`≤767px`:** falls back to `--section-y` / `--container` / `--gutter`.
