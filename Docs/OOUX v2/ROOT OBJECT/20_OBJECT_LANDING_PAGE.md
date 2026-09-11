# `20_OBJECT_LANDING_PAGE.md`

```yaml
METACLASS: CONCRETE_OBJECT
OBJECT_ID: OBJ-20-LANDING-PAGE
VERSION: 2.0.0
STATUS: APPROVED
DEPENDS_ON: SYS-02-ENUMS
INHERITANCE: ROOT_CONTAINER_ENTITY
SOURCE_OF_TRUTH: src/store/pages.js, src/ui/pages.js, src/render/page.js, src/import.js, src/export.js, src/presets/page-templates.js
TARGET_AUDIENCE: [LLM_AGENT, BACKEND_DEV, FRONTEND_DEV, SEO_SPECIALIST]
```

---

## 1. OBJECT DEFINITION

The root container entity: one marketing landing page. It owns the URL slug, the page metadata,
the route defaults that pre-fill the lead form, the page-level currency, and the ordered
collection of sections.

The runtime shape is the `PageDoc` typedef in `src/model/types.js`. Pages live as an array in
`localStorage` under `lpb.state.v2` at `schema_version: 2`; images live separately in IndexedDB,
which is why a quota failure on persist is reported as a page-count problem rather than an image
one. There is no server, no publishing pipeline and no redirect table — the sections below say
where that shows.

---

## 2. RELATIONSHIPS (OOUX ORCA MAPPING)

- **Has Many (1:N, Ordered):** `10_ABSTRACT_OBJECT_PAGE_SECTION` via `PageDoc.sections`, ordered
  by `slot_index` then `order_in_slot`.
- **Owns (1:1):** `21_OBJECT_FLIGHT_QUOTE_MODAL` — one overlay appended to every rendered
  document, in both preview and export, outside the section tree.
- **Reads From (N:1):** the global content store (`lpb.globals.v2`), consumed by Trust, Footer,
  Subscription and Contact. A page editor can read it and cannot write it; global content is
  edited through *Global Settings*.

---

## 3. OBJECT LIFECYCLE & ADMIN CTAs

| Action (CTA) | Admin UI Location | System Behavior | Status |
| :--- | :--- | :--- | :--- |
| **Create from a template** | Pages modal → *Start from a template* | `pageFromTemplate()`. Built-in templates (*Route page*, *Campaign page*, *Blank*) list component keys per slot and let each type's `defaults` supply the copy; the four anchors are always created | `BUILT` |
| **Create from a saved template** | Pages modal → the same grid, below the built-ins | A saved template is a frozen page: its sections arrive whole, with content and images, re-ided by `sectionsFrom()` | `BUILT` |
| **Import a page** | Pages modal → *↓ Import a page* | Reads a `lpb.page` or `lpb.template` JSON bundle: `restoreAssets()` first so images are resolvable before the page renders, then `pageFromBundle()`. Fresh page id and fresh section ids; `page_type`, `meta` and `route` are carried over verbatim; the source slug is kept when free and takes `-copy`, `-copy-2`, … when not. A bad file raises a dialog naming the file, never a silent no-op | `BUILT` |
| **Save this page as a template** | Pages modal → *↑ Save this page as a template* | `exportTemplate()` downloads a `.js` module carrying the sections and their assets — no page id, slug, timestamps or SEO. Its header says exactly where to drop it and which line to add to `src/presets/templates/index.js` | `BUILT` |
| **Open a page** | Pages modal → the page list | `openPage()`. Clears the selection and **discards undo history** — history is per open page, not global | `BUILT` |
| **Edit canvas** | Main window | Outline, inspector and a live preview iframe rendering the same document the export produces | `BUILT` |
| **Page settings** | Topbar → the page name | Identity, SEO and route defaults, edited against a draft copy and committed on Save | `BUILT` |
| **Export HTML** | Topbar → *Export* | `renderPage(mode: 'export')`, downloaded as `{slug}.html`. With blocking issues open it asks first — *Review issues* or *Export anyway* — because an export is not a publish, but it should not be silent | `BUILT` |
| **Export JSON bundle** | Topbar → *JSON* | `exportJson()` — the page document with every referenced asset record inlined, so the file opens on another machine | `BUILT` |
| **Delete page** | Pages modal → *Delete* | Permanent removal from the page list. Disabled when only one page remains, with the reason in the tooltip. Undoable within the session only | `BUILT` |
| **Archive (soft delete)** | — | v1 specified `status: 'Archived'` with lead attribution retained. Nothing writes that status; the delete above is a hard delete | `PLANNED` |
| **Publish** | — | No publish action exists. `canPublish()` is implemented and exported from `model/validate.js`, and nothing calls it | `PLANNED` |
| **Unpublish** | — | No status transition exists, so no `410 Gone` behaviour exists either | `PLANNED` |
| **Duplicate Page** | — | `freeCopySlug()` — the `-copy`, `-copy-2`, … helper v1 specified for duplication — exists and is used only by the importer. No duplicate action is offered | `PLANNED` |

