# ROADMAP — what was deliberately not built

Every item marked `PLANNED` in the specs lives here, together with the objects the model
intentionally does not describe.

How this differs from `DEFECTS.md`: there, code was written and does not work. Here, there is no
code and never was. An item here is closed by deciding to build it; an item there is closed by
fixing a bug.

**While an item is here, it may not be referenced as existing behaviour.**

---

## 1. Publishing and the page lifecycle

The largest gap: **there is no publishing mechanism**. `canPublish()` is written and is called
only from the test suite; `status` is assigned once when a page is created and never changes
anywhere in `src/`. Every page is a `Draft` forever.

| Item | Where described | Note |
|---|---|---|
| The `Draft → Published` transition and the publish gate | SYS-00 §5, 20 §3 | The validator is ready; nobody calls it |
| Unpublish with a 410 response | 20 §3 | |
| Archive as a soft delete | 20 §3 | The delete that exists is permanent and unconfirmed |
| Duplicate Page | 20 §3, §5.4 | `freeCopySlug()` already exists; only the importer uses it |
| L1 checks on `meta_title` / `meta_description` | 20 §4.2 | `page.meta` is not validated at all |
| A 301 redirect on slug change | 20 §5.2a | |
| A guard against retired slugs held by redirects | 20 §5.2 | A code comment promises this coverage; it does not exist |

## 2. Validation level L2

`E200` is declared in the error registry and constructed by no call site. `setSectionProp` writes
any value to any path with no checks. No format, no regular expression, no rejected save.

| Item | Where described |
|---|---|
| The whole L2 level and the `E200` code | SYS-02 §4 |
| `anchor_id` format and uniqueness (`^[a-z0-9-]+$`) | 10 §4.1 |
| The email regular expression in both forms | 21 §3, 34 §5.2 |
| `return_date >= departure_date` | 21 §3 |
| Stripping a typed leading currency symbol from the price field | 30 §4.5 |
| Checking that a fragment CTA points at an existing `anchor_id` | 38 §6.2 |
| Closed-list enforcement of `REGIONS` on stored data | SYS-02 §2 |

## 3. Lead generation

The forms collect part of the contract and there is nowhere to send it. **The absence of a
pipeline is a plan; the false confirmation of submission is a defect — see `DEFECTS.md` D-02.**

| Item | Where described |
|---|---|
| A shared field descriptor both forms render from | SYS-99 §1 |
| In the modal: `origin`, both dates, `trip_type`, `cabin_class`, `passengers` | 21 §3 |
| The `consent` block and blocking submission until it is checked | 21 §3, SYS-99 §4 |
| The `telemetry` block: UTM, `gclid`, `referrer`, `session_id`, `landing_url` | SYS-99 §4 |
| The CRM endpoint and the request itself | SYS-99 §5 |
| Loading, error and data-preservation states | 21 §5 |
| Hydrating the modal from the page's `default_origin` / `default_destination` | 20 §5.3 |
| `row_id` and the row's price in the payload | 31 §2, 50 §5.5 |
| Inerting the background behind the modal | 21 §5 |

## 4. Editors that do not exist

The fields exist in the model and in the renderer, and there is nothing in the interface to set
them. The value is reachable only through imported JSON.

| Field | Where described |
|---|---|
| `og_image` | 20 §4.2 |
| `navigation_columns`, `social_channels`, `accreditation_seals` | 33 §4.2 |
| `phone_image` | 34 §4.2 |
| `anchor_id` on six sections: Hero, Prices, Trust, Footer, Subscription, Contact | 10 §4.1 |

That last one deserves attention on its own: an anchor link in the navigation most often points
at exactly these sections, and they are the only ones without the field.

## 5. Attributes described in v1 and not implemented

Listed so that nobody re-adds them by oversight, and so that their absence reads as a decision
rather than a loss.

