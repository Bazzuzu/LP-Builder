# `33_OBJECT_SECTION_FOOTER.md`

```yaml
METACLASS: CONCRETE_OBJECT
OBJECT_ID: OBJ-33-FOOTER-SECTION
VERSION: 1.1.0
STATUS: APPROVED
DEPENDS_ON: SYS-02-ENUMS
INHERITS_FROM: OBJ-10-BASE-SECTION
STRUCTURAL_ROLE: DUAL_ROLE_ANCHOR (Fixed Anchor + Global Static Module)
TARGET_AUDIENCE: [LLM_AGENT, BACKEND_DEV, FRONTEND_DEV, ARCHITECT]
```

---

## 1. OBJECT DEFINITION
The terminal anchor block of the landing page (Slot `06`). Functions as a **Dual-Role Anchor**: structurally pinned to the very bottom of every page layout, but powered by a centralized, site-wide data model. Houses corporate navigation, legal disclaimers, industry accreditations, social media channels, and copyright notices.

---

## 2. RELATIONSHIPS (OOUX ORCA MAPPING)

- **Inherits From (Parent):** `10_ABSTRACT_OBJECT_PAGE_SECTION` (Inherits `section_id`, `slot_index: 06`, `order_in_slot: 0`, `is_mandatory: true`, `position_type: 'Fixed'`).
- **Belongs To (N:1):** `OBJECT_LANDING_PAGE`.
- **Consumes (N:1 External / Global):** `GlobalFooterConfig` (Centralized corporate navigation, regulatory licenses, terms/privacy links).

---

## 3. OBJECT LIFECYCLE & ADMIN CTAs

| Action (CTA) | Admin UI Location (Page Builder) | System Behavior |
| :--- | :--- | :--- |
| **Edit Content** | Canvas / Inspector | **READ-ONLY.** Content cannot be edited at the page level. Modified centrally via Global Settings. |
| **Toggle Visibility** | Section Settings | **LOCKED / DISABLED.** Mandatory anchor; `is_visible` is permanently `true`. |
| **Delete** | Section Actions | **LOCKED / DISABLED.** Cannot be removed (`is_mandatory === true`). |
| **Reorder** | Section Actions | **LOCKED / DISABLED.** Permanently locked to the terminal slot (`Slot 06`). |

---

## 4. ATTRIBUTES MATRIX

### 4.1 Page-Level Structural Invariants

| Attribute Name | Data Type | Required | Default Value | Description & Constraints |
| :--- | :--- | :--- | :--- | :--- |
| `section_id` | `UUIDv4` | Yes | `AUTO_GEN` | Immutable instance identifier. |
| `component_key` | `String` | Yes | `'SECTION_FOOTER'` | Canonical key (`SYS-02-ENUMS §1`). |
| `slot_index` | `Integer` | Yes | `6` | Pinned to the terminal slot. |
| `order_in_slot` | `Integer` | Yes | `0` | Anchor slots hold exactly one section. |
| `is_mandatory` | `Boolean` | Yes | `true` | Cannot be deleted. |
| `is_visible` | `Boolean` | Yes | `true` | Permanently rendered in DOM. |

---

### 4.2 Consumed Global Content Model (`GlobalFooterConfig`)
*(Managed centrally by Super-Admins in Global Site Settings, not in the Page Builder)*

```yaml
global_footer_schema:
  navigation_columns: Array<{
    column_title: string;
    links: Array<{ label: string; url: URLPath; open_in_new_tab: bool }>;
  }>;
  legal_disclaimers: richtext; # Regulatory licensing, seller of travel disclosures
  accreditation_seals: Array<File<'SVG'>>; # IATA, ARC, BBB, ASTA
  social_channels: Array<{ platform: 'Instagram' | 'LinkedIn' | 'Facebook'; url: URLPath }>;
  copyright_notice: string; # e.g., "© {CurrentYear} Business Class. All rights reserved."
```

---

## 5. BUSINESS RULES & SYSTEM GUARDS (IF -> THEN)

1. **Terminal Placement Invariant:**
   - **THE FOOTER MUST ALWAYS BE THE LAST ELEMENT IN THE DOM:**
     - **IF** Dynamic sections are inserted or moved to Slot `05`:
     - **THEN** The Footer remains strictly pinned after Slot `05` as the final closing container.

2. **Page-Level Mutation Lock:**
   - **IF** A landing page editor attempts to open properties for this section in the builder:
     - **THEN** The inspector displays a read-only notification:  
       `"Footer is a site-wide global component. To modify links or legal disclaimers, navigate to Global Settings > Footer."`

3. **Global Synchronization Pipeline:**
   - **IF** A Super-Admin updates `GlobalFooterConfig`:
     - **THEN** All published landing pages automatically re-render with updated footer assets and legal disclaimers without requiring manual re-publishing of individual pages.
