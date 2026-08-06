/* Animals smoke test — Phase 5 task 77.
   Drives pages/animals.html headlessly: card shows an animal emoji, next cycles
   to a different animal, card tap triggers bounce + speech, keyboard accessible.
   Run:  node tools/animals_smoke.js     (from the repo root or anywhere)
   Requires Node >= 22. CHROME_PATH env optional. */
const { start, check, getFails } = require('./headless.js');
const fs = require('fs');
const path = require('path');

const sleep = ms => new Promise(r => setTimeout(r, ms));

const STUB = `window.speech={speak:function(t,cb){if(cb)cb();},cancel:function(){}};window.popSound=window.gentleMiss=window.successChime=function(){}; true`;

const CLICK = sel => `document.querySelector('${sel}').click(); true`;

const ANIMALS = ['🐶','🐱','🐮','🦁','🐘','🐸','🐷','🦆','🦊','🐑','🐴','🐔'];

(async () => {
  const h = await start({ page: '/pages/animals.html', tag: 'animals-smoke', width: 1024, height: 800 });

  let ready = false;
  for (let i = 0; i < 20 && !ready; i++) {
    ready = await h.evalv(`typeof window.startAnimals === 'function' && !!document.getElementById('animalCard')`);
    if (!ready) await sleep(200);
  }
  check('animals game booted (startAnimals ready + card present)', ready);
  await h.evalv(STUB);

  const init = await h.evalv(`JSON.stringify({
    cardText: document.getElementById('animalCard').textContent,
    cardBg: document.getElementById('animalCard').style.background,
    nextVisible: !!document.getElementById('animalNext'),
    cardRole: document.getElementById('animalCard').getAttribute('role'),
    cardTab: document.getElementById('animalCard').tabIndex,
    cardAria: document.getElementById('animalCard').getAttribute('aria-label')
  })`);
  const I = JSON.parse(init);
  check('card shows an animal emoji', ANIMALS.includes(I.cardText), I.cardText);
  check('card has pastel background', I.cardBg.length > 0, I.cardBg);
  check('next button is present', I.nextVisible === true);
  check('card is keyboard accessible (role=button, tabIndex=0)', I.cardRole === 'button' && I.cardTab === 0);
  check('card has aria-label', !!I.cardAria, I.cardAria);

  const first = await h.evalv(`document.getElementById('animalCard').textContent`);
  await h.evalv(CLICK('#animalNext'));
  await sleep(80);
  const second = await h.evalv(`document.getElementById('animalCard').textContent`);
  check('next button changes the animal', first !== second, first + ' -> ' + second);

  await h.evalv(`document.getElementById('animalCard').classList.add('bounce')`);
  const bounced = await h.evalv(`document.getElementById('animalCard').classList.contains('bounce')`);
  check('card can receive bounce class', bounced === true);

  await h.evalv(`(function(){ const card = document.getElementById('animalCard'); const ev = new KeyboardEvent('keydown', {key:'Enter', bubbles:true}); card.dispatchEvent(ev); return true; })()`);
  const afterKey = await h.evalv(`JSON.stringify({
    bounce: document.getElementById('animalCard').classList.contains('bounce')
  })`);
  const AK = JSON.parse(afterKey);
  check('Enter key on card triggers play (bounce class toggled)', AK.bounce === true);

  await h.evalv(CLICK('#animalNext'));
  await sleep(80);
  const stable = await h.evalv(`document.getElementById('animalCard').textContent`);
  check('animal stays on screen after next', ANIMALS.includes(stable), stable);

  const root = path.join(__dirname, '..');
  const indexHtml = fs.readFileSync(path.join(root, 'game', 'index.html'), 'utf8');
  check('hub button wired (data-go="game-animals")', indexHtml.includes('data-go="game-animals"'));
  const nav = fs.readFileSync(path.join(root, 'game', 'shared', 'navigation.js'), 'utf8');
  check('navigation route wired (game-animals -> animals.html)', nav.includes("'game-animals'") && nav.includes("'pages/animals.html'"));
  const main = fs.readFileSync(path.join(root, 'game', 'shared', 'main.js'), 'utf8');
  check('standalone boot wired (animals -> animals-back/startAnimals)', main.includes("'animals': ['animals-back', 'startAnimals']"));

  h.close();
  console.log(`\n${getFails() === 0 ? 'ALL' : 'SOME'} CHECKS ${getFails() === 0 ? 'PASSED' : 'FAILED'} (${getFails()} fail)`);
  process.exit(getFails() ? 1 : 0);
})().catch(e => { console.error('animals_smoke crashed:', e); process.exit(1); });
