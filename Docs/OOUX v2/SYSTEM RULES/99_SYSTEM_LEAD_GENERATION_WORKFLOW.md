# `99_SYSTEM_LEAD_GENERATION_WORKFLOW.md`

```yaml
METACLASS: SYSTEM_SPECIFICATION (NOT AN OBJECT)
DOCUMENT_ID: SYS-99-LEADGEN
VERSION: 2.0.0
STATUS: APPROVED
DEPENDS_ON: OBJ-21-FLIGHT-QUOTE-MODAL (field contract), SYS-02-ENUMS
SCOPE: FLIGHT_QUOTE_LEAD_GENERATION_ENGINE
IMPLEMENTED_BY: src/render/page.js (leadModal), src/render/runtime.js (RUNTIME_JS), src/sections/hero.js (leadForm), src/sections/prices.js (row markup)
REFERENCE_URL: "https://www.business-class.com/routes/jfk-to-lhr"
TARGET_AUDIENCE: [LLM_AGENT, FRONTEND_DEV, BACKEND_DEV, CRM_ENGINEER]
```

> Every table row and every business rule carries a `BUILT` / `PLANNED` / `DEFECT` marker.
> The legend is in `../README.md`.
>
> **Read §1.2 before building anything against this document.** The lead engine is the
> largest gap between v1 and the code: the modal is a working overlay with no back end, the
> Hero form is markup with no behaviour at all, and the two do not share a field set despite
> both the v1 spec and the code's own comments saying they do.

---

## 1. ARCHITECTURAL OVERVIEW

### 1.1 The two surfaces

```
[HERO SECTION INLINE FORM]  ──── X ──── no submit handler exists
(src/sections/hero.js, leadForm)

[PRICE ROW CLICK] ──────────────┐
(data-destination, data-cabin)  │
                                ├──> [openLead(prefill)] ──> modal shown
[CTA href="#lead-modal"] ───────┘                              │
(any section, via ctaLink)                                     ▼
                                              [submit -> thank-you text, form hidden]
                                                               │
                                                               X  no payload, no network,
                                                                  no CRM, nothing stored
```

### 1.2 The unified-pipeline claim

| Claim (v1 §1) | Reality | Status |
| :--- | :--- | :--- |
| "Two visual formats sharing the exact same data schema" | The two forms are two unrelated hand-written HTML strings in two files. Nothing generates them from a shared descriptor, and their field sets differ — see §2.1. | `DEFECT` |
| "…and backend ingestion pipeline" | No ingestion pipeline of any kind exists. There is no request, no endpoint, no queue and no storage. | `PLANNED` |
| The Hero panel's own author-facing note reads: *"The form fields are fixed by the lead contract (doc 21) and shared with the modal."* (`_form_note`, `src/sections/hero.js`) | False on both counts. The editor asserts a contract to the admin that the renderer does not honour. | `DEFECT` |
| The code comment above `leadForm()` reads: *"Field set per doc 21 §3 — identical to the modal."* | False; see §2.1. | `DEFECT` |

---

## 2. FIELD SETS AS BUILT

### 2.1 Side-by-side

