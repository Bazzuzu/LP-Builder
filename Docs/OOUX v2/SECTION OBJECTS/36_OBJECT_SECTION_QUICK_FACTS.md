# `36_OBJECT_SECTION_QUICK_FACTS.md`

```yaml
METACLASS: CONCRETE_OBJECT
OBJECT_ID: OBJ-36-QUICK-FACTS-SECTION
VERSION: 2.0.0
STATUS: APPROVED
DEPENDS_ON: SYS-02-ENUMS
INHERITS_FROM: OBJ-11-DYNAMIC-SECTION-BASE
STRUCTURAL_ROLE: DYNAMIC_CONTENT_MODULE
SOURCE_OF_TRUTH: src/sections/quick-facts.js
TARGET_AUDIENCE: [LLM_AGENT, BACKEND_DEV, FRONTEND_DEV, CONTENT_MANAGER]
```

---

## 1. OBJECT DEFINITION

An editorial storytelling block: narrative copy, a photo pairing and a vertical list of
labelled facts, laid out as four independent columns of equal height. The component key is
`SECTION_QUICK_FACTS`; the name shown to an author is **Story & Specs**. The key was left
alone deliberately — renaming it touches the canonical registry and every already-saved
page, so the rename is a display-name change only.

The layout is **fixed**: copy, then the thumbnail stack, then the featured image, then the
fact list, always left to right. Unlike Text & Media (doc 39) this section has no media-side
flip, and `media_side` is not one of its attributes.

---

## 2. RELATIONSHIPS (OOUX ORCA MAPPING)

- **Inherits From (Parent):** `11_ABSTRACT_OBJECT_DYNAMIC_SECTION` (inherits `section_id`,
  `slot_index`, `order_in_slot`, `anchor_id`, `position_type: 'Custom'`,
  `is_mandatory: false`, `is_visible: true`, styling tokens).
- **Belongs To (N:1):** `OBJECT_LANDING_PAGE`.
- **Multiplicity / Instance Limit:** **Unbounded (0..N)** — `archetype: DYNAMIC`.
- **Permitted Slots:** Dynamic slots `01`, `03`, `05` (derived from the archetype in
  `enums.permittedSlots`, never declared by the module).
- **Library Group:** `content` ("Content sections").
- **Contains (2..4 Embedded):** fact entries in the `cards` array. Facts 1 and 2 are
  mandatory; 3 and 4 are optional. The entries have no child object document of their own —
  they are two-field records, not entities.

---

## 3. OBJECT LIFECYCLE & ADMIN CTAs

Standard dynamic-section lifecycle — `11_ABSTRACT §3` (Insert, Edit, Duplicate, Reorder,
Delete, Toggle Visibility). Insert auto-populates the preset payload in §5.

| Section-specific CTA | System Behavior |
| :--- | :--- |
| **+ Add fact** | Appends an entry to `cards`. Disabled at 4 (`max: 4`). |
| **Reorder / Duplicate / Delete fact** | ▲ / ▼ move buttons, a duplicate button and a delete button on each repeater row. There is no drag handle. Delete is disabled at `min: 2`. |
| **Upload Thumbnail 1 / 2 / Featured image** | Replaces the asset in the matching media field; alt text is edited in the same control. |

---

## 4. ATTRIBUTES MATRIX

### 4.1 Inherited Styling

From `11_ABSTRACT §4.2`: `bg_color`, `heading_size`, `heading_align`.
**Defaults for this section:** `#FFFFFF` (`BG_WHITE`) / `SIZE_M` / `ALIGN_LEFT`.

| Attribute Name | Data Type | Required | Default Value | Status | Description & Constraints |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `bg_color` | `ColorValue` | Yes | `#FFFFFF` | `BUILT` | Free colour with the three brand presets offered first. Emitted on the `<section>` as `background` and as `--section-bg`. |
| `heading_size` | `Enum<String>` | Yes | `SIZE_M` | `DEFECT` | Persisted and emitted as the `.h-s` / `.h-m` / `.h-l` class on the wrapper, but this section's title is `.qf-title` with a hardcoded `font-size:var(--h-m)`, so no class value changes anything. The control is also absent from the panel (`headingFields({ scale: false })`). Collected, never read. |
| `heading_align` | `Enum<String>` | Yes | `ALIGN_LEFT` | `DEFECT` | Same story: persisted, emitted as `.a-left` / `.a-center`, and no control can change it away from `ALIGN_LEFT`. The value is a constant wearing an attribute's clothes. |

