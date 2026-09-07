// Renders the fixture page to a file. Lets phase 1 and 2 be checked in a browser without
// an editor: `node scripts/render-fixture.js && open /tmp/lpb-fixture.html`
import { writeFileSync } from 'node:fs';
import { renderPage } from '../src/render/page.js';
import { globalDefaults } from '../src/presets/global-defaults.js';
import { fixturePage, registry } from './fixture.js';

const out = process.argv[2] || '/tmp/lpb-fixture.html';
const mode = process.argv.includes('--preview') ? 'preview' : 'export';

const html = renderPage(fixturePage(), {
  registry,
  globals: globalDefaults(),
  mode,
});

writeFileSync(out, html);
console.log(`${mode}: ${html.length} bytes -> ${out}`);
