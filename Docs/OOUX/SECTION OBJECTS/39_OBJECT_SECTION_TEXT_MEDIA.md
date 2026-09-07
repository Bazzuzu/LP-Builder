# `39_OBJECT_SECTION_TEXT_MEDIA.md`

```yaml
METACLASS: CONCRETE_OBJECT
OBJECT_ID: OBJ-39-TEXT-MEDIA
VERSION: 1.1.0
STATUS: APPROVED
DEPENDS_ON: SYS-02-ENUMS
INHERITS_FROM: OBJ-11-DYNAMIC-SECTION-BASE
STRUCTURAL_ROLE: DYNAMIC_CONTENT_MODULE
TARGET_AUDIENCE: [LLM_AGENT, BACKEND_DEV, FRONTEND_DEV, UI_DESIGNER]
```

---

## 1. OBJECT DEFINITION
A versatile editorial split-screen component pairing structured narrative copy with flexible visual assets. Supports three media density modes (**No Photo**, **1 Photo**, or **2 Photos**), horizontal column repositioning (**Media Left** vs. **Media Right**), rich typographic formatting (lists, links), and an optional Call-to-Action button.

---

## 2. RELATIONSHIPS (OOUX ORCA MAPPING)

- **Inherits From (Parent):** `11_ABSTRACT_OBJECT_DYNAMIC_SECTION` (Inherits `section_id`, `slot_index`, `order_in_slot`, `anchor_id`, `position_type: 'Custom'`, `is_mandatory: false`, `is_visible: true`, styling tokens).
- **Belongs To (N:1):** `OBJECT_LANDING_PAGE`.
- **Multiplicity / Instance Limit:** **Unbounded (0..N)** — Can be inserted multiple times per page with independent content and alternating column layouts.
- **Permitted Slots:** Dynamic Slots `01`, `03`, `05`.

---

## 3. OBJECT LIFECYCLE & ADMIN CTAs

Standard dynamic-section lifecycle — `11_ABSTRACT §3` (Insert, Edit, Duplicate, Reorder,
Delete, Toggle Visibility). Insert auto-populates the preset payload in §5.

| Section-specific CTA | System Behavior |
| :--- | :--- |
| **Switch Media Mode** | `No Photo` / `1 Photo` / `2 Photos`; mounts and unmounts uploaders. |
| **Switch Media Side** | Swaps the column order (`Left` <-> `Right`). Hidden when `media_mode === 'No Photo'`. |

---

## 4. ATTRIBUTES MATRIX

### 4.1 Inherited Styling
From `11_ABSTRACT §4.2`: `bg_color`, `heading_size`, `heading_align`.
**Defaults for this section:** `BG_WHITE` / `SIZE_M` / `ALIGN_LEFT`.

### 4.2 Media Layout & Positioning Configuration

| Attribute Name | Data Type | Required | Default Value | Description & Constraints |
| :--- | :--- | :--- | :--- | :--- |
| `media_mode` | `Enum` | Yes | `'1 Photo'` | [`No Photo`, `1 Photo`, `2 Photos`]. Dictates media column rendering. |
| `media_side` | `Enum` | Yes | `'Right'` | [`Left`, `Right`]. Side of the media column. Same control name as Quick Facts. |
| `image_single` | `File` | If `1 Photo` | `null` | Formats: `JPG`, `PNG`, `WebP`. Square or editorial aspect ratio (**1:1**). |
| `image_large` | `File` | If `2 Photos` | `null` | Formats: `JPG`, `PNG`, `WebP`. Primary featured image in dual stack. |
| `image_small` | `File` | If `2 Photos` | `null` | Formats: `JPG`, `PNG`, `WebP`. Secondary overlapping/adjacent thumbnail. |

---

### 4.3 Narrative Editorial Content

