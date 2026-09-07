// Site-wide content store. Separate document, separate storage key, separate lifecycle:
// Trust, Footer, Subscription and Contact read from here, and a page editor cannot write it.
import { clone } from '../util.js';
import { globalDefaults } from '../presets/global-defaults.js';

/** @typedef {import('../model/types.js').GlobalConfig} GlobalConfig */

const LS_KEY = 'lpb.globals.v2';
/** @type {Set<() => void>} */
const listeners = new Set();

/** @type {GlobalConfig} */
let config = globalDefaults();

/** @param {() => void} fn */
export function onGlobals(fn) { listeners.add(fn); return () => listeners.delete(fn); }
const emit = () => { for (const fn of listeners) fn(); };

/** The live config. Treat as read-only; mutate through `updateGlobals`. */
export const globals = () => config;

export function loadGlobals() {
  try {
    const raw = JSON.parse(localStorage.getItem(LS_KEY) || 'null');
    if (raw && typeof raw === 'object') {
      // Merge over defaults so a config saved before a new field existed still opens.
      config = { ...globalDefaults(), ...raw };
      return true;
    }
  } catch (e) { console.warn('Could not read global settings', e); }
  return false;
}

/**
 * Replace one top-level section of the config.
 * @param {keyof GlobalConfig} area
 * @param {Record<string, any>} patch
 */
export function updateGlobals(area, patch) {
  config = { ...config, [area]: { ...config[area], ...clone(patch) } };
  persist();
  emit();
}

export function resetGlobals() {
  config = globalDefaults();
  persist();
  emit();
}

function persist() {
  try { localStorage.setItem(LS_KEY, JSON.stringify(config)); }
  catch (e) { console.warn('Could not save global settings', e); }
}
