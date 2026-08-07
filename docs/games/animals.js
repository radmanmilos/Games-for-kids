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

// Export for standalone pages that call window.startAnimals
if (typeof window !== 'undefined') window.startAnimals = startAnimals;

