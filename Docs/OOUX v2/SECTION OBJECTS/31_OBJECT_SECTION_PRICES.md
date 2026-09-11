# `31_OBJECT_SECTION_PRICES.md`

```yaml
METACLASS: CONCRETE_OBJECT
OBJECT_ID: OBJ-31-PRICES-SECTION
VERSION: 2.0.0
STATUS: APPROVED
DEPENDS_ON: SYS-02-ENUMS, OBJ-21-FLIGHT-QUOTE-MODAL, OBJ-33-FOOTER-SECTION
INHERITS_FROM: OBJ-10-BASE-SECTION
STRUCTURAL_ROLE: FIXED_ANCHOR
SOURCE_MODULE: src/sections/prices.js
TARGET_AUDIENCE: [LLM_AGENT, BACKEND_DEV, FRONTEND_DEV, UI_DESIGNER]
```

---

## 1. OBJECT DEFINITION
The transactional anchor at Slot `02`. A sticky media column beside a fare table of 1..30
`50_OBJECT_PRICE_ROW_ITEM` rows, with optional region tabs, four master column toggles, a
seven-column bulk importer, and a row click that opens the lead modal. Like the Hero it runs its
own container spec (`max-width: 1280px; padding: 0 80px`) rather than the shared `.sec`/`.wrap`.

---

## 2. RELATIONSHIPS (OOUX ORCA MAPPING)

- **Inherits From (Parent):** `10_ABSTRACT_OBJECT_PAGE_SECTION` (`section_id`, `slot_index: 02`,
  `order_in_slot: 0`, `is_mandatory: true`, `position_type: 'Fixed'`, `is_visible: true`).
- **Belongs To (N:1):** `OBJECT_LANDING_PAGE`. Reads `page.route.currency_code`.
- **Has Many (1:N, Ordered):** `50_OBJECT_PRICE_ROW_ITEM`, `min: 1`, `max: 30` (`MAX_ROWS`).
- **Triggers (1:1 Event):** opens `#lead-modal` on row activation. What actually crosses the
  boundary is recorded in §6.4 and in doc 50 §5.5 — it is less than v1 promised.
- **Reads (N:1 Global, read-only):** `GlobalFooterConfig.legal_disclaimers` — its presence is what
  switches each row's price asterisk on.
- **Background:** not configurable. The type declares `fixedBg: '#FFFFFF'`, which exists so the
  page-level same-background divider can compare this section against its neighbours.

---

## 3. OBJECT LIFECYCLE & ADMIN CTAs

| Action (CTA) | Admin UI Location | System Behavior |
| :--- | :--- | :--- |
| **Insert** | — | **UNAVAILABLE.** Anchors are created with the page, seeded from §5. |
| **Edit Table Config** | Inspector Drawer | Four groups, in panel order: **Content** (open), **Table** (open), **Rows** (open), **Media**. |
| **Add Row Item** | Rows group (`+ Add row`) | Appends one item. The button disappears once the array holds 30. See doc 50 §3 for what the appended object actually contains. |
| **Bulk Import Rows** | Rows group (`Bulk import`) | Opens the parser dialog; the two actions are **Replace all rows** and **Append** (primary). |
| **Toggle Visibility** | Outline row menu | **LOCKED.** Anchor rows are `pinned`; no row menu is rendered. |
| **Delete** | Outline row menu | **LOCKED.** Same mechanism. |
| **Reorder** | Outline / drag | **LOCKED.** Pinned to slot `02`. |

---

## 4. ATTRIBUTES MATRIX

### 4.1 Sticky Media Column (Visual Assets)

| Attribute Name | Data Type | Required | Default Value | Status | Description & Constraints |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `media_layout_type` | `Enum` | Yes | `'1 Image'` | `BUILT` | [`1 Image`, `2 Images`]. There is no "no media" mode: the column always renders, showing a placeholder until something is uploaded. |
| `media_image_single` | `Media` | If `1 Image` | `null` | `PLANNED` | The field and the `when` gate are `BUILT`; the **required-if validation is not**. `validate()` checks rows only, so an empty media slot never blocks publishing — it renders the striped "Image" placeholder. Ratio `1:1` is an advisory picker hint. |
| `media_image_large` | `Media` | If `2 Images` | `null` | `PLANNED` | Same: no required-if guard. Renders as `.pm-big` (72% width, front layer). |
| `media_image_small` | `Media` | If `2 Images` | `null` | `PLANNED` | Same: no required-if guard. Renders as `.pm-small` (42% width, back layer). |

* **Sticky behaviour:** `.prices-media { position: sticky; top: 80px; }` — a **hardcoded 80px**,
  not `var(--header-offset)`. No such token is defined or read anywhere. `BUILT` as written;
  the token-driven offset v1 specified is `PLANNED`.

---

### 4.2 Section Typography Group

