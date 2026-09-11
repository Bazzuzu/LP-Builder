# `30_OBJECT_SECTION_HERO.md`

```yaml
METACLASS: CONCRETE_OBJECT
OBJECT_ID: OBJ-30-HERO-SECTION
VERSION: 2.0.0
STATUS: APPROVED
DEPENDS_ON: SYS-02-ENUMS, OBJ-21-FLIGHT-QUOTE-MODAL, OBJ-32-TRUST-SECTION, OBJ-33-FOOTER-SECTION
INHERITS_FROM: OBJ-10-BASE-SECTION
STRUCTURAL_ROLE: FIXED_ANCHOR
SOURCE_MODULE: src/sections/hero.js
TARGET_AUDIENCE: [LLM_AGENT, BACKEND_DEV, FRONTEND_DEV, UI_DESIGNER]
```

---

## 1. OBJECT DEFINITION
The above-the-fold anchor block at Slot `00`. It draws the site header, the value proposition
(Eyebrow, Title, Paragraph), the featured price with its optional brand marks, an optional
Trustpilot strip, and the embedded lead form. It is deliberately outside the shared design-token
system (`SYS-01 §1.1`): it carries its own theme engine, its own background media pipeline, its
own container spec (`max-width: 1280px; padding: 0 80px`) and its own three-step type scale.

---

## 2. RELATIONSHIPS (OOUX ORCA MAPPING)

- **Inherits From (Parent):** `10_ABSTRACT_OBJECT_PAGE_SECTION` (`section_id`, `slot_index: 00`,
  `order_in_slot: 0`, `is_mandatory: true`, `position_type: 'Fixed'`, `is_visible: true`).
- **Belongs To (N:1):** `OBJECT_LANDING_PAGE`. Reads `page.route.currency_code`,
  `page.route.default_origin` and `page.route.default_destination`.
- **Contains (1:1 Embedded):** the lead form. Its field contract belongs to
  `21_OBJECT_FLIGHT_QUOTE_MODAL §3`; §4.6 below records how much of that contract the markup
  currently carries.
- **Contains (0..1 Optional Sub-objects):** Eyebrow (five modes), Inline Badge, Aside Brand Logo,
  Bottom Brand Logo.
- **Reads (N:1 Global, read-only):** `GlobalFooterConfig.legal_disclaimers` — its presence is what
  switches the price asterisk on; `GlobalTrustConfig.trustpilot.review_count` — its presence is
  what mounts the Trustpilot strip. Neither has a page-level toggle.
- **Draws (not modelled):** `SITE_HEADER`. The brand logo, the accreditation strip, the phone
  block (`+1 888-555-0199`) and the menu icon are hardcoded SVG/markup inside this module. There
  is no `SITE_HEADER` object and no field behind any of it.

---

## 3. OBJECT LIFECYCLE & ADMIN CTAs

| Action (CTA) | Admin UI Location | System Behavior |
| :--- | :--- | :--- |
| **Insert** | — | **UNAVAILABLE.** `insertableTypes()` offers only `dynamic` and `static` archetypes; the Hero is created with the page and seeded from the payload in §5. |
| **Edit Content** | Inspector Drawer | Four groups, in panel order: **Content** (open), **Eyebrow**, **Media**, **Appearance**. Every field writes through to the live preview. |
| **Switch Theme Mode** | Inspector › Appearance | Repaints the section, and re-defaults `desktop_fallback_color` under the rule in §6.7. |
| **Toggle Visibility** | Outline row menu | **LOCKED.** Anchor rows are `pinned`; the row menu (and with it Hide, Duplicate, Delete, Move) is not rendered at all. |
| **Delete** | Outline row menu | **LOCKED.** Same mechanism. |
| **Reorder** | Outline / drag | **LOCKED.** Anchor slots are not drop zones; the section stays in slot `00`. |

---

## 4. ATTRIBUTES MATRIX

### 4.1 Theme Engine & Cascading Overrides

