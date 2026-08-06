/* ---------------- COLORING GAME ---------------- */
const SVG_NS = 'http://www.w3.org/2000/svg';
const coloringHintColors = [
  {name:'Green', hex:'#67C971'},
  {name:'Red',   hex:'#FF4F5E'},
  {name:'Blue',  hex:'#4FC3F7'},
];
function hexToRgb(hex){
  const n = parseInt(hex.slice(1), 16);
  return [(n>>16)&255, (n>>8)&255, n&255];
}
function rgbDistance(a, b){
  return Math.abs(a[0]-b[0]) + Math.abs(a[1]-b[1]) + Math.abs(a[2]-b[2]);
}
function sceneHintColor(scene){
  const candidates = coloringHintColors.map(c=>({color:c.hex, count:0}));
  scene.regions.forEach(r=>{
    const rgb = hexToRgb(r.color);
    candidates.forEach(c=>{
      if(rgbDistance(rgb, hexToRgb(c.color)) < 140) c.count++;
    });
  });
  candidates.sort((a,b)=> a.count - b.count);
  const rgb = hexToRgb(candidates[0].color);
  return 'rgba('+rgb[0]+','+rgb[1]+','+rgb[2]+',0.3)';
}
const coloringPalette = [
  {name:'Црвена',      color:'#FF4F5E'},
  {name:'Наранџаста', color:'#FF8C42'},
  {name:'Жута',       color:'#FFD23F'},
  {name:'Зелена',     color:'#67C971'},
  {name:'Плава',      color:'#4FC3F7'},
  {name:'Љубичаста',  color:'#9B6DFF'},
  {name:'Розе',       color:'#FF6F91'},
  {name:'Браон',      color:'#8B5E3C'},
  {name:'Сива',       color:'#9AA5B1'},
  {name:'Бела',       color:'#FFFFFF'},
  {name:'Црна',       color:'#3A3A3A'},
];
const coloringScenes = [
  {
    name: 'Dog',
    regions: [
      {tag:'path',    d:'M74 72 C84 68 90 60 88 52 C90 60 86 72 76 76 Z', color:'#8B5E3C'},
      {tag:'ellipse', attrs:{cx:50, cy:70, rx:28, ry:22}, color:'#8B5E3C'},
      {tag:'ellipse', attrs:{cx:34, cy:92, rx:8, ry:10}, color:'#8B5E3C'},
      {tag:'ellipse', attrs:{cx:66, cy:92, rx:8, ry:10}, color:'#8B5E3C'},
      {tag:'circle',  attrs:{cx:50, cy:40, r:22}, color:'#8B5E3C'},
      {tag:'path',    d:'M31 34 C21 36 17 47 24 57 C28 62 35 60 36 51 C36 45 35 39 33 34 Z', color:'#8B5E3C'},
      {tag:'ellipse', attrs:{cx:72, cy:48, rx:9, ry:16}, color:'#8B5E3C'},
      {tag:'ellipse', attrs:{cx:50, cy:50, rx:15, ry:11}, color:'#FFFFFF'},
      {tag:'ellipse', attrs:{cx:50, cy:47, rx:6, ry:4}, color:'#3A3A3A'},
      {tag:'ellipse', attrs:{cx:50, cy:58, rx:6, ry:8}, color:'#FF4F5E'},
      {tag:'ellipse', attrs:{cx:41, cy:36, rx:6, ry:3}, color:'#3A3A3A'},
      {tag:'ellipse', attrs:{cx:59, cy:36, rx:6, ry:3}, color:'#3A3A3A'},
    ]
  },
  {
    name: 'Cat',
    regions: [
      {tag:'path',    d:'M74 72 C83 66 87 54 83 44 C86 54 83 68 72 76 Z', color:'#FF8C42'},
      {tag:'ellipse', attrs:{cx:50, cy:72, rx:24, ry:20}, color:'#FF8C42'},
      {tag:'ellipse', attrs:{cx:36, cy:90, rx:7, ry:9}, color:'#FF8C42'},
      {tag:'ellipse', attrs:{cx:64, cy:90, rx:7, ry:9}, color:'#FF8C42'},
      {tag:'ellipse', attrs:{cx:50, cy:77, rx:14, ry:10}, color:'#FFFFFF'},
      {tag:'polygon', attrs:{points:'34,28 27,12 44,22'}, color:'#FF8C42'},
      {tag:'polygon', attrs:{points:'66,28 73,12 56,22'}, color:'#FF8C42'},
      {tag:'circle',  attrs:{cx:50, cy:42, r:19}, color:'#FF8C42'},
      {tag:'ellipse', attrs:{cx:50, cy:51, rx:11, ry:8}, color:'#FFFFFF'},
      {tag:'polygon', attrs:{points:'46,46 54,46 50,52'}, color:'#FF6F91'},
      {tag:'ellipse', attrs:{cx:42, cy:37, rx:5, ry:6}, color:'#3A3A3A'},
      {tag:'ellipse', attrs:{cx:58, cy:37, rx:5, ry:6}, color:'#3A3A3A'},
    ]
  },
  {
    name: 'Cow',
    regions: [
      {tag:'ellipse', attrs:{cx:50, cy:74, rx:28, ry:22}, color:'#FFFFFF'},
      {tag:'ellipse', attrs:{cx:32, cy:94, rx:7, ry:9}, color:'#FFFFFF'},
      {tag:'ellipse', attrs:{cx:68, cy:94, rx:7, ry:9}, color:'#FFFFFF'},
      {tag:'ellipse', attrs:{cx:38, cy:66, rx:9, ry:6}, color:'#8B5E3C'},
      {tag:'ellipse', attrs:{cx:62, cy:78, rx:8, ry:6}, color:'#3A3A3A'},
      {tag:'polygon', attrs:{points:'34,24 30,10 42,19'}, color:'#FFD23F'},
      {tag:'polygon', attrs:{points:'66,24 70,10 58,19'}, color:'#FFD23F'},
      {tag:'ellipse', attrs:{cx:50, cy:42, rx:19, ry:17}, color:'#FFFFFF'},
      {tag:'ellipse', attrs:{cx:50, cy:56, rx:12, ry:8}, color:'#FF6F91'},
      {tag:'circle',  attrs:{cx:45, cy:56, r:3.5}, color:'#3A3A3A'},
      {tag:'circle',  attrs:{cx:55, cy:56, r:3.5}, color:'#3A3A3A'},
      {tag:'circle',  attrs:{cx:41, cy:38, r:5}, color:'#3A3A3A'},
      {tag:'circle',  attrs:{cx:59, cy:38, r:5}, color:'#3A3A3A'},
    ]
  },
  {
    name: 'Lion',
    regions: [
      {tag:'path',    d:'M26 80 C16 78 11 86 12 94 C14 90 18 82 26 80 Z', color:'#FF8C42'},
      {tag:'ellipse', attrs:{cx:50, cy:80, rx:24, ry:17}, color:'#FFD23F'},
      {tag:'ellipse', attrs:{cx:36, cy:95, rx:7, ry:8}, color:'#FFD23F'},
      {tag:'ellipse', attrs:{cx:64, cy:95, rx:7, ry:8}, color:'#FFD23F'},
      {tag:'circle',  attrs:{cx:50, cy:44, r:26}, color:'#FF8C42'},
      {tag:'circle',  attrs:{cx:50, cy:44, r:17}, color:'#FFD23F'},
      {tag:'circle',  attrs:{cx:31, cy:32, r:5}, color:'#FF8C42'},
      {tag:'circle',  attrs:{cx:69, cy:32, r:5}, color:'#FF8C42'},
      {tag:'ellipse', attrs:{cx:50, cy:51, rx:10, ry:8}, color:'#FFFFFF'},
      {tag:'circle',  attrs:{cx:50, cy:47, r:4.5}, color:'#8B5E3C'},
      {tag:'circle',  attrs:{cx:46, cy:54, r:3.5}, color:'#3A3A3A'},
      {tag:'circle',  attrs:{cx:54, cy:54, r:3.5}, color:'#3A3A3A'},
      {tag:'circle',  attrs:{cx:42, cy:40, r:5}, color:'#3A3A3A'},
      {tag:'circle',  attrs:{cx:58, cy:40, r:5}, color:'#3A3A3A'},
    ]
  },
  {
    name: 'Elephant',
    regions: [
      {tag:'ellipse', attrs:{cx:50, cy:76, rx:28, ry:20}, color:'#9AA5B1'},
      {tag:'ellipse', attrs:{cx:32, cy:94, rx:8, ry:9}, color:'#9AA5B1'},
      {tag:'ellipse', attrs:{cx:68, cy:94, rx:8, ry:9}, color:'#9AA5B1'},
      {tag:'ellipse', attrs:{cx:28, cy:48, rx:13, ry:20}, color:'#9AA5B1'},
      {tag:'ellipse', attrs:{cx:28, cy:48, rx:7, ry:13}, color:'#FF6F91'},
      {tag:'circle',  attrs:{cx:52, cy:44, r:20}, color:'#9AA5B1'},
      {tag:'path',    d:'M58 58 C65 66 67 78 62 86 C60 90 54 90 51 86 C52 84 54 80 54 74 C54 66 55 62 56 58 Z', color:'#9AA5B1'},
      {tag:'ellipse', attrs:{cx:56, cy:87, rx:4.5, ry:3}, color:'#8B5E3C'},
      {tag:'circle',  attrs:{cx:58, cy:40, r:5}, color:'#3A3A3A'},
    ]
  },
  {
    name: 'Frog',
    regions: [
      {tag:'ellipse', attrs:{cx:50, cy:70, rx:28, ry:24}, color:'#67C971'},
      {tag:'ellipse', attrs:{cx:50, cy:76, rx:18, ry:14}, color:'#FFD23F'},
      {tag:'circle',  attrs:{cx:36, cy:34, r:12}, color:'#67C971'},
      {tag:'circle',  attrs:{cx:64, cy:34, r:12}, color:'#67C971'},
      {tag:'circle',  attrs:{cx:36, cy:34, r:8}, color:'#FFFFFF'},
      {tag:'circle',  attrs:{cx:64, cy:34, r:8}, color:'#FFFFFF'},
      {tag:'circle',  attrs:{cx:36, cy:34, r:4}, color:'#3A3A3A'},
      {tag:'circle',  attrs:{cx:64, cy:34, r:4}, color:'#3A3A3A'},
      {tag:'circle',  attrs:{cx:28, cy:66, r:6}, color:'#FF4F5E'},
      {tag:'circle',  attrs:{cx:72, cy:66, r:6}, color:'#FF4F5E'},
    ]
  },
  {
    name: 'Pig',
    regions: [
      {tag:'path',    d:'M74 76 C84 74 87 66 82 62 C86 66 85 78 74 80 Z', color:'#FF6F91'},
      {tag:'ellipse', attrs:{cx:50, cy:74, rx:26, ry:21}, color:'#FF6F91'},
      {tag:'ellipse', attrs:{cx:35, cy:93, rx:8, ry:9}, color:'#FF6F91'},
      {tag:'ellipse', attrs:{cx:65, cy:93, rx:8, ry:9}, color:'#FF6F91'},
      {tag:'polygon', attrs:{points:'34,28 27,13 43,21'}, color:'#FF6F91'},
      {tag:'polygon', attrs:{points:'66,28 73,13 57,21'}, color:'#FF6F91'},
      {tag:'circle',  attrs:{cx:50, cy:44, r:21}, color:'#FF6F91'},
      {tag:'ellipse', attrs:{cx:50, cy:56, rx:14, ry:10}, color:'#FF4F5E'},
      {tag:'circle',  attrs:{cx:45, cy:56, r:4}, color:'#3A3A3A'},
      {tag:'circle',  attrs:{cx:55, cy:56, r:4}, color:'#3A3A3A'},
      {tag:'circle',  attrs:{cx:41, cy:38, r:5}, color:'#3A3A3A'},
      {tag:'circle',  attrs:{cx:59, cy:38, r:5}, color:'#3A3A3A'},
    ]
  },
  {
    name: 'Duck',
    regions: [
      {tag:'ellipse', attrs:{cx:46, cy:76, rx:26, ry:18}, color:'#FFD23F'},
      {tag:'ellipse', attrs:{cx:46, cy:62, rx:12, ry:13}, color:'#FFFFFF'},
      {tag:'polygon', attrs:{points:'36,90 32,98 40,98'}, color:'#FF8C42'},
      {tag:'polygon', attrs:{points:'54,90 50,98 58,98'}, color:'#FF8C42'},
      {tag:'circle',  attrs:{cx:46, cy:44, r:17}, color:'#FFD23F'},
      {tag:'ellipse', attrs:{cx:63, cy:47, rx:12, ry:6}, color:'#FF8C42'},
      {tag:'circle',  attrs:{cx:52, cy:39, r:4}, color:'#3A3A3A'},
    ]
  },
  {
    name: 'Fox',
    regions: [
      {tag:'path',    d:'M72 78 C86 76 94 66 92 54 C94 64 88 80 72 82 Z', color:'#FF8C42'},
      {tag:'path',    d:'M92 54 C94 60 90 67 84 69 C89 63 91 58 92 54 Z', color:'#FFFFFF'},
      {tag:'ellipse', attrs:{cx:50, cy:74, rx:24, ry:19}, color:'#FF8C42'},
      {tag:'ellipse', attrs:{cx:50, cy:83, rx:12, ry:8}, color:'#FFFFFF'},
      {tag:'ellipse', attrs:{cx:36, cy:92, rx:7, ry:9}, color:'#FF8C42'},
      {tag:'ellipse', attrs:{cx:64, cy:92, rx:7, ry:9}, color:'#FF8C42'},
      {tag:'polygon', attrs:{points:'34,32 26,13 44,23'}, color:'#FF8C42'},
      {tag:'polygon', attrs:{points:'66,32 74,13 56,23'}, color:'#FF8C42'},
      {tag:'polygon', attrs:{points:'32,26 28,16 37,22'}, color:'#FF6F91'},
      {tag:'polygon', attrs:{points:'68,26 72,16 63,22'}, color:'#FF6F91'},
      {tag:'circle',  attrs:{cx:50, cy:44, r:19}, color:'#FF8C42'},
      {tag:'ellipse', attrs:{cx:50, cy:53, rx:11, ry:8}, color:'#FFFFFF'},
      {tag:'circle',  attrs:{cx:50, cy:50, r:4.5}, color:'#3A3A3A'},
      {tag:'circle',  attrs:{cx:41, cy:38, r:5}, color:'#3A3A3A'},
      {tag:'circle',  attrs:{cx:59, cy:38, r:5}, color:'#3A3A3A'},
    ]
  },
  {
    name: 'Sheep',
    regions: [
      {tag:'circle',  attrs:{cx:44, cy:56, r:13}, color:'#FFFFFF'},
      {tag:'circle',  attrs:{cx:56, cy:58, r:12}, color:'#FFFFFF'},
      {tag:'circle',  attrs:{cx:35, cy:66, r:11}, color:'#FFFFFF'},
      {tag:'circle',  attrs:{cx:49, cy:70, r:12}, color:'#FFFFFF'},
      {tag:'circle',  attrs:{cx:61, cy:68, r:11}, color:'#FFFFFF'},
      {tag:'ellipse', attrs:{cx:72, cy:58, rx:11, ry:13}, color:'#3A3A3A'},
      {tag:'circle',  attrs:{cx:73, cy:54, r:4}, color:'#FFFFFF'},
      {tag:'ellipse', attrs:{cx:38, cy:90, rx:4.5, ry:9}, color:'#3A3A3A'},
      {tag:'ellipse', attrs:{cx:62, cy:90, rx:4.5, ry:9}, color:'#3A3A3A'},
    ]
  },
  {
    name: 'Horse',
    regions: [
      {tag:'path',    d:'M22 70 C12 68 6 76 7 88 C9 82 14 73 22 70 Z', color:'#3A3A3A'},
      {tag:'ellipse', attrs:{cx:50, cy:78, rx:27, ry:17}, color:'#8B5E3C'},
      {tag:'ellipse', attrs:{cx:31, cy:90, rx:6, ry:9}, color:'#3A3A3A'},
      {tag:'ellipse', attrs:{cx:72, cy:90, rx:6, ry:9}, color:'#3A3A3A'},
      {tag:'path',    d:'M56 68 C60 56 66 44 72 32 C76 34 80 36 82 38 C78 48 74 60 70 68 C66 72 61 72 56 68 Z', color:'#8B5E3C'},
      {tag:'polygon', attrs:{points:'74,28 58,18 66,26 60,34 68,38 62,46 70,50 66,58 74,62'}, color:'#3A3A3A'},
      {tag:'circle',  attrs:{cx:78, cy:34, r:11}, color:'#8B5E3C'},
      {tag:'ellipse', attrs:{cx:90, cy:40, rx:9, ry:6.5}, color:'#8B5E3C'},
      {tag:'polygon', attrs:{points:'69,26 71,12 78,20'}, color:'#8B5E3C'},
      {tag:'polygon', attrs:{points:'75,26 77,11 84,20'}, color:'#8B5E3C'},
      {tag:'circle',  attrs:{cx:94, cy:40, r:3}, color:'#3A3A3A'},
      {tag:'circle',  attrs:{cx:79, cy:30, r:3.5}, color:'#3A3A3A'},
    ]
  },
  {
    name: 'Chicken',
    regions: [
      {tag:'ellipse', attrs:{cx:48, cy:74, rx:26, ry:18}, color:'#FFFFFF'},
      {tag:'ellipse', attrs:{cx:38, cy:90, rx:5, ry:9}, color:'#FF8C42'},
      {tag:'ellipse', attrs:{cx:52, cy:90, rx:5, ry:9}, color:'#FF8C42'},
      {tag:'circle',  attrs:{cx:46, cy:44, r:16}, color:'#FFFFFF'},
      {tag:'polygon', attrs:{points:'38,32 34,18 42,24 46,15 50,24 57,18 54,32'}, color:'#FF4F5E'},
      {tag:'polygon', attrs:{points:'60,43 73,46 60,50'}, color:'#FFD23F'},
      {tag:'ellipse', attrs:{cx:56, cy:55, rx:4.5, ry:6.5}, color:'#FF4F5E'},
      {tag:'circle',  attrs:{cx:53, cy:41, r:4}, color:'#3A3A3A'},
    ]
  },
];
const coloringSceneLabels = {
  Dog:'Пас', Cat:'Мачка', Cow:'Крава', Lion:'Лав', Elephant:'Слон',
  Frog:'Жаба', Pig:'Свиња', Duck:'Патка', Fox:'Лисица', Sheep:'Овца', Horse:'Коњ', Chicken:'Кока'
};
let coloringSceneIdx = 0;
let coloringSceneOrder = [];
function shuffleColoringScenes(){
  coloringSceneOrder = (window.shuffle ? window.shuffle(coloringScenes.slice()) : coloringScenes.slice());
  coloringSceneIdx = 0;
}
let coloringColor = coloringPalette[0].color;
let coloringSvg, coloringRef, coloringNameEl;
let coloringTotal = 0;
let coloringBusy = false;
let coloringHint = 'rgba(103,201,113,0.3)';

