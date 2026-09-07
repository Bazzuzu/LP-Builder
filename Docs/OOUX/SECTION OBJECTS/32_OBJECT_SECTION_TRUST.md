# `32_OBJECT_SECTION_TRUST.md`

```yaml
METACLASS: CONCRETE_OBJECT
OBJECT_ID: OBJ-32-TRUST-SECTION
VERSION: 2.1.0
STATUS: APPROVED
DEPENDS_ON: SYS-02-ENUMS
INHERITS_FROM: OBJ-10-BASE-SECTION
STRUCTURAL_ROLE: DUAL_ROLE_ANCHOR (Fixed Anchor + Global Static Module)
TARGET_AUDIENCE: [LLM_AGENT, BACKEND_DEV, FRONTEND_DEV, UI_DESIGNER]
```

---

## 1. OBJECT DEFINITION
A trust-building social proof anchor block positioned at Slot `04`. Combines live Trustpilot review streams and high-profile celebrity/VIP endorsements. Operates with a **Dual Role**: data and reviews are ingested globally site-wide, while display density (`Extended` vs. `Compact`) and component toggles are controlled locally on the page level.

---

## 2. RELATIONSHIPS (OOUX ORCA MAPPING)

- **Inherits From (Parent):** `10_ABSTRACT_OBJECT_PAGE_SECTION` (Inherits `section_id`, `slot_index: 04`, `order_in_slot: 0`, `is_mandatory: true`, `position_type: 'Fixed'`).
- **Belongs To (N:1):** `OBJECT_LANDING_PAGE`.
- **Consumes (N:1 External / Global):** `GlobalTrustConfig` — schema in §4.3.

---

## 3. OBJECT LIFECYCLE & ADMIN CTAs

| Action (CTA) | Admin UI Location | System Behavior |
| :--- | :--- | :--- |
| **Switch Layout Mode** | Inspector Drawer (Segmented Control) | Toggles between `Extended` and `Compact` visual density modes. |
| **Toggle Sub-modules** | Inspector Drawer (Toggles) | Shows or hides the Trustpilot feed and Celebrity review card independently. |
| **Toggle Visibility** | Section Settings | **LOCKED / DISABLED.** Mandatory anchor; `is_visible` is permanently `true`. |
| **Delete** | Section Actions | **LOCKED / DISABLED.** Cannot be removed (`is_mandatory === true`). |
| **Reorder** | Section Actions | **LOCKED / DISABLED.** Pinned permanently to Slot `04`. |

---

## 4. ATTRIBUTES MATRIX

### 4.1 Page-Level Configuration Attributes

| Attribute Name | Data Type | Required | Default Value | Description & Constraints |
| :--- | :--- | :--- | :--- | :--- |
| `layout_mode` | `Enum` | Yes | `'Extended'` | [`Extended`, `Compact`]. `Compact` is optimized for content-heavy pages to minimize vertical height. |
| `show_trustpilot_feed` | `Boolean` | Yes | `true` | When `true`, renders live Trustpilot ratings and review carousel/grid. |
| `show_celebrity_review`| `Boolean` | Yes | `true` | When `true`, renders the featured VIP testimonial card. |

---

### 4.2 Layout Mode Specifications

| Mode | Composition | Geometry |
| :--- | :--- | :--- |
| **`Extended`** | Trustpilot rating + review grid, and the VIP testimonial card side by side. The review feed mounts directly into the section grid — no wrapper box, no nested borders. | Full section padding. Celebrity card carries the brand `padding-right` token so its quote never collides with the adjacent review column. |
| **`Compact`** | Same two sub-modules, but the review feed renders as a **single-row slider** (one visible review, horizontal paging) and the celebrity card collapses to quote + attribution without portrait. | Vertical margins and paddings reduced by ~40% against `Extended`. |

---

### 4.3 Consumed Global Content Model (`GlobalTrustConfig`)
*(Managed centrally by Super-Admins in Global Site Settings)*

```yaml
global_trust_schema:
  trustpilot:
    business_unit_id: string;
    aggregate_score: decimal;      # e.g. 4.8, refreshed from the Trustpilot API
    review_count: integer;
    reviews: Array<{ author: string; score: 1..5; title: string; body: string; date: ISO8601 }>;
  celebrity_endorsement:
    person_name: string;
    person_title: string;          # e.g. "Grammy-nominated producer"
    portrait: File;                # 1:1
    quote: richtext;
  cache_ttl_minutes: integer;      # feed refresh interval
```

---

## 5. BUSINESS RULES & SYSTEM GUARDS (IF -> THEN)

1. **Mandatory Anchor Lock:**
   - **IF** Admin attempts to delete or move this section:
     - **THEN** System rejects the action. Pinned to Anchor Slot `04` (`is_mandatory: true`).

2. **Density Adaptation (`Compact` Mode):**
   - **IF** `layout_mode === 'Compact'`:
     - **THEN** The section condenses its vertical margins/paddings by ~40%, compresses review card footprints, and prioritizes a single-row slider layout to preserve vertical space on content-heavy pages.

3. **Sub-module Visibility Minimum Invariant (L1, `E104`):**
   - **IF** BOTH `show_trustpilot_feed === false` **AND** `show_celebrity_review === false`:
     - **THEN** the page cannot be **published** (`E104`): a mandatory anchor would render as an
       empty band. Saving the draft is still permitted (`SYS-02-ENUMS §4`).

4. **Global Data Isolation:**
   - **IF** Page-level admin accesses this section:
     - **THEN** Admin can ONLY alter display switches (`layout_mode`, `show_*`). Review texts, star ratings, and celebrity quotes cannot be edited at the page level; they are fetched from the central global store.
