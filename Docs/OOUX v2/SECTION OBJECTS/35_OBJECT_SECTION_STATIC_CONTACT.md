# `35_OBJECT_SECTION_STATIC_CONTACT.md`

```yaml
METACLASS: CONCRETE_OBJECT
OBJECT_ID: OBJ-35-STATIC-CONTACT
VERSION: 2.0.0
STATUS: APPROVED
DEPENDS_ON: SYS-02-ENUMS, OBJ-21-FLIGHT-QUOTE-MODAL
INHERITS_FROM: OBJ-10-BASE-SECTION
STRUCTURAL_ROLE: STATIC_GLOBAL_MODULE
SOURCE_MODULE: src/sections/contact.js
GLOBAL_STORE: globals.contact (src/presets/global-defaults.js)
TARGET_AUDIENCE: [LLM_AGENT, BACKEND_DEV, FRONTEND_DEV, CONCIERGE_TEAM]
```

---

## 1. OBJECT DEFINITION
A contact module: a headline, a lead line, and a responsive grid of **three channel cards** — Chat,
Phone, Email — each with a hardcoded icon, a title, a description and one CTA link pinned to the
bottom of the card. A **static global module**: it declares `fields: []`, so a page editor controls
placement, order and visibility and nothing else. Maximum one per page.

The channel model is a **fixed set of three named keys**, not a collection. The section renders
exactly `channels.chat`, `channels.phone`, `channels.email`, in that order; a fourth key in the
store would be ignored, and a missing key renders nothing where its card would have been.

---

## 2. RELATIONSHIPS (OOUX ORCA MAPPING)

- **Inherits From (Parent):** `10_ABSTRACT_OBJECT_PAGE_SECTION` (`section_id`,
  `position_type: 'Custom'`, `is_mandatory: false`, `is_visible: true`).
- **Belongs To (N:1):** `OBJECT_LANDING_PAGE`. Permitted slots: `01`, `03`, `05` (`DYNAMIC_SLOTS`),
  derived from the archetype by `permittedSlots()`.
- **Multiplicity / Instance Limit:** `maxInstances('static') === 1`. Enforcement is §6.1–§6.2.
- **Consumes (N:1 Global, read-only):** `globals.contact` — real schema in §4.2.
- **Triggers (0..N):** any card whose `cta_href` is `#lead-modal` opens the lead overlay through
  the runtime's global click handler. Two of the three ship that way, with **no prefill** — the
  modal opens blank, since a Contact card carries no destination or cabin to pass.
- **Background:** not configurable. `fixedBg: '#FFFFFF'`.

---

## 3. OBJECT LIFECYCLE & ADMIN CTAs

| Action (CTA) | Admin UI Location | System Behavior | Status |
| :--- | :--- | :--- | :--- |
| **Insert** | Add-a-section drawer › *Global static blocks* | Adds the section to the clicked slot. Already on the page: the card is rendered `disabled`, greyed, titled *"Only one Contact Us section is permitted per page."* | `BUILT` |
| **Reorder (Up/Down)** | Outline row menu / drag | Moves within or between dynamic slots. | `BUILT` |
| **Duplicate** | Outline row menu | Offered on this section. `duplicateSection()` runs no uniqueness check, so a second instance is created. | `DEFECT` |
| **Toggle Visibility** | Outline row menu | Sets `is_visible`; a hidden section is dropped from the render. | `BUILT` |
| **Delete** | Outline row menu | Removes the section after a confirmation dialog. | `BUILT` |
| **Edit Contact Info** | Inspector | **READ-ONLY.** `fields: []`, so the panel is one card: *"Concierge phone numbers, email and the copy around them are managed centrally."* plus an **Edit in Global Settings** button. | `BUILT` |

---

## 4. ATTRIBUTES MATRIX

### 4.1 Page-Level Structural Attributes

