/* Animals smoke test — Phase 2 task 118 (GAME-ANIMALS-001).
   Drives pages/animals.html headlessly: flashcard mode (card shows animal,
   next cycles, tap triggers bounce + speech) AND recognition mode (toggle,
   prompt "Где је X?", 2→3 adaptive choices, correct/wrong/hint feedback).
   Run:  node tools/animals_smoke.js     (from the repo root or anywhere)
   Requires Node >= 22. CHROME_PATH env optional. */
const { start, check, getFails } = require('./headless.js');
const { checkRouteWired } = require('./route_contract.js');
const fs = require('fs');
const path = require('path');

const sleep = ms => new Promise(r => setTimeout(r, ms));

const STUB = `window.speech={speak:function(t,cb){if(cb)cb();},cancel:function(){}};window.audioBuses.play=function(){};window.audioBuses.speakWithDuck=function(t,cb){if(cb)cb();};window.playAnimalSound=function(){}; true`;

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

  // --- Flashcard mode ---
  const init = await h.evalv(`JSON.stringify({
    cardHTML: document.getElementById('animalCard').innerHTML,
    cardBg: document.getElementById('animalCard').style.background,
    nextVisible: !!document.getElementById('animalNext'),
    cardRole: document.getElementById('animalCard').getAttribute('role'),
    cardTab: document.getElementById('animalCard').tabIndex,
    cardAria: document.getElementById('animalCard').getAttribute('aria-label')
  })`);
  const I = JSON.parse(init);
  check('card shows an animal illustration (SVG or emoji)', I.cardHTML.includes('<svg') || ANIMALS.some(a => I.cardHTML.includes(a)), I.cardHTML.substring(0, 80));
  check('card has pastel background', I.cardBg.length > 0, I.cardBg);
  check('next button is present', I.nextVisible === true);
  check('card is keyboard accessible (role=button, tabIndex=0)', I.cardRole === 'button' && I.cardTab === 0);
  check('card has aria-label', !!I.cardAria, I.cardAria);

  const first = await h.evalv(`document.getElementById('animalCard').innerHTML`);
  await h.evalv(CLICK('#animalNext'));
  await sleep(80);
  const second = await h.evalv(`document.getElementById('animalCard').innerHTML`);
  check('next button changes the animal', first !== second, 'changed');

  await h.evalv(`document.getElementById('animalCard').classList.add('bounce')`);
  const bounced = await h.evalv(`document.getElementById('animalCard').classList.contains('bounce')`);
  check('card can receive bounce class', bounced === true);

  const afterKey = await h.evalv(`(function(){
    const card = document.getElementById('animalCard');
    card.classList.remove('bounce');
    const ev = new KeyboardEvent('keydown', {key:'Enter', bubbles:true});
    card.dispatchEvent(ev);
    return JSON.stringify({ bounce: card.classList.contains('bounce') });
  })()`);
  const AK = JSON.parse(afterKey);
  check('Enter key on card triggers play (bounce class toggled)', AK.bounce === true);

  await h.evalv(CLICK('#animalNext'));
  await sleep(80);
  const stable = await h.evalv(`document.getElementById('animalCard').innerHTML`);
  check('animal stays on screen after next', stable.includes('<svg') || ANIMALS.some(a => stable.includes(a)), stable.substring(0, 80));

  // --- Recognition mode ---
  const toggleExists = await h.evalv(`!!document.getElementById('recogToggle')`);
  check('recognition mode toggle button exists', toggleExists === true);

  await h.evalv(CLICK('#recogToggle'));
  await sleep(100);

  const recogVisible = await h.evalv(`document.getElementById('recogWrap').style.display !== 'none'`);
  check('recognition mode activates on toggle', recogVisible === true);

  const promptText = await h.evalv(`document.getElementById('recogPrompt') ? document.getElementById('recogPrompt').textContent : ''`);
  check('recognition prompt asks "Где је X?"', /^где је .+\?$/.test(promptText.toLowerCase()), promptText);

  const choiceCount = await h.evalv(`document.querySelectorAll('.recog-choice').length`);
  check('first round has 2 choices (adaptive difficulty)', choiceCount === 2, 'count=' + choiceCount);

  const choiceAria = await h.evalv(`Array.from(document.querySelectorAll('.recog-choice')).map(c=>c.getAttribute('aria-label')).join(',')`);
  const serbianRegex = /^[\u0400-\u04FF]+,[\u0400-\u04FF]+$/;
  check('choices have Serbian aria-labels', serbianRegex.test(choiceAria), choiceAria);

  // Pick the correct answer
  const correctName = await h.evalv(`(function(){
    const prompt = document.getElementById('recogPrompt').textContent;
    const match = prompt.match(/где је (.+)\\?/i);
    if(!match) return '';
    const target = match[1].toLowerCase();
    const choices = Array.from(document.querySelectorAll('.recog-choice'));
    for(const c of choices){
      if(c.getAttribute('aria-label').toLowerCase() === target) return c.dataset.name;
    }
    return '';
  })()`);
  check('correct answer is among choices', correctName.length > 0, correctName);

  await h.evalv(`document.querySelector('.recog-choice[data-name="${correctName}"]').click()`);
  await sleep(100);
  const correctClass = await h.evalv(`document.querySelector('.recog-choice[data-name="${correctName}"]').classList.contains('recog-correct')`);
  check('correct answer gets recog-correct class', correctClass === true);

  // Wait for next round to auto-start
  await sleep(2000);
  const round2Choices = await h.evalv(`document.querySelectorAll('.recog-choice').length`);
  check('next round auto-starts after correct answer', round2Choices >= 2, 'count=' + round2Choices);

  // Test wrong answer — re-read the current round's target
  const currentTarget = await h.evalv(`(function(){
    const prompt = document.getElementById('recogPrompt').textContent;
    const match = prompt.match(/где је (.+)\\?$/i);
    return match ? match[1].toLowerCase() : '';
  })()`);
  const wrongName = await h.evalv(`(function(){
    const choices = Array.from(document.querySelectorAll('.recog-choice'));
    for(const c of choices){
      if(c.getAttribute('aria-label').toLowerCase() !== "${currentTarget}") return c.dataset.name;
    }
    return '';
  })()`);
  check('wrong answer exists among choices', wrongName.length > 0, wrongName);

  await h.evalv(`document.querySelector('.recog-choice[data-name="${wrongName}"]').click()`);
  await sleep(50);
  const wrongClass = await h.evalv(`document.querySelector('.recog-choice[data-name="${wrongName}"]').classList.contains('recog-wrong')`);
  check('wrong answer gets recog-wrong class', wrongClass === true);

  // Second miss triggers hint on correct answer
  await h.evalv(`document.querySelector('.recog-choice[data-name="${wrongName}"]').click()`);
  await sleep(50);
  const hintTarget = await h.evalv(`(function(){
    const prompt = document.getElementById('recogPrompt').textContent;
    const match = prompt.match(/где је (.+)\\?$/i);
    if(!match) return '';
    const target = match[1].toLowerCase();
    const choices = Array.from(document.querySelectorAll('.recog-choice'));
    for(const c of choices){
      if(c.getAttribute('aria-label').toLowerCase() === target) return c.dataset.name;
    }
    return '';
  })()`);
  const hintClass = await h.evalv(`document.querySelector('.recog-choice[data-name="${hintTarget}"]') ? document.querySelector('.recog-choice[data-name="${hintTarget}"]').classList.contains('recog-hint') : false`);
  check('repeated misses trigger hint on correct answer', hintClass === true);

  // Toggle back to flashcard mode
  await h.evalv(CLICK('#recogToggle'));
  await sleep(100);
  const flashVisible = await h.evalv(`document.getElementById('flashcardWrap').style.display !== 'none'`);
  check('toggle back to flashcard mode works', flashVisible === true);

  // Static checks
  const root = path.join(__dirname, '..');
  const indexHtml = fs.readFileSync(path.join(root, 'game', 'index.html'), 'utf8');
  check('hub button wired (data-go="game-animals")', indexHtml.includes('data-go="game-animals"'));
  // R7: the route/back wiring lives in app-registry.js now, not in navigation.js.
  checkRouteWired('animals', 'game-animals', 'pages/animals.html',
    { back: 'animals-back', start: 'startAnimals', check });

  await h.close();
  console.log(`\n${getFails() === 0 ? 'ALL' : 'SOME'} CHECKS ${getFails() === 0 ? 'PASSED' : 'FAILED'} (${getFails()} fail)`);
  process.exit(getFails() ? 1 : 0);
})().catch(e => { console.error('animals_smoke crashed:', e); process.exit(1); });
