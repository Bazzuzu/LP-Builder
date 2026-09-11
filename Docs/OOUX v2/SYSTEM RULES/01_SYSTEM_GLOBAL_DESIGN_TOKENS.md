# `01_SYSTEM_GLOBAL_DESIGN_TOKENS.md`

```yaml
METACLASS: SYSTEM_SPECIFICATION (NOT AN OBJECT)
DOCUMENT_ID: SYS-01-TOKENS
VERSION: 2.0.0
STATUS: APPROVED
DEPENDS_ON: SYS-02-ENUMS
SCOPE: DYNAMIC_SECTIONS_STYLING_ONLY
IMPLEMENTED_BY: src/render/tokens.js, src/render/base.js, src/render/html.js, src/model/enums.js, src/sections/_common.js
TARGET_AUDIENCE: [LLM_AGENT, FRONTEND_DEV, UI_DESIGNER]
```

> Every table row and every business rule below carries a `BUILT` / `PLANNED` / `DEFECT`
> marker. The legend is in `../README.md`.
>
> **Naming correction over v1.** v1 §2 named the background variables `--color-bg-white`,
> `--color-bg-light-grey`, `--color-bg-light-bronze`. No such variables exist. The declared
> names are `--bg-white`, `--bg-light-grey`, `--bg-light-bronze` (`TOKENS_CSS`,
> `src/render/tokens.js`). Anything written against the v1 names resolves to nothing.

---

## 1. SCOPE & BOUNDARIES

`TOKENS_CSS` is a single string of CSS emitted into `<style>` by `renderPage()` ahead of
`BASE_CSS` and the per-section CSS. Preview and export receive the same bytes, so the two
surfaces cannot drift. — `BUILT`

### 1.1 Components the author-facing tokens do NOT apply to

| Component | Why | Status |
| :--- | :--- | :--- |
| `SECTION_HERO` | Own media engine (desktop/mobile uploads, scrim colour + opacity) and own typography presets. Declares no `fixedBg`, because its background is an image. | `BUILT` |
| `SECTION_PRICES`, `SECTION_TRUST`, `SECTION_FOOTER`, `SECTION_SUBSCRIPTION`, `SECTION_CONTACT` | No `bg_color` field. Each declares a fixed `fixedBg` on its section type instead: `#FFFFFF` (Prices, Contact, Subscription), `#0B0B0B` (Trust), `#111111` (Footer). `fixedBg` exists so `renderPage`'s same-background divider test can compare them. | `BUILT` |

### 1.2 Components that consume these tokens

Exactly the seven `DYNAMIC` types — the ones whose fields include `appearanceGroup()` and
`headingFields()` from `src/sections/_common.js`:

| `component_key` | Status |
| :--- | :--- |
| `SECTION_QUICK_FACTS` | `BUILT` |
| `SECTION_MULTI_CARD_GRID` | `BUILT` |
| `SECTION_LARGE_IMAGE_BANNER` | `BUILT` |
| `SECTION_TEXT_MEDIA` | `BUILT` |
| `SECTION_LOGO_MARQUEE` | `BUILT` |
| `SECTION_FEATURE` (presets `S` / `M` / `L`) | `BUILT` |
| `SECTION_FAQ` | `BUILT` |

**Feature preset naming correction over v1.** v1 §1.2 called the Feature variants
`Highlighted` / `Standard` / `Compact`. Those names exist nowhere in the code. The field is
`_preset` and its values are the three literals `'S'`, `'M'`, `'L'` (`PRESETS`,
`src/sections/feature.js`). Each preset fixes `icon_size`, `item_count`, `has_paragraph` and
`heading_size` together; there is no independent control for any of them. — `BUILT`

---

## 2. BACKGROUND COLOUR PALETTE

### 2.1 What `bg_color` actually stores

`appearanceGroup()` declares `bg_color` as `kind: 'color'` with `alpha: true` and
`presets: BG_PRESETS`. The value written to the document is a **CSS colour string — in
practice an 8-digit hex** — never a token identifier. `'BG_WHITE'` is a label on a preset
button, not a storable value; a section's `defaults.bg_color` is the literal `'#FFFFFF'`. A
free colour outside the preset row is permitted and carries no brand guarantee. — `BUILT`

### 2.2 The three brand presets

`BG_PRESETS` (`src/model/enums.js`):