| Attribute Name | Data Type | Required | Default Value | Status | Description & Constraints |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `section_id` | `String` | Yes | `AUTO_GEN` (`uid('sec')`) | `BUILT` | Unique instance identifier on the page. |
| `component_key` | `String` | Yes | `'SECTION_CONTACT'` | `BUILT` | Canonical key (`SYS-02-ENUMS §1`). |
| `slot_index` | `Integer` | Yes | slot chosen on insert | `BUILT` | One of `1`, `3`, `5`. Anything else is `E008` at publish. |
| `order_in_slot` | `Integer` | Yes | appended last | `BUILT` | Position within that slot. |
| `is_mandatory` | `Boolean` | Yes | `false` | `BUILT` | Expressed structurally — not in `MANDATORY_ANCHORS`, so the row is not `pinned`. |
| `is_visible` | `Boolean` | Yes | `true` | `BUILT` | `false` removes it from the render. |
| `anchor_id` | `String` | No | `null` | `PLANNED` | Rendered as the `<section id>` and carried through import/export, but with `fields: []` there is no control for it. |
| *(page-level props)* | — | — | `{}` | `BUILT` | `defaults: {}`. Nothing is stored per page. |

---

### 4.2 Consumed Global Content Model (`globals.contact`)

```yaml
global_contact_schema:
  headline: string             # escaped plain text
  subheadline: string          # escaped plain text
  channels:
    chat:  { title, description, cta_label, cta_href }
    phone: { title, description, cta_label, cta_href }
    email: { title, description, cta_label, cta_href }
```

| Global key | Data Type | Status | How it is rendered |
| :--- | :--- | :--- | :--- |
| `headline` | `String` | `BUILT` | Escaped text in `<h2>`, fixed 30px (24px below 768px). No heading-scale field exists. |
| `subheadline` | `String` | `BUILT` | Escaped text in `<p>`. Rendered even when empty — the `<p>` is unconditional. |
| `channels.{k}.title` | `String` | `BUILT` | Escaped text in `<h3>`. |
| `channels.{k}.description` | `RichText` | `BUILT` | Rendered **unescaped**. This is where `tel:` and `mailto:` links live — see §6.3. |
| `channels.{k}.cta_label` | `String` | `BUILT` | Escaped, followed by a literal `›`. |
| `channels.{k}.cta_href` | `String` | `BUILT` | Falls back to `#lead-modal` when blank. Rendered as a full-width link above a hairline, pushed to the bottom of the card by `margin-top: auto`, so every card's CTA aligns whatever its description's length. |
| *(card icon)* | — | `BUILT` | Hardcoded inline SVG per channel — speech bubble / handset / envelope — in a 48px dark rounded square, `aria-hidden="true"`. Not data; there is no icon field. |

**Attributes v1 specified that do not exist anywhere in the system:**

| v1 attribute | Status | Note |
| :--- | :--- | :--- |
| `channels.phone_primary` (`display_number`, `protocol_uri`, `label`) | `PLANNED` | No such key, and no such triple. The real phone channel is `channels.phone` with the same four keys as every other channel; the number is prose inside `description`. |
| `channels.phone_international` | `PLANNED` | **There is no international-concierge channel at all.** The section renders three cards and no more; adding a fourth key to the store would change nothing, because the renderer names its three channels explicitly. |
| `channels.email_support` (`email_address`, `protocol_uri`, `label`) | `PLANNED` | The real key is `channels.email`; the address is prose inside `description`, and the `mailto:` is in `cta_href`. |
| `operational_notice` | `PLANNED` | Not stored, not rendered, not editable. The shipped subheadline carries the "call back in 15 minutes" promise instead, as ordinary copy. |
| `office_location` | `PLANNED` | Not stored, not rendered, not editable. |

---

### 4.3 Global Settings Coverage

Global Settings › Contact exposes **all fourteen leaves**: `headline`, `subheadline`, and
`title` / `description` / `cta_label` / `cta_href` for each of the three channels. — `BUILT`

This is the only one of the four global areas with complete coverage: the Footer cannot edit its
navigation, socials or seals, the Trust area cannot edit its reviews or media, and Subscription
cannot edit its photograph. Contact has no unreachable data.

Every field is a plain text input or textarea, so the descriptions are authored as raw HTML.

---

## 5. DEFAULT BOILERPLATE PRESET PAYLOAD (SEED DATA)

**Page-level props:**

```yaml
default_preset_payload: {}     # the module declares `defaults: {}` — nothing is stored per page
```

**Global store shipped with a fresh install** (`globals.contact`):

