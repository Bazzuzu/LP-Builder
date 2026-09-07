# `35_OBJECT_SECTION_STATIC_CONTACT.md`

```yaml
METACLASS: CONCRETE_OBJECT
OBJECT_ID: OBJ-35-STATIC-CONTACT
VERSION: 1.1.0
STATUS: APPROVED
DEPENDS_ON: SYS-02-ENUMS
INHERITS_FROM: OBJ-10-BASE-SECTION
STRUCTURAL_ROLE: STATIC_GLOBAL_MODULE
TARGET_AUDIENCE: [LLM_AGENT, BACKEND_DEV, FRONTEND_DEV, CONCIERGE_TEAM]
```

---

## 1. OBJECT DEFINITION
A standardized corporate contact module providing direct access to luxury travel concierges, booking assistance, and corporate communications. Functions as a **Static Global Module**: contact details, phone protocols, and concierge operating hours are globally synchronized, while page-level editors manage slot placement, reordering, and visibility.

---

## 2. RELATIONSHIPS (OOUX ORCA MAPPING)

- **Inherits From (Parent):** `10_ABSTRACT_OBJECT_PAGE_SECTION` (Inherits `section_id`, `position_type: 'Custom'`, `is_mandatory: false`, `is_visible: true`).
- **Belongs To (N:1):** `OBJECT_LANDING_PAGE` (Permitted across `HomePage`, `RoutePage`, and campaign templates in dynamic slots `01`, `03`, or `05`).
- **Consumes (N:1 External / Global):** `GlobalContactConfig` (Centralized concierge phone matrix, official support emails, operational schedules).

---

## 3. OBJECT LIFECYCLE & ADMIN CTAs

| Action (CTA) | Admin UI Location (Page Builder) | System Behavior |
| :--- | :--- | :--- |
| **Insert** | Section Library Drawer | Injects the contact module into the selected dynamic slot (Enforces max 1 per page). |
| **Reorder (Up/Down)** | Section Toolbar / Drag Handle | Swaps order with neighboring dynamic sections. |
| **Toggle Visibility** | Inspector Settings | Toggles `is_visible` (`true`/`false`) without destroying the section configuration. |
| **Delete** | Section Toolbar (Trash Icon) | Removes the section from the page (`is_mandatory === false`). |
| **Edit Contact Info** | Inspector Drawer | **READ-ONLY.** Content cannot be edited per page; managed globally via Global Settings. |

---

## 4. ATTRIBUTES MATRIX

### 4.1 Page-Level Structural Attributes

| Attribute Name | Data Type | Required | Default Value | Description & Constraints |
| :--- | :--- | :--- | :--- | :--- |
| `section_id` | `UUIDv4` | Yes | `AUTO_GEN` | Unique instance identifier on the page. |
| `component_key` | `String` | Yes | `'SECTION_CONTACT'` | Canonical key (`SYS-02-ENUMS §1`). |
| `slot_index` | `Integer` | Yes | Slot chosen on insert | One of `01`, `03`, `05`. |
| `order_in_slot` | `Integer` | Yes | `len(slot)` | Order within that slot. |
| `is_mandatory` | `Boolean` | Yes | `false` | Can be deleted by page editor. |
| `is_visible` | `Boolean` | Yes | `true` | When `false`, suppressed from DOM. |

---

### 4.2 Standardized Global Content Model (`GlobalContactConfig`)
*(Managed centrally by Super-Admins in Global Site Settings)*

```yaml
global_contact_schema:
  headline: "Direct Concierge & Booking Support"
  subheadline: "Connect with our certified luxury travel specialists for bespoke flight itineraries and immediate assistance."
  channels:
    phone_primary:
      display_number: "+1 (888) 555-0199"
      protocol_uri: "tel:+18885550199" # Active click-to-call
      label: "Toll-Free (US & Canada)"
    phone_international:
      display_number: "+44 20 7946 0912"
      protocol_uri: "tel:+442079460912" # Active click-to-call
      label: "International Concierge"
    email_support:
      email_address: "concierge@business-class.com"
      protocol_uri: "mailto:concierge@business-class.com"
      label: "Direct Email Inquiry"
  operational_notice: "24/7/365 Dedicated Live Travel Support"
  office_location: "San Francisco, CA • London, UK • Dubai, UAE"
```

---

## 5. BUSINESS RULES & SYSTEM GUARDS (IF -> THEN)

1. **Single-Instance Invariant (Uniqueness Guard):**
   - **IF** Admin attempts to insert a second `SECTION_CONTACT` block onto a page where one already exists:
     - **THEN** The CMS blocks insertion with an alert:  
       `"Only one Contact Us Section is permitted per landing page."`

2. **Telecommunication Protocol Binding:**
   - **EVERY PHONE AND EMAIL ELEMENT MUST BE ACTIVELY CLICKABLE:**
     - All telephone numbers MUST be wrapped with active `href="tel:..."` protocols for instant mobile click-to-call.
     - All email addresses MUST be wrapped with active `href="mailto:..."` protocols.

3. **Global Synchronization & Read-Only Guard:**
   - **IF** A page editor selects this section in the visual builder:
     - **THEN** The properties panel displays a read-only notification:  
       `"Contact information is managed centrally. To update phone numbers or hours, navigate to Global Settings > Contact Information."`
   - **IF** A Super-Admin updates `GlobalContactConfig`:
     - **THEN** All pages displaying this section automatically reflect the new telephone numbers and operational details instantly.
