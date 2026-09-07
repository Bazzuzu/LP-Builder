# `21_OBJECT_FLIGHT_QUOTE_MODAL.md`

```yaml
METACLASS: CONCRETE_OBJECT
OBJECT_ID: OBJ-21-FLIGHT-QUOTE-MODAL
VERSION: 1.0.0
STATUS: APPROVED
INHERITANCE: GLOBAL_SINGLETON_OVERLAY (NOT A PAGE SECTION)
TARGET_AUDIENCE: [LLM_AGENT, BACKEND_DEV, FRONTEND_DEV, CRM_ENGINEER]
```

---

## 1. OBJECT DEFINITION
The single global lead-capture overlay. Mounted once per page, outside the section tree, and
hydrated on demand by any dispatcher. It is the modal half of the Flight Quote Engine defined in
`99_SYSTEM_LEAD_GENERATION_WORKFLOW.md`; the Hero embedded form is the inline half.

**Both halves render the same field set and submit the same payload.** This document is the
field set. `30_OBJECT_SECTION_HERO.md` §4.6 references it rather than redefining it.

---

## 2. RELATIONSHIPS (OOUX ORCA MAPPING)

- **Belongs To (N:1):** `20_OBJECT_LANDING_PAGE` (one instance per rendered page, DOM id `lead-modal`).
- **Triggered By (N:1):**
  - `50_OBJECT_PRICE_ROW_ITEM` — row click.
  - Any CTA whose `cta_url === '#lead-modal'` (docs 38, 39, and Hero menu).
- **Submits To (1:1 API):** Unified Flight Quote pipeline → CRM ingestion.

---

## 3. FIELD CONTRACT (SHARED WITH HERO EMBEDDED FORM)

| Field | Control | Required | Default / Hydration |
| :--- | :--- | :--- | :--- |
| `trip_type` | Dropdown | Yes | `Round-Trip`. `One-Way` hides `return_date`. |
| `cabin_class` | Dropdown | Yes | `Business`. Enum: `Business`, `First`, `Premium Economy`. |
| `travelers_total` | Stepper `1..9` | Yes | `1`. |
| `origin` | Autocomplete | Yes | `LandingPage.default_origin`, else empty. |
| `destination` | Autocomplete | Yes | Dispatcher-supplied, else `LandingPage.default_destination`. |
| `departure_date` | DatePicker | Yes | `null`. Earliest selectable: `Today()`. |
| `return_date` | DatePicker | If `Round-Trip` | `null`. Must be `>= departure_date` (L2). |
| `full_name` | Text | Yes | Empty. Placeholder *"Enter your name"*. |
| `email` | Email | Yes | Empty. Regex `^[^\s@]+@[^\s@]+\.[^\s@]+$` (L2). |
| `phone` | Country select + input | Yes | Country auto-detected by GEO. E.164 on submit (L2). |
| `consent` | Checkbox | Yes | Unchecked. Label: *"I agree to the Privacy Policy and to be contacted about this request."* Submit stays disabled until checked. |

> **Single name field is deliberate.** The CRM payload therefore carries `contact.full_name`,
> not `first_name`/`last_name`. Splitting the field is a Phase 2 decision; if it is taken, both
> halves and the payload change together.

> **`travelers_total` is a single number**, matching the Hero wireframe control. The payload
> mirrors it as `passengers.total`. An adults/children/infants breakdown is Phase 2.

---

## 4. HYDRATION CONTRACT

```typescript
function hydrateQuoteModal(source: QuoteTrigger, page: LandingPage): FlightQuoteFormState {
  return {
    trip_type: 'round_trip',
    cabin_class: source.cabin_class ?? 'Business',   // PriceRowItem.cabin_class, never a free-text label
    origin: page.default_origin ?? '',
    destination: source.destination ?? page.default_destination ?? '',
    travelers_total: 1,
    departure_date: null,
    return_date: null,
    full_name: '', email: '', phone: '', consent: false,
  };
}
```

* `source` is `{ destination?, cabin_class?, row_id?, row_price? }` — supplied by a price row,
  or `{}` for a generic CTA.
* A hydrated `destination` is **pre-filled and editable**, not locked: a visitor who opened the
  modal from the wrong row must be able to correct it without closing the overlay.

---

## 5. UX LIFECYCLE

```
[TRIGGER] -> [HYDRATE] -> [OPEN: focus trapped, body scroll locked, ESC + backdrop close]
   -> [SUBMIT] -> validate (L2) -> lock controls, show loader
        |- 200 -> confirmation state: "Your journey to {destination} is requested.
        |          A travel specialist will contact you shortly."
        |- 4xx/5xx -> inline error, controls unlocked, entered data preserved
```

**Accessibility invariants:** `role="dialog"`, `aria-modal="true"`, labelled by its heading,
focus moved to the first field on open and restored to the trigger element on close.

---

## 6. TELEMETRY

Emitted with the payload defined in `99_SYSTEM_LEAD_GENERATION_WORKFLOW.md` §4.
