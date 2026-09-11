# `32_OBJECT_SECTION_TRUST.md`

```yaml
METACLASS: CONCRETE_OBJECT
OBJECT_ID: OBJ-32-TRUST-SECTION
VERSION: 2.0.0
STATUS: APPROVED
DEPENDS_ON: SYS-02-ENUMS
INHERITS_FROM: OBJ-10-BASE-SECTION
STRUCTURAL_ROLE: DUAL_ROLE_ANCHOR (Fixed Anchor + Global Content)
SOURCE_MODULE: src/sections/trust.js
GLOBAL_STORE: globals.trust (src/presets/global-defaults.js)
TARGET_AUDIENCE: [LLM_AGENT, BACKEND_DEV, FRONTEND_DEV, UI_DESIGNER]
```

---

## 1. OBJECT DEFINITION
The social-proof anchor at Slot `04`. Three stacked blocks, separated by hairlines: a horizontally
scrollable Trustpilot review strip, a video + VIP testimonial pair with its own pager, and a grid
of accreditation badges. **Dual role:** every word, score, portrait and badge comes from the global
store; the page owns only its own heading copy and four display switches.

The section is **unconditionally dark**. It declares `fixedBg: '#0B0B0B'`, paints
`background: #0B0B0B` in its own stylesheet, and offers no background control — a social-proof
band is meant to read as a distinct premium beat, so every colour in its CSS is scoped to `.trust`
rather than drawn from the shared light-mode tokens.

---

## 2. RELATIONSHIPS (OOUX ORCA MAPPING)

- **Inherits From (Parent):** `10_ABSTRACT_OBJECT_PAGE_SECTION` (`section_id`, `slot_index: 04`,
  `order_in_slot: 0`, `is_mandatory: true`, `position_type: 'Fixed'`, `is_visible: true`).
- **Belongs To (N:1):** `OBJECT_LANDING_PAGE`.
- **Consumes (N:1 Global, read-only):** `GlobalTrustConfig` — real schema in §4.3.
- **Read by:** `30_OBJECT_SECTION_HERO` reads `trustpilot.review_count` from the same store for
  its own Trustpilot strip, independently of every switch in this section.

---

## 3. OBJECT LIFECYCLE & ADMIN CTAs

| Action (CTA) | Admin UI Location | System Behavior |
| :--- | :--- | :--- |
| **Insert** | — | **UNAVAILABLE.** Anchors are created with the page, seeded from §5. |
| **Edit Heading** | Inspector › Content | Title and subtitle are **page-level** here, not global — see §4.1. |
| **Toggle Sub-modules** | Inspector › Blocks | Three switches: Trustpilot feed, Video & VIP testimonial, Accreditation badges. |
| **Switch Layout Mode** | Inspector › Appearance | `Extended` / `Compact` segmented control. |
| **Edit Reviews / Endorsements / Badges** | Inspector header card | **READ-ONLY.** The panel shows the global card: *"Reviews, ratings, endorsements and badges are managed centrally."* with an **Edit in Global Settings** button. |
| **Toggle Visibility** | Outline row menu | **LOCKED.** Anchor rows are `pinned`; no row menu is rendered. |
| **Delete / Reorder** | Outline row menu | **LOCKED.** Pinned to slot `04`. |

---

## 4. ATTRIBUTES MATRIX

### 4.1 Page-Level Configuration Attributes