| Field | Hero inline form (`leadForm`) | Modal (`leadModal`) | Status |
| :--- | :--- | :--- | :--- |
| `trip_type` | A decorative pill reading "Round-trip". `aria-hidden`, no input, no state, not selectable. | Absent. | `DEFECT` (Hero) / `PLANNED` (modal) |
| `cabin_class` | A second decorative pill reading `"${CABIN_CLASSES[0]} / 1 Traveler"` — i.e. the literal first enum value, hardcoded. `aria-hidden`, not selectable. | Absent — no cabin control of any kind. | `DEFECT` (Hero) / `PLANNED` (modal) |
| `passengers` | Folded into the same decorative pill as "1 Traveler". No control. | Absent. | `DEFECT` (Hero) / `PLANNED` (modal) |
| `origin` | Real `<input>`, labelled "From", prefilled from `page.route.default_origin`. | **Absent.** The modal has no origin field. | `BUILT` (Hero) / `PLANNED` (modal) |
| `destination` | Real `<input>`, labelled "To", prefilled from `page.route.default_destination`. | Real `<input name="destination" data-lead-dest>`, prefillable at open time. | `BUILT` |
| Origin↔destination swap | Real `<button data-lead-swap>`, wired in `RUNTIME_JS`: swaps the two input values inside the enclosing `.lf-pair` and refocuses the first. | Absent (there is nothing to swap). | `BUILT` |
| `departure_date` | Real `<input type="date">`. | Absent. | `BUILT` (Hero) / `PLANNED` (modal) |
| `return_date` | Real `<input type="date">`. | Absent. | `BUILT` (Hero) / `PLANNED` (modal) |
| `full_name` | Real `<input required>`, `aria-label="Full name"`. | Real `<input name="full_name" required>`. | `BUILT` |
| `email` | Real `<input type="email" required>`. | Real `<input name="email" type="email" required>`. | `BUILT` |
| `phone` | Real `<input required>` plus a `<select>` of ten dial codes (`DIAL_CODES`, a hardcoded list, no country database). | Real `<input name="phone">`, no dial code, not required. | `BUILT` |
| `consent` | Absent. No checkbox, no policy link, no `policy_version`, no gate on submit. | Absent, identically. | `PLANNED` |
| Submit control | `<button class="btn" type="submit">` with the author's `cta_button_text` (default `"Check Your Price"`). | `<button class="btn" type="submit">Send request</button>`. | `BUILT` |

### 2.2 Faults visible in the markup itself

| Fault | Status |
| :--- | :--- |
| **No Hero input carries a `name` attribute.** Every field is identified by `aria-label` only. Even a native form submission would serialise nothing. | `DEFECT` |
| The Hero's three "selector" pills are drawn and inert. They are `aria-hidden` on purpose — announcing a control a screen-reader user cannot change is worse than not announcing it — which makes the accessibility handling correct and the control itself decoration. A sighted visitor sees a trip-type and cabin selector that cannot be opened. | `DEFECT` |
| `<form data-hero-lead novalidate>` carries `novalidate`, so the browser's own required-field enforcement is switched off, and nothing replaces it. | `DEFECT` |
| The modal's `destination` input is not `required`, so the one field the price-row path exists to populate can be sent empty. | `DEFECT` |

---

## 3. EVENT DISPATCHERS & TRIGGER MATRIX

All handlers live in `RUNTIME_JS` (`src/render/runtime.js`) and ship inside the exported
page. They are delegated from `document`, so sections rendered in any order are covered.

| Trigger source | Component | Event | Pre-populated parameters | Resulting state | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Price row** | `SECTION_PRICES` | `click` on `[data-row-quote]` | `destination` from `data-destination` (= `row.row_title`), `cabin_class` from `data-cabin` (= `row.cabin_class`, defaulting to `'Business'`) | Modal opens, `lastTrigger` remembered for focus return. Rows are real `<button>`s, so keyboard activation is free. | `BUILT` |
| **Any CTA** | any section | `click` on `a[href="#lead-modal"]` | `data-destination` / `data-cabin` if the author's markup carries them; otherwise nothing | Modal opens empty. `ctaLink()` makes `#lead-modal` the default href of every CTA field. | `BUILT` |
| **`[data-lead-open]`** | — | `click` | as above | The selector is queried by `RUNTIME_JS` and **no markup in `src/` emits the attribute**. A dead hook. | `DEFECT` |
| **Hero lead form** | `SECTION_HERO` | `submit` | — | **Nothing is bound.** `data-hero-lead` appears exactly once in `src/`, on the `<form>` element itself; no selector anywhere queries it. With no handler and no `action`, activating the CTA performs a native GET submission that reloads the page — and, because no input has a `name`, discards every value the visitor typed. | `DEFECT` |

### 3.1 Prefill engine