| Token id (preset label) | Stored value | CSS variable declared in `:root` | Variable's value | Status |
| :--- | :--- | :--- | :--- | :--- |
| `BG_WHITE` | `#FFFFFF` | `--bg-white` | `#FFFFFF` | `BUILT` |
| `BG_LIGHT_GREY` | `#0000000A` (`BG_LIGHT_GREY` constant) | `--bg-light-grey` | `rgba(0,0,0,.04)` | `BUILT` |
| `BG_LIGHT_BRONZE` | `#F7F2EE` (`BG_LIGHT_BRONZE` constant) | `--bg-light-bronze` | `#F7F2EE` | `BUILT` |

**The hex forms in `src/model/enums.js` are canonical.** They are what the colour picker
offers, what a section's `defaults` carry and what `dynamicShell()` writes into the inline
style. The CSS variables are a second, independent declaration of the same three colours.

| Finding | Status |
| :--- | :--- |
| `BG_LIGHT_GREY` is declared twice in two notations that are not byte-equal: `'#0000000A'` in `enums.js` (alpha `10/255 = 0.0392`) and `rgba(0,0,0,.04)` in `tokens.js` (alpha `0.04`). Nothing derives one from the other, so the two can drift and today already differ in the third decimal. | `DEFECT` |
| `INK` is declared twice the same way: `'#000000E0'` in `enums.js` (alpha `224/255 = 0.8784`) and `--ink: rgba(0,0,0,.88)` in `tokens.js`. The hex form is canonical — it is what `INK_PRESETS` offers to a colour field. | `DEFECT` |
| A section's background is applied as an **inline style** by `dynamicShell()`, not through a CSS variable: `style({ background: p.bg_color, '--section-bg': p.bg_color \|\| '#FFFFFF' })`. The `--bg-*` variables are therefore not the mechanism by which a section gets its background. | `BUILT` |
| `--section-bg` is exposed on the `<section>` so descendants can match the section's own background exactly whatever the author set (e.g. a photo's cutout stroke). | `BUILT` |
| The `--bg-*` variables are read in three places only: `--bg-white` by `body` in `BASE_CSS`, `--bg-light-grey` by `.sub-card` in `src/sections/subscription.js`, `--bg-light-bronze` by `.prow-chevron` in `src/sections/prices.js`. | `BUILT` |

### 2.3 Other colour presets offered by the editor

| Constant | Values | Consumed by | Status |
| :--- | :--- | :--- | :--- |
| `ACCENT_PRESETS` | `BRONZE #B8876E`, `#000000`, `#FFFFFF` | `src/sections/hero.js` (badges, buttons) | `BUILT` |
| `INK_PRESETS` | `#FFFFFF`, `INK #000000E0`, `BRONZE #B8876E` | `src/sections/hero.js` | `BUILT` |
| `SCRIM_PRESETS` | `#000000`, `#FFFFFF` | `src/sections/hero.js` (overlay over a photo — only ever a neutral) | `BUILT` |

---

## 3. SECTION HEADER ENGINE (DYNAMIC SECTIONS ONLY)

### 3.1 Title size presets (`heading_size`)

The field is a three-way segmented control (`SIZE_OPTS` in `src/sections/_common.js`), read
left to right small-to-large. `dynamicShell()` maps the value to a class via
`SIZE_CLASS = { SIZE_S: 'h-s', SIZE_M: 'h-m', SIZE_L: 'h-l' }`, defaulting to `h-m` for an
unrecognised value. `BASE_CSS` sizes `.sec-title` from the matching variable.

| Value | Class | Desktop | Mobile (`max-width:767px`) | Weight | Line height | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `SIZE_S` | `.h-s` | `--h-s` → `--headline-s` = `24px` | `--h-s-mobile` → `20px` | `--h-weight` = `700` | `1.2` (from `.sec-title`) | `BUILT` |
| `SIZE_M` | `.h-m` | `--h-m` → `--headline-m` = `32px` | `--h-m-mobile` → `24px` | `700` | `1.2` | `BUILT` |
| `SIZE_L` | `.h-l` | `--h-l` → `--headline-l` = `40px` | `--h-l-mobile` → `28px` | `700` | `1.15` (overridden on `.h-l .sec-title`) | `BUILT` |

`.sec-title` also carries `letter-spacing:-.02em`, and a bottom margin of `8px` for S/M and
`12px` for L. — `BUILT`

### 3.2 Title alignment presets (`heading_align`)

