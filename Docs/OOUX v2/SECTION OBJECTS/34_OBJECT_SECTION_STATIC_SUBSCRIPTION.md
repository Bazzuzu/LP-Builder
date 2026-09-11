# `34_OBJECT_SECTION_STATIC_SUBSCRIPTION.md`

```yaml
METACLASS: CONCRETE_OBJECT
OBJECT_ID: OBJ-34-STATIC-SUBSCRIPTION
VERSION: 2.0.0
STATUS: APPROVED
DEPENDS_ON: SYS-02-ENUMS, OBJ-33-FOOTER-SECTION
INHERITS_FROM: OBJ-10-BASE-SECTION
STRUCTURAL_ROLE: STATIC_GLOBAL_MODULE
SOURCE_MODULE: src/sections/subscription.js
GLOBAL_STORE: globals.subscription (src/presets/global-defaults.js)
TARGET_AUDIENCE: [LLM_AGENT, BACKEND_DEV, FRONTEND_DEV, CRM_SPECIALIST]
```

---

## 1. OBJECT DEFINITION
A newsletter block rendered as a single rounded card split in half: standardised copy and an email
form on the left, a full-bleed photograph on the right. A **static global module** — it declares
`fields: []`, so a page editor controls placement, order and visibility and nothing else. Maximum
one per page.

Its copy lives in `globals.subscription`. A second, independent newsletter block also exists inside
the Footer, reading `globals.footer.newsletter` (doc 33 §4.4); the two are separate data with
identical key names.

---

## 2. RELATIONSHIPS (OOUX ORCA MAPPING)

- **Inherits From (Parent):** `10_ABSTRACT_OBJECT_PAGE_SECTION` (`section_id`,
  `position_type: 'Custom'`, `is_mandatory: false`, `is_visible: true`).
- **Belongs To (N:1):** `OBJECT_LANDING_PAGE`. Permitted slots: `01`, `03`, `05` (`DYNAMIC_SLOTS`);
  `permittedSlots()` derives this from the archetype, it is not declared per section.
- **Multiplicity / Instance Limit:** `maxInstances('static') === 1`. Enforcement is §6.1.
- **Consumes (N:1 Global, read-only):** `globals.subscription` — six keys, §4.2.
- **Integrates With (1:1 API):** none. The CRM endpoint of v1 does not exist — §6.3.
- **Background:** not configurable. `fixedBg: '#FFFFFF'`; the card inside sits on
  `var(--bg-light-grey)`.

---

## 3. OBJECT LIFECYCLE & ADMIN CTAs

| Action (CTA) | Admin UI Location | System Behavior | Status |
| :--- | :--- | :--- | :--- |
| **Insert** | Add-a-section drawer › *Global static blocks* | Adds the section to the clicked slot. Already on the page: the card is rendered `disabled`, greyed, titled *"Only one Subscription section is permitted per page."*, with the description replaced by *"Already on this page — only one is permitted."* | `BUILT` |
| **Reorder (Up/Down)** | Outline row menu / drag | Moves within a dynamic slot or between dynamic slots. | `BUILT` |
| **Duplicate** | Outline row menu | Offered on this section. `duplicateSection()` runs no uniqueness check, so a second instance is created. | `DEFECT` |
| **Toggle Visibility** | Outline row menu | Sets `is_visible`; a hidden section is dropped from the render and skipped by L1 validation. | `BUILT` |
| **Delete** | Outline row menu | Removes the section after a confirmation dialog. | `BUILT` |
| **Edit Copywriting** | Inspector | **READ-ONLY.** `fields: []`, so the panel is one card: *"Its copy, the form and the photograph are standardised site-wide."* plus an **Edit in Global Settings** button. | `BUILT` |

---

## 4. ATTRIBUTES MATRIX

### 4.1 Page-Level Structural Attributes

| Attribute Name | Data Type | Required | Default Value | Status | Description & Constraints |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `section_id` | `String` | Yes | `AUTO_GEN` (`uid('sec')`) | `BUILT` | Unique instance identifier on the page. |
| `component_key` | `String` | Yes | `'SECTION_SUBSCRIPTION'` | `BUILT` | Canonical key (`SYS-02-ENUMS §1`). |
| `slot_index` | `Integer` | Yes | slot chosen on insert | `BUILT` | One of `1`, `3`, `5`. Anything else is `E008` at publish. |
| `order_in_slot` | `Integer` | Yes | appended last | `BUILT` | Position within that slot. |
| `is_mandatory` | `Boolean` | Yes | `false` | `BUILT` | Expressed structurally — the key is not in `MANDATORY_ANCHORS`, so the row is not `pinned`. |
| `is_visible` | `Boolean` | Yes | `true` | `BUILT` | `false` removes it from the render. |
| `anchor_id` | `String` | No | `null` | `PLANNED` | Rendered as the `<section id>` and carried through import/export, but with `fields: []` there is no control for it. |
| *(page-level props)* | — | — | `{}` | `BUILT` | `defaults: {}`. Nothing is stored per page. |

---

### 4.2 Standardized Global Content Model (`globals.subscription`)

All five copy keys v1 specified exist, under exactly the names v1 gave them. A sixth is consumed.