| Attribute | Section | Why it is on this list |
|---|---|---|
| `mobile_fallback_color` | Hero 30 §4.2 | One fallback colour at every width |
| `price_footnote` | Hero 30 §4.5 | The footnote moved into the footer's global legal text |
| `badge_data` as an object | Hero 30 §4.3 | Decomposed into three flat fields |
| `title_color` / `title_weight` / `title_italic` | Prices 31 §4.2 | Removed deliberately on 11 September 2026 |
| `text_color` | Price Row 50 §4.2 | Removed with them |
| `media_side` | Story & Specs 36 §4.1 | The section's layout is fixed |
| `card_id`, `item_id` | 51 §4, 52 §4 | Identity is the array index |
| `operational_notice`, `office_location` | Contact 35 §4.2 | Neither stored nor rendered |
| Channels `phone_primary` / `phone_international` / `email_support` | Contact 35 §4.2 | The real keys are `chat` / `phone` / `email`; there is no international channel |
| Feature preset content payloads | 41 §5 | A preset changes layout only |

## 6. Guarantees that are described and enforced by nothing

| Item | Where described | What actually happens |
|---|---|---|
| Anchor uniqueness on a page | SYS-00 §4 | Not checked at all; two Heroes in slot 0 raise no issue. Reachable through import |
| Key, slot and archetype checks on import | 20 §3 | `sectionsFrom()` checks nothing — the only path by which `E008` and duplicate anchors are reachable at all |
| A model-level guard on deleting or hiding anchors | 10 §5 | Protection is in the UI only; a console call or an import removes a Hero |
| "Every phone and email is clickable" | Contact 35 §5.2 | `tel:` and `mailto:` are typed by hand into rich text; nothing generates or validates them |
| A live Trustpilot feed | Trust 32 §1 | Nothing is fetched; `business_unit_id` is empty and `cache_ttl_minutes` is never read |
| A rejected section move reports `E008` | SYS-00 §3.1.2 | `moveTo()` silently returns `false`; the condition is unreachable |

## 7. Model discipline

| Item | Why |
|---|---|
| A test that reads the key table out of `SYS-02 §1` and compares it to `COMPONENT_KEYS` | The registry guard compares code to code. That is exactly how `SECTION_FAQ` lived in the system without a document |
| Tests for token names and values, the defaults matrix, and the L1 codes | `test/` currently asserts none of these |
| An error code for a duplicated anchor | `E008` currently carries two unrelated meanings |
| `faq.js` declares `doc: 0` | It should be `doc: 42` |
| Moving literal `font-size` declarations onto tokens | 77 literal declarations against 11 that read a variable; `--title-*`, `--body-m/s` and `--label-*` are read by no rule |
| Removing the dead exports in `enums.js` | `LEAD_ANCHOR`, `BREAKPOINT`, `maxInstances`, `PAGE_STATUSES`, `HEADING_SIZES`, `HEADING_ALIGNS` are imported nowhere |

## 8. Objects the model does not describe

Carried over from v1's `BACKLOG.md` and checked for currency.

| Object | Who refers to it | Why it is needed |
|---|---|---|
| `SITE_HEADER` (header / navigation) | 30 §4.1 — `theme_mode` switches the logo, menu and phone | Hero manages assets belonging to an object that does not exist. The header's phone number is currently hardcoded in the module and differs from the one in Contact |
| `ASSET` / media library | every file field | No reuse across pages, no weight limits, no srcset, no conversion |
| `ROLE` / permissions | 32, 33, 34, 35 | Read-only modes are described; the subjects holding those permissions are not |
| `GlobalDomainConfig` | 20 §2 declares it the page's parent | There is no schema |

`PAGE_TEMPLATE` has **left** this list: templates now have a contract — built-in ones in
`src/presets/page-templates.js`, saved ones in `src/presets/templates/`, plus page import and
export. Described in 20 §3.

## 9. Mechanics that do not exist

- **Versioning and preview.** No draft preview, no editing a published page without shipping it,
  no scheduled publication, no rollback, no history.
- **Structured data.** No JSON-LD: `Offer` for the fare table, `FAQPage` for section 42,
  `BreadcrumbList`.
- **Localisation.** There is `target_country` / `target_region` but no `locale` and no link
  between language versions. And `target_country` and `target_region` are currently read by
  nobody at all.
- **Rendering strategy.** 33 §5.3 promises that editing the footer updates every page
  immediately — which implies SSR/ISR and cache invalidation. The architecture is not settled.
- **Currency formatting.** `Intl.NumberFormat('en', …)` with a hardcoded locale; only the symbol
  is taken from the result. `EUR/DE` renders `€1.234`, not `1.234 €`.
