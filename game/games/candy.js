/* ---------------- CANDY POP GAME (swap-to-match, animal boxes) ---------------- */
/* Task 66: level milestones — each level has a target score, a cute progress bar
   fills toward it, the grid grows one row + one column per level (tiles shrink so
   the grid always fits on screen), and the animal set rotates (farm → wild). */
const CANDY_SETS = [
  [ /* farm animals (level 1) */
    {color:'#FF6F61', name:'Dog',      emoji:'🐶'},
    {color:'#FFA84D', name:'Cow',      emoji:'🐮'},
    {color:'#FFD23F', name:'Pig',      emoji:'🐷'},
    {color:'#67C971', name:'Duck',     emoji:'🦆'},
    {color:'#4FC3F7', name:'Horse',    emoji:'🐴'},
    {color:'#9B6DFF', name:'Chicken',  emoji:'🐔'},
  ],
  [ /* wild animals (level 2+) */
    {color:'#FF6F61', name:'Lion',     emoji:'🦁'},
    {color:'#FFA84D', name:'Elephant', emoji:'🐘'},
    {color:'#FFD23F', name:'Frog',     emoji:'🐸'},
    {color:'#67C971', name:'Fox',      emoji:'🦊'},
    {color:'#4FC3F7', name:'Cat',      emoji:'🐱'},
    {color:'#9B6DFF', name:'Sheep',    emoji:'🐑'},
  ],
];
const LEVELS = [ // grid grows one row+column per level; size then stays 8x8
  { size:4, target:60 },
  { size:5, target:80 },
  { size:6, target:100 },
  { size:7, target:120 },
  { size:8, target:140 },
];
const TOP_BUDGET_VMIN = 14; // vertical room for the level bar row + gap above the grid
const candyNamePlural = {
  Dog:'Пси', Cow:'Краве', Pig:'Свиње', Duck:'Патке', Horse:'Коњи', Chicken:'Коке',
  Lion:'Лавови', Elephant:'Слонови', Frog:'Жабе', Fox:'Лисице', Cat:'Мачке', Sheep:'Овце'
};
let ROWS = 4, COLS = 4;
let CELL_VMIN = 17, GAP_VMIN = 2.2, PITCH_VMIN = 19.2;
let candyTypes = CANDY_SETS[0];
let board = [];      // type values; -1 = star, null = transiently empty
let tileEls = [];    // DOM element currently occupying each board cell
let candyBusy = false;
let score = 0;
let combo = 0; // cascade chain counter (1 = first match, 2+ = combo)
let level = 1;
let target = 60;
const candyGrid = document.getElementById('candyGrid');
const candyScore = document.getElementById('candyScore');

function updateScore(add){
  if(add) score += add;
  candyScore.querySelector('.matching-score-value').textContent = score;
  updateLevelBar();
}

function getLevelCfg(lv){
  const idx = Math.min(LEVELS.length - 1, lv - 1);
  const base = LEVELS[idx];
  return {
    size: base.size,
    target: base.target + Math.max(0, lv - LEVELS.length) * 40,
    types: CANDY_SETS[(lv - 1) % CANDY_SETS.length],
  };
}

function setGridMetrics(n){
  PITCH_VMIN = Math.floor((100 - TOP_BUDGET_VMIN) / n * 100) / 100;
  GAP_VMIN = Math.max(1.2, Math.min(2.4, Math.round(PITCH_VMIN * 0.14 * 100) / 100));
  CELL_VMIN = PITCH_VMIN - GAP_VMIN;
}

function updateLevelBar(){
  const fill = document.getElementById('candyBarFill');
  if(!fill) return;
  const pct = Math.max(0, Math.min(100, Math.round(score / target * 100)));
  fill.style.width = pct + '%';
}

function randType(){ return Math.floor(Math.random()*candyTypes.length); }
function applyTileVisual(el, type){
  el.classList.toggle('star', type === -1);
  if(type === -1){ el.textContent = '⭐'; el.style.background = ''; }
  else { el.textContent = candyTypes[type].emoji; el.style.background = candyTypes[type].color; }
}

function setTilePos(el, r, c, instant){
  if(instant) el.style.transition = 'none';
  el.style.left = (c*PITCH_VMIN) + 'vmin';
  el.style.top = (r*PITCH_VMIN) + 'vmin';
  el.style.transform = 'translate(0,0)';
  el.dataset.r = r; el.dataset.c = c;
  if(instant){ void el.offsetWidth; el.style.transition = ''; }
}

