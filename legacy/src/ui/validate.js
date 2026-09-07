// Validation engine. Required-ness comes from the schema; anything conditional lives in
// the section's own validate(). Both produce the same issue shape.
import { getPath, isBlank, isBlankHtml } from '../util.js';
import { TYPES, allFields, isShown } from '../schema/registry.js';

const RT_KINDS = new Set(['richtext']);

/** @returns {{sectionId,sectionName,path,message,severity}[]} */
export function validateDoc(doc) {
  if (!doc) return [];
  const out = [];
  for (const section of doc.sections) {
    if (section.visible === false) continue;
    const type = TYPES[section.type];
    if (!type) { out.push(issue(section, '', 'Unknown section type — it will not render.', 'error')); continue; }
    const props = section.props || {};

    for (const f of allFields(section.type)) {
      if (!f.required || !f.key || !isShown(f, props)) continue;
      const v = getPath(props, f.key);
      const empty = RT_KINDS.has(f.kind) ? isBlankHtml(v) : f.kind === 'image' ? !v : isBlank(v);
      if (empty) out.push(issue(section, f.key, `${f.label || f.key} is required.`, 'error'));
    }

    for (const e of type.validate?.(props) || []) {
      out.push(issue(section, e.path || '', e.message, e.severity || 'error'));
    }
  }
  return dedupe(out);
}

const issue = (section, path, message, severity) => ({
  sectionId: section.id,
  sectionName: TYPES[section.type]?.name || section.type,
  path, message, severity,
});

function dedupe(list) {
  const seen = new Set();
  return list.filter((i) => {
    const k = `${i.sectionId}|${i.path}|${i.message}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

export const countErrors = (issues) => issues.filter((i) => i.severity === 'error').length;
