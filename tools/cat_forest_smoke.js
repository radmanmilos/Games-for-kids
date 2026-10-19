/* Мачја шума (Cat Forest) smoke — CF-02 skeleton + CF-03 static stage (tasks 263, 264).
   Drives pages/cat_forest.html headlessly and pins the CF-01 wiring contract:
   boot + test hook, the route contract, the back control's reachability (inside
   the viewport AND hit-testable, never a bare .click()), the hub tile, and the
   no-network static rule (TD §8 / TP §3.1). CF-03 adds the three-viewport stage
   geometry of TP §3.2. Gameplay assertions arrive with the engine — this file
   grows card by card (TP §3).
   Run:  node tools/cat_forest_smoke.js     (from the repo root or anywhere)
   Requires Node >= 22. CHROME_PATH env optional. */
const { start, check, getFails } = require('./headless.js');
const { checkRouteWired } = require('./route_contract.js');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const sleep = ms => new Promise(r => setTimeout(r, ms));

const STUB = `window.speech={speak:function(){window.__spoke=(window.__spoke||0)+1;},cancel:function(){}};
  window.audioBuses.play=function(){};window.audioBuses.speakWithDuck=function(t,cb){window.__spoke=(window.__spoke||0)+1;if(cb)cb();};
  window.celebrate=function(){}; true`;

/* TD §8 / TP §3.1: the page may never reach the network. The one legitimate
   occurrence of an absolute URL is the inline SVG xmlns in the favicon/back icon. */
const ALLOWED_SVG_XMLNS = /http:\/\/www\.w3\.org\/2000\/svg/g;
const BANNED = ['fetch(', 'XMLHttpRequest', 'sendBeacon', 'WebSocket', 'http://', 'https://'];

/* Reachability = inside the viewport AND hit-testable at its centre (TP §1.3):
   a passing .click() proves neither. Shared by the positive check and the
   negative control so both measure exactly the same property. */
const backGeometry = async hh => JSON.parse(await hh.evalv(`JSON.stringify((() => {
  const el = document.getElementById('cat-forest-back');
  if (!el) return { found: false, inside: false, hit: false, w: 0, h: 0 };
  const r = el.getBoundingClientRect();
  const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
  return { found: true,
    inside: r.top >= -1 && r.left >= -1 && r.bottom <= innerHeight + 1 && r.right <= innerWidth + 1,
    hit: !!(hit && (hit === el || el.contains(hit))),
    w: r.width, h: r.height };
})())`));

