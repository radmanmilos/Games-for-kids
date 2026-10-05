/* ---------------- РЕДОСЛЕД (Sequencing) ----------------
   R24 pilot: seed → plant → flower. Start with 3 cards; visual-only,
   drag to numbered slots in the correct order. Gentle feedback, no score.

   Each sequence's `label` is used ONLY as an aria-label — the game speaks just
   the fixed prompt 'Постави у редослед' plus the already-recorded praise/retry
   lines (verified at the card markup, which sets aria-label and nothing else).
   That is why more sequences can be added here with no new Serbian speech,
   while Time/Seasons stay blocked on recordings (see PROJECT_TASKS task 198).
   Keep every sequence at 3 steps: the layout is sized in vmin for three, and a
   longer chain risks the small-viewport clipping this project has already been
   bitten by twice. */
(function(){
  'use strict';
  var SEQ = [
    {id:'plant1', steps:[
      {emoji:'🌱',label:'Семе',order:0},
      {emoji:'🌿',label:'Биљка',order:1},
      {emoji:'🌼',label:'Цвет',order:2}
    ]},
    {id:'fruit', steps:[
      {emoji:'🌸',label:'Цвет',order:0},
      {emoji:'🍏',label:'Мали плод',order:1},
      {emoji:'🍎',label:'Зрела јабука',order:2}
    ]},
    {id:'birds', steps:[
      {emoji:'🥚',label:'Јаје',order:0},
      {emoji:'🐣',label:'Пиле',order:1},
      {emoji:'🐦',label:'Птица',order:2}
    ]},
    {id:'wash', steps:[
      {emoji:'💧',label:'Прљаво',order:0},
      {emoji:'🧼',label:'Перу',order:1},
      {emoji:'✨',label:'Чисто',order:2}
    ]}
  ];
  var round=0, data=null, tray=[], slots=[], placedCount=0, misses=0, locked=false, started=false;
  var promptEl,trayEl,slotsEl,feedbackEl;

  function shuffle(a){ for(var i=a.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)); var t=a[i]; a[i]=a[j]; a[j]=t; } return a; }
  function speak(text){ if(!text)return; if(window.audioBuses&&window.audioBuses.speakWithDuck)window.audioBuses.speakWithDuck(text); else if(window.speech&&window.speech.speak)window.speech.speak(text); }

  function build(){
    slotsEl.innerHTML=''; slots=[];
    data.steps.forEach(function(s,i){
      var slot={index:i, correctOrder:s.order, el:null, filled:null};
      var btn=document.createElement('div'); btn.className='seq-slot'; btn.dataset.idx=String(i);
      btn.innerHTML='<span style="font-size:4vmin;font-weight:700">'+(i+1)+'</span>';
      slotsEl.appendChild(btn); slot.el=btn; slots.push(slot);
    });
    trayEl.innerHTML=''; tray=[];
    var list=data.steps.slice().sort(function(a,b){return a.order-b.order;}).map(function(s){return {step:s, placed:false};});
    shuffle(list).forEach(function(it){
      var card={step:it.step, placed:false, el:null};
      var c=document.createElement('button'); c.type='button'; c.className='seq-card'; c.dataset.order=String(it.step.order);
      c.innerHTML='<span class="seq-emoji" aria-label="'+it.step.label+'">'+it.step.emoji+'</span>';
      enableDrag(card,c); trayEl.appendChild(c); card.el=c; tray.push(card);
    });
  }

  function enableDrag(card,el){
    var dragId=null,dx=0,dy=0,dragging=false,startX=0,startY=0;
    el.addEventListener('pointerdown',function(e){ if(locked||card.placed)return; dragId=e.pointerId; startX=e.clientX; startY=e.clientY; dragging=false; try{el.setPointerCapture(e.pointerId);}catch(_){ }});
    el.addEventListener('pointermove',function(e){ if(e.pointerId!==dragId)return; dx=e.clientX-startX; dy=e.clientY-startY; if(!dragging&&Math.abs(dx)+Math.abs(dy)>6){ dragging=true; el.classList.add('seq-dragging'); }
      if(!dragging)return; el.style.transform='translate('+dx+'px,'+dy+'px)'; var s=slotAt(e.clientX,e.clientY); slots.forEach(function(x){x.el.classList.toggle('seq-over',s===x);}); });
    el.addEventListener('pointerup',function(e){ if(e.pointerId!==dragId)return; dragId=null; if(!dragging){ return; } dragging=false; el.classList.remove('seq-dragging'); el.style.transform=''; var s=slotAt(e.clientX,e.clientY); slots.forEach(function(x){x.el.classList.remove('seq-over');}); if(s) tryDrop(card,s); });
    el.addEventListener('pointercancel',function(){ dragId=null; dragging=false; el.classList.remove('seq-dragging'); el.style.transform=''; slots.forEach(function(x){x.el.classList.remove('seq-over');}); });
  }

  function slotAt(x,y){ for(var i=0;i<slots.length;i++){ var r=slots[i].el.getBoundingClientRect(); if(x>=r.left-10&&x<=r.right+10&&y>=r.top-10&&y<=r.bottom+10)return slots[i]; } return null; }

  function tryDrop(card,slot){ if(slot.filled||card.placed)return; if(Number(card.el.dataset.order)===slot.correctOrder){ card.placed=true; slot.filled=card; card.el.style.position='absolute'; var r=slot.el.getBoundingClientRect(), tr=trayEl.getBoundingClientRect(); card.el.style.left=(r.left-tr.left)+'px'; card.el.style.top=(r.top-tr.top)+'px'; card.el.style.transform=''; placedCount++; if(window.successChime)window.successChime(); if(feedbackEl)feedbackEl.textContent=''; if(placedCount===slots.length) complete(); } else { if(window.gentleMiss)window.gentleMiss(); if(feedbackEl)feedbackEl.textContent='Покушај поново'; misses++; } }

  function complete(){ locked=true; if(window.speakSr)window.speakSr('praise'); if(feedbackEl)feedbackEl.textContent='Браво!'; setTimeout(function(){ if(window.celebrate)window.celebrate(); round=(round+1)%SEQ.length; newRound(); },900); }

  function newRound(){ locked=false; placedCount=0; misses=0; if(feedbackEl)feedbackEl.textContent=''; data=SEQ[round]; build(); speak('Постави у редослед'); }

  function startSequencing(){ if(started)return; started=true; promptEl=document.getElementById('seq-prompt'); trayEl=document.getElementById('seq-tray'); slotsEl=document.getElementById('seq-slots'); feedbackEl=document.getElementById('seq-feedback'); round=0; newRound();
    window.__sequencing={state:function(){return{round:round,id:data.id,slots:slots.length,placed:placedCount,misses:misses}},goToRound:function(n){round=n%SEQ.length;newRound();}};
  }
  window.startSequencing=startSequencing;
})();
