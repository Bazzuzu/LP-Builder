# `42_OBJECT_SECTION_FAQ.md`

```yaml
METACLASS: CONCRETE_OBJECT
OBJECT_ID: OBJ-42-FAQ
VERSION: 2.0.0
STATUS: APPROVED
DEPENDS_ON: SYS-02-ENUMS
INHERITS_FROM: OBJ-11-DYNAMIC-SECTION-BASE
STRUCTURAL_ROLE: DYNAMIC_CONTENT_MODULE
SOURCE_OF_TRUTH: src/sections/faq.js
TARGET_AUDIENCE: [LLM_AGENT, BACKEND_DEV, FRONTEND_DEV, CONTENT_MANAGER]
```

---

## 1. OBJECT DEFINITION

A collapsible question-and-answer block, in one or two columns. Each entry is a native
`<details>` / `<summary>` pair, so the accordion works in the **exported file with no
JavaScript at all** — the document the preview shows is the one that ships, and there is no
runtime behaviour to keep in sync with it.

**This section is why v2 exists.** `SECTION_FAQ` was registered in `enums.js`, implemented
in `src/sections/faq.js`, and insertable from the section library, while no document in the
v1 set described it. The registry guard in `src/sections/_registry.js` compares the module
list against `COMPONENT_KEYS` — two files edited by the same hand — and never reads the
spec, so a key present in code and absent from the model passes it silently. That is exactly
how this section lived in the product without a page of documentation. A test that reads the
key table out of `SYS-02 §1` is a `ROADMAP.md` item.

> The module still declares `doc: 0`, the placeholder for "no spec document". It should read
> `doc: 42`. — `PLANNED`. (Nothing in `src/` reads the field today; it is a pointer for
> humans.)

---

## 2. RELATIONSHIPS (OOUX ORCA MAPPING)

- **Inherits From (Parent):** `11_ABSTRACT_OBJECT_DYNAMIC_SECTION` (inherits `section_id`,
  `slot_index`, `order_in_slot`, `anchor_id`, `position_type: 'Custom'`,
  `is_mandatory: false`, `is_visible: true`, styling tokens).
- **Belongs To (N:1):** `OBJECT_LANDING_PAGE`.
- **Multiplicity / Instance Limit:** **Unbounded (0..N)** — `archetype: DYNAMIC`. A page may
  carry, say, a routing FAQ and a baggage FAQ as two independent instances.
- **Permitted Slots:** Dynamic slots `01`, `03`, `05`.
- **Library Group:** `content` ("Content sections"), icon `?`.
- **Contains (1..20 Embedded):** question entries — `{ question, answer }`. No child object
  document: two fields, not an entity.

---

## 3. OBJECT LIFECYCLE & ADMIN CTAs

Standard dynamic-section lifecycle — `11_ABSTRACT §3` (Insert, Edit, Duplicate, Reorder,
Delete, Toggle Visibility). Insert auto-populates the preset payload in §5.

| Section-specific CTA | System Behavior |
| :--- | :--- |
| **+ Add question** | Appends an empty entry. Disabled at `MAX_ITEMS` (20). |
| **Reorder / Duplicate / Delete question** | ▲ / ▼ move buttons, a duplicate button and a delete button per repeater row; no drag handle. The repeater is not `fixed`, so rows are added and removed directly; delete is disabled at `min: 1`. |
| **Columns (1 / 2)** | Sets `columns`. Affects the desktop grid and, through it, which entries count as the bottom row (§6.3). |
| **Open by default** | Sets `start_open`; writes or omits the `open` attribute on every `<details>`. |

---

## 4. ATTRIBUTES MATRIX

### 4.1 Inherited Styling

From `11_ABSTRACT §4.2`: `bg_color`, `heading_size`, `heading_align`.
**Defaults for this section:** `#FFFFFF` (`BG_WHITE`) / `SIZE_L` / `ALIGN_LEFT`.