Two-way segmented control (`ALIGN_OPTS`). `dynamicShell()` maps via
`ALIGN_CLASS = { ALIGN_LEFT: 'a-left', ALIGN_CENTER: 'a-center' }`, defaulting to `a-left`.

| Value | Emitted class | CSS | Status |
| :--- | :--- | :--- | :--- |
| `ALIGN_CENTER` | `.a-center` | `.sec.a-center{text-align:center}` plus `.sec.a-center .sec-head{margin-left:auto;margin-right:auto}` | `BUILT` |
| `ALIGN_LEFT` | `.a-left` | No rule is declared for `.a-left` anywhere in `src/`. Left alignment is correct because it is the inherited default; the class is emitted as a hook and styles nothing. | `BUILT` |

### 3.3 Header group and subheading rules

| Rule | Status |
| :--- | :--- |
| The header is `sectionHeader(props)`: an `<h2 class="sec-title">` and a `<div class="sec-sub">`. | `BUILT` |
| The whole `.sec-head` wrapper is omitted when the title is blank **and** the subheading is blank (`blankRich()`), so an unused header leaves no vertical gap. | `BUILT` |
| The subheading always renders directly below the title and inherits alignment from the parent `.sec` class — it has no alignment field of its own. | `BUILT` |
| The subheading accepts inline rich text; the tool set is `RT_FULL = ['b','i','s','color','ul','ol','link']`. `rich()` emits stored HTML unsanitised — the only writer is an authenticated admin and the output is a static file. | `BUILT` |
| Subheading type is `color:var(--ink-soft); font-size:17px` — a hardcoded literal, not a token. v1 quoted a `16–18px` body scale; the implementation is a single fixed `17px`. | `BUILT` |
| `.sec-head` is capped at `max-width:760px`; section vertical padding is `var(--section-y)`. | `BUILT` |

---

## 4. THE FULL TOKEN REGISTRY (`:root`)

Everything declared by `TOKENS_CSS`. "Read by" counts references across `src/render/base.js`
and `src/sections/*.js`.

### 4.1 Colour and surface

| Variable | Value | Status |
| :--- | :--- | :--- |
| `--bg-white` | `#FFFFFF` | `BUILT` |
| `--bg-light-grey` | `rgba(0,0,0,.04)` | `BUILT` |
| `--bg-light-bronze` | `#F7F2EE` | `BUILT` |
| `--ink` | `rgba(0,0,0,.88)` | `BUILT` |
| `--ink-soft` | `rgba(0,0,0,.62)` | `BUILT` |
| `--ink-faint` | `rgba(0,0,0,.42)` | `BUILT` |
| `--bronze` | `#B8876E` | `BUILT` |
| `--line` | `rgba(0,0,0,.12)` | `BUILT` |
| `--on-dark` | `#FFFFFF` | `BUILT` |

### 4.2 Typography

Gilroy ships embedded as ten `@font-face` rules — five weights (400/500/600/700/800), each
with a real italic cut, as base64 TTF data URIs with `font-display:swap`. The exported page
carries no external font request. — `BUILT`

| Variable | Value | Status |
| :--- | :--- | :--- |
| `--font` | `'Gilroy', -apple-system, BlinkMacSystemFont, "Segoe UI", Inter, Roboto, Helvetica, Arial, sans-serif` | `BUILT` |
| `--display-weight` | `800` — the emphasis weight for text bolded *inside* an already-bold heading (the Hero H1) | `BUILT` |
| `--headline-l / -m / -s` | `40px` / `32px` / `24px` | `BUILT` |
| `--headline-l-mobile / -m-mobile / -s-mobile` | `28px` / `24px` / `20px` | `BUILT` |
| `--headline-weight` | `700` | `BUILT` |
| `--h-l`, `--h-m`, `--h-s`, `--h-l-mobile`, `--h-m-mobile`, `--h-s-mobile`, `--h-weight` | Aliases onto the `--headline-*` set; these are the names `BASE_CSS` and the sections actually reference. | `BUILT` |
| `--body-l` | `16px` — set on `body` and read by three section rules | `BUILT` |
| `--body-weight` | `500` — set on `body` | `BUILT` |
| `--title-weight` | `600` — read by eight section rules | `BUILT` |
| `--title-l`, `--title-m`, `--title-s` (`20px`/`18px`/`16px`) | Declared in `:root` and referenced by no rule in `src/`. The Title role's sizes are written as literals at each call site instead. | `DEFECT` |
| `--body-m`, `--body-s` (`14px`/`12px`) | Declared and referenced by no rule in `src/`. | `DEFECT` |
| `--label-l`, `--label-m`, `--label-s` (`14px`/`13px`/`12px`), `--label-weight` (`600`) | Declared and referenced by no rule in `src/`. | `DEFECT` |