```yaml
contact:
  headline: "Contact Us"
  subheadline: "Want to travel business class for less? Contact our experts for exclusive deals.
                Submit your details below for a call back in 15 minutes and save up to 60%*OFF!"
  channels:
    chat:
      title: "Chat"
      description: "<p>For urgent questions, message our chat for priority support.</p>"
      cta_label: "Start a Chat"
      cta_href: "#lead-modal"
    phone:
      title: "Phone Call or Callback"
      description: "<p>Speak to a concierge directly:
                    <a href=\"tel:+18883157838\">+1 888-315-7838</a> or request a callback.</p>"
      cta_label: "Immediate Callback"
      cta_href: "#lead-modal"
    email:
      title: "Contact via Email"
      description: "<p>For detailed requests, email our team at
                    <a href=\"mailto:info@business-class.com\">info@business-class.com</a>.</p>"
      cta_label: "Send Email"
      cta_href: "mailto:info@business-class.com"
```

> The seeded phone number here (`+1 888-315-7838`) is not the one hardcoded into the Hero's site
> header (`+1 888-555-0199`). The header number is markup, not data, so the two cannot be kept in
> sync from Global Settings — see doc 30 §2.

---

## 6. BUSINESS RULES & SYSTEM GUARDS (IF -> THEN)

1. **Single-Instance Invariant — on insert.** — `BUILT`
   - **IF** an admin opens the section library on a page that already holds a `SECTION_CONTACT`:
     - **THEN** its card is `disabled` and greyed, with the reason both as its description and as
       its `title` attribute. Insertion is impossible.

2. **Single-Instance Invariant — on duplicate.** — `DEFECT`
   - **DESCRIBED:** the CMS blocks a second instance.
   - **ACTUAL:** the guard lives only in the library drawer. Static modules sit in dynamic slots,
     so their outline rows are not `pinned` and the `⋯` menu offers **Duplicate**.
     `duplicateSection()` performs no uniqueness check. A second Contact section is one click away
     and surfaces later as `E007` in the issues panel — a report after the fact, not a guard.
     `DEFECTS.md D-07`.

3. **Telecommunication Protocol Binding.** — `PLANNED`
   - **DESCRIBED:** every phone number wrapped in `href="tel:…"` and every address in
     `href="mailto:…"`, guaranteed by the data model through a `protocol_uri` beside each value.
   - **ACTUAL:** there is no `protocol_uri`, no `display_number` and no `email_address`. Numbers
     and addresses are **prose inside `description`**, and their links are hand-authored HTML
     typed into a plain textarea in Global Settings. The seed data happens to contain a correct
     `tel:` and a correct `mailto:`; nothing validates them, nothing generates them, and an admin
     who retypes a number as plain text produces an unclickable one with no warning.
   - The only structurally guaranteed link is `cta_href`, which is a free-text field with a
     `#lead-modal` fallback — it can hold a `tel:` or `mailto:` (the email card ships one), but it
     is not required to.

4. **Missing Channel Degrades Silently.** — `BUILT`
   - **IF** a channel key is absent from the store:
     - **THEN** its card renders as the empty string. The grid is `auto-fit, minmax(240px, 1fr)`,
       so the remaining cards widen to fill the row and nothing indicates a channel is missing.
       There is no validation for this: the section has no `validate()`.

5. **Global Synchronization & Read-Only Guard.** — `BUILT`
   - **IF** a page editor selects this section:
     - **THEN** the inspector renders the global card and the *Edit in Global Settings* button,
       because the archetype is `static` and `GLOBAL_CONTENT_ARCHETYPES` includes it.
   - **IF** a Super-Admin saves Global Settings:
     - **THEN** every page showing the section re-renders with the new details; nothing is copied
       into page documents. The panel saves **only the area currently open** — switching tabs
       discards unsaved edits in the tab left behind.

6. **CTA Routing.** — `BUILT`
   - **IF** `cta_href` is `#lead-modal` (or blank, which falls back to it):
     - **THEN** the runtime's global handler intercepts the click, opens the overlay and focuses
       its first field. The card passes no `data-destination` or `data-cabin`, so the modal opens
       empty — unlike a Prices row (doc 50 §5.5).
   - **IF** `cta_href` is anything else:
     - **THEN** it is an ordinary link: `mailto:`, `tel:`, a path or an absolute URL, followed
       natively. `#lead-modal` is the only magic href in the system (`LEAD_ANCHOR`, `SYS-02 §5`).
