# `31_OBJECT_SECTION_PRICES.md`

```yaml
METACLASS: CONCRETE_OBJECT
OBJECT_ID: OBJ-31-PRICES-SECTION
VERSION: 1.1.0
STATUS: APPROVED
DEPENDS_ON: SYS-02-ENUMS, OBJ-21-FLIGHT-QUOTE-MODAL
INHERITS_FROM: OBJ-10-BASE-SECTION
TARGET_AUDIENCE: [LLM_AGENT, BACKEND_DEV, FRONTEND_DEV, UI_DESIGNER]
```

---

## 1. OBJECT DEFINITION
The primary transactional anchor block of the landing page (Slot `02`). Displays competitive route fares and cabin options alongside sticky visual assets. Features regional tab filtering, master column toggles, bulk data import capabilities, and direct lead generation dispatch via the Flight Quote Modal.

---

## 2. RELATIONSHIPS (OOUX ORCA MAPPING)

- **Inherits From (Parent):** `10_ABSTRACT_OBJECT_PAGE_SECTION` (Inherits `section_id`, `slot_index: 02`, `order_in_slot: 0`, `is_mandatory: true`, `position_type: 'Fixed'`).
- **Belongs To (N:1):** `OBJECT_LANDING_PAGE`.
- **Has Many (1:N, Ordered):** `50_OBJECT_PRICE_ROW_ITEM` (Array of route pricing entries, constrained between 1 and 30 items).
- **Triggers (1:1 Event):** Dispatches `OPEN_FLIGHT_QUOTE_MODAL` with `{ destination, cabin_class, row_id, row_price }` on row click (doc 21 §4).

---

## 3. OBJECT LIFECYCLE & ADMIN CTAs

| Action (CTA) | Admin UI Location | System Behavior |
| :--- | :--- | :--- |
| **Edit Table Config** | Section Inspector Drawer | Modifies column headlines, global visibility toggles, and media assets. |
| **Add Row Item** | Below Row Table (`+ Add Row`) | Appends a new `50_OBJECT_PRICE_ROW_ITEM` instance (up to 30 max). |
| **Bulk Import Rows** | Table Toolbar (`Import via Text`) | Opens text area parser to batch-generate rows via slash-delimited syntax. |
| **Toggle Visibility** | Section Settings | **LOCKED / DISABLED.** Mandatory anchor; `is_visible` is permanently `true`. |
| **Delete** | Section Actions | **LOCKED / DISABLED.** Cannot be removed (`is_mandatory === true`). |
| **Reorder** | Section Actions | **LOCKED / DISABLED.** Pinned permanently to Slot `02`. |

---

## 4. ATTRIBUTES MATRIX

### 4.1 Sticky Media Column (Visual Assets)

| Attribute Name | Data Type | Required | Default Value | Description & Constraints |
| :--- | :--- | :--- | :--- | :--- |
| `media_layout_type` | `Enum` | Yes | `'1 Image'` | [`1 Image`, `2 Images`]. |
| `media_image_single` | `File` | If `1 Image` | `null` | Square aspect ratio (**1:1**). Formats: `JPG`, `PNG`, `WebP`. |
| `media_image_large` | `File` | If `2 Images` | `null` | Square aspect ratio (**1:1**). Formats: `JPG`, `PNG`, `WebP`. |
| `media_image_small` | `File` | If `2 Images` | `null` | Square aspect ratio (**1:1**). Formats: `JPG`, `PNG`, `WebP`. |

* **CSS Runtime Behavior:** The entire media container utilizes `position: sticky; top: var(--header-offset);`, remaining locked in the viewport while the user scrolls down the pricing table.

---

### 4.2 Section Typography Group

| Attribute Name | Data Type | Required | Default Value | Description & Constraints |
| :--- | :--- | :--- | :--- | :--- |
| `section_title` | `String` | No | `null` | Main heading. If empty, omitted from DOM. |
| `title_color` | `RGBA` | Yes | `rgba(0,0,0,0.88)` | Hex/RGBA picker for section title. |
| `title_weight` | `Enum` | Yes | `'Bold'` | [`Regular`, `Bold`]. |
| `title_italic` | `Boolean` | Yes | `false` | Independent axis from `title_weight`. |
| `subheading` | `RichText` | No | `null` | Optional subtitle. Supports bold, italic, strike, per-character color, lists, breaks. Hidden if empty. |
| `footer_paragraph` | `RichText` | No | `null` | Disclaimer/footnote placed below table. Supports hyperlinks, lists, formatting. Hidden if empty. |

---

### 4.3 Table Global Configuration & Column Headlines