---

## 4. ATTRIBUTES MATRIX

### 4.1 System & Routing Attributes

| Attribute Name | Data Type | Required | Default | Status |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `String` | Yes | `AUTO_GEN` | `BUILT` |
| `schema_version` | `Integer` | Yes | `2` | `BUILT` |
| `internal_name` | `String` | Yes | `"Untitled page"`, or the template's name | `BUILT` |
| `slug` | `String` | Yes | `slugify(internal_name)` | `BUILT` |
| `status` | `Enum<String>` | Yes | `'Draft'` | `BUILT` |
| `page_type` | `Enum<String>` | Yes | `'RoutePage'` | `DEFECT` |
| `created_at` | `Integer` (epoch ms) | Yes | `Date.now()` | `BUILT` |
| `updated_at` | `Integer` (epoch ms) | Yes | `Date.now()` | `BUILT` |

**Notes on the above**

* `id` is **not** a UUIDv4 and the field is **not** named `page_id`. `uid('pg')` produces `pg_`
  followed by 7 base-36 characters. Timestamps are **epoch milliseconds**, not ISO8601.
* `slug` is normalised on every keystroke by `slugify()` — lowercased, every run of non
  `[a-z0-9]` collapsed to a single hyphen, leading and trailing hyphens stripped, falling back to
  `"page"` when nothing survives. The v1 regex `^[a-z0-9-]+$` therefore holds by construction for
  anything typed into the editor, and is unchecked for anything imported.
* `status` is stored, defaulted, and displayed in the pages list (`/slug · Draft · N sections`).
  No code path assigns it any other value, and no renderer reads it. The enum has three members
  and one of them is reachable.
* `page_type` is editable in Page settings and preserved through import — and **read by nothing**.
  No renderer, validator, template or CSS rule consults it. It is a field the editor collects and
  the system does not use.
* `updated_at` advances on every `commit()`, which includes reorders and section deletions.

### 4.2 SEO & Social Graph (Meta) Attributes

Stored under `PageDoc.meta`.

| Attribute Name | Data Type | Required | Default | Status |
| :--- | :--- | :--- | :--- | :--- |
| `meta_title` | `String` | No | `internal_name` | `BUILT` |
| `meta_description` | `String` | No | `''` | `BUILT` |
| `canonical_url` | `String \| null` | No | `null` | `BUILT` |
| `og_image` | `String \| null` | No | `null` | `DEFECT` |
| `noindex_nofollow` | `Boolean` | Yes | `false` | `BUILT` |

**Notes on the above**

* `meta_title` seeds from `internal_name` and `renamePage()` keeps the two in sync **only while
  they still match** — once an author edits the title, renaming the page stops touching it.
  At render it falls back through `meta_title → internal_name → "Landing page"`, and the same
  resolved string is emitted as `<title>` and as `og:title`.
* `meta_description` is emitted as both `<meta name="description">` and `og:description`, and
  only when non-empty. The help text says *"Under 160 characters"*; nothing counts them.
* **Neither `meta_title` nor `meta_description` is required at L1 or anywhere else.** v1 marked
  both *"Yes at publish (L1)"*. There is no publish, and `validateContent()` never looks at
  `page.meta` — no section validator receives it and no page-level validator exists. A page with
  no description exports cleanly. — the enforcement is `PLANNED`.
* `canonical_url` defaults to `null`, not to the self URL. When `null`, **no** `<link rel="canonical">`
  is emitted at all — the export does not know its own address, so there is no self URL to fall
  back to. v1's "Default: Self URL" describes a server-rendered system this is not.
* `og_image` is in the `PageMeta` type, is initialised to `null`, and is faithfully emitted as
  `<meta property="og:image">` when set — and **no control anywhere writes it.** Page settings
  offers Internal name, Slug, Page type, Meta title, Meta description, Canonical URL and the
  noindex switch, and stops. The only way the field is ever non-null is an imported bundle whose
  source had it, which no source could have had either. Renderer support with no writer.
* `noindex_nofollow` injects `<meta name="robots" content="noindex, nofollow">`.

### 4.3 Route & Lead Attribution Attributes

Stored under `PageDoc.route`.

| Attribute Name | Data Type | Required | Default | Status |
| :--- | :--- | :--- | :--- | :--- |
| `default_origin` | `String \| null` | No | `null` | `BUILT` |
| `default_destination` | `String \| null` | No | `null` | `BUILT` |
| `target_country` | `String` (ISO 3166-1) | Yes | `"US"` | `DEFECT` |
| `target_region` | `Enum<Region>` | Yes | `"Global"` | `DEFECT` |
| `currency_code` | `String` (ISO 4217) | Yes | `"USD"` | `BUILT` |

**Notes on the above**

* `default_origin` and `default_destination` pre-fill the **Hero** form's *From* and *To* inputs
  at render time. They do **not** reach the modal; see §5 rule 5.
* `target_country` is editable, upper-cased on input, and **read by nothing**. It was specified as
  half of the currency-formatting locale and is not used for that or anything else. See §5 rule 6.
