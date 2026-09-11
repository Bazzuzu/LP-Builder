# `38_OBJECT_SECTION_LARGE_IMAGE_BANNER.md`

```yaml
METACLASS: CONCRETE_OBJECT
OBJECT_ID: OBJ-38-LARGE-IMAGE-BANNER
VERSION: 2.0.0
STATUS: APPROVED
DEPENDS_ON: SYS-02-ENUMS
INHERITS_FROM: OBJ-11-DYNAMIC-SECTION-BASE
STRUCTURAL_ROLE: DYNAMIC_CONTENT_MODULE
SOURCE_OF_TRUTH: src/sections/large-image-banner.js, src/render/html.js, src/render/runtime.js
TARGET_AUDIENCE: [LLM_AGENT, BACKEND_DEV, FRONTEND_DEV, UI_DESIGNER]
```

---

## 1. OBJECT DEFINITION

A visual-first interim call-to-action block: a full-width 21:9 featured image, a large
headline below it, supporting rich text, and one button. Used for interim CTAs, destination
spotlights and seasonal campaign features between two denser content sections.

The button is **unconditional** — this section is a call to action, so there is no "show
button" toggle to turn the point of it off.

---

## 2. RELATIONSHIPS (OOUX ORCA MAPPING)

- **Inherits From (Parent):** `11_ABSTRACT_OBJECT_DYNAMIC_SECTION` (inherits `section_id`,
  `slot_index`, `order_in_slot`, `anchor_id`, `position_type: 'Custom'`,
  `is_mandatory: false`, `is_visible: true`, styling tokens).
- **Belongs To (N:1):** `OBJECT_LANDING_PAGE`.
- **Multiplicity / Instance Limit:** **Unbounded (0..N)** — independent media, copy and CTA
  link per instance.
- **Permitted Slots:** Dynamic slots `01`, `03`, `05`.
- **Library Group:** `content` ("Content sections").
- **Opens (Optional):** `21_OBJECT_FLIGHT_QUOTE_MODAL`, when `cta.href` is `#lead-modal`.
  The mechanism is a delegated click handler on the anchor itself — see §6.2. There is no
  `OPEN_FLIGHT_QUOTE_MODAL` event anywhere in the system; v1 described one that was never
  built and is not planned.

---

## 3. OBJECT LIFECYCLE & ADMIN CTAs

Standard dynamic-section lifecycle — `11_ABSTRACT §3` (Insert, Edit, Duplicate, Reorder,
Delete, Toggle Visibility). Insert auto-populates the preset payload in §5.

| Section-specific CTA | System Behavior |
| :--- | :--- |
| **Upload Featured image** | Replaces the banner asset; alt text is edited in the same control. The Media group opens by default here — the image is the section. |
| **Edit Button** | The "Button" group holds `Label` and `Link`. No switch above them: the pair is always present. |

---

## 4. ATTRIBUTES MATRIX

### 4.1 Inherited Styling

From `11_ABSTRACT §4.2`: `bg_color`, `heading_size`, `heading_align`.
**Defaults for this section:** `#FFFFFF` (`BG_WHITE`) / `SIZE_L` / `ALIGN_CENTER`.

| Attribute Name | Data Type | Required | Default Value | Status | Description & Constraints |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `bg_color` | `ColorValue` | Yes | `#FFFFFF` | `BUILT` | Three brand presets first, free value allowed. |
| `heading_size` | `Enum<String>` | Yes | `SIZE_L` | `BUILT` | Segmented S/M/L; read by `.sec-title` through the wrapper class. |
| `heading_align` | `Enum<String>` | Yes | `ALIGN_CENTER` | `BUILT` | Centring applies to the header **and** the CTA below it, since `.sec.a-center` sets `text-align:center` for the whole section. |

### 4.2 Content & Media

| Attribute Name | Data Type | Required | Default Value | Status | Description & Constraints |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `section_title` | `String` | **Yes** | Preset | `BUILT` | `required: true`; `E100` when blank. |
| `subheading` | `RichText` | No | Preset | `BUILT` | `RT_FULL`. Hidden when empty. |
| `featured_image` | `Media` | **Yes** | `null` | `BUILT` | Panel hint: *JPG, PNG or WebP. High resolution.* `E101` when no asset. Rendered with `loading="eager"` — it is above the fold often enough that lazy-loading it costs more than it saves. |
| `featured_image.alt` | `String` | No | Filename guess | `BUILT` | Edited inside the image control. **Does not block publishing** (`_common.needMedia`, system-wide). |

### 4.3 Call-to-Action

The CTA is **one object**, `cta`, not the flat `cta_label` / `cta_url` pair v1 described.
Built with `ctaGroup('cta', { toggle: false })`, so it has no `on` member at all.

