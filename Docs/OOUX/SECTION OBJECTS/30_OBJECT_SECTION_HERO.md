# `30_OBJECT_SECTION_HERO.md`

```yaml
METACLASS: CONCRETE_OBJECT
OBJECT_ID: OBJ-30-HERO-SECTION
VERSION: 1.2.0
STATUS: APPROVED
DEPENDS_ON: SYS-02-ENUMS, OBJ-21-FLIGHT-QUOTE-MODAL
INHERITS_FROM: OBJ-10-BASE-SECTION
TARGET_AUDIENCE: [LLM_AGENT, BACKEND_DEV, FRONTEND_DEV, UI_DESIGNER]
```

---

## 1. OBJECT DEFINITION
The flagship, above-the-fold anchor block of the landing page. It establishes brand identity, presents the core value proposition (Eyebrow, Title, Paragraph), displays featured pricing with trust/airline badges, and houses the embedded Flight Quote Lead Form.

---

## 2. RELATIONSHIPS (OOUX ORCA MAPPING)

- **Inherits From (Parent):** `10_ABSTRACT_OBJECT_PAGE_SECTION` (Inherits `section_id`, `slot_index: 00`, `order_in_slot: 0`, `is_mandatory: true`, `position_type: 'Fixed'`).
- **Belongs To (N:1):** `OBJECT_LANDING_PAGE`.
- **Contains (1:1 Embedded):** Embedded Flight Search Lead Form — **field contract defined in `21_OBJECT_FLIGHT_QUOTE_MODAL.md §3`**, not here. The Hero renders that contract inline; the modal renders it as an overlay. They must never diverge.
- **Contains (0..1 Optional Sub-objects):** Inline Badge, Aside Brand Logo, Bottom Brand Logo.

---

## 3. OBJECT LIFECYCLE & ADMIN CTAs

| Action (CTA) | Admin UI Location | System Behavior |
| :--- | :--- | :--- |
| **Edit Content** | Main Canvas / Inspector Drawer | Updates visual, textual, and pricing parameters. Live preview updates in real time. |
| **Switch Theme Mode** | Top Inspector Panel | Instantly toggles between `Light` and `Dark` modes, updating all cascading global assets. |
| **Toggle Visibility** | Inspector Settings | **LOCKED / DISABLED.** Hero is a mandatory anchor; `is_visible` is permanently locked to `true`. |
| **Delete** | Section Actions | **LOCKED / DISABLED.** Cannot be removed (`is_mandatory === true`). |
| **Reorder** | Section Actions | **LOCKED / DISABLED.** Stays permanently pinned to Slot `00`. |

---

## 4. ATTRIBUTES MATRIX

### 4.1 Theme Engine & Cascading Overrides

| Attribute Name | Data Type | Required | Default Value | Description |
| :--- | :--- | :--- | :--- | :--- |
| `theme_mode` | `Enum` | Yes | `'Dark'` | [`Light`, `Dark`]. Controls cascading asset colors across header and widgets. |

> **Cascade target.** Three of the five effects below apply to the site header (brand logo,
> navigation links, phone). `SITE_HEADER` is not yet its own object — see `BACKLOG.md`; until
> it is, this table is its only description.

* **Theme Cascading Effects Table:**
  * **Header Brand Logo:** Renders *Bronze* in `Light` mode; renders *White* in `Dark` mode.
  * **Trust Badges (IATA, IATAN, ARC, BBB):** Auto-switches asset styling to match theme contrast.
  * **Navigation Links (Menu & Phone):** Inverts text and stroke colors for contrast.
  * **Embedded Trustpilot & Countdown Widgets:** Automatically inherits dark or light palette presets.
  * **Default Typography:** Applies dark charcoal text for `Light` mode; applies pure white/off-white text for `Dark` mode.

---

### 4.2 Responsive Background Engine

| Attribute Name | Data Type | Required | Default Value | Description & Constraints |
| :--- | :--- | :--- | :--- | :--- |
| `desktop_bg_image` | `File` | No | `null` | Formats: `PNG`, `JPG`, `WebP`. High-res desktop media. |
| `desktop_fallback_color` | `ColorPicker` | Yes | Theme Dependent | Fallback fill if no image: **Dark Theme:** `rgba(0, 0, 0, 0.88)` \| **Light Theme:** `#F7F2EE`. |
| `desktop_overlay_color` | `ColorPicker` | Yes | `#000000` | Hex/RGBA tint applied over desktop background image. |
| `desktop_overlay_opacity` | `Integer` | Yes | `50` | Slider range: `0%` to `100%`. Controls tint density. |
| `mobile_bg_image` | `File` | No | Fallback to Desktop | Formats: `PNG`, `JPG`, `WebP`. Rendered on viewports `< 768px`. |
| `mobile_fallback_color` | `ColorPicker` | Yes | Theme Dependent | Fallback fill if no image: **Dark Theme:** `rgba(0, 0, 0, 0.88)` \| **Light Theme:** `#F7F2EE`. |
| `mobile_overlay_color` | `ColorPicker` | Yes | `#000000` | Hex/RGBA tint applied over mobile background image. |
| `mobile_overlay_opacity` | `Integer` | Yes | `50` | Slider range: `0%` to `100%`. Controls mobile tint density. |

