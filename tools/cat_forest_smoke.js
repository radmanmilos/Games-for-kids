/* Мачја шума (Cat Forest) smoke — CF-02 skeleton + CF-03 static stage (tasks 263, 264).
   Drives pages/cat_forest.html headlessly and pins the CF-01 wiring contract:
   boot + test hook, the route contract, the back control's reachability (inside
   the viewport AND hit-testable, never a bare .click()), the hub tile, and the
   no-network static rule (TD §8 / TP §3.1). CF-03 adds the three-viewport stage
   geometry of TP §3.2; CF-06 adds the roster + weighted-picker checks of TP §3.5;
   CF-07 adds the cat actor lifecycle (spawn/enter/sit/eat/leave) of TP §3.6.
   Gameplay assertions arrive with the engine — this file grows card by card (TP §3).
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

  /* ---- CF-06: cat data + weighted picker (TP §3.5) -----------------------
     The roster is pinned here the same way the CF table is (AC5 policy): a
     silent data edit in the engine is a failure, so the smoke holds its own
     expected id lists. All statistical checks use a fixed seed and wide
     margins (2x, never a tight threshold). */
  const EXPECTED_CAT_IDS = ['maca', 'puhko', 'mica', 'sef', 'cveta', 'tigar',
    'tacka', 'senka', 'zvezda', 'kralj'];
  const EXPECTED_TREAT_IDS = ['fish', 'milk', 'chicken', 'sushi', 'cookie'];

  const roster = await h.evalv(`(() => { const d = window.__catForest.data;
    if (!d) return null;
    return { cats: d.cats.map(c => ({ id: c.id, likes: c.likes.slice() })), treats: d.treats.map(t => t.id) }; })()`);
  const catIds = roster && Array.isArray(roster.cats) ? roster.cats.map(c => c.id) : [];
  const uniqueCats = catIds.length === new Set(catIds).size;
  const badLikes = roster && Array.isArray(roster.cats)
    ? roster.cats.filter(c => !c.likes.every(id => EXPECTED_TREAT_IDS.includes(id))).map(c => c.id) : ['<no data>'];
  check('the roster has 10 cats with unique ids and valid treat likes (AC5)',
    !!roster && catIds.length === 10 && uniqueCats
      && JSON.stringify(catIds) === JSON.stringify(EXPECTED_CAT_IDS)
      && JSON.stringify(roster.treats) === JSON.stringify(EXPECTED_TREAT_IDS)
      && badLikes.length === 0,
    `cats=${catIds.length} unique=${uniqueCats} treats=${JSON.stringify(roster && roster.treats)} bad=${badLikes.join(',')}`);

  /* AC1: seed(1), 2000 day picks per treat — night-only cats never appear and
     Краљ only when all three plates are filled. */
  const ac1 = await h.evalv(`(() => {
    const hk = window.__catForest;
    const treats = ${JSON.stringify(EXPECTED_TREAT_IDS)};
    const NIGHT = ['senka', 'zvezda'];
    const out = { nightAtDay: [], kraljLow: [], kralj3: [] };
    hk.seed(1);
    for (const t of treats) {
      const day0 = hk.pick(t, false, 0, 2000);
      for (const n of NIGHT) if (day0.indexOf(n) !== -1) out.nightAtDay.push(t + ':' + n);
      if (day0.indexOf('kralj') !== -1) out.kraljLow.push(t);
    }
    for (const t of treats) {
      const day3 = hk.pick(t, false, 3, 2000);
      out.kralj3.push(day3.filter(x => x === 'kralj').length);
    }
    return out;
  })()`);
  check('seed(1), 2000 day picks/treat: night cats never visit and Краљ only at 3 plates (AC1)',
    ac1.nightAtDay.length === 0 && ac1.kraljLow.length === 0 && ac1.kralj3.every(c => c >= 1),
    `night=${ac1.nightAtDay.join(',') || '0'} kraljLow=${ac1.kraljLow.join(',') || '0'} kralj3=${ac1.kralj3.join(',')}`);

  /* AC2: for each treat, the mean pick frequency of cats that like it is at
     least twice that of cats that do not (day pool = the 7 non-special cats). */
  const ac2ratios = await h.evalv(`(() => {
    const hk = window.__catForest;
    const cats = window.__catForest.data.cats;
    const treats = ${JSON.stringify(EXPECTED_TREAT_IDS)};
    const out = {};
    hk.seed(1);
    for (const t of treats) {
      const ids = hk.pick(t, false, 0, 4000);
      const freq = {};
      for (const id of ids) freq[id] = (freq[id] || 0) + 1;
      const elig = cats.filter(c => !c.night && !c.needsAllPlates);
      const likers = elig.filter(c => c.likes.indexOf(t) !== -1);
      const unliked = elig.filter(c => c.likes.indexOf(t) === -1);
      const avg = g => g.reduce((s, c) => s + (freq[c.id] || 0), 0) / g.length;
      out[t] = { like: avg(likers), no: avg(unliked) };
    }
    return out;
  })()`);
  const ac2bad = Object.keys(ac2ratios).filter(t => !(ac2ratios[t].no > 0 && ac2ratios[t].like >= 2 * ac2ratios[t].no));
  check('for each treat the average frequency of likers is at least 2x non-likers (AC2)',
    ac2bad.length === 0,
    ac2bad.map(t => `${t}=${(ac2ratios[t].like / ac2ratios[t].no).toFixed(2)}x`).join(' ')
      || Object.keys(ac2ratios).map(t => `${t}=${(ac2ratios[t].like / ac2ratios[t].no).toFixed(2)}x`).join(' '));

  /* AC3: never null across treat x night x platesFilled x occupied, including
     the pathological sets where every structurally eligible cat is occupied
     (the fallback must still produce a cat). */
  const ac3bad = await h.evalv(`(() => {
    const hk = window.__catForest;
    const treats = ${JSON.stringify(EXPECTED_TREAT_IDS)};
    const occSets = [
      [],
      ['maca'],
      ['maca', 'puhko', 'mica', 'sef', 'cveta', 'tigar', 'tacka'],
      ${JSON.stringify(EXPECTED_CAT_IDS)}
    ];
    const bad = [];
    for (const t of treats) {
      for (const night of [false, true]) {
        for (let pf = 0; pf <= 3; pf++) {
          for (const occ of occSets) {
            const ids = hk.pick(t, night, pf, 30, occ, null);
            if (ids.length !== 30 || ids.some(x => !x || typeof x !== 'string'))
              bad.push(t + '/' + night + '/' + pf + '/' + occ.length);
          }
        }
      }
    }
    return bad;
  })()`);
  check('pick never returns null/undefined across every treat x night x plates x occupied (AC3)',
    Array.isArray(ac3bad) && ac3bad.length === 0,
    Array.isArray(ac3bad) ? (ac3bad.slice(0, 4).join(' | ') || 'clean') : JSON.stringify(ac3bad));

  /* AC4: an occupied cat is never returned (in sets that leave an eligible cat
     free) and halving the last visitor's weight lowers its frequency. */
  const ac4 = await h.evalv(`(() => {
    const hk = window.__catForest;
    const count = (arr, id) => arr.filter(x => x === id).length;
    hk.seed(3); const base = hk.pick('fish', false, 0, 2000, [], null);
    hk.seed(3); const occ = hk.pick('fish', false, 0, 2000, ['maca'], null);
    hk.seed(3); const rep = hk.pick('fish', false, 0, 2000, [], 'maca');
    if (occ.indexOf('maca') !== -1) return { bad: true };
    return { baseMaca: count(base, 'maca'), occMaca: count(occ, 'maca'), repMaca: count(rep, 'maca') };
  })()`);
  check('an occupied cat is never returned and the last visitor repeats less often (AC4)',
    !ac4.bad && ac4.occMaca === 0 && ac4.repMaca < ac4.baseMaca,
    `base=${ac4.baseMaca} occupied=${ac4.occMaca} repeat=${ac4.repMaca}`);

  /* RNG path: pickCat must consume exactly one draw per pick. After seed(5),
     three picks followed by rand(1) must equal seed(5) + rand(3) + rand(1). */
  const rngPath = await h.evalv(`(() => {
    const hk = window.__catForest;
    hk.seed(5); hk.pick('fish', false, 0, 3); const a = hk.rand(1)[0];
    hk.seed(5); hk.rand(3); const b = hk.rand(1)[0];
    return { a: a, b: b, same: a === b };
  })()`);
  check('pickCat consumes exactly one engine RNG draw per pick (no hidden randomness)',
    rngPath.same === true, `after3picks=${rngPath.a} after3rand=${rngPath.b}`);

  /* ---- CF-07: cat actor lifecycle (TP §3.6) ------------------------------
     A visit is driven only by the game clock, so each scenario gets a fresh
     page (there is no reset() until CF-14) and every count stays exact. */
  const bootFresh = async (tag, width, height) => {
    const hh = await start({ page: '/pages/cat_forest.html', tag, width: width || 1024, height: height || 800 });
    await bootedOn(hh);
    await hh.evalv(STUB);
    await hh.evalv(`window.__catForest.pause(true)`);
    return hh;
  };

  /* AC1: place a treat; once the arrival wait elapses exactly one cat exists,
     still walking in, and its plate is occupied. */
  const h7 = await bootFresh('cf07-lifecycle');
  const a1 = await h7.evalv(`(() => {
    const hk = window.__catForest; hk.seed(11);
    hk.place('fish', 0);
    hk.step(hk.state().config.ARRIVE_MAX + 100);
    const s = hk.state();
    return { n: s.cats.length, phase: s.cats[0] && s.cats[0].phase, plate: s.plates[0].state };
  })()`);
  check('the arrival wait passes and exactly one cat is entering with its plate occupied (AC1)',
    a1.n === 1 && a1.phase === 'entering' && a1.plate === 'occupied', JSON.stringify(a1));

  /* AC2: the whole visit runs in order and the node is removed at the end.
     Phases are sampled every sub-step so no transition can hide between steps. */
  const a2 = await h7.evalv(`(() => {
    const hk = window.__catForest;
    const seen = [];
    const push = ph => { if (seen[seen.length - 1] !== ph) seen.push(ph); };
    const c0 = hk.state().cats[0]; if (c0) push(c0.phase);
    for (let i = 0; i < 2000; i++) {
      hk.step(50);
      const c = hk.state().cats[0];
      if (!c) { push('gone'); break; }
      push(c.phase);
    }
    return { seen: seen, nodes: document.querySelectorAll('#cf-cats .cf-cat').length };
  })()`);
  check('the visit runs entering → sitting → eating → leaving → gone and the node is removed (AC2)',
    JSON.stringify(a2.seen) === JSON.stringify(['entering', 'sitting', 'eating', 'leaving', 'gone'])
      && a2.nodes === 0, JSON.stringify(a2));

  /* AC3: at the end of eating the plate frees immediately and accepts a new treat. */
  const a3 = await h7.evalv(`(() => {
    const hk = window.__catForest;
    const before = hk.state().plates[0].state;
    const placed = hk.place('milk', 0);
    const s = hk.state().plates[0];
    return { before: before, placed: placed, state: s.state, treat: s.treat };
  })()`);
  check('after eating the plate is empty and a fresh treat can be placed (AC3)',
    a3.before === 'empty' && a3.placed === true && a3.state === 'treat' && a3.treat === 'milk',
    JSON.stringify(a3));

  /* AC6: met cats are recorded once, on the first sit, and only known ids. */
  const a6 = await h7.evalv(`(() => {
    const hk = window.__catForest;
    hk.seed(5);
    const treats = ['fish', 'milk', 'chicken', 'sushi', 'cookie'];
    for (let r = 0; r < 6; r++) {
      const st = hk.state();
      for (const p of st.plates) if (p.state === 'empty') hk.place(treats[r % 5], p.idx);
      for (let i = 0; i < 300; i++) hk.step(50);
    }
    const met = hk.state().met;
    const valid = ${JSON.stringify(EXPECTED_CAT_IDS)};
    return { met: met, unique: met.length === new Set(met).size,
      known: met.every(id => valid.includes(id)), n: met.length };
  })()`);
  check('state.met records each met cat id exactly once (AC6)',
    a6.unique && a6.known && a6.n >= 1, JSON.stringify(a6));

  /* AC4: fuzz — 30 reseeds of random placements; the caps hold every step. */
  const h4 = await bootFresh('cf07-fuzz');
  const a4 = await h4.evalv(`(() => {
    const hk = window.__catForest;
    const treats = ['fish', 'milk', 'chicken', 'sushi', 'cookie'];
    const rand = () => hk.rand(1)[0];
    let maxCats = 0; const dups = [];
    for (let seedN = 1; seedN <= 30; seedN++) {
      hk.seed(seedN);
      for (let k = 0; k < 8; k++) {
        const empty = hk.state().plates.filter(p => p.state === 'empty');
        if (empty.length) {
          const pi = empty[Math.floor(rand() * empty.length)].idx;
          hk.place(treats[Math.floor(rand() * treats.length)], pi);
        }
        hk.step(Math.floor(rand() * 4000) + 50);
        const s = hk.state();
        if (s.cats.length > maxCats) maxCats = s.cats.length;
        const ids = s.cats.map(c => c.id);
        if (new Set(ids).size !== ids.length) dups.push(seedN + ':' + ids.join(','));
      }
    }
    return { maxCats: maxCats, dups: dups };
  })()`);
  check('fuzz (30 seeds × random placements): never more than 3 cats, never a duplicate id (AC4)',
    a4.maxCats <= 3 && a4.dups.length === 0, `maxCats=${a4.maxCats} dups=${a4.dups.join(' | ') || '0'}`);

  /* AC5: a sitting cat stays inside the viewport and never covers the tray or
     toggles. forceCat bypasses the picker so all three plates are covered. */
  const catGeometry = hh => hh.evalv(`(() => {
    const hk = window.__catForest;
    hk.seed(3);
    ['maca', 'puhko', 'mica'].forEach((id, p) => hk.forceCat(id, p));
    hk.step(hk.state().config.ENTER_MAX + 100);
    const boxes = [...document.querySelectorAll('#cf-cats .cf-cat')].map(el => {
      const r = el.getBoundingClientRect();
      return { l: r.left, t: r.top, r: r.right, b: r.bottom };
    });
    const pt = sel => { const r = document.querySelector(sel).getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; };
    const coversCat = p => { const el = document.elementFromPoint(p.x, p.y); return !!(el && el.closest('.cf-cat')); };
    const toggles = ['#cf-daynight', '#cf-rain-btn'].map(pt);
    return {
      n: boxes.length,
      inside: boxes.every(b => b.l >= -1 && b.t >= -1 && b.r <= innerWidth + 1 && b.b <= innerHeight + 1),
      sitting: hk.state().cats.every(c => c.phase === 'sitting' || c.phase === 'eating'),
      trayCovered: coversCat(pt('#cf-tray')),
      toggleCovered: toggles.some(coversCat)
    };
  })()`);
  for (const vp of [{ name: '1024x800 tablet', width: 1024, height: 800 },
    { name: '844x390 short landscape', width: 844, height: 390 }]) {
    const hv = await bootFresh(`cf07-geom-${vp.width}`, vp.width, vp.height);
    const g = await catGeometry(hv);
    check(`${vp.name}: a sitting cat stays on-screen and never covers the tray or toggles (AC5)`,
      g.n === 3 && g.inside && g.sitting && !g.trayCovered && !g.toggleCovered, JSON.stringify(g));
    await hv.close();
  }

  /* AC7: no timer machinery — the whole lifecycle is the game clock. */
  const timerHits = ['setInterval(', 'setTimeout('].filter(s => engineSrc.includes(s));
  check('the engine schedules no timers (AC7: no setInterval / per-cat timers)',
    timerHits.length === 0, timerHits.join(', ') || 'none');

  await h7.close();
  await h4.close();

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