function createTile(type, r, c, dropFromAbove){
  const el = document.createElement('div');
  el.className = 'candy';
  el.style.width = CELL_VMIN + 'vmin';
  el.style.height = CELL_VMIN + 'vmin';
  el.style.fontSize = (CELL_VMIN * 0.56) + 'vmin';
  el.style.borderRadius = (CELL_VMIN * 0.3) + 'vmin';
  applyTileVisual(el, type);
  el.setAttribute('role', 'button');
  el.tabIndex = 0;
  el.setAttribute('aria-label', type === -1 ? 'Звезда, притисни Ентер да пукне' : 'Бомбон');
  candyGrid.appendChild(el);
  attachCandyDrag(el);
  attachCandyKeys(el);
  if(dropFromAbove){
    el.style.transition = 'none';
    el.style.left = (c*PITCH_VMIN) + 'vmin';
    el.style.top = (-PITCH_VMIN*1.3) + 'vmin';
    el.style.transform = 'translate(0,0)';
    el.dataset.r = r; el.dataset.c = c;
    void el.offsetWidth;
    el.style.transition = '';
    requestAnimationFrame(()=> setTilePos(el, r, c, false));
  } else {
    setTilePos(el, r, c, true);
  }
  return el;
}

function startLevel(lv){
  level = lv;
  combo = 0;
  const cfg = getLevelCfg(lv);
  candyTypes = cfg.types;
  ROWS = COLS = cfg.size;
  target = cfg.target;
  setGridMetrics(cfg.size);
  candyGrid.style.width = (cfg.size * PITCH_VMIN - GAP_VMIN) + 'vmin';
  candyGrid.style.height = (cfg.size * PITCH_VMIN - GAP_VMIN) + 'vmin';
  score = 0;
  updateScore(0);
  const label = document.getElementById('candyLevelLabel');
  if(label) label.textContent = 'Ниво ' + lv + ' · до ' + target;
  updateLevelBar();
  buildBoard();
}

function buildBoard(){
  candyBusy = false;
  candyGrid.innerHTML = '';
  board = []; tileEls = [];
  for(let r=0;r<ROWS;r++){
    board.push([]); tileEls.push([]);
    for(let c=0;c<COLS;c++){
      let t;
      do{ t = randType(); }
      while(
        (c>=2 && board[r][c-1]===t && board[r][c-2]===t) ||
        (r>=2 && board[r-1][c]===t && board[r-2][c]===t)
      );
      board[r].push(t);
      tileEls[r].push(createTile(t, r, c, false));
    }
  }
  setTimeout(()=>{ if(!candyBusy && !hasPossibleMove()) spawnStar(); }, 400);
}

function hasStar(){
  for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++) if(board[r][c]===-1) return true;
  return false;
}

function startCandy(){ startLevel(1); }

// Export for standalone pages
if (typeof window !== 'undefined') window.startCandy = startCandy;

/* ---- swap dragging, with a real-time mirrored preview of the neighbor ---- */
function attachCandyDrag(el){
  let startX, startY, dragging = false, locked = false, dir = null, neighborEl = null;
  let r1, c1, r2, c2;

  el.addEventListener('pointerdown', (e)=>{
    const r = +el.dataset.r, c = +el.dataset.c;
    if(board[r][c] === -1){
      dragging = 'star';
      startX = e.clientX; startY = e.clientY;
      el.setPointerCapture(e.pointerId);
      return;
    }
    if(candyBusy) return;
    dragging = true; locked = false; dir = null; neighborEl = null;
    r1 = r; c1 = c;
    el.classList.add('dragging');
    el.setPointerCapture(e.pointerId);
    startX = e.clientX; startY = e.clientY;
  });

  el.addEventListener('pointermove', (e)=>{
    if(dragging === 'star' || !dragging) return;
    const dx = e.clientX - startX, dy = e.clientY - startY;
    const max = vminToPx(PITCH_VMIN);
    if(!locked){
      if(Math.abs(dx) > 10 || Math.abs(dy) > 10){
        locked = true;
        dir = Math.abs(dx) > Math.abs(dy) ? (dx>0?'right':'left') : (dy>0?'down':'up');
        let nr = r1, nc = c1;
        if(dir==='right') nc++; else if(dir==='left') nc--; else if(dir==='down') nr++; else nr--;
        if(nr>=0 && nr<ROWS && nc>=0 && nc<COLS){
          r2 = nr; c2 = nc;
          neighborEl = tileEls[nr][nc];
          if(neighborEl) neighborEl.classList.add('dragging');
        } else { neighborEl = null; }
      }
    }
    if(!locked) return;
    let mx=0, my=0;
    if(dir==='right') mx = Math.max(0, Math.min(dx, max));
    else if(dir==='left') mx = Math.min(0, Math.max(dx, -max));
    else if(dir==='down') my = Math.max(0, Math.min(dy, max));
    else if(dir==='up') my = Math.min(0, Math.max(dy, -max));
    el.style.transform = `translate(${mx}px, ${my}px)`;
    if(neighborEl) neighborEl.style.transform = `translate(${-mx}px, ${-my}px)`;
  });

  el.addEventListener('pointerup', (e)=>{
    if(dragging === 'star'){
      dragging = false;
      const r = +el.dataset.r, c = +el.dataset.c;
      const dx = e.clientX - startX, dy = e.clientY - startY;
      if(Math.abs(dx) < 18 && Math.abs(dy) < 18) explodeStarAt(r,c);
      return;
    }
    if(!dragging) return;
    dragging = false;
    el.classList.remove('dragging');
    if(locked && neighborEl){
      neighborEl.classList.remove('dragging');
      const max = vminToPx(PITCH_VMIN);
      let mx=0, my=0;
      if(dir==='right') mx=max; else if(dir==='left') mx=-max; else if(dir==='down') my=max; else my=-max;
      el.style.transition = 'transform .15s ease';
      neighborEl.style.transition = 'transform .15s ease';
      el.style.transform = `translate(${mx}px, ${my}px)`;
      neighborEl.style.transform = `translate(${-mx}px, ${-my}px)`;
      candyBusy = true;
      const elA = el, elB = neighborEl, rr1=r1, cc1=c1, rr2=r2, cc2=c2;
      setTimeout(()=> commitSwap(rr1,cc1,rr2,cc2, elA, elB), 160);
    } else {
      el.style.transform = 'translate(0,0)';
    }
  });
}

