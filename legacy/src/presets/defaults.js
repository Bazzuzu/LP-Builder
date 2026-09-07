// Spec §4.3 — admin-level system defaults, highest priority for the Feature sections so a
// freshly inserted feature block already carries the standard company perks and icons.
// Editing this file changes what content managers get out of the box.

const svg = (body) =>
  'data:image/svg+xml,' + encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#7C5C3E" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`);

/** Built-in icons. Fields accept either an asset id or a raw URL, so these need no upload. */
export const ICONS = {
  shield: svg('<path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5z"/><path d="m9 12 2 2 4-4"/>'),
  headset: svg('<path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="2" y="13" width="4" height="6" rx="1.5"/><rect x="18" y="13" width="4" height="6" rx="1.5"/><path d="M20 19v1a3 3 0 0 1-3 3h-3"/>'),
  tag: svg('<path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9z"/><circle cx="7.5" cy="7.5" r="1.3"/>'),
  plane: svg('<path d="M2 13.5 21 3l-4.5 18-4-7z"/><path d="M12.5 14 9 21l-1.5-5"/>'),
  clock: svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>'),
  star: svg('<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>'),
  seat: svg('<path d="M6 4h3l1.5 9H18a2 2 0 0 1 2 2v5"/><path d="M6 4v10a4 4 0 0 0 4 4h10"/>'),
  wallet: svg('<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18"/><circle cx="17" cy="14" r="1.2"/>'),
};

const perk = (icon, title, text) => ({ icon: ICONS[icon], title, text });

export const BLOCK_DEFAULTS = {
  primaryCards: {
    title: 'Why travellers book with us',
    cards: [
      perk('tag', 'Up to 60% off published fares',
        '<p>Contracted business and first class fares you will not find on public booking engines.</p>'),
      perk('headset', 'A dedicated travel expert',
        '<p>One named consultant handles your itinerary end to end, before and during the trip.</p>'),
      perk('shield', 'Book now, pay later',
        '<p>Hold your fare with no obligation while we confirm every leg of the route.</p>'),
    ],
  },

  secondaryCards: {
    count: '3',
    title: 'What is included',
    cards: [
      perk('seat', 'Lie-flat seating', '<p>Verified cabin product on every segment we quote.</p>'),
      perk('clock', '24/7 concierge', '<p>Reach a human on any timezone, any day of the year.</p>'),
      perk('wallet', 'No hidden fees', '<p>The price we quote is the price you pay.</p>'),
      perk('plane', 'Flexible changes', '<p>Most fares allow date changes at little or no cost.</p>'),
    ],
  },

  bullets: {
    count: '3',
    items: [
      { icon: ICONS.shield, label: 'IATA & ARC accredited agency' },
      { icon: ICONS.star, label: 'Rated 4.8 on Trustpilot' },
      { icon: ICONS.headset, label: 'Average reply time under 15 minutes' },
      { icon: ICONS.wallet, label: 'Price-match on any comparable fare' },
    ],
  },

  quickFacts: {
    cards: [
      { title: '30+', text: 'years of consolidator contracts' },
      { title: '120k', text: 'premium cabin tickets issued' },
      { title: '4.8', text: 'average customer rating' },
    ],
  },

  prices: {
    rows: [
      { title: 'New York → London', price: '1,984', anchorPrice: '4,310', label1: 'Business Class', label2: 'Nonstop', label3: 'Limited seats', region: 'Europe', color: 'rgba(0, 0, 0, 0.88)' },
      { title: 'Los Angeles → Tokyo', price: '2,410', anchorPrice: '5,120', label1: 'Business Class', label2: 'Nonstop', label3: '', region: 'Asia', color: 'rgba(0, 0, 0, 0.88)' },
      { title: 'Chicago → Dubai', price: '2,190', anchorPrice: '4,880', label1: 'Business Class', label2: '1 Stop', label3: '', region: 'Middle East', color: 'rgba(0, 0, 0, 0.88)' },
      { title: 'Miami → Paris', price: '1,870', anchorPrice: '3,940', label1: 'Business Class', label2: 'Nonstop', label3: '', region: 'Europe', color: 'rgba(0, 0, 0, 0.88)' },
      { title: 'San Francisco → Sydney', price: '3,240', anchorPrice: '6,700', label1: 'First Class', label2: '1 Stop', label3: '', region: 'Oceania', color: 'rgba(0, 0, 0, 0.88)' },
    ],
  },
};
