/* Мачја шума (Cat Forest) smoke — CF-02 skeleton (page shell, task 263).
   Drives pages/cat_forest.html headlessly and pins the CF-01 wiring contract:
   boot + test hook, the route contract, the back control's reachability (inside
   the viewport AND hit-testable, never a bare .click()), the hub tile, and the
   no-network static rule (TD §8 / TP §3.1). Gameplay assertions arrive with the
   engine — this file grows card by card (TP §3).
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
