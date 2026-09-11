# `21_OBJECT_FLIGHT_QUOTE_MODAL.md`

```yaml
METACLASS: CONCRETE_OBJECT
OBJECT_ID: OBJ-21-FLIGHT-QUOTE-MODAL
VERSION: 2.0.0
STATUS: APPROVED
INHERITANCE: GLOBAL_SINGLETON_OVERLAY (NOT A PAGE SECTION)
DEPENDS_ON: SYS-02-ENUMS (LEAD_ANCHOR)
SOURCE_OF_TRUTH: src/render/page.js (leadModal), src/render/runtime.js, src/sections/hero.js (leadForm), src/sections/prices.js
TARGET_AUDIENCE: [LLM_AGENT, BACKEND_DEV, FRONTEND_DEV, CRM_ENGINEER]
```

---

## 1. OBJECT DEFINITION

The single global lead-capture overlay. `leadModal()` in `src/render/page.js` appends it to every
rendered document — preview and export alike — outside the section tree, with the DOM id
`lead-modal`. `RUNTIME_JS` opens it, closes it and traps focus inside it.

**The two halves are not the same form.** v1 stated that the modal and the Hero embedded form
render the same field set and submit the same payload, and made this document the field set for
both. In the code they are two independent markup blocks with different fields, different
containers and different behaviour, and only one of them is wired to anything. This document
describes the modal, and records the Hero form's divergence in §6 rather than pretending it away.

---

## 2. RELATIONSHIPS (OOUX ORCA MAPPING)

| Relationship | Mechanism | Status |
| :--- | :--- | :--- |
| **Belongs To (N:1)** `20_OBJECT_LANDING_PAGE` | One instance per rendered document, always present, never optional | `BUILT` |
| **Triggered By** `50_OBJECT_PRICE_ROW_ITEM` | Each row is a real `<button data-row-quote>` carrying `data-destination` (the row title) and `data-cabin` | `BUILT` |
| **Triggered By** any CTA with `href="#lead-modal"` | Delegated document click on `a[href="#lead-modal"], [data-lead-open]`; `preventDefault()` then open | `BUILT` |
| **Submits To (1:1 API)** the Flight Quote pipeline → CRM | No request is made; see §5 | `PLANNED` |

`#lead-modal` is the system's only magic href (`LEAD_ANCHOR` in `enums.js`). It is offered as the
default `cta.href` by `ctaFields()`, so a freshly inserted Text & Media or Large Image Banner
already points here.

---

## 3. FIELD CONTRACT

What the overlay actually renders — four unvalidated inputs and a submit button:

| Field | Control | Required | Default / Hydration | Status |
| :--- | :--- | :--- | :--- | :--- |
| `destination` | Text, `[data-lead-dest]` | No | Trigger's `data-destination`, else empty | `BUILT` |
| `full_name` | Text, `required` | Yes (attribute only) | Empty, placeholder *"Full name"* | `BUILT` |
| `email` | `type="email"`, `required` | Yes (attribute only) | Empty, placeholder *"Email"* | `BUILT` |
| `phone` | Text | No | Empty, placeholder *"Phone"* | `BUILT` |
| `origin` | Autocomplete | — | No such field exists in the markup | `PLANNED` |
| `trip_type` | Dropdown, `Round-Trip` default | — | No such field exists in the markup | `PLANNED` |
| `cabin_class` | Dropdown (`Business`, `First`, `Premium Economy`) | — | No such field exists in the markup — but the runtime queries for it; see §4 | `DEFECT` |
| `travelers_total` | Stepper `1..9` | — | No such field exists in the markup | `PLANNED` |
| `departure_date` | DatePicker, min `Today()` | — | No such field exists in the markup | `PLANNED` |
| `return_date` | DatePicker, `>= departure_date` | — | No such field exists in the markup | `PLANNED` |
| `consent` | Checkbox gating submit | — | No such field exists in the markup | `PLANNED` |

**Notes on the above**

* The form carries `novalidate`, so the two `required` attributes suppress nothing and prompt
  nothing: the browser's own constraint UI is switched off and no replacement is bound. The
  submit handler runs whatever the fields contain, including all four empty.
* `CABIN_CLASSES` is exported from `enums.js` and imported by `hero.js` — where it is used to
  print the static string `"Business / 1 Traveler"` into a decorative pill — and by `prices.js`,
  for the per-row `cabin_class` select. The modal never sees it.
* `consent` is absent, so the page collects a name, an email and a phone number with no privacy
  notice and no opt-in of any kind. That is a compliance gap, not only a missing field.
* v1's two design notes still hold as intent: a single `full_name` rather than first/last, and a
  single `travelers_total` rather than an adults/children/infants breakdown.

---

## 4. HYDRATION CONTRACT

```js
function openLead(prefill) {                       // src/render/runtime.js
  var dest  = $('[data-lead-dest]',  modal);
  if (dest  && prefill && prefill.destination) dest.value  = prefill.destination;
  var cabin = $('[data-lead-cabin]', modal);       // ← matches nothing, ever
  if (cabin && prefill && prefill.cabin_class) cabin.value = prefill.cabin_class;
  …
}
```

`prefill` is `{ destination, cabin_class }`, read from the trigger's `data-destination` and
`data-cabin` attributes — supplied by a price row, or both `null` for a generic CTA.

| Behaviour | Status |
| :--- | :--- |
| `destination` hydrated from a price row's `data-destination` (its `row_title`) | `BUILT` |
| A hydrated `destination` stays editable — pre-filled, not locked | `BUILT` |
| `cabin_class` hydrated from the trigger's `data-cabin` | `DEFECT` |
| `origin` / `destination` falling back to the page's `default_origin` / `default_destination` | `PLANNED` |

