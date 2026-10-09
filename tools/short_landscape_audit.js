/* short_landscape_audit.js — Visual/UX plan V3.1 (task 217).
 *
 * Opens EVERY surface (hub + all 24 registry apps) at 844×390 — the
 * short-landscape viewport the spec calls first-class (§10/§11) — and checks
 * each one against the §11 checklist:
 *
 *   11.1 header budget          top chrome ≤ 72 px (spec's conceptual budget)
 *   11.2 board-first            the board/tray/choices fit the viewport
 *   11.3 no accidental clipping no h-overflow, no title under the back button,
 *                               no fixed/anchored chrome cut by the viewport,
 *                               no tappable control unreachable, no tiny
 *                               essential text (< 12 px), modal fits if open
 *
 * Writes the audit table to resources/General_reviews/SHORT_LANDSCAPE_AUDIT.md
 * and prints a summary. EXITS 1 while any FAIL remains — the failures ARE the
 * V3.2 worklist ("fix every failure by the §11 order"). Not wired into
 * check_fast/CI: it is an audit that drives work, not a release gate.
 *
 * Run: node tools/short_landscape_audit.js
 */
const { start } = require('./headless.js');
const { all: registryAll } = require('./registry.js');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'resources', 'General_reviews', 'SHORT_LANDSCAPE_AUDIT.md');
const VIEWPORT = { width: 844, height: 390, deviceScaleFactor: 1, mobile: true };

/* §11.2 names the board-based games whose COMPLETE board must fit before any
   decorative UI. Selectors point at the board/tray/choice surfaces; if a page
   shows none in its default state the audit records a note, never a silent pass. */
const STAGE = {
  animal_memory: ['#board'],
  matching_game: ['#candyGrid'],
  sorting: ['#sort-baskets', '#sort-tray'],
  sequencing: ['#seq-slots', '#seq-tray'],
  animal_puzzle: ['.board-slot', '.piece'],
  animal_counting: ['.count-tile', '.count-choice'],
};

const PAGES = { hub: '/index.html' };
for (const app of registryAll()) PAGES[app.id] = app.url;

/* Serialised into the page with toString() — self-contained on purpose, so it
   never depends on closures over the Node side. Returns a plain object. */