| Attribute Name | Data Type | Required | Default Value | Description |
| :--- | :--- | :--- | :--- | :--- |
| `table_headline_left` | `String` | No | `"Route & Cabin"` | Header label for the left column. Hidden if blank. |
| `table_headline_right`| `String` | No | `"Published / Our Fare"` | Header label for the right column. Hidden if blank. |
| `region_tabs_enabled` | `Boolean` | Yes | `false` | When `true`, renders category tabs at the top of the table. |
| `show_global_labels_1_2` | `Boolean` | Yes | `true` | Master toggle to hide/show route details under row titles. |
| `show_global_label_3` | `Boolean` | Yes | `true` | Master toggle to hide/show details above row prices. |
| `show_global_anchor_price` | `Boolean` | Yes | `true` | Master toggle to hide/show strikethrough original fares. |
| `show_global_airline_logo` | `Boolean` | Yes | `true` | Master toggle to hide/show carrier brand logos. |

---

### 4.4 Bulk Import Tooling Specification

* **Delimiter Syntax:** `Row title|Price|Anchor price|Cabin|Label 1|Label 2|Label 3|Region`
* **Parser Ingestion Rules:**
  - **Delimiter is the pipe `|`.** A literal `|` inside a value is escaped as `\|`.
    (A slash delimiter is unusable: `/` occurs inside real values, e.g. `"Published / Our Fare"`.)
  - **Empty field = nothing between two delimiters** (`Berlin||4,321|...`), so the literal
    value `-` stays representable.
  - Line breaks (`\n`) define new rows. Blank lines are skipped.
  - `Cabin` must match the `cabin_class` enum (`Business` / `First` / `Premium Economy`);
    empty defaults to `Business`. `Region` must match `SYS-02-ENUMS §2`; an unknown value
    fails that line.
  - **Mode selector:** the import dialog requires an explicit choice of **Append** or
    **Replace all rows** before it will run.
  - **Row cap:** if existing rows + imported rows would exceed `30`, the import is rejected in
    full with the overflow count; it never truncates silently.
  - **Error reporting:** parsing is all-or-nothing. Malformed lines are listed by line number
    with the reason, and nothing is written until every line parses.
  - Not importable (set per row afterwards): `airline_logo`, `label_3_is_strikethrough`,
    `text_color`.
  - Example raw text input:
    ```text
    Berlin|1,234|4,321|Business|Nonstop||Europe
    Paris|999|2,500|Premium Economy|1 Stop|Special Fare|Europe
    ```

---

## 5. BUSINESS RULES & SYSTEM GUARDS (IF -> THEN)

1. **Mandatory Row Thresholds:**
   - **IF** Admin attempts to save the section with zero active rows:
     - **THEN** Validation throws an error: `Prices Section must contain at least 1 Price Row.`
   - **IF** Table reaches `30` rows:
     - **THEN** The `+ Add Row` button transitions to `disabled` state.

2. **Master Column Toggle Precedence:**
   - **IF** `show_global_anchor_price === false`:
     - **THEN** The `anchor_price` element is suppressed across **ALL rows**, regardless of whether individual rows have anchor price data filled. (Same precedence applies to Labels 1–3 and Airline Logo).

3. **Regional Tab Filtering Logic:**
   - **IF** `region_tabs_enabled === true` **AND** the rows contain **at least 2 distinct
     non-`Global` regions**:
     - **THEN** Frontend mounts `[All] [Europe] [Asia] ...` from those distinct values and
       filters client-side without reload.
   - **IF** fewer than 2 distinct non-`Global` regions exist:
     - **THEN** the tab bar is **not rendered** at all (a lone `[All]` tab is not a filter), and
       the inspector shows a hint explaining why.
   - **`Global` rows are shown under every tab.** `Global` means "applies everywhere": it never
     gets a tab of its own and is never filtered out.

4. **Lead Modal Trigger on Row Click:**
   - **IF** User activates a rendered price row:
     - **THEN** The system dispatches `OPEN_FLIGHT_QUOTE_MODAL` with the payload in doc 50 §5.5.
   - **Accessibility contract:** each row is a single focusable control — `<button>` (or `<a>`)
     spanning the row, keyboard-activatable with `Enter`/`Space`, with an accessible name of the
     form *"Request a quote for {row_title}, {price}"*. A row must never be a `div` with a click
     handler. Nested interactive elements inside the row are forbidden, so the airline logo is
     decorative markup, not a second link.

5. **Sticky Column Viewport Constraint:**
   - **IF** Viewport is desktop ($\ge 1024px$):
     - **THEN** Media column applies `position: sticky`.
   - **IF** Viewport is mobile/tablet ($< 1024px$):
     - **THEN** Media column drops sticky behavior and stacks statically **above** the pricing
       table.
