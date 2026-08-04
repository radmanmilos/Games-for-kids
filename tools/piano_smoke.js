/* Клавир (Piano) smoke test — Phase 4.
   Drives the REAL page headlessly: 8 keys render, free play taps, song mode
   follow-the-melody (wrong nudge, correct advance), finish + replay, plus static
   wiring checks (hub button, navigation route, standalone boot).
   Run:  node tools/piano_smoke.js     (from the repo root or anywhere)
   Requires Node >= 22. CHROME_PATH env optional. */
const { start, check, getFails } = require('./headless.js');
const fs = require('fs');
const path = require('path');

const sleep = ms => new Promise(r => setTimeout(r, ms));

const STUB = `window.speech={speak:function(){},cancel:function(){}};window.tone=window.popSound=window.gentleMiss=function(){};window.celebrate=function(){};true`;

const CLICK = sel => `document.querySelector('${sel}').click(); true`;
const LIT_IDX = `Array.from(document.querySelectorAll('.piano-key')).indexOf(document.querySelector('.piano-key.lit'))`;

(async () => {
  const h = await start({ page: '/pages/piano.html', tag: 'piano-smoke', width: 1024, height: 800 });

  let ready = false;
  for (let i = 0; i < 20 && !ready; i++) {
    ready = await h.evalv(`typeof window.startPiano === 'function'`);
    if (!ready) await sleep(200);
  }
  check('piano game booted (startPiano ready)', ready);
  await h.evalv(STUB);

  const free = await h.evalv(`JSON.stringify({
    keys: document.querySelectorAll('.piano-key').length,
    freeOn: document.getElementById('modeFree').classList.contains('on'),
    songHidden: !document.getElementById('songInfo').classList.contains('show')
  })`);
  const freej = JSON.parse(free);
  check('free mode default: 8 keys + Свирај active + song hidden', freej.keys === 8 && freej.freeOn === true && freej.songHidden === true, free);

  await h.evalv(CLICK('.piano-key:nth-child(1)'));
  const popped = await h.evalv(`!!document.querySelector('.piano-key.hit')`);
  check('free play tap glows a key (.hit)', popped === true, String(popped));

  await h.evalv(CLICK('#modeSong'));
  await sleep(80);
  const song = await h.evalv(`JSON.stringify({
    shown: document.getElementById('songInfo').classList.contains('show'),
    counter: document.getElementById('pianoCounter').textContent,
    litIdx: ${LIT_IDX},
    litCount: document.querySelectorAll('.piano-key.lit').length
  })`);
  const songj = JSON.parse(song);
  check('song mode: info shown, "1 од 42", exactly one lit key (C)', songj.shown === true && songj.counter === '1 од 42' && songj.litIdx === 0 && songj.litCount === 1, song);

  const chips = await h.evalv(`JSON.stringify({
    n: document.querySelectorAll('#songChips .song-chip').length,
    first: document.querySelector('#songChips .song-chip').classList.contains('on'),
    icons: Array.from(document.querySelectorAll('#songChips .song-chip')).map(c => c.textContent).join('|'),
    labels: Array.from(document.querySelectorAll('#songChips .song-chip')).map(c => c.getAttribute('aria-label')).join('|')
  })`);
  const chipsj = JSON.parse(chips);
  check('song picker: 3 emoji chips (⭐|🎂|🔔), Трепери active', chipsj.n === 3 && chipsj.first === true && chipsj.icons === '⭐|🎂|🔔' && chipsj.labels === 'Трепери, трепери звездице|Срећан ти рођендан|Џингл белс', chips);

  await h.evalv(CLICK('#songChips .song-chip[data-song="birthday"]'));
  await sleep(80);
  const bd = await h.evalv(`JSON.stringify({ counter: document.getElementById('pianoCounter').textContent, litIdx: ${LIT_IDX} })`);
  const bdj = JSON.parse(bd);
  check('birthday song: "1 од 25", lit C', bdj.counter === '1 од 25' && bdj.litIdx === 0, bd);

  await h.evalv(CLICK('#songChips .song-chip[data-song="jingle"]'));
  await sleep(80);
  const jg = await h.evalv(`JSON.stringify({ counter: document.getElementById('pianoCounter').textContent, litIdx: ${LIT_IDX} })`);
  const jgj = JSON.parse(jg);
  check('jingle song: "1 од 26", lit E', jgj.counter === '1 од 26' && jgj.litIdx === 2, jg);

  await h.evalv(CLICK('#songChips .song-chip[data-song="twinkle"]'));
  await sleep(80);

  await h.evalv(CLICK('.piano-key:nth-child(2)'));
  await sleep(80);
  const wrong = await h.evalv(`JSON.stringify({
    fb: document.getElementById('pianoFeedback').textContent,
    counter: document.getElementById('pianoCounter').textContent,
    litIdx: ${LIT_IDX}
  })`);
  const wrongj = JSON.parse(wrong);
  check('wrong key: nudge + question stays on the same note', wrongj.fb === 'Покушај још једном!' && wrongj.counter === '1 од 42' && wrongj.litIdx === 0, wrong);

  await h.evalv(CLICK('#pianoPreview'));
  await sleep(60);
  const prevOn = await h.evalv(`document.getElementById('pianoPreview').textContent`);
  await h.evalv(CLICK('#pianoPreview'));
  const prevOff = await h.evalv(`document.getElementById('pianoPreview').textContent`);
  check('preview button toggles (Чуј песму -> Стоп -> Чуј песму)', prevOn === '🔇 Стоп' && prevOff === '🔊 Чуј песму', prevOn + ' / ' + prevOff);

  await h.evalv(CLICK('#modeFree'));
  await h.evalv(CLICK('#modeSong'));
  await sleep(80);
  const reset = await h.evalv(`JSON.stringify({ counter: document.getElementById('pianoCounter').textContent, litIdx: ${LIT_IDX} })`);
  const resetj = JSON.parse(reset);
  check('re-entering song mode resets to "1 од 42" with lit C', resetj.counter === '1 од 42' && resetj.litIdx === 0, reset);

  let completed = 0;
  for (let step = 0; step < 42; step++) {
    const idx = await h.evalv(LIT_IDX);
    if (idx < 0) break;
    await h.evalv(CLICK(`.piano-key:nth-child(${idx + 1})`));
    completed++;
    await sleep(330);
  }
  const fin = await h.evalv(`JSON.stringify({
    shown: document.getElementById('pianoFinish').classList.contains('show'),
    title: document.getElementById('pianoFinishTitle').textContent,
    sub: document.getElementById('pianoFinishSub').textContent
  })`);
  const finj = JSON.parse(fin);
  check('42 correct taps -> finish panel', finj.shown === true && finj.title === 'Свирао си песму!' && finj.sub === 'Одсвирао си свих 42 ноте!', fin);

  await h.evalv(CLICK('#pianoReplay'));
  await sleep(80);
  const rep = await h.evalv(`JSON.stringify({
    hidden: !document.getElementById('pianoFinish').classList.contains('show'),
    counter: document.getElementById('pianoCounter').textContent,
    litIdx: ${LIT_IDX}
  })`);
  const repj = JSON.parse(rep);
  check('replay restarts song at "1 од 42" with lit C', repj.hidden === true && repj.counter === '1 од 42' && repj.litIdx === 0, rep);

  h.close();

  const root = path.join(__dirname, '..');
  const indexHtml = fs.readFileSync(path.join(root, 'game', 'index.html'), 'utf8');
  check('hub button wired (data-go="game-piano")', indexHtml.includes('data-go="game-piano"'));
  const nav = fs.readFileSync(path.join(root, 'game', 'shared', 'navigation.js'), 'utf8');
  check('navigation route wired (game-piano -> piano.html)', nav.includes("'game-piano'") && nav.includes("'pages/piano.html'"));
  const main = fs.readFileSync(path.join(root, 'game', 'shared', 'main.js'), 'utf8');
  check('standalone boot wired (piano -> piano-back/startPiano)', main.includes("'piano': ['piano-back', 'startPiano']"));

  process.exit(getFails() ? 1 : 0);
})();
