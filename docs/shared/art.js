/* DRAFT / PROPOSAL ONLY. Not applied to game/, not browser-tested. Proposed location: game/shared/art.js
 *
 * One shared place that turns a glyph (e.g. the cow emoji) into the painted illustration, and falls back to the
 * emoji itself whenever there is no image yet (so the game never shows a broken picture, online or offline).
 *   Art.html(glyph, cls)            -> '<img ...>' string, or the escaped glyph       (innerHTML sites)
 *   Art.fill(el, glyph, cls)        -> sets el's content                              (replaces el.textContent = glyph)
 *   Art.image(glyph)                -> cached HTMLImageElement or null                (canvas preloading)
 *   Art.draw(ctx, glyph, cx, cy, s) -> drawImage centred at cx,cy, size s; else ctx.fillText fallback
 * Registry: window.ART_REGISTRY = { '🐮': 'cow', ... } generated from the inventory (see PRODUCTION_ASSET_PIPELINE.md).
 */
(function (root) {
  'use strict';
  const REG = root.ART_REGISTRY || {};
  let BASE = 'assets/art/';
  try { if (typeof document !== 'undefined' && document.currentScript && document.currentScript.src)
          BASE = new URL('../assets/art/', document.currentScript.src).href; } catch (e) { /* keep default */ }
  const norm = (g) => String(g).replace(/\uFE0F/g, '');
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const url = (g) => { const stem = REG[norm(g)]; return stem ? BASE + stem + '.webp' : null; };
  function html(g, cls) {
    const u = url(g);
    return u ? '<img class="art' + (cls ? ' ' + esc(cls) : '') + '" src="' + u + '" alt="" draggable="false">' : esc(g);
  }
  const fill = (el, g, cls) => { el.dataset.emoji = norm(g); el.innerHTML = html(g, cls); };
  const cache = new Map();
  function image(g) {
    const u = url(g); if (!u || typeof Image === 'undefined') return null;
    if (!cache.has(u)) { const im = new Image(); im.src = u; cache.set(u, im); }
    return cache.get(u);
  }
  function draw(ctx, g, cx, cy, size) {
    const im = image(g);
    if (im && im.complete && im.naturalWidth) { ctx.drawImage(im, cx - size / 2, cy - size / 2, size, size); return true; }
    ctx.font = size + 'px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(g, cx, cy); return false;
  }
  root.Art = { url, html, fill, image, draw, _BASE: () => BASE };
})(typeof window !== 'undefined' ? window : globalThis);
