# `11_ABSTRACT_OBJECT_DYNAMIC_SECTION.md`

```yaml
METACLASS: ABSTRACT_OBJECT
OBJECT_ID: OBJ-11-DYNAMIC-SECTION-BASE
VERSION: 1.1.0
STATUS: APPROVED
INHERITS_FROM: OBJ-10-BASE-SECTION
DEPENDS_ON: SYS-02-ENUMS, SYS-01-TOKENS
TARGET_AUDIENCE: [LLM_AGENT, BACKEND_DEV, FRONTEND_DEV, ARCHITECT]
```

---

## 1. OBJECT DEFINITION
The abstract base entity for all modular, repeatable, and customizable content blocks. Extends `10_ABSTRACT_OBJECT_PAGE_SECTION` by adding universal styling controls (background colors, heading scales, alignment) and enabling multi-instance duplication.

---

## 2. RELATIONSHIPS (OOUX ORCA MAPPING)

- **Inherits From (Parent):** `10_ABSTRACT_OBJECT_PAGE_SECTION` (Inherits `section_id`, `slot_index`, `order_in_slot`, `anchor_id`, `is_visible`, `created_at`).
- **Belongs To (N:1):** `OBJECT_LANDING_PAGE`.
- **Specialized By (Concrete Children):**
  - `36_OBJECT_SECTION_QUICK_FACTS`
  - `37_OBJECT_SECTION_MULTI_CARD_GRID`
  - `38_OBJECT_SECTION_LARGE_IMAGE_BANNER`
  - `39_OBJECT_SECTION_TEXT_MEDIA`
  - `40_OBJECT_SECTION_LOGO_MARQUEE`
  - `41_OBJECT_SECTION_FEATURE`

---

## 3. OBJECT LIFECYCLE & ADMIN CTAs

| Action (CTA) | Admin UI Location | System Behavior |
| :--- | :--- | :--- |
| **Insert** | Dynamic Section Catalog | Creates a new instance; auto-populates system defaults from Token Matrix. |
| **Duplicate / Clone** | Section Toolbar | Deep-copies all content fields into a **new instance** with a fresh `section_id`. |
| **Reorder (Up/Down)** | Section Toolbar / Drag Handle | Swaps position with neighboring sections inside dynamic slots. |
| **Delete** | Section Toolbar (Trash Icon) | Removes instance. Always permitted (`is_mandatory` is permanently `false`). |
| **Toggle Visibility** | Section Settings | Toggles `is_visible` flag (`true` / `false`). |

---

## 4. ATTRIBUTES MATRIX

### 4.1 Inherited Invariants (From Base Class)
* `position_type` = Always `'Custom'`
* `is_mandatory` = Always `false`

### 4.2 Shared Visual & Layout Attributes

| Attribute Name | Data Type | Required | Default Value | Description |
| :--- | :--- | :--- | :--- | :--- |
| `bg_color` | `ColorValue` | Yes | `BG_WHITE` | Free colour value **with three brand presets offered first**: `BG_WHITE`, `BG_LIGHT_GREY`, `BG_LIGHT_BRONZE` (`SYS-01-TOKENS §2`). Presets are the recommended path; a custom value is permitted and carries no validation beyond L2 colour format. |
| `heading_size` | Enum<String> | Yes | Subclass Default | [`SIZE_S`, `SIZE_M`, `SIZE_L`]. Scale bound to component. |
| `heading_align` | Enum<String> | Yes | Subclass Default | [`ALIGN_LEFT`, `ALIGN_CENTER`]. Horizontal justification. |

> **Column flipping is not a shared attribute.** Sections that have a media column declare
> **`media_side: 'Left' | 'Right'`** locally (docs 36 and 39). Sections without one declare nothing.

### 4.3 Shared Header Content Attributes

| Attribute Name | Data Type | Required | Default Value | Description |
| :--- | :--- | :--- | :--- | :--- |
| `section_title` | String | No | `null` | Primary heading. Single line. |
| `subheading` | RichText | No | `null` | Explanatory copy (supports bold, italic, strike, lists). |

---

## 5. BUSINESS RULES & SYSTEM GUARDS (IF -> THEN)

1. **Header Container Suppression:**
   - **IF** both `section_title === null` **AND** `subheading === null`:
     - **THEN** The entire header wrapper DOM container is **not rendered** on the frontend (no empty vertical spacing/margins).

2. **Heading Alignment Inheritance:**
   - **IF** Admin changes `heading_align` (e.g., switches from `ALIGN_LEFT` to `ALIGN_CENTER`):
     - **THEN** Both `section_title` and `subheading` automatically update their justification simultaneously. Independent alignment is forbidden.

3. **Multi-Instance Isolation:**
   - **IF** Admin adds multiple instances of the same component (e.g., two `SECTION_TEXT_MEDIA` blocks):
     - **THEN** Each instance operates with isolated state. Modifying `bg_color` or text in Instance A has zero effect on Instance B.

4. **Default Boilerplate Injection:**
   - **IF** Admin clicks «Add Section»:
     - **THEN** System must auto-fill `bg_color`, `heading_size`, and `heading_align` using the default values defined in `01_SYSTEM_GLOBAL_DESIGN_TOKENS.md`.

---

## 6. DEFAULT PRESET INJECTION CONTRACT (BOILERPLATE ENGINE)

Every concrete dynamic section MUST implement a predefined content payload schema. 

### Rules:
1. **Initial Insertion Trigger:**
   - **IF** Admin adds a dynamic section to the canvas:
     - **THEN** The system MUST NOT leave fields blank. It automatically injects the section's `default_preset_payload` (pre-filled title, mock descriptions, default SVG icons).

2. **Parameter Change Trigger (Configurable Sections) — NON-DESTRUCTIVE:**
   - **IF** A section changes a presentation parameter (Feature `has_paragraph`, Grid `card_count`):
     - **THEN** the system **migrates every field the target variant also has**, and only fills
       the remainder from the target preset. Admin-entered content is never overwritten by a
       preset value.
     - **THEN** fields the new configuration does not expose (a Feature `paragraph` once
       `has_paragraph` is off, cards 3–4 when a grid drops to `2`) are **retained in the
       persisted section document**, not deleted. Switching back restores them without re-entry.
     - **THEN** only genuinely empty fields receive preset defaults, preventing broken UI.
   - *Rationale: a variant switch is a presentation decision. Losing an hour of copywriting to
     one segmented-control click is never an acceptable outcome, and it made the policy here
     contradict the retention rule already specified for Multi-Card Grid (doc 37 §6.3).*

3. **Admin Customization Overrides:**
   - Preset values act purely as starter defaults. Once injected, all fields are fully mutable by the content manager.
