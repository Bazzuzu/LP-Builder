// Shared shapes. JSDoc only — this file emits nothing at runtime.
// Editors and `npx tsc --noEmit -p jsconfig.json` check against these.

/**
 * @typedef {import('./enums.js').ComponentKey} ComponentKey
 * @typedef {import('./enums.js').Archetype} Archetype
 * @typedef {import('./enums.js').Region} Region
 * @typedef {import('./enums.js').Level} Level
 */

/**
 * One block on a page. Content lives in `props` for page-level sections; sections whose
 * archetype is global carry only their switches here and read content from the global store.
 * @typedef {object} Section
 * @property {string} id
 * @property {ComponentKey} key
 * @property {number} slot_index      Container: 0/2/4/6 anchors, 1/3/5 dynamic.
 * @property {number} order_in_slot   Order within that slot only.
 * @property {boolean} is_visible
 * @property {string|null} anchor_id  Optional DOM id for in-page links.
 * @property {Record<string, any>} props
 * @property {number} created_at
 * @property {number} updated_at
 */

/**
 * @typedef {object} PageMeta
 * @property {string} meta_title
 * @property {string} meta_description
 * @property {string|null} canonical_url
 * @property {string|null} og_image
 * @property {boolean} noindex_nofollow
 */

/**
 * @typedef {object} PageRoute
 * @property {string|null} default_origin
 * @property {string|null} default_destination
 * @property {string} target_country      ISO 3166-1
 * @property {Region} target_region
 * @property {string} currency_code       ISO 4217
 */

/**
 * @typedef {object} PageDoc
 * @property {number} schema_version
 * @property {string} id
 * @property {string} internal_name
 * @property {string} slug
 * @property {'Draft'|'Published'|'Archived'} status
 * @property {'RoutePage'|'CampaignPage'|'HomePage'} page_type
 * @property {PageMeta} meta
 * @property {PageRoute} route
 * @property {Section[]} sections
 * @property {number} created_at
 * @property {number} updated_at
 */

/**
 * A validation finding. `code` indexes `ERR` in enums.js.
 * @typedef {object} Issue
 * @property {Level} level
 * @property {string} code
 * @property {string} message
 * @property {string} [sectionId]
 * @property {string} [path]      Dot path inside `props`, e.g. `cards.0.title`.
 */

/**
 * A field descriptor consumed by the inspector. `kind` selects the editor widget; the
 * remaining properties are that widget's options. They are enumerated rather than left
 * open so a typo in an option name is still a type error.
 * @typedef {object} FieldDescriptor
 * @property {string} key                 Dot path inside `props`, or onto the Section when `scope` is 'section'.
 * @property {string} kind                text | richtext | select | segmented | toggle | color | number | range | image | repeater | datetime | note | preset
 * @property {string} label
 * @property {any} [default]
 * @property {string} [help]
 * @property {string} [placeholder]
 * @property {boolean} [required]
 * @property {'section'} [scope]          Writes onto the Section itself, not into props.
 * @property {(props: Record<string, any>, get: (path: string) => any) => any} [when]
 * @property {(value: any, ctx: any) => void} [onChange]  Side effect after this field commits
 *   (segmented only, for now) — e.g. re-defaulting a sibling colour when a theme switches.
 * @property {string} [tzKey]             datetime-tz — sibling prop holding the IANA zone
 *
 * @property {{ value: any, label: string, token?: string }[]} [options]   select / segmented
 * @property {{ value: string, label: string, token?: string }[]} [presets] color
 * @property {boolean} [alpha]            color
 * @property {number} [min]               range / number / repeater
 * @property {number} [max]               range / number / repeater
 * @property {string} [unit]              range
 * @property {string[]} [tools]           richtext toolbar
 * @property {boolean} [inline]           richtext, single-line
 * @property {boolean} [singleLine]       richtext
 * @property {boolean} [decorative]       image — renders alt="" and drops the alt requirement
 * @property {string} [ratio]             image — container aspect hint
 * @property {string} [text]              note
 * @property {Record<string, Record<string, any>>} [applies]   preset — value sets it writes
 * @property {{ fields: FieldDescriptor[] }} [item]            repeater — the per-item schema
 * @property {(item: any, index: number) => string} [itemTitle] repeater
 * @property {string} [addLabel]          repeater
 * @property {string} [fixed]             repeater — prop that dictates the active count
 * @property {boolean} [multiUpload]      repeater — accepts a multi-file drop
 * @property {string} [bulkImport]        repeater — enables the bulk import dialog
 */

/**
 * @typedef {object} FieldGroup
 * @property {string} title
 * @property {boolean} [open]
 * @property {FieldDescriptor[]} fields
 */

/**
 * Render context handed to every section renderer.
 * @typedef {object} RenderCtx
 * @property {PageDoc} page
 * @property {GlobalConfig} globals
 * @property {'preview'|'export'} mode
 */

/**
 * One section type: everything its spec document describes, in one module.
 * @typedef {object} SectionType
 * @property {ComponentKey} key
 * @property {number} doc               Spec document number, e.g. 39.
 * @property {string} name
 * @property {Archetype} archetype
 * @property {string} [icon]
 * @property {string} [description]
 * @property {'intermediate'|'content'|'global'} [group]
 * @property {FieldGroup[]} fields
 * @property {Record<string, any>} defaults
 * @property {(props: Record<string, any>, ctx?: any) => Issue[]} [validate]
 * @property {(section: Section, ctx: RenderCtx) => string} render
 * @property {string} [css]   Section-scoped CSS. Only the types a page uses ship with it.
 * @property {string} [fixedBg]   The flat colour this type always renders on when it has no
 *   configurable `bg_color` field (render/page.js's same-background divider check).
 */

/**
 * The slice of a section type the validator actually needs. Kept narrow on purpose: a
 * validation run must be callable with a stub, not only with a fully built registry.
 * @typedef {object} ValidatableType
 * @property {Archetype} archetype
 * @property {(props: Record<string, any>, ctx?: any) => Issue[]} [validate]
 */

/**
 * Site-wide content consumed by Trust, Footer, Subscription and Contact.
 * @typedef {object} GlobalConfig
 * @property {Record<string, any>} footer
 * @property {Record<string, any>} contact
 * @property {Record<string, any>} trust
 * @property {Record<string, any>} subscription
 */

export {};