| Attribute Name | Data Type | Required | Default Value | Status | Description & Constraints |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `section_title` | `String` | No | seed copy | `BUILT` | Rendered as `.tr-title`, with the **first word wrapped in the brand-green accent span** (`#00b67a`). Hidden when blank. |
| `subheading` | `RichText` | No | seed copy | `BUILT` | Toolset `RT_FULL`. Rendered as `.tr-sub`. Hidden when blank. |
| `heading_size` | `Enum` | Yes | `'SIZE_M'` | `DEFECT` | Offered in the panel via the shared `headingFields()` helper and stored in props. **Never consulted.** `.tr-title` is a hardcoded `font-size: var(--h-m)`. `DEFECTS.md D-04`. |
| `heading_align` | `Enum` | Yes | `'ALIGN_LEFT'` | `DEFECT` | Same: offered, stored, never read. The section never calls the shared section shell that would translate it into an alignment class. `DEFECTS.md D-04`. |
| `layout_mode` | `Enum` | Yes | `'Extended'` | `BUILT` | [`Extended`, `Compact`]. Adds the `.compact` class; its real effects are §4.2. |
| `show_trustpilot_feed` | `Boolean` | Yes | `true` | `BUILT` | Compared with `!== false`. Also suppressed when the global store holds no reviews. |
| `show_celebrity_review` | `Boolean` | Yes | `true` | `BUILT` | Same. Suppressed when `celebrity_endorsements` is empty. |
| `show_accreditation_badges` | `Boolean` | Yes | `true` | `BUILT` | **Fourth switch, absent from v1.** Force-hidden in `Compact` regardless of its value; the panel's help text says so. |
| `anchor_id` | `String` | No | `null` | `PLANNED` | Rendered as the `<section id>` and carried through import/export, but this section declares no `advancedGroup`, so there is no control for it. |

> **v1 §5.4 forbade page-level copy here** — "Admin can ONLY alter display switches". That is not
> the system that exists: `section_title` and `subheading` are ordinary page-level content fields
> with their own seeded defaults, and only the reviews, endorsements and badges are global. The
> read-only guard applies to the *data*, not to the header.

---

### 4.2 Layout Mode Specifications

`Compact` is four CSS overrides and one render condition. It is **not** a different composition.

| Effect | `Extended` | `Compact` | Status |
| :--- | :--- | :--- | :--- |
| Section padding | `80px 0` | `44px 0` (≈45% less) | `BUILT` |
| Hairline margins between blocks | `40px 0` | `28px 0` | `BUILT` |
| Review body text | Two-line clamp, visible | `display: none` — title, stars and date remain | `BUILT` |
| Video thumbnail | Visible, `16/10` | `display: none` | `BUILT` |
| Testimonial grid | `1.15fr 1fr`, video beside quote | Single column | `BUILT` |
| Accreditation badge grid | Rendered if enabled and populated | **Never rendered**, whatever `show_accreditation_badges` says | `BUILT` |
| Review feed as a single-row slider | — | — | `PLANNED` |
| Celebrity portrait dropped in Compact | — | — | `PLANNED` |

> **Two v1 claims are simply not the behaviour.** `Compact` does **not** turn the review feed into
> a one-review slider — the feed is the same `overflow-x: auto` scroll-snap strip with the same
> `flex: 1 0 220px` cards in both modes. And the celebrity portrait is **not** dropped: `.tr-avatar`
> has no Compact override, so the 56px round portrait renders in both modes. What Compact actually
> removes is the review body, the video block and the two-column split.

---

### 4.3 Consumed Global Content Model (`GlobalTrustConfig`)

The real shape of `globals.trust`. Differences from v1 are flagged in the right-hand column.

```yaml
global_trust_schema:
  trustpilot:
    business_unit_id: string            # BUILT as storage; nothing reads it
    aggregate_score: decimal            # BUILT — gates and fills the header rating block
    review_count: integer               # BUILT — read by the HERO, not by this section
    rating_label: string                # BUILT — v1 had no such key; defaults to "Excellent"
    reviews: Array<{ author, score, title, body, date }>   # BUILT
  celebrity_endorsements: Array<{       # BUILT — an ARRAY, not v1's single object
    person_name: string
    person_title: string
    portrait: Media                     # rendered 56px round
    quote: string                       # escaped as plain text, not rich text
    video_poster: Media                 # BUILT — v1 had no such key
    video_url: string                   # BUILT — v1 had no such key
  }>
  accreditation_badges: Array<{         # BUILT — v1 had no such collection
    icon: Media
    title: string
    body: string
  }>
  cache_ttl_minutes: integer            # DEFECT-adjacent: stored, never read (see §6.6)
```

