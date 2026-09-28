/* ---------------- ANIMALS GAME ---------------- */
const animals = [
  {emoji:'🐶', name:'Dog', bg:'#FFE7A3'},
  {emoji:'🐱', name:'Cat', bg:'#FFD1DC'},
  {emoji:'🐮', name:'Cow', bg:'#E4E4E4'},
  {emoji:'🦁', name:'Lion', bg:'#FFDD9E'},
  {emoji:'🐘', name:'Elephant', bg:'#D9E6F2'},
  {emoji:'🐸', name:'Frog', bg:'#D8F5D0'},
  {emoji:'🐷', name:'Pig', bg:'#FFDCE5'},
  {emoji:'🦆', name:'Duck', bg:'#FFF6C9'},
  {emoji:'🦊', name:'Fox', bg:'#FFE0C2'},
  {emoji:'🐑', name:'Sheep', bg:'#F1F1F1'},
  {emoji:'🐴', name:'Horse', bg:'#EAD9C8'},
  {emoji:'🐔', name:'Chicken', bg:'#FFF0D6'},
];
let animalIdx = 0;
const animalCard = document.getElementById('animalCard');
const animalNames = {Dog:'Пас',Cat:'Мачка',Cow:'Крава',Lion:'Лав',Elephant:'Слон',Frog:'Жаба',Pig:'Свиња',Duck:'Патка',Fox:'Лисица',Sheep:'Овца',Horse:'Коњ',Chicken:'Кока'};

function showAnimal(){
  const a = animals[animalIdx];
  animalCard.textContent = a.emoji;
  animalCard.style.background = a.bg;
}
function startAnimals(){
  animalIdx = Math.floor(Math.random()*animals.length);
  showAnimal();
}
function playAnimal(){
  const a = animals[animalIdx];
  animalCard.classList.add('bounce');
  const playSound = ()=> playAnimalSound(a.name);
  if(window.speech && window.speech.speak) window.speech.speak(animalNames[a.name] || a.name, playSound);
  else playSound();
  setTimeout(()=> animalCard.classList.remove('bounce'), 200);
}
animalCard.addEventListener('pointerdown', playAnimal);
animalCard.setAttribute('role', 'button');
animalCard.tabIndex = 0;
animalCard.setAttribute('aria-label', 'Чуј како се животиња зове');
animalCard.addEventListener('keydown', (e)=>{
  if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); playAnimal(); }
});
document.getElementById('animalNext').addEventListener('click', ()=>{
  let next;
  do{ next = Math.floor(Math.random()*animals.length); } while(next === animalIdx && animals.length>1);
  animalIdx = next;
  showAnimal();
  popSound();
});

/* ---------------- ПРОНАЂИ ЖИВОТИЊУ (recognition mode) ---------------- */
let recogMode = false;
let recogTarget = null;
let recogChoices = [];
let recogRound = 0;
let recogMisses = 0;
let recogAnswered = false;

function recogChoiceCount(){
  return recogRound < 3 ? 2 : 3;
}

function startRecogRound(){
  recogAnswered = false;
  recogMisses = 0;
  const count = recogChoiceCount();
  const targetIdx = Math.floor(Math.random()*animals.length);
  recogTarget = animals[targetIdx];
  const others = animals.filter((_,i)=> i !== targetIdx);
  for(let i=others.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [others[i],others[j]] = [others[j],others[i]];
  }
  recogChoices = [recogTarget, ...others.slice(0,count-1)];
  for(let i=recogChoices.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [recogChoices[i],recogChoices[j]] = [recogChoices[j],recogChoices[i]];
  }
  renderRecog();
}

function renderRecog(){
  const wrap = document.getElementById('recogWrap');
  wrap.innerHTML = '';
  const prompt = document.createElement('div');
  prompt.className = 'recog-prompt';
  prompt.id = 'recogPrompt';
  prompt.textContent = 'Где је ' + (animalNames[recogTarget.name] || recogTarget.name).toLowerCase() + '?';
  wrap.appendChild(prompt);
  const choices = document.createElement('div');
  choices.className = 'recog-choices';
  recogChoices.forEach(a=>{
    const el = document.createElement('button');
    el.className = 'recog-choice';
    el.style.background = a.bg;
    el.textContent = a.emoji;
    el.setAttribute('aria-label', animalNames[a.name] || a.name);
    el.dataset.name = a.name;
    el.addEventListener('click', ()=> recogPick(a, el));
    choices.appendChild(el);
  });
  wrap.appendChild(choices);
}

function recogPick(picked, el){
  if(recogAnswered) return;
  if(picked.name === recogTarget.name){
    recogAnswered = true;
    el.classList.add('recog-correct');
    if(window.speech && window.speech.speak){
      window.speech.speak(animalNames[picked.name] || picked.name, ()=> playAnimalSound(picked.name));
    } else {
      playAnimalSound(picked.name);
    }
    if(window.celebrate) window.celebrate();
    document.querySelectorAll('.recog-choice').forEach(c=>{
      if(c.dataset.name !== recogTarget.name) c.classList.add('recog-dim');
    });
    setTimeout(()=>{
      recogRound++;
      startRecogRound();
    }, 1800);
  } else {
    recogMisses++;
    el.classList.add('recog-wrong');
    if(window.gentleMiss) window.gentleMiss();
    setTimeout(()=> el.classList.remove('recog-wrong'), 400);
    if(recogMisses >= 2){
      const correct = document.querySelector('.recog-choice[data-name="' + recogTarget.name + '"]');
      if(correct) correct.classList.add('recog-hint');
      setTimeout(()=>{
        const c = document.querySelector('.recog-choice[data-name="' + recogTarget.name + '"]');
        if(c) c.classList.remove('recog-hint');
      }, 1200);
    }
  }
}

function setRecogMode(on){
  recogMode = on;
  document.getElementById('recogToggle').classList.toggle('active', on);
  document.getElementById('flashcardWrap').style.display = on ? 'none' : 'flex';
  document.getElementById('recogWrap').style.display = on ? 'flex' : 'none';
  if(on) startRecogRound();
}

document.getElementById('recogToggle').addEventListener('click', ()=>{
  setRecogMode(!recogMode);
  popSound();
});

// Export for standalone pages that call window.startAnimals
if (typeof window !== 'undefined') window.startAnimals = startAnimals;