* `target_region` is editable from the full `REGIONS` list and **read by nothing**. Region
  filtering in Prices runs off each `PriceRowItem.region`, not off this page-level value — the
  tabs are built from the regions the rows actually declare.
* `currency_code` is read by `hero.js` and `prices.js` to derive the currency **symbol**. Prices
  themselves are stored as digits and separators exactly as typed, so the same value renders under
  any currency code — and is never re-grouped, re-separated or rounded by the system.

---

## 5. BUSINESS RULES & SYSTEM GUARDS (IF → THEN)

1. **Structural validation runs continuously, and gates nothing.**
   - **IF** the document changes: `validatePage()` runs (debounced 250 ms) and writes
     `state.issues`; the topbar shows `Issues (N)` with a dot, the outline badges each section,
     and the inspector shows each message beside the field that raised it.
   - **THEN** nothing is blocked. L0 checks all four mandatory anchors exist (`E001`–`E004`),
     that each sits in its immutable slot (`E005`), that Subscription and Contact appear at most
     once (`E006`, `E007`), and that every non-anchor section sits in a permitted slot (`E008`).
     — `BUILT`

2. **The publish gate.**
   - **IF** an author asks to publish: there is no such action. `canPublish()` returns
     `{ ok, blocking }` over all three levels and is called by nothing.
   - The nearest implemented behaviour is the **export confirmation**: with blocking (L0 + L1)
     issues open, *Export* raises *"Export with open issues?"* offering *Review issues* or
     *Export anyway*. Export is explicitly not publish — the file is simply allowed to be
     incomplete. — the gate itself is `PLANNED`; the export confirmation is `BUILT`.

3. **Slug collision guard (L2, `E201`).**
   - **IF** a slug saved in Page settings already belongs to another page: the save is rejected in
     place with `E201: that slug is already in use by another page.` and the dialog stays open.
     `isSlugTaken()` scans every page regardless of status. — `BUILT`
   - **IF** the slug collides with a *retired* slug held by a redirect: there is no redirect
     table and no retired-slug registry, so this half of the guard cannot fire. — `PLANNED`

4. **Slug change on a published page (301 guard).**
   - v1 required confirmation plus an automatic permanent redirect from the old path, with the old
     slug staying reserved. None of it exists: a slug change is an unremarkable field edit, it
     asks nothing, it creates nothing, and the previous path is immediately free for reuse. — `PLANNED`

5. **Route lead hydration fallback.**
   - **Hero form:** `leadForm()` reads `ctx.page.route.default_origin` / `default_destination`
     and writes them as the `value` of the *From* and *To* inputs. — `BUILT`
   - **Modal:** `openLead(prefill)` fills `[data-lead-dest]` **only** from the trigger's
     `data-destination` attribute. The page's `default_destination` is never consulted, and
     `default_origin` has no field in the modal to reach. A generic `#lead-modal` CTA on a
     fully-configured route page therefore opens an empty destination. The rule is specified,
     the hydration site exists, and the page value does not arrive. — `DEFECT`

6. **Currency rendering.**
   - **IF** a price renders: `currencySymbol(code)` builds
     `new Intl.NumberFormat('en', { style: 'currency', currency: code })`, takes
     `formatToParts(0)`, and extracts **only the part of type `currency`**. An unrecognised code
     falls back to `$`.
   - **THEN** the locale is the hardcoded string `'en'` and `target_country` is not passed. Symbol
     *position*, thousands separators and decimal separators are therefore never derived —
     the symbol is concatenated in front of the author's digits unconditionally. v1's worked
     example `EUR/DE → 1.234 €` is not reachable: that page renders `€1.234`. A specified input
     is collected and dropped, and the specified output is wrong for every currency that does not
     lead with its symbol. — `DEFECT`

7. **Deep-cloning on duplication.**
   - v1 specified page duplication with regenerated child ids, `" (Copy)"` appended,
     `status: 'Draft'`, a `{slug}-copy` sequence and no redirect. Duplication is not offered;
     the id-regeneration and slug-sequence machinery it would use is implemented and is exercised
     only by **import**, which does exactly that: fresh page id, fresh section ids, first free
     `-copy` slug when the source slug is taken. — `PLANNED`

8. **Assets travel with the document.**
   - **IF** a page is exported as JSON or saved as a template: `bundle()` walks the whole document
     for `{ asset: string }` values and inlines the full asset record — id, filename, MIME type,
     size and data URL — so the receiving editor can show *"cabin.jpg · 240 KB"* rather than an
     anonymous blob. On import, assets keep their original ids: two imports of the same image
     resolve to one record instead of accumulating copies. — `BUILT`

9. **History is per page and bounded.**
   - Every mutation snapshots the entire page list before applying (60 steps, `HISTORY_MAX`),
     with edits to the same field path inside 700 ms coalesced into one step. Opening another
     page clears both stacks. `Cmd/Ctrl+Z` and `Cmd/Ctrl+Shift+Z` are bound outside text fields.
     — `BUILT`