| Global key | Data Type | Status | How it is rendered |
| :--- | :--- | :--- | :--- |
| `title` | `String` | `BUILT` | Escaped plain text in `<h2 class="sec-title">`. |
| `subtitle` | `String` | `BUILT` | **Escaped plain text**, despite sitting in a `.sec-sub` container — HTML typed here would be shown, not interpreted. |
| `email_placeholder` | `String` | `BUILT` | Falls back to the literal `Enter your email`. |
| `button_label` | `String` | `BUILT` | Falls back to the literal `Subscribe`. Followed by a decorative `→`. |
| `privacy_notice` | `RichText` | `BUILT` | Rendered **unescaped**, so its `<a href="/privacy">` link works. Authored as raw HTML in a plain textarea. |
| `phone_image` | `Media` | `BUILT` | **Not in the v1 schema.** Fills the card's right half edge to edge, clipped by the card's own rounded shape. Decorative (`alt=""`); shows the striped "Image" placeholder when absent. `object-position: calc(50% - 200px) center` — the crop is tuned for the shipped artwork. |

> The **values** shipped differ from every string in v1 §4.2 (compare §5). The key set is the
> contract; the copy is seed data a Super-Admin is expected to replace.

**Heading scale.** The block uses the shared Heading component at a fixed size M
(`.sub-copy.h-m .sec-title`). There is no `heading_size` or `heading_align` field, page-level or
global — the scale is decided by the layout, not by an author.

---

### 4.3 Global Settings Coverage

Global Settings › Subscription exposes five leaves: `title`, `subtitle`, `email_placeholder`,
`button_label`, `privacy_notice`.

| Global key | Editable in the UI? | Status |
| :--- | :--- | :--- |
| The five copy keys | Yes — plain text / textarea | `BUILT` |
| `phone_image` | No | `PLANNED` |

> The photograph can only be changed by editing `src/presets/global-defaults.js` or by importing a
> document that carries a different value. There is no picker for it.

---

### 4.4 Phase 2 Extensibility Contract

| Capability | Status | Note |
| :--- | :--- | :--- |
| Per-page heading and subheading overrides | `PLANNED` | `fields: []` is deliberate; the inspector says so in one card rather than showing an empty group. |
| Lead-magnet incentive copy | `PLANNED` | No key, no field. |
| Selectable background token | `PLANNED` | `fixedBg: '#FFFFFF'` is not an editable field. |

---

## 5. DEFAULT BOILERPLATE PRESET PAYLOAD (SEED DATA)

**Page-level props:**

```yaml
default_preset_payload: {}     # the module declares `defaults: {}` — nothing is stored per page
```

**Global store shipped with a fresh install** (`globals.subscription`):

```yaml
subscription:
  title: "The Best Business Class Deals Worth Your Inbox"
  subtitle: "Be among the first to discover private fares, limited-time offers, and savings
             of up to 60% on Business Class flights."
  email_placeholder: "Enter your email"
  button_label: "Get Fare Alerts"
  privacy_notice: "No spam. Unsubscribe anytime. <a href=\"/privacy\">Privacy Policy</a>."
  phone_image: { url: "data:image/png;base64,…", alt: "" }
```

> For comparison, the Footer's own newsletter ships `title: "Business Class Fare Alerts"` and a
> different subtitle against the same `button_label`. A page carrying both blocks shows two
> different invitations to the same list.

---

## 6. BUSINESS RULES & SYSTEM GUARDS (IF -> THEN)

1. **Single-Instance Invariant — on insert.** — `BUILT`
   - **IF** an admin opens the section library on a page that already holds a
     `SECTION_SUBSCRIPTION`:
     - **THEN** its card is `disabled` and greyed, carrying the reason as its description and its
       `title` attribute. Insertion is impossible, not merely discouraged.

2. **Single-Instance Invariant — on duplicate.** — `DEFECT`
   - **DESCRIBED:** the CMS blocks a second instance.
   - **ACTUAL:** the guard lives only in the library drawer. Static modules sit in dynamic slots,
     so their outline rows are **not** `pinned` and the `⋯` menu offers **Duplicate** like any
     other section. `duplicateSection()` clones the section and splices it in with no uniqueness
     check at all. The second instance surfaces later as `E006` in the issues panel — a report
     after the fact, not a guard. `DEFECTS.md D-07`.

3. **Client-Side Email Validation.** — `PLANNED`
   - **DESCRIBED:** regex `^[^\s@]+@[^\s@]+\.[^\s@]+$`, a red border, a disabled submit and the
     inline message *"Please enter a valid email address."*
   - **ACTUAL:** none of it exists. The input carries `type="email" required`, but the form carries
     `novalidate`, which switches the browser's own check off as well. The submit button is never
     disabled and no error element exists in the markup.

4. **Submission State Machine & CRM Ingestion.** — `PLANNED`
   - **DESCRIBED:** a loading spinner, `POST /api/v1/newsletter/subscribe` with
     `{ email, page_slug, timestamp }`, a success pill on 200 and a duplicate notice on 409.
   - **ACTUAL:** **no handler is bound to `[data-subscribe]` anywhere in `src/`.** There is no
     endpoint, no payload, no state machine, and no success or conflict state. Submitting performs
     a native form submission and reloads the page; the address is lost.
   - The same hook is used by the Footer's newsletter form (doc 33 §4.4), so one handler will
     satisfy both.

5. **Global Synchronization & Read-Only Guard.** — `BUILT`
   - **IF** a page editor selects this section:
     - **THEN** the inspector renders the global card and the *Edit in Global Settings* button,
       because the archetype is `static` and `GLOBAL_CONTENT_ARCHETYPES` includes it.
   - **IF** a Super-Admin saves Global Settings:
     - **THEN** every page showing the section re-renders with the new copy; nothing is copied into
       page documents. The panel saves **only the area currently open** — switching tabs discards
       unsaved edits in the tab left behind.

6. **Responsive Collapse.** — `BUILT`
   - Below `1024px` the card becomes one column: copy on top with `40px 32px 0` padding, the
     photograph below at `min-height: 220px`. Below `768px` the section also drops from its own
     `80px` rhythm and `1280px` container to the shared `--section-y` and `--container`.