**Scale of the gap:** across `BASE_CSS` and the thirteen section modules there are 77 literal
`font-size:<n>px` declarations against 11 that read a token. The five-role scale (Display,
Headline, Title, Body, Label) is real and documented in the source, but only the Headline
row, `--body-l`, `--title-weight` and the three weights are wired to anything.

### 4.3 Geometry

| Variable | Desktop | `max-width:767px` override | Status |
| :--- | :--- | :--- | :--- |
| `--container` | `1180px` | — | `BUILT` |
| `--gutter` | `24px` | `20px` | `BUILT` |
| `--section-y` | `72px` | `48px` | `BUILT` |
| `--radius` | `10px` | — | `BUILT` |
| `--radius-sm` | `8px` | — | `BUILT` |
| `--radius-pill` | `999px` | — | `BUILT` |
| `--header-offset` | `24px` | — | `BUILT` |

The mobile override is the only media query in `TOKENS_CSS`. It is written as the literal
`767px`, not derived from `BREAKPOINT` in `src/model/enums.js` — see `SYS-02 §5`. — `DEFECT`

### 4.4 Shared shell rules that are not tokens

| Rule | Status |
| :--- | :--- |
| `.wrap{max-width:var(--container);margin:0 auto;padding:0 var(--gutter)}` — one container for every section. | `BUILT` |
| `.lpb-divider` — a hairline seam `renderPage()` inserts between two consecutive sections that resolve to the same flat background (`bg_color`, else the type's `fixedBg`). Colour `rgba(128,128,128,.25)`, capped at `1280px` with `80px` padding and `background-clip:content-box`, so it starts and ends where the copy does. Below `767px` it falls back to `--container` / `--gutter`. | `BUILT` |
| `:focus-visible{outline:2px solid var(--bronze);outline-offset:3px}` — one global focus ring. | `BUILT` |
| `@media (prefers-reduced-motion:reduce)` in `BASE_CSS` forces `scroll-behavior:auto` and collapses every animation and transition to `.001ms`. Section-level reduced-motion behaviour (the Logo Marquee falling back to a scrollable row) is additionally handled in `RUNTIME_JS`. | `BUILT` |

---

## 5. SYSTEM DEFAULTS MAPPING MATRIX

The values a fresh instance receives, read from each section module's own `defaults` object
via `defaultsFor(key)`. These are the real stored values — hex strings for `bg_color`, not
token identifiers.

| `component_key` | `bg_color` | `heading_size` | `heading_align` | Status |
| :--- | :--- | :--- | :--- | :--- |
| `SECTION_QUICK_FACTS` | `#FFFFFF` | `SIZE_M` | `ALIGN_LEFT` | `BUILT` |
| `SECTION_MULTI_CARD_GRID` | `#FFFFFF` | `SIZE_M` | `ALIGN_CENTER` | `BUILT` |
| `SECTION_LARGE_IMAGE_BANNER` | `#FFFFFF` | `SIZE_L` | `ALIGN_CENTER` | `BUILT` |
| `SECTION_TEXT_MEDIA` | `#FFFFFF` | `SIZE_M` | `ALIGN_LEFT` | `BUILT` |
| `SECTION_LOGO_MARQUEE` | `#0000000A` (`BG_LIGHT_GREY`) | `SIZE_S` | `ALIGN_CENTER` | `BUILT` |
| `SECTION_FEATURE` | `#FFFFFF` | `SIZE_L` | `ALIGN_CENTER` | `BUILT` |
| `SECTION_FAQ` | `#FFFFFF` | `SIZE_L` | `ALIGN_LEFT` | `BUILT` |

**Two corrections over v1 §4.** v1 gave `SECTION_FEATURE` a default `heading_size` of
`SIZE_M`; `src/sections/feature.js` declares `SIZE_L`, and the code wins. v1 had no row for
`SECTION_FAQ` at all.

A section whose heading scale is fixed by its own layout passes `scale: false` to
`headingFields()`: the size and alignment controls disappear from the panel, but the value
still comes from `defaults` and still reaches `dynamicShell()`. — `BUILT`
