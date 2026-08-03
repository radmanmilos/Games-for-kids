(function(){
  const scenes = [
    {title:'Другари из парка', theme:'park', skyTop:'#7EC8FF', skyBottom:'#D9F3FF', hill:'#A8E08B', ground:'#7CCB68', groundDark:'#62B44E', animals:['🐶','👧','🐶','👦']},
    {title:'Немир у кући', theme:'house', skyTop:'#FFD9A8', skyBottom:'#FFF3E0', hill:'#F4D9A8', ground:'#E9B879', groundDark:'#D9A56B', animals:['🐱','🐱','🧶','🪴']},
    {title:'Другари из саване', theme:'savanna', skyTop:'#FFC93C', skyBottom:'#FFF3C4', hill:'#E7C66A', ground:'#D9B45B', groundDark:'#C39B45', animals:['🦁','🦓','🦒','🌴']},
    {title:'У морским дубинама', theme:'sea', skyTop:'#2FA8D8', skyBottom:'#BDEBFF', hill:'#F0D9A8', ground:'#F5DE9A', groundDark:'#E0C079', animals:['🐟','🐠','🐬','🦀']},
    {title:'Другари из шуме', theme:'forest', skyTop:'#9BE0B0', skyBottom:'#E2F7E4', hill:'#7FC99A', ground:'#63B87E', groundDark:'#4FA567', animals:['🦊','🦌','🐿️','🍄']}
  ];
  const GRIDS = [2,3];

  function rr(ctx,x,y,w,h,r){
    ctx.beginPath();
    ctx.moveTo(x+r,y);
    ctx.arcTo(x+w,y,x+w,y+h,r);
    ctx.arcTo(x+w,y+h,x,y+h,r);
    ctx.arcTo(x,y+h,x,y,r);
    ctx.arcTo(x,y,x+w,y,r);
    ctx.closePath();
  }

  function paintParkDecor(ctx, gy){
    ctx.fillStyle='#8B5A2B'; ctx.fillRect(58,gy-40,18,40);
    ctx.fillStyle='#5DAE47';
    ctx.beginPath(); ctx.arc(67,gy-68,38,0,Math.PI*2); ctx.arc(35,gy-54,26,0,Math.PI*2); ctx.arc(99,gy-54,26,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#8B5A2B'; ctx.fillRect(574,gy-42,18,42);
    ctx.fillStyle='#4C9E43';
    ctx.beginPath(); ctx.arc(583,gy-70,36,0,Math.PI*2); ctx.arc(552,gy-56,25,0,Math.PI*2); ctx.arc(614,gy-56,25,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='rgba(255,255,255,.85)';
    for(let x=185;x<515;x+=44){ ctx.fillRect(x,gy-36,12,36); }
    ctx.fillRect(165,gy-30,390,9);
    ctx.fillRect(165,gy-10,390,9);
    [[420,gy-6],[245,gy-12],[470,gy-18],[330,gy-8]].forEach(([x,y])=>{
      ctx.strokeStyle='#4C9E43'; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x,y-16); ctx.stroke();
      ctx.fillStyle='#FF8FA3'; ctx.beginPath(); ctx.arc(x,y-16,9,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#FFD23F'; ctx.beginPath(); ctx.arc(x,y-24,5,0,Math.PI*2); ctx.fill();
    });
  }

  function paintHouseDecor(ctx, gy){
    ctx.fillStyle='#F4A63B'; ctx.fillRect(225,gy-150,190,150);
    ctx.fillStyle='#E56B4B';
    ctx.beginPath(); ctx.moveTo(208,gy-150); ctx.lineTo(320,gy-236); ctx.lineTo(432,gy-150); ctx.closePath(); ctx.fill();
    ctx.fillStyle='#D9534F'; ctx.fillRect(398,gy-210,20,92);
    ctx.fillStyle='#8B5A2B'; ctx.fillRect(290,gy-70,40,70);
    ctx.fillStyle='#FFD23F'; ctx.beginPath(); ctx.arc(310,gy-35,5,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#BFEFFF'; ctx.fillRect(240,gy-120,40,38); ctx.fillRect(360,gy-120,40,38);
    ctx.strokeStyle='#fff'; ctx.lineWidth=4; ctx.strokeRect(240,gy-120,40,38); ctx.strokeRect(360,gy-120,40,38);
    ctx.fillStyle='#6BBF59';
    ctx.beginPath(); ctx.arc(180,gy-10,26,0,Math.PI*2); ctx.arc(212,gy-4,20,0,Math.PI*2); ctx.fill();
  }

  function paintSavannaDecor(ctx, gy){
    ctx.fillStyle='#A9713B'; ctx.fillRect(574,gy-42,14,42);
    ctx.fillStyle='#7FB069';
    ctx.beginPath(); ctx.ellipse(505,gy-78,86,24,0,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(663,gy-78,86,24,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#A9713B'; ctx.fillRect(60,gy-78,12,78);
    ctx.fillStyle='#4C9E43'; ctx.beginPath(); ctx.arc(66,gy-90,30,0,Math.PI*2); ctx.fill();
    for(let i=0;i<6;i++){
      ctx.save(); ctx.translate(66,gy-92); ctx.rotate(i*Math.PI/3);
      ctx.fillStyle='#6BBF59'; ctx.beginPath(); ctx.ellipse(28,0,30,10,0,0,Math.PI*2); ctx.fill();
      ctx.restore();
    }
    ctx.strokeStyle='#C89B3C'; ctx.lineWidth=3;
    for(let x=230;x<560;x+=52){
      ctx.beginPath(); ctx.moveTo(x,gy+4);
      ctx.quadraticCurveTo(x-8,gy-16,x-14,gy-30);
      ctx.quadraticCurveTo(x,gy-8,x+2,gy+4);
      ctx.stroke();
    }
  }

  function paintForestDecor(ctx, gy){
    ctx.fillStyle='#6E4A2F'; ctx.fillRect(66,gy-34,18,34);
    ctx.fillStyle='#2F7E46';
    ctx.beginPath(); ctx.moveTo(75,gy-78); ctx.lineTo(34,gy-22); ctx.lineTo(116,gy-22); ctx.closePath(); ctx.fill();
    ctx.fillStyle='#3E9E5F';
    ctx.beginPath(); ctx.moveTo(75,gy-110); ctx.lineTo(42,gy-44); ctx.lineTo(108,gy-44); ctx.closePath(); ctx.fill();
    ctx.fillStyle='#6E4A2F'; ctx.fillRect(566,gy-36,18,36);
    ctx.fillStyle='#2F7E46';
    ctx.beginPath(); ctx.moveTo(575,gy-80); ctx.lineTo(534,gy-24); ctx.lineTo(616,gy-24); ctx.closePath(); ctx.fill();
    ctx.fillStyle='#3E9E5F';
    ctx.beginPath(); ctx.moveTo(575,gy-112); ctx.lineTo(542,gy-46); ctx.lineTo(608,gy-46); ctx.closePath(); ctx.fill();
    [[430,gy-8],[485,gy-14],[335,gy-16]].forEach(([x,y])=>{
      ctx.fillStyle='#F4E6D3'; ctx.fillRect(x-3,y,6,14);
      ctx.fillStyle='#E56B4B'; ctx.beginPath(); ctx.arc(x,y,13,Math.PI,0); ctx.fill();
      ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(x-5,y-5,2.5,0,Math.PI*2); ctx.arc(x+5,y-4,2,0,Math.PI*2); ctx.fill();
    });
    ctx.fillStyle='#4C9E43';
    ctx.beginPath(); ctx.arc(210,gy-10,26,0,Math.PI*2); ctx.arc(240,gy-4,18,0,Math.PI*2); ctx.fill();
  }

  function paint(ctx, scene){
    const W=640, H=420, gy=280;
    ctx.clearRect(0,0,W,H);
    const sky=ctx.createLinearGradient(0,0,0,gy);
    sky.addColorStop(0,scene.skyTop); sky.addColorStop(1,scene.skyBottom);
    ctx.fillStyle=sky; ctx.fillRect(0,0,W,gy);

    if(scene.theme!=='sea'){
      const glow=ctx.createRadialGradient(84,72,6,84,72,64);
      glow.addColorStop(0,'rgba(255,241,150,.95)');
      glow.addColorStop(1,'rgba(255,241,150,0)');
      ctx.fillStyle=glow; ctx.beginPath(); ctx.arc(84,72,64,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#FFE28A'; ctx.beginPath(); ctx.arc(84,72,26,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='rgba(255,255,255,.85)';
      [[300,62,1],[450,86,.75],[180,100,.6]].forEach(([x,y,s])=>{
        ctx.beginPath();
        ctx.arc(x,y,22*s,0,Math.PI*2);
        ctx.arc(x+26*s,y+4,17*s,0,Math.PI*2);
        ctx.arc(x-26*s,y+4,17*s,0,Math.PI*2);
        ctx.fill();
      });
      ctx.fillStyle=scene.hill;
      ctx.beginPath(); ctx.ellipse(140,gy+18,310,120,0,Math.PI,0); ctx.fill();
      ctx.beginPath(); ctx.ellipse(520,gy+26,330,126,0,Math.PI,0); ctx.fill();
      const gr=ctx.createLinearGradient(0,gy,0,H);
      gr.addColorStop(0,scene.ground); gr.addColorStop(1,scene.groundDark);
      ctx.fillStyle=gr; ctx.fillRect(0,gy,W,H-gy);
      ctx.strokeStyle='rgba(255,255,255,.35)'; ctx.lineWidth=2;
      for(let x=8;x<W;x+=18){ ctx.beginPath(); ctx.moveTo(x,gy+4); ctx.quadraticCurveTo(x+3,gy+16,x+7,gy+24); ctx.stroke(); }
    } else {
      ctx.fillStyle='rgba(255,255,255,.14)';
      for(let i=0;i<4;i++){ ctx.beginPath(); ctx.moveTo(110+i*140,0); ctx.lineTo(190+i*140,0); ctx.lineTo(310+i*140,gy); ctx.lineTo(230+i*140,gy); ctx.closePath(); ctx.fill(); }
      ctx.strokeStyle='rgba(255,255,255,.7)'; ctx.lineWidth=2;
      [[120,90],[200,170],[440,70],[500,140],[300,210]].forEach(([x,y])=>{ ctx.beginPath(); ctx.arc(x,y,7,0,Math.PI*2); ctx.stroke(); });
      ctx.fillStyle=scene.ground; ctx.fillRect(0,gy,W,H-gy);
      ctx.fillStyle=scene.groundDark;
      ctx.beginPath(); ctx.ellipse(320,gy+70,340,40,0,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle='#3E9E5F'; ctx.lineWidth=6; ctx.lineCap='round';
      [[95,gy+4],[555,gy+4],[625,gy+4]].forEach(([x,y])=>{
        ctx.beginPath(); ctx.moveTo(x,y);
        ctx.quadraticCurveTo(x-16,y-55,x+6,y-105);
        ctx.quadraticCurveTo(x+18,y-145,x-2,y-175);
        ctx.stroke();
      });
      ctx.fillStyle='#D9A066';
      ctx.beginPath(); ctx.ellipse(210,gy+12,44,20,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#C88850';
      ctx.beginPath(); ctx.ellipse(500,gy+16,34,16,0,0,Math.PI*2); ctx.fill();
    }

    if(scene.theme==='park') paintParkDecor(ctx,gy);
    else if(scene.theme==='house') paintHouseDecor(ctx,gy);
    else if(scene.theme==='savanna') paintSavannaDecor(ctx,gy);
    else if(scene.theme==='forest') paintForestDecor(ctx,gy);

    ctx.textAlign='center';
    ctx.textBaseline='alphabetic';
    ctx.font='64px "Apple Color Emoji","Segoe UI Emoji",sans-serif';
    scene.animals.forEach((a,i)=>{
      const x=140+i*125;
      ctx.fillStyle='rgba(0,0,0,.16)';
      ctx.beginPath(); ctx.ellipse(x,gy+24,32,9,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#000'; ctx.fillText(a,x,gy+12);
    });

    ctx.fillStyle='rgba(255,255,255,.94)';
    rr(ctx,150,10,340,52,26); ctx.fill();
    ctx.strokeStyle='rgba(74,63,107,.3)'; ctx.lineWidth=3; rr(ctx,150,10,340,52,26); ctx.stroke();
    ctx.fillStyle='#4A3F6B'; ctx.font='700 26px Fredoka, sans-serif'; ctx.textBaseline='middle';
    ctx.fillText(scene.title,320,37);
  }

  function startAnimalPuzzle(){
    const app = document.getElementById('app');
    const screen = document.createElement('div');
    screen.id = 'game-puzzle';
    screen.className = 'screen';
    screen.innerHTML = '<button class="back-btn" aria-label="Назад на игре">←</button>' +
      '<div class="score">Слагалице <span id="puzzleScore">0</span></div>' +
      '<div class="puzzle-area"><h1 id="puzzleTitle"></h1><div class="puzzle-info" id="puzzleLevel"></div>' +
      '<button class="scene-button" id="sceneButton" aria-label="Почни слагалицу"><canvas id="scenePreview" width="640" height="420"></canvas></button>' +
      '<div class="scene-hint" id="sceneHint">Додирни слику да направиш слагалицу</div>' +
      '<div id="puzzleStage" hidden><div id="puzzleBoard" aria-label="Место за слагалицу"></div>' +
      '<button id="puzzleNext" aria-label="Следећа слагалица">➜</button></div></div>';
    app.appendChild(screen);

    const title = screen.querySelector('#puzzleTitle');
    const levelLabel = screen.querySelector('#puzzleLevel');
    const preview = screen.querySelector('#scenePreview');
    const sceneButton = screen.querySelector('#sceneButton');
    const hint = screen.querySelector('#sceneHint');
    const stage = screen.querySelector('#puzzleStage');
    const board = screen.querySelector('#puzzleBoard');
    const next = screen.querySelector('#puzzleNext');
    const scoreEl = screen.querySelector('#puzzleScore');
    let level = 0;
    let score = 0;
    let rows = GRIDS[0], columns = GRIDS[0];
    let sceneImage = '';
    let placedCount = 0;

    function setGrid(){ const s = GRIDS[level % GRIDS.length]; rows = s; columns = s; }

    function drawScene(scene){
      paint(preview.getContext('2d'), scene);
      sceneImage = preview.toDataURL('image/png');
    }

    function updateLabels(scene){
      title.textContent = scene.title;
      levelLabel.textContent = 'Слагалица ' + (level + 1) + '  ·  ' + columns + '×' + columns;
    }

    function setPiecePosition(piece,left,top){
      piece.style.left = left + 'px';
      piece.style.top = top + 'px';
    }

    function scatterPieces(pieces){
      const stageWidth = stage.clientWidth;
      const stageHeight = stage.clientHeight;
      pieces.forEach(piece=>{
        const maxLeft = Math.max(0, stageWidth - piece.offsetWidth - 8);
        const maxTop = Math.max(0, stageHeight - piece.offsetHeight - 8);
        setPiecePosition(piece, 4 + Math.random()*maxLeft, 4 + Math.random()*maxTop);
      });
    }

    function startPuzzle(){
      setGrid();
      const scene = scenes[level % scenes.length];
      updateLabels(scene);
      sceneButton.hidden = true;
      hint.hidden = true;
      stage.hidden = false;
      board.innerHTML = '';
      board.style.backgroundImage = 'none';
      board.style.gridTemplateColumns = 'repeat(' + columns + ',1fr)';
      board.style.gridTemplateRows = 'repeat(' + rows + ',1fr)';
      stage.querySelectorAll('.piece').forEach(piece=>piece.remove());
      next.classList.remove('show');
      placedCount = 0;
      const cellW = board.offsetWidth / columns;
      const cellH = board.offsetHeight / rows;
      const pieces = [];
      for(let row=0; row<rows; row++){
        for(let col=0; col<columns; col++){
          const slot = document.createElement('div');
          slot.className = 'board-slot';
          board.appendChild(slot);
          const piece = document.createElement('div');
          piece.className = 'piece';
          piece.dataset.row = row;
          piece.dataset.col = col;
          piece.setAttribute('role','button');
          piece.setAttribute('aria-label','Део слагалице ' + (row * columns + col + 1));
          piece.style.width = cellW + 'px';
          piece.style.height = cellH + 'px';
          piece.style.backgroundImage = 'url("' + sceneImage + '")';
          piece.style.backgroundSize = (columns * 100) + '% ' + (rows * 100) + '%';
          piece.style.backgroundPosition = (col * 100 / (columns - 1)) + '% ' + (row * 100 / (rows - 1)) + '%';
          pieces.push(piece);
          stage.appendChild(piece);
          enableDragging(piece);
        }
      }
      requestAnimationFrame(()=>scatterPieces(pieces));
    }

    function enableDragging(piece){
      let offsetX = 0;
      let offsetY = 0;
      let dragging = false;
      piece.addEventListener('pointerdown',(event)=>{
        if(piece.classList.contains('placed')) return;
        const rect = piece.getBoundingClientRect();
        offsetX = event.clientX - rect.left;
        offsetY = event.clientY - rect.top;
        dragging = true;
        piece.classList.add('dragging');
        piece.setPointerCapture(event.pointerId);
        if(typeof tone === 'function') tone(520, 0.06, 0, 'triangle');
      });
      piece.tabIndex = 0;
      piece.addEventListener('keydown',(event)=>{
        if(event.key === 'Enter' || event.key === ' '){
          event.preventDefault();
          if(piece.classList.contains('placed')) return;
          placePieceKb(piece);
        }
      });
      piece.addEventListener('pointermove',(event)=>{
        if(!dragging) return;
        const stageRect = stage.getBoundingClientRect();
        const maxLeft = stage.clientWidth - piece.offsetWidth;
        const maxTop = stage.clientHeight - piece.offsetHeight;
        setPiecePosition(piece,
          Math.max(0, Math.min(maxLeft, event.clientX - stageRect.left - offsetX)),
          Math.max(0, Math.min(maxTop, event.clientY - stageRect.top - offsetY)));
      });
      piece.addEventListener('pointerup',()=>{
        if(dragging){ dragging=false; piece.classList.remove('dragging'); dropPiece(piece); }
      });
      piece.addEventListener('pointercancel',()=>{
        dragging=false; piece.classList.remove('dragging');
      });
    }

    function dropPiece(piece){
      const boardRect = board.getBoundingClientRect();
      const stageRect = stage.getBoundingClientRect();
      const pieceRect = piece.getBoundingClientRect();
      const row = Number(piece.dataset.row);
      const col = Number(piece.dataset.col);
      const cellW = boardRect.width / columns;
      const cellH = boardRect.height / rows;
      const targetLeft = boardRect.left - stageRect.left + col * cellW;
      const targetTop = boardRect.top - stageRect.top + row * cellH;
      const pieceCenterX = pieceRect.left - stageRect.left + pieceRect.width / 2;
      const pieceCenterY = pieceRect.top - stageRect.top + pieceRect.height / 2;
      const targetCenterX = targetLeft + cellW / 2;
      const targetCenterY = targetTop + cellH / 2;
      const closeEnough = Math.abs(pieceCenterX-targetCenterX) < cellW*.42 &&
        Math.abs(pieceCenterY-targetCenterY) < cellH*.42;
      if(!closeEnough) return;
      setPiecePosition(piece,targetLeft,targetTop);
      piece.style.width = cellW + 'px';
      piece.style.height = cellH + 'px';
      piece.classList.add('placed');
      placedCount += 1;
      if(typeof popSound === 'function') popSound();
      if(placedCount === rows * columns) completePuzzle();
    }

    function placePieceKb(piece){
      const boardRect = board.getBoundingClientRect();
      const stageRect = stage.getBoundingClientRect();
      const row = Number(piece.dataset.row);
      const col = Number(piece.dataset.col);
      const cellW = boardRect.width / columns;
      const cellH = boardRect.height / rows;
      const targetLeft = boardRect.left - stageRect.left + col * cellW;
      const targetTop = boardRect.top - stageRect.top + row * cellH;
      setPiecePosition(piece, targetLeft, targetTop);
      piece.style.width = cellW + 'px';
      piece.style.height = cellH + 'px';
      piece.classList.add('placed');
      placedCount += 1;
      if(typeof popSound === 'function') popSound();
      if(placedCount === rows * columns) completePuzzle();
    }

    function completePuzzle(){
      score += 1;
      scoreEl.textContent = score;
      board.style.backgroundImage = 'url("' + sceneImage + '")';
      board.style.backgroundSize = 'cover';
      board.querySelectorAll('.board-slot').forEach(slot=>slot.style.visibility='hidden');
      stage.querySelectorAll('.piece').forEach(piece=>piece.style.visibility='hidden');
      if(window.celebrate) window.celebrate();
      next.classList.add('show');
    }

    function nextPuzzle(){
      if(typeof popSound === 'function') popSound();
      level += 1;
      setGrid();
      const scene = scenes[level % scenes.length];
      drawScene(scene);
      updateLabels(scene);
      sceneButton.hidden = false;
      hint.hidden = false;
      stage.hidden = true;
    }

    sceneButton.addEventListener('click',startPuzzle);
    next.addEventListener('click',nextPuzzle);
    const backButton = screen.querySelector('.back-btn');
    backButton.addEventListener('click',()=>{
      if(typeof popSound === 'function') popSound();
      setTimeout(()=>{
        if(location.pathname.split('/').pop().toLowerCase().replace(/\.html$/,'') === 'animal_puzzle') location.href='../index.html';
        else if(window.goTo) window.goTo('hub');
      },90);
    });
    drawScene(scenes[0]);
    updateLabels(scenes[0]);
  }
  window.startAnimalPuzzle = startAnimalPuzzle;
}());
