# `10_ABSTRACT_OBJECT_PAGE_SECTION.md`

```yaml
METACLASS: ABSTRACT_OBJECT
OBJECT_ID: OBJ-10-BASE-SECTION
VERSION: 1.1.0
STATUS: APPROVED
INHERITANCE: ROOT_ABSTRACT_CLASS
DEPENDS_ON: SYS-02-ENUMS (component keys, slot model, validation levels, media/alt contract)
TARGET_AUDIENCE: [LLM_AGENT, BACKEND_DEV, FRONTEND_DEV, ARCHITECT]
```

---

## 1. OBJECT DEFINITION
The foundational abstract base entity for any horizontal block rendered within a `LandingPage`. Enforces global slot positioning, vertical ordering, structural immutability invariants, and rendering state across all concrete sections.

---

## 2. RELATIONSHIPS (OOUX ORCA MAPPING)

- **Belongs To (N:1):** `OBJECT_LANDING_PAGE` (A section cannot exist without a parent page).
- **Specialized By (Inheritance Tree):**
  - **Concrete Anchors:** 
    - `30_OBJECT_SECTION_HERO`
    - `31_OBJECT_SECTION_PRICES`
    - `32_OBJECT_SECTION_TRUST`
    - `33_OBJECT_SECTION_FOOTER`
  - **Concrete Statics:**
    - `34_OBJECT_SECTION_STATIC_SUBSCRIPTION`
    - `35_OBJECT_SECTION_STATIC_CONTACT`
  - **Abstract Dynamic Subclass:**
    - `11_ABSTRACT_OBJECT_DYNAMIC_SECTION` (Parent for all dynamic content/intermediate blocks)

---

## 3. OBJECT LIFECYCLE & ADMIN CTAs

| Action (CTA) | Admin Permission Rule | System Behavior |
| :--- | :--- | :--- |
| **Insert** | Any slot permitted for the archetype | Instantiates component; appends at `order_in_slot = len(slot)`. |
| **Reorder (Up/Down)** | Allowed within the slot, or across an anchor into the neighbouring dynamic slot | Swaps `order_in_slot` with the adjacent sibling, or re-seats into the target slot (`SYS-00-ARCH §3.1`). |
| **Toggle Visibility** | Permitted **only if** `is_mandatory === false`. For mandatory anchors the control is rendered permanently disabled. | Modifies `is_visible` flag. If `false`, section is omitted from DOM **and skipped by L1 validation**. |
| **Delete** | **FORBIDDEN** if `is_mandatory === true` | Removes instance from parent page array and purges child relations. |

---

## 4. ATTRIBUTES MATRIX

### 4.1 Structural & System Attributes

| Attribute Name | Data Type | Required | Default | Mutability | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `section_id` | `UUIDv4` | Yes | `AUTO_GEN` | Immutable | Unique identifier per instance. |
| `component_key` | `Enum<String>` | Yes | `None` | Immutable | Discriminator enum (e.g., `'HERO'`, `'PRICES'`, `'TEXT_MEDIA'`). |
| `position_type` | `Enum` | Yes | `Custom` | Immutable | [`Fixed`, `Custom`]. Defines slot mobility. |
| `slot_index` | `Integer` | Yes | Assigned on insert | Immutable for anchors, Mutable otherwise | Container slot: `00`/`02`/`04`/`06` (anchors), `01`/`03`/`05` (dynamic containers). |
| `order_in_slot` | `Integer` | Yes | `0` | Mutable | Zero-based order **within `slot_index` only**. Anchors are always `0`. |
| `anchor_id` | `String` | No | `null` | Mutable | Optional DOM id for in-page links (`#deals`). Regex `^[a-z0-9-]+$`. Must be unique per page (L2). |
| `is_mandatory` | `Boolean` | Yes | `false` | Immutable | If `true`, delete action is locked/disabled in CMS UI. |
| `is_visible` | `Boolean` | Yes | `true` | Mutable | Controls presence in production HTML output. |

### 4.2 Audit & Telemetry Attributes

| Attribute Name | Data Type | Required | Default | Mutability | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `created_at` | `ISO8601` | Yes | `NOW()` | Immutable | Timestamp of insertion into page layout. |
| `updated_at` | `ISO8601` | Yes | `NOW()` | Mutable | Timestamp of last parameter modification. |

---

## 5. BUSINESS LOGIC & STRUCTURAL INVARIANTS

```typescript
abstract class BasePageSection {
  readonly section_id: UUID;
  readonly component_key: SectionComponentKey;
  readonly position_type: 'Fixed' | 'Custom';
  readonly is_mandatory: boolean;
  slot_index: number;
  order_in_slot: number;
  is_visible: boolean;

  // Invariant 1: Mandatory Anchors must have Fixed position
  validatePosition(): void {
    if (this.is_mandatory) {
      assert(this.position_type === 'Fixed', "Invariant Violation: Mandatory sections must be Fixed.");
    }
  }

  // Invariant 2: Deletion Guard
  canDelete(): boolean {
    return !this.is_mandatory;
  }

  // Invariant 3: DOM Rendering Guard
  shouldRenderInDOM(): boolean {
    return this.is_visible === true;
  }

  // Invariant 4: Visibility Guard — mandatory anchors are always rendered
  canToggleVisibility(): boolean {
    return !this.is_mandatory;
  }

  // Invariant 5: Content validation scope — hidden sections are not published output,
  // so their L1 content requirements are not evaluated (SYS-02-ENUMS §4).
  requiresContentValidation(): boolean {
    return this.is_visible === true;
  }
}

---

## 6. UNIVERSAL MEDIA CONTRACT

Every `File` attribute declared by any subclass implicitly carries a sibling `<field>_alt`
string, governed centrally by `SYS-02-ENUMS §6`. Subclass documents do not repeat it:
content imagery requires `alt` at L1, decorative/brand assets render `alt=""`.
```
