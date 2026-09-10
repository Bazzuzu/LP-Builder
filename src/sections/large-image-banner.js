// Large Image Banner — spec doc 38. Visual-first interim CTA block.
import { ARCHETYPE } from '../model/enums.js';
import { ctaLink, dynamicShell, img, sectionHeader } from '../render/html.js';
import { advancedGroup, all, appearanceGroup, contentGroup, ctaGroup, headingFields, imgField, mediaGroup, needMedia, needText } from './_common.js';

/** @type {import('../model/types.js').SectionType} */
export default {
  key: 'SECTION_LARGE_IMAGE_BANNER',
  doc: 38,
  name: 'Large Image Banner',
  archetype: ARCHETYPE.DYNAMIC,
  group: 'content',
  icon: '▬',
  description: 'Full-width featured image with a large headline and a call to action.',

  fields: [
    contentGroup(headingFields({ required: true, size: 'SIZE_L', align: 'ALIGN_CENTER' })),
    ctaGroup('cta', { toggle: false, label: 'Request a custom itinerary' }),
    mediaGroup([
      imgField('featured_image', 'Featured image', { hint: 'JPG, PNG or WebP. High resolution.' }),
    ], { open: true }),
    appearanceGroup({ bg: '#FFFFFF' }),
    advancedGroup(),
  ],

  defaults: {
    bg_color: '#FFFFFF', heading_size: 'SIZE_L', heading_align: 'ALIGN_CENTER',
    section_title: 'Unrivalled comfort across the Atlantic',
    subheading: '<p>Secure exclusive business class fares with concierge-backed flexibility.</p>',
    featured_image: null,
    cta: { label: 'Request a custom itinerary', href: '#lead-modal' },
  },

  validate(props) {
    return all(
      needText(props, 'section_title', 'Headline'),
      needMedia(props, 'featured_image', 'Featured image'),
      needText(props, 'cta.label', 'CTA label'),
      needText(props, 'cta.href', 'CTA link'),
    );
  },

  css: `
.lib-media{border-radius:16px;overflow:hidden;margin-bottom:32px}
.lib-media img{width:100%;aspect-ratio:21/9;object-fit:cover}
.lib-media .ph{aspect-ratio:21/9;min-height:0}
.lib-cta{margin-top:24px}
@media (max-width:767px){
  .lib-media img,.lib-media .ph{aspect-ratio:auto;min-height:280px;height:280px}
}
`,

  render(section) {
    const p = section.props || {};
    // The header renders below the media here, so the shell's own header is suppressed.
    // The media sits above the header here, so the shell's own header is suppressed and
    // re-emitted below it — using the shared builder, which keeps the empty-header
    // suppression rule (11_ABSTRACT §5.1) identical to every other section.
    return dynamicShell(section, `
      <div class="lib-media">${img(p.featured_image, { placeholder: 'Banner image', loading: 'eager' })}</div>
      ${sectionHeader(p)}
      <div class="lib-cta">${ctaLink(p.cta)}</div>
    `, { withHeader: false });
  },
};
