# `99_SYSTEM_LEAD_GENERATION_WORKFLOW.md`

```yaml
METACLASS: SYSTEM_SPECIFICATION (NOT AN OBJECT)
DOCUMENT_ID: SYS-99-LEADGEN
VERSION: 2.0.0
STATUS: APPROVED
DEPENDS_ON: OBJ-21-FLIGHT-QUOTE-MODAL (field contract), SYS-02-ENUMS
SCOPE: FLIGHT_QUOTE_LEAD_GENERATION_ENGINE
REFERENCE_URL: "https://www.business-class.com/routes/jfk-to-lhr"
TARGET_AUDIENCE: [LLM_AGENT, FRONTEND_DEV, BACKEND_DEV, CRM_ENGINEER]
```

---

## 1. ARCHITECTURAL OVERVIEW

The lead capture system is unified around a single **Flight Quote Request Engine** modeled directly after the core Route Page workflow (`business-class.com/routes/*`). 

The search and lead submission interface exists in two visual formats sharing the exact same data schema and backend ingestion pipeline:
1. **Embedded Form:** Pinned inline inside the `HeroSection`.
2. **Modal Form:** Dispatched on demand when a user clicks a `PriceRow` in the `PricesSection`.

```
[HERO SECTION INLINE FORM] ────────┐
(User fills flight details & CTA)   │
                                    ├───> [UNIFIED FLIGHT QUOTE PIPELINE] ───> CRM Ingestion
[PRICE ROW CLICK] ──────────────────┘
(Injects Row Title as Destination)
             │
             ▼
[FLIGHT QUOTE MODAL MOUNTED]
(Same form fields as Hero)
```

---

## 2. EVENT DISPATCHERS & TRIGGER MATRIX

| Trigger Source | UI Component | Trigger Event | Pre-populated Parameters | Resulting UX State |
| :--- | :--- | :--- | :--- | :--- |
| **Hero Lead Form** | `SECTION_HERO` | `onSubmit` (CTA) | `Origin`, `Destination` from Page Route | Direct Quote Submission / Transition to confirmation. |
| **Price Row Item** | `SECTION_PRICES` | `onClick` (Row) | `Destination = row.row_title`<br>`Cabin = row.cabin_class`<br>`Origin = page.default_origin` | Mounts the Flight Quote Modal with `Destination` **pre-filled and editable** (not locked — a visitor who clicked the wrong row must be able to correct it in place). |
| **Dynamic CTA** | `ANY_DYNAMIC` | `onClick` (URL=`#lead-modal`) | Route-level defaults from `LandingPage` | Mounts the empty/default Flight Quote Modal. |

*(Note: Contact Us is excluded from this engine; its form and behavior are governed strictly by its own global component).*

---

## 3. PARAMETER PRE-POPULATION ENGINE

**Defined in `21_OBJECT_FLIGHT_QUOTE_MODAL.md §4`.** It is not restated here.

> `cabin_class` comes from `PriceRowItem.cabin_class` (doc 50 §4.1) — never from `label_1`,
> which is free-text and presentational.

---

## 4. FLIGHT QUOTE DATA CONTRACT & CRM PAYLOAD

Both the Hero form and the modal submit this payload. Every field mirrors the doc 21 field
contract and is collectable by the form as specified.

```typescript
interface FlightQuoteSubmissionPayload {
  // 1. Flight Search Criteria
  flight_search: {
    trip_type: 'round_trip' | 'one_way';
    origin: string;                 // IATA code or city name
    destination: string;
    departure_date: ISO8601Date;
    return_date?: ISO8601Date;      // null if one_way
    cabin_class: 'Business' | 'First' | 'Premium Economy';
    passengers: { total: number };  // 1..9, matches the single travellers control
  };

  // 2. Traveler Contact Details
  contact: {
    full_name: string;   // single field, per doc 21 §3
    email: string;
    phone: string;       // E.164
  };

  // 3. Consent (required before submit is enabled)
  consent: {
    granted: true;
    policy_version: string;   // version of the privacy policy shown at submit time
    granted_at: ISO8601;
  };

  // 4. Telemetry & Lead Attribution
  telemetry: {
    page_id: UUID;
    page_slug: string;
    source_type: 'HERO_EMBEDDED' | 'PRICE_ROW_MODAL' | 'DYNAMIC_CTA';
    source_row_id?: UUID;
    selected_row_price?: string;
    currency: string;
    client_timestamp: ISO8601;

    // Attribution — required for paid-vs-organic reporting.
    landing_url: string;
    referrer?: string;
    session_id: string;
    utm?: { source?: string; medium?: string; campaign?: string; term?: string; content?: string };
    click_ids?: { gclid?: string; fbclid?: string; msclkid?: string };
  };
}
```

---

## 5. CLIENT-SIDE UX LIFECYCLE

**Defined in `21_OBJECT_FLIGHT_QUOTE_MODAL.md §5`**, including focus management, scroll lock and
the success/error state machine. The Hero embedded form follows the same machine minus
mount/unmount.
