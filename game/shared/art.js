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
  function image(g) {
    const u = url(g); if (!u || typeof Image === 'undefined') return null;
    if (!cache.has(u)) { const im = new Image(); im.src = u; cache.set(u, im); }
    return cache.get(u);
  }
  function draw(ctx, g, cx, cy, size) {
    const im = image(g);
    if (im && im.complete && im.naturalWidth) { ctx.drawImage(im, cx - size / 2, cy - size / 2, size, size); return true; }
    /* Emoji fallback: keep the caller's font family/weight (call sites set an
       emoji font before drawing) but force the requested size, and never leak
       the align/baseline changes into the rest of the frame. */
    const parts = /^(.*?)(\d*\.?\d+)(px|pt|em|%)\s+(.*)$/.exec(ctx.font || '');
    ctx.save();
    ctx.font = (parts ? parts[1] : '') + size + 'px ' + (parts ? parts[4] : 'sans-serif');
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(g, cx, cy);
    ctx.restore();
    return false;
  }
  root.Art = { url, html, fill, fillAttr, image, draw, _BASE: () => BASE };
})(typeof window !== 'undefined' ? window : globalThis);