| Attribute Name | Data Type | Required | Default Value | Status | Description & Constraints |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `cta.label` | `String` | **Yes** | `"Request a custom itinerary"` | `BUILT` | Labelled **Label**. `E100` when blank — and a blank label also suppresses the anchor entirely in `ctaLink()`, so an unpublishable section renders as no button rather than an empty one. |
| `cta.href` | `String` | **Yes** | `"#lead-modal"` | `BUILT` | Labelled **Link**. Panel help: *relative path, absolute URL, or `#lead-modal` to open the lead form.* `E100` when blank; `ctaLink()` falls back to `#lead-modal` if it is missing at render time. |
| `cta.on` | — | — | — | `BUILT` | **Does not exist here.** `toggle: false` drops the switch; compare doc 39, where the same helper keeps it. |

---

## 5. DEFAULT BOILERPLATE PRESET PAYLOAD (SEED DATA)

Verbatim from `defaults` in `src/sections/large-image-banner.js`.

```yaml
default_preset_payload:
  bg_color: "#FFFFFF"
  heading_size: "SIZE_L"
  heading_align: "ALIGN_CENTER"
  section_title: "Unrivalled comfort across the Atlantic"
  subheading: "<p>Secure exclusive business class fares with concierge-backed flexibility.</p>"
  featured_image: null
  cta:
    label: "Request a custom itinerary"
    href: "#lead-modal"
```

---

## 6. BUSINESS RULES & SYSTEM GUARDS (IF -> THEN)

1. **Mandatory Field Invariants (L1, `E100` / `E101`) — `BUILT`**
   - **IF** `section_title`, `cta.label` or `cta.href` is blank → `E100` on that path.
   - **IF** `featured_image` has no asset → `E101` on `featured_image`.
   - **THEN** publishing is blocked; the draft still saves.
   - Alt text is **not** part of this guard (see §4.2).

2. **CTA Action Resolution — `BUILT`**
   - Every CTA renders as a plain `<a class="btn" href="…">`. Nothing is special-cased at
     build time.
   - **IF** `href === '#lead-modal'`:
     - **THEN** the published page's runtime handles it. A single delegated `click` listener
       on `document` matches `a[href="#lead-modal"], [data-lead-open]` via
       `Element.closest`, calls `preventDefault()`, remembers the trigger, and reveals the
       `#lead-modal` dialog (`modal.hidden = false`), locking body scroll and focusing the
       first field. `Escape`, a click on the backdrop, or a `[data-lead-close]` control
       closes it and returns focus to the trigger.
     - The handler reads `data-destination` and `data-cabin` from the trigger to prefill the
       form. **This section emits neither**, so its CTA opens the modal empty — unlike a
       Prices row (doc 31), which carries both.
     - No custom event is dispatched. `OPEN_FLIGHT_QUOTE_MODAL` does not exist.
   - **IF** `href` matches `^https?://` (any absolute URL, same domain or not):
     - **THEN** the anchor renders with `target="_blank" rel="noopener noreferrer"`.
       `noopener` is a security control, not a recommendation. Note the test is the scheme
       alone — an absolute URL pointing back at this very site is treated as external too.
   - **IF** `href` starts with `#` and is not `#lead-modal`:
     - **THEN** it is emitted as an ordinary in-page fragment and the browser scrolls to it
       (`html{scroll-behavior:smooth}`). **Nothing checks that a section with that
       `anchor_id` exists.** — `PLANNED` (v1 §6.2 specified an L2 guard; no L2 rule for
       fragments is implemented).

3. **DOM Order — `BUILT`**
   - Media **first**, then the header, then the CTA. `dynamicShell` is called with
     `withHeader: false` and the header is re-emitted below the image with the shared
     `sectionHeader()` builder — so the empty-header suppression rule
     (`11_ABSTRACT §5.1`) behaves exactly as it does everywhere else.

4. **Container & Responsive Fit — `BUILT`**
   - This section declares **no container override**. It uses the shared shell:
     `.sec{padding:var(--section-y) 0}` and `.wrap{max-width:var(--container); padding:0
     var(--gutter)}` — `1180px` / `24px`, not the `1280px` / `80px` the heavier sections
     (Prices, Feature, FAQ, Story & Specs, Multi-Card Grid) set for themselves.
   - Media: `border-radius:16px`, clipped, `32px` below it; the image is
     `aspect-ratio: 21/9`, `object-fit: cover`, full width. The placeholder holds the same
     21:9 box.
   - CTA: `24px` below the header.
   - **Mobile (`<768px`):** the 21:9 ratio is dropped for a fixed `height: 280px` (both for
     the image and the placeholder), so a widescreen crop does not collapse to a letterbox
     strip on a phone.