| Attribute Name | Data Type | Required | Default Value | Status | Description & Constraints |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `bg_color` | `ColorValue` | Yes | `#FFFFFF` | `BUILT` | Three brand presets first, free value allowed. |
| `heading_size` | `Enum<String>` | Yes | `SIZE_L` | `BUILT` | Segmented S/M/L; read by `.sec-title` through the wrapper class. |
| `heading_align` | `Enum<String>` | Yes | `ALIGN_LEFT` | `BUILT` | Left / Center. Centring the section also centres the question rows' text, which a two-column list rarely wants — left is the default for a reason. |

### 4.2 Section Header (Content group)

| Attribute Name | Data Type | Required | Default Value | Status | Description & Constraints |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `section_title` | `String` | No | Preset | `BUILT` | Hidden when empty. |
| `subheading` | `RichText` | No | Preset | `BUILT` | Labelled **Subtitle**, `RT_FULL`. Panel help: *hidden when empty; takes a link, e.g. to a dedicated FAQ page* — and the seed uses exactly that, linking to `/faq`. Both header fields empty → the wrapper is not emitted (`11_ABSTRACT §5.1`). |

### 4.3 Questions (own group, between Content and Appearance)

| Attribute Name | Data Type | Required | Default Value | Status | Description & Constraints |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `columns` | `Enum<Number>` | Yes | `2` | `BUILT` | `1` \| `2`. Desktop only — both collapse to one column below `1024px`. Any value other than `1` is read as `2` at render time. |
| `start_open` | `Boolean` | Yes | `true` | `BUILT` | Help: *whether every answer is already expanded when the page loads.* All-or-nothing: there is no per-entry initial state. Emitted as the `open` attribute on each `<details>`; a visitor's own toggling is browser state and is never persisted. |
| `items` | `Array<{ question, answer }>` | **Yes** | 4 preset entries | `BUILT` | `min: 1`, `max: 20` (`MAX_ITEMS`). Row titles in the panel show the question, or *Question N* while it is blank. |
| `items[].question` | `String` | **Yes** | Preset | `BUILT` | `required: true`; `E100` on `items.N.question`. Placeholder: *How long does it take to fly from New York to London?* Rendered inside `<summary>`, escaped — a question is plain text. |
| `items[].answer` | `RichText` | **Yes** | Preset | `BUILT` | `required: true`; `E100` on `items.N.answer`. `RT_BASIC` — bold, italic, strike, colour. No lists and **no link tool**: an answer that sends the reader away is a subtitle's job, not a row's. |

Entries have no identity beyond their array index; validation paths are `items.0`,
`items.1`, … — the same limitation recorded for doc 51 §4 and doc 52 §4.

---

## 5. DEFAULT BOILERPLATE PRESET PAYLOAD (SEED DATA)

Verbatim from `defaults` in `src/sections/faq.js`.

```yaml
default_preset_payload:
  bg_color: "#FFFFFF"
  heading_size: "SIZE_L"
  heading_align: "ALIGN_LEFT"
  section_title: "Frequently asked questions"
  subheading: "<p>More answers can be found on the dedicated <a href=\"/faq\">FAQ</a> page</p>"
  columns: 2
  start_open: true
  items:
    - question: "When is the cheapest time to fly from New York to London?"
      answer: "<p>The cheapest month to fly from New York to London is usually January.</p>"
    - question: "Which is the cheapest airport to fly into in London?"
      answer: "<p>If you’re flying from New York, the cheapest airport near London is London Gatwick — which is 40.3 km away from the centre of London. We’ve found flights into this airport from 1,333 USD.</p>"
    - question: "How much are return flights from New York to London?"
      answer: "<p>The best price we found for a return flight from New York to London is 1,333 USD. This is an estimate based on information collected from different airlines and travel providers over the last 4 days and is subject to change and availability.</p>"
    - question: "How long does it take to fly from New York to London?"
      answer: "<p>7 hours and 11 minutes is the average flight time from New York to London.</p>"
```

Four entries at two columns is a full, even grid — a freshly inserted FAQ is publishable as
it stands.

---

## 6. BUSINESS RULES & SYSTEM GUARDS (IF -> THEN)

1. **Active Entries — `BUILT`**
   - An entry is **active** when it has a question **or** an answer with visible content. A
     wholly blank trailing row is filtered out before rendering and before validation: a
     half-finished thought should not draw an empty accordion on a published page.
   - Note the asymmetry with rule 2: a blank row disappears, but a row with *one* of the two
     fields filled is active and therefore blocks publishing until the other is written.

