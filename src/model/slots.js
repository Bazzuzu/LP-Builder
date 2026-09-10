// Slot arithmetic. Mirrors `SYS-00-ARCH §3.1`.
// Pure: no DOM, no storage, no imports beyond enums — so it is directly unit-testable.
import { ANCHOR_SLOT, DYNAMIC_SLOTS } from './enums.js';

/** @typedef {import('./types.js').Section} Section */

/** @param {Section} s */
export const isAnchor = (s) => ANCHOR_SLOT[/** @type {keyof typeof ANCHOR_SLOT} */ (s.key)] !== undefined;

/** Sections of one slot, in order. @param {Section[]} sections @param {number} slot */
export const sectionsInSlot = (sections, slot) =>
  sections.filter((s) => s.slot_index === slot).sort((a, b) => a.order_in_slot - b.order_in_slot);

/** Whole page in render order: slot first, then order within slot. @param {Section[]} sections */
export const inRenderOrder = (sections) =>
  [...sections].sort((a, b) => a.slot_index - b.slot_index || a.order_in_slot - b.order_in_slot);

/**
 * Re-number `order_in_slot` to a dense 0..n-1 per slot. Called after every mutation, so
 * sentinel values (-1 to prepend, len to append) resolve into real indices.
 * Mutates and returns the same array.
 * @param {Section[]} sections
 */
export function repack(sections) {
  const slots = new Set(sections.map((s) => s.slot_index));
  for (const slot of slots) {
    sectionsInSlot(sections, slot).forEach((s, i) => { s.order_in_slot = i; });
  }
  return sections;
}

/** The dynamic slot above / below `slot`, or null at the ends. @param {number} slot */
export function prevDynamicSlot(slot) {
  const earlier = DYNAMIC_SLOTS.filter((s) => s < slot);
  return earlier.length ? earlier[earlier.length - 1] : null;
}
/** @param {number} slot */
export function nextDynamicSlot(slot) {
  return DYNAMIC_SLOTS.find((s) => s > slot) ?? null;
}

/**
 * Append a section to the end of a slot.
 * @param {Section[]} sections @param {Section} section @param {number} slot
 */
export function appendToSlot(sections, section, slot) {
  section.slot_index = slot;
  section.order_in_slot = sectionsInSlot(sections, slot).length;
  sections.push(section);
  return repack(sections);
}

/**
 * Insert a section directly beneath `refId` (used by Duplicate).
 * @param {Section[]} sections @param {Section} section @param {string} refId
 */
export function insertAfter(sections, section, refId) {
  const ref = sections.find((s) => s.id === refId);
  if (!ref) return appendToSlot(sections, section, DYNAMIC_SLOTS[0]);
  section.slot_index = ref.slot_index;
  section.order_in_slot = ref.order_in_slot + 0.5;   // resolved by repack
  sections.push(section);
  return repack(sections);
}

/** @param {Section[]} sections @param {string} id */
export function canMoveUp(sections, id) {
  const s = sections.find((x) => x.id === id);
  if (!s || isAnchor(s)) return false;
  return s.order_in_slot > 0 || prevDynamicSlot(s.slot_index) !== null;
}

/** @param {Section[]} sections @param {string} id */
export function canMoveDown(sections, id) {
  const s = sections.find((x) => x.id === id);
  if (!s || isAnchor(s)) return false;
  const last = sectionsInSlot(sections, s.slot_index).length - 1;
  return s.order_in_slot < last || nextDynamicSlot(s.slot_index) !== null;
}

/**
 * Move one step up: swap with the sibling above, or cross the anchor into the previous
 * dynamic slot. Crossing upwards lands the section at the **end** of the target slot —
 * that is the position adjacent to the boundary it just crossed, so the section appears
 * to move by one place rather than jumping over the whole slot.
 * @param {Section[]} sections @param {string} id
 * @returns {boolean} whether anything moved
 */
export function moveUp(sections, id) {
  const s = sections.find((x) => x.id === id);
  if (!s || isAnchor(s)) return false;
  const siblings = sectionsInSlot(sections, s.slot_index);
  const i = siblings.indexOf(s);
  if (i > 0) {
    const above = siblings[i - 1];
    [s.order_in_slot, above.order_in_slot] = [above.order_in_slot, s.order_in_slot];
    repack(sections);
    return true;
  }
  const target = prevDynamicSlot(s.slot_index);
  if (target === null) return false;
  s.slot_index = target;
  s.order_in_slot = sectionsInSlot(sections, target).length;   // append at the end
  repack(sections);
  return true;
}

/**
 * Move one step down. Crossing an anchor downwards lands the section at the **start** of the
 * next dynamic slot, mirroring `moveUp`.
 * @param {Section[]} sections @param {string} id
 * @returns {boolean}
 */
export function moveDown(sections, id) {
  const s = sections.find((x) => x.id === id);
  if (!s || isAnchor(s)) return false;
  const siblings = sectionsInSlot(sections, s.slot_index);
  const i = siblings.indexOf(s);
  if (i < siblings.length - 1) {
    const below = siblings[i + 1];
    [s.order_in_slot, below.order_in_slot] = [below.order_in_slot, s.order_in_slot];
    repack(sections);
    return true;
  }
  const target = nextDynamicSlot(s.slot_index);
  if (target === null) return false;
  s.slot_index = target;
  s.order_in_slot = -1;                                        // prepend
  repack(sections);
  return true;
}

/**
 * Move a section to an explicit position — what a drag-and-drop drop resolves to, as
 * opposed to the one-step-at-a-time `moveUp`/`moveDown`. `index` counts the target slot's
 * OTHER sections, so it is the gap the section lands in, not a final array position.
 * Anchors never move, and only dynamic slots accept a drop.
 * @param {Section[]} sections @param {string} id @param {number} slot @param {number} index
 * @returns {boolean} whether anything moved
 */
export function moveTo(sections, id, slot, index) {
  const s = sections.find((x) => x.id === id);
  if (!s || isAnchor(s) || !DYNAMIC_SLOTS.includes(slot)) return false;
  const others = sectionsInSlot(sections, slot).filter((x) => x !== s);
  const at = Math.max(0, Math.min(index, others.length));
  // Already exactly there: report "nothing moved" so the caller skips an empty undo step.
  if (s.slot_index === slot && sectionsInSlot(sections, slot).indexOf(s) === at) return false;
  s.slot_index = slot;
  // A half-step past the section it should follow; repack() turns that back into dense
  // integers. -0.5 puts it before everything, which is what index 0 means.
  s.order_in_slot = at === 0 ? -0.5 : others[at - 1].order_in_slot + 0.5;
  repack(sections);
  return true;
}

/** Remove a section by id. @param {Section[]} sections @param {string} id */
export function removeSection(sections, id) {
  const i = sections.findIndex((s) => s.id === id);
  if (i < 0) return false;
  sections.splice(i, 1);
  repack(sections);
  return true;
}