function auditInPage(stageSelectors) {
  const vw = innerWidth;
  const vh = innerHeight;
  const R = el => el.getBoundingClientRect();
  const vis = el => {
    if (!el) return false;
    const r = R(el);
    return el.getClientRects().length > 0 && r.width > 0 && r.height > 0 &&
      getComputedStyle(el).visibility !== 'hidden';
  };
  const desc = el => {
    if (!el) return '(none)';
    let s = el.tagName.toLowerCase();
    if (el.id) s += '#' + el.id;
    if (typeof el.className === 'string' && el.className.trim()) {
      s += '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.');
    }
    return s;
  };
  const inside = (r, pad) => {
    /* 2px tolerance: a line-box/rounding overshoot (the V2.8 font-swap family —
       `#sort-prompt` measures top:-1 on one run) is not a clip a child can see.
       Real failures are 16–23px, far outside this. */
    const p = pad === undefined ? 2 : pad;
    return r.left >= -p && r.top >= -p && r.right <= vw + p && r.bottom <= vh + p;
  };
  const hits = (a, b) =>
    Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) *
    Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));

  const fails = [];
  const warns = [];
  const notes = [];
  const push = (arr, msg) => { if (arr.length < 12) arr.push(msg); else if (arr[arr.length - 1] !== '…') arr.push('…'); };

  const de = document.documentElement;

  /* 11.3 — horizontal overflow is never acceptable. */
  if (de.scrollWidth > vw + 1) push(fails, 'h-overflow: document is ' + de.scrollWidth + 'px wide in a ' + vw + 'px viewport');
  /* Accidental vertical scroll is a WARN: the parent page scrolls by design
     (task 201) and a content hub may legitimately scroll — V3.2 adjudicates. */
  if (de.scrollHeight > vh + 1) push(warns, 'v-scroll: document is ' + de.scrollHeight + 'px tall in a ' + vh + 'px viewport (essential content must fit without scrolling)');

  /* Back control — present, fully visible, topmost at its own centre. */
  const back = Array.from(document.querySelectorAll('.back-btn, .adv-back, [id$="-back"], #back-btn')).find(vis) || null;
  if (!back) {
    notes.push('back: none on this surface');
  } else {
    const r = R(back);
    if (!inside(r)) push(fails, 'back clipped: ' + JSON.stringify({ l: Math.round(r.left), t: Math.round(r.top), r: Math.round(r.right), b: Math.round(r.bottom) }) + ' vs ' + vw + '×' + vh);
    const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    if (!(hit === back || back.contains(hit) || (hit && hit.contains(back)))) {
      push(fails, 'back not topmost at its centre (hit ' + desc(hit) + ')');
    }
  }

  /* Title — the header's job (§11.1), so it must be visible and never under
     the back button (§11.3 "a title behind a button"). Prompt-led learning
     pages (§23 instruction zone) head the screen with their prompt instead of
     an h1, so `#*-prompt` / `#world-name` count as header text too. */
  const title = Array.from(document.querySelectorAll('.ps-title, h1, #adv-title, #classroomTitle, #pianoTitle, [id$="-prompt"], #world-name')).find(vis) || null;
  if (!title) {
    push(warns, 'no header text visible (.ps-title / h1 / #*-prompt) — stage-led page? adjudicate');
  } else {
    const tr = R(title);
    if (!inside(tr)) push(fails, 'title clipped: ' + desc(title) + ' ' + JSON.stringify({ l: Math.round(tr.left), t: Math.round(tr.top), r: Math.round(tr.right), b: Math.round(tr.bottom) }));
    if (back && hits(tr, R(back)) > 4) push(fails, 'title∩back = ' + Math.round(hits(tr, R(back))) + 'px² (title behind the back button)');
  }

  /* 11.1 header budget — union of the top-band chrome (safe-area + header);
     spec's conceptual budget is 56–72 px. WARN, not FAIL: it is "approximate". */
  let headerBottom = 0;
  for (const el of document.querySelectorAll('.ps-header, .back-btn, .adv-back')) {
    if (!vis(el)) continue;
    const r = R(el);
    if (r.top < 100) headerBottom = Math.max(headerBottom, r.bottom);
  }
  if (title) {
    const r = R(title);
    if (r.top < 100) headerBottom = Math.max(headerBottom, r.bottom);
  }
  if (headerBottom > 72) push(warns, 'header budget: top chrome reaches ' + Math.round(headerBottom) + 'px (spec §11.1: 56–72px)');

  /* Chrome clipped by the viewport: position:fixed (screen-pinned), plus
     screen-anchored absolute chrome matching the chrome name families. */
  const CHROME_ABS = /hud|pill|score|status|music|worlds|control|mode|tools/i;
  const all = Array.from(document.querySelectorAll('body *'));
  const fixedVisible = [];
  for (const el of all) {
    if (!vis(el)) continue;
    const cs = getComputedStyle(el);
    const pos = cs.position;
    if (pos !== 'fixed' && pos !== 'absolute') continue;
    const chromeish = pos === 'fixed' || CHROME_ABS.test(typeof el.className === 'string' ? el.className : '') || /score|music|worlds|hud|status|control/i.test(el.id || '');
    if (!chromeish) continue;
    if (el === document.body || el === de) continue;
    const r = R(el);
    const intersects = r.left < vw && r.top < vh && r.right > 0 && r.bottom > 0;
    if (intersects && !inside(r)) {
      push(fails, pos + ' chrome clipped: ' + desc(el) + ' ' + JSON.stringify({ l: Math.round(r.left), t: Math.round(r.top), r: Math.round(r.right), b: Math.round(r.bottom) }));
    }
    if (pos === 'fixed') fixedVisible.push(el);
  }

  /* Chrome-vs-chrome overlap (§11.3 "score/status overlapping content").
     Nested pairs (header ∩ its own children) overlap by design — excluded. */
  const chromeSet = [];
  if (back) chromeSet.push(back);
  if (title) chromeSet.push(title);
  for (const el of fixedVisible) if (!chromeSet.includes(el)) chromeSet.push(el);
  for (const el of document.querySelectorAll('.ps-status, #adv-score, #adv-worlds-btn, #adv-music-btn, #adv-progress')) {
    if (vis(el) && !chromeSet.includes(el)) chromeSet.push(el);
  }
  for (let i = 0; i < chromeSet.length; i++) {
    for (let j = i + 1; j < chromeSet.length; j++) {
      const a = chromeSet[i];
      const b = chromeSet[j];
      if (a.contains(b) || b.contains(a)) continue;
      const area = hits(R(a), R(b));
      if (area > 4) push(fails, 'chrome overlap: ' + desc(a) + ' ∩ ' + desc(b) + ' = ' + Math.round(area) + 'px²');
    }
  }

  /* 11.2 board-first — the board/tray/choices must fit before decoration. */
  const stageSel = stageSelectors || [];
  const stageEls = [];
  for (const sel of stageSel) {
    for (const el of document.querySelectorAll(sel)) if (vis(el)) stageEls.push(el);
  }
  if (stageSel.length && stageEls.length === 0) {
    notes.push('stage: no ' + stageSel.join('/') + ' elements in the default state (board not audited here)');
  }
  for (const el of stageEls) {
    if (!inside(R(el))) push(fails, 'board cropped (§11.2): ' + desc(el) + ' ' + JSON.stringify(R(el)));
  }

  /* Tappable controls: unreachable = outside the viewport with NO scrollable
     ancestor that could reveal it (the task-177c/209 clipped-control family).
     Reachable-only-by-scrolling is a WARN — §11 wants essentials to fit. */
  const scrollable = el => {
    for (let p = el.parentElement; p && p !== document.documentElement; p = p.parentElement) {
      const s = getComputedStyle(p);
      if ((s.overflowY === 'auto' || s.overflowY === 'scroll') && p.scrollHeight > p.clientHeight + 1) return true;
    }
    return de.scrollHeight > vh + 1;
  };
  const seen = new Set();
  for (const el of document.querySelectorAll('button, [role="button"], a[href], [data-go]')) {
    if (!vis(el)) continue;
    const r = R(el);
    if (inside(r)) continue;
    const key = desc(el);
    if (seen.has(key)) continue;
    seen.add(key);
    if (scrollable(el)) push(warns, 'control needs scrolling to reach: ' + key);
    else push(fails, 'control unreachable (no scroll can reveal it): ' + key + ' ' + JSON.stringify({ l: Math.round(r.left), t: Math.round(r.top), r: Math.round(r.right), b: Math.round(r.bottom) }));
  }

  /* No tiny essential text: the title, the back control and screen-pinned
     chrome carry the words a child must read (§11 checklist). */
  const tiny = [];
  const tinySet = [];
  if (back) tinySet.push(back);
  if (title) tinySet.push(title);
  for (const el of fixedVisible) if (!tinySet.includes(el)) tinySet.push(el);
  for (const el of tinySet) {
    const fs = parseFloat(getComputedStyle(el).fontSize);
    const text = (el.innerText || '').trim();
    if (fs && fs < 12 && text) tiny.push(desc(el) + ' ' + fs + 'px "' + text.slice(0, 24) + '"');
  }
  if (tiny.length) push(fails, 'tiny essential text (<12px): ' + tiny.join('; '));

  /* Modal open in the default state must fit (§11.3). Most pages boot with
     modals hidden — recorded as a note, not a pass. */
  let modalSeen = false;
  for (const el of document.querySelectorAll('[role="dialog"], .modal, [class*="Modal"]')) {
    if (!vis(el)) continue;
    modalSeen = true;
    if (!inside(R(el))) push(fails, 'modal does not fit the viewport: ' + desc(el));
  }
  if (!modalSeen) notes.push('modal: none open in the default state');

  if (document.body.innerText.indexOf('није доступан') !== -1) {
    notes.push('WebGL/feature unavailable on this host — the fallback screen is what was audited');
  }

  return {
    vw, vh,
    headerBottom: Math.round(headerBottom),
    titleText: title ? (title.innerText || '').trim().slice(0, 40) : null,
    hasBack: !!back,
    stageChecked: stageSel.length ? stageEls.length : -1,
    fails, warns, notes,
  };
}