| Global key | Status | How it is used |
| :--- | :--- | :--- |
| `trustpilot.aggregate_score` | `BUILT` | When non-null, mounts the header rating block: wordmark, five green chips, `rating_label`, and `Rated {score.toFixed(1)}`. When null, the whole block is omitted. |
| `trustpilot.rating_label` | `BUILT` | Falls back to `'Excellent'`. |
| `trustpilot.reviews[]` | `BUILT` | Each card shows a relative date (`Today` / `Yesterday` / `N days ago` / `Mon YYYY`), a 0..5 star row clamped and rounded from `score`, the title and the body. Fields are escaped plain text. |
| `trustpilot.business_unit_id` | `PLANNED` | Stored and shipped empty. Nothing reads it — see §6.6. |
| `celebrity_endorsements[]` | `BUILT` | Rendered as slides in one track; slide 0 visible, the rest `hidden`. With more than one entry, prev/next buttons wrap around modulo the count. |
| `celebrity_endorsements[].video_poster` / `video_url` | `BUILT` | The poster is the whole thumbnail — caption, name and player chrome are baked into the asset, so no synthetic overlay is drawn. With a `video_url` the block becomes an `<a target="_blank" rel="noopener noreferrer">`; without one it is a `<div>`. |
| `accreditation_badges[]` | `BUILT` | Auto-fit grid, `minmax(220px, 1fr)`. Icon is decorative (`alt=""`), capped at `height: 32px; max-width: 120px`. Ships with three SVG-data-URI entries: BBB A+ Rating, ARC Accredited, IATAN Verified. |
| `cache_ttl_minutes` | `PLANNED` | Stored (`60`), read by nothing. |

---

## 5. DEFAULT BOILERPLATE PRESET PAYLOAD (SEED DATA)

**Page-level props** — verbatim from the module's `defaults`:

```yaml
default_preset_payload:
  section_title: "Trusted by Thousands of Business Class Travelers Worldwide"
  subheading: "<p>Our service is built on trust, backed by leading security technologies.</p>"
  layout_mode: "Extended"
  show_trustpilot_feed: true
  show_celebrity_review: true
  show_accreditation_badges: true
  # heading_size / heading_align come from headingFields() as SIZE_M / ALIGN_LEFT
  # and are stored on first edit. Neither is read — DEFECT D-04.
```

**Global store shipped with a fresh install** (`globals.trust`, abridged — media values are
inline `data:` URIs):

```yaml
trust:
  trustpilot:
    business_unit_id: ""
    aggregate_score: 4.7
    review_count: 1240
    rating_label: "Excellent"
    reviews:
      - { author: "M. Delacroix", score: 5, title: "Faultless from first call",   date: "2026-09-06" }
      - { author: "A. Whitfield", score: 5, title: "Genuine specialists",         date: "2026-05-18" }
      - { author: "S. Nakamura",  score: 5, title: "Worth every minute",          date: "2026-04-27" }
      - { author: "R. Okafor",    score: 5, title: "Seamless rebooking",          date: "2026-03-11" }
  celebrity_endorsements:
    - person_name: "Ed Westwick"
      person_title: "Actor and musician"
      portrait: { url: "data:image/png;base64,…", alt: "Ed Westwick" }
      video_poster: { url: "data:image/png;base64,…", alt: "Video testimonial from James Marsters" }
      video_url: ""
      quote: "Business-class.com streamlines the journey for all kinds of travelers, especially families and kids."
  accreditation_badges:
    - { title: "BBB A+ Rating",   icon: { url: "data:image/svg+xml;base64,…", alt: "BBB Accredited Business" } }
    - { title: "ARC Accredited",  icon: { url: "data:image/svg+xml;base64,…", alt: "ARC Accredited" } }
    - { title: "IATAN Verified",  icon: { url: "data:image/svg+xml;base64,…", alt: "IATAN Verified" } }
  cache_ttl_minutes: 60
```

