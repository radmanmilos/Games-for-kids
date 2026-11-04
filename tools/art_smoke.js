/* Art helper smoke — game/shared/art.js, the one place that turns a glyph into
   the painted WebP and falls back to the emoji (task 326).
   Boots the animals page (it loads shared/art.js + data/art-registry.js) and
   pins the helper contract the whole migration depends on:
     - url()      -> a path only for registered stems, null otherwise
     - html()     -> an <img class="art"> string or the escaped glyph
     - fill()     -> one image, dataset.emoji always set, idempotent
     - fillAttr() -> keeps the glyph in the attribute (CSS + smokes read it),
                     adds `art-painted`, exactly ONE image however often it runs,
                     and never destroys the element's existing children
     - draw()     -> drawImage when the file is loaded, emoji fallback otherwise,
                     and the fallback leaves the caller's ctx state alone
   Run:  node tools/art_smoke.js     (from the repo root or anywhere)
   Requires Node >= 22. CHROME_PATH env optional. */
const { start, check, getFails } = require('./headless.js');

const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const h = await start({ page: '/pages/animals.html', tag: 'art-smoke', width: 1024, height: 800 });

  let ready = false;
  for (let i = 0; i < 20 && !ready; i++) {
    ready = await h.evalv(`!!(window.Art && window.ART_REGISTRY)`);
    if (!ready) await sleep(200);
  }
  check('art.js + art-registry booted on a game page', ready);

  /* A registered glyph (🐮 -> cow) and a glyph with no art stem at all. The
     second one is asserted to be unregistered so this test can never silently
     start exercising the wrong branch if someone registers it. */
  const api = JSON.parse(await h.evalv(`JSON.stringify({
    has: ['url','html','fill','fillAttr','image','draw'].every(k => typeof Art[k] === 'function'),
    cow: Art.url('🐮'),
    apple: Art.url('🍎'),
    /* T358: these glyphs carry U+FE0F at the call site and the registry ships the
       key without it (or vice versa); both must resolve to the painted art. */
    sunVs16: Art.url('☀️'),
    plateVs16: Art.url('🍽️'),
    none: Art.url('🧪'),
    noneIsUnregistered: !window.ART_REGISTRY['🧪'],
    html: Art.html('🐮'),
    fallback: Art.html('🧪'),
    escaped: Art.html('<b>x</b>'),
    base: Art._BASE()
  })`));
  check('Art exposes url/html/fill/fillAttr/image/draw', api.has === true, JSON.stringify(api.has));
  check('url() resolves a registered glyph to its WebP', /assets\/art\/cow\.webp$/.test(api.cow || ''), api.cow);
  check('url() resolves a glyph whose call site carries U+FE0F', /assets\/art\/sun\.webp$/.test(api.sunVs16 || '') && /assets\/art\/object-plate\.webp$/.test(api.plateVs16 || ''),
    api.sunVs16 + ' | ' + api.plateVs16);
  check('the fallback glyph used by this test really has no registry entry', api.noneIsUnregistered === true);
  check('url() returns null for a glyph with no art stem', api.none === null, String(api.none));
  check('html() emits <img class="art"> for a registered glyph',
    /^<img class="art" src="[^"]*cow\.webp" alt="" draggable="false">$/.test(api.html), api.html);
  check('html() falls back to the escaped glyph', api.fallback === '🧪' && api.escaped === '&lt;b&gt;x&lt;/b&gt;',
    api.fallback + ' | ' + api.escaped);

  /* fill(): one image, dataset.emoji set, and calling it twice must not stack. */
  const fill = JSON.parse(await h.evalv(`JSON.stringify((() => {
    const el = document.createElement('span');
    Art.fill(el, '🐮');
    const once = el.querySelectorAll('img.art').length;
    Art.fill(el, '🐮');
    return { once, twice: el.querySelectorAll('img.art').length, emoji: el.dataset.emoji };
  })())`));
  check('fill() paints exactly one <img class="art"> and sets dataset.emoji',
    fill.once === 1 && fill.emoji === '🐮', JSON.stringify(fill));
  check('fill() is idempotent (a re-render never stacks images)', fill.twice === 1, JSON.stringify(fill));

  /* fillAttr(): the Cat Forest contract. */
  const attr = JSON.parse(await h.evalv(`JSON.stringify((() => {
    const el = document.createElement('span');
    el.innerHTML = '<i class="keep">child</i>';
    Art.fillAttr(el, 'data-e', '🐮');
    const once = el.querySelectorAll('img.art').length;
    Art.fillAttr(el, 'data-e', '🐮');
    const twice = el.querySelectorAll('img.art').length;
    const first = el.firstElementChild && el.firstElementChild.tagName;
    const kept = !!el.querySelector('.keep');
    const painted = el.classList.contains('art-painted');
    const glyph = el.getAttribute('data-e');

    const plain = document.createElement('span');
    Art.fillAttr(plain, 'data-e', '🧪');

    const cleared = document.createElement('span');
    Art.fillAttr(cleared, 'data-e', '🐮');
    Art.fillAttr(cleared, 'data-e', '🧪');
    return { once, twice, first, kept, painted, glyph,
      emoji: el.dataset.emoji,
      plainImg: plain.querySelectorAll('img.art').length, plainPainted: plain.classList.contains('art-painted'),
      plainGlyph: plain.getAttribute('data-e'),
      clearedImg: cleared.querySelectorAll('img.art').length, clearedPainted: cleared.classList.contains('art-painted') };
  })())`));
  check('fillAttr() keeps the glyph in the attribute (CSS/smokes read it back)',
    attr.glyph === '🐮' && attr.emoji === '🐮', JSON.stringify(attr));
  check('fillAttr() marks the element art-painted and inserts ONE image',
    attr.once === 1 && attr.painted === true && attr.first === 'IMG', JSON.stringify(attr));
  check('fillAttr() is idempotent (re-rendering a plate never stacks images)',
    attr.twice === 1, JSON.stringify(attr));
  check("fillAttr() keeps the element's existing children (no innerHTML rebuild)",
    attr.kept === true, JSON.stringify(attr));
  check('fillAttr() leaves an unregistered glyph as the CSS-drawn emoji',
    attr.plainImg === 0 && attr.plainPainted === false && attr.plainGlyph === '🧪', JSON.stringify(attr));
  check('fillAttr() drops the image when the glyph has no art', 
    attr.clearedImg === 0 && attr.clearedPainted === false, JSON.stringify(attr));

  /* draw(): wait for the WebP, then check the happy path + the fallback contract. */
  let loaded = false;
  for (let i = 0; i < 40 && !loaded; i++) {
    loaded = await h.evalv(`(function(){ var im = Art.image('🐮'); return !!(im && im.complete && im.naturalWidth); })()`);
    if (!loaded) await sleep(50);
  }
  check('image() loads and caches the WebP', loaded === true);

  const draw = JSON.parse(await h.evalv(`JSON.stringify((() => {
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, 64, 64);
    ctx.font = 'bold 22px "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    const fontBefore = ctx.font, alignBefore = ctx.textAlign, baselineBefore = ctx.textBaseline;
    const okRegistered = Art.draw(ctx, '🐮', 32, 32, 40);
    // Probe the font the fallback actually paints with (save/restore hides it after).
    const own = ctx.fillText.bind(ctx);
    let seenFont = null;
    ctx.fillText = function (t, x, y) { seenFont = ctx.font; return own(t, x, y); };
    const okUnknown = Art.draw(ctx, '🧪', 32, 32, 18);
    ctx.fillText = own;
    const afterFont = ctx.font, afterAlign = ctx.textAlign, afterBaseline = ctx.textBaseline;
    return { okRegistered, okUnknown, afterFont, afterAlign, afterBaseline, fontBefore, alignBefore, baselineBefore, seenFont };
  })())`));
  check('draw() paints the image for a loaded registered glyph', draw.okRegistered === true, JSON.stringify(draw));
  check('draw() reports false and falls back to fillText for an unknown glyph', draw.okUnknown === false, JSON.stringify(draw));
  check("draw() restores the caller's ctx font/align/baseline (no state leak)",
    draw.afterFont === draw.fontBefore && draw.afterAlign === draw.alignBefore && draw.afterBaseline === draw.baselineBefore,
    JSON.stringify({ got: [draw.afterFont, draw.afterAlign, draw.afterBaseline], want: [draw.fontBefore, draw.alignBefore, draw.baselineBefore] }));
  check('draw() fallback keeps the caller emoji font and only swaps the size',
    /^bold 18px .*Segoe UI Emoji.*sans-serif$/.test(draw.seenFont || ''), draw.seenFont);

  await h.close();
  console.log(`\n${getFails() === 0 ? 'ALL' : 'SOME'} CHECKS ${getFails() === 0 ? 'PASSED' : 'FAILED'} (${getFails()} fail)`);
  process.exit(getFails() ? 1 : 0);
})().catch(e => { console.error('art_smoke crashed:', e); process.exit(1); });
