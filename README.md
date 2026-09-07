# Landing Page Builder — prototype

Schema-driven admin for building landing pages, with a live WYSIWYG canvas and a
single-file HTML export. No build step, no dependencies: plain ES modules served
as static files.

```bash
node server.js
```

Then open <http://localhost:4173>. State lives in `localStorage`; uploaded images live
in IndexedDB.

---

## Why it is built this way

The spec describes 14 section types, each with its own controls, defaults and validation
rules. Writing 14 hand-rolled forms would mean 14 places to change every time a control
is added. Instead:

- **A section type is data.** `src/schema/*.js` describes its fields; `src/ui/inspector.js`
  renders *any* schema. Nothing in the admin knows what a "Hero" is.
- **One renderer for canvas and export.** `renderPage()` produces a complete HTML
  document. The canvas puts it in an iframe, Export downloads it. Preview is WYSIWYG
  because it is literally the same output.
- **Validation comes from the same schema.** `required` is declarative; conditional rules
  (all-or-nothing card text, "card 4 becomes mandatory in 4-card mode") live in the
  section's own `validate()`.

## Layout

```
index.html              admin shell
server.js               static file server for local development
src/
  main.js               bootstrap + topbar
  store.js              PageDoc list, undo/redo, autosave
  assets.js             image store (IndexedDB, data URLs)
  util.js               helpers
  export.js             HTML export, JSON bundle import/export
  schema/
    common.js           shared field builders (universal controls live here)
    registry.js         type registry, defaults, anchor ordering rules
    hero.js prices.js anchors.js features.js content.js
  ui/
    inspector.js        schema → form
    fields.js           field widgets (text, richtext, color, image, repeater…)
    richtext.js         contenteditable editor
    outline.js          page structure, drag reorder, slot constraints
    library.js          "Add section" palette
    pages.js            page manager + template gallery
    validate.js         validation engine
    preview.js          iframe canvas
    modal.js issues.js
  render/
    page.js             full document assembly + published-page runtime
    theme.js            landing CSS (phase 2 replaces this file)
    html.js             sanitizer and render primitives
    sections/           one renderer per section type
  presets/
    templates.js        ready-made pages (the template gallery)
    defaults.js         system defaults per block (spec §4.3)
```

## Page model

```js
{ schemaVersion, id, name, meta:{title,description}, sections:[
    { id, type, visible, props:{ … } }
] }
```

Anchor ordering is enforced structurally, not by convention: `isValidOrder()` rejects any
arrangement where Hero is not first, Footer is not last, or Prices/Trust are out of order.
Every mutation that reorders runs through it, so the invariant cannot be broken by a drag,
a paste, or an import.

## Adding a section type

1. Write the schema in `src/schema/` (fields, defaults, `validate`).
2. Write the renderer in `src/render/sections/` — a function returning an HTML string.
3. Register both: one line in `src/schema/registry.js`, one in
   `src/render/sections/index.js`.

The inspector, library palette, validation, preview and export all pick it up with no
further changes.

## Where the spec was interpreted

| Spec point | Decision |
|---|---|
| Trust section "mandatory status pending review" | Anchor (never deleted or reordered) but carries a visibility toggle, so either outcome of the review is a one-word change rather than a data migration. |
| Global static blocks (Newsletter, Contact) | Insertable once per page, visibility toggle only — matching phase 1. Structured so phase 2 can add editable copy without touching the page model. |
| Feature-section defaults (§4.3) | `src/presets/defaults.js`. Inserting a Primary/Secondary/Bullet block prefills the standard company perks and built-in SVG icons — no upload needed. |
| Row limit "up to 30 (TBD)" | Enforced at 30 with a validation error; the number is one constant in `src/schema/prices.js`. |
| Per-character colour | `execCommand('foreColor')` on contenteditable. Deprecated but universally supported; output is sanitized to `<span style="color:…">` on render. |

## Additions beyond the spec

- **Template gallery** — pick a complete ready-made landing page (Business Class Deals,
  Route Page, Compact Offer, Blank) instead of assembling anchors by hand.
- **Undo / redo** with coalesced typing (`Cmd/Ctrl+Z`, `Cmd/Ctrl+Shift+Z`).
- **Issues panel** listing every validation error and warning; clicking one selects the
  offending section. Export warns before publishing a page with errors.
- **Click-to-select** — clicking a section in the canvas selects it in the admin.
- **Viewport switcher** (desktop / tablet / mobile) — needed to see the hero's mobile
  background, which the spec renders below 768px.
- **JSON bundle import/export** — a page travels with its images inlined, so work moves
  between browsers without a backend.

## Export and hosting

**Export** downloads one self-contained `.html`: images are data URLs, the frontend
runtime (countdown, region tabs, marquee, lead modal, form validation) is inlined. To
publish it on GitHub Pages, commit the file as `index.html` in a repository with Pages
enabled — no build, no asset folder.

## Known limits of the prototype

- No backend: form submissions show a success state instead of posting to the CRM.
- Images are data URLs, so pages with many large photos produce large exports.
- Inline field errors in the inspector refresh when the panel is rebuilt (on selection or
  a structural change), not on every keystroke — rebuilding mid-keystroke would destroy
  the caret in rich-text fields. The Issues panel is always current.
- Newsletter and Contact content is hardcoded, per phase 1 of the spec.

## Phase 2 notes

The landing design is confined to `src/render/theme.js` plus the section renderers.
Redesigning it does not touch the admin, the schemas, or the page model.
