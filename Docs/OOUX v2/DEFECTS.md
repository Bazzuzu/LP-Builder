# DEFECTS — described, implemented, not working

Every item marked `DEFECT` in the specs lives here. These are **bugs, not model divergences**:
the behaviour is described, code was written for it, and it does not fire.

How this differs from `ROADMAP.md`: that file holds what was deliberately not done. This one
holds what was done and does not work. An item here is closed by fixing code; an item there is
closed by deciding to build it.

Source: the reconciliation of `Docs/OOUX` v1 against `src/`, 11 September 2026. Five items were
re-verified by hand, line by line; the rest come from the reconciliation reports, with line
references.

---

## D-01 · The Hero form does not submit · Hero §4.6

The form is tagged `data-hero-lead` (`src/sections/hero.js`). The runtime only ever binds
`[data-lead-form]` (`src/render/runtime.js:61`), an attribute that exists solely on the modal
(`src/render/page.js:118`). Nothing in `src/` reads `data-hero-lead`.

**What happens:** pressing the button performs a native form submission, which reloads the page.
No `preventDefault`, no confirmation, nothing stored. The lead is lost entirely. The form's
inputs additionally carry no `name` attributes, so even a bound handler would serialise nothing.

**Verified by hand.** The most expensive item on the list: this is the landing page's primary
conversion point.

---

## D-02 · The modal reports success and discards the lead · SYS-99 §5, 21 §5

The modal's submit handler (`src/render/runtime.js:61-67`) consists entirely of: cancel the
event, write "Thank you — a travel specialist will contact you shortly", hide the form. No
`fetch`, no `sendBeacon`, no write to storage — there is not a single network call anywhere in
the runtime.

**What happens:** a visitor fills in their name, email and phone number, is told a specialist
will contact them, and nobody does. The data is stored nowhere.

Formally the lead pipeline is "phase 5", and its absence is a `ROADMAP.md` item rather than a
defect. The defect is a different thing: **the false confirmation**. The honest behaviour for a
prototype is not to claim success. Until there is a CRM, the message should say this is a
demonstration, or there should be no submission at all.

Higher priority than D-01: the unbound Hero form loses a lead silently, while this one promises
a visitor a callback that will not come.

---

## D-03 · The mobile background overlay is never read · Hero §4.2

`mobile_overlay_color` and `mobile_overlay_opacity` are declared as fields, have defaults and are
editable in the panel. The renderer builds a single `.hero-ov` from the desktop pair
(`src/sections/hero.js:348-351`); the mobile values are used nowhere.

**What happens:** an author changes the mobile background scrim and sees no effect — not in the
preview and not in the export.

**Verified by hand.**

---

## D-04 · A manually added price row receives no `row_id` · 50 §4.1

`newRow()` generates a `row_id` (`src/sections/prices.js:285`), so seeded and bulk-imported rows
have one. The repeater's "+ Add row" button builds its blank from the keys of the **declared
fields** (`src/ui/fields.js:374`), and `row_id` is not among them — it is an internal identifier,
not an editor field.

**What happens:** some rows in a document have an identifier and some do not. The divergence is
silent: `src/ui/fields.js` already special-cases `row_id`, which masks it.

**A second facet of the same problem:** "Duplicate" in the repeater `structuredClone`s the row
*including* its `row_id`. One document can therefore hold two rows claiming to be the same one —
worse than a row without an id, because it looks valid.

**Verified by hand.**

---

## D-05 · Heading size and alignment in Trust do nothing · Trust §4.1

The panel offers both controls (through the shared `headingFields`) and the values are stored in
props. The title renders as `.tr-title` with a hardcoded `font-size: var(--h-m)`
(`src/sections/trust.js:63,143`); the alignment class on the section shell never reaches it.

**What happens:** two controls in the interface with no effect. The same dead pair existed in
Story & Specs, where it was removed on 11 September 2026 — which turns out to have been
accidentally the right call.

**Verified by hand.** This can be fixed from either end: move `.tr-title` onto the shared heading
component, or remove the controls as Story & Specs did. The second is cheaper and more honest:
Trust is a dual-role section whose typography is set by design, not by the page's author.

---

## D-06 · Cabin class is collected and thrown away · SYS-99 §2, 21 §4

Prices faithfully emits `data-cabin` on every row (`src/sections/prices.js:262`). The runtime
reads it and writes it into `[data-lead-cabin]` inside the modal (`src/render/runtime.js:17-18`).
No element with that attribute exists in the modal's markup (`src/render/page.js:113-127`).

**What happens:** clicking the row "Tokyo (HND), First Class" opens a modal in which the cabin is
neither selected nor shown. The whole hand-off is written and breaks at the last step.

---

## D-07 · Text & Media's mobile stack order does not match the spec · 39 §6.4

The spec requires `Title → Media → Paragraph → CTA`. The markup emits `copy` (title, paragraph,
CTA) followed by `media` (`src/sections/text-media.js:131-147`); no media query reorders them —
there is only `.tm.media-left .tm-copy{order:0}` for desktop.

**What happens:** on mobile the image ends up below the button.

**Separately:** a comment in the file asserts that the documented order is satisfied. That is
worse than the bug itself, because it suppresses suspicion in the next reader.

---

## D-08 · Duplicate bypasses the one-static-per-page rule · SYS-00 §4

The uniqueness check for static modules lives only in the insert drawer
(`src/ui/library.js:23-26`), where a duplicate is shown disabled. The row menu in the page
structure offers "Duplicate" for any non-anchor section, including Subscription and Contact
(`src/ui/outline.js:120`), and `duplicateSection` → `insertAfter` performs no check at all.

**What happens:** a second Contact is one click away and surfaces afterwards as `E007` in the
issues panel — the rule exists, but works as an after-the-fact report rather than as a guard.

---

## D-09 · Accreditation seals render as text · Footer §4.2

`accreditation_seals` is declared as `Array<File<'SVG'>>`. The renderer escapes each array entry
into the text content of a bordered 44px circle (`src/sections/footer.js:101-105`) — no asset
resolution, no `<img>` tag.

**What happens:** a stored file reference would render as its own identifier, as a string. The
problem is invisible so far only because the array ships empty and three hardcoded text
fallbacks — ASTA / IATA / ARC — take its place, content the global store never supplied.

Related: there are no editors for `navigation_columns`, `social_channels` or
`accreditation_seals` anywhere in Global Settings — not a repeater, not a JSON box. That is a
`ROADMAP.md` item, but together with the defect above it means the seals can neither be set nor
displayed.

---

## How to use this file

A `DEFECT` marker in a spec refers here by number. When a bug is fixed, the marker in the spec
becomes `BUILT`, the entry here is deleted, and a line appears in `CHANGELOG.md`. An empty file
is the goal, not an anomaly.