| Attribute Name | Data Type | Required | Default Value | Description & Constraints |
| :--- | :--- | :--- | :--- | :--- |
| `section_title` | `String` | **Yes** | `None` | **MANDATORY.** Primary section headline, always alone in its own column. |
| `paragraph` | `RichText` | **Yes** | `None` | **MANDATORY.** Supports: **Bold**, *Italic*, Bullet lists (`ul`), Numbered lists (`ol`), Hyperlinks, and Line breaks. |

---

### 4.4 Call-to-Action (CTA) Button Configuration (Optional)

| Attribute Name | Data Type | Required | Default Value | Description & Constraints |
| :--- | :--- | :--- | :--- | :--- |
| `show_cta_button` | `Boolean` | Yes | `false` | Master toggle to enable/disable the CTA button. |
| `cta_label` | `String` | If enabled | `"Learn More"` | Button label text. |
| `cta_url` | `String` | If enabled | `"#lead-modal"` | Navigation destination (supports URLs, paths, or `#lead-modal`). |

---

## 5. DEFAULT BOILERPLATE PRESET PAYLOAD (SEED DATA)

```yaml
default_preset_payload:
  bg_color: "BG_WHITE"
  heading_size: "SIZE_M"
  heading_align: "ALIGN_LEFT"
  media_mode: "1 Photo"
  media_side: "Right"
  image_single: "preset_business_class_lounge.webp"
  section_title: "Seamless Airport Sanctuary"
  paragraph: "Escape terminal congestion with complimentary access to flagship business class lounges worldwide. Enjoy quiet workspaces, private shower suites, and à la carte dining prior to departure."
  show_cta_button: true
  cta_label: "Inquire With Concierge"
  cta_url: "#lead-modal"
```

---

## 6. BUSINESS RULES & SYSTEM GUARDS (IF -> THEN)

1. **"No Photo" — Second Column Repurposed, Not Removed:**
   - **IF** `media_mode === 'No Photo'`:
     - **THEN** the layout stays two columns: `section_title` alone occupies the first column
       (top-aligned, generous whitespace below it is expected — nothing else shares that
       column), and `paragraph` + the CTA move into the second column, in the
       slot the media would otherwise occupy.
     - **THEN** The `media_side` control is hidden/disabled in the admin UI — there is no
       media to reposition.
   - *(Revised: the previous rule collapsed to one full-width column clamped at 780px. That
     made "No Photo" the odd one out — every other mode kept the two-column rhythm. The
     title now always keeps a column of its own, whether or not there is a photo.)*

2. **Image Requirement Invariant (L1, `E101`):**
   - **IF** `media_mode === '1 Photo'` AND `image_single` or its `alt` is empty:
     - **THEN** publishing is blocked: `"Please upload an image with alt text for the 1-Photo layout."`
   - **IF** `media_mode === '2 Photos'` AND either image or its `alt` is empty:
     - **THEN** publishing is blocked: `"Please upload both images with alt text."`
   - Images belonging to an inactive `media_mode` are retained and not validated
     (`11_ABSTRACT §6.2`), so switching modes never destroys an upload.

3. **Horizontal Layout Positioning:**
   - **IF** `media_side === 'Left'`:
     - **THEN** Desktop CSS grid orders: `[Media Column (Left)] [Text Column (Right)]`.
   - **IF** `media_side === 'Right'`:
     - **THEN** Desktop CSS grid orders: `[Text Column (Left)] [Media Column (Right)]`.

4. **Mobile Responsive Stacking Invariant:**
   - **ON VIEWPORTS < 768px:** Regardless of whether `media_side` is `Left` or `Right`, the frontend always stacks elements vertically in visual storytelling order:  
     `[Title] -> [Media (if active)] -> [Paragraph] -> [CTA Button]`.

5. **CTA Button Field Prerequisite (L1):**
   - **IF** `show_cta_button === true`:
     - **THEN** both `cta_label` and `cta_url` are mandatory before publishing, and `cta_url`
       resolves per doc 38 §6.2 (`#lead-modal`, an `anchor_id`, a path, or an external URL).
