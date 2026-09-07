# `50_OBJECT_PRICE_ROW_ITEM.md`

```yaml
METACLASS: CONCRETE_OBJECT
OBJECT_ID: OBJ-50-PRICE-ROW-ITEM
VERSION: 1.1.0
STATUS: APPROVED
DEPENDS_ON: SYS-02-ENUMS
INHERITANCE: CHILD_EMBEDDED_ENTITY
TARGET_AUDIENCE: [LLM_AGENT, BACKEND_DEV, FRONTEND_DEV, UI_DESIGNER]
```

---

## 1. OBJECT DEFINITION
A child entity representing an individual flight deal or route fare inside a `31_OBJECT_SECTION_PRICES` table. Holds route metadata, comparative pricing figures, airline identity, regional classification, and dispatches the destination payload to the Flight Quote Modal upon interaction.

---

## 2. RELATIONSHIPS (OOUX ORCA MAPPING)

- **Belongs To (N:1):** `31_OBJECT_SECTION_PRICES` (Cannot exist as a standalone entity outside of its parent Prices table).
- **Triggers (1:1 Event):** Dispatches `OPEN_FLIGHT_QUOTE_MODAL` (doc 21) — payload in §5.5.

---

## 3. OBJECT LIFECYCLE & ADMIN CTAs

| Action (CTA) | Admin UI Location | System Behavior |
| :--- | :--- | :--- |
| **Create (Manual)** | Below table (`+ Add Row`) | Appends a new blank row with system default values (`region: 'Global'`). |
| **Create (Bulk)** | Table Toolbar (`Bulk Import`) | Ingests slash-delimited strings to batch-instantiate multiple row entities. |
| **Edit** | Click on row in table list | Opens row editing drawer/modal containing all row attributes. |
| **Reorder (Up/Down)**| Row row action buttons / Drag | Adjusts relative vertical sequence within the parent table. |
| **Duplicate** | Row actions dropdown | Clones row attributes into a new instance directly beneath the source row. |
| **Delete** | Row actions (Trash icon) | Removes row instance from parent table array. |

---

## 4. ATTRIBUTES MATRIX

### 4.1 Core Route & Pricing Attributes

| Attribute Name | Data Type | Required | Default Value | Description & Constraints |
| :--- | :--- | :--- | :--- | :--- |
| `row_id` | `UUIDv4` | Yes | `AUTO_GEN` | Unique identifier for row instance and telemetry tracking. |
| `row_title` | `String` | **Yes** | `None` | **MANDATORY.** Primary route name/destination (e.g., `"London (LHR)"` or `"Paris"`). Injected into Quote Modal as `Destination`. |
| `price_value` | `String` | **Yes** | `None` | **MANDATORY.** Active offer / our fare (e.g., enters `1,234` -> renders `$1,234`). |
| `anchor_price_value`| `String` | No | `null` | Published baseline fare (e.g., enters `4,321` -> renders `~~$4,321~~`). Strikethrough is applied automatically. |
| `cabin_class` | `Enum` | Yes | `'Business'` | [`Business`, `First`, `Premium Economy`]. **Machine-readable cabin**, hydrated into the quote modal. `label_1` is never parsed for this. |

---

### 4.2 Labels, Airline Media & Styling Attributes

| Attribute Name | Data Type | Required | Default Value | Description & Constraints |
| :--- | :--- | :--- | :--- | :--- |
| `label_1` | `String` | No | `null` | Primary route detail below title (e.g., `"Business Class"`). **Presentational only** — never parsed by the lead engine. |
| `label_2` | `String` | No | `null` | Secondary route detail below title (e.g., `"Nonstop"` or `"1 Stop"`). |
| `label_3` | `String` | No | `null` | Micro-badge positioned above price (e.g., `"Special Fare"`). |
| `label_3_is_strikethrough`| `Boolean` | Yes | `false` | When `true`, applies strikethrough styling to `label_3` as an alternative anchor indicator. |
| `airline_logo` | `File` | No | `null` | Formats: `SVG`, `PNG`. Aspect ratio: strict **1:1** square. |
| `region` | `Enum` | Yes | `'Global'` | Values per `SYS-02-ENUMS §2` (shared with `LandingPage.target_region`; neither document defines its own list). Never rendered as a column. |
| `text_color` | `RGBA` | Yes | `rgba(0,0,0,0.88)` | Row typography color override. |

---

## 5. BUSINESS RULES & SYSTEM GUARDS (IF -> THEN)

1. **Mandatory Save Validation:**
   - **IF** `row_title` OR `price_value` is empty:
     - **THEN** System blocks saving the row with an alert: `Row Title and Price are mandatory fields.`

2. **Master Toggle Overrides (Parent Invariant):**
   - **IF** Parent section has `show_global_anchor_price === false`:
     - **THEN** Frontend suppresses `anchor_price_value` from rendering, even if this specific row has an anchor price entered. (Same rule applies to `label_1`, `label_2`, `label_3`, and `airline_logo`).

3. **Currency & Strikethrough Rendering Pipeline:**
   - **Price Output:** Value is rendered as: `{currency_symbol}{price_value}` (e.g., `$1,234`).
   - **Anchor Price Output:** Value is automatically rendered with strikethrough markup: `<del>{currency_symbol}{anchor_price_value}</del>` (e.g., `~~$4,321~~`).
   - *Currency symbol is inherited from root `LandingPage.currency_code`.*

4. **Regional Tab Visibility & Filtering:**
   - **IF** Parent section has `region_tabs_enabled === false`:
     - **THEN** The `region` attribute is completely hidden from public users.
   - **IF** Parent section has `region_tabs_enabled === true`:
     - **THEN** This row is visible under `[All]` and under its own `region` tab.
     - **Special Case (`Global`):** a `Global` row contributes no tab of its own and is visible
       under **every** tab (doc 31 §5.3).

5. **Interactive Click -> Lead Modal Dispatch:**
   - **IF** User clicks anywhere on this rendered row:
     - **THEN** System fires event `OPEN_FLIGHT_QUOTE_MODAL` passing:
       ```json
       {
         "destination": this.row_title,
         "cabin_class": this.cabin_class,
         "source_row_id": this.row_id,
         "selected_row_price": this.price_value
       }
       ```
     - The row is a single focusable control with an accessible name; see doc 31 §5.4.