function renderColoringPalette(){
  const paletteEl = document.getElementById('coloringPalette');
  if(!paletteEl) return;
  paletteEl.innerHTML = '';
  coloringPalette.forEach(p=>{
    const swatch = document.createElement('button');
    swatch.type = 'button';
    swatch.className = 'coloring-swatch' + (p.color === coloringColor ? ' selected' : '');
    swatch.style.background = p.color;
    swatch.dataset.color = p.color;
    swatch.setAttribute('aria-label', p.name);
    swatch.addEventListener('click', ()=>{
      coloringColor = p.color;
      if(window.speech) window.speech.speak(p.name);
      renderColoringPalette();
    });
    paletteEl.appendChild(swatch);
  });
}

function createColoringRegion(r, mode){
  const el = document.createElementNS(SVG_NS, r.tag);
  const attrs = r.attrs || r;
  Object.entries(attrs).forEach(([k,v])=>{
    if(k === 'tag' || k === 'color') return;
    el.setAttribute(k, v);
  });
  el.classList.add('coloring-region');
  el.dataset.target = r.color;
  if(mode === 'ref'){
    el.style.fill = r.color;
    el.classList.add('ref-region');
  } else {
    el.style.fill = coloringHint;
    el.setAttribute('tabindex', '0');
    el.setAttribute('role', 'button');
    el.setAttribute('aria-label', 'Обој део');
    el.addEventListener('pointerdown', ()=> tapColoringRegion(el));
    el.addEventListener('keydown', (e)=>{
      if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); tapColoringRegion(el); }
    });
  }
  return el;
}

