# `20_OBJECT_LANDING_PAGE.md`

```yaml
METACLASS: CONCRETE_OBJECT
OBJECT_ID: OBJ-20-LANDING-PAGE
VERSION: 1.1.0
STATUS: APPROVED
DEPENDS_ON: SYS-02-ENUMS
INHERITANCE: ROOT_CONTAINER_ENTITY
TARGET_AUDIENCE: [LLM_AGENT, BACKEND_DEV, FRONTEND_DEV, SEO_SPECIALIST]
```

---

## 1. OBJECT DEFINITION
The root-level container entity representing an individual marketing landing page. Owns the URL routing endpoint, global metadata, SEO/OpenGraph configurations, default flight route parameters (origin/destination), and the ordered collection of all child page sections.

---

## 2. RELATIONSHIPS (OOUX ORCA MAPPING)

- **Has Many (1:N, Ordered):** `10_ABSTRACT_OBJECT_PAGE_SECTION`, ordered by `slot_index` then `order_in_slot`.
- **Owns (1:1):** `21_OBJECT_FLIGHT_QUOTE_MODAL` (one overlay per rendered page, hydrated with page route defaults).
- **Belongs To (N:1):** `GlobalDomainConfig` (Inherits base domain, root typography, and default fallback currency).

---

## 3. OBJECT LIFECYCLE & ADMIN CTAs

| Action (CTA) | Admin UI Location | System Behavior |
| :--- | :--- | :--- |
| **Create New Page** | CMS Dashboard | Initializes a blank page or loads a template preset with all mandatory anchors pre-populated. |
| **Edit Canvas** | CMS Dashboard | Enters the visual drag-and-drop page builder environment. |
| **Duplicate Page** | CMS Dashboard (Actions Menu) | Executes a **deep-clone** of the page and all its child sections/items, generating fresh UUIDs for every entity. |
| **Publish** | Top Builder Bar | Runs L0 + L1 (`SYS-02-ENUMS §4`) and sets status `Published` (`HTTP 200`). *The status enum has no `Live` member; that wording is retired.* |
| **Unpublish** | Top Builder Bar | Transitions status back to `Draft`. Visitors receive **`HTTP 410 Gone`** if the page was ever published, otherwise `404`. Never a redirect. |
| **Archive / Delete**| Settings Drawer | Soft-deletes the page (`status: 'Archived'`). Retains historical lead attribution. |

---

## 4. ATTRIBUTES MATRIX

### 4.1 System & Routing Attributes

| Attribute Name | Data Type | Required | Default Value | Mutability | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `page_id` | `UUIDv4` | Yes | `AUTO_GEN` | Immutable | Unique system identifier. |
| `internal_name` | `String` | Yes | `"New Landing Page"` | Mutable | Internal administrative title displayed in CMS lists. |
| `slug` | `String` | Yes | `None` | Mutable | URL path segment (e.g., `"jfk-to-lhr"`). Regex: `^[a-z0-9-]+$`. |
| `status` | `Enum` | Yes | `Draft` | Mutable | [`Draft`, `Published`, `Archived`]. |
| `page_type` | `Enum` | Yes | `RoutePage` | Mutable | [`RoutePage`, `CampaignPage`, `HomePage`]. |

### 4.2 SEO & Social Graph (Meta) Attributes

| Attribute Name | Data Type | Required | Default Value | Description |
| :--- | :--- | :--- | :--- | :--- |
| `meta_title` | `String` | Yes **at publish (L1)** | `internal_name` | Browser title tag (< 60 chars recommended). A draft may leave it empty. |
| `meta_description`| `String` | Yes **at publish (L1)** | `None` | Search engine description snippet (< 160 chars). |
| `canonical_url` | `URL` | No | Self URL | Overrides standard canonical link if defined. |
| `og_image` | `File` | No | Brand Default | Social share preview image (`1200x630 px`, JPG/PNG). |
| `noindex_nofollow`| `Boolean`| Yes | `false` | When `true`, injects `<meta name="robots" content="noindex, nofollow">`. |

### 4.3 Route & Flight Lead Attribution Attributes

| Attribute Name | Data Type | Required | Default Value | Description |
| :--- | :--- | :--- | :--- | :--- |
| `default_origin` | `String` | No | `null` | Primary departure city/IATA code (e.g., `"JFK"`). Pre-fills flight forms. |
| `default_destination`| `String`| No | `null` | Primary arrival city/IATA code (e.g., `"LHR"`). Pre-fills flight forms. |
| `target_country` | `ISO 3166-1`| Yes | `"US"` | Targeted consumer market country code. |
| `target_region` | `Enum` | Yes | `"Global"` | Values per `SYS-02-ENUMS §2` — the same list `PriceRowItem.region` uses. |
| `currency_code` | `ISO 4217` | Yes | `"USD"` | Baseline currency for every price on the page. **Rendering:** symbol, position and separators come from the `Intl.NumberFormat` rules for `currency_code` + `target_country` — `USD/US` -> `$1,234`, `EUR/DE` -> `1.234 €`. Prices are stored as unformatted digits (docs 30 §4.5, 50 §4.1) so the same value renders correctly under any currency. |

---

## 5. BUSINESS RULES & SYSTEM GUARDS (IF -> THEN)

1. **Publishing Integrity Gate:**
   - **IF** Admin clicks «Publish»:
     - **THEN** The system verifies that all 4 mandatory anchors (`HeroSection`, `PricesSection`, `TrustSection`, `FooterSection`) exist on the page and are in valid structural order.
     - **IF** Any anchor is missing: System aborts publishing and displays an alert: `Cannot publish: Page must contain Hero, Prices, Trust, and Footer sections.`

2. **Slug Collision Guard (L2, `E201`):**
   - **IF** Admin saves a `slug` that already exists on another `Published`, `Draft` or
     `Archived` page, **or** that matches a retired slug still held by a redirect:
     - **THEN** the save is rejected: `Slug is already in use. Please enter a unique URL path.`

2a. **Slug Change on a Published Page (301 Guard):**
   - **IF** `slug` changes on a page whose status is or has ever been `Published`:
     - **THEN** the system requires confirmation and **automatically creates a permanent
       redirect** from the old path to the new one, preserving accumulated search ranking.
       The old slug stays reserved.

3. **Route Lead Hydration Fallback:**
   - **IF** A user triggers the Quote Modal from a dynamic CTA (without a specific row context):
     - **THEN** The modal form fields for `Origin` and `Destination` automatically hydrate using this page's `default_origin` and `default_destination`.

4. **Deep-Cloning on Duplication:**
   - **IF** Admin duplicates a landing page:
     - **THEN** The system clones the page entity, appends `" (Copy)"` to `internal_name`, resets `status: 'Draft'`, and **re-generates unique `section_id`s and `item_id`s** for every nested child section and item.
     - **Slug:** the clone takes `{slug}-copy`; if that is taken, `{slug}-copy-2`, `-3`, … up to
       the first free value — never `-copy-copy`.
     - No redirect is created for a clone — the source page keeps its own URL.
