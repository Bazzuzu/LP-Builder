# `51_OBJECT_MEDIA_CARD_ITEM.md`

```yaml
METACLASS: CONCRETE_OBJECT
OBJECT_ID: OBJ-51-MEDIA-CARD-ITEM
VERSION: 1.1.0
STATUS: APPROVED
DEPENDS_ON: SYS-02-ENUMS
INHERITANCE: CHILD_EMBEDDED_ENTITY
PARENT_ENTITY: OBJ-37-MULTI-CARD-GRID
TARGET_AUDIENCE: [LLM_AGENT, BACKEND_DEV, FRONTEND_DEV, UI_DESIGNER]
```

---

## 1. OBJECT DEFINITION
A child entity representing an individual visual card within a `37_OBJECT_SECTION_MULTI_CARD_GRID`. Houses a mandatory visual asset paired with optional editorial text (headline and descriptive copy). Its text validity is governed by a sibling consistency rule enforced by the parent container.

---

## 2. RELATIONSHIPS (OOUX ORCA MAPPING)

- **Belongs To (N:1):** `37_OBJECT_SECTION_MULTI_CARD_GRID` (Cannot exist as an independent entity outside of its parent grid container).
- **Sibling Co-dependency:** Bound to adjacent `51_OBJECT_MEDIA_CARD_ITEM` instances for "All-or-Nothing" text consistency validation.

---

## 3. OBJECT LIFECYCLE & ADMIN CTAs

| Action (CTA) | Admin UI Location | System Behavior |
| :--- | :--- | :--- |
| **Instantiate** | Parent Section Inspector | Mounted automatically when parent `card_count` is set to `2`, `3`, or `4`. |
| **Upload Image** | Card Inspector Panel | Uploads or replaces primary visual media asset. |
| **Edit Copy** | Card Inspector Panel | Edits `title` and `paragraph` fields. |
| **Reorder** | Parent Card List (Drag Handle) | Swaps horizontal sequence with sibling cards in the grid. |
| **Deactivate / Delete** | Parent `card_count` Selector | Becomes inactive when the parent grid count is reduced. Content is kept in the persisted section document (not volatile UI state) and restored on switch-back (`37 §6.3`). |

---

## 4. ATTRIBUTES MATRIX

| Attribute Name | Data Type | Required | Default Value | Description & Constraints |
| :--- | :--- | :--- | :--- | :--- |
| `card_id` | `UUIDv4` | Yes | `AUTO_GEN` | Unique identifier for instance state tracking. |
| `image` | `File` | **Yes** | `None` | **MANDATORY.** Formats: `JPG`, `PNG`, `WebP`. Displayed with `object-fit: cover`. |
| `image_alt` | `String` | **Yes** | `None` | **MANDATORY** — a grid card is content imagery, not decoration (`SYS-02-ENUMS §6`). |
| `title` | `String` | No | `null` | Optional card headline. Subject to sibling consistency invariant. |
| `paragraph` | `RichText` | No | `null` | Optional descriptive copy. Subject to sibling consistency invariant. |

---

## 5. BUSINESS RULES & SYSTEM GUARDS (IF -> THEN)

1. **Mandatory Visual Asset Guard (L1, `E101`):**
   - **IF** this card is **active** and `image === null` or `image_alt` is empty:
     - **THEN** the parent section blocks publishing:  
       `"Card [Index] requires an image with alt text."`
   - Inactive cards (index beyond the parent's `card_count`) are retained but never validated.

2. **Parent-Enforced "All-or-Nothing" Sibling Text Invariant:**
   - **IF** THIS card contains a non-empty `title` OR `paragraph`:
     - **THEN** ALL sibling cards active within the parent grid MUST also have both `title` and `paragraph` filled.
   - **IF** Sibling cards do NOT have text:
     - **THEN** The parent section validation flags an error on save.

3. **Responsive Geometry Adaptation:**
   - **Card Height / Aspect Ratio:** Inherits responsive aspect behavior from parent CSS grid configuration. Images render with `object-fit: cover; width: 100%;` to maintain vertical alignment with adjacent sibling cards regardless of original uploaded image aspect ratios.