| Attribute Name | Data Type | Required | Default Value | Status | Description & Constraints |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `section_title` | `String` | No | `'Our fares to London'` | `BUILT` | Renders as `.prices-title` at a fixed 32px / `letter-spacing: -.02em`. Omitted from the DOM when blank. |
| `subheading` | `RichText` | No | `null` | `BUILT` | Toolset `RT_FULL`. Hidden when blank. |
| `footer_paragraph` | `RichText` | No | seed copy | `BUILT` | Labelled **Footnote** in the panel and grouped with the copy, not with table setup. Rendered as `.prices-note` below the table, outside the table's own rhythm. Hidden when blank. |
| `title_color` | `RGBA` | — | — | `PLANNED` | **Removed deliberately.** The heading is fixed CSS. |
| `title_weight` | `Enum` | — | — | `PLANNED` | **Removed deliberately.** Same reason. |
| `title_italic` | `Boolean` | — | — | `PLANNED` | **Removed deliberately.** Same reason. |
| `heading_size` / `heading_align` | `Enum` | — | — | `PLANNED` | Not offered. This section does not use the shared `headingFields()` helper; its header is three plain content fields. |

> These three were dropped on purpose: they duplicated the shared heading component, put styling
> controls between two content fields, and were the one place an author could quietly produce an
> off-brand page. They are listed here so nobody re-adds them as a "missing" feature.

---

### 4.3 Table Global Configuration & Column Headlines

| Attribute Name | Data Type | Required | Default Value | Status | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `table_headline_left` | `String` | No | `'Route & Cabin'` | `BUILT` | The head row is omitted entirely only when **both** headlines are blank. |
| `table_headline_right` | `String` | No | `'Published / Our Fare'` | `BUILT` | Same. |
| `region_tabs_enabled` | `Boolean` | Yes | `false` | `BUILT` | Necessary but not sufficient — see §6.3. |
| `show_global_labels_1_2` | `Boolean` | Yes | `true` | `BUILT` | Master toggle for `label_1` / `label_2`. |
| `show_global_label_3` | `Boolean` | Yes | `true` | `BUILT` | Master toggle for the badge above the price. |
| `show_global_anchor_price` | `Boolean` | Yes | `true` | `BUILT` | Master toggle for the published fare and its divider. |
| `show_global_airline_logo` | `Boolean` | Yes | `true` | `BUILT` | Master toggle for the logo slot. Note it gates the **slot**, not the asset: with the toggle on and no logo uploaded, the placeholder shows, so a forgotten upload stays visible. |
| `anchor_id` | `String` | No | `null` | `PLANNED` | Rendered as the `<section id>` and carried through import/export, but this section declares no `advancedGroup`, so there is no control for it. |

---

### 4.4 Bulk Import Tooling Specification

* **Delimiter syntax — seven columns:**
  `Route|Fare|Published fare|Cabin|Detail|Badge|Region` — `BUILT`.

  `Detail` maps to `label_1`; `Badge` maps to `label_3`. **There is no `label_2` column.** v1's
  header row listed eight fields including `Label 2`, while its own two examples were seven cells
  long; the parser has always destructured seven. `label_2` stays a per-row field, editable after
  import.

| Parser rule | Status | Behaviour |
| :--- | :--- | :--- |
| Pipe delimiter, `\|` escapes a literal pipe | `BUILT` | Split on unescaped `\|` via lookbehind, then unescape. |
| Empty field = nothing between two delimiters | `BUILT` | `Berlin\|\|4,321\|...` leaves the cell empty, so `-` stays representable. |
| One row per line; blank lines skipped | `BUILT` | |
| Minimum two cells | `BUILT` | Fewer: *"Needs at least a route and a fare, separated by \|."* |
| Route and Fare non-empty | `BUILT` | Reported per line. |
| Cabin is prose-tolerant | `BUILT` | Trailing `class` stripped, matched case-insensitively — `Business`, `business`, `Business Class` all resolve. Empty defaults to `Business`. An unrecognised word lists the accepted values. |
| Region must match `SYS-02-ENUMS §2` | `BUILT` | Empty defaults to `Global`. |
| Append / Replace choice is explicit | `BUILT` | Two dialog buttons; there is no default action. |
| Row cap enforced in full | `BUILT` | *"That would make N rows; the maximum is 30."* Nothing is truncated. |
| All-or-nothing error reporting | `BUILT` | Every failing line is listed as `Line N: reason`; nothing is written until every line parses. |
| Not importable | `BUILT` | `airline_logo`, `label_2`, `label_3_is_strikethrough`. (v1 also listed `text_color`; that attribute no longer exists — doc 50 §4.2.) |

* **Sample accepted by the dialog:**
  ```text
  London (LHR)|1,234|4,321|Business|Nonstop|Special Fare|Europe
  ```

---

## 5. DEFAULT BOILERPLATE PRESET PAYLOAD (SEED DATA)

Verbatim from the module's `defaults`. Each seed row is built by `newRow()`, so each carries a
generated `row_id` and the full key set of doc 50 §4.