---

### 4.3 Eyebrow Section (Micro-Content Above Main Title)

* **`eyebrow_mode` Selector:** `Enum` [`None`, `Text`, `Timer`, `Logo`, `Badge`]. Default: `None`.

| Selected Mode | Configurable Fields | Field Types & Constraints | Description |
| :--- | :--- | :--- | :--- |
| **`None`** | *None* | *None* | Eyebrow container is completely omitted from DOM. |
| **`Text`** | 1. `eyebrow_text`<br>2. `has_inline_badge`<br>3. `badge_data` | `String` (Required)<br>`Boolean` (Default: `false`)<br>`{ icon: IconID, label: String, color: ColorPicker }` | Single-line teaser text with optional inline badge pill next to it. |
| **`Timer`** | 1. `timer_prefix`<br>2. `end_date`<br>3. `end_timezone`<br>4. `on_expiry`<br>5. `has_inline_badge`<br>6. `badge_data` | `String` (e.g., *"Offer ends in:"*)<br>`DateTime` (ISO8601 **with explicit offset**, Required)<br>`IANA TZ` (Required, default `"UTC"`)<br>`Enum` [`HideEyebrow`, `ShowExpiredLabel`, `FreezeAtZero`] (Required, default `HideEyebrow`)<br>`Boolean` (Default: `false`)<br>`{ icon: IconID, label: String, color: ColorPicker }` | Live countdown to `end_date`, evaluated in `end_timezone` — never in the visitor's local zone, so every visitor sees the same deadline. Inherits styling from `theme_mode`. |
| **`Logo`** | `logo_image` | `File<'SVG' \| 'PNG'>` (Required) | Image container with strict **10:1** aspect ratio (Recommended: `560x56 px`). |
| **`Badge`** | 1. `badge_icon`<br>2. `badge_label`<br>3. `badge_color` | `IconID` (Required)<br>`String` (Required)<br>`ColorPicker` (Required) | Standalone custom badge pill. |

---

### 4.4 Typography Group (Title & Paragraph)

| Attribute Name | Data Type | Required | Default Value | Description & Constraints |
| :--- | :--- | :--- | :--- | :--- |
| `title_preset` | `Enum` | Yes | `'Title 1'` | [`Title 1` (56px), `Title 2` (48px)]. Line height: `1.15`. |
| `title_text` | `RichText` | Yes | `None` | Supports: **Bold**, *Italic*, Multiline (`Enter` / `<br>`), and **Per-character Custom Color**. |
| `paragraph_text` | `RichText` | No | `null` | Supports: **Bold**, *Italic*, ~~Strikethrough~~, Bullet lists (`ul`), Numbered lists (`ol`), Multiline, and **Per-character Custom Color**. |

---

### 4.5 Price Showcase & Brand Identity

| Attribute Name | Data Type | Required | Default Value | Description & Formatting Rules |
| :--- | :--- | :--- | :--- | :--- |
| `price_top_label` | `InlineRichText` | No | `null` | Pre-heading above price (e.g., *"Fares starting from"*). Supports color, bold, italic, strike. |
| `price_main_value`| `String` | **Yes** | `None` | **MANDATORY.** Raw price figure (e.g., admin enters `1,234`). |
| `price_bottom_label`| `InlineRichText` | No | `null` | Post-heading under price (e.g., *"all taxes included"*). Supports color, bold, italic, strike. |
| `price_footnote` | `RichText` | If asterisk rendered | `null` | Legal footnote the automatic `*` points to (e.g. *"Fares are per person, subject to availability."*). Rendered at the bottom of the Hero. |
| `has_price_aside_logo` | `Boolean` | Yes | `false` | Toggles display of logo positioned opposite/beside price. |
| `price_aside_logo` | `File<'SVG' \| 'PNG'>` | If enabled | `null` | Container aspect ratio: **1:2** (Vertical orientation). |
| `has_price_bottom_logo`| `Boolean` | Yes | `false` | Toggles display of logo positioned directly under price block. |
| `price_bottom_logo` | `File<'SVG' \| 'PNG'>` | If enabled | `null` | Container aspect ratio: **10:1** (Fixed size: `560x56 px`). |

> **Frontend Rendering Rule for Price:**  
> The frontend template automatically constructs the rendered price string as:  
> `"{currency_symbol}{price_main_value}*"` (e.g., Admin enters `1,234` -> System outputs **`$1,234*`**).  
> The currency symbol is inherited from `LandingPage.currency_code` (default: `$`).
> **The asterisk is conditional, not hardcoded:** it is appended only when `price_footnote` is
> non-empty, because an asterisk with nothing to point at is worse than no asterisk at all.
> `price_main_value` is stored as digits and separators only — a leading currency symbol typed
> by the admin is stripped on save (L2), preventing `$$1,234`.

