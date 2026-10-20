/* Мачја шума (Cat Forest) smoke — CF-02 skeleton + CF-03 static stage (tasks 263, 264).
   Drives pages/cat_forest.html headlessly and pins the CF-01 wiring contract:
   boot + test hook, the route contract, the back control's reachability (inside
   the viewport AND hit-testable, never a bare .click()), the hub tile, and the
   no-network static rule (TD §8 / TP §3.1). CF-03 adds the three-viewport stage
   geometry of TP §3.2; CF-06 adds the roster + weighted-picker checks of TP §3.5;
   CF-07 adds the cat actor lifecycle (spawn/enter/sit/eat/leave) of TP §3.6.
   CF-08 adds gifts and the growing forest of TP §3.7.
   CF-09 adds the cuddle tap of TP §3.8.
   CF-10 adds the special rules (first-visit nicety, previewPick, setTime) and
   the idle hint of TP §3.9.
   CF-11 adds the ☀️/🌙 toggle of TP §3.10 (day half).
   Gameplay assertions arrive with the engine — this file grows card by card (TP §3).
   Run:  node tools/cat_forest_smoke.js     (from the repo root or anywhere)
   Requires Node >= 22. CHROME_PATH env optional. */
const { start, check, skip, getFails } = require('./headless.js');
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
      decor: ['.cf-sky', '#cf-scenery', '#cf-decor', '#cf-sky-night', '#cf-night-tint', '#cf-stars', '#cf-rain'].map(s => {
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
  /* CodeQL js/bad-code-sanitization (code-scanning alert #11 / issue #7):
     JSON.stringify alone still lets <, >, / and U+2028/U+2029 reach generated
     code — the query's own documented fix is a post-stringify escape, and any
     String.replace after the stringify acts as its barrier. Stringify already
     escapes quotes, backslashes and control chars, so this only maps the four
     HTML/script-breakout characters to their escape FORM (same character when
     parsed — selectors keep their exact meaning). */
  const codeArg = v => JSON.stringify(String(v)).replace(
    /[<>/\u2028\u2029]/g,
    c => ({ '<': '\\u003C', '>': '\\u003E', '/': '\\u002F', '\u2028': '\\u2028', '\u2029': '\\u2029' }[c]));
  const clickSel = async sel => h.evalv(
    `(() => { const el = document.querySelector(${codeArg(sel)}); if (!el) return false; el.click(); return true; })()`);
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

  /* The comparator keeps everything placement determines. `idle.sinceMs` is
     zeroed like CF-09's clock: it counts real milliseconds that raced between
     boot and pause() on two independent pages (CF-10 made it live), not
     anything placement touches — hints/firstDone stay in the compare. */
  const pick = s => JSON.stringify({ plates: s.plates, sel: s.selectedTreat, cats: s.cats, gifts: s.gifts,
    decor: s.decor, met: s.met, idle: { sinceMs: 0, hints: s.idle.hints, firstDone: s.idle.firstDone },
    timers: s.timers, time: s.time, weather: s.weather });
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

  /* ---- CF-08: gifts and the growing forest (TP §3.7) ---------------------
     A finished visit leaves a gift on the freed plate; tapping it flies to the
     next decor slot and becomes scenery. Each scenario is one fresh page.
     Headless Chrome defaults prefers-reduced-motion to reduce, so the mode is
     pinned explicitly and the page is reloaded for the engine to read it. */
  const bootEmulated = async (tag, width, height, value) => {
    const hh = await start({ page: '/pages/cat_forest.html', tag, width: width || 1024, height: height || 800 });
    await hh.c.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value }] });
    await hh.navigate(`http://127.0.0.1:${hh.port}/pages/cat_forest.html`);
    await bootedOn(hh);
    await hh.evalv(STUB);
    await hh.evalv(`window.__catForest.pause(true)`);
    return hh;
  };

  const h8 = await bootEmulated('cf08-gifts', 1024, 800, 'no-preference');

  const b1 = await h8.evalv(`(() => {
    const hk = window.__catForest; hk.seed(21);
    hk.place('fish', 0);
    for (let i = 0; i < 400 && hk.state().cats.length === 0; i++) hk.step(50);
    for (let i = 0; i < 2000 && hk.state().cats.length; i++) hk.step(50);
    const s = hk.state();
    const g = document.querySelector('#cf-gifts .cf-gift');
    const pr = document.querySelector('.cf-plate[data-plate="0"]').getBoundingClientRect();
    if (!g) return { gifts: s.gifts.length, node: false };
    const r = g.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const hit = document.elementFromPoint(cx, cy);
    return { gifts: s.gifts.length, node: true, hit: !!(hit && (hit === g || g.contains(hit))),
      dx: Math.round(Math.abs(cx - (pr.left + pr.width / 2))), dy: Math.round(Math.abs(cy - (pr.top + pr.height / 2))),
      w: Math.round(r.width), h: Math.round(r.height) };
  })()`);
  check('after a visit one gift exists at the plate position and is hit-testable (AC1)',
    b1.gifts === 1 && b1.node && b1.hit && b1.dx < 8 && b1.dy < 40 && Math.min(b1.w, b1.h) >= 72,
    JSON.stringify(b1));

  const b2 = await h8.evalv(`(() => {
    const hk = window.__catForest;
    const before = hk.state().decor.length;
    const g = document.querySelector('#cf-gifts .cf-gift');
    if (g) g.click();
    const removed = hk.state().gifts.length;
    hk.step(50); // one render so the flight node exists
    const flying = document.querySelectorAll('#cf-fx .cf-fly').length;
    hk.step(hk.state().config.GIFT_FLY_MS + 200);
    const s = hk.state();
    return { before: before, removed: removed, after: s.decor.length, gifts: s.gifts.length,
      flying: flying, fly: document.querySelectorAll('#cf-fx .cf-fly').length,
      nodes: document.querySelectorAll('#cf-decor .cf-decor-item').length };
  })()`);
  check('tapping the gift removes it, it flies, and the forest grows by one decoration (AC2)',
    b2.removed === 0 && b2.flying === 1 && b2.after === b2.before + 1 && b2.gifts === 0
      && b2.fly === 0 && b2.nodes === b2.after, JSON.stringify(b2));

  /* A visit is driven only by the game clock; collecting taps the real button. */
  const VISIT = `const treats = ['fish','milk','chicken','sushi','cookie'];
    const visit = () => {
      const empty = hk.state().plates.filter(p => p.state === 'empty');
      const pi = empty.length ? empty[0].idx : 0;
      hk.place(treats[pi % 5], pi);
      for (let i = 0; i < 400 && hk.state().cats.length === 0; i++) hk.step(50);
      for (let i = 0; i < 4000 && hk.state().cats.length; i++) hk.step(50);
    };
    const collectFirst = () => {
      const g = document.querySelector('#cf-gifts .cf-gift');
      if (g) { g.click(); hk.step(hk.state().config.GIFT_FLY_MS + 200); }
    };`;

  /* AC3: six visits without collecting — the uncollected cap auto-collects the
     oldest so the child is never blocked. */
  const b3 = await bootFresh('cf08-cap');
  const c3 = await b3.evalv(`(() => { const hk = window.__catForest; hk.seed(31);
    ${VISIT}
    const counts = [];
    for (let n = 0; n < 6; n++) { visit(); counts.push(hk.state().gifts.length); }
    hk.step(700);
    return { counts: counts, gifts: hk.state().gifts.length,
      nodes: document.querySelectorAll('#cf-gifts .cf-gift').length, decor: hk.state().decor.length };
  })()`);
  check('six visits leave at most five uncollected gifts — the oldest auto-collects (AC3)',
    c3.counts.every(c => c <= 5) && c3.gifts === 5 && c3.nodes === c3.gifts && c3.decor >= 1,
    JSON.stringify(c3));

  /* AC4: the decor cap means the forest never fills up, and the shuffled slots
     stay distinct while it grows. */
  const b4 = await bootFresh('cf08-decor');
  const c4 = await b4.evalv(`(() => { const hk = window.__catForest; hk.seed(41);
    ${VISIT}
    const marks = [];
    for (let n = 0; n < 16; n++) { visit(); collectFirst(); marks.push(hk.state().decor.length); }
    return { marks: marks, decor: hk.state().decor.length,
      nodes: document.querySelectorAll('#cf-decor .cf-decor-item').length,
      slots: hk.state().decor.map(d => d.s) };
  })()`);
  check('with 14 decorations, collecting one more keeps 14 (AC4)',
    c4.decor === 14 && c4.nodes === 14 && c4.marks.indexOf(15) === -1
      && new Set(c4.slots).size === c4.slots.length,
    JSON.stringify({ decor: c4.decor, nodes: c4.nodes, saw15: c4.marks.indexOf(15) !== -1 }));

  /* AC5: with a full forest the decorations never block a control (they are
     aria-hidden and pointer-events:none). */
  for (const vp of [{ name: '1024x800 tablet', width: 1024, height: 800 },
    { name: '844x390 short landscape', width: 844, height: 390 }]) {
    const hv = await bootFresh(`cf08-geom-${vp.width}`, vp.width, vp.height);
    const seeded = await hv.evalv(`(() => { const hk = window.__catForest; hk.seed(51);
      ${VISIT}
      for (let n = 0; n < 15; n++) { visit(); collectFirst(); }
      return hk.state().decor.length; })()`);
    const m = await stageGeometry(hv);
    check(`${vp.name}: with 14 decorations every treat, plate and toggle is still hit-testable (AC5)`,
      seeded === 14 && [...m.treats, ...m.plates, ...m.toggles].every(b => b.inside && b.hit),
      `decor=${seeded} ` + JSON.stringify([...m.treats, ...m.plates, ...m.toggles]));
    await hv.close();
  }

  /* Reduced motion (CF-08 step 5): no flight — the gift is collected and the
     decoration appears at once, and no fly node is ever created. */
  const h8r = await bootEmulated('cf08-reduce', 1024, 800, 'reduce');
  const r5 = await h8r.evalv(`(() => { const hk = window.__catForest; hk.seed(61);
    ${VISIT}
    visit();
    const before = hk.state().decor.length;
    collectFirst();
    hk.step(50);
    return { before: before, decor: hk.state().decor.length,
      gifts: hk.state().gifts.length, flying: document.querySelectorAll('#cf-fx .cf-fly').length };
  })()`);
  check('under reduced motion the gift is collected with no flight (CF-08 step 5)',
    r5.decor === r5.before + 1 && r5.gifts === 0 && r5.flying === 0, JSON.stringify(r5));
  await h8r.close();

  /* AC6: no counter ever reaches the child — the DOM text stays digit-free. */
  const c6 = await h8.evalv(`document.body.innerText.trim()`);
  check('no number, score or counter reaches the child (AC6: body.innerText has no digits)',
    c6 === '' || !/\d/.test(c6), JSON.stringify(c6));

  await b3.close();
  await b4.close();
  await h8.close();

  /* ---- CF-09: cuddle tap (TP §3.8) --------------------------------------
     Tapping any visible cat is joyful and always safe: hearts, a throttled
     meow and the spoken name, with every field of state() left untouched.
     Headless Chrome runs with prefers-reduced-motion: reduce by default, so
     each mode gets an explicitly emulated page (the engine reads the
     preference at load). Every scenario is a fresh page: no reset() yet. */
  const h9 = await bootEmulated('cf09-cuddle', 1024, 800, 'no-preference');

  /* AC1 + AC4: hearts exist and the snapshot is byte-identical (only `clock`
     is zeroed for the compare). The tap sits between two snapshot reads, so
     nothing it changes can hide inside a step; innerText stays empty because
     the hearts are CSS content. */
  const d1 = await h9.evalv(`(() => {
    const hk = window.__catForest; hk.seed(71);
    hk.forceCat('maca', 1);
    hk.step(200);
    const zero = s => { const c = JSON.parse(JSON.stringify(s)); c.clock = 0; return JSON.stringify(c); };
    const before = zero(hk.state());
    const timersBefore = JSON.stringify(hk.state().timers);
    document.querySelector('#cf-cats .cf-cat').click();
    const hearts = [...document.querySelectorAll('#cf-fx .cf-party')]
      .filter(el => el.getAttribute('data-e') === '❤️').length;
    return { hearts: hearts, same: zero(hk.state()) === before,
      timers: JSON.stringify(hk.state().timers) === timersBefore,
      text: document.body.innerText.trim() };
  })()`);
  check('tapping a cat shows hearts and leaves every state() field identical (AC1)',
    d1.hearts === 3 && d1.same && d1.timers, JSON.stringify(d1));
  check('a cuddle adds no visible text (AC4)', d1.text === '', JSON.stringify(d1.text));

  /* AC2: the speech throttle runs on the game clock (SPEECH_GAP_MS), so step()
     drives it exactly: two taps inside the gap coalesce, 1600 ms apart both
     speak. Deltas of the STUB's __spoke counter keep the accounting local, and
     the stamp left by the AC1 tap is cleared with one gap step first. */
  const d2 = await h9.evalv(`(() => {
    const hk = window.__catForest;
    const gap = hk.state().config.SPEECH_GAP_MS;
    const spoke = () => window.__spoke || 0;
    const tap = () => document.querySelector('#cf-cats .cf-cat').click();
    hk.step(gap + 100);        // clear the stamp the AC1 tap left behind
    const a0 = spoke(); tap(); // speaks (stamp = clock now)
    hk.step(1000); tap();      // inside SPEECH_GAP -> coalesced
    const first = spoke() - a0;
    hk.step(600);              // 1600 ms past the stamp
    const b0 = spoke(); tap(); // speaks again
    hk.step(1600); tap();      // 1600 ms apart -> speaks
    const second = spoke() - b0;
    return { first: first, second: second,
      phase: hk.state().cats[0] && hk.state().cats[0].phase };
  })()`);
  check('speech throttle: two taps in 1000 ms speak once, 1600 ms apart speak twice (AC2)',
    d2.first === 1 && d2.second === 2, JSON.stringify(d2));

  /* AC3: the tap works in entering and in leaving. Entering is hit-tested at
     the cat's centre first (a .click() alone would prove nothing a child can
     reach — task 120); at ~80% of the walk the cat is well inside the stage.
     The leaving phase is walked to with small steps so the phase cannot be
     overshot into `gone`, and only .click() is used there: by CF-08 design the
     gift sits at that cat's plate above the cats layer, so it wins the centre
     point at some viewports while the child taps the visible cat around it. */
  const h9b = await bootFresh('cf09-phases');
  const d3 = await h9b.evalv(`(() => {
    const hk = window.__catForest; hk.seed(73);
    const party = e => [...document.querySelectorAll('#cf-fx .cf-party')]
      .filter(el => el.getAttribute('data-e') === e);
    const cat = () => document.querySelector('#cf-cats .cf-cat');
    hk.forceCat('puhko', 0);
    let g = 0;
    while (g++ < 200 && hk.state().cats[0] && hk.state().cats[0].phase === 'entering'
      && hk.state().cats[0].t < hk.state().cats[0].dur * 0.8) hk.step(50);
    const r = cat().getBoundingClientRect();
    const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    const enterHit = !!(hit && (hit === cat() || cat().contains(hit)));
    const enterPhase = hk.state().cats[0] && hk.state().cats[0].phase;
    cat().click();
    const enterHearts = party('❤️').length;
    let w = 0;
    while (w++ < 600 && hk.state().cats[0] && hk.state().cats[0].phase !== 'leaving') hk.step(50);
    const leavePhase = hk.state().cats[0] && hk.state().cats[0].phase;
    cat().click();
    const leaveHearts = party('❤️').length;
    return { enterHit: enterHit, enterPhase: enterPhase, enterHearts: enterHearts,
      leavePhase: leavePhase, leaveHearts: leaveHearts };
  })()`);
  check('a tap works while the cat is entering and while it is leaving (AC3)',
    d3.enterHit && d3.enterPhase === 'entering' && d3.enterHearts >= 1
      && d3.leavePhase === 'leaving' && d3.leaveHearts >= 1, JSON.stringify(d3));
  await h9b.close();

  /* CF-09 step 6 (reduced motion): a single static ❤️ that only fades — its
     box never moves while the inline opacity drops over the particle's life.
     Step 5 rides along on the same page: the cat's first sit bursts exactly
     FX_BURST (3) sparkles around it, and they are the only live particles by
     then (the hearts expired during the walk to sitting). */
  const h9r = await bootEmulated('cf09-reduce', 1024, 800, 'reduce');
  const r9 = await h9r.evalv(`(() => {
    const hk = window.__catForest; hk.seed(75);
    const party = e => [...document.querySelectorAll('#cf-fx .cf-party')]
      .filter(el => el.getAttribute('data-e') === e);
    hk.forceCat('cveta', 2);
    hk.step(150);
    document.querySelector('#cf-cats .cf-cat').click();
    const hearts = party('❤️');
    const el = hearts[0];
    const box0 = el ? el.getBoundingClientRect() : null;
    const op0 = el ? parseFloat(el.style.opacity) : NaN;
    const n0 = hearts.length;
    hk.step(300);
    const box1 = el ? el.getBoundingClientRect() : null;
    const op1 = el ? parseFloat(el.style.opacity) : NaN;
    let g = 0;
    while (g++ < 200 && hk.state().cats[0] && hk.state().cats[0].phase !== 'sitting') hk.step(50);
    return { n0: n0, faded: op1 < op0,
      moved: !!(box0 && box1 && (Math.abs(box0.left - box1.left) > 0.5
        || Math.abs(box0.top - box1.top) > 0.5)),
      spark: party('✨').length,
      phase: hk.state().cats[0] && hk.state().cats[0].phase };
  })()`);
  check('under reduced motion a single static ❤️ appears and only fades (step 6)',
    r9.n0 === 1 && !r9.moved && r9.faded, JSON.stringify(r9));
  check('a cat\'s first sit bursts three sparkles around it (step 5)',
    r9.spark === 3 && r9.phase === 'sitting', JSON.stringify(r9));
  await h9r.close();
  await h9.close();

  /* ---- CF-10: special rules + the idle hint (TP §3.9) --------------------
      previewPick must be the spawn path's exact mirror (same pickArgs), the
      first-visit nicety must warm only the opening visit of a session, and the
      idle hint is quiet guidance: suppressed while anything is out, capped at
      HINT_REPEAT_MAX, restarted by a real pointer interaction. Each scenario
      is a fresh paused page (no reset() until CF-14). A real pointerdown
      (not .click()) is what resets the idle windows — the engine listens for
      pointerdown exactly as TD §7 specifies. */
  const pointerDown = hh => hh.evalv(`(() => {
    document.getElementById('app').dispatchEvent(new Event('pointerdown')); return true; })()`);

  /* AC1: with two plates filled previewPick never offers Краљ (needs all three
      non-empty); with three filled and seed(3) he appears. One real visit runs
      first so the first-visit nicety (which excludes weight-0.4 Краљ) is out of
      the way — seed(3) is taken before that visit so the whole scenario stays
      reproducible (seed() clears the session pick history by design). */
  const h10 = await bootFresh('cf10-preview');
  const f1 = await h10.evalv(`(() => {
    const hk = window.__catForest; hk.seed(3);
    hk.forceCat('maca', 0);                       // a real visit: visitsThisSession -> 1
    for (let i = 0; i < 800 && hk.state().cats.length; i++) hk.step(50);
    hk.place('fish', 1); hk.place('milk', 2);     // two plates non-empty
    const filled2 = hk.state().plates.map(p => p.state);
    const two = hk.previewPick(1, 300);
    hk.place('chicken', 0);                       // all three non-empty
    const three = hk.previewPick(0, 300);
    return { twoKralj: two.filter(x => x === 'kralj').length,
      threeKralj: three.filter(x => x === 'kralj').length,
      filled2: filled2 };
  })()`);
  check('2 filled plates: 300 previewPick draws never contain Краљ (AC1)',
    f1.filled2.filter(s => s !== 'empty').length === 2 && f1.twoKralj === 0, JSON.stringify(f1));
  check('3 filled plates, seed(3): Краљ appears in the preview draws (AC1)',
    f1.threeKralj >= 1, `kralj=${f1.threeKralj}`);
  await h10.close();

  /* AC2: night-only cats are structurally impossible at day and possible at
      night — previewPick observes state.time, so setTime('night') (the hook
      CF-11's button will call) is enough. No reseed after the visit: seed()
      would re-arm the first-visit nicety, which excludes weight-0.7 Звездица.
      setTime also refuses anything but day/night without touching state. */
  const h10b = await bootFresh('cf10-time');
  const f2 = await h10b.evalv(`(() => {
    const hk = window.__catForest; hk.seed(13);
    hk.forceCat('puhko', 1);
    for (let i = 0; i < 800 && hk.state().cats.length; i++) hk.step(50);
    hk.place('fish', 0);                           // visitsThisSession is 1: no nicety
    const day = hk.previewPick(0, 300);
    const badReject = hk.setTime('evening');       // only day|night is accepted
    const timeAfterBad = hk.state().time;
    hk.setTime('night');
    const night = hk.previewPick(0, 300);
    return { daySenka: day.filter(x => x === 'senka' || x === 'zvezda').length,
      nightSenka: night.filter(x => x === 'senka').length,
      nightZvezda: night.filter(x => x === 'zvezda').length,
      badReject: badReject, timeAfterBad: timeAfterBad, time: hk.state().time };
  })()`);
  check('day previews never contain the night-only cats (AC2)',
    f2.daySenka === 0, `day=${f2.daySenka}`);
  check('after setTime("night") both night-only cats appear in the previews (AC2)',
    f2.nightSenka >= 1 && f2.nightZvezda >= 1,
    `senka=${f2.nightSenka} zvezda=${f2.nightZvezda}`);
  check('setTime refuses anything but day/night and leaves state untouched (hook guard)',
    f2.badReject === false && f2.timeAfterBad === 'day' && f2.time === 'night', JSON.stringify(f2));
  await h10b.close();

  /* AC5: the very first spawned cat of a session is always a heavyweight
      (weight >= 1.0), over 30 reseeds — seed() clears visitsThisSession, so
      every iteration genuinely re-runs "the first visit" through the REAL
      spawn path (updateArrivals), not through a hook. Each iteration then
      waits out the whole visit so the plate is free for the next one. */
  const h10c = await bootFresh('cf10-first-visit');
  const f5 = await h10c.evalv(`(() => {
    const hk = window.__catForest;
    const weights = {};
    window.__catForest.data.cats.forEach(c => { weights[c.id] = c.weight; });
    const treats = ['fish', 'milk', 'chicken', 'sushi', 'cookie'];
    const firsts = [];
    for (let s = 1; s <= 30; s++) {
      hk.seed(s);
      hk.place(treats[s % 5], 0);
      let g = 0;
      while (g++ < 200 && hk.state().cats.length === 0) hk.step(50);  // the spawn
      const c = hk.state().cats[0];
      firsts.push(c ? c.id : null);
      let w = 0;
      while (w++ < 800 && hk.state().cats.length) hk.step(50);        // the visit ends
    }
    return { firsts: firsts, min: Math.min.apply(null, firsts.map(id => weights[id])) };
  })()`);
  check('over 30 seeds the very first spawned cat always has weight >= 1.0 (AC5)',
    f5.firsts.length === 30 && f5.firsts.every(Boolean) && f5.min >= 1.0,
    `min=${f5.min} firsts=${f5.firsts.join(',')}`);
  await h10c.close();

  /* AC3: the idle hint cycle, normalized by one real pointerdown at the start
      so the welcome branch cannot pre-fire during boot: every idle window
      shows the tray bounce, HINT_REPEAT_MAX (3) is the budget, and the next
      interaction restarts both. Each step lands the fresh hint inside its
      HINT_MS window (fires at exactly IDLE_HINT_MS, the step ends 100 ms
      later). */
  const h10d = await bootFresh('cf10-idle');
  const trayBounces = () => h10d.evalv(`document.getElementById('cf-tray').classList.contains('cf-hint')`);
  const idleNow = () => h10d.evalv(`window.__catForest.state().idle`);
  await pointerDown(h10d);
  await h10d.evalv(`window.__catForest.step(10100)`); // idle window 1
  const id1 = { on: await trayBounces(), idle: await idleNow() };
  await h10d.evalv(`window.__catForest.step(10100)`); // idle window 2
  const id2 = { on: await trayBounces(), idle: await idleNow() };
  await h10d.evalv(`window.__catForest.step(10100)`); // idle window 3 (the budget)
  const id3 = { on: await trayBounces(), idle: await idleNow() };
  await h10d.evalv(`window.__catForest.step(20000)`); // well past any hint window
  const id4 = { on: await trayBounces(), idle: await idleNow() };
  await pointerDown(h10d);                             // an interaction restarts the cycle
  await h10d.evalv(`window.__catForest.step(10100)`);
  const id5 = { on: await trayBounces(), idle: await idleNow() };
  check('each idle window bounces the tray, three times, then stops (AC3)',
    id1.on && id1.idle.hints === 1 && id2.on && id2.idle.hints === 2
      && id3.on && id3.idle.hints === 3 && !id4.on && id4.idle.hints === 3,
    JSON.stringify([id1, id2, id3, id4]));
  check('the next interaction restarts the idle hint cycle (AC3)',
    id5.on && id5.idle.hints === 1 && id5.idle.sinceMs < 1000, JSON.stringify(id5));

  /* AC4 + the card's regression risk, as one invariant over a real visit:
     while ANY plate holds a treat or a cat is on stage the tray never bounces
     (sampled every sub-step), and once the forest is quiet the hint returns.
     40000 ms guarantees >= 15100 ms of quiet even if the visit's random
     durations all roll their maximum. */
  const f4 = await h10d.evalv(`(() => {
    const hk = window.__catForest;
    const tray = () => document.getElementById('cf-tray').classList.contains('cf-hint');
    hk.step(1300);          // let the AC3 cycle's last bounce expire before the visit
    hk.place('fish', 0);
    let hintedBusy = 0, hintedQuiet = 0;
    for (let i = 0; i < 800; i++) {
      hk.step(50);
      const s = hk.state();
      const busy = s.cats.length > 0 || s.plates.some(p => p.state !== 'empty');
      if (busy && tray()) hintedBusy++;
      if (!busy && tray()) hintedQuiet++;
    }
    return { hintedBusy: hintedBusy, hintedQuiet: hintedQuiet };
  })()`);
  check('a treat on a plate (or a cat on stage) suppresses the idle hint (AC4)',
    f4.hintedBusy === 0 && f4.hintedQuiet >= 1, JSON.stringify(f4));
  await h10d.close();

  /* CF-10 step 3's welcome half: one early hint at FIRST_HINT_MS if nothing
      was ever touched. The page is never poked, so if the harness booted it
      slowly enough that the real loop already fired the hint before pause(),
      the check is skipped honestly rather than guessed (a SKIP is not a PASS). */
  const h10w = await bootFresh('cf10-welcome');
  const pre = await h10w.evalv(`window.__catForest.state().idle`);
  if (pre && pre.firstDone) {
    skip('the welcome hint fires at FIRST_HINT_MS when nothing is touched',
      'the page ran unpaused past FIRST_HINT_MS before pause()');
  } else {
    await h10w.evalv(`window.__catForest.step(1600)`); // crosses FIRST_HINT_MS (1500)
    const w = await h10w.evalv(`(() => ({
      firstDone: window.__catForest.state().idle.firstDone,
      on: document.getElementById('cf-tray').classList.contains('cf-hint') }))()`);
    check('one welcome hint fires at FIRST_HINT_MS when nothing is touched',
      w.firstDone === true && w.on === true, JSON.stringify(w));
  }
  await h10w.close();

  /* CF-10 step 4: the spoken welcome prompt ships in the engine (speech is
      best-effort, so the runtime effect is not asserted — only the string is,
      as a static check, same family as the no-Date/no-timer greps). */
  check('the engine speaks the approved boot prompt «Нахрани мачиће!» (step 4)',
    engineSrc.includes('Нахрани мачиће!'));

  /* ---- CF-11: the ☀️/🌙 toggle (TP §3.10, day half) ----------------------
     The button drives the same setTime the hook exposes; the palette hangs off
     data-time in CSS as three opacity layers (gradients cannot transition), so
     their cross-fade runs on the WALL clock and gets a real sleep — the game
     clock stays paused throughout. The glyph is read from computed content,
     tolerant of how Chrome spells the emoji (literal or \hex escapes). */
  const dnClick = hh => hh.evalv(`(() => {
    document.getElementById('cf-daynight').click(); return true; })()`);
  const dnRead = async hh => JSON.parse(await hh.evalv(`JSON.stringify((() => {
    const b = document.getElementById('cf-daynight');
    return { time: window.__catForest.state().time,
      data: document.getElementById('app').getAttribute('data-time'),
      pressed: b.getAttribute('aria-pressed'),
      glyph: getComputedStyle(b, '::before').content };
  })())`));
  const glyphHas = (g, ch, hex) => g.indexOf(ch) !== -1 || g.indexOf(hex) !== -1;
  const nightLayers = hh => hh.evalv(`['cf-sky-night', 'cf-night-tint', 'cf-stars']
    .map(id => Number(getComputedStyle(document.getElementById(id)).opacity))`);

  const h11 = await bootFresh('cf11-toggle');
  await dnClick(h11);                       // day -> night
  const dnNight1 = await dnRead(h11);
  await sleep(700);                         // wall clock: let the 600 ms fade finish
  const dnNightL = await nightLayers(h11);
  await dnClick(h11);                       // night -> day
  const dnDay1 = await dnRead(h11);
  await sleep(700);
  const dnDayL = await nightLayers(h11);
  check('the toggle flips state.time, data-time, aria-pressed and the glyph, both ways (AC1)',
    dnNight1.time === 'night' && dnNight1.data === 'night' && dnNight1.pressed === 'true'
      && glyphHas(dnNight1.glyph, '🌙', '1f319')
      && dnDay1.time === 'day' && dnDay1.data === 'day' && dnDay1.pressed === 'false'
      && glyphHas(dnDay1.glyph, '☀', '2600'),
    JSON.stringify([dnNight1, dnDay1]));
  check('the night sky, the scenery tint and the stars fade in and out with the toggle (step 2)',
    dnNightL.every(o => o === 1) && dnDayL.every(o => o === 0),
    JSON.stringify({ night: dnNightL, day: dnDayL }));

  /* AC2: no surprising disappearances — a cat mid-walk is byte-identical
     across the flip and keeps progressing afterwards. */
  const f11c = await h11.evalv(`(() => {
    const hk = window.__catForest;
    hk.seed(31);
    hk.forceCat('maca', 0);
    hk.step(400);                                   // mid walk-in
    const before = JSON.stringify(hk.state().cats);
    const tBefore = hk.state().cats[0].t;
    document.getElementById('cf-daynight').click(); // -> night
    const afterFlip = JSON.stringify(hk.state().cats);
    hk.step(200);                                   // and the visit still moves on
    const c = hk.state().cats[0];
    return { same: before === afterFlip, n: hk.state().cats.length,
      id: c && c.id, advanced: !!c && c.t > tBefore };
  })()`);
  check('a cat on stage stays put and keeps walking when the time flips (AC2)',
    f11c.same && f11c.n === 1 && f11c.id === 'maca' && f11c.advanced, JSON.stringify(f11c));
  await h11.close();

  /* AC3: the BUTTON (not the hook) gates eligibility — 200 picks per state on
     one fresh page, past the first-visit nicety via a real visit, no reseed in
     between so the stream stays honest. */
  const h11b = await bootFresh('cf11-night-cats');
  const f11n = await h11b.evalv(`(() => {
    const hk = window.__catForest;
    hk.seed(21);
    hk.forceCat('puhko', 1);
    for (let i = 0; i < 800 && hk.state().cats.length; i++) hk.step(50);  // the visit ends
    hk.place('fish', 0);
    document.getElementById('cf-daynight').click();          // -> night
    const night = hk.previewPick(0, 200);
    document.getElementById('cf-daynight').click();          // -> day
    const day = hk.previewPick(0, 200);
    return { night: night.filter(x => x === 'senka' || x === 'zvezda'),
      day: day.filter(x => x === 'senka' || x === 'zvezda'),
      time: hk.state().time };
  })()`);
  check('the button flips to night: both night-only cats appear in 200 picks (AC3)',
    f11n.night.indexOf('senka') !== -1 && f11n.night.indexOf('zvezda') !== -1,
    JSON.stringify(f11n.night));
  check('back to day: no night-only cat in 200 picks (AC3)',
    f11n.day.length === 0 && f11n.time === 'day', JSON.stringify(f11n));
  await h11b.close();

  /* AC4 + the card's regression risk: at 844x390 the toggle must stay a real
     target in BOTH states — measured after the night layers have faded in, so
     a covering star/scenery layer would fail the hit test. */
  const h11s = await bootFresh('cf11-short', 844, 390);
  const dnGeo = async () => JSON.parse(await h11s.evalv(`JSON.stringify((() => {
    const el = document.getElementById('cf-daynight');
    const r = el.getBoundingClientRect();
    const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return { inside: r.top >= -1 && r.left >= -1 && r.bottom <= innerHeight + 1 && r.right <= innerWidth + 1,
      hit: !!(hit && (hit === el || el.contains(hit))), w: r.width, h: r.height };
  })())`));
  const dnDay = await dnGeo();
  await dnClick(h11s);
  await sleep(700);                       // the night layers are fully in now
  const dnNight = await dnGeo();
  check('at 844x390 the day/night toggle is >= 56px, inside and hit-testable in both states (AC4)',
    [dnDay, dnNight].every(x => x.inside && x.hit && Math.min(x.w, x.h) >= 56),
    JSON.stringify([dnDay, dnNight]));
  await h11s.close();

  /* Step 2's reduced-motion half: transition:none makes the switch instant,
     asserted on an explicitly emulated page. */
  const h11r = await bootEmulated('cf11-reduce', 1024, 800, 'reduce');
  await dnClick(h11r);
  const f11r = await h11r.evalv(`(() => {
    const css = id => getComputedStyle(document.getElementById(id));
    const ids = ['cf-sky-night', 'cf-night-tint', 'cf-stars'];
    return { o: ids.map(id => css(id).opacity),
      t: ids.map(id => parseFloat(css(id).transitionDuration)) };
  })()`);
  check('under reduced motion the night switch is instant (no transition) (step 2)',
    f11r.o.every(o => o === '1') && f11r.t.every(t => t < 0.001), JSON.stringify(f11r));
  await h11r.close();

  /* AC5: the time is the child's choice, never the wall clock (static, same
     family as the CF-04 clock grep). */
  /* ---- CF-12: rain toggle and reduced-motion gates (TP §3.10) -------------
     The 🌧️ switch flips state.weather / data-weather / aria-pressed and
     projects the drops layer. AC2 runs on BOTH halves: computed
     animation-name on pages where the media feature is EXPLICITLY emulated
     (bootEmulated sends Emulation.setEmulatedMedia over the exposed CDP
     session — headless.js itself carries no emulation call), plus a static
     audit of the page source, so an animation: that was never classified or a
     suppressed one that lost its override fails the run (the card's
     regression risk). AC3 keeps the clock walking cats under reduce; AC4
     measures the button with the rain sheet up — the worst case for the hit
     test. Every local is cf12-prefixed (per-section names, testing lesson). */
  const cf12State = async hh => JSON.parse(await hh.evalv(`JSON.stringify((() => {
    const s = window.__catForest.state();
    const b = document.getElementById('cf-rain-btn');
    return { w: s.weather,
      dw: document.getElementById('app').getAttribute('data-weather'),
      ap: b ? b.getAttribute('aria-pressed') : null,
      drops: document.querySelectorAll('#cf-rain i').length,
      cap: s.config ? s.config.RAIN_DROPS : 0,
      sw: typeof window.__catForest.setWeather === 'function' }; })())`));
  const cf12Tap = async hh => {
    await hh.evalv(`document.getElementById('cf-rain-btn').click()`);
    return cf12State(hh);
  };

  const cf12S0 = await cf12State(h);
  check('weather boots clear: state, data-weather and aria-pressed agree, zero drops, setWeather wired (AC1 + step 5)',
    cf12S0.w === 'clear' && cf12S0.dw === 'clear' && cf12S0.ap === 'false'
      && cf12S0.drops === 0 && cf12S0.sw, JSON.stringify(cf12S0));

  const cf12S1 = await cf12Tap(h);
  check('the rain toggle flips every view flag and builds exactly CF.RAIN_DROPS drops, <= 24 (AC1)',
    cf12S1.w === 'rain' && cf12S1.dw === 'rain' && cf12S1.ap === 'true'
      && cf12S1.drops > 0 && cf12S1.drops <= 24 && cf12S1.drops === cf12S1.cap,
    JSON.stringify(cf12S1));

  const cf12S2 = await cf12Tap(h);
  check('back to clear: the drops leave the DOM entirely (AC1)',
    cf12S2.w === 'clear' && cf12S2.dw === 'clear' && cf12S2.ap === 'false'
      && cf12S2.drops === 0, JSON.stringify(cf12S2));

  /* AC2 static half + the CF-12 audit, read from the live page source (the
     page is the spec here: classification lives with the animation). */
  const cf12Html = fs.readFileSync(path.join(root, 'game', 'pages', 'cat_forest.html'), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '');
  const cf12Rm = (cf12Html.match(/@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{[\s\S]*?\n\s*\}/) || [''])[0];
  const cf12Groups = cf12Rm.match(/[^{}]+\{[^{}]*\}/g) || [];
  const cf12Supp = ['.cf-treat.cf-bounce', '#cf-tray.cf-hint', '#cf-rain i'];
  const cf12Miss = cf12Supp.filter(s => !cf12Groups.some(g => g.includes(s) && /animation:\s*none/.test(g)));
  check('every suppressed animation keeps its override inside the reduce block (AC2 static)',
    cf12Rm !== '' && cf12Miss.length === 0, cf12Miss.join(', ') || cf12Supp.length + ' overridden');

  const cf12Kept = ['cf-gift-in', 'cf-decor-in'].map(n => {
    const m = cf12Html.match(new RegExp('@keyframes\\s+' + n + '\\s*\\{[^\\n]*'));
    return !!m && !/transform|scale|translate|filter|position|left:|top:|margin/.test(m[0]);
  });
  check('the two kept entrance fades stay opacity-only (their reduce exemption)',
    cf12Kept.every(Boolean), JSON.stringify(cf12Kept));

  const cf12Anim = [];
  for (const m of cf12Html.replace(cf12Rm, '').matchAll(/([^{}@]+)\{[^{}]*\banimation\s*:/g)) {
    const sel = m[1].split('\n').pop().trim();
    if (sel) cf12Anim.push(sel);
  }
  const cf12Known = ['.cf-gift', '.cf-decor-item', '.cf-treat.cf-bounce', '#cf-tray.cf-hint', '#cf-rain i'];
  const cf12Unknown = cf12Anim.filter(s => cf12Known.indexOf(s) === -1);
  check('every animation: selector on the page is classified by the audit (AC2)',
    cf12Anim.length >= 5 && cf12Unknown.length === 0,
    cf12Unknown.join(', ') || cf12Anim.length + ' classified: ' + cf12Anim.join(', '));

  /* AC2 computed half, on explicitly emulated pages: motion ALLOWED must
     actually move (otherwise "none" below would be vacuous). */
  const cf12Motion = async hh => JSON.parse(await hh.evalv(`JSON.stringify((() => {
    document.querySelector('.cf-treat').classList.add('cf-bounce');
    document.getElementById('cf-tray').classList.add('cf-hint');
    const bounce = getComputedStyle(document.querySelector('.cf-treat')).animationName;
    const hint = getComputedStyle(document.getElementById('cf-tray')).animationName;
    const ds = [...document.querySelectorAll('#cf-rain i')];
    if (!ds.length) return { n: 0, uniq: [], ty: 0, op: 0, bounce: bounce, hint: hint };
    const d0 = getComputedStyle(ds[0]);
    const names = ds.map(d => getComputedStyle(d).animationName);
    const m = d0.transform;
    return { n: ds.length,
      uniq: names.filter((v, i) => names.indexOf(v) === i),
      ty: m.indexOf('matrix') === 0 ? parseFloat(m.split(',').pop()) : 0,
      op: parseFloat(d0.opacity), bounce: bounce, hint: hint }; })())`));

  const cf12NoPref = await bootEmulated('cf12-motion', 1024, 800, 'no-preference');
  await cf12NoPref.evalv(`document.getElementById('cf-rain-btn').click()`);
  const cf12N = await cf12Motion(cf12NoPref);
  check('motion allowed: every drop runs cf-drop and the press/hint feedback animates (AC2)',
    cf12N.n > 0 && cf12N.uniq.length === 1 && cf12N.uniq[0] === 'cf-drop'
      && cf12N.bounce === 'cf-treat-bounce' && cf12N.hint === 'cf-tray-hint',
    JSON.stringify(cf12N));
  await cf12NoPref.close();

  const cf12Red = await bootEmulated('cf12-reduce', 1024, 800, 'reduce');
  await cf12Red.evalv(`document.getElementById('cf-rain-btn').click()`);
  const cf12R = await cf12Motion(cf12Red);
  check('reduced motion: the drops hang still, dimmed and motionless; shake/pulse off (AC2)',
    cf12R.n > 0 && cf12R.uniq.length === 1 && cf12R.uniq[0] === 'none'
      && cf12R.ty > 0 && cf12R.op > 0 && cf12R.op <= 0.45
      && cf12R.bounce === 'none' && cf12R.hint === 'none',
    JSON.stringify(cf12R));

  /* AC3: reduce must never freeze the world — step() still walks a cat in
     (CF-07/CF-08 spawn recipe: seed, place, step until a cat exists). */
  await cf12Red.evalv(`(() => { const hk = window.__catForest; hk.seed(21); hk.place('fish', 0); return true; })()`);
  let cf12Spawn = 0;
  while (cf12Spawn++ < 200 && await cf12Red.evalv(`window.__catForest.state().cats.length`) === 0) {
    await cf12Red.evalv(`window.__catForest.step(50)`);
  }
  const cf12W0 = await cf12Red.evalv(`(() => { const c = document.querySelector('.cf-cat');
    return c ? c.getBoundingClientRect().left : null; })()`);
  let cf12W = cf12W0;
  let cf12Walk = 0;
  while (cf12Walk++ < 60 && cf12W0 !== null && cf12W !== null && Math.abs(cf12W - cf12W0) <= 2) {
    await cf12Red.evalv(`window.__catForest.step(50)`);
    cf12W = await cf12Red.evalv(`(() => { const c = document.querySelector('.cf-cat');
      return c ? c.getBoundingClientRect().left : null; })()`);
  }
  const cf12WPhase = await cf12Red.evalv(`(() => { const c = window.__catForest.state().cats[0];
    return c ? c.phase : null; })()`);
  check('under reduced motion the clock still walks a cat (AC3)',
    cf12W0 !== null && cf12W !== null && Math.abs(cf12W - cf12W0) > 2 && cf12WPhase !== null,
    JSON.stringify({ x0: cf12W0, x1: cf12W, phase: cf12WPhase, steps: cf12Walk }));
  await cf12Red.close();

  /* AC4: with the rain sheet up (worst case for elementFromPoint) the switch
     must stay a real target at every card viewport — CF-11's geometry probe. */
  const cf12Geo = async hh => JSON.parse(await hh.evalv(`JSON.stringify((() => {
    const el = document.getElementById('cf-rain-btn');
    const r = el.getBoundingClientRect();
    const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return { w: r.width, h: r.height,
      inside: r.top >= -1 && r.left >= -1 && r.bottom <= innerHeight + 1 && r.right <= innerWidth + 1,
      hit: !!(hit && (hit === el || el.contains(hit))) }; })())`));
  for (const cf12Vp of [
    { tag: 'cf12-tab', w: 1024, h: 800 },
    { tag: 'cf12-short', w: 844, h: 390 },
    { tag: 'cf12-port', w: 390, h: 844 },
  ]) {
    const cf12H = await bootFresh(cf12Vp.tag, cf12Vp.w, cf12Vp.h);
    await cf12H.evalv(`document.getElementById('cf-rain-btn').click()`);
    const cf12G = await cf12Geo(cf12H);
    check(`rain up @${cf12Vp.w}x${cf12Vp.h}: the toggle stays >= 56px, inside and hittable (AC4)`,
      cf12G.w >= 56 && cf12G.h >= 56 && cf12G.inside && cf12G.hit, JSON.stringify(cf12G));
    await cf12H.close();
  }

  check('no code path reads the wall clock to decide the time (AC5)',
    !engineSrc.includes('Date.now(') && !engineSrc.includes('new Date('));

  /* ---- CF-13: drag-and-drop placement (D8) ------------------------------ */
  const cf13Sel = '#cf-tray .cf-treat[data-treat="fish"]';
  const cf13Fire = (hh, sel, type, x, y) => hh.evalv(`JSON.stringify((() => {
    const el = document.querySelector(${JSON.stringify(sel)});
    if (!el) return { err: 'missing treat' };
    el.dispatchEvent(new PointerEvent('${type}', { bubbles: true, cancelable: true,
      pointerId: 31, clientX: ${x}, clientY: ${y} }));
    return { dragging: el.classList.contains('cf-dragging'),
      ghosts: document.querySelectorAll('.cf-ghost').length,
      over: [].map.call(document.querySelectorAll('.cf-plate.cf-over'),
                        p => +p.getAttribute('data-plate')) }; })())`).then(JSON.parse);
  const cf13Geo = hh => hh.evalv(`JSON.stringify((() => {
    const t = document.querySelector(${JSON.stringify(cf13Sel)});
    const p = document.querySelectorAll('#cf-plates .cf-plate');
    const tr = t.getBoundingClientRect(), r0 = p[0].getBoundingClientRect();
    return { tx: tr.left + tr.width / 2, ty: tr.top + tr.height / 2,
      p0x: r0.left + r0.width / 2, p0y: r0.top + r0.height / 2,
      gx: 4, gy: 4 }; })())`).then(JSON.parse);
  const cf13Snap = hh => hh.evalv(`JSON.stringify((() => { const s = __catForest.state();
    return { plates: s.plates, selectedTreat: s.selectedTreat, idle: s.idle }; })())`);

  /* Static half (sorting's technique): the CSS that makes a finger drag
     possible must be there before any gesture runs. */
  const cf13Css = JSON.parse(await h.evalv(`JSON.stringify((() => {
    /* getComputedStyle is LIVE: every value must be read while the probe
       element is still attached, or it comes back empty after remove(). */
    const mk = c => { const d = document.createElement('div'); d.className = c;
      document.body.appendChild(d); const s = getComputedStyle(d);
      const out = { pos: s.position, pe: s.pointerEvents, tr: s.transform, op: s.opacity };
      d.remove(); return out; };
    const t = getComputedStyle(document.querySelector(${JSON.stringify(cf13Sel)}));
    return { ta: t.touchAction, g: mk('cf-treat cf-ghost'),
      o: mk('cf-plate cf-over'), d: mk('cf-treat cf-dragging') }; })())`));
  check('CF-13 static: .cf-treat declares touch-action:none so the browser cannot steal a finger drag',
    cf13Css.ta === 'none', `computed touch-action = ${cf13Css.ta} (must be 'none')`);
  check('CF-13 static: the ghost is a fixed, pointer-inert clone and the drag CSS exists (.cf-dragging dims, .cf-over lights the plate)',
    cf13Css.g.pos === 'fixed' && cf13Css.g.pe === 'none' &&
    parseFloat(cf13Css.d.op) < 1 && cf13Css.o.tr !== 'none', JSON.stringify(cf13Css));

  /* AC3 first: a gesture that never crosses CF.DRAG_START_PX is still a tap.
     Both comparison boots share one protocol — warm up the idle windows
     (any touch resets them, CF-10) and pause the clock — so every snapshot
     field below is comparable byte for byte. */
  const cf13Main = await bootFresh('cf13-main', 1024, 800);
  const cf13G = await cf13Geo(cf13Main);
  await cf13Main.evalv(`document.getElementById('app').dispatchEvent(new Event('pointerdown'));
    __catForest.pause(true); true`);
  await cf13Fire(cf13Main, cf13Sel, 'pointerdown', cf13G.tx, cf13G.ty);
  const cf13TapUp = await cf13Fire(cf13Main, cf13Sel, 'pointerup', cf13G.tx, cf13G.ty);
  await cf13Main.evalv(`document.querySelector(${JSON.stringify(cf13Sel)}).click(); true`);
  const cf13Sel1 = await cf13Main.evalv(`JSON.stringify(__catForest.state().selectedTreat)`);
  await cf13Main.evalv(`document.querySelector(${JSON.stringify(cf13Sel)}).click(); true`);
  const cf13Sel2 = await cf13Main.evalv(`JSON.stringify(__catForest.state().selectedTreat)`);
  check('CF-13 AC3: a plain tap below the drag threshold still toggles selection (no accidental drag)',
    cf13Sel1 === '"fish"' && cf13Sel2 === 'null' &&
    cf13TapUp.dragging === false && cf13TapUp.ghosts === 0, JSON.stringify({ cf13Sel1, cf13Sel2, cf13TapUp }));

  /* AC1: drag onto a free plate — mid-gesture the plate lights up, then the
     drop runs the very same place() a tap uses (same seed => same state). */
  await cf13Main.evalv(`__catForest.seed(7); true`);
  await cf13Fire(cf13Main, cf13Sel, 'pointerdown', cf13G.tx, cf13G.ty);
  const cf13Mid = await cf13Fire(cf13Main, cf13Sel, 'pointermove', cf13G.p0x, cf13G.p0y);
  check('CF-13 AC1 mid-drag: the plate under the pointer lights up, the treat dims and the ghost follows (DROP_PAD)',
    JSON.stringify(cf13Mid.over) === '[0]' && cf13Mid.dragging === true && cf13Mid.ghosts === 1,
    JSON.stringify(cf13Mid));
  await cf13Fire(cf13Main, cf13Sel, 'pointerup', cf13G.p0x, cf13G.p0y);
  const cf13A = JSON.parse(await cf13Snap(cf13Main));
  const cf13Agh = await cf13Main.evalv(`document.querySelectorAll('.cf-ghost').length`);
  check('CF-13 AC1: the drop places the treat through the same place() path (plate filled, selection cleared)',
    cf13A.plates[0].state === 'treat' && cf13A.plates[0].treat === 'fish' && cf13A.selectedTreat === null,
    JSON.stringify({ plate0: cf13A.plates[0], selectedTreat: cf13A.selectedTreat }));
  check('CF-13 AC4: no ghost is left behind after a successful drop',
    +cf13Agh === 0, `ghosts = ${cf13Agh}`);

  /* AC2: the same gesture ending on empty ground must change nothing at all
     — the idle warmup and the clock pause from boot make every state() field
     comparable byte for byte (the drag's own pointerdown re-sets idle to the
     same {0,0,true}). */
  const cf13S1 = await cf13Snap(cf13Main);
  await cf13Fire(cf13Main, cf13Sel, 'pointerdown', cf13G.tx, cf13G.ty);
  const cf13GndMid = await cf13Fire(cf13Main, cf13Sel, 'pointermove', cf13G.gx, cf13G.gy);
  const cf13GndUp = await cf13Fire(cf13Main, cf13Sel, 'pointerup', cf13G.gx, cf13G.gy);
  const cf13S2 = await cf13Snap(cf13Main);
  check('CF-13 AC2: a drag onto empty ground returns the treat and state is byte-identical (paused)',
    cf13S1 === cf13S2, `same=${cf13S1 === cf13S2}`);
  const cf13Clean = JSON.parse(await cf13Main.evalv(`JSON.stringify({
    ghosts: document.querySelectorAll('.cf-ghost').length,
    over: document.querySelectorAll('.cf-plate.cf-over').length,
    bad: document.querySelectorAll('[class*="error"],[class*="fail"],[class*="wrong"]').length,
    text: document.body.innerText })`));
  check('CF-13 AC2: the miss lights no plate, leaves no ghost and no failure class or text',
    JSON.stringify(cf13GndMid.over) === '[]' && +cf13GndUp.ghosts === 0 &&
    cf13Clean.ghosts === 0 && cf13Clean.over === 0 && cf13Clean.bad === 0 && cf13Clean.text === '',
    JSON.stringify({ cf13GndMid, cf13GndUp, cf13Clean }));

  /* AC3's other half: the click a completed drag leaves behind is swallowed. */
  await cf13Main.evalv(`document.querySelector(${JSON.stringify(cf13Sel)}).click(); true`);
  const cf13Sup = await cf13Main.evalv(`JSON.stringify(__catForest.state().selectedTreat)`);
  check('CF-13 AC3: the click that follows a real drag is suppressed (no double-handling)',
    cf13Sup === 'null', `selectedTreat = ${cf13Sup}`);

  /* AC4: an interrupted gesture cleans up synchronously (no glide, no timer). */
  await cf13Fire(cf13Main, cf13Sel, 'pointerdown', cf13G.tx, cf13G.ty);
  await cf13Fire(cf13Main, cf13Sel, 'pointermove', cf13G.p0x, cf13G.p0y);
  const cf13Can = await cf13Fire(cf13Main, cf13Sel, 'pointercancel', cf13G.p0x, cf13G.p0y);
  check('CF-13 AC4: pointercancel mid-drag removes the ghost immediately (no DOM leak)',
    +cf13Can.ghosts === 0 && cf13Can.dragging === false, JSON.stringify(cf13Can));
  await cf13Main.close();

  /* AC1's identity half: the real tap path — pointer down/up then click,
     the way a child taps it — with the same seed must land the same state
     (arriveMs included, because both paths draw exactly one RNG value in
     place()). Same warmup+pause protocol as the drag boot. */
  const cf13TapH = await bootFresh('cf13-tap', 1024, 800);
  await cf13TapH.evalv(`document.getElementById('app').dispatchEvent(new Event('pointerdown'));
    __catForest.pause(true); __catForest.seed(7); true`);
  await cf13Fire(cf13TapH, cf13Sel, 'pointerdown', cf13G.tx, cf13G.ty);
  await cf13Fire(cf13TapH, cf13Sel, 'pointerup', cf13G.tx, cf13G.ty);
  await cf13TapH.evalv(`document.querySelector(${JSON.stringify(cf13Sel)}).click()`);
  const cf13Plate0 = '#cf-plates .cf-plate[data-plate="0"]';
  await cf13Fire(cf13TapH, cf13Plate0, 'pointerdown', cf13G.p0x, cf13G.p0y);
  await cf13Fire(cf13TapH, cf13Plate0, 'pointerup', cf13G.p0x, cf13G.p0y);
  await cf13TapH.evalv(`document.querySelector(${JSON.stringify(cf13Plate0)}).click()`);
  const cf13B = JSON.parse(await cf13Snap(cf13TapH));
  await cf13TapH.close();
  const cf13Id = a => JSON.stringify({ p: a.plates, s: a.selectedTreat, i: a.idle });
  check('CF-13 AC1: the drag result is identical to the tap path (same seed, same place() draw)',
    cf13Id(cf13A) === cf13Id(cf13B), `drag=${cf13Id(cf13A)} | tap=${cf13Id(cf13B)}`);

  /* AC4 under motion: reduced motion removes the ghost instantly (asserted
     above); with motion allowed the miss glides back and the node goes away
     when the transition ends — still without any engine timer. */
  const cf13Mot = await bootEmulated('cf13-motion', 1024, 800, 'no-preference');
  const cf13MG = await cf13Geo(cf13Mot);
  await cf13Fire(cf13Mot, cf13Sel, 'pointerdown', cf13MG.tx, cf13MG.ty);
  await cf13Fire(cf13Mot, cf13Sel, 'pointermove', cf13MG.gx, cf13MG.gy);
  const cf13MotUp = await cf13Fire(cf13Mot, cf13Sel, 'pointerup', cf13MG.gx, cf13MG.gy);
  const cf13Gliding = await cf13Mot.evalv(`JSON.stringify({ n: document.querySelectorAll('.cf-ghost').length,
    ret: document.querySelectorAll('.cf-ghost.cf-return').length })`);
  await sleep(320);
  const cf13After = await cf13Mot.evalv(`document.querySelectorAll('.cf-ghost').length`);
  check('CF-13 AC4: with motion allowed a miss glides back and the ghost is removed at the end of the glide',
    +cf13MotUp.ghosts === 1 && JSON.parse(cf13Gliding).n === 1 && JSON.parse(cf13Gliding).ret === 1 &&
    +cf13After === 0, `mid=${cf13Gliding} after=${cf13After}`);
  await cf13Mot.close();

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
