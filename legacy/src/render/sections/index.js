// Renderer lookup. Keys must match schema `type` values.
import hero from './hero.js';
import prices from './prices.js';
import { trust, footer, newsletter, contact } from './anchors.js';
import { logos, primaryCards, secondaryCards, bullets } from './features.js';
import { quickFacts, cardsGrid, bigImage, textMedia } from './content.js';

export const RENDERERS = {
  hero, prices, trust, footer, newsletter, contact,
  logos, primaryCards, secondaryCards, bullets,
  quickFacts, cardsGrid, bigImage, textMedia,
};
