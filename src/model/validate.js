// Validation runner. Mirrors `SYS-02-ENUMS §4`.
// L0 structural rules live here; L1/L2 rules live in each section module's `validate()`.
// Pure: takes a page, a globals object and a registry — touches nothing else.
import {
  ANCHOR_SLOT, DUPLICATE_STATIC_CODE, ERR, LEVEL,
  MANDATORY_ANCHORS, MISSING_ANCHOR_CODE, permittedSlots,
} from './enums.js';

/**
 * @typedef {import('./types.js').PageDoc} PageDoc
 * @typedef {import('./types.js').Issue} Issue
 * @typedef {import('./types.js').ValidatableType} ValidatableType
 */

/**
 * @param {string} code
 * @param {Partial<Issue>} [extra]
 * @returns {Issue}
 */
export function issue(code, extra = {}) {
  const def = ERR[/** @type {keyof typeof ERR} */ (code)];
  return {
    level: /** @type {any} */ (def?.level ?? LEVEL.L1),
    code,
    message: def?.message ?? 'Validation error.',
    ...extra,
  };
}

/**
 * Structural integrity — the publish gate. Does not look at content.
 * @param {PageDoc} page
 * @param {Record<string, ValidatableType>} registry
 * @returns {Issue[]}
 */
export function validateStructure(page, registry) {
  /** @type {Issue[]} */
  const out = [];
  const sections = page?.sections ?? [];
  const countOf = (key) => sections.filter((s) => s.key === key).length;

  // 1 + 2. Mandatory anchors exist and sit in their immutable slots.
  for (const key of MANDATORY_ANCHORS) {
    const found = sections.filter((s) => s.key === key);
    if (!found.length) {
      out.push(issue(MISSING_ANCHOR_CODE[/** @type {keyof typeof MISSING_ANCHOR_CODE} */ (key)]));
      continue;
    }
    const expected = ANCHOR_SLOT[/** @type {keyof typeof ANCHOR_SLOT} */ (key)];
    for (const s of found) {
      if (s.slot_index !== expected) {
        out.push(issue('E005', {
          sectionId: s.id,
          message: `${key} must occupy slot ${expected}, found ${s.slot_index}.`,
        }));
      }
    }
  }

  // 3. Static module uniqueness.
  for (const [key, code] of Object.entries(DUPLICATE_STATIC_CODE)) {
    if (countOf(key) > 1) out.push(issue(code));
  }

  // 4. Every non-anchor section sits in a slot its archetype permits.
  //    Anchors are deliberately excluded: their placement is already reported precisely by
  //    E005 above, and emitting both codes would describe one mistake twice.
  for (const s of sections) {
    if (ANCHOR_SLOT[/** @type {keyof typeof ANCHOR_SLOT} */ (s.key)] !== undefined) continue;
    const type = registry[s.key];
    if (!type) {
      out.push(issue('E008', { sectionId: s.id, message: `Unknown component key: ${s.key}.` }));
      continue;
    }
    const allowed = permittedSlots(s.key, type.archetype);
    if (!allowed.includes(s.slot_index)) {
      out.push(issue('E008', {
        sectionId: s.id,
        message: `${s.key} is not permitted in slot ${s.slot_index} (allowed: ${allowed.join(', ')}).`,
      }));
    }
  }

  return out;
}

/**
 * Content completeness and field formats, section by section.
 * Hidden sections are skipped at L1: they are not part of the output (SYS-02 §4).
 * @param {PageDoc} page
 * @param {Record<string, ValidatableType>} registry
 * @param {object} [ctx] Extra context handed to section validators (globals, page).
 * @returns {Issue[]}
 */
export function validateContent(page, registry, ctx = {}) {
  /** @type {Issue[]} */
  const out = [];
  for (const s of page?.sections ?? []) {
    const type = registry[s.key];
    if (!type?.validate) continue;

    // Hidden sections are not in the output, so their content is not required.
    // Global-content sections are still validated: their page-level switches are local
    // (Trust E104, for one), even though their copy comes from the global store.
    if (!s.is_visible) continue;

    for (const found of type.validate(s.props ?? {}, { ...ctx, section: s }) ?? []) {
      out.push({ ...found, sectionId: s.id });
    }
  }
  return out;
}

/**
 * Everything at once, grouped by level.
 * @param {PageDoc} page
 * @param {Record<string, ValidatableType>} registry
 * @param {object} [ctx]
 */
export function validatePage(page, registry, ctx = {}) {
  const issues = [...validateStructure(page, registry), ...validateContent(page, registry, ctx)];
  return {
    issues,
    L0: issues.filter((i) => i.level === LEVEL.L0),
    L1: issues.filter((i) => i.level === LEVEL.L1),
    L2: issues.filter((i) => i.level === LEVEL.L2),
  };
}

/**
 * Publishing requires all three levels to be clean (SYS-02 §4). In practice L2 is already
 * empty by then — invalid field formats are rejected per field on save and never reach
 * storage — but it is checked here so imported or hand-edited documents cannot slip past.
 * A draft, by contrast, saves regardless of L0 and L1.
 * @param {PageDoc} page
 * @param {Record<string, ValidatableType>} registry
 * @param {object} [ctx]
 */
export function canPublish(page, registry, ctx = {}) {
  const r = validatePage(page, registry, ctx);
  return { ok: r.issues.length === 0, blocking: r.issues };
}
