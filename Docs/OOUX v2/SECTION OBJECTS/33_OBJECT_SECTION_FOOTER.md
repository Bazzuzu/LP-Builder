# `33_OBJECT_SECTION_FOOTER.md`

```yaml
METACLASS: CONCRETE_OBJECT
OBJECT_ID: OBJ-33-FOOTER-SECTION
VERSION: 2.0.0
STATUS: APPROVED
DEPENDS_ON: SYS-02-ENUMS, OBJ-34-STATIC-SUBSCRIPTION
INHERITS_FROM: OBJ-10-BASE-SECTION
STRUCTURAL_ROLE: DUAL_ROLE_ANCHOR (Fixed Anchor + Global Content)
SOURCE_MODULE: src/sections/footer.js
GLOBAL_STORE: globals.footer (src/presets/global-defaults.js)
TARGET_AUDIENCE: [LLM_AGENT, BACKEND_DEV, FRONTEND_DEV, ARCHITECT]
```

---

## 1. OBJECT DEFINITION
The terminal anchor at Slot `06`, rendered as a `<footer>` on a fixed `#111` ground. Five columns:
a brand block with the copyright and registration notices, up to three navigation columns, and a
**newsletter + social column**. Below them, the legal disclaimer band and a row of accreditation
seals. Every word comes from the global store — the section declares `fields: []` and has no
page-level content of its own.

Two things in this footer were never described in v1 and are described here for the first time:
the `registration_notice` line, and the entire newsletter block, which duplicates
`34_OBJECT_SECTION_STATIC_SUBSCRIPTION` inside the footer.

---

## 2. RELATIONSHIPS (OOUX ORCA MAPPING)

- **Inherits From (Parent):** `10_ABSTRACT_OBJECT_PAGE_SECTION` (`section_id`, `slot_index: 06`,
  `order_in_slot: 0`, `is_mandatory: true`, `position_type: 'Fixed'`, `is_visible: true`).
- **Belongs To (N:1):** `OBJECT_LANDING_PAGE`.
- **Consumes (N:1 Global, read-only):** `GlobalFooterConfig` — real schema in §4.2.
- **Read by (N:1, indirect):** `30_OBJECT_SECTION_HERO` and `31_OBJECT_SECTION_PRICES` both read
  `legal_disclaimers` to decide whether to render their price asterisk. Emptying the legal text in
  Global Settings silently removes every asterisk on every page.
- **Overlaps with:** `34_OBJECT_SECTION_STATIC_SUBSCRIPTION`. The footer's newsletter block reads
  `globals.footer.newsletter`, a *different* store branch from the Subscription section's
  `globals.subscription`, with the same five keys and different shipped values. A page carrying a
  Subscription section shows two newsletter forms with two different headlines.
- **Background:** not configurable. `fixedBg: '#111111'`, so the same-background divider can
  compare this section against its neighbours; the colour itself is painted by the section's CSS.

---

## 3. OBJECT LIFECYCLE & ADMIN CTAs

| Action (CTA) | Admin UI Location | System Behavior |
| :--- | :--- | :--- |
| **Insert** | — | **UNAVAILABLE.** Anchors are created with the page. |
| **Edit Content** | Inspector | **READ-ONLY.** `fields: []`, so the panel is one card: *"Navigation, legal text, accreditations and social links are the same on every page."* plus an **Edit in Global Settings** button, and nothing else. |
| **Toggle Visibility** | Outline row menu | **LOCKED.** Anchor rows are `pinned`; no row menu is rendered. |
| **Delete / Reorder** | Outline row menu | **LOCKED.** Pinned to slot `06`, the terminal slot. |
| **Edit globally** | Global Settings › Footer | Eight text/textarea leaves — see §4.3 for which of the schema they cover and which they do not. |

---

## 4. ATTRIBUTES MATRIX

### 4.1 Page-Level Structural Invariants

| Attribute Name | Data Type | Required | Default Value | Status | Description & Constraints |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `section_id` | `String` | Yes | `AUTO_GEN` (`uid('sec')`) | `BUILT` | Immutable instance identifier. |
| `component_key` | `String` | Yes | `'SECTION_FOOTER'` | `BUILT` | Canonical key (`SYS-02-ENUMS §1`). |
| `slot_index` | `Integer` | Yes | `6` | `BUILT` | From `ANCHOR_SLOT`. A mismatch is `E005` at publish. |
| `order_in_slot` | `Integer` | Yes | `0` | `BUILT` | Anchor slots hold exactly one section. |
| `is_mandatory` | `Boolean` | Yes | `true` | `BUILT` | Expressed structurally: the key is in `MANDATORY_ANCHORS`, its outline row is `pinned`, and a missing Footer is `E004`. |
| `is_visible` | `Boolean` | Yes | `true` | `BUILT` | The Hide action is unreachable for a pinned row. |
| `anchor_id` | `String` | No | `null` | `PLANNED` | Rendered as the `<footer id>` and carried through import/export, but with `fields: []` there is no control for it anywhere. |
| *(page-level props)* | — | — | `{}` | `BUILT` | `defaults: {}`. This section stores nothing per page. |