---

### 4.6 Embedded Flight Search Form & CTA

#### UI Structure / Wireframe Mock:
```
┌───────────────────────────┬───────────────────────────┐
│  Round-Trip            ▼  │  Business / 1 Traveler  ▼ │  <-- Row 1: Selectors
├───────────────────────────┴─────────────┬─────────────┤
│ From*                                   │ To*         │
│ New York (JFK)                        ⇄ │ London (LHR)│  <-- Row 2: Origin / Dest + Swap
├───────────────────────────┬─────────────┴─────────────┤
│ Departure                 │ Return                    │
│ Thu, Sep 10               │ Thu, Sep 17               │  <-- Row 3: Date Pickers
├───────────────────────────┴───────────────────────────┤
│ Name*                                                 │
│ [Enter your name                                    ] │  <-- Row 4: Full Name
├───────────────────────────────────────────────────────┤
│ Email*                                                │
│ [Enter your email                                   ] │  <-- Row 5: Email
├───────────────────────────────────────────────────────┤
│ Phone number*                                         │
│ [ 🇪🇸 +34 ▼ ] [ XXX XX XX XX                         ] │  <-- Row 6: Phone & Flag Picker
├───────────────────────────────────────────────────────┤
│ [             Check Your Price    >                 ] │  <-- Row 7: Primary CTA Button
└───────────────────────────────────────────────────────┘
```

#### Visitor-Facing Fields

**Defined once in `21_OBJECT_FLIGHT_QUOTE_MODAL.md §3` and reproduced by reference only.**
The embedded form and the modal share one field set, one validation contract and one payload;
duplicating the table here is what let the two halves drift apart in the first place.

Summary of what the wireframe above shows: `trip_type`, `cabin_class` + `travelers_total`,
`origin` ⇄ `destination`, `departure_date` / `return_date`, `full_name`, `email`, `phone`,
and the mandatory **consent checkbox**.

> **`full_name` is one field**, carried to the CRM as `contact.full_name`.
> **`travelers_total` is one number** (`1..9`), carried as `passengers.total`.

#### Admin-Configurable Fields (Hero only)

| Field Name | UI Control | Default & Behavior |
| :--- | :--- | :--- |
| `cta_button_text` | Text Input | **Default: `"Check Your Price"`**. Trailing chevron (`>`) is decorative. |
| `cta_button_color` | RGBA ColorPicker | **Default: `#7C5C3E` (brand bronze).** Must not equal the active theme's background fallback. |
| `cta_button_text_color` | RGBA ColorPicker | **Default: `#FFFFFF`.** L2 guard: the pair (`cta_button_color`, `cta_button_text_color`) must reach WCAG AA 4.5:1; the picker warns below that. |

---

## 5. BUSINESS RULES & SYSTEM GUARDS (IF -> THEN)

1. **Visibility Lock:**
   - **IF** Admin attempts to toggle or modify `is_visible`:
     - **THEN** System enforces `is_visible: true`. The toggle control is omitted or displayed in a permanently disabled state in the CMS.

2. **Price Formatting Automation:**
   - **IF** Admin enters raw digits or comma-formatted numbers into `price_main_value` (e.g., `1234` or `1,234`):
     - **THEN** The system prefixes the currency symbol per `LandingPage.currency_code`.
   - **IF** `price_footnote` is non-empty:
     - **THEN** a trailing `*` is appended to the price and the footnote is rendered below.
   - **IF** `price_footnote` is empty:
     - **THEN** **no asterisk is rendered.**

3. **Background Image Fallback to Solid Theme Fill:**
   - **IF** Neither `desktop_bg_image` nor `mobile_bg_image` is uploaded:
     - **THEN** The section container renders with `desktop_fallback_color` (Dark Theme: `rgba(0,0,0,0.88)`; Light Theme: `#F7F2EE`), ensuring high-contrast legibility.

4. **Mobile Image Fallback:**
   - **IF** `mobile_bg_image` is left blank, BUT `desktop_bg_image` exists:
     - **THEN** The mobile viewport (< 768px) inherits `desktop_bg_image` paired with mobile overlay and opacity settings.

5. **Form Submission Routing:**
   - **IF** User clicks the CTA Button:
     - **THEN** validation, submission and the confirmation/error state machine follow
       `21_OBJECT_FLIGHT_QUOTE_MODAL.md §5` exactly. Submit stays disabled until `consent`
       is checked.

6. **Theme Switch Does Not Overwrite Admin Colours:**
   - **IF** Admin switches `theme_mode` and a colour field still holds its theme default:
     - **THEN** that field re-defaults to the new theme's value.
   - **IF** the field holds an admin-entered value:
     - **THEN** it is preserved untouched, and the inspector flags any pair that now fails
       contrast.
