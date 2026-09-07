# `52_OBJECT_FEATURE_ITEM.md`

```yaml
METACLASS: CONCRETE_OBJECT
OBJECT_ID: OBJ-52-FEATURE-ITEM
VERSION: 3.0.0
STATUS: APPROVED
DEPENDS_ON: SYS-02-ENUMS
INHERITS_FROM: CHILD_EMBEDDED_ENTITY
PARENT_ENTITY: OBJ-41-FEATURE-SECTION
TARGET_AUDIENCE: [LLM_AGENT, BACKEND_DEV, FRONTEND_DEV, UI_DESIGNER]
```

---

## 1. OBJECT DEFINITION
A unified child entity representing an individual perk, guarantee, or benefit item within `41_OBJECT_SECTION_FEATURE`. Its icon box and paragraph availability follow the parent's presentation parameters (`41 §4.3`).

---

## 2. RELATIONSHIPS (OOUX ORCA MAPPING)

- **Belongs To (N:1):** `41_OBJECT_SECTION_FEATURE` (Cannot exist outside of its parent Feature Section).
- **Parameter Adaptation:** shows or hides `paragraph` per the parent's `has_paragraph`, and sizes its `icon` container to the parent's `icon_size`.

---

## 3. OBJECT LIFECYCLE & ADMIN CTAs

| Action (CTA) | Admin UI Location | System Behavior |
| :--- | :--- | :--- |
| **Instantiate** | Parent Section Inspector | Mounted automatically per the parent's `item_count`. |
| **Upload Icon** | Item Inspector Panel | Uploads or replaces vector/raster icon (`SVG`, `PNG`). |
| **Edit Copy** | Item Inspector Panel | Edits `title` and (if active) `paragraph` copy. |
| **Reorder** | Parent Item List (Drag Handle) | Swaps sequence order with sibling feature items. |
| **Deactivate / Delete** | Parent `item_count` | Becomes inactive when the count drops; content stays in the persisted document and returns on the way back. |

---

## 4. ATTRIBUTES MATRIX

| Attribute Name | Data Type | Required | Default Value | Description & Constraints |
| :--- | :--- | :--- | :--- | :--- |
| `item_id` | `UUIDv4` | Yes | `AUTO_GEN` | Unique instance identifier. |
| `icon` | `File` | **Yes** | Preset Icon | Formats: `SVG` (preferred), `PNG`. Clamped to the parent's `icon_size` (`48` or `64` px). |
| `title` | `String` | **Yes** | Preset Title | Primary benefit headline; doubles as the bullet label when `has_paragraph === false`. One field name in every configuration. |
| `paragraph` | `RichText` | If `has_paragraph` | Preset Copy / `null` | Detailed description. Mandatory when the parent sets `has_paragraph === true`; otherwise hidden, not validated, and **retained in storage** so re-enabling restores it. |

---

## 5. BUSINESS RULES & PARAMETER ADAPTATION (IF -> THEN)

1. **Adaptation Matrix (driven entirely by parent parameters, `41 §4.3`):**

   | Parent parameter | Effect on this item |
   | :--- | :--- |
   | `icon_size: 48 \| 64` | Icon bounding box, in px, square. |
   | `has_paragraph: true` | `paragraph` shown in the inspector and required (L1). |
   | `has_paragraph: false` | `paragraph` hidden, omitted from the DOM, not validated, value kept. |
   | `item_count` | Items beyond the count are inactive: not rendered, not validated, kept. |

2. **Mandatory Icon Geometry:**
   - Icons render `object-fit: contain; width: 100%; height: 100%;` inside the parent-dictated
     box, so no asset can shift the layout.

3. **Icon Alt Text:**
   - The mandatory `title` beside the icon already carries the meaning, so the icon is
     decorative: the renderer emits `alt=""` and no alt field is offered (`SYS-02-ENUMS §6`).

4. **Preset Hydration — Empty Fields Only:**
   - On creation the parent's preset seeds `icon`, `title` and `paragraph`.
   - On a parameter change, presets fill only fields that are empty (`41 §6.1`).