| Attribute Name | Data Type | Required | Default Value | Status | Description & Constraints |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `theme_mode` | `Enum` | Yes | `'Dark'` | `BUILT` | [`Light`, `Dark`]. Renders as the class `hero light` / `hero dark`; every effect below is a CSS rule scoped to that class. |

**Cascade, as the stylesheet actually implements it.** `SITE_HEADER` is still not its own object,
so this table remains its only description.

| Cascade target | Behaviour | Status |
| :--- | :--- | :--- |
| Header brand logo | `currentColor` SVG. White in `Dark`; `var(--bronze)` in `Light` (`.hero.light .hero-brand`). | `BUILT` |
| Accreditation strip (ASTA/IATA/ARC/BBB artwork) | `currentColor` SVG at `opacity: .75` — follows the section's text colour rather than swapping assets. | `BUILT` |
| Navigation (phone pill, menu button) | Pill fill `rgba(255,255,255,.1)` in `Dark`, `rgba(0,0,0,.05)` in `Light`; text inherits. | `BUILT` |
| Countdown widget | Border and segment divider swap between `rgba(255,255,255,.28)` and `rgba(0,0,0,.16)`. | `BUILT` |
| Trustpilot strip | Inherits the section text colour. The star chips stay brand green (`#00b67a`) in **both** themes — it is not a palette swap. | `BUILT` |
| Default typography | `#fff` in `Dark`; `var(--ink)` in `Light`. Price rules and card shadow follow. | `BUILT` |

---

### 4.2 Responsive Background Engine

| Attribute Name | Data Type | Required | Default Value | Status | Description & Constraints |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `desktop_bg_image` | `Media` | No | `null` | `BUILT` | Picker accepts `image/*`. Resolved to a URL and painted as `background-image` on `.hero-bg.desktop`. |
| `desktop_fallback_color` | `Color` | Yes | `#000000E0` (Dark) | `BUILT` | Painted on the `<section>` itself, so it is the ground behind every layer. Presets: `#000000E0` *Ink (Dark theme)*, `#F7F2EE` *Sand (Light theme)*. |
| `desktop_overlay_color` | `Color` | Yes | `#000000` | `BUILT` | Presets `SCRIM_PRESETS` (black / white). Painted on the single `.hero-ov` element. |
| `desktop_overlay_opacity` | `Integer` | Yes | `50` | `BUILT` | `0..100`, divided by 100 into the scrim's `opacity`. |
| `mobile_bg_image` | `Media` | No | `null` | `BUILT` | Painted on `.hero-bg.mobile`, shown below `768px`. Falls back to `desktop_bg_image` when empty. |
| `mobile_fallback_color` | `Color` | — | — | `PLANNED` | **Does not exist.** There is no second fallback field and no mobile-specific fallback rule; `desktop_fallback_color` is the ground at every width. |
| `mobile_overlay_color` | `Color` | Yes | `#000000` | `DEFECT` | Declared, defaulted and editable. **Never read.** See `DEFECTS.md D-02`. |
| `mobile_overlay_opacity` | `Integer` | Yes | `50` | `DEFECT` | Declared, defaulted and editable. **Never read.** See `DEFECTS.md D-02`. |

> **The scrim is one element, not two.** `render()` emits exactly one `.hero-ov`, built from
> `desktop_overlay_color` and `desktop_overlay_opacity`, and it sits above both background layers.
> The mobile pair is collected by the panel and discarded. An admin darkening the mobile
> background sees no change in the preview and none in the export.

---

### 4.3 Eyebrow Section (Micro-Content Above Main Title)

* **`eyebrow_mode`:** `Enum` [`None`, `Text`, `Timer`, `Logo`, `Badge`]. Default `'None'`. `BUILT`.