> **`media_side` is not an attribute of this object.** v1 §4.1 declared one; the module
> declares no such field and the renderer emits a fixed column order (§6.3). Nothing in the
> system reads it.

### 4.2 Editorial Copy (Content group)

| Attribute Name | Data Type | Required | Default Value | Status | Description & Constraints |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `section_title` | `String` | **Yes** | Preset | `BUILT` | **MANDATORY here**, although `11_ABSTRACT §4.3` marks the inherited field optional: the module passes `required: true` and `validate()` enforces it with `E100`. Rendered as `.qf-title` inside the first column, not through the shared section header. |
| `primary_paragraph` | `RichText` | **Yes** | Preset | `BUILT` | Lead narrative. Full toolset (`RT_FULL`: bold, italic, strike, colour, `ul`, `ol`, link). Sits on the bottom edge of its column. |
| `secondary_paragraph` | `RichText` | No | Preset | `BUILT` | Labelled **Footnote** in the panel. Small print rendered under the fact list, inside the facts column. Suppressed entirely when blank. |
| `subheading` | — | — | — | `BUILT` | **Not offered.** `headingFields({ sub: false })` — `primary_paragraph` replaces it rather than sitting beside it. |

### 4.3 Facts (own group, between Content and Media)

| Attribute Name | Data Type | Required | Default Value | Status | Description & Constraints |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `cards` | `Array<{ title, paragraph }>` | **Yes** | 4 preset facts | `BUILT` | One array, `min: 2`, `max: 4`. Replaces v1's eight flat attributes `card_1_title … card_4_paragraph`, which are gone from the model. |
| `cards[].title` | `String` | Per §6.2 | Preset | `BUILT` | Labelled **Label**. Placeholder *"Emirates Airlines"*. |
| `cards[].paragraph` | `RichText` | Per §6.2 | Preset | `BUILT` | Labelled **Text**, `RT_FULL`. Line breaks inside one fact are normal (`<br>` in the preset). |

There is no `fact_id` / index-independent identity: an entry is addressed by its position in
the array, and validation paths read `cards.0`, `cards.1`, … — same limitation as doc 51 §4.

### 4.4 Media (Media group, closed by default)

| Attribute Name | Data Type | Required | Default Value | Status | Description & Constraints |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `upload_small_1` | `Media` | **Yes** | `null` | `BUILT` | Thumbnail 1 — upper cell of the two-photo stack. `E101` when absent. |
| `upload_small_2` | `Media` | **Yes** | `null` | `BUILT` | Thumbnail 2 — lower cell of the stack. `E101` when absent. |
| `upload_big` | `Media` | **Yes** | `null` | `BUILT` | Featured image, its own full-height column. Hint in the panel: *container clamps to 400–640px, `object-fit: cover`*. |
| `*.alt` | `String` | No | Filename guess | `BUILT` | Alt text is edited inside each image control and **does not block publishing** (`_common.needMedia`). The editor pre-fills a guess from the uploaded filename; the guess never overwrites text already typed. |

* **CSS asset constraints:** every image renders `width:100%; height:100%; object-fit:cover`
  inside a `14px`-radius clipped box. Empty fields render the striped `.ph` placeholder at
  the same size, so the layout does not move when an asset arrives.

---

## 5. DEFAULT BOILERPLATE PRESET PAYLOAD (SEED DATA)

Verbatim from `defaults` in `src/sections/quick-facts.js`.

```yaml
default_preset_payload:
  bg_color: "#FFFFFF"
  heading_size: "SIZE_M"
  heading_align: "ALIGN_LEFT"
  section_title: "The Emirates A380 blueprint"
  primary_paragraph: "<p>Experience the pinnacle of transatlantic travel. The A380 offers unparalleled space, a dedicated onboard lounge, and direct aisle access for ultimate productivity.</p>"
  secondary_paragraph: "<p>Aircraft types and lounge availability are subject to operational changes. Your concierge will verify the exact configuration before booking.</p>"
  cards:
    - title: "Emirates Airlines"
      paragraph: "<p>Skytrax 5-Star<br>Chauffeur-drive</p>"
    - title: "Airbus A380-800"
      paragraph: "<p>Iconic Onboard Bar<br>Whisper-quiet</p>"
    - title: "Fully Flat Suite"
      paragraph: "<p>1-2-1 Layout<br>Mini-bar built in</p>"
    - title: "Concourse A Lounge"
      paragraph: "<p>Direct Boarding<br>Moët &amp; Chandon Bar</p>"
  upload_big: null
  upload_small_1: null
  upload_small_2: null
```

