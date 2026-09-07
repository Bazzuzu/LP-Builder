# `38_OBJECT_SECTION_LARGE_IMAGE_BANNER.md`

```yaml
METACLASS: CONCRETE_OBJECT
OBJECT_ID: OBJ-38-LARGE-IMAGE-BANNER
VERSION: 1.1.0
STATUS: APPROVED
DEPENDS_ON: SYS-02-ENUMS
INHERITS_FROM: OBJ-11-DYNAMIC-SECTION-BASE
STRUCTURAL_ROLE: DYNAMIC_CONTENT_MODULE
TARGET_AUDIENCE: [LLM_AGENT, BACKEND_DEV, FRONTEND_DEV, UI_DESIGNER]
```

---

## 1. OBJECT DEFINITION
A high-impact, visual-first editorial banner block. Designed for interim call-to-actions, destination spotlights, or seasonal campaign features. Combines a prominent high-resolution featured image with a large-scale title (`SIZE_L`), supporting rich-text narrative, and an interactive Call-to-Action (CTA) button.

---

## 2. RELATIONSHIPS (OOUX ORCA MAPPING)

- **Inherits From (Parent):** `11_ABSTRACT_OBJECT_DYNAMIC_SECTION` (Inherits `section_id`, `slot_index`, `order_in_slot`, `anchor_id`, `position_type: 'Custom'`, `is_mandatory: false`, `is_visible: true`, styling tokens).
- **Belongs To (N:1):** `OBJECT_LANDING_PAGE`.
- **Multiplicity / Instance Limit:** **Unbounded (0..N)** — Can be inserted multiple times per page with completely independent media, copy, and CTA links.
- **Permitted Slots:** Dynamic Slots `01`, `03`, `05`.
- **Triggers (Optional Event):** Dispatches `OPEN_FLIGHT_QUOTE_MODAL` if CTA URL is configured as `#lead-modal`.

---

## 3. OBJECT LIFECYCLE & ADMIN CTAs

Standard dynamic-section lifecycle — `11_ABSTRACT §3` (Insert, Edit, Duplicate, Reorder,
Delete, Toggle Visibility). Insert auto-populates the preset payload in §5.

---

## 4. ATTRIBUTES MATRIX

### 4.1 Inherited Styling
From `11_ABSTRACT §4.2`: `bg_color`, `heading_size`, `heading_align`.
**Defaults for this section:** `BG_WHITE` / `SIZE_L` / `ALIGN_CENTER`.

### 4.2 Content & Media Attributes

| Attribute Name | Data Type | Required | Default Value | Description & Constraints |
| :--- | :--- | :--- | :--- | :--- |
| `featured_image` | `File` | **Yes** | `None` | **MANDATORY.** Formats: `JPG`, `PNG`, `WebP`. High-resolution featured banner asset. |
| `section_title` | `String` | **Yes** | `None` | **MANDATORY.** Primary editorial headline. |
| `subheading` | `RichText` | No | `null` | Optional supporting description (supports bold, italic, links). |

---

### 4.3 Call-to-Action (CTA) Button Configuration

| Attribute Name | Data Type | Required | Default Value | Description & Constraints |
| :--- | :--- | :--- | :--- | :--- |
| `cta_label` | `String` | **Yes** | `"Explore Destinations"` | Button label text. |
| `cta_url` | `String` | **Yes** | `"#lead-modal"` | Target destination. Supports external URLs, internal relative paths, or `#lead-modal`. |

---

## 5. DEFAULT BOILERPLATE PRESET PAYLOAD (SEED DATA)

```yaml
default_preset_payload:
  bg_color: "BG_WHITE"
  heading_size: "SIZE_L"
  heading_align: "ALIGN_CENTER"
  featured_image: "preset_transatlantic_cabin.webp"
  section_title: "Unrivaled Comfort Across the Atlantic"
  subheading: "Secure exclusive bespoke business class fares with concierge-backed booking flexibility."
  cta_label: "Request A Custom Itinerary"
  cta_url: "#lead-modal"
```

---

## 6. BUSINESS RULES & SYSTEM GUARDS (IF -> THEN)

1. **Mandatory Field Invariants (L1, `E100`/`E101`):**
   - **IF** `featured_image`, `featured_image_alt`, `section_title`, `cta_label`, OR `cta_url`
     is empty:
     - **THEN** publishing is blocked:  
       `"Large Image Banner requires an Image with alt text, a Title, a CTA Label and a CTA Link."`

2. **CTA Action Resolution:**
   - **IF** `cta_url === '#lead-modal'`:
     - **THEN** Clicking the button intercepts standard browser navigation and dispatches the global `OPEN_FLIGHT_QUOTE_MODAL` event (hydrated with default page route parameters).
   - **IF** `cta_url` starts with `http://` OR `https://` and points to another domain:
     - **THEN** the link renders with `target="_blank" rel="noopener noreferrer"` (required, not
       recommended — `noopener` is a security control, not a preference).
   - **IF** `cta_url` starts with `#`:
     - **THEN** it must be `#lead-modal` or an existing `anchor_id` on the same page; any other
       fragment fails L2 validation.

3. **Responsive Visual Container Fit:**
   - **DESKTOP ($\ge 1024px$):** Renders as an expansive widescreen banner container with high-impact editorial margins.
   - **MOBILE ($< 768px$):** Media adapts via `object-fit: cover` with a minimum mobile height of `280px` to prevent layout collapse.
