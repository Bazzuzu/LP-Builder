// Ready-made landing pages. A template is just a list of {type, props} overlays —
// makeSection() merges them over the schema defaults, so templates stay short and
// never go stale when a schema gains a field.
import { ICONS } from './defaults.js';

const p = (t) => `<p>${t}</p>`;

export const TEMPLATES = [
  {
    id: 'blank',
    name: 'Blank page',
    icon: '□',
    description: 'Just the four mandatory anchors. Build the middle yourself.',
    sections: [{ type: 'hero' }, { type: 'prices' }, { type: 'trust' }, { type: 'footer' }],
  },

  {
    id: 'business-class-deals',
    name: 'Business Class Deals',
    icon: '✈',
    description: 'Full home page: hero, perks, fare table, trust, editorial split, banner CTA, newsletter.',
    sections: [
      { type: 'hero', props: {
        theme: 'dark', titlePreset: 't1',
        eyebrow: { mode: 'badge', soloLabel: 'Limited-time consolidator fares', soloColor: '#7C5C3E' },
        title: 'Business class for the price of<br><b>premium economy</b>',
        paragraph: p('Unpublished contract fares on 300+ airlines. One dedicated expert handles the whole itinerary.'),
        price: { top: 'Prices starting from', value: '1,984', bottom: 'per person, round trip, taxes included' },
        cta: { label: 'Get My Quote', bg: 'rgba(0, 0, 0, 0.88)', fg: '#FFFFFF' },
      } },
      { type: 'primaryCards' },
      { type: 'prices', props: {
        title: 'This week’s lowest fares',
        subheading: p('Tap any route to have a consultant confirm availability for your dates.'),
        regionTabs: true, mediaMode: '2',
        disclaimer: p('Fares shown are per person for round-trip travel and were available at the time of publication. Seats are limited and subject to change.'),
      } },
      { type: 'trust', props: { mode: 'extended', celebrity: false } },
      { type: 'textMedia', props: {
        media: '1', orientation: 'right',
        title: 'How booking with a consolidator works',
        text: '<ol><li>Tell us the route, dates and cabin.</li><li>We check contract inventory across 300+ carriers.</li><li>You approve the itinerary before anything is charged.</li></ol>',
        cta: { on: true, label: 'Start a quote', href: '#lead-modal' },
      } },
      { type: 'bigImage', props: {
        title: 'Flying somewhere else?',
        subheading: p('We quote any route, in any premium cabin, worldwide.'),
        overlay: 45,
        cta: { on: true, label: 'Request a custom quote', href: '#lead-modal' },
      } },
      { type: 'newsletter' },
      { type: 'footer' },
    ],
  },

  {
    id: 'route-page',
    name: 'Route Page',
    icon: '⇄',
    description: 'Destination page: compact trust, quick facts, fare table and contact block.',
    sections: [
      { type: 'hero', props: {
        theme: 'light', titlePreset: 't2',
        eyebrow: { mode: 'text', text: 'New York — London' },
        title: 'Business class to <b>London</b>',
        paragraph: p('Nonstop lie-flat service from JFK and EWR, from six carriers.'),
        price: { top: 'Round trip from', value: '1,984', bottom: 'taxes and fees included' },
        cta: { label: 'Check availability', bg: '#7C5C3E', fg: '#FFFFFF' },
      } },
      { type: 'logos' },
      { type: 'prices', props: {
        title: 'London fares this month',
        head1: 'Route & Cabin', head2: 'Published / Our Fare',
        mediaMode: '1',
      } },
      { type: 'trust', props: { mode: 'compact' } },
      { type: 'quickFacts', props: {
        title: 'What to know before you book',
        intro: p('London is served by six airports, but premium cabin inventory concentrates at Heathrow. Booking 6–10 weeks out gives the widest choice of lie-flat seats.'),
        outro: p('Our consultants hold seats for up to 24 hours while you confirm dates.'),
      } },
      { type: 'bullets' },
      { type: 'contact' },
      { type: 'footer' },
    ],
  },

  {
    id: 'compact-offer',
    name: 'Compact Offer',
    icon: '▤',
    description: 'Short, dense page for paid traffic: hero with countdown, fares, compact trust.',
    sections: [
      { type: 'hero', props: {
        theme: 'dark', titlePreset: 't2',
        eyebrow: { mode: 'timer', prefix: 'Sale ends in',
          endsAt: new Date(Date.now() + 7 * 864e5).toISOString() },
        title: 'Seven days of <b>business class</b> savings',
        paragraph: p('Contract fares released for a limited window.'),
        price: { top: 'From', value: '1,749', bottom: 'round trip, all-in' },
        cta: { label: 'Claim this fare', bg: '#7C5C3E', fg: '#FFFFFF' },
      } },
      { type: 'prices', props: { title: 'Sale routes', mediaMode: '0', regionTabs: true } },
      { type: 'bullets', props: { count: '4' } },
      { type: 'trust', props: { mode: 'compact', accreditations: true } },
      { type: 'footer' },
    ],
  },
];

export const templateById = (id) => TEMPLATES.find((t) => t.id === id) || null;
