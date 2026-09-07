# `34_OBJECT_SECTION_STATIC_SUBSCRIPTION.md`

```yaml
METACLASS: CONCRETE_OBJECT
OBJECT_ID: OBJ-34-STATIC-SUBSCRIPTION
VERSION: 1.1.0
STATUS: APPROVED
DEPENDS_ON: SYS-02-ENUMS
INHERITS_FROM: OBJ-10-BASE-SECTION
STRUCTURAL_ROLE: STATIC_GLOBAL_MODULE
TARGET_AUDIENCE: [LLM_AGENT, BACKEND_DEV, FRONTEND_DEV, CRM_SPECIALIST]
```

---

## 1. OBJECT DEFINITION
A site-wide newsletter subscription block designed for luxury travel deal alerts. Functions as a **Static Global Module**: content, copywriting, and form mechanics are globally standardized for brand consistency, while page-level admins retain control over slot placement, reordering, and visibility.

---

## 2. RELATIONSHIPS (OOUX ORCA MAPPING)

- **Inherits From (Parent):** `10_ABSTRACT_OBJECT_PAGE_SECTION` (Inherits `section_id`, `position_type: 'Custom'`, `is_mandatory: false`, `is_visible: true`).
- **Belongs To (N:1):** `OBJECT_LANDING_PAGE` (Resides in any dynamic slot: `01`, `03`, or `05`).
- **Integrates With (1:1 API):** Central Marketing Automation / Newsletter CRM API (`POST /api/v1/newsletter/subscribe`).

---

## 3. OBJECT LIFECYCLE & ADMIN CTAs

| Action (CTA) | Admin UI Location (Page Builder) | System Behavior |
| :--- | :--- | :--- |
| **Insert** | Section Library Drawer | Adds the subscription block to the selected dynamic slot (Enforces max 1 per page). |
| **Reorder (Up/Down)** | Section Toolbar / Drag Handle | Moves the section between dynamic slots or swaps order with neighboring dynamic blocks. |
| **Toggle Visibility** | Inspector Settings | Toggles `is_visible` (`true`/`false`) without removing the component from layout. |
| **Delete** | Section Toolbar (Trash Icon) | Fully removes the section from the page (`is_mandatory === false`). |
| **Edit Copywriting** | Inspector Drawer | **LOCKED (Phase 1).** Read-only notification directing to global template settings. |

---

## 4. ATTRIBUTES MATRIX

### 4.1 Page-Level Structural Attributes

| Attribute Name | Data Type | Required | Default Value | Description & Constraints |
| :--- | :--- | :--- | :--- | :--- |
| `section_id` | `UUIDv4` | Yes | `AUTO_GEN` | Unique instance identifier on the page. |
| `component_key` | `String` | Yes | `'SECTION_SUBSCRIPTION'` | Canonical key (`SYS-02-ENUMS §1`). |
| `slot_index` | `Integer` | Yes | Slot chosen on insert | One of `01`, `03`, `05`. |
| `order_in_slot` | `Integer` | Yes | `len(slot)` | Order within that slot. |
| `is_mandatory` | `Boolean` | Yes | `false` | Can be deleted by page editor. |
| `is_visible` | `Boolean` | Yes | `true` | When `false`, suppressed from DOM. |

---

### 4.2 Standardized Global Content Model (Phase 1 Baseline)
*(Standardized corporate copy rendered on frontend)*

```yaml
global_subscription_content:
  title: "Exclusive Fare Alerts & Private Offers"
  subtitle: "Subscribe to receive curated business and first class flight opportunities directly to your inbox."
  email_placeholder: "Enter your corporate or personal email"
  button_label: "Subscribe"
  privacy_notice: "By subscribing, you agree to our Privacy Policy. Unsubscribe anytime."
```

---

### 4.3 Phase 2 Roadmap & Extensibility Contract
> **Architectural Note:** In Phase 2, this entity will transition from static global copy to an editable component supporting:
> - Custom Section Headings & Subheadings per landing page.
> - Lead Magnet Incentives (e.g., *"$100 off your first booking"*).
> - Selectable background theme tokens (`BG_WHITE`, `BG_LIGHT_GREY`, `BG_LIGHT_BRONZE`).
>
> *Code must be modularized to support field overrides in future database migrations.*

---

## 5. BUSINESS RULES & SYSTEM GUARDS (IF -> THEN)

1. **Single-Instance Invariant (Uniqueness Guard):**
   - **IF** Admin attempts to insert a second `SECTION_SUBSCRIPTION` block onto a page where one already exists:
     - **THEN** The CMS blocks insertion with an alert:  
       `"Only one Subscription Section is permitted per landing page."`

2. **Client-Side Email Form Validation:**
   - **IF** User inputs an invalid email string (fails regex `^[^\s@]+@[^\s@]+\.[^\s@]+$`):
     - **THEN** Input border highlights red, submit button remains disabled, and inline error renders: `"Please enter a valid email address."`

3. **Submission State Machine & CRM Ingestion:**
   - **IF** User submits a valid email:
     - **THEN** Button displays loading spinner -> Dispatches payload `{ email, page_slug, timestamp }` to `/api/v1/newsletter/subscribe`.
     - **ON SUCCESS (200):** Replaces form controls with confirmation pill: `"Thank you for subscribing. Your exclusive fare alerts are active."`
     - **ON CONFLICT (409):** Displays notice: `"This email is already subscribed to our private alerts."`