| Mode | Fields | Types & Defaults | Status | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **`None`** | — | — | `BUILT` | The `.hero-eyebrow` container is omitted from the DOM entirely. |
| **`Text`** | `eyebrow_text` | `String`, required | `BUILT` | Escaped plain text; L1 `E100` when empty. |
| **`Timer`** | `timer_prefix`<br>`end_date`<br>`end_timezone`<br>`on_expiry` | `String`, default `'Offer ends in:'`<br>`DateTime`, required<br>`IANA TZ`, default `'UTC'`<br>`Enum`, default `HideEyebrow` | `BUILT` | The editor stores an absolute ISO instant converted through `end_timezone`, so every visitor counts down to the same moment. An unrecognised zone name silently falls back to UTC. `on_expiry`: [`HideEyebrow`, `ShowExpiredLabel`, `FreezeAtZero`]. |
| **`Logo`** | `logo_image` | `Media`, **not validated** | `PLANNED` | The field is decorative, hinted `Ratio 10:1, e.g. 560×56`, and rendered at `height: 56px; max-width: 560px`. `validate()` has **no** branch for `eyebrow_mode === 'Logo'`, so a Logo eyebrow with no asset publishes and renders the striped "Logo" placeholder. The required-asset guard is the PLANNED part. |
| **`Badge`** | `badge_icon`<br>`badge_label`<br>`badge_color` | `Media`, required (`E101`)<br>`String`, required (`E100`)<br>`Color`, default `#B8876E` | `BUILT` | Standalone pill. Presets `ACCENT_PRESETS`. |

**Inline badge (Text and Timer only) — three flat props, not an object.**

| Attribute Name | Data Type | Required | Default Value | Status | Description & Constraints |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `has_inline_badge` | `Boolean` | Yes | `false` | `BUILT` | Gates the three fields below; itself gated on `eyebrow_mode ∈ {Text, Timer}`. |
| `inline_badge_icon` | `Media` | No | `null` | `BUILT` | Decorative; renders at `14×14`. Not validated — the badge is valid without it. |
| `inline_badge_label` | `String` | If enabled | `null` | `BUILT` | L1 `E100` when the toggle is on and the label is blank. |
| `inline_badge_color` | `Color` | Yes | `#B8876E` | `BUILT` | Pill background. Presets `ACCENT_PRESETS`. |
| `badge_data` | `Object` | — | — | `PLANNED` | **Does not exist.** v1 modelled the inline badge as `{ icon, label, color }`. The code has never had that shape; the three flat keys above are the storage contract. |

---

### 4.4 Typography Group (Title & Paragraph)

| Attribute Name | Data Type | Required | Default Value | Status | Description & Constraints |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `title_preset` | `Enum` | Yes | `'L'` | `BUILT` | Three values, small-to-large: `S` = 40px, `M` = 48px (`letter-spacing: .48px`), `L` = 56px / `line-height: 60.48px`. Below 768px they collapse to 28 / 31 / 34px. |
| `title_text` | `RichText` | **Yes** | seed copy | `BUILT` | Toolset `RT_BASIC` — bold, italic, strike, per-character colour — plus line breaks. L1 `E100`. Bold inside the H1 renders at `--display-weight` so it reads against an already-bold headline. |
| `paragraph_text` | `RichText` | No | seed copy | `BUILT` | Toolset `RT_FULL` — adds lists and links. Hidden when blank. Capped at `56ch`. |

---

### 4.5 Price Showcase & Brand Identity

| Attribute Name | Data Type | Required | Default Value | Status | Description & Constraints |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `price_top_label` | `InlineRichText` | No | `'Fares starting from'` | `BUILT` | Hidden when blank. |
| `price_main_value` | `String` | **Yes** | `'1,234'` | `BUILT` | L1 `E100`. Stored exactly as typed; the currency symbol is prefixed at render time. |
| `price_bottom_label` | `InlineRichText` | No | `'all taxes included'` | `BUILT` | Hidden when blank. |
| `price_footnote` | `RichText` | — | — | `PLANNED` | **Does not exist.** The asterisk points at the Footer's shared `legal_disclaimers` instead (§6.2). The panel carries a static note saying so. |
| `has_price_aside_logo` | `Boolean` | Yes | `false` | `BUILT` | When on, price and logo split the row in half (`flex: 1 1 0` on both). |
| `price_aside_logo` | `Media` | If enabled | `null` | `BUILT` | L1 `E101` when the toggle is on. Container ratio **2:1** — an advisory hint printed in the picker, not a validated constraint. |
| `has_price_bottom_logo` | `Boolean` | Yes | `false` | `BUILT` | |
| `price_bottom_logo` | `Media` | If enabled | `null` | `BUILT` | L1 `E101` when the toggle is on. Container ratio **10:1**, rendered at `height: 56px`. Advisory hint only. |
| *(currency symbol)* | derived | — | `'$'` | `BUILT` | `Intl.NumberFormat` on `page.route.currency_code`; any failure falls back to `$`. |
| *(leading-symbol strip on save)* | L2 rule | — | — | `PLANNED` | Nothing normalises `price_main_value`. An admin who types `$1,234` gets `$$1,234` on the page. |
| *(Trustpilot strip)* | derived | — | — | `BUILT` | Mounted only when `globals.trust.trustpilot.review_count` is truthy: five green chips, the localised review count and the Trustpilot wordmark. No page-level field controls it. |