function buildColoringScene(){
  if(coloringBusy) return;
  const scene = coloringSceneOrder[coloringSceneIdx];
  coloringSvg.innerHTML = '';
  coloringRef.innerHTML = '';
  coloringHint = sceneHintColor(scene);
  coloringTotal = scene.regions.length;
  scene.regions.forEach(r=>{
    coloringRef.appendChild(createColoringRegion(r, 'ref'));
    coloringSvg.appendChild(createColoringRegion(r, 'play'));
  });
  coloringNameEl.textContent = coloringSceneLabels[scene.name] || scene.name;
  const progressEl = document.getElementById('coloringProgress');
  if(progressEl) progressEl.textContent = 'Животиња ' + (coloringSceneIdx + 1) + ' од ' + coloringSceneOrder.length;
  if(window.speech) window.speech.speak('Обој ' + (coloringSceneLabels[scene.name] || scene.name));
}

function tapColoringRegion(el){
  if(coloringBusy || el.classList.contains('ok')) return;
  el.style.fill = coloringColor;
  if(coloringColor === el.dataset.target){
    el.classList.add('ok');
    popSound();
    if(coloringSvg.querySelectorAll('.coloring-region.ok').length >= coloringTotal){
      coloringBusy = true;
      if(window.playAnimalSound) window.playAnimalSound(coloringSceneOrder[coloringSceneIdx].name);
      const last = coloringSceneIdx >= coloringSceneOrder.length - 1;
      if(last){
        if(window.celebrate) window.celebrate('🏅');
        setTimeout(showColoringReward, 700);
      } else {
        if(window.celebrate) window.celebrate();
        setTimeout(()=>{
          coloringSceneIdx++;
          coloringBusy = false;
          buildColoringScene();
        }, 1500);
      }
    }
  }
}

function showColoringReward(){
  const reward = document.getElementById('coloringReward');
  if(reward) reward.hidden = false;
}

function startColoring(){
  coloringSvg = document.getElementById('coloringSvg');
  coloringRef = document.getElementById('coloringRef');
  coloringNameEl = document.getElementById('coloringName');
  if(!coloringSvg || !coloringRef) return;
  const restartBtn = document.getElementById('coloringRestart');
  if(restartBtn) restartBtn.addEventListener('click', ()=>{
    if(window.popSound) window.popSound();
    const reward = document.getElementById('coloringReward');
    if(reward) reward.hidden = true;
    coloringBusy = false;
    shuffleColoringScenes();
    buildColoringScene();
  });
  shuffleColoringScenes();
  renderColoringPalette();
  buildColoringScene();
  const nextBtn = document.getElementById('coloring-next');
  if(nextBtn) nextBtn.addEventListener('click', ()=>{
    if(coloringBusy) return;
    if(window.popSound) window.popSound();
    if(coloringSceneIdx < coloringSceneOrder.length - 1){
      coloringSceneIdx++;
      buildColoringScene();
    }
  });
}