**The `[data-lead-cabin]` defect.** `prices.js` emits `data-cabin` on every row, the runtime reads
it, and the selector `[data-lead-cabin]` matches no element in any markup the codebase produces —
`leadModal()` emits four inputs and none of them carries that attribute. The guard `if (cabin …)`
means the miss is silent: no error, no console warning, nothing. A visitor who clicks the *First*
row and a visitor who clicks the *Business* row send the identical (empty) cabin. The producer and
the consumer are both implemented; the target is missing.

---

## 5. UX LIFECYCLE

```
[TRIGGER] -> [HYDRATE destination] -> [OPEN: focus to first field, body scroll locked,
                                       ESC + backdrop + × close, Tab trapped]
   -> [SUBMIT] -> preventDefault -> hide the form, print a fixed thank-you
```

| Step | Status |
| :--- | :--- |
| Open — `modal.hidden = false` | `BUILT` |
| Body scroll lock — `document.body.style.overflow = 'hidden'`, restored on close | `BUILT` |
| Focus moves to the **first field**, not to the `×` that precedes it in the DOM | `BUILT` |
| Close on `×` (`[data-lead-close]`) | `BUILT` |
| Close on backdrop click (`e.target === modal`) | `BUILT` |
| Close on `Escape` | `BUILT` |
| Focus trap — `Tab` and `Shift+Tab` wrap within the dialog's enabled focusables | `BUILT` |
| Focus restored to the triggering element on close (`lastTrigger.focus()`) | `BUILT` |
| Submit — `preventDefault()`, then `form.style.display = 'none'` and a fixed message in `[data-msg]` (`role="status"`) | `BUILT` |
| L2 validation before submit — email regex, phone E.164, `return_date >= departure_date` | `PLANNED` |
| Controls locked and a loader shown while in flight | `PLANNED` |
| An actual request to the quote pipeline | `PLANNED` |
| `200` → confirmation naming the destination (*"Your journey to {destination} is requested…"*) | `PLANNED` |
| `4xx`/`5xx` → inline error, controls unlocked, entered data preserved | `PLANNED` |
| Re-opening after a submit restores the form | `PLANNED` |

**Notes on the above**

* The confirmation is the constant string *"Thank you — a travel specialist will contact you
  shortly."* It does not name the destination, and it is shown unconditionally — including for a
  submission with every field blank. Nothing leaves the browser.
* The form is hidden by an inline `display:none` that nothing ever clears. Closing and re-opening
  the overlay in the same page load shows the thank-you message and no form; only a reload
  restores it.

### 5.1 Accessibility Invariants

Fully implemented, and worth saying so plainly: this is the part of the object v1 specified that
the code delivers in full.

| Invariant | Status |
| :--- | :--- |
| `role="dialog"` on `.lead-box` | `BUILT` |
| `aria-modal="true"` | `BUILT` |
| Labelled by its heading — `aria-labelledby="lead-title"` ↔ `<h3 id="lead-title">` | `BUILT` |
| Every input carries an explicit `aria-label` | `BUILT` |
| Close button labelled `aria-label="Close"` | `BUILT` |
| Result region announced — `[data-msg]` carries `role="status"` | `BUILT` |
| Focus moved in on open and restored to the trigger on close | `BUILT` |
| Keyboard cannot walk out of the dialog | `BUILT` |
| Price rows are real `<button>` elements, so keyboard activation is free | `BUILT` |

---

## 6. THE HERO EMBEDDED FORM

`leadForm()` in `src/sections/hero.js` renders `<form class="lead-form" data-hero-lead novalidate>`
inside the Hero card. It is a **different form** from the modal's, and v1's claim that both halves
render one field set and submit one payload is not true of the code.

| Aspect | Modal | Hero form | Status |
| :--- | :--- | :--- | :--- |
| Container | `#lead-modal` `[data-lead-form]` | `[data-hero-lead]` | `BUILT` |
| Fields | destination, full name, email, phone | From, To, Departure, Return, Name, Email, country code + Phone | `BUILT` |
| Route pre-fill | none | `default_origin` → *From*, `default_destination` → *To* | `BUILT` |
| Swap origin/destination | — | `[data-lead-swap]` swaps the pair's two values and refocuses the first | `BUILT` |
| Trip type / cabin / travellers | absent | Two decorative pills — `Round-trip` and `Business / 1 Traveler` — drawn, `aria-hidden`, not controls | `PLANNED` |
| Country dial code | absent | `<select>` of ten hardcoded codes (`+1, +44, +33, +49, +34, +39, +971, +65, +81, +61`) with a fixed 🇺🇸 flag glyph beside it | `PLANNED` |
| Inputs have `name` attributes | yes | **no** — every input is anonymous, so nothing could be serialised from it | `DEFECT` |
| Submit handler | bound | **none** | `DEFECT` |

**The unbound-submit defect.** `RUNTIME_JS` binds `submit` on `[data-lead-form]` only. Nothing in
the codebase ever selects `[data-hero-lead]`. Its `<button class="btn" type="submit">` — the Hero's
primary call to action, the one control the whole above-the-fold layout is built around, labelled
*"Check Your Price"* by default — therefore performs a **native form submission**: a `GET` to the
page's own URL that reloads it and discards everything typed. The `novalidate` attribute means not
even the browser's `required` check interrupts that. The visitor sees the page flash and their
form empty, with no message and no lead recorded.

---

## 7. TELEMETRY & CRM PAYLOAD

No payload is assembled, no event is emitted, and no attribution is captured — not destination,
not cabin, not source section, not page id. `99_SYSTEM_LEAD_GENERATION_WORKFLOW.md §4` describes
the target shape; nothing in `src/` constructs it. — `PLANNED`