---

### 4.6 Embedded Lead Form & CTA

The form is markup only. It is tagged `data-hero-lead`; nothing in `src/` listens for that
attribute, and the runtime binds submission exclusively to the modal's `[data-lead-form]`.

| Row | What the markup contains | Status | Notes |
| :--- | :--- | :--- | :--- |
| Trip type / cabin + travellers | Two **decorative** pills inside an `aria-hidden="true"` row, printing `Round-trip` and `Business / 1 Traveler` | `BUILT` (as decorative) | They are `<span>`s, not controls — no `<select>`, no name, no value. Screen readers skip the row deliberately. Real selectors are `PLANNED`. |
| From ⇄ To | Two text inputs, pre-filled from `page.route.default_origin` / `default_destination`, plus a working swap button (`data-lead-swap`) | `BUILT` | Swap is wired in the runtime and exchanges the two values. |
| Departure / Return | Two `<input type="date">` | `BUILT` | No range validation. |
| Name / Email / Phone | Three inputs; phone prefixed by a `<select>` of ten hardcoded dial codes | `BUILT` | `required` attributes are present but `novalidate` on the form disables native enforcement. |
| Consent checkbox | — | `PLANNED` | **Absent.** Doc 21's mandatory consent control is not in the markup, and nothing gates the submit button. |
| Submit | `<button class="btn" type="submit">` | `DEFECT` | No handler is bound to `data-hero-lead` anywhere. Pressing it performs a native submit and **reloads the page**; the lead is lost. See `DEFECTS.md D-01`. |

#### Admin-Configurable Fields (Hero only)

| Attribute Name | Data Type | Required | Default Value | Status | Description & Constraints |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `cta_button_text` | `String` | Yes | `'Check Your Price'` | `BUILT` | Trailing chevron is decorative SVG. |
| `cta_button_color` | `Color` | Yes | `#B8876E` | `BUILT` | Presets `ACCENT_PRESETS`. |
| `cta_button_text_color` | `Color` | Yes | `#FFFFFF` | `BUILT` | Presets `INK_PRESETS`. |
| *(contrast guard)* | L2 rule | — | — | `PLANNED` | No WCAG check exists — not on the button pair, not on the theme/background pair. The picker warns about nothing. |
| `anchor_id` | `String` | No | `null` | `PLANNED` | Stored on the Section, rendered as the `<section id>`, and carried through import/export — but the Hero declares no `advancedGroup`, so there is no control for it in this panel. |

---

## 5. DEFAULT BOILERPLATE PRESET PAYLOAD (SEED DATA)

Verbatim from the module's `defaults`. Keys absent here have no default and start `undefined`.