```yaml
default_preset_payload:
  section_title: "Our fares to London"
  media_layout_type: "1 Image"
  table_headline_left: "Route & Cabin"
  table_headline_right: "Published / Our Fare"
  region_tabs_enabled: false
  show_global_labels_1_2: true
  show_global_label_3: true
  show_global_anchor_price: true
  show_global_airline_logo: true
  footer_paragraph: "<p>Fares shown are per person including taxes and subject to availability.</p>"
  rows:
    - { row_title: "London (LHR)", price_value: "1,234", anchor_price_value: "4,321",
        label_1: "Business Class", label_2: "Nonstop", cabin_class: "Business", region: "Europe" }
    - { row_title: "Paris (CDG)",  price_value: "1,180", anchor_price_value: "3,900",
        label_1: "Business Class", label_2: "1 stop", label_3: "Special fare",
        cabin_class: "Business", region: "Europe" }
    - { row_title: "Tokyo (HND)",  price_value: "2,940", anchor_price_value: "7,450",
        label_1: "First Class",    label_2: "Nonstop", cabin_class: "First", region: "Asia" }
```

> The three seed rows span two non-`Global` regions, so switching `region_tabs_enabled` on in a
> freshly seeded section immediately produces `[All] [Europe] [Asia]`.

---

## 6. BUSINESS RULES & SYSTEM GUARDS (IF -> THEN)

1. **Row Thresholds.** — `BUILT`
   - **IF** `rows` is empty:
     - **THEN** L1 `E103`: *"Prices section must contain at least 1 price row."* Publishing is
       blocked; saving a draft is not.
   - **IF** the array holds 30 rows:
     - **THEN** the `+ Add row` button is not rendered, and a bulk import that would overshoot is
       rejected in full.
   - **IF** any row has a blank `row_title` or `price_value`:
     - **THEN** L1 `E100` against `rows.{i}.{field}`.

2. **Master Column Toggle Precedence.** — `BUILT`
   - **IF** `show_global_anchor_price === false`:
     - **THEN** the published fare and its divider are suppressed across **all** rows regardless of
       per-row data. The same precedence applies to `show_global_labels_1_2`, `show_global_label_3`
       and `show_global_airline_logo`.
   - The toggles are compared with `!== false`, so an absent key behaves as `true`.

3. **Regional Tab Filtering.** — `BUILT`
   - **IF** `region_tabs_enabled === true` **AND** the rows hold at least two distinct non-`Global`
     regions:
     - **THEN** `[All]` plus one tab per distinct value is mounted, `role="tablist"`, and filtering
       runs client-side by toggling `hidden` on each row.
   - **IF** fewer than two distinct non-`Global` regions exist:
     - **THEN** the tab bar is not rendered at all. *(The inspector hint v1 promised is the help
       text on the toggle: "Shown only when the rows span two or more regions besides Global.")*
   - **`Global` rows survive every filter** and contribute no tab of their own.

4. **Lead Modal Dispatch on Row Click.** — `PLANNED`
   - **ACTUAL:** each row is a `<button data-row-quote>` carrying exactly three data attributes —
     `data-destination` (the row title), `data-cabin` and `data-row-region`. The runtime click
     handler forwards **only** `destination` and `cabin_class` into `openLead()`.
   - **Not carried:** `row_id` and `price_value`. v1 specified `{ destination, cabin_class,
     row_id, row_price }`; two of the four are not emitted, so no attribution back to the row or
     to the fare the visitor clicked is possible. That is the `PLANNED` half.
   - **Additionally `DEFECT`:** `cabin_class` *is* carried and *is* written to `[data-lead-cabin]`,
     but the modal markup contains no element with that attribute — the value is dropped at the
     last step. `DEFECTS.md D-05`.
   - `data-row-region` is emitted on every row **unconditionally**, including when region tabs are
     off (doc 50 §5.4).

5. **Row Accessibility Contract.** — `BUILT`
   - Each row is a single `<button>` spanning the row, keyboard-activatable for free, with
     `aria-label="Request a quote for {row_title}, {currency}{price_value}"`. The airline logo is
     decorative markup (`alt=""`), never a nested link — the row holds no other interactive element.

6. **Sticky Column Viewport Constraint.** — `BUILT`
   - **IF** viewport ≥ 1024px:
     - **THEN** the media column is `position: sticky; top: 80px`.
   - **IF** viewport < 1024px:
     - **THEN** the grid collapses to one column and the media column takes `order: -1`, stacking
       **above** the table. It stays `position: relative` rather than `static`, because the
       two-image collage positions its children against it.

7. **Conditional Price Asterisk.** — `BUILT`
   - **IF** `globals.footer.legal_disclaimers` carries visible text:
     - **THEN** every row's fare gets a trailing `*`, pointing at the Footer's shared disclaimer.
   - **IF** it is empty:
     - **THEN** no asterisk anywhere. Same convention as the Hero (doc 30 §6.2); `footer_paragraph`
       does not drive it.