(async () => {
  const h = await start({ page: '/pages/cat_forest.html', tag: 'cat-forest-smoke', width: 1024, height: 800 });

  let ready = false;
  for (let i = 0; i < 20 && !ready; i++) {
    ready = await h.evalv(`typeof window.startCatForest === 'function' && !!window.__catForest`);
    if (!ready) await sleep(200);
  }
  check('cat forest booted (startCatForest + __catForest present)', ready);
  await h.evalv(STUB);

  // The test hook is the contract every later card's determinism rests on (TD §8):
  // assert only that state() exists and returns an object, never its stub payload —
  // CF-04 replaces the payload and a value assertion here would go stale.
  const hook = await h.evalv(`typeof window.__catForest.state === 'function' && typeof window.__catForest.state() === 'object'`);
  check('the test hook exposes state() as a JSON-safe snapshot (TD §8)', hook === true, String(hook));

  const g = await backGeometry(h);
  check('the back control is inside the viewport and hit-testable', g.found && g.inside && g.hit, JSON.stringify(g));
  check('the back control is a comfortable tap target (>= 56px)',
    g.found && Math.min(g.w, g.h) >= 56, `w=${g.w} h=${g.h}`);

  checkRouteWired('cat_forest', 'game-cat-forest', 'pages/cat_forest.html',
    { back: 'cat-forest-back', start: 'startCatForest', check });

  const root = path.join(__dirname, '..');
  const indexHtml = fs.readFileSync(path.join(root, 'game', 'index.html'), 'utf8');
  check('hub button wired (data-go="game-cat-forest")', indexHtml.includes('data-go="game-cat-forest"'));

  for (const [label, file] of [['page', 'game/pages/cat_forest.html'], ['script', 'game/games/cat_forest.js']]) {
    const src = fs.readFileSync(path.join(root, file), 'utf8').replace(ALLOWED_SVG_XMLNS, '');
    const hits = BANNED.filter(b => src.includes(b));
    check(`the ${label} makes no network calls (TD §8)`, hits.length === 0, hits.join(', ') || 'none');
  }

  /* ---- CF-03: the static stage holds in all three target viewports (TP §3.2).
     Fresh session per size: a broken size cannot be masked by the first one. */
  const pageHtml = fs.readFileSync(path.join(root, 'game', 'pages', 'cat_forest.html'), 'utf8');
  check('the page ships a prefers-reduced-motion block (TP §10)',
    /@media\s*\(\s*prefers-reduced-motion:\s*reduce\s*\)/.test(pageHtml));

  /* Same reachability definition as the back control (TP §1.3): inside the
     viewport AND hit-testable at its centre. */
  const stageGeometry = async hh => JSON.parse(await hh.evalv(`JSON.stringify((() => {
    const box = el => {
      const r = el.getBoundingClientRect();
      const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      return { inside: r.top >= -1 && r.left >= -1 && r.bottom <= innerHeight + 1 && r.right <= innerWidth + 1,
               hit: !!(hit && (hit === el || el.contains(hit))), w: r.width, h: r.height };
    };
    const all = s => [...document.querySelectorAll(s)];
    return {
      treats: all('.cf-treat').map(box),
      plates: all('.cf-plate').map(box),
      toggles: all('#cf-daynight, #cf-rain-btn').map(box),
      scrollW: document.documentElement.scrollWidth, scrollH: document.documentElement.scrollHeight,
      vw: innerWidth, vh: innerHeight,
      text: document.body.innerText.trim(),
      latin: all('[aria-label]').map(e => e.getAttribute('aria-label') || '').filter(l => /[A-Za-z]/.test(l)),
      decor: ['.cf-sky', '#cf-scenery', '#cf-decor'].map(s => {
        const el = document.querySelector(s);
        return { s, ok: !!el && el.getAttribute('aria-hidden') === 'true'
          && getComputedStyle(el).pointerEvents === 'none' };
      }),
    };
  })())`));

  for (const vp of [
    { name: '1024x800 tablet', width: 1024, height: 800, min: 72 },
    { name: '844x390 short landscape', width: 844, height: 390, min: 56 },
    { name: '390x844 portrait', width: 390, height: 844, min: 56 },
  ]) {
    const hv = await start({ page: '/pages/cat_forest.html', tag: `cat-forest-stage-${vp.width}x${vp.height}`, width: vp.width, height: vp.height });
    let laidOut = false;
    for (let i = 0; i < 20 && !laidOut; i++) {
      laidOut = await hv.evalv(`document.querySelectorAll('.cf-treat').length === 5`);
      if (!laidOut) await sleep(100);
    }
    const m = await stageGeometry(hv);
    check(`${vp.name}: 5 treats, 3 plates and 2 toggles render`,
      m.treats.length === 5 && m.plates.length === 3 && m.toggles.length === 2,
      `treats=${m.treats.length} plates=${m.plates.length} toggles=${m.toggles.length}`);
    check(`${vp.name}: every control is inside the viewport and hit-testable`,
      [...m.treats, ...m.plates, ...m.toggles].every(b => b.inside && b.hit),
      JSON.stringify([...m.treats, ...m.plates, ...m.toggles]));
    check(`${vp.name}: treats and plates are at least ${vp.min}px`,
      [...m.treats, ...m.plates].every(b => Math.min(b.w, b.h) >= vp.min),
      [...m.treats, ...m.plates].map(b => `${Math.round(b.w)}x${Math.round(b.h)}`).join(' '));
    check(`${vp.name}: toggles are at least 56px`,
      m.toggles.every(b => Math.min(b.w, b.h) >= 56),
      m.toggles.map(b => `${Math.round(b.w)}x${Math.round(b.h)}`).join(' '));
    check(`${vp.name}: the stage does not scroll`, m.scrollW <= m.vw + 1 && m.scrollH <= m.vh + 1,
      `${m.scrollW}x${m.scrollH} in ${m.vw}x${m.vh}`);
    check(`${vp.name}: no visible text (body.innerText is empty)`, m.text === '', JSON.stringify(m.text));
    check(`${vp.name}: every aria-label is Cyrillic (no Latin letters)`, m.latin.length === 0, m.latin.join(' | '));
    check(`${vp.name}: decorative layers are aria-hidden and unclickable`, m.decor.every(d => d.ok),
      JSON.stringify(m.decor));
    await hv.close();
  }

  /* ---- CF-04: engine core — clock, RNG, hook (TP §3.3) -------------------- */
  const hookFns = await h.evalv(`['state','seed','rand','pause','step'].every(m => typeof window.__catForest[m] === 'function')`);
  check('the hook exposes the CF-04 API (state/seed/rand/pause/step)', hookFns === true, String(hookFns));

  const realHook = await h.evalv(`(() => { const s = window.__catForest.state(); return !('booted' in s) && !!s.config && s.plates.length === 3; })()`);
  check('state() is the real snapshot, not the CF-01 stub', realHook === true, String(realHook));

  /* The constants table is duplicated here on purpose (AC5): the smoke is the
     place that pins PS §6, so a silent edit of CF in the engine is a failure. */
  const EXPECTED_CONFIG = {
    PLATES: 3, MAX_CATS: 3,
    ARRIVE_MIN: 2500, ARRIVE_MAX: 4000,
    ENTER_MIN: 2200, ENTER_MAX: 3000,
    SIT_MS: 900,
    EAT_MIN: 8000, EAT_MAX: 14000,
    LEAVE_MIN: 2200, LEAVE_MAX: 3000,
    UNLIKED_FACTOR: 0.25,
    GIFT_CAP: 5, DECOR_MAX: 14, GIFT_FLY_MS: 600, PARTICLE_CAP: 12,
    SPEECH_GAP_MS: 1500, MEOW_GAP_MS: 300,
    IDLE_HINT_MS: 10000, FIRST_HINT_MS: 1500, HINT_MS: 1200, HINT_REPEAT_MAX: 3,
    RAIN_DROPS: 24, DROP_PAD: 24, DRAG_START_PX: 8,
    DT_CLAMP_MS: 100, STEP_MS: 50
  };
  const cfg = await h.evalv(`window.__catForest.state().config`);
  const cfgDiff = Object.keys(EXPECTED_CONFIG).filter(k => cfg[k] !== EXPECTED_CONFIG[k])
    .concat(Object.keys(cfg).filter(k => !(k in EXPECTED_CONFIG)));
  check('state().config matches the PS §6 constants table (AC5)', cfgDiff.length === 0,
    cfgDiff.length ? `differ: ${cfgDiff.join(', ')}` : 'exact');

  const stepped = await h.evalv(`(() => { const hk = window.__catForest; hk.pause(true);
    const a = hk.state().clock; hk.step(1000); return hk.state().clock - a; })()`);
  check('paused step(1000) advances the clock by exactly 1000 ms (AC1)', stepped === 1000, String(stepped));

  const rngSame = await h.evalv(`(() => { const hk = window.__catForest; hk.seed(7); const a = hk.rand(5);
    hk.seed(7); const b = hk.rand(5); return JSON.stringify(a) === JSON.stringify(b) && a.every(v => v >= 0 && v < 1); })()`);
  check('seed(7) then rand(5) is reproducible (AC2)', rngSame === true, String(rngSame));

  const rngDiff = await h.evalv(`(() => { const hk = window.__catForest; hk.seed(7); const a = hk.rand(5);
    hk.seed(8); const b = hk.rand(5); return JSON.stringify(a) !== JSON.stringify(b); })()`);
  check('a different seed gives a different stream (AC2, other half)', rngDiff === true, String(rngDiff));

  const noDouble = await h.evalv(`(() => { window.startCatForest(); const hk = window.__catForest;
    hk.pause(true); const a = hk.state().clock; hk.step(1000); return hk.state().clock - a; })()`);
  check('a second startCatForest() does not double the clock (started guard)', noDouble === 1000, String(noDouble));

  /* AC3: force document.hidden, dispatch visibilitychange, and let 500 ms of
     REAL time pass with the loop unpaused — only `hidden` can explain a freeze. */
  await h.evalv(`(() => { window.__catForest.pause(false);
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    document.dispatchEvent(new Event('visibilitychange')); return true; })()`);
  const clockBeforeHidden = await h.evalv(`window.__catForest.state().clock`);
  await sleep(500);
  const clockAfterHidden = await h.evalv(`window.__catForest.state().clock`);
  check('a hidden page freezes the clock over 500 ms of real time (AC3)',
    clockAfterHidden === clockBeforeHidden, `${clockBeforeHidden} -> ${clockAfterHidden}`);
  await h.evalv(`(() => { Object.defineProperty(document, 'hidden', { configurable: true, value: false });
    document.dispatchEvent(new Event('visibilitychange')); window.__catForest.pause(true); return true; })()`);

  const engineSrc = fs.readFileSync(path.join(root, 'game', 'games', 'cat_forest.js'), 'utf8');
  const dateHits = ['Date.now(', 'new Date('].filter(s => engineSrc.includes(s));
  check('the engine never reads the wall clock (AC4: no Date.now/new Date)',
    dateHits.length === 0, dateHits.join(', ') || 'none');

  /* ---- CF-05: treat selection and placement (TP §3.4) -------------------- */
  const clickSel = async sel => h.evalv(
    `(() => { const el = document.querySelector(${JSON.stringify(sel)}); if (!el) return false; el.click(); return true; })()`);
  const snap = async () => h.evalv(`window.__catForest.state()`);

  const treatIds = await h.evalv(`[...document.querySelectorAll('#cf-tray .cf-treat')].map(b => b.getAttribute('data-treat'))`);
  let ac1ok = true;
  const ac1bad = [];
  for (const id of treatIds) {
    const sel = `.cf-treat[data-treat="${id}"]`;
    await clickSel(sel);
    const on = await h.evalv(`(() => { const b = document.querySelector('${sel}');
      return b.classList.contains('cf-selected') && b.getAttribute('aria-pressed') === 'true'
        && window.__catForest.state().selectedTreat === '${id}'; })()`);
    await clickSel(sel);
    const off = await h.evalv(`(() => { const b = document.querySelector('${sel}');
      return !b.classList.contains('cf-selected') && b.getAttribute('aria-pressed') === 'false'
        && window.__catForest.state().selectedTreat === null; })()`);
    if (!(on && off)) { ac1ok = false; ac1bad.push(id); }
  }
  check('each of the 5 treats selects on tap and deselects on the second tap (AC1)',
    ac1ok && treatIds.length === 5, ac1bad.join(',') || '5/5');

  await clickSel('.cf-treat[data-treat="fish"]');
  await clickSel('.cf-treat[data-treat="milk"]');
  const oneAtATime = await h.evalv(`(() => { const f = document.querySelector('.cf-treat[data-treat="fish"]');
    return !f.classList.contains('cf-selected') && window.__catForest.state().selectedTreat === 'milk'; })()`);
  check('only one treat is selected at a time', oneAtATime === true, String(oneAtATime));
  await clickSel('.cf-treat[data-treat="milk"]'); // deselect before the next case

  await h.evalv(`window.__catForest.seed(42)`); // deterministic arrivalMs
  await clickSel('.cf-treat[data-treat="fish"]');
  await clickSel('.cf-plate[data-plate="0"]');
  const placed0 = await h.evalv(`(() => { const s = window.__catForest.state();
    const b = document.querySelector('.cf-plate[data-plate="0"]');
    return { plate: s.plates[0], sel: s.selectedTreat, drawn: b.querySelector('.cf-plate-treat').getAttribute('data-treat'),
      min: s.config.ARRIVE_MIN, max: s.config.ARRIVE_MAX }; })()`);
  check('select + tap plate 0 places the treat and clears the selection (AC2)',
    placed0.plate.state === 'treat' && placed0.plate.treat === 'fish' && placed0.sel === null && placed0.drawn === 'fish',
    JSON.stringify(placed0.plate) + ' sel=' + placed0.sel + ' drawn=' + placed0.drawn);
  check('the arrival wait is inside [ARRIVE_MIN, ARRIVE_MAX] (AC2)',
    placed0.plate.arriveMs >= placed0.min && placed0.plate.arriveMs <= placed0.max,
    `${placed0.plate.arriveMs} in [${placed0.min}, ${placed0.max}]`);

  const beforeHint = JSON.stringify(await snap());
  await clickSel('.cf-plate[data-plate="1"]');
  const afterHint = JSON.stringify(await snap());
  const hintOn = await h.evalv(`document.getElementById('cf-tray').classList.contains('cf-hint')`);
  check('an empty-handed tap on an empty plate changes nothing and bounces the tray (AC3)',
    beforeHint === afterHint && hintOn === true, `unchanged=${beforeHint === afterHint} hint=${hintOn}`);

  await h.evalv(`window.__catForest.step(1300)`);
  const hintGone = await h.evalv(`!document.getElementById('cf-tray').classList.contains('cf-hint')`);
  check('the tray hint clears itself on the game clock (no timer leak)', hintGone === true, String(hintGone));

  for (const [treat, plate] of [['milk', 1], ['chicken', 2]]) {
    await clickSel(`.cf-treat[data-treat="${treat}"]`);
    await clickSel(`.cf-plate[data-plate="${plate}"]`);
  }
  await clickSel('.cf-treat[data-treat="sushi"]');
  const beforeBusy = JSON.stringify(await snap());
  await clickSel('.cf-plate[data-plate="0"]');
  const afterBusy = JSON.stringify(await snap());
  const bounced = await h.evalv(`document.querySelector('.cf-treat[data-treat="sushi"]').classList.contains('cf-bounce')`);
  check('all plates busy + a treat in hand: nothing changes, the treat bounces (AC4)',
    beforeBusy === afterBusy && bounced === true, `unchanged=${beforeBusy === afterBusy} bounce=${bounced}`);
  await clickSel('.cf-treat[data-treat="sushi"]');

  /* AC5: the hook must be the same path as a tap. Two fresh sessions, same seed,
     compare everything that placement determines (the independent page clocks
     are the only thing that can differ). */
  const bootedOn = async hh => {
    for (let i = 0; i < 20; i++) {
      if (await hh.evalv(`typeof window.startCatForest === 'function' && !!window.__catForest`)) return true;
      await sleep(100);
    }
    return false;
  };
  const pathA = await start({ page: '/pages/cat_forest.html', tag: 'cf05-tap', width: 1024, height: 800 });
  await bootedOn(pathA);
  await pathA.evalv(`window.__catForest.pause(true); window.__catForest.seed(99); true`);
  await pathA.evalp(`document.querySelector('.cf-treat[data-treat="cookie"]').click()`);
  await pathA.evalp(`document.querySelector('.cf-plate[data-plate="2"]').click()`);
  const stA = await pathA.evalv(`window.__catForest.state()`);
  await pathA.close();

  const pathB = await start({ page: '/pages/cat_forest.html', tag: 'cf05-hook', width: 1024, height: 800 });
  await bootedOn(pathB);
  await pathB.evalv(`window.__catForest.pause(true); window.__catForest.seed(99); window.__catForest.place('cookie', 2); true`);
  const stB = await pathB.evalv(`window.__catForest.state()`);
  await pathB.close();

  const pick = s => JSON.stringify({ plates: s.plates, sel: s.selectedTreat, cats: s.cats, gifts: s.gifts,
    decor: s.decor, met: s.met, idle: s.idle, timers: s.timers, time: s.time, weather: s.weather });
  check('placing through the hook and through taps gives identical state (AC5)',
    pick(stA) === pick(stB), pick(stA) + ' vs ' + pick(stB));

  /* AC6: no failure vocabulary can reach the child. Comments are stripped first
     (the engine's own comments explain that there are no fail states). */
  const stripComments = s => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
  const vocabulary = /fail|error|wrong|gre[sš]|pogre[sš]|neuspeh/i;
  const vocabHits = [['page', pageHtml], ['engine', engineSrc]]
    .filter(([, src]) => vocabulary.test(stripComments(src))).map(([k]) => k);
  check('no failure vocabulary in the page or engine (AC6)', vocabHits.length === 0, vocabHits.join(', ') || 'none');

  await h.close();

  /* ---- negative control: the reachability check must be able to fail --------
     Mutate the page, prove the SAME predicate reports unreachable, then restore
     from an in-memory copy and hash-compare. Never `git checkout`/`stash`: those
     reset to HEAD and would delete this task's uncommitted work (AGENTS.md). */
  const pagePath = path.join(root, 'game', 'pages', 'cat_forest.html');
  const orig = fs.readFileSync(pagePath, 'utf8');
  const sha = s => crypto.createHash('sha256').update(s).digest('hex');
  const origSha = sha(orig);
  const button = orig.match(/<button\b[^>]*id="cat-forest-back"[\s\S]*?<\/button>/i);
  check('negative control setup: the back control markup is present and removable',
    !!button && orig.replace(button[0], '') !== orig);

  if (button) {
    fs.writeFileSync(pagePath, orig.replace(button[0], ''));
    const hNeg = await start({ page: '/pages/cat_forest.html', tag: 'cat-forest-neg', width: 1024, height: 800 });
    await hNeg.evalv(`typeof window.startCatForest === 'function' && !!window.__catForest`);
    const gn = await backGeometry(hNeg);
    const reachable = gn.found && gn.inside && gn.hit;
    check('negative control: with the back control removed the same check fails',
      reachable === false, JSON.stringify(gn));
    // checkErrors:false — the page legitimately lacks the control main.js wires,
    // so a captured runtime error here would be the mutation, not a real defect.
    await hNeg.close({ checkErrors: false });
    fs.writeFileSync(pagePath, orig);
  }

  check('negative control: the page was restored byte-identically',
    sha(fs.readFileSync(pagePath, 'utf8')) === origSha);

  console.log(`\n${getFails() === 0 ? 'ALL' : 'SOME'} CHECKS ${getFails() === 0 ? 'PASSED' : 'FAILED'} (${getFails()} fail)`);
  process.exit(getFails() ? 1 : 0);
})().catch(e => { console.error('cat_forest_smoke crashed:', e); process.exit(1); });