(async () => {
  const rows = [];
  let totalFails = 0;
  const h = await start({ page: null, tag: 'sl-audit', width: VIEWPORT.width, height: VIEWPORT.height });
  try {
    await h.c.send('Emulation.setDeviceMetricsOverride', VIEWPORT);
    /* Deterministic game state (screenshot.js pattern): candy's star spawn
       and any other Math.random boot roll must not flip the verdict between
       runs — matching_game showed exactly that (1 vs 2 fails). */
    await h.c.send('Page.addScriptToEvaluateOnNewDocument', {
      source: [
        '(() => {',
        '  let seed = 0x13579bdf;',
        '  Math.random = () => {',
        '    seed = (seed * 1664525 + 1013904223) >>> 0;',
        '    return seed / 4294967296;',
        '  };',
        '})();',
      ].join('\n'),
    });
    for (const [id, url] of Object.entries(PAGES)) {
      const row = { id, url, error: null };
      try {
        await h.navigate(`http://127.0.0.1:${h.port}${url}`);
        const loaded = await h.waitFor(
          `location.pathname === ${JSON.stringify(url)} && document.readyState === 'complete'`,
          { timeout: 15000, label: `${id} to finish loading` },
        );
        if (!loaded.ok) throw new Error('load: ' + loaded.why);
        await h.evalp(`document.fonts ? document.fonts.ready.then(() => true) : Promise.resolve(true)`);
        /* Deterministic geometry: no live animation may tip a marginal
           measurement (the V2.8 font-swap/`pulse` lesson). */
        await h.evalv(`(() => {
          if (!document.getElementById('__sl-audit-stability')) {
            const s = document.createElement('style');
            s.id = '__sl-audit-stability';
            s.textContent = '*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}';
            document.head.appendChild(s);
          }
          /* cancel(), not pause(): pause() freezes a Web Animation at whatever
           progress it had reached — a different scale/offset every run, which
           is what made space's score∩worlds overlap flip between runs.
           cancel() reverts the element to its base (resting) state, the state
           a child actually sees when nothing is animating. */
        for (const a of document.getAnimations()) a.cancel();
          window.scrollTo(0, 0);
          return true;
        })()`);
        await h.sleep(600);
        const measured = await h.evalv('(' + auditInPage.toString() + ')(' + JSON.stringify(STAGE[id] || []) + ')');
        if (measured && measured.__err) throw new Error(measured.__err);
        Object.assign(row, measured);
      } catch (e) {
        row.error = String(e && e.message || e);
      }
      rows.push(row);
      const verdict = row.error ? 'ERROR' : row.fails && row.fails.length ? 'FAIL' : row.warns && row.warns.length ? 'WARN' : 'OK';
      if (row.fails) totalFails += row.fails.length;
      console.log(`${verdict.padEnd(5)} ${id}${row.error ? ' — ' + row.error : row.fails && row.fails.length ? ' — ' + row.fails.length + ' fail(s)' : ''}`);
    }
  } finally {
    await h.close({ checkErrors: false });
  }

  /* --- audit table (the V3.1 deliverable) ---------------------------------- */
  const when = new Date().toISOString().replace('T', ' ').slice(0, 16);
  const lines = [];
  lines.push('# Short-landscape audit — 844×390 (spec §11)');
  lines.push('');
  lines.push(`Generated: ${when} UTC · task 217 (V3.1) · \`node tools/short_landscape_audit.js\``);
  lines.push('');
  lines.push('Every surface (hub + 24 registry apps) measured at **844×390** against the');
  lines.push('Master Visual/UX plan §11 checklist: header budget 56–72 px, board-first,');
  lines.push('no h-overflow, no clipped chrome, no title behind the back button, no');
  lines.push('unreachable control, no essential text under 12 px. Animations are paused');
  lines.push('and fonts settled before measuring, so the numbers are deterministic.');
  lines.push('');
  lines.push('**FAIL = §11 violation (the V3.2 worklist, to fix in §11 order: remove');
  lines.push('decoration → collapse secondary text → move secondary controls → resize');
  lines.push('stage → only then reduce non-critical typography). WARN = needs a human');
  lines.push('adjudication. The tool exits 1 while any FAIL remains.**');
  lines.push('');
  lines.push('| Surface | Title | Header px | Verdict | Fails | Warns |');
  lines.push('|---|---|---:|---|---:|---:|');
  for (const r of rows) {
    const verdict = r.error ? 'ERROR' : r.fails && r.fails.length ? 'FAIL' : r.warns && r.warns.length ? 'WARN' : 'OK';
    const nf = r.fails ? r.fails.length : '—';
    const nw = r.warns ? r.warns.length : '—';
    const hb = r.headerBottom !== undefined ? r.headerBottom : '—';
    const t = r.titleText ? r.titleText.replace(/\|/g, '/') : r.error ? '—' : '(none)';
    lines.push(`| \`${r.id}\` | ${t} | ${hb} | ${verdict} | ${nf} | ${nw} |`);
  }
  lines.push('');
  const errored = rows.filter(r => r.error);
  const failed = rows.filter(r => r.fails && r.fails.length);
  const warned = rows.filter(r => !r.error && (!r.fails || !r.fails.length) && r.warns && r.warns.length);
  const clean = rows.filter(r => !r.error && (!r.fails || !r.fails.length) && (!r.warns || !r.warns.length));
  lines.push(`**Summary:** ${rows.length} surfaces · ${clean.length} OK · ${warned.length} WARN · ${failed.length} FAIL · ${errored.length} error · ${totalFails} individual failures.`);
  lines.push('');
  if (failed.length || errored.length) {
    lines.push('## Failures — V3.2 worklist');
    lines.push('');
    for (const r of rows) {
      if (r.error) { lines.push(`### \`${r.id}\``); lines.push(''); lines.push(`- ERROR: ${r.error}`); lines.push(''); continue; }
      if (!r.fails || !r.fails.length) continue;
      lines.push(`### \`${r.id}\``);
      lines.push('');
      for (const f of r.fails) lines.push(`- FAIL: ${f}`);
      /* warns on a failed surface would vanish from the warn section
         (it lists warn-ONLY surfaces) — keep them visible right here */
      for (const w of r.warns || []) lines.push(`- WARN: ${w}`);
      lines.push('');
    }
  }
  if (warned.length) {
    lines.push('## Warnings — adjudicate');
    lines.push('');
    for (const r of warned) {
      lines.push(`### \`${r.id}\``);
      lines.push('');
      for (const w of r.warns) lines.push(`- WARN: ${w}`);
      lines.push('');
    }
  }
  const noted = rows.filter(r => r.notes && r.notes.length);
  if (noted.length) {
    lines.push('## Notes');
    lines.push('');
    for (const r of noted) lines.push(`- \`${r.id}\`: ${r.notes.join(' · ')}`);
    lines.push('');
  }
  fs.writeFileSync(OUT, lines.join('\n'));
  console.log(`\n${failed.length} surface(s) with FAIL, ${totalFails} failure(s) total.`);
  console.log(`Audit table: ${path.relative(ROOT, OUT)}`);
  process.exit(totalFails > 0 || errored.length ? 1 : 0);
})();
