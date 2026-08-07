(function(){
  function startAnimalCounting(){
    const app = document.getElementById('app');
    let screen = document.getElementById('game-counting');
    if(!screen){
      screen = document.createElement('div'); screen.id='game-counting'; screen.className='screen';
      screen.innerHTML = `<button class="back-btn" aria-label="Назад на игре"><svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true"><path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg></button>
        <div style="display:flex;flex-direction:column;align-items:center;gap:12px;padding-top:8vh">
          <div style="display:flex;gap:12px;align-items:center;">
            <h2 style="margin:0 8px 0 0">Изброј животиње</h2>
                  <div class="candy-score" id="countScore"><span class="matching-icon">🔢</span> <span id="countScoreValue">0</span></div>
          </div>
          <div id="countInfo" style="color:var(--plum-soft);font-weight:600">Ниво <span id="countLevel">1</span></div>
          <div id="countScene" style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center;min-height:160px;padding:18px;border-radius:12px;background:rgba(255,255,255,0.8);box-shadow:0 8px 24px rgba(0,0,0,.08)"></div>
          <div id="countButtons" style="display:flex;gap:8px;margin-top:12px"></div>
          <div id="countResult" style="margin-top:8px;font-weight:800;min-height:36px"></div>
                <button id="countNext" class="next-btn" style="display:none;margin-top:12px">➜</button>
        </div>`;
      app.appendChild(screen);
    }

    const animals = [
      {name:'Dog', emoji:'🐶'},
      {name:'Cat', emoji:'🐱'},
      {name:'Cow', emoji:'🐮'},
      {name:'Pig', emoji:'🐷'},
      {name:'Fox', emoji:'🦊'},
      {name:'Frog', emoji:'🐸'},
      {name:'Chicken', emoji:'🐔'}
    ];
    const GAME_ICON = '🔢';
    const numberNames = ['','један','два','три','четири','пет','шест','седам','осам','девет','десет'];
    const maxLevels = 10;
    let level = 1;
    let score = 0;

    const scene = screen.querySelector('#countScene');
    const buttons = screen.querySelector('#countButtons');
    const result = screen.querySelector('#countResult');
    const scoreEl = screen.querySelector('#countScoreValue');
    const levelEl = screen.querySelector('#countLevel');
    const nextBtn = screen.querySelector('#countNext');

    function renderLevel() {
      levelEl.innerText = level;
      result.innerText = '';
      nextBtn.style.display = 'none';
      const min = 1 + Math.floor((level-1)/2); // slowly increase
      const max = Math.min(10, min + 2 + Math.floor(level/2));
      const n = Math.floor(Math.random()*(max-min+1))+min;
      screen.dataset.correct = n;
      // pick a random animal for variety per level
      const animal = animals[Math.floor(Math.random()*animals.length)];
      screen.dataset.animal = animal.name;
      scene.innerHTML = Array.from({length:n}).map(()=>`<div class="count-tile" data-animal="${animal.name}">${animal.emoji}</div>`).join('');

      // update score icon to game icon (same as hub)
      const scoreIcon = screen.querySelector('.matching-icon');
      if (scoreIcon) scoreIcon.innerText = GAME_ICON;

      // create choice buttons up to max (8)
      const choices = Array.from({length:10}).map((_,i)=>i+1).slice(0, Math.max(4, Math.min(10,max)));
      buttons.innerHTML = choices.map(c=>`<button class="count-choice" data-val="${c}">${c}</button>`).join('');

      buttons.querySelectorAll('button').forEach(b=>{
        b.disabled = false;
        b.style.visibility = 'visible';
        b.addEventListener('click', onChoose);
      });
    }

    function showCelebrate() {
      const celeb = screen.querySelector('#countCelebrate');
      if (!celeb) return;
      celeb.style.display = 'flex';
      void celeb.offsetWidth;
      celeb.classList.add('show');
      setTimeout(()=>{
        celeb.classList.remove('show');
        setTimeout(()=>{ celeb.style.display = 'none'; }, 120);
      }, 700);
    }

    function confetti(){
      const colors = ['#FF6F91','#FFD23F','#67C971','#4A3F6B','#BFEFFF','#FF8FA3','#E52521'];
      for(let i=0;i<40;i++){
        const el = document.createElement('div');
        el.style.cssText = 'position:fixed;pointer-events:none;z-index:9999;border-radius:2px;';
        el.style.width = (6+Math.random()*6)+'px';
        el.style.height = (6+Math.random()*6)+'px';
        el.style.background = colors[Math.floor(Math.random()*colors.length)];
        el.style.left = (20+Math.random()*60)+'vw';
        el.style.top = '-4vh';
        el.style.opacity = '1';
        document.body.appendChild(el);
        const drift = (Math.random()-0.5)*60;
        const fall = 40+Math.random()*50;
        const spin = Math.random()*720-360;
        el.animate([
          { transform:'translate(0,0) rotate(0deg)', opacity:1 },
          { transform:`translate(${drift}vw,${fall}vh) rotate(${spin}deg)`, opacity:0 }
        ], { duration:900+Math.random()*600, easing:'cubic-bezier(.25,.46,.45,.94)' });
        setTimeout(()=>el.remove(), 1600);
      }
    }

    function animateSuccess(){
      scene.querySelectorAll('.count-tile').forEach((t,i)=>{
        setTimeout(()=>{
          t.classList.add('collected');
          setTimeout(()=>t.classList.remove('collected'),400);
        }, i*80);
      });
      showCelebrate();
      confetti();
    }

    function onChoose(e){
      const val = Number(e.currentTarget.dataset.val);
      const correct = Number(screen.dataset.correct);
      if (val === correct) {
        // visual celebrate
        result.innerText = '';
        score += 1;
        scoreEl.innerText = score;
        if(typeof successChime === 'function') successChime();
        // play animal sound if available
        const animalName = screen.dataset.animal || 'Dog';
        if(typeof playAnimalSound === 'function') playAnimalSound(animalName);
        if(window.speech && window.speech.speak && numberNames[val]) setTimeout(()=> window.speech.speak(numberNames[val]), 500);
        // animate
        animateSuccess();
        // lock choices: keep the correct choice visible and highlighted until user clicks Next
        buttons.querySelectorAll('button').forEach(b=>{
          const valNum = Number(b.dataset.val);
          if (valNum === correct) {
            b.disabled = true;
            b.style.visibility = 'visible';
            b.classList.add('correct');
          } else {
            b.disabled = true;
            b.style.visibility = 'hidden';
          }
        });
        nextBtn.style.display = 'inline-block';
      } else {
        result.innerText = 'Покушај поново';
        if(typeof gentleMiss === 'function') gentleMiss();
      }
    }

    nextBtn.addEventListener('click', ()=>{
      if(typeof popSound === 'function') popSound();
      level += 1;
      if (level > maxLevels) {
        // show final
        result.innerText = 'Готово! 🌟';
        nextBtn.style.display = 'none';
        if(typeof successChime === 'function') successChime();
        if(window.celebrate) window.celebrate();
        confetti();
        setTimeout(()=>confetti(), 400);
        setTimeout(()=>{ level = 1; score = 0; scoreEl.innerText = score; renderLevel(); }, 3000);
      } else {
        renderLevel();
      }
    });

    // celebrate element: attach to the scene's parent container so it sits between tiles and the Next button
    const celebrateHtml = '<div id="countCelebrate" class="celebrate">🎉</div>';
    const sceneContainer = scene.parentElement; // the column container
    if (sceneContainer) sceneContainer.style.position = sceneContainer.style.position || 'relative';
    // insert celebrate element before the Next button so it occupies its own space between choices and next
    const existingCeleb = sceneContainer ? sceneContainer.querySelector('#countCelebrate') : null;
    if (!existingCeleb) {
      if (nextBtn && nextBtn.parentElement === sceneContainer) {
        // insert before nextBtn
        sceneContainer.insertBefore(
          (function(){ const d=document.createElement('div'); d.id='countCelebrate'; d.className='celebrate'; d.innerText='🎉'; return d; })(),
          nextBtn
        );
      } else if (sceneContainer) {
        sceneContainer.insertAdjacentHTML('beforeend', celebrateHtml);
      }
    }

    // initial render
    renderLevel();

    // Back button behavior: if standalone page, go back to index.html, otherwise use navigation
    const backBtn = screen.querySelector('.back-btn');
    if (backBtn) {
      backBtn.addEventListener('click', (e) => {
        if(typeof popSound === 'function') popSound();
        setTimeout(()=>{
          try{
            if (typeof window.goTo === 'function') { window.goTo('hub-games'); }
            else location.href = '../index.html#hub-games';
          }catch(_){ location.href = '../index.html#hub-games'; }
        },90);
      });
    }
  }
  window.startAnimalCounting = startAnimalCounting;
}());