# `01_SYSTEM_GLOBAL_DESIGN_TOKENS.md`

```yaml
METACLASS: SYSTEM_SPECIFICATION (NOT AN OBJECT)
DOCUMENT_ID: SYS-01-TOKENS
VERSION: 1.2.0
STATUS: APPROVED
DEPENDS_ON: SYS-02-ENUMS
SCOPE: DYNAMIC_SECTIONS_STYLING_ONLY
TARGET_AUDIENCE: [LLM_AGENT, FRONTEND_DEV, UI_DESIGNER]
```

---

## 1. SCOPE & BOUNDARIES

Defines the design tokens available to content managers for styling instances of **Dynamic Sections**.

### 1.1 Excluded Components (Tokens Do NOT Apply)
These tokens **MUST NOT** be applied to:
1. **Hero Section:** Governed by an independent media engine (Desktop/Mobile image uploaders, custom overlay color, opacity slider) and proprietary typography presets (`Title 1: 56px`, `Title 2: 48px`).
2. **Fixed Anchor & Global Static Sections (`Trust`, `Footer`, `Subscription`, `Contact`):** Visual styles, themes, and backgrounds are hardcoded to global brand standards or controlled via dedicated layout mode switches (`Extended` vs `Compact`).

### 1.2 Applicable Components
Only concrete instances inheriting from `ABSTRACT_OBJECT_DYNAMIC_SECTION` consume these tokens:
* `SECTION_QUICK_FACTS`
* `SECTION_MULTI_CARD_GRID`
* `SECTION_LARGE_IMAGE_BANNER`
* `SECTION_TEXT_MEDIA`
* `SECTION_LOGO_MARQUEE`
* `SECTION_FEATURE` (All variants: `Highlighted`, `Standard`, `Compact`)

*(Keys above are canonical per `SYS-02-ENUMS §1`.)*

---

## 2. BACKGROUND COLOR PALETTE

Dynamic sections offer three brand background presets. The control is a colour picker whose
preset row carries these tokens; a custom value is permitted but unbranded.

```typescript
type DynamicSectionBgPreset = 'BG_WHITE' | 'BG_LIGHT_GREY' | 'BG_LIGHT_BRONZE';
type DynamicSectionBgValue  = DynamicSectionBgPreset | CssColor;   // custom allowed
```

> The presets are the branded path and cover the intended rhythm of the page. A custom value is
> permitted as an escape hatch but carries no brand guarantee.

| Token ID | CSS Variable | Hex / RGBA Value | Description |
| :--- | :--- | :--- | :--- |
| `BG_WHITE` | `--color-bg-white` | `#FFFFFF` | **Default.** Neutral white canvas. |
| `BG_LIGHT_GREY` | `--color-bg-light-grey` | `rgba(0, 0, 0, 0.04)` | Subtle 4% black tint for visual rhythm separation. |
| `BG_LIGHT_BRONZE` | `--color-bg-light-bronze` | `#F7F2EE` | Warm sand/bronze accent for editorial blocks. |

---

## 3. SECTION HEADER ENGINE (DYNAMIC SECTIONS ONLY)

Controls typography scale and justification for the intro header group (`Title` + `Subheading`).

### 3.1 Title Size Presets (`heading_size`)
Standardizes section title font scales across viewports:

| Size Preset | Desktop Size | Mobile Size | Weight | Line Height |
| :--- | :--- | :--- | :--- | :--- |
| `SIZE_S` | `24px` (`1.5rem`) | `20px` (`1.25rem`) | `Bold (700)` | `1.2` |
| `SIZE_M` | `32px` (`2.0rem`) | `24px` (`1.5rem`) | `Bold (700)` | `1.2` |
| `SIZE_L` | `40px` (`2.5rem`) | `28px` (`1.75rem`) | `Bold (700)` | `1.15` |

### 3.2 Title Alignment Presets (`heading_align`)
Defines the horizontal justification of the title and subheading group:
* `ALIGN_LEFT`: `text-align: left; align-items: flex-start;`
* `ALIGN_CENTER`: `text-align: center; align-items: center;`

### 3.3 Subheading Rules
* **Placement:** Always rendered directly below the main Section Title.
* **Inheritance:** Automatically inherits `heading_align` from the parent Title.
* **Formatting:** Body text scale (`16px` – `18px`), supporting inline rich-text (bold, italic, strikethrough, per-character color).

---

## 4. SYSTEM DEFAULTS MAPPING MATRIX

When an admin initializes a dynamic section, the engine injects these default values:

| Dynamic Component Key | Default `bg_color` | Default `heading_size` | Default `heading_align` |
| :--- | :--- | :--- | :--- |
| `SECTION_QUICK_FACTS` | `BG_WHITE` | `SIZE_M` | `ALIGN_LEFT` |
| `SECTION_MULTI_CARD_GRID` | `BG_WHITE` | `SIZE_M` | `ALIGN_CENTER` |
| `SECTION_LARGE_IMAGE_BANNER`| `BG_WHITE` | `SIZE_L` | `ALIGN_CENTER` |
| `SECTION_TEXT_MEDIA` | `BG_WHITE` | `SIZE_M` | `ALIGN_LEFT` |
| `SECTION_LOGO_MARQUEE` | `BG_LIGHT_GREY` | `SIZE_S` | `ALIGN_CENTER` |
| `SECTION_FEATURE` | `BG_WHITE` | `SIZE_M` | `ALIGN_CENTER` |