function attachCandyKeys(el){
  el.addEventListener('keydown', (e)=>{
    const r = +el.dataset.r, c = +el.dataset.c;
    if(board[r][c] === -1){
      if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); explodeStarAt(r,c); }
      return;
    }
    if(candyBusy) return;
    const dirs = {ArrowLeft:[0,-1], ArrowRight:[0,1], ArrowUp:[-1,0], ArrowDown:[1,0]};
    const d = dirs[e.key];
    if(!d) return;
    e.preventDefault();
    const nr = r + d[0], nc = c + d[1];
    if(nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) return;
    if(board[nr][nc] === -1) return;
    candyBusy = true;
    commitSwap(r, c, nr, nc, el, tileEls[nr][nc]);
  });
}

function commitSwap(r1,c1,r2,c2, elA, elB){
  [board[r1][c1], board[r2][c2]] = [board[r2][c2], board[r1][c1]];
  tileEls[r1][c1] = elB; tileEls[r2][c2] = elA;
  setTilePos(elA, r2, c2, true);
  setTilePos(elB, r1, c1, true);
  elA.style.transition = ''; elB.style.transition = '';

  const matched = findMatches();
  if(matched.size === 0){
    gentleMiss();
    setTimeout(()=>{
      [board[r1][c1], board[r2][c2]] = [board[r2][c2], board[r1][c1]];
      tileEls[r1][c1] = elA; tileEls[r2][c2] = elB;
      setTilePos(elA, r1, c1, false);
      setTilePos(elB, r2, c2, false);
      setTimeout(()=>{ candyBusy = false; if(!hasPossibleMove() && !hasStar()) spawnStar(); }, 340);
    }, 380);
  } else {
    resolveMatches();
  }
}

function findMatches(){
  const matched = new Set();
  const isCandy = (v)=> v !== null && v !== -1;
  for(let r=0;r<ROWS;r++){
    let start = 0;
    for(let c=1;c<=COLS;c++){
      const same = c<COLS && board[r][c] === board[r][start] && isCandy(board[r][start]);
      if(same){ continue; }
      if(c - start >= 3){ for(let k=start;k<c;k++) matched.add(r+','+k); }
      start = c;
    }
  }
  for(let c=0;c<COLS;c++){
    let start = 0;
    for(let r=1;r<=ROWS;r++){
      const same = r<ROWS && board[r][c] === board[start][c] && isCandy(board[start][c]);
      if(same){ continue; }
      if(r - start >= 3){ for(let k=start;k<r;k++) matched.add(k+','+c); }
      start = r;
    }
  }
  return matched;
}

