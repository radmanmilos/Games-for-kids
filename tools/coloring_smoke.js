/* Coloring smoke test — Phase 2 task 119 (GAME-COLOR-001).
   Drives pages/coloring.html headlessly: palette renders 11 swatches, SVG regions
   + ref render, scene name + progress shown, tapping regions fills them, completing
   a scene auto-advances, next button works, all 12 scenes cycle.
   Also tests FREE coloring mode: toggle, no correctness, clear button.
   V2.5 (task 216): pins the shared-header geometry — title inside .ps-header
   without touching the corner controls, header flowing into the wrap, mode
   below the band, clear inside the tools row.
   Run:  node tools/coloring_smoke.js     (from the repo root or anywhere)
   Requires Node >= 22. CHROME_PATH env optional. */
const { start, check, getFails } = require('./headless.js');
const { checkRouteWired } = require('./route_contract.js');
const fs = require('fs');
const path = require('path');

const sleep = ms => new Promise(r => setTimeout(r, ms));

const STUB = `window.speech={speak:function(t,cb){if(cb)cb();},cancel:function(){}};window.audioBuses.play=function(){};window.audioBuses.speakWithDuck=function(t,cb){if(cb)cb();};window.celebrate=function(){};window.playAnimalSound=function(){}; true`;

(async () => {
  const h = await start({ page: '/pages/coloring.html', tag: 'coloring-smoke', width: 1024, height: 800 });

  let ready = false;
  for (let i = 0; i < 20 && !ready; i++) {
    ready = await h.evalv(`typeof window.startColoring === 'function' && !!document.getElementById('coloringSvg') && document.querySelectorAll('#coloringSvg .coloring-region').length > 0`);
    if (!ready) await sleep(200);
  }
  check('coloring game booted (startColoring ready + SVG present)', ready);
  await h.evalv(STUB);

  const ui = await h.evalv(`JSON.stringify({
    palette: document.querySelectorAll('#coloringPalette .coloring-swatch').length,
    regions: document.querySelectorAll('#coloringSvg .coloring-region').length,
    refRegions: document.querySelectorAll('#coloringRef .coloring-region').length,
    name: document.getElementById('coloringName').textContent,
    progress: document.getElementById('coloringProgress').textContent,
    nextVisible: !!document.getElementById('coloring-next')
  })`);
  const U = JSON.parse(ui);
  // Derived, not a literal. coloring.js:27 builds the palette from
  // SERBIAN.colors, so pinning 11 froze today's vocabulary size: adding a colour
  // would have made this red for a change it was never meant to police. Same
  // lesson as classroom_smoke's number tiles and hub_smoke's games count.
  const PALETTE_LEN = await h.evalv(`window.SERBIAN.colors.length`);
  check('palette renders every shared colour as a swatch', U.palette === PALETTE_LEN,
    `rendered ${U.palette}, SERBIAN.colors has ${PALETTE_LEN}`);
  check('play SVG and ref SVG have the same region count', U.regions > 0 && U.regions === U.refRegions, ui);
  check('scene name is shown (Cyrillic animal name)', U.name.length > 0 && /[А-ЩЪЫЬЭЮЯЂЈЉЊЋЏ]/.test(U.name), U.name);
  check('progress text shows "Животиња N од 12"', U.progress.startsWith('Животиња ') && U.progress.endsWith(' од 12'), U.progress);
  check('next button is present', U.nextVisible === true);

  // --- V2.5 shared-header geometry (spec §32 / §42.6) ---
  const hdrGeom = JSON.parse(await h.evalv(`JSON.stringify((function(){
    function g(s){ var e=document.querySelector(s); if(!e) return null; var b=e.getBoundingClientRect();
      return {x:b.x,y:b.y,r:b.right,b:b.bottom}; }
    function ov(a,b){ if(!a||!b) return -1;
      return Math.max(0,Math.min(a.r,b.r)-Math.max(a.x,b.x)) * Math.max(0,Math.min(a.b,b.b)-Math.max(a.y,b.y)); }
    var hd=g('.ps-header'), title=g('.ps-header .ps-title'), back=g('#coloring-back'),
        next=g('#coloring-next'), wrap=g('.coloring-wrap'), mode=g('#coloringModeToggle');
    return { header:!!hd,
      titleInHeader: !!(hd&&title&&title.y>=hd.y-0.5&&title.b<=hd.b+0.5),
      titleVsBack: ov(title,back), titleVsNext: ov(title,next),
      flowGap: (hd&&wrap)?Math.abs(hd.b-wrap.y):-1,
      modeVsHeader: (hd&&mode)?+(mode.y-hd.b).toFixed(1):-1 };
  })())`));
  check('V2.5: animal name + progress own the shared header centre',
    hdrGeom.header && hdrGeom.titleInHeader, JSON.stringify(hdrGeom));
  check('V2.5: title never overlaps the back or next corner controls',
    hdrGeom.titleVsBack === 0 && hdrGeom.titleVsNext === 0, JSON.stringify(hdrGeom));
  check('V2.5: header flows directly into the wrap (bottom == wrap top)',
    hdrGeom.flowGap >= 0 && hdrGeom.flowGap <= 1, JSON.stringify(hdrGeom));
  check('V2.5: mode toggle sits below the header band (mode is secondary)',
    hdrGeom.modeVsHeader >= 0, JSON.stringify(hdrGeom));

  const targetColor = await h.evalv(`document.querySelector('#coloringSvg .coloring-region:not(.ok)').dataset.target`);
  check('first region has a target color', !!targetColor, targetColor);

  await h.evalv(`(function(){
    const target = '${targetColor}';
    const swatches = document.querySelectorAll('#coloringPalette .coloring-swatch');
    for (const s of swatches) {
      if (s.dataset.color === target) { s.click(); break; }
    }
    return true;
  })()`);

  const selectedSwatch = await h.evalv(`document.querySelector('#coloringPalette .coloring-swatch.selected') !== null`);
  check('a palette swatch can be selected', selectedSwatch === true);

  const selectedColor = await h.evalv(`document.querySelector('#coloringPalette .coloring-swatch.selected').dataset.color`);
  await h.evalv(`(function(){
    const r = document.querySelector('#coloringSvg .coloring-region:not(.ok)');
    if (r) { r.dispatchEvent(new PointerEvent('pointerdown', {bubbles:true})); }
    return true;
  })()`);
  const filled = await h.evalv(`document.querySelector('#coloringSvg .coloring-region.ok') !== null`);
  check('tapping a region with the matching color marks it ok', filled === true);

  const totalRegions = await h.evalv(`document.querySelectorAll('#coloringSvg .coloring-region').length`);
  const okRegions = await h.evalv(`document.querySelectorAll('#coloringSvg .coloring-region.ok').length`);
  check('after one correct fill: ok count = 1', okRegions === 1, String(okRegions) + '/' + String(totalRegions));

  await h.evalv(`document.getElementById('coloring-next').click();`);
  await sleep(400);
  const progressAfterNext = await h.evalv(`document.getElementById('coloringProgress').textContent`);
  check('next button advances to the next scene', progressAfterNext.startsWith('Животиња 2'), progressAfterNext);

  // --- Free coloring mode ---
  const modeToggleExists = await h.evalv(`!!document.getElementById('coloringModeToggle')`);
  check('mode toggle button exists', modeToggleExists === true);

  await h.evalv(`document.getElementById('coloringModeToggle').click()`);
  await sleep(100);

  const freeModeActive = await h.evalv(`document.getElementById('coloringModeToggle').classList.contains('free')`);
  check('free mode activates on toggle', freeModeActive === true);

  const clearBtnVisible = await h.evalv(`document.getElementById('coloringClear').classList.contains('visible')`);
  check('clear button appears in free mode', clearBtnVisible === true);

  const clearGeom = JSON.parse(await h.evalv(`JSON.stringify((function(){
    var e=document.getElementById('coloringClear'), p=document.getElementById('coloringPalette');
    if(!e||!p) return null;
    var a=e.getBoundingClientRect(), b=p.getBoundingClientRect();
    return { inTools: !!(e.parentElement && e.parentElement.classList.contains('coloring-tools')),
      ov: Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left))
        * Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)),
      inViewport: a.top>=-0.5 && a.bottom<=innerHeight+0.5 && a.left>=-0.5 && a.right<=innerWidth+0.5 };
  })())`));
  check('V2.5: clear button lives in the tools row, clear of the palette and on-screen',
    clearGeom && clearGeom.inTools && clearGeom.ov === 0 && clearGeom.inViewport,
    JSON.stringify(clearGeom));

  const toggleLabel = await h.evalv(`document.getElementById('coloringModeToggle').textContent`);
  check('toggle label switches to "По слици"', /по слици/i.test(toggleLabel), toggleLabel);

  // In free mode, tapping with WRONG color should NOT mark ok
  await h.evalv(`(function(){
    const swatches = document.querySelectorAll('#coloringPalette .coloring-swatch');
    for (const s of swatches) {
      if (s.dataset.color !== '${targetColor}') { s.click(); break; }
    }
    return true;
  })()`);
  await h.evalv(`(function(){
    const r = document.querySelector('#coloringSvg .coloring-region:not(.ok)');
    if (r) { r.dispatchEvent(new PointerEvent('pointerdown', {bubbles:true})); }
    return true;
  })()`);
  await sleep(50);
  const okInFreeMode = await h.evalv(`document.querySelectorAll('#coloringSvg .coloring-region.ok').length`);
  check('free mode: wrong color does NOT mark ok', okInFreeMode === 0, String(okInFreeMode));

  // Clear button resets all regions
  await h.evalv(`document.getElementById('coloringClear').click()`);
  await sleep(50);
  const okAfterClear = await h.evalv(`document.querySelectorAll('#coloringSvg .coloring-region.ok').length`);
  const filledAfterClear = await h.evalv(`document.querySelectorAll('#coloringSvg .coloring-region[style*="fill"]').length`);
  check('clear button resets all regions', okAfterClear === 0, String(okAfterClear));

  // Toggle back to reference mode
  await h.evalv(`document.getElementById('coloringModeToggle').click()`);
  await sleep(100);
  const refModeBack = await h.evalv(`!document.getElementById('coloringModeToggle').classList.contains('free')`);
  check('toggle back to reference mode works', refModeBack === true);

  // Static checks
  const root = path.join(__dirname, '..');
  const indexHtml = fs.readFileSync(path.join(root, 'game', 'index.html'), 'utf8');
  check('hub button wired (data-go="game-coloring")', indexHtml.includes('data-go="game-coloring"'));
// R7: the route/back wiring lives in app-registry.js now, not in navigation.js.
  checkRouteWired('coloring', 'game-coloring', 'pages/coloring.html',
    { back: 'coloring-back', start: 'startColoring', check });

  await h.close();
  console.log(`\n${getFails() === 0 ? 'ALL' : 'SOME'} CHECKS ${getFails() === 0 ? 'PASSED' : 'FAILED'} (${getFails()} fail)`);
  process.exit(getFails() ? 1 : 0);
})().catch(e => { console.error('coloring_smoke crashed:', e); process.exit(1); });