| Rule | Status |
| :--- | :--- |
| `openLead(prefill)` writes `prefill.destination` into `[data-lead-dest]` when both exist. | `BUILT` |
| `openLead(prefill)` writes `prefill.cabin_class` into `[data-lead-cabin]`. The selector is queried on every open and **matches nothing**: no element in `src/` carries `data-lead-cabin`, because the modal has no cabin control. Cabin is read off the row, carried into the prefill object, and silently dropped. | `DEFECT` |
| `cabin_class` originates from `PriceRowItem.cabin_class` (doc 50), never from `label_1`, which is free presentational text. The row markup honours this. | `BUILT` |
| The modal receives **no origin prefill**. `page.route.default_origin` is never read by the modal path; the modal has no origin field to receive it. | `PLANNED` |
| The Hero form is prefilled at **render time**, not at open time: `leadForm()` interpolates `ctx.page.route.default_origin` and `default_destination` straight into the `value` attributes of the From and To inputs. | `BUILT` |
| Destination is pre-filled and **editable**, never locked — a visitor who clicked the wrong row can correct it in place. | `BUILT` |
| Contact Us is outside this engine; its form is governed by `35_OBJECT_SECTION_STATIC_CONTACT`. | `BUILT` |

---

## 4. FLIGHT QUOTE DATA CONTRACT & CRM PAYLOAD

**No submission payload is constructed anywhere in `src/`.** The block below is the target
contract, not a description of running code. Each group is marked for what exists today.

```typescript
interface FlightQuoteSubmissionPayload {
  flight_search: {
    trip_type: 'round_trip' | 'one_way';
    origin: string;                 // IATA code or city name
    destination: string;
    departure_date: ISO8601Date;
    return_date?: ISO8601Date;      // null if one_way
    cabin_class: 'Business' | 'First' | 'Premium Economy';   // SYS-02 CABIN_CLASSES
    passengers: { total: number };  // 1..9
  };
  contact: { full_name: string; email: string; phone: string /* E.164 */ };
  consent: { granted: true; policy_version: string; granted_at: ISO8601 };
  telemetry: {
    page_id: UUID; page_slug: string;
    source_type: 'HERO_EMBEDDED' | 'PRICE_ROW_MODAL' | 'DYNAMIC_CTA';
    source_row_id?: UUID; selected_row_price?: string; currency: string;
    client_timestamp: ISO8601;
    landing_url: string; referrer?: string; session_id: string;
    utm?: { source?, medium?, campaign?, term?, content? };
    click_ids?: { gclid?, fbclid?, msclkid? };
  };
}
```

| Payload group | What exists today | Status |
| :--- | :--- | :--- |
| `flight_search.origin` / `.destination` | Collected by the Hero form's inputs (unnamed, unserialised) and by the modal's `destination` input. Never assembled into an object. | `PLANNED` |
| `flight_search.departure_date` / `.return_date` | Two `<input type="date">` in the Hero only. Never read. | `PLANNED` |
| `flight_search.trip_type` / `.cabin_class` / `.passengers` | No collectable control on either surface (Hero has decorative pills, modal has nothing). | `PLANNED` |
| `contact.full_name` / `.email` / `.phone` | Real inputs on both surfaces. The modal's carry `name` attributes; the Hero's do not. Never read by script. | `PLANNED` |
| `consent.*` | Nothing. No consent control, no policy version, no timestamp, and submit is not gated on consent on either surface. | `PLANNED` |
| `telemetry.*` — every field, including `source_type`, `page_id`, `page_slug`, `currency`, UTM parameters, click ids, referrer, `session_id`, `landing_url` | Nothing. No analytics call, no attribution capture, no session identifier. The runtime does not read `location`, `document.referrer` or any query parameter. | `PLANNED` |
| CRM ingestion | Nothing. No `fetch`, no `XMLHttpRequest`, no `sendBeacon`, no endpoint constant anywhere in `RUNTIME_JS` or the exported document. | `PLANNED` |

### 4.1 What the modal's submit handler actually does