2. **Mandatory Content (L1, `E100`) — `BUILT`**
   - **IF** no entry is active:
     - **THEN** publishing is blocked with one `E100` on `items`: *"FAQ section must contain
       at least one question."*
   - **IF** an active entry has a blank `question` or an empty `answer`:
     - **THEN** `E100` on `items.N.question` / `items.N.answer`.
   - The draft still saves; L1 never blocks a save.

3. **Bottom-Row Divider Suppression — `BUILT`**
   - Every entry draws a `1px` rule under itself (`border-bottom:1px solid var(--line)`,
     `24px` padding above and below), so the list reads as a table of rows rather than a
     stack of boxes. The **bottom row drops its rule**, so the section closes on text and
     not on a line that separates nothing.
   - The bottom row is computed from the item count and the column count, at render time:
     `lastRowFrom = items.length - ((items.length % columns) || columns)`; every entry at an
     index `≥ lastRowFrom` gets `.last-row`. With 4 items in 2 columns that is the last two;
     with 5 items in 2 columns, only the last one (the short final row); with any count in 1
     column, only the last.
   - The grid's row gap is `0` and its column gap is `40px`, with `align-content:start` and
     stretched rows — so a long answer in one column and a short one in the other still line
     their rules up across the gap.

4. **Divider Suppression Follows The Column Collapse — `BUILT`**
   - The `.last-row` class is written into the HTML from the **desktop** column count, so it
     stops being true the moment the grid collapses. The correction therefore lives in the
     same query as the collapse — **`≤1023px`** — where it restores a rule on every item and
     removes it from `:last-child` alone.
   - **IF** `columns === 2` **AND** viewport `≤1023px`:
     - **THEN** the list is one column, every entry carries a divider, and only the final
       entry drops it — regardless of what `.last-row` says.
   - *Fixed 11.09.2026.* The corrective rules previously sat in the `≤767px` query, leaving a
     `768–1023px` band where a two-column FAQ rendered as one column while still carrying
     two-column flags: an entry mid-list lost its divider. The container spec keeps its own
     `≤767px` query — the two breakpoints are genuinely different and must not be merged.

5. **Native Disclosure, No Script — `BUILT`**
   - Each entry is `<details class="faq-item"[ open]><summary class="faq-q">…</summary><div
     class="faq-a">…</div></details>`. Opening and closing is the browser's, keyboard
     activation is free, and the exported page ships no FAQ JavaScript.
   - `list-style:none` plus `::-webkit-details-marker{display:none}` removes the native
     triangle in both engine families.
   - **Editor preview:** the preview bridge's blanket `preventDefault` — the thing that stops
     a link from navigating the editing canvas away — explicitly exempts any click inside a
     `<summary>`. Swallowing the toggle made a working accordion look broken in the one place
     an author checks it.

6. **Chevron — `BUILT`**
   - Drawn from **two rotated borders**, not a glyph and not an SVG: an `8×8` box with
     `border-right` and `border-bottom` at `1.5px currentColor`, rotated `45deg` (pointing
     down) and `-135deg` when the entry is open (pointing up), over a `.18s` transition. It
     inherits its colour (`--bronze`), it needs no asset, and there is nothing to swap out
     between states. Marked `aria-hidden="true"` — the `<summary>` already announces its own
     expanded state.
   - Question rows use `--title-weight` at `16px` and turn bronze on hover; answers are
     `16px` soft ink at `1.5` line-height, `16px` below the question, with any inline links
     underlined in the inherited colour.

7. **Container & Responsive — `BUILT`**
   - **Desktop:** `.faq-sec .wrap{max-width:1280px; padding:0 80px}`, section padding
     `80px 0`, header-to-list gap `40px` — the shared container spec used by Prices, Feature,
     Trust and the rest.
   - **`≤1023px`:** `.faq-list.c2` becomes a single column (see rule 4).
   - **`≤767px`:** the container falls back to `--container` / `--gutter` / `--section-y`,
     and the divider rules are recomputed for a single stack.