---

### 4.2 Consumed Global Content Model (`GlobalFooterConfig`)

The real shape of `globals.footer`.

```yaml
global_footer_schema:
  navigation_columns: Array<{
    column_title: string
    links: Array<{ label: string, url: string, open_in_new_tab: bool }>
  }>
  newsletter: {                    # NOT IN v1 — the footer's own newsletter block
    title: string
    subtitle: string
    email_placeholder: string
    button_label: string
    privacy_notice: richtext       # hand-authored HTML, rendered unescaped
  }
  legal_disclaimers: richtext      # hand-authored HTML, rendered unescaped
  accreditation_seals: Array<...>  # rendered as TEXT, not as images — see below
  social_channels: Array<{ platform: 'LinkedIn'|'Instagram'|'Facebook', url: string }>
  copyright_notice: string
  registration_notice: string      # NOT IN v1 — rendered under the copyright line
```

| Global key | Status | How it is rendered |
| :--- | :--- | :--- |
| `navigation_columns[]` | `BUILT` | One `.ft-col` per entry: `column_title` as an uppercase `<h3>`, then one `<a>` per link. `open_in_new_tab` adds `target="_blank" rel="noopener noreferrer"`. The grid is `1.2fr 1fr 1fr 1fr 1.3fr` — sized for the brand column, **three** nav columns and the newsletter column. A fourth nav column overflows that template. |
| `copyright_notice` | `BUILT` | Escaped text in the brand column. Shipped as `© Business Travel Group LLC` — no automatic year substitution; the string is printed verbatim. |
| `registration_notice` | `BUILT` | **Absent from the v1 schema.** Escaped text on the line below the copyright, separated by a `<br>`. Shipped as `Florida FST #ST41395`. |
| `newsletter.*` | `BUILT` (markup) | **Absent from the v1 schema.** Renders a heading, a lead line, an email form, a privacy note, a hairline, a hardcoded *"Follow Us"* heading and the social row — all inside the fifth column. See §4.4 for the form. |
| `legal_disclaimers` | `BUILT` | Rendered **unescaped** as HTML in the `.ft-legal` band. It is authored as raw HTML in a plain textarea in Global Settings. Its emptiness also switches off the Hero and Prices asterisks (§6.4). |
| `social_channels[]` | `BUILT` | One `<a target="_blank" rel="noopener noreferrer" aria-label="{platform}">` per entry. The icon is looked up in a hardcoded map of exactly three platforms; **an unknown `platform` renders an empty, unlabelled link**, not a fallback icon. |
| `accreditation_seals[]` | `DEFECT` | Declared in v1 as `Array<File<'SVG'>>` and commented in the seed as *"asset ids: ASTA, IATA, ARC"*. The renderer maps each entry through `esc()` into `<span class="acc">` — a 44px bordered circle containing **escaped text**. An asset id put in this array would render as the literal id string. No `<img>`, no asset resolution. |
| *(seal fallback)* | `BUILT` | When the array is empty — which is how the product ships — three hardcoded circles read `ASTA`, `IATA`, `ARC`. The whole row is `filter: grayscale(1); opacity: .6`. |

---

### 4.3 Global Settings Coverage

Global Settings › Footer exposes eight leaves: `legal_disclaimers`, `copyright_notice`,
`registration_notice`, and the five `newsletter.*` keys.

| Global key | Editable in the UI? | Status |
| :--- | :--- | :--- |
| `legal_disclaimers`, `copyright_notice`, `registration_notice`, `newsletter.*` | Yes — plain text / textarea | `BUILT` |
| `navigation_columns` | No | `PLANNED` |
| `social_channels` | No | `PLANNED` |
| `accreditation_seals` | No | `PLANNED` |

> Nested collections have no editor of any kind — not a repeater, not a JSON box. They are changed
> by editing `src/presets/global-defaults.js`, or by importing a document that carries them. A
> Super-Admin cannot add a navigation link, a social channel or a seal from the interface.

---

### 4.4 Footer Newsletter Form

| Aspect | Behaviour | Status |
| :--- | :--- | :--- |
| Markup | `<form class="ft-news-form" data-subscribe novalidate>` with one `type="email" name="email" required` input and a submit button labelled from `newsletter.button_label`. | `BUILT` |
| Placeholder | `newsletter.email_placeholder`, falling back to the literal `Enter your email`. | `BUILT` |
| Privacy note | `newsletter.privacy_notice`, rendered **unescaped** so its `<a href="/privacy">` link works. | `BUILT` |
| Submission | **No handler exists for `[data-subscribe]` anywhere in `src/`.** `novalidate` also disables the browser's own email check, so the submit performs a native form submission and reloads the page. | `PLANNED` |
| Validation / states | No regex, no disabled submit, no inline error, no endpoint, no 200/409 handling. | `PLANNED` |