```yaml
default_preset_payload:
  theme_mode: "Dark"
  desktop_fallback_color: "#000000E0"
  desktop_overlay_color: "#000000"
  desktop_overlay_opacity: 50
  mobile_overlay_color: "#000000"        # DEFECT D-02 — stored, never read
  mobile_overlay_opacity: 50             # DEFECT D-02 — stored, never read
  eyebrow_mode: "None"
  end_timezone: "UTC"
  on_expiry: "HideEyebrow"
  has_inline_badge: false
  inline_badge_color: "#B8876E"
  badge_color: "#B8876E"
  title_preset: "L"
  title_text: "Unrivalled comfort across the Atlantic"
  paragraph_text: "<p>Wholesale business and first class fares, managed end to end by a dedicated specialist.</p>"
  price_top_label: "Fares starting from"
  price_main_value: "1,234"
  price_bottom_label: "all taxes included"
  has_price_aside_logo: false
  has_price_bottom_logo: false
  cta_button_text: "Check Your Price"
  cta_button_color: "#B8876E"
  cta_button_text_color: "#FFFFFF"
```

---

## 6. BUSINESS RULES & SYSTEM GUARDS (IF -> THEN)

1. **Anchor Lock.** — `BUILT`
   - **IF** the outline paints a section sitting in an anchor slot:
     - **THEN** it is drawn `pinned`: no drag handle, no `⋯` menu, therefore no Hide, Duplicate,
       Reorder or Delete. A missing Hero is reported at publish as `E001`; a Hero in the wrong
       slot as `E005`.

2. **Conditional Price Asterisk.** — `BUILT`
   - **IF** `globals.footer.legal_disclaimers` carries visible text:
     - **THEN** a `<span class="price-star">*</span>` is appended to the rendered price.
   - **IF** it is empty:
     - **THEN** **no asterisk is rendered** — an asterisk with nothing to point at is worse than
       none. The disclaimer itself is rendered by the Footer, not by the Hero.

3. **Price Composition.** — `BUILT`
   - **THEN** the price string is `{currency_symbol}{price_main_value}{star?}`, where the symbol
     comes from `page.route.currency_code`. The admin's digits and separators are never reformatted.

4. **Background Fallback.** — `BUILT`
   - **IF** neither background image is uploaded:
     - **THEN** the `<section>` renders on `desktop_fallback_color` alone, and **no scrim element
       is emitted at all** — a scrim over a flat colour would only dim the colour the admin chose.

5. **Mobile Image Fallback.** — `BUILT`
   - **IF** `mobile_bg_image` is blank and `desktop_bg_image` exists:
     - **THEN** the mobile layer paints the desktop image. Below `768px` the desktop layer is
       hidden and the mobile layer shown; the scrim above them is the desktop pair either way
       (rule 6).

6. **Mobile Scrim.** — `DEFECT`
   - **DESCRIBED:** the mobile viewport pairs its background with `mobile_overlay_color` /
     `mobile_overlay_opacity`.
   - **ACTUAL:** one `.hero-ov` is emitted from the desktop pair and applies at every width. The
     mobile pair is collected and discarded. `DEFECTS.md D-02`.

7. **Theme Switch Does Not Overwrite Admin Colours.** — `BUILT`
   - **IF** `theme_mode` changes and `desktop_fallback_color` is unset or still holds the *other*
     theme's default (`#000000E0` ↔ `#F7F2EE`):
     - **THEN** it re-defaults to the new theme's value.
   - **IF** it holds any other value:
     - **THEN** it is left untouched. No contrast flag follows (see §4.6 `PLANNED`).
   - **Scope:** this `onChange` touches exactly one field. `cta_button_color`,
     `cta_button_text_color` and the overlays are never re-defaulted.

8. **Form Submission Routing.** — `DEFECT`
   - **DESCRIBED:** submitting the embedded form runs doc 21 §5 — validation, dispatch,
     confirmation/error states, submit disabled until consent.
   - **ACTUAL:** no handler is bound to `data-hero-lead`. The native submit reloads the page and
     the lead is lost. The modal's own form (`[data-lead-form]`) *is* wired, so the same CTA
     contract works there and not here. `DEFECTS.md D-01`.

9. **Reduced Motion.** — `BUILT`
   - The countdown repaints on a 60-second `setInterval` and runs no CSS animation, so it carries
     no vestibular risk under `prefers-reduced-motion: reduce`. Nothing else in the Hero animates
     beyond hover transitions.
