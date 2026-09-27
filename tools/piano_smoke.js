/* Клавир (Piano) smoke test — Phase 4 + task 121 (GAME-PIANO-001).
   Drives the REAL page headlessly: 8 keys render, free play taps, "Прати светло"
   song mode (soft light on the expected key, no punishment on a wrong key, correct
   press -> positive highlight + advance), finish + replay, free-play prominence,
   the roadmap song-data shape, plus static wiring checks (hub, navigation, boot).
   Run:  node tools/piano_smoke.js     (from the repo root or anywhere)
   Requires Node >= 22. CHROME_PATH env optional. */
const { start, check, getFails } = require('./headless.js');
const fs = require('fs');
const path = require('path');

const sleep = ms => new Promise(r => setTimeout(r, ms));

// gentleMiss counts its calls: the "Прати светло" wrong-key path must never call it.
const STUB = `window.__miss=0;window.speech={speak:function(){},cancel:function(){}};window.tone=window.popSound=function(){};window.gentleMiss=function(){window.__miss++;};window.celebrate=function(){};true`;

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

  // Task 121: "Прати светло" phrasing + free play must stay the prominent choice.
  const ui = await h.evalv(`JSON.stringify({
    freeText: document.getElementById('modeFree').textContent,
    songText: document.getElementById('modeSong').textContent,
    freePx: parseFloat(getComputedStyle(document.getElementById('modeFree')).fontSize),
    songPx: parseFloat(getComputedStyle(document.getElementById('modeSong')).fontSize),
    counterLive: document.getElementById('pianoCounter').getAttribute('aria-live')
  })`);
  const uij = JSON.parse(ui);
  check('song mode is called "Прати светло" and free play is the bigger button',
    uij.songText === 'Прати светло' && uij.freeText === 'Свирај слободно' && uij.freePx > uij.songPx && uij.counterLive === 'polite', ui);

  // The expected key softly lights: a glowing ring in the key's OWN colour, never a hard
  // colour swap. Headless Chrome reports prefers-reduced-motion: reduce (so does the user's
  // OS), which disables the pulse and shows the static glow - the cue must survive either way.
  const soft = await h.evalv(`(() => {
    const k = document.querySelector('.piano-key.lit');
    const cs = getComputedStyle(k);
    const probe = document.createElement('span');
    probe.style.color = cs.getPropertyValue('--kcolor').trim();
    document.body.appendChild(probe);
    const rgb = getComputedStyle(probe).color;
    probe.remove();
    return JSON.stringify({ shadow: cs.boxShadow, rgb: rgb, bg: cs.backgroundColor, freeBg: getComputedStyle(document.querySelector('.piano-key')).backgroundColor });
  })()`);
  const softj = JSON.parse(soft);
  check('expected key softly lights (own-colour glow, no hard colour swap)',
    softj.shadow !== 'none' && softj.shadow.includes(softj.rgb) && softj.bg === softj.freeBg, soft);

  await h.evalv(`window.__miss=0; true`);
  await h.evalv(CLICK('.piano-key:nth-child(2)'));
  await sleep(80);
  const wrong = await h.evalv(`JSON.stringify({
    fb: document.getElementById('pianoFeedback').textContent,
    counter: document.getElementById('pianoCounter').textContent,
    litIdx: ${LIT_IDX},
    hinted: document.querySelectorAll('.piano-key.hint').length,
    shook: document.querySelectorAll('.piano-key.shake').length,
    miss: window.__miss
  })`);
  const wrongj = JSON.parse(wrong);
  check('wrong key never punishes: no miss sound, no shake, light re-pulses on the expected key',
    wrongj.miss === 0 && wrongj.shook === 0 && wrongj.hinted === 1 && wrongj.fb === 'Светли ти овде 🎵' && wrongj.counter === '1 од 42' && wrongj.litIdx === 0, wrong);

  // Correct press: note + brief positive highlight, then the indicator advances.
  await h.evalv(CLICK(`.piano-key:nth-child(1)`));
  const good = await h.evalv(`JSON.stringify({ good: document.querySelectorAll('.piano-key.good').length })`);
  await sleep(320);
  const adv = await h.evalv(`(() => {
    const k = document.querySelector('.piano-key.lit');
    const probe = document.createElement('span');
    probe.style.color = getComputedStyle(k).getPropertyValue('--kcolor').trim();
    document.body.appendChild(probe);
    const rgb = getComputedStyle(probe).color;
    probe.remove();
    return JSON.stringify({
      counter: document.getElementById('pianoCounter').textContent,
      litIdx: ${LIT_IDX},
      fb: document.getElementById('pianoFeedback').textContent,
      shadow: getComputedStyle(k).boxShadow,
      rgb: rgb,
      hitLeft: document.querySelectorAll('.piano-key.hit').length
    });
  })()`);
  const goodj = JSON.parse(good);
  const advj = JSON.parse(adv);
  check('correct key -> positive highlight, hint text clears, indicator advances to note 2',
    goodj.good === 1 && advj.counter === '2 од 42' && advj.litIdx === 0 && advj.fb === '', good + ' ' + adv);
  // The glow must survive a key that is mid-pop: .hit used to shadow the .lit pulse and the
  // cue vanished on any motion-enabled machine. Measured while .hit is still applied.
  check('soft light survives the one-shot .hit pop (.hit never hides the cue)',
    advj.shadow !== 'none' && advj.shadow.includes(advj.rgb), adv);

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
  check('standalone boot wired (piano -> piano-back/startPiano)', main.includes("'piano': ['piano-back', 'startPiano', 'hub-learning']"));

  // Roadmap song-data shape: { id, title, notes:['C4',...], tempo, speech } - so Serbian
  // children's songs can be added later without touching the engine.
  const pianoJs = fs.readFileSync(path.join(root, 'game', 'games', 'piano.js'), 'utf8');
  const shape = pianoJs.includes('const NOTE_INDEX = { C4: 0') && /tempo: \d+/.test(pianoJs) &&
    /speech: '[^']+'/.test(pianoJs) && /notes: \['C4','C4','G4'/.test(pianoJs) && !/notes: \[\d/.test(pianoJs);
  check('song data uses the roadmap shape (note names + tempo + speech, no bare indices)',
    shape, String(shape));

  // The soft light is the gameplay cue, so the reduced-motion fallback must switch the
  // pulsing OFF without ever stripping the glow (the task-83 trap).
  const pianoHtml = fs.readFileSync(path.join(root, 'game', 'pages', 'piano.html'), 'utf8');
  const rm = pianoHtml.match(/@media \(prefers-reduced-motion: reduce\)\{([\s\S]*?)\n  \}/);
  const rmBody = rm ? rm[1] : '';
  const litRule = pianoHtml.match(/\.piano-key\.lit\{([^}]*)\}/);
  check('reduced motion stops the pulse but never strips the glow',
    /\.piano-key\.lit/.test(rmBody) && /animation:\s*none/.test(rmBody) &&
    !/box-shadow:\s*none/.test(rmBody) && !/display:\s*none/.test(rmBody) && !/opacity:\s*0/.test(rmBody) &&
    !!litRule && /box-shadow/.test(litRule[1]), (rmBody.trim() + ' || lit{' + (litRule ? litRule[1].trim() : '') + '}').trim());

  // 8 keys must all be reachable on a 390px phone: accessibility.css puts a 64px
  // min-width on every button and #app clips the overflow, which used to hide 3 keys.
  const narrow = await start({ page: '/pages/piano.html', tag: 'piano-smoke-narrow', width: 390, height: 844 });
  let narrowReady = false;
  for (let i = 0; i < 20 && !narrowReady; i++) {
    narrowReady = await narrow.evalv(`typeof window.startPiano === 'function' && document.querySelectorAll('.piano-key').length === 8`);
    if (!narrowReady) await sleep(200);
  }
  const fit = await narrow.evalv(`JSON.stringify((() => {
    const ks = [...document.querySelectorAll('.piano-key')].map(k => k.getBoundingClientRect());
    return { vw: innerWidth, n: ks.length, allIn: ks.every(b => b.left >= 0 && b.right <= innerWidth), w: Math.round(ks[0].width), h: Math.round(ks[0].height) };
  })())`);
  narrow.close();
  const fitj = JSON.parse(fit);
  check('all 8 keys fit a 390px phone (no clipped, unreachable key)',
    fitj.n === 8 && fitj.allIn === true && fitj.w * fitj.h > 2000, fit);

  process.exit(getFails() ? 1 : 0);
})();
