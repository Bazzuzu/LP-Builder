# `37_OBJECT_SECTION_MULTI_CARD_GRID.md`

```yaml
METACLASS: CONCRETE_OBJECT
OBJECT_ID: OBJ-37-MULTI-CARD-GRID
VERSION: 1.1.0
STATUS: APPROVED
DEPENDS_ON: SYS-02-ENUMS
INHERITS_FROM: OBJ-11-DYNAMIC-SECTION-BASE
STRUCTURAL_ROLE: DYNAMIC_CONTENT_MODULE
TARGET_AUDIENCE: [LLM_AGENT, BACKEND_DEV, FRONTEND_DEV, UI_DESIGNER]
```

---

## 1. OBJECT DEFINITION
A modular showcase grid component supporting **2, 3, or 4 media cards**. Designed for luxury cabin features, partner highlights, or travel perks. Operates either as a pure visual image gallery or as structured content cards governed by an automated **All-or-Nothing Text Consistency Invariant**.

---

## 2. RELATIONSHIPS (OOUX ORCA MAPPING)

- **Inherits From (Parent):** `11_ABSTRACT_OBJECT_DYNAMIC_SECTION` (Inherits `section_id`, `slot_index`, `order_in_slot`, `anchor_id`, `position_type: 'Custom'`, `is_mandatory: false`, `is_visible: true`, styling tokens).
- **Belongs To (N:1):** `OBJECT_LANDING_PAGE` (Permitted in dynamic slots `01`, `03`, `05`).
- **Contains (2..4 Embedded Items):** `51_OBJECT_MEDIA_CARD_ITEM` (Child card entities).

---

## 3. OBJECT LIFECYCLE & ADMIN CTAs

Standard dynamic-section lifecycle — `11_ABSTRACT §3` (Insert, Edit, Duplicate, Reorder,
Delete, Toggle Visibility). Insert auto-populates the preset payload in §5.

| Section-specific CTA | System Behavior |
| :--- | :--- |
| **Switch Grid Count** | Segmented control `2` / `3` / `4`; mounts and unmounts card slots (§6.3). |

---

## 4. ATTRIBUTES MATRIX

### 4.1 Inherited Styling
From `11_ABSTRACT §4.2`: `bg_color`, `heading_size`, `heading_align`.
**Defaults for this section:** `BG_WHITE` / `SIZE_M` / `ALIGN_CENTER`.

### 4.2 Section Header Typography (Optional)

| Attribute Name | Data Type | Required | Default Value | Description & Constraints |
| :--- | :--- | :--- | :--- | :--- |
| `section_title` | `String` | No | `null` | Main section headline. Hidden if empty. |
| `subheading` | `RichText` | No | `null` | Explanatory sub-headline. Hidden if empty. |

---

### 4.3 Grid Layout & Card Array Configuration

| Attribute Name | Data Type | Required | Default Value | Description & Constraints |
| :--- | :--- | :--- | :--- | :--- |
| `card_count` | `Enum` | Yes | `3` | [`2`, `3`, `4`]. Dictates active card count and CSS grid columns. |
| `cards` | `Array<MediaCard>` | Yes | Array of 3 items | **Holds up to 4 items at all times.** `card_count` selects how many leading items are *active* — rendered and validated. Inactive items are retained, not deleted (§6.3). |

#### Child Card Schema (`MediaCard`):
* `image`: `File<'JPG' | 'PNG' | 'WebP'>` — **MANDATORY** for every active card.
* `title`: `String` — **OPTIONAL** (Subject to All-or-Nothing validation).
* `paragraph`: `RichText` — **OPTIONAL** (Subject to All-or-Nothing validation).

---

## 5. DEFAULT BOILERPLATE PRESET PAYLOAD (SEED DATA)

```yaml
default_preset_payload:
  bg_color: "BG_WHITE"
  heading_size: "SIZE_M"
  heading_align: "ALIGN_CENTER"
  section_title: "Curated In-Flight Excellence"
  subheading: "Experience uncompromising luxury across every stage of your transatlantic journey."
  card_count: 3
  cards:
    - image: "preset_dining.webp"
      title: "Michelin-Inspired Dining"
      paragraph: "Multi-course à la carte menus paired with sommelier-selected vintage champagnes."
    - image: "preset_bedding.webp"
      title: "Turn-Down Service"
      paragraph: "Full 180-degree lie-flat suites fitted with Italian cotton linens and luxury amenities."
    - image: "preset_lounge.webp"
      title: "Chauffeur & Lounge Access"
      paragraph: "Private terminal escorts and bespoke lounge sanctuary access worldwide."
```

---

## 6. BUSINESS RULES & SYSTEM GUARDS (IF -> THEN)

1. **Card Image Mandatory Invariant (L1, `E101`):**
   - **IF** Any **active** card has `image === null` or empty `image_alt`:
     - **THEN** publishing is blocked: `"Every card must contain an image with alt text."`
       Inactive cards (beyond `card_count`) are not validated.

2. **The "All-or-Nothing" Text Consistency Invariant:**
   - **THE GRID MUST BE EITHER 100% PURE IMAGES OR 100% CONTENT CARDS:**
   - **IF** Any single active card has `title` OR `paragraph` filled:
     - **THEN** The validation engine enforces that **ALL** remaining active cards (2, 3, or 4) MUST ALSO have both `title` and `paragraph` filled.
   - **IF** text is present in only some active cards:
     - **THEN** publishing is blocked (`E102`):  
       `"Text consistency violation: Either all cards must have text, or all cards must be image-only."`
     - Evaluated across **active** cards only, so reducing `card_count` can resolve the error.

3. **Card Count Switching Data Retention:**
   - **IF** Admin switches `card_count` from `4` down to `2`:
     - **THEN** Cards 3 and 4 become inactive: omitted from the DOM and skipped by validation,
       while their media and text stay in the **persisted section document** (not merely in
       volatile UI state — retention must survive reload, navigation and re-publish). Switching
       back to `4` restores them with no re-upload.

4. **Responsive Column Adaptation:**
   - **Desktop ($\ge 1024px$):** Renders in `2`, `3`, or `4` equal columns based on `card_count`.
   - **Tablet ($768px$ – $1023px$):** 4-card and 3-card grids collapse gracefully to a balanced `2x2` grid.
   - **Mobile ($< 768px$):** All grid variants collapse into a **single vertical stack**. *(The alternative swipe carousel is explicitly not built: it hides cards behind a gesture and the old "stack or carousel" wording would have shipped as two different components.)*
