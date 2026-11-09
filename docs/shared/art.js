/* One shared place that turns a glyph (e.g. the cow emoji) into the painted illustration, and falls back to the
 * emoji itself whenever there is no image yet (so the game never shows a broken picture, online or offline).
 * Required script on every game page (before the game script); parent.html has no glyph sites.
 *   Art.html(glyph, cls)            -> '<img ...>' string, or the escaped glyph       (innerHTML sites)
 *   Art.fill(el, glyph, cls)        -> sets el's content                              (replaces el.textContent = glyph)
 *   Art.fillAttr(el, attr, g, cls)  -> same for CSS `::before{content:attr(attr)}` sites
 *   Art.image(glyph)                -> cached HTMLImageElement or null                (canvas preloading)
 *   Art.draw(ctx, glyph, cx, cy, s) -> drawImage centred at cx,cy, size s; else ctx.fillText fallback
 * Registry: window.ART_REGISTRY = { '🐮': 'cow', ... } generated from the inventory (see PRODUCTION_ASSET_PIPELINE.md).
 */
(function (root) {
  'use strict';
  const norm = (g) => String(g).replace(/\uFE0F/g, '');
  /* Lookup always strips the variation selector, so a hand-written key that still
     carries U+FE0F ("☀️", "🍽️", "🌧️") could never match and silently stayed an
     emoji. Normalise the keys once at load instead of trusting every entry. */
  const REG = {};
  const RAW = root.ART_REGISTRY || {};
  for (const k in RAW) if (Object.prototype.hasOwnProperty.call(RAW, k)) REG[norm(k)] = RAW[k];
  let BASE = 'assets/art/';
  try { if (typeof document !== 'undefined' && document.currentScript && document.currentScript.src)
          BASE = new URL('../assets/art/', document.currentScript.src).href; } catch (e) { /* keep default */ }
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const stemUrl = (stem) => stem ? BASE + stem + '.webp' : null;
  const url = (g) => stemUrl(REG[norm(g)]);
  function html(g, cls) {
    const u = url(g);
    return u ? '<img class="art' + (cls ? ' ' + esc(cls) : '') + '" src="' + u + '" alt="" draggable="false">' : esc(g);
  }
  const fill = (el, g, cls) => { el.dataset.emoji = norm(g); el.innerHTML = html(g, cls); };
  /* A CSS-driven render site: the glyph lives in an attribute consumed by
     `::before{content:attr(data-e)}` (Cat Forest's cats, gifts, decor, fx).
     The attribute always keeps the glyph (smokes and CSS read it back), and
     when an art image exists the element also gets a single `<img class="art">`
     plus `class="art-painted"`, which the page's CSS uses to switch the
     `::before` off so the emoji never paints underneath the illustration.
     Idempotent: re-rendering the same element replaces the image, never stacks. */
  const fillAttr = (el, attr, g, cls) => {
    el.dataset.emoji = norm(g);
    el.setAttribute(attr, g);
    const u = url(g);
    const old = el.querySelector(':scope > img.art');
    if (!u) {
      if (old) old.remove();
      el.classList.remove('art-painted');
      return;
    }
    const img = old || document.createElement('img');
    img.className = 'art' + (cls ? ' ' + esc(cls) : '');
    img.alt = '';
    img.draggable = false;
    img.src = u;
    if (!old) el.insertBefore(img, el.firstChild); // keep existing children, listeners and order
    el.classList.add('art-painted');
  };
  const cache = new Map();
  function imageStem(stem) {
    const u = stemUrl(stem); if (!u || typeof Image === 'undefined') return null;
    if (!cache.has(u)) { const im = new Image(); im.src = u; cache.set(u, im); }
    return cache.get(u);
  }
  function image(g) { return imageStem(REG[norm(g)]); }
  function drawWithImage(ctx, im, fallbackText, cx, cy, size) {
    if (im && im.complete && im.naturalWidth) { ctx.drawImage(im, cx - size / 2, cy - size / 2, size, size); return true; }
    const parts = /^(.*?)(\d*\.?\d+)(px|pt|em|%)\s+(.*)$/.exec(ctx.font || '');
    ctx.save();
    ctx.font = (parts ? parts[1] : '') + size + 'px ' + (parts ? parts[4] : 'sans-serif');
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(fallbackText, cx, cy);
    ctx.restore();
    return false;
  }
  function draw(ctx, g, cx, cy, size) { return drawWithImage(ctx, image(g), g, cx, cy, size); }
  function drawStem(ctx, stem, cx, cy, size, fallbackText) {
    return drawWithImage(ctx, imageStem(stem), fallbackText || '', cx, cy, size);
  }
  root.Art = { url, stemUrl, html, fill, fillAttr, image, imageStem, draw, drawStem, _BASE: () => BASE };
})(typeof window !== 'undefined' ? window : globalThis);