function hasPossibleMove(){
  for(let r=0;r<ROWS;r++){
    for(let c=0;c<COLS;c++){
      if(board[r][c] === -1) continue;
      if(c+1<COLS && board[r][c+1] !== -1){
        [board[r][c], board[r][c+1]] = [board[r][c+1], board[r][c]];
        const found = findMatches().size > 0;
        [board[r][c], board[r][c+1]] = [board[r][c+1], board[r][c]];
        if(found) return true;
      }
      if(r+1<ROWS && board[r+1][c] !== -1){
        [board[r][c], board[r+1][c]] = [board[r+1][c], board[r][c]];
        const found = findMatches().size > 0;
        [board[r][c], board[r+1][c]] = [board[r+1][c], board[r][c]];
        if(found) return true;
      }
    }
  }
  return false;
}

function starSound(){ [784,988,1175,1568].forEach((f,i)=> tone(f,0.15,i*0.07,'sine')); }
function starBoom(){ [300,450,650,900,1250].forEach((f,i)=> tone(f,0.25,i*0.05,'triangle')); }

function spawnStar(){
  candyBusy = true;
  const r = Math.floor(Math.random()*ROWS), c = Math.floor(Math.random()*COLS);
  const old = tileEls[r][c];
  if(old) old.remove();
  board[r][c] = -1;
  tileEls[r][c] = createTile(-1, r, c, false);
  starSound();
  /* candyBusy stays true — the star waits for a tap to explode */
}

function explodeStarAt(r,c){
  if(board[r][c] !== -1) return;
  candyBusy = true;
  const cells = [];
  for(let dr=-1;dr<=1;dr++) for(let dc=-1;dc<=1;dc++){
    const rr=r+dr, cc=c+dc;
    if(rr>=0&&rr<ROWS&&cc>=0&&cc<COLS) cells.push([rr,cc]);
  }
  cells.forEach(([rr,cc])=>{
    const el = tileEls[rr][cc];
    if(el) el.classList.add('popping');
  });
  starBoom();
  updateScore(cells.length);
  setTimeout(()=>{
    const cols = new Set();
    cells.forEach(([rr,cc])=>{
      const el = tileEls[rr][cc];
      if(el) el.remove();
      board[rr][cc] = null; tileEls[rr][cc] = null;
      cols.add(cc);
    });
    applyGravityAnimated(cols);
    setTimeout(resolveMatches, 420);
  }, 260);
}

function applyGravityAnimated(cols){
  cols.forEach(c=>{
    const survivors = [];
    for(let r=0;r<ROWS;r++){ if(board[r][c] !== null) survivors.push({type:board[r][c], el:tileEls[r][c]}); }
    const missing = ROWS - survivors.length;
    const newTileEls = new Array(ROWS).fill(null);
    survivors.forEach((s,i)=>{
      const newR = missing + i;
      newTileEls[newR] = s.el;
      setTilePos(s.el, newR, c, false); // animated slide down
    });
    for(let i=0;i<missing;i++){
      const t = randType();
      newTileEls[i] = createTile(t, i, c, true); // animated drop-in from above
      board[i][c] = t;
    }
    for(let i=0;i<survivors.length;i++){ board[missing+i][c] = survivors[i].type; }
    for(let r=0;r<ROWS;r++){ tileEls[r][c] = newTileEls[r]; }
  });
}

function showCombo(mult){
  let el = candyGrid.querySelector('.combo-float');
  if(!el){
    el = document.createElement('div');
    el.className = 'combo-float';
    el.style.position = 'absolute';
    el.style.top = '50%';
    el.style.left = '50%';
    el.style.fontWeight = '800';
    el.style.fontSize = '8vmin';
    el.style.color = '#FF6F91';
    el.style.textShadow = '0 0.4vmin 0 rgba(255,255,255,.85)';
    el.style.pointerEvents = 'none';
    el.style.zIndex = '30';
    el.style.opacity = '0';
    candyGrid.appendChild(el);
  }
  el.textContent = 'Комбо x' + mult + '!';
  el.animate([
    { transform: 'translate(-50%,-50%) scale(.5)', opacity: 0 },
    { transform: 'translate(-50%,-60%) scale(1.2)', opacity: 1 },
    { transform: 'translate(-50%,-95%) scale(1)', opacity: 0 }
  ], { duration: 900, easing: 'cubic-bezier(.34,1.56,.64,1)' });
  [660, 880, 1100].forEach((f,i)=> tone(f, 0.18, i*0.08, 'triangle'));
}