```js
if(form) form.addEventListener('submit', function(e){
  e.preventDefault();
  var msg = $('[data-msg]', modal);
  if(msg) msg.textContent = 'Thank you — a travel specialist will contact you shortly.';
  form.style.display = 'none';
});
```

| Rule | Status |
| :--- | :--- |
| Submission is intercepted and the page does not navigate. | `BUILT` |
| The success message is announced to assistive technology: `<div class="msg" data-msg role="status">`. | `BUILT` |
| **The page promises the visitor a reply and captures nothing.** The handler writes "a travel specialist will contact you shortly", hides the form, and discards every value entered. No lead exists anywhere afterwards. This is not merely an unimplemented pipeline — it is a false confirmation shown to a real visitor, and it is the highest-severity item in this document. | `DEFECT` |
| There is no failure state. Because nothing can fail, no error branch, retry or validation message exists; `novalidate` on the form removes the browser's own last line of defence. | `PLANNED` |
| The Hero form reaches none of this: it has no handler, so it has no success state either. | `DEFECT` |

---

## 5. CLIENT-SIDE UX LIFECYCLE

The modal's interaction contract, implemented in `RUNTIME_JS`.

| Behaviour | Implementation | Status |
| :--- | :--- | :--- |
| Open | `modal.hidden = false`; `.lead[hidden]{display:none}` in `BASE_CSS` is the paired rule. | `BUILT` |
| Scroll lock | `document.body.style.overflow = 'hidden'` on open, restored to `''` on close. | `BUILT` |
| Initial focus | Lands on the first `input, select, textarea`, falling back to the first `button` — deliberately **not** the close button that precedes them in the DOM, so no visitor spends their first Tab leaving the ✕. | `BUILT` |
| Focus trap | `keydown` on `Tab` / `Shift+Tab` cycles within the modal's enabled focusables. A dialog the keyboard can walk out of is not a dialog. | `BUILT` |
| Close by ✕ | Delegated click on `[data-lead-close]`. | `BUILT` |
| Close by backdrop | `e.target === modal`, so only the overlay itself, never a click inside the box. | `BUILT` |
| Close by `Escape` | `keydown`, guarded on `modal.hidden`. | `BUILT` |
| Focus return | `lastTrigger.focus()` on close; `lastTrigger` is set by the CTA click and by the price-row click. | `BUILT` |
| Dialog semantics | `role="dialog" aria-modal="true" aria-labelledby="lead-title"` on `.lead-box`. | `BUILT` |
| Inert background | The rest of the document is not marked `inert` or `aria-hidden` while the dialog is open; the focus trap is the only containment. | `PLANNED` |
| Reduced motion | Global: `BASE_CSS` collapses animations and transitions under `prefers-reduced-motion: reduce`. The modal has no entrance animation of its own. | `BUILT` |
| Hero form lifecycle | None. The Hero form has no open/close (it is always present) and no submit, success, error or busy state. | `DEFECT` |

---

## 6. WHAT A ROADMAP ENTRY FOR THIS ENGINE MUST COVER

Stated here so that `ROADMAP.md` and `DEFECTS.md` can be written from this document without
re-reading the source.

**Unbuilt (`PLANNED`):** the shared field descriptor both surfaces render from; the modal's
missing `origin`, dates, `trip_type`, `cabin_class` and `passengers` controls; the consent
group and the submit gate that depends on it; the whole `telemetry` block including
attribution; the CRM endpoint and its request; an error/retry state; background inerting.

**Broken (`DEFECT`):** the Hero form's absent submit binding (`data-hero-lead` bound
nowhere); the Hero inputs' absent `name` attributes; the Hero's three decorative selector
pills; `novalidate` on both forms with nothing replacing it; the `[data-lead-cabin]`
selector that matches no element, silently dropping the cabin carried in from the price row;
the `[data-lead-open]` hook that no markup emits; the modal's non-required `destination`;
the editor note and the source comment that both assert a shared field contract that does
not exist; and, above all, the success message that tells a visitor a specialist will be in
touch when no lead has been recorded.