The submission contract is specified once, in `34_OBJECT_SECTION_STATIC_SUBSCRIPTION §6`. Both
forms carry the same `data-subscribe` hook and will be satisfied by the same handler.

---

## 5. DEFAULT BOILERPLATE PRESET PAYLOAD (SEED DATA)

**Page-level props:**

```yaml
default_preset_payload: {}     # the module declares `defaults: {}` — nothing is stored per page
```

**Global store shipped with a fresh install** (`globals.footer`, legal text abridged):

```yaml
footer:
  navigation_columns:
    - column_title: "Information"
      links: [ Frequently Asked Questions /faq, Payment Options /payment-options, Contact /contact,
               How it Works /how-it-works, Reviews /reviews, Glossary /glossary ]
    - column_title: "Company"
      links: [ Best Deals /best-deals, What We Offer /what-we-offer, About Us /about,
               Corporate /corporate, Blog /blog ]
    - column_title: "Policies"
      links: [ Privacy Policy /privacy, Terms and Conditions /terms, Cookie Policy /cookie-policy ]
    # every link ships with open_in_new_tab: false
  newsletter:
    title: "Business Class Fare Alerts"
    subtitle: "Private fares, exclusive offers, and savings of up to 60%, delivered straight to your inbox."
    email_placeholder: "Enter your email"
    button_label: "Get Fare Alerts"
    privacy_notice: "No spam. Unsubscribe anytime. <a href=\"/privacy\">Privacy Policy</a>."
  legal_disclaimers: "<p>* The prices shown are in U.S. dollars and are per person based on weekday
    travel (Monday-Thursday) from the United States including all taxes and fees. … All fares are
    subject to change until ticketed.<br>* Payment options through Affirm are subject to an
    eligibility check …</p>"
  accreditation_seals: []        # empty on a fresh install -> the ASTA / IATA / ARC text fallback
  social_channels:
    - { platform: "LinkedIn",  url: "https://linkedin.com/" }
    - { platform: "Instagram", url: "https://instagram.com/" }
    - { platform: "Facebook",  url: "https://facebook.com/" }
  copyright_notice: "© Business Travel Group LLC"
  registration_notice: "Florida FST #ST41395"
```

> The shipped `legal_disclaimers` opens with a literal `*`, which is what the Hero and Prices
> asterisks point at. That coupling is why the field is never safely blank.

---

## 6. BUSINESS RULES & SYSTEM GUARDS (IF -> THEN)

1. **Terminal Placement Invariant.** — `BUILT`
   - The Footer is pinned to slot `06`, the last slot in render order, so it always closes the
     document however slot `05` is filled. A Footer found in any other slot is `E005`; a missing
     Footer is `E004`. Both block publishing.

2. **Page-Level Mutation Lock.** — `BUILT`
   - **IF** a page editor selects this section:
     - **THEN** the inspector renders the global card and the *Edit in Global Settings* button,
       because the archetype is `dual-anchor` and `GLOBAL_CONTENT_ARCHETYPES` includes it. With
       `fields: []` there is literally nothing else to show. The wording is the module's
       `globalHint`, not v1's sentence.

3. **Global Synchronization Pipeline.** — `BUILT`
   - **IF** a Super-Admin saves Global Settings:
     - **THEN** every rendered page picks the change up on its next render; nothing is copied into
       page documents, so no re-publish is needed.
   - **Caveat:** the panel saves **only the area currently open**. Switching tabs rebuilds the
     draft from the store, so edits made in one tab and abandoned by switching to another are lost.

4. **Legal Text Drives Two Other Sections.** — `BUILT`
   - **IF** `legal_disclaimers` holds visible text:
     - **THEN** the Hero's featured price and every Prices row render a trailing `*`.
   - **IF** it is emptied:
     - **THEN** every asterisk on every page disappears at once. There is no page-level override
       and no warning in the panel.

5. **Accreditation Seals Render as Text.** — `DEFECT`
   - **DESCRIBED:** `accreditation_seals: Array<File<'SVG'>>` — IATA, ARC, BBB, ASTA artwork.
   - **ACTUAL:** each entry is escaped into the text content of a bordered 44px circle. No asset
     is resolved and no `<img>` is emitted, so a file reference stored here renders as its own id
     string. The visible seals on a fresh install are the three hardcoded fallback labels, which
     is why the gap has stayed invisible. Not yet listed in `DEFECTS.md`.

6. **Newsletter Duplication.** — `BUILT`, and deliberate to record
   - The footer newsletter block is unconditional: there is no switch, and it renders on every page
     whether or not a Subscription section is present. The two blocks read different store branches
     (`footer.newsletter` vs `subscription`) with the same five key names, so their copy can — and
     by default does — disagree.

7. **Newsletter Submission.** — `PLANNED`
   - See §4.4 and doc 34 §6.2–§6.3. Both `[data-subscribe]` forms are inert.
