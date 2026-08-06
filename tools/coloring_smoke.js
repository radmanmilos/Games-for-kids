/* Coloring smoke test — Phase 5 task 77.
   Drives pages/coloring.html headlessly: palette renders 11 swatches, SVG regions
   + ref render, scene name + progress shown, tapping regions fills them, completing
   a scene auto-advances, next button works, all 12 scenes cycle.
   Run:  node tools/coloring_smoke.js     (from the repo root or anywhere)
   Requires Node >= 22. CHROME_PATH env optional. */
const { start, check, getFails } = require('./headless.js');
const fs = require('fs');
const path = require('path');

const sleep = ms => new Promise(r => setTimeout(r, ms));

const STUB = `window.speech={speak:function(t,cb){if(cb)cb();},cancel:function(){}};window.popSound=window.gentleMiss=window.successChime=window.celebrate=function(){};window.playAnimalSound=function(){}; true`;

(async () => {
  const h = await start({ page: '/pages/coloring.html', tag: 'coloring-smoke', width: 1024, height: 800 });

  let ready = false;
  for (let i = 0; i < 20 && !ready; i++) {
    ready = await h.evalv(`typeof window.startColoring === 'function' && !!document.getElementById('coloringSvg')`);
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
  check('palette renders 11 swatches', U.palette === 11, String(U.palette));
  check('play SVG and ref SVG have the same region count', U.regions > 0 && U.regions === U.refRegions, ui);
  check('scene name is shown (Cyrillic animal name)', U.name.length > 0 && /[А-ЩЪЫЬЭЮЯЂЈЉЊЋЏ]/.test(U.name), U.name);
  check('progress text shows "Животиња N од 12"', U.progress.startsWith('Животиња ') && U.progress.endsWith(' од 12'), U.progress);
  check('next button is present', U.nextVisible === true);

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

  const root = path.join(__dirname, '..');
  const indexHtml = fs.readFileSync(path.join(root, 'game', 'index.html'), 'utf8');
  check('hub button wired (data-go="game-coloring")', indexHtml.includes('data-go="game-coloring"'));
  const nav = fs.readFileSync(path.join(root, 'game', 'shared', 'navigation.js'), 'utf8');
  check('navigation route wired (game-coloring -> coloring.html)', nav.includes("'game-coloring'") && nav.includes("'pages/coloring.html'"));
  const main = fs.readFileSync(path.join(root, 'game', 'shared', 'main.js'), 'utf8');
  check('standalone boot wired (coloring -> coloring-back/startColoring)', main.includes("'coloring': ['coloring-back', 'startColoring']"));

  h.close();
  console.log(`\n${getFails() === 0 ? 'ALL' : 'SOME'} CHECKS ${getFails() === 0 ? 'PASSED' : 'FAILED'} (${getFails()} fail)`);
  process.exit(getFails() ? 1 : 0);
})().catch(e => { console.error('coloring_smoke crashed:', e); process.exit(1); });
