/* Minimal scaffold for Animal Memory game (YAGNI, surgical)
   - Creates a small 4x4 board of paired animal names
   - Implements flip, match detection, restart, and a tiny celebrate hook
   - Rely on shared/audio.js playAnimalSound(name) if available; otherwise degrade silently
*/
(function(){
  const animals = ['Cat','Dog','Fox','Cow','Pig','Duck','Horse','Chicken']; // 8 pairs => 16 cards (4x4 grid)
  const emojiMap = {Cat:'🐱',Dog:'🐶',Fox:'🦊',Cow:'🐮',Pig:'🐷',Duck:'🦆',Horse:'🐴',Chicken:'🐔'};
  const nameMap = {Cat:'Мачка',Dog:'Пас',Fox:'Лисица',Cow:'Крава',Pig:'Свиња',Duck:'Патка',Horse:'Коњ',Chicken:'Кока'};
  const boardEl = document.getElementById('board');
  const statusEl = document.getElementById('memoryStatus');
  const restartBtn = document.getElementById('restart');
  const backBtn = document.querySelector('.back-btn');
  let first = null, second = null, lock = false, matches = 0, moves = 0;

  function updateStatus(){
    if(statusEl) statusEl.textContent = 'Парова: ' + matches + ' од ' + animals.length + ' · Потези: ' + moves;
  }

  function shuffle(arr){
    for(let i=arr.length-1;i>0;i--){
      const j = Math.floor(Math.random()*(i+1)); [arr[i],arr[j]] = [arr[j],arr[i]];
    }
    return arr;
  }

  function buildBoard(){
    boardEl.innerHTML = '';
    const pairList = shuffle(animals.concat(animals).slice());
    pairList.forEach((name, idx) => {
      const card = document.createElement('button');
      card.className = 'card';
      card.type = 'button';
      card.dataset.name = name;
      card.dataset.index = idx;
      card.setAttribute('aria-label', 'Скривена картица');
      card.addEventListener('click', onCardClick);
      // structured faces so cards can flip like matching tiles
      const face = emojiMap[name] || name;
      card.innerHTML = `
        <div class="card-inner">
          <div class="card-face card-back"></div>
          <div class="card-face card-front">${face}</div>
        </div>`;
      boardEl.appendChild(card);
    });
    first = second = null; lock = false; matches = 0; moves = 0;
    updateStatus();
  }

  function onCardClick(e){
    if(lock) return;
    const card = e.currentTarget;
    if(card.classList.contains('flipped') || card.classList.contains('matched')) return;
    if(!first){ flipCard(card); first = card; return; }
    second = card; lock = true;
    flipCard(card);
    moves += 1;
    updateStatus();
    checkMatch();
  }

  function popPair(a, b){
    const pop = document.createElement('div');
    pop.className = 'match-pop';
    pop.textContent = 'Пар!';
    const board = a.parentElement;
    board.appendChild(pop);
    const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect(), br = board.getBoundingClientRect();
    pop.style.left = ((ra.left + ra.right + rb.left + rb.right) / 4 - br.left) + 'px';
    pop.style.top = ((ra.top + ra.bottom + rb.top + rb.bottom) / 4 - br.top) + 'px';
    try{
      pop.animate([
        { transform: 'translate(-50%,-50%) scale(.5)', opacity: 0 },
        { transform: 'translate(-50%,-50%) scale(1.2)', opacity: 1, offset: .35 },
        { transform: 'translate(-50%,-160%) scale(1)', opacity: 0 }
      ], { duration: 900, easing: 'cubic-bezier(.34,1.56,.64,1)' }).onfinish = ()=> pop.remove();
    }catch(_){
      setTimeout(()=> pop.remove(), 900);
    }
  }

  function flipCard(card){
    card.classList.add('flipped');
    try{ if(window.flipSound) window.flipSound(); }catch(_){}
  }

  function unflip(a,b){
    setTimeout(()=>{ a.classList.remove('flipped'); b.classList.remove('flipped'); resetTurn(); }, 700);
  }

  function markMatched(a,b){
    a.classList.add('matched'); b.classList.add('matched');
    popPair(a, b);
    // speak the animal name first, then play its sound (no overlap)
    const playSound = ()=>{ try{ if(window.playAnimalSound) window.playAnimalSound(a.dataset.name); }catch(_){} };
    try{ if(window.speech && window.speech.speak) window.speech.speak(nameMap[a.dataset.name] || a.dataset.name, playSound); else playSound(); }catch(_){ playSound(); }
    // small celebrate hook: add a brief aria alert
    const msg = document.createElement('div'); msg.style.position='absolute'; msg.style.left='-9999px'; msg.setAttribute('role','status');     msg.textContent = 'Пар!'; document.body.appendChild(msg);
    setTimeout(()=> document.body.removeChild(msg), 800);
    matches += 1;
    updateStatus();
    resetTurn();
    if(matches === animals.length) onWin();
  }

  function checkMatch(){
    if(first.dataset.name === second.dataset.name){
      markMatched(first, second);
    } else {
      unflip(first, second);
    }
  }

  function resetTurn(){ first = second = null; lock = false; }

  function onWin(){
    try{ if(window.celebrate) window.celebrate(); }catch(_){ }
  }

  restartBtn.addEventListener('click', ()=>{ if(window.popSound) window.popSound(); buildBoard(); });
  backBtn.addEventListener('click', ()=>{
    if(window.popSound) window.popSound();
    setTimeout(()=>{
      try{
        if(window.top !== window && window.top && typeof window.top.goTo === 'function') {
          window.top.goTo('hub-games');
        } else {
          location.href = '../index.html#hub-games';
        }
      }catch(_){ location.href = '../index.html#hub-games'; }
    },90);
  });

  // initial build
  buildBoard();
})();
