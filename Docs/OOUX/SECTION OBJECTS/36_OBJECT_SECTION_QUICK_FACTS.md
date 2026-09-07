# `36_OBJECT_SECTION_QUICK_FACTS.md`

```yaml
METACLASS: CONCRETE_OBJECT
OBJECT_ID: OBJ-36-QUICK-FACTS-SECTION
VERSION: 1.1.0
STATUS: APPROVED
DEPENDS_ON: SYS-02-ENUMS
INHERITS_FROM: OBJ-11-DYNAMIC-SECTION-BASE
STRUCTURAL_ROLE: DYNAMIC_CONTENT_MODULE
TARGET_AUDIENCE: [LLM_AGENT, BACKEND_DEV, FRONTEND_DEV, CONTENT_MANAGER]
```

---

## 1. OBJECT DEFINITION
An editorial storytelling block engineered primarily for route and destination landing pages. Combines narrative copy, structured takeaway metric cards (2 to 4 facts), and an asymmetric multi-image showcase gallery with strict responsive height constraints.

---

## 2. RELATIONSHIPS (OOUX ORCA MAPPING)

- **Inherits From (Parent):** `11_ABSTRACT_OBJECT_DYNAMIC_SECTION` (Inherits `section_id`, `slot_index`, `order_in_slot`, `anchor_id`, `position_type: 'Custom'`, `is_mandatory: false`, `is_visible: true`, styling tokens).
- **Belongs To (N:1):** `OBJECT_LANDING_PAGE` (Permitted in dynamic slots `01`, `03`, `05`).
- **Contains (2..4 Embedded):** Structured Fact Metric Cards (Cards 1 & 2 mandatory; Cards 3 & 4 optional).

---

## 3. OBJECT LIFECYCLE & ADMIN CTAs

Standard dynamic-section lifecycle — `11_ABSTRACT §3` (Insert, Edit, Duplicate, Reorder,
Delete, Toggle Visibility). Insert auto-populates the preset payload in §5.

---

## 4. ATTRIBUTES MATRIX

### 4.1 Inherited Styling
From `11_ABSTRACT §4.2`: `bg_color`, `heading_size`, `heading_align`.
**Defaults for this section:** `BG_WHITE` / `SIZE_M` / `ALIGN_LEFT`.

| Own attribute | Type | Required | Default | Values |
| :--- | :--- | :--- | :--- | :--- |
| `media_side` | `Enum` | Yes | `'Right'` | [`Left`, `Right`]. Which side the media grid sits on. |

### 4.2 Editorial Typography Group

| Attribute Name | Data Type | Required | Default Value | Description & Constraints |
| :--- | :--- | :--- | :--- | :--- |
| `section_title` | `String` | **Yes** | `None` | **MANDATORY.** Primary section headline. |
| `primary_paragraph`| `RichText`| **Yes** | `None` | **MANDATORY.** Lead introductory narrative. Supports bold, italic, links. |
| `secondary_paragraph`| `RichText`| No | `null` | Optional closing narrative placed beneath the metric cards. |

---

### 4.3 Structured Metric / Fact Cards (2 to 4 Cards)

| Card | Attribute Name | Data Type | Required | Default Value | Description & Constraints |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Card 1** | `card_1_title`<br>`card_1_paragraph` | `String`<br>`String` | **Yes**<br>**Yes** | Preset Def<br>Preset Def | **MANDATORY.** Headline metric.<br>Descriptive explanation. |
| **Card 2** | `card_2_title`<br>`card_2_paragraph` | `String`<br>`String` | **Yes**<br>**Yes** | Preset Def<br>Preset Def | **MANDATORY.** Headline metric.<br>Descriptive explanation. |
| **Card 3** | `card_3_title`<br>`card_3_paragraph` | `String`<br>`String` | No<br>No | `null`<br>`null` | **OPTIONAL.** Suppressed from DOM if blank. |
| **Card 4** | `card_4_title`<br>`card_4_paragraph` | `String`<br>`String` | No<br>No | `null`<br>`null` | **OPTIONAL.** Suppressed from DOM if blank. |

---

### 4.4 Media Showcase Grid (3 Images)

| Attribute Name | Data Type | Required | Supported Formats | Container Constraints |
| :--- | :--- | :--- | :--- | :--- |
| `upload_small_1` | `File` | **Yes** | `JPG`, `PNG`, `WebP` | Upper secondary thumbnail. |
| `upload_small_2` | `File` | **Yes** | `JPG`, `PNG`, `WebP` | Lower secondary thumbnail. |
| `upload_big` | `File` | **Yes** | `JPG`, `PNG`, `WebP` | Primary featured vertical banner. |

* **CSS Container Dimensions & Geometry:**
  * **Max Container Height:** `640px`
  * **Min Container Height:** `400px`
  * **Object Fit:** `object-fit: cover; width: 100%; height: 100%;` (Prevents layout distortion).

---

## 5. DEFAULT BOILERPLATE PRESET PAYLOAD (SEED DATA)

```yaml
default_preset_payload:
  bg_color: "BG_WHITE"
  heading_size: "SIZE_M"
  heading_align: "ALIGN_LEFT"
  media_side: "Right"
  section_title: "Flight Experience & Route Insights"
  primary_paragraph: "Discover premium cabin comfort, curated in-flight gastronomy, and seamless transit protocols designed for the discerning traveler."
  card_1:
    title: "7h 45m"
    paragraph: "Average direct flight duration between metropolitan hubs."
  card_2:
    title: "100% Lie-Flat"
    paragraph: "Guaranteed direct aisle access with premium bedding amenities."
  card_3: null
  card_4: null
  secondary_paragraph: null
  media_placeholders:
    upload_small_1: "default_cabin_seat.webp"
    upload_small_2: "default_dining.webp"
    upload_big: "default_aircraft_sky.webp"
```

---

## 6. BUSINESS RULES & SYSTEM GUARDS (IF -> THEN)

1. **Mandatory Content Validation (L1 — blocks publish, not save):**
   - **IF** `section_title`, `primary_paragraph`, Card 1, Card 2, or any of the 3 media files
     (or their `alt` text) is missing:
     - **THEN** publishing is blocked with `E100`/`E101`:
       `"Quick Facts requires a Title, Lead Paragraph, Cards 1 & 2, and all 3 images with alt text."`
     - The draft still saves (`SYS-02-ENUMS §4`).

2. **Optional Card — All-or-Nothing, Never Silent (L1):**
   - **IF** both `card_3_title` AND `card_3_paragraph` are empty:
     - **THEN** Card 3 is inactive and omitted; the grid reflows to the remaining cards.
   - **IF** exactly one of the two is filled:
     - **THEN** publishing is blocked with `E100` naming the empty field.
   - Identical logic applies to Card 4.

3. **Media Container Clamping Invariant:**
   - **THE MEDIA GRID CONTAINER HEIGHT MUST NEVER EXCEED 640PX NOR FALL BELOW 400PX:**
     - Responsive CSS enforces: `height: clamp(400px, 45vw, 640px);`. Images automatically crop via `object-fit: cover`.

4. **Horizontal Layout (`media_side`):**
   - **IF** `media_side === 'Right'`: Narrative copy Left, Media Grid Right.
   - **IF** `media_side === 'Left'`: Media Grid Left, Narrative copy Right.
   - **Mobile (`< 768px`):** always stacks `[Title] -> [Lead paragraph] -> [Media] -> [Cards] -> [Closing paragraph]`, regardless of `media_side`.