function resolveMatches(){
  const matched = findMatches();
  if(matched.size === 0){
    combo = 0;
    if(score >= target){ onLevelUp(); return; }
    if(!hasPossibleMove() && !hasStar()) spawnStar();
    else candyBusy = false;
    return;
  }
  combo += 1;
  const cells = [...matched].map(k => k.split(',').map(Number));
  const types = [...new Set(cells.map(([r,c]) => board[r][c]))];
  types.forEach((t,i) => setTimeout(()=> playAnimalSound(candyTypes[t].name), i*170));
  if(combo >= 2) showCombo(combo);
  updateScore(cells.length * combo);
  cells.forEach(([r,c])=>{
    const el = tileEls[r][c];
    if(el) el.classList.add('popping');
  });
  setTimeout(()=>{
    const cols = new Set();
    cells.forEach(([r,c])=>{
      const el = tileEls[r][c];
      if(el) el.remove();
      board[r][c] = null; tileEls[r][c] = null;
      cols.add(c);
    });
    applyGravityAnimated(cols);
    setTimeout(resolveMatches, 420);
  }, 240);
}

function onLevelUp(){
  level += 1;
  combo = 0;
  startLevel(level);
  showLevelUp(level);
  try{ if(window.successChime) window.successChime(); }catch(_){}
}

function showLevelUp(n){
  const msg = document.getElementById('levelUpMsg');
  if(!msg) return;
  const text = document.getElementById('levelUpText');
  if(text) text.textContent = 'Ниво ' + n + '!';
  msg.classList.add('show');
  msg.animate([{opacity:1},{opacity:1},{opacity:0}], { duration:1600, fill:'forwards' }).onfinish = ()=>{
    msg.classList.remove('show');
    msg.getAnimations().forEach(a => a.cancel());
  };
}

function firstMatchType(matched){
  for(const k of matched){ const [r,c] = k.split(',').map(Number); return board[r][c]; }
  return 0;
}

function findHint(){
  for(let r=0;r<ROWS;r++){
    for(let c=0;c<COLS;c++){
      if(board[r][c] === -1) continue;
      if(c+1<COLS && board[r][c+1] !== -1){
        [board[r][c], board[r][c+1]] = [board[r][c+1], board[r][c]];
        const matched = findMatches();
        [board[r][c], board[r][c+1]] = [board[r][c+1], board[r][c]];
        if(matched.size > 0) return { a:[r,c], b:[r,c+1], type: firstMatchType(matched) };
      }
      if(r+1<ROWS && board[r+1][c] !== -1){
        [board[r][c], board[r+1][c]] = [board[r+1][c], board[r][c]];
        const matched = findMatches();
        [board[r][c], board[r+1][c]] = [board[r+1][c], board[r][c]];
        if(matched.size > 0) return { a:[r,c], b:[r+1,c], type: firstMatchType(matched) };
      }
    }
  }
  return null;
}

let hintTimer = null;
function showHint(){
  if(candyBusy) return;
  const hint = findHint();
  if(!hint){ showHintMsg('Нема потеза — сачекај звезду ⭐'); return; }
  const a = tileEls[hint.a[0]][hint.a[1]], b = tileEls[hint.b[0]][hint.b[1]];
  [a,b].forEach(el=>{ if(!el) return; el.classList.remove('hint'); void el.offsetWidth; el.classList.add('hint'); });
  clearTimeout(hintTimer);
  hintTimer = setTimeout(()=> [a,b].forEach(el=>{ if(el) el.classList.remove('hint'); }), 1600);
  const name = candyTypes[hint.type].name;
  showHintMsg('Погледај ' + (candyNamePlural[name] || name) + ' ' + candyTypes[hint.type].emoji + ' 😉');
}

function showHintMsg(text){
  let el = candyGrid.querySelector('.hint-float');
  if(!el){
    el = document.createElement('div');
    el.className = 'hint-float';
    el.style.cssText = 'position:absolute;left:50%;top:38%;transform:translate(-50%,-50%);z-index:30;pointer-events:none;' +
      'background:rgba(255,255,255,.92);color:var(--plum);font-weight:700;font-size:4.2vmin;padding:1.4vmin 3vmin;' +
      'border-radius:999px;box-shadow:0 .8vmin 0 rgba(74,63,107,.15);text-align:center;white-space:nowrap;';
    candyGrid.appendChild(el);
  }
  el.textContent = text;
  el.animate([
    { opacity:0, transform:'translate(-50%,-50%) scale(.7)' },
    { opacity:1, transform:'translate(-50%,-50%) scale(1.05)', offset:.4 },
    { opacity:1, transform:'translate(-50%,-50%) scale(1)', offset:.7 },
    { opacity:0, transform:'translate(-50%,-50%) scale(.95)' }
  ], { duration:2200, easing:'ease', fill:'forwards' });
}

const hintBtn = document.getElementById('candyHintBtn');
if(hintBtn) hintBtn.addEventListener('click', ()=>{ if(window.popSound) window.popSound(); showHint(); });

