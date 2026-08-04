/* ---------------- SHAPES GAME ---------------- */
const shapeDefs = [
  {type:'circle', color:'#FF6F91', name:'Circle'},
  {type:'square', color:'#4FC3F7', name:'Square'},
  {type:'triangle', color:'#67C971', name:'Triangle'},
  {type:'star', color:'#FFD23F', name:'Star'},
];
const shapeNames = {Circle:'Круг',Square:'Квадрат',Triangle:'Троугао',Star:'Звезда'};
const stage = document.getElementById('shapesStage');
let placedCount = 0;
let roundShapes = [];
let kbSelected = null;

function startShapesRound(){
  stage.querySelectorAll('.slot,.piece').forEach(el=>el.remove());
  clearKbSelected();
  placedCount = 0;
  roundShapes = shuffle(shapeDefs).slice(0,3);
  const slotOrder = shuffle(roundShapes);
  const trayOrder = shuffle(roundShapes);
  const xPositions = [22,50,78];

  slotOrder.forEach((s,i)=>{
    const el = document.createElement('div');
    el.className = 'slot ' + s.type;
    el.dataset.type = s.type;
    el.style.left = xPositions[i] + '%';
    el.tabIndex = 0;
    el.setAttribute('role', 'button');
    el.setAttribute('aria-label', shapeNames[s.name] + ', притисни Ентер да ставиш облик');
    stage.appendChild(el);
    attachSlotKeys(el);
  });

  trayOrder.forEach((s,i)=>{
    const el = document.createElement('div');
    el.className = 'piece shape-fill ' + s.type;
    el.dataset.type = s.type;
    el.dataset.name = s.name;
    el.style.left = xPositions[i] + '%';
    el.style.background = s.color;
    el.tabIndex = 0;
    el.setAttribute('role', 'button');
    el.setAttribute('aria-label', shapeNames[s.name] + ', притисни Ентер да изабереш облик');
    stage.appendChild(el);
    attachDrag(el);
    attachPieceKeys(el);
  });
}

function clearKbSelected(){
  if(kbSelected) kbSelected.classList.remove('kb-selected');
  kbSelected = null;
}

function placePiece(piece, slot){
  piece.style.left = slot.style.left;
  piece.style.top = slot.style.top || '26%';
  piece.style.transform = 'translate(-50%,-50%) scale(1)';
  piece.dataset.done = '1';
  piece.style.cursor = 'default';
  slot.dataset.filled = '1';
  slot.style.border = 'none';
  slot.style.background = 'transparent';
  successChime();
  if(window.speech && window.speech.speak) window.speech.speak(shapeNames[piece.dataset.name] || piece.dataset.name);
  placedCount++;
  if(placedCount >= roundShapes.length){
    setTimeout(()=>{
      if(window.celebrate) window.celebrate();
      setTimeout(()=>{ startShapesRound(); }, 1400);
    }, 250);
  }
}

function attachSlotKeys(slot){
  slot.addEventListener('keydown', (e)=>{
    if(e.key === 'Enter' || e.key === ' '){
      e.preventDefault();
      if(!kbSelected || slot.dataset.filled || slot.dataset.type !== kbSelected.dataset.type) return;
      const piece = kbSelected;
      clearKbSelected();
      placePiece(piece, slot);
    }
  });
}

function attachPieceKeys(piece){
  piece.addEventListener('keydown', (e)=>{
    if(e.key === 'Enter' || e.key === ' '){
      e.preventDefault();
      if(piece.dataset.done) return;
      if(kbSelected === piece){ clearKbSelected(); return; }
      clearKbSelected();
      kbSelected = piece;
      piece.classList.add('kb-selected');
    }
  });
}

function attachDrag(piece){
  let startX, startY, origLeftPx, origTopPx, dx=0, dy=0;
  piece.addEventListener('pointerdown', (e)=>{
    if(piece.dataset.done) return;
    piece.setPointerCapture(e.pointerId);
    piece.classList.add('dragging');
    startX = e.clientX; startY = e.clientY;
    dx = 0; dy = 0;
  });
  piece.addEventListener('pointermove', (e)=>{
    if(!piece.classList.contains('dragging')) return;
    dx = e.clientX - startX;
    dy = e.clientY - startY;
    piece.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(1.08)`;
  });
  piece.addEventListener('pointerup', (e)=>{
    if(!piece.classList.contains('dragging')) return;
    piece.classList.remove('dragging');
    const rect = piece.getBoundingClientRect();
    const cx = rect.left + rect.width/2;
    const cy = rect.top + rect.height/2;
    const slots = stage.querySelectorAll('.slot');
    let matched = null;
    slots.forEach(slot=>{
      if(slot.dataset.filled) return;
      const r = slot.getBoundingClientRect();
      if(cx > r.left && cx < r.right && cy > r.top && cy < r.bottom && slot.dataset.type === piece.dataset.type){
        matched = slot;
      }
    });
    if(matched){
      clearKbSelected();
      placePiece(piece, matched);
    } else {
      piece.style.transform = 'translate(-50%,-50%) scale(1)';
      gentleMiss();
    }
  });
}