> The seed ships **one** endorsement, so the testimonial pager renders no arrows until a second is
> added. The seeded `portrait` and `video_poster` name two different people — the alt text on the
> poster says *James Marsters* while the endorsement is *Ed Westwick*. That is seed data, not a
> rule; it is recorded here because it is what a fresh install shows.

---

## 6. BUSINESS RULES & SYSTEM GUARDS (IF -> THEN)

1. **Mandatory Anchor Lock.** — `BUILT`
   - **IF** an admin tries to delete, hide or move this section:
     - **THEN** there is nothing to click: the outline draws anchor rows `pinned`, without the
       `⋯` menu or a drag handle. A missing Trust section is `E003` at publish; a misplaced one is
       `E005`.

2. **Sub-module Visibility Minimum Invariant (L1, `E104`).** — `BUILT`
   - **IF** `show_trustpilot_feed === false` **AND** `show_celebrity_review === false`:
     - **THEN** publishing is blocked with `E104`: *"Trust section must display at least one social
       proof element."* Draft saves still succeed.
   - **Gap worth naming:** the guard reads the two switches only. A page with both switches on but
     an **empty global store** renders an equally empty band and passes validation, because each
     block is additionally suppressed when its collection is empty. The guard is a switch check,
     not an output check.

3. **Density Adaptation (`Compact`).** — `BUILT`
   - **IF** `layout_mode === 'Compact'`:
     - **THEN** exactly the six effects in §4.2 apply. Vertical rhythm drops from `80px` to `44px`
       and hairline margins from `40px` to `28px`; the review body, the video block and the badge
       grid come out; the testimonial grid becomes one column.
   - The single-row slider and the dropped portrait v1 described are `PLANNED`.

4. **Accreditation Badges in Compact.** — `BUILT`
   - **IF** `layout_mode === 'Compact'`:
     - **THEN** the badge grid is not rendered **even when `show_accreditation_badges === true`**.
       Compact wins over the switch by design, and the switch's help text says so.

5. **Global Data Isolation.** — `BUILT`, narrower than v1
   - **IF** a page editor opens this section:
     - **THEN** the inspector shows the global read-only card and an *Edit in Global Settings*
       button. Review text, scores, endorsements and badges cannot be edited from the page.
   - **BUT** `section_title`, `subheading` and the four switches **are** page-level and freely
     editable. v1's blanket "display switches only" is not the implemented rule.

6. **Live Trustpilot Feed.** — `PLANNED`
   - **DESCRIBED:** an aggregate score *"refreshed from the Trustpilot API"*, addressed by
     `business_unit_id` and refreshed every `cache_ttl_minutes`.
   - **ACTUAL:** nothing fetches anything. `reviews`, `aggregate_score` and `review_count` are
     hand-maintained values in the global store; `business_unit_id` ships empty and is read
     nowhere; `cache_ttl_minutes` is stored and read nowhere. Everything the section shows is
     static content edited in Global Settings.

7. **Dark-Only Rendering.** — `BUILT`
   - The section has no `bg_color` field. `fixedBg: '#0B0B0B'` exists so the page's
     same-background divider logic can compare this section against its neighbours; the colour
     itself is painted by the section's own CSS. There is no light variant and no theme switch.

8. **Reduced Motion.** — `BUILT`
   - Both navigations are scroll/visibility toggles, not animations. The review strip's
     `scrollBy` uses `behavior: 'auto'` instead of `'smooth'` under
     `prefers-reduced-motion: reduce`; the testimonial pager only flips the `hidden` attribute.