The seed ships **four** facts and **no** images: a freshly inserted section is immediately
readable but not publishable until the three assets are uploaded (§6.1).

---

## 6. BUSINESS RULES & SYSTEM GUARDS (IF -> THEN)

1. **Mandatory Content Validation (L1, `E100` / `E101`) — `BUILT`**
   - **IF** `section_title` is blank → `E100` on `section_title`.
   - **IF** `primary_paragraph` is empty rich text → `E100` on `primary_paragraph`.
   - **IF** any of `upload_big`, `upload_small_1`, `upload_small_2` has neither `asset` nor
     `url` → `E101` on that path.
   - **THEN** publishing is blocked; the draft still saves (L1 never blocks a save).
   - Missing **alt text is not part of this guard.** v1 required it; the system-wide rule
     changed — a page is no longer unpublishable over a caption nobody has written yet.

2. **Optional Fact — All-or-Nothing, Never Silent (L1, `E100`) — `BUILT`**
   - Facts **1 and 2** are mandatory: either field blank → *"Fact N is mandatory — fill in
     both the label and its caption."*
   - Facts **3 and 4**: both blank → the entry is inactive and omitted from the DOM, and the
     column reflows. Exactly one field filled → `E100` *"Fact N has only one of its two
     fields filled. Complete it or clear it."*
   - The loop runs over `Math.max(2, cards.length)`, so deleting the array down to one entry
     still reports both mandatory facts.

3. **Fixed Column Order — `BUILT`**
   - The renderer always emits, in this order: **copy** (title + lead paragraph) →
     **thumbnail stack** (small 1 above small 2) → **featured image** → **facts** (+ footnote).
   - The shared section header is suppressed (`withHeader: false`); the title lives inside
     the first column so it shares that row's height with the other three.
   - There is no flip control and no reversed variant.

4. **Row Height — `minmax(400px, auto)` + a `max-height` ceiling — `BUILT`**
   - Desktop: `grid-template-rows: minmax(400px, auto)` on a container capped by
     `max-height: 640px`. The row takes the height of its tallest column (usually the facts
     list) with a 400px floor.
   - **This is not v1 §6.3's `clamp(400px, 45vw, 640px)`, and not `minmax(400px, 640px)`.**
     `grid-template-rows` with two *fixed* lengths always resolves to the maximum in an
     auto-height container regardless of content — `minmax(400px,640px)` is a constant 640px,
     not "clamp to content". The ceiling therefore had to move off the track and onto the
     container itself, which is where it is.
   - **Escape hatch:** `.qf-facts` carries `overflow-y:auto`, so facts content that genuinely
     needs more than 640px scrolls in place rather than pushing the photo columns past the
     ceiling.

5. **Responsive Behaviour — `BUILT`**
   - **Desktop (`≥1024px`):** four columns, `0.9fr 0.75fr 0.75fr 1fr`, `gap: 40px`,
     `align-items: stretch`. Container `max-width:1280px`, `padding: 0 80px`, section
     padding `80px 0`.
   - **Below `1024px`:** one column. **Both height bounds are dropped** —
     `grid-template-rows:none`, `max-height:none` — and the two media columns take
     `height: clamp(280px, 70vw, 420px)` instead. The facts column stops scrolling
     (`overflow-y:visible`).
   - **Below `768px`:** the container falls back to the shared tokens
     (`--container`, `--gutter`, `--section-y`) like every other section.

6. **Media Geometry — `BUILT`**
   - Both thumbnails share their column as equal flex children (`flex:1`) separated by a
     40px gap; the featured image fills its own column. All three clip to `14px` and crop
     with `object-fit: cover`, so an uploaded aspect ratio can never distort the row.
