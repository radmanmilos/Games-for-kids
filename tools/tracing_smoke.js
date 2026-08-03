/* Tracing (Писање) free-draw smoke test — the canonical validation for the game.
   Drives the REAL pipeline headlessly: pointer events on the canvas + direct
   canvas drawing feeding matchResult(), success auto-advance, layout checks.
   Run:  node tools/tracing_smoke.js     (from the repo root or anywhere)
   Requires Node >= 22. CHROME_PATH env optional.
   Expected: 22 checks, ALL PASS. */
const { start, check, getFails } = require('./headless.js');

const sleep = ms => new Promise(r => setTimeout(r, ms));

/* ---- page-side helpers (expressions) ---- */
const PIXELS = id => `(function(){const cv=document.getElementById('${id}');const d=cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data;let n=0;for(let i=3;i<d.length;i+=4)if(d[i]>0)n++;return n;})()`;

const CLEAR_OVERLAYS = `document.querySelectorAll('.celebration-overlay.show').forEach(e=>e.classList.remove('show')); true`;

const STUB = `window.speech={speak:function(t,cb){if(cb)cb();},cancel:function(){}};window.popSound=window.gentleMiss=function(){}; true`;

const ENTER = kind => `document.querySelector('#tracingHub .activity-btn[data-activity="${kind}"]').click(); true`;
const CLICK = id => `document.getElementById('${id}').click(); true`;

const CHECK_HUB = `JSON.stringify({
  btns: document.querySelectorAll('#tracingHub .activity-btn').length,
  intro: !!document.getElementById('introDemo'),
  refText: document.getElementById('introRefText').textContent,
  guideDash: document.getElementById('introGuide').getAttribute('stroke-dasharray'),
  inkDash: document.getElementById('introInk').getAttribute('stroke-dasharray'),
  pencil: !!document.getElementById('introPencil'),
  title: document.getElementById('tracingTitle').textContent,
  cap: document.getElementById('introCaption').textContent
})`;

const CHECK_ACT = `JSON.stringify({
  title2: document.getElementById('tracingTitle2').textContent,
  cap: document.getElementById('tracingCaption').textContent,
  counter: document.getElementById('tracingCounter').textContent,
  refSvg: !!document.getElementById('tracingRefSvg'),
  refText: (document.querySelector('#tracingRefSvg text')||{}).textContent || null,
  refCircle: !!document.querySelector('#tracingRefSvg circle'),
  canvas: !!document.getElementById('tracingCanvas'),
  guide: !!document.getElementById('tracingGuide'),
  guidePx: ${PIXELS('tracingGuide')},
  canvasPx: ${PIXELS('tracingCanvas')},
  done: !!document.getElementById('tracingDone'),
  clear: !!document.getElementById('tracingClear')
})`;

const CHECK_LAYOUT = `JSON.stringify({
  refOverlapsCanvas: document.getElementById('tracingRef').getBoundingClientRect().bottom > document.getElementById('tracingCanvas').getBoundingClientRect().top,
  capOverlapsCanvas: document.getElementById('tracingCaption').getBoundingClientRect().top < document.getElementById('tracingCanvas').getBoundingClientRect().bottom
})`;

/* Real pointer pipeline: drag a horizontal line across the canvas. */
const POINTER_LINE = `(function(){
  const cv=document.getElementById('tracingCanvas');
  const r=cv.getBoundingClientRect();
  const fire=(el,type,x,y)=>el.dispatchEvent(new PointerEvent(type,{bubbles:true,cancelable:true,clientX:x,clientY:y,pointerId:1,pointerType:'touch',isPrimary:true}));
  const midY=r.top+r.height/2;
  fire(cv,'pointerdown',r.left+10,midY);
  for(let x=r.left+10;x<=r.right-10;x+=8) fire(window,'pointermove',x,midY);
  fire(window,'pointerup',r.right-10,midY);
  return true;
})()`;

/* Draw a drawing that closely matches the reference glyph (letter/number text
   or a flat shape) onto the child canvas via its own 2d context — feeds the
   real matchResult() rasterization. Offset + slight scale to prove the
   size/position normalization works. */
function DRAW_REF(label, shape) {
  return `(function(){
    const W=200;
    const off=document.createElement('canvas'); off.width=W; off.height=W;
    const g=off.getContext('2d');
    g.lineJoin='round'; g.lineCap='round'; g.lineWidth=14; g.strokeStyle='#000';
    ${shape ? SHAPE_DRAW(shape) : `g.font='900 144px Fredoka, "Segoe UI", Arial, sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.strokeText(${JSON.stringify(label)}, W/2, W/2+W*0.02);`}
    const cv=document.getElementById('tracingCanvas');
    const c=cv.getContext('2d');
    c.drawImage(off, 20, 30, 220, 220);
    return true;
  })()`;
}

function SHAPE_DRAW(shape) {
  if (shape === 'circle') return `g.beginPath(); g.arc(W/2,W/2,W*0.42,0,Math.PI*2); g.stroke();`;
  if (shape === 'square') return `const m=W*0.13; g.beginPath(); g.rect(m,m,W-2*m,W-2*m); g.stroke();`;
  if (shape === 'triangle') return `g.beginPath(); g.moveTo(W/2,W*0.10); g.lineTo(W*0.88,W*0.90); g.lineTo(W*0.12,W*0.90); g.closePath(); g.stroke();`;
  const pts = [50, 10, 61, 35, 98, 35, 68, 57, 79, 91, 50, 70, 21, 91, 32, 57, 2, 35, 39, 35];
  return `const pts=${JSON.stringify(pts)}; g.beginPath(); g.moveTo(W*pts[0]/100,W*pts[1]/100); for(let i=2;i<pts.length;i+=2) g.lineTo(W*pts[i]/100,W*pts[i+1]/100); g.closePath(); g.stroke();`;
}

const SCRIBBLE = `(function(){
  const cv=document.getElementById('tracingCanvas');
  const c=cv.getContext('2d');
  c.lineWidth=16; c.lineJoin='round'; c.lineCap='round'; c.strokeStyle='#9B6DFF';
  for(let i=0;i<=20;i++){
    c.beginPath(); c.moveTo(i*20,0); c.lineTo(i*20-40,cv.height); c.stroke();
    c.beginPath(); c.moveTo(0,i*20); c.lineTo(cv.width,i*20-40); c.stroke();
  }
  return true;
})()`;

const BLOB = `(function(){
  const cv=document.getElementById('tracingCanvas');
  const c=cv.getContext('2d');
  c.lineWidth=16; c.strokeStyle='#000';
  c.beginPath(); c.arc(200,200,150,0,Math.PI*2); c.fill();
  return true;
})()`;

const SLOPPY_B = `(function(){
  const W=200;
  const off=document.createElement('canvas'); off.width=W; off.height=W;
  const g=off.getContext('2d');
  g.lineJoin='round'; g.lineCap='round'; g.lineWidth=18; g.strokeStyle='#000';
  g.font='900 144px Fredoka, "Segoe UI", Arial, sans-serif';
  g.textAlign='center'; g.textBaseline='middle';
  g.strokeText('Б', W/2, W/2+W*0.02);
  const cv=document.getElementById('tracingCanvas');
  const c=cv.getContext('2d');
  c.drawImage(off, 45, 55, 260, 260);
  c.beginPath(); c.moveTo(30,40); c.lineTo(120,90); c.stroke();
  c.beginPath(); c.moveTo(300,340); c.lineTo(360,320); c.stroke();
  return true;
})()`;

const CHECK_RESULT = `JSON.stringify({
  cap: document.getElementById('tracingCaption').textContent,
  celebrate: !!document.querySelector('.celebration-overlay.show'),
  pixels: ${PIXELS('tracingCanvas')}
})`;

(async () => {
  const h = await start({ page: '/pages/tracing.html', tag: 'tracing-smoke', width: 1280, height: 800 });
  try {
    await sleep(900);
    await h.evalv(STUB);

    // 1. Hub renders
    const hub = await h.evalv(CHECK_HUB);
    let H = JSON.parse(hub || '{}');
    check('hub renders 3 buttons + guiding intro', H.btns === 3 && H.intro && H.refText === 'А' && H.guideDash === '4 5' && H.inkDash === '105 2000' && H.pencil && H.title === 'Писање' && H.cap === 'Нацртај сам, прстом!', hub);

    // 2. Enter letters
    await h.evalv(ENTER('letters'));
    await sleep(200);
    const ltr = await h.evalv(CHECK_ACT);
    let L = JSON.parse(ltr || '{}');
    check('letters loads А + dashed guide on canvas', L.title2 === 'Слова' && L.cap === 'Нацртај А' && L.counter === '1 од 30' && L.refSvg && L.refText === 'А' && L.canvas && L.guide && L.guidePx > 0 && L.canvasPx === 0 && L.done && L.clear, ltr);

    // 3. Layout: ref card above canvas, caption below canvas (no overlap)
    const lay = await h.evalv(CHECK_LAYOUT);
    let LY = JSON.parse(lay || '{}');
    check('layout: ref above canvas, caption below, no overlap', LY.refOverlapsCanvas === false && LY.capOverlapsCanvas === false, lay);

    // 4. Done on empty canvas -> gentle nudge, no celebrate
    await h.evalv(CLICK('tracingDone'));
    await sleep(120);
    const empty = await h.evalv(CHECK_RESULT);
    let E = JSON.parse(empty || '{}');
    check('done with empty canvas nudges', E.cap === 'Нацртај А прво!' && !E.celebrate, empty);

    // 5. Real pointer pipeline draws ink on canvas (guide untouched)
    await h.evalv(POINTER_LINE);
    await sleep(100);
    const px1 = await h.evalv(PIXELS('tracingCanvas'));
    check('pointer drag paints ink on canvas', px1 > 100, 'px=' + px1);

    // 6. Clear button wipes the canvas only (guide stays)
    await h.evalv(CLICK('tracingClear'));
    await sleep(100);
    const px2 = await h.evalv(PIXELS('tracingCanvas'));
    const gx2 = await h.evalv(PIXELS('tracingGuide'));
    check('Обриши clears the canvas, guide stays', px2 === 0 && gx2 > 0, 'px=' + px2 + ' guide=' + gx2);

    // 7. Correct А -> PASS (celebrate + word caption), ink kept
    await h.evalv(CLEAR_OVERLAYS);
    await h.evalv(DRAW_REF('А', null));
    await h.evalv(CLICK('tracingDone'));
    await sleep(150);
    const okA = await h.evalv(CHECK_RESULT);
    let A = JSON.parse(okA || '{}');
    check('correct А is accepted', A.cap === 'Аутомобил 🚗' && A.celebrate && A.pixels > 0, okA);

    // 8. Success auto-advances to Б (canvas cleared, finished reset)
    await sleep(2900);
    const adv = await h.evalv(CHECK_ACT);
    let AD = JSON.parse(adv || '{}');
    check('success auto-advances to Б', AD.cap === 'Нацртај Б' && AD.counter === '2 од 30' && AD.refText === 'Б' && AD.canvasPx === 0 && AD.guidePx > 0, adv);

    // 9. Sloppy Б -> PASS (forgiving), then auto-advance to В
    await h.evalv(SLOPPY_B);
    await h.evalv(CLICK('tracingDone'));
    await sleep(150);
    const okB = await h.evalv(CHECK_RESULT);
    let B2 = JSON.parse(okB || '{}');
    check('sloppy Б is accepted (forgiving)', B2.cap === 'Банана 🍌' && B2.celebrate, okB);
    await sleep(2900);
    const adv2 = await h.evalv(CHECK_ACT);
    let AD2 = JSON.parse(adv2 || '{}');
    check('success auto-advances to В', AD2.cap === 'Нацртај В' && AD2.counter === '3 од 30', adv2);

    // 10. Line on В -> REJECT, canvas cleared, no celebrate
    await h.evalv(POINTER_LINE);
    await h.evalv(CLICK('tracingDone'));
    await sleep(150);
    const badLine = await h.evalv(CHECK_RESULT);
    let BL = JSON.parse(badLine || '{}');
    check('single line is rejected', BL.cap === 'Покушај још једном!' && !BL.celebrate && BL.pixels === 0, badLine);

    // 11. Г: dense scribble -> REJECT
    await h.evalv(CLICK('tracingNext'));
    await sleep(200);
    await h.evalv(SCRIBBLE);
    await h.evalv(CLICK('tracingDone'));
    await sleep(150);
    const badScr = await h.evalv(CHECK_RESULT);
    let BS = JSON.parse(badScr || '{}');
    check('dense scribble is rejected', BS.cap === 'Покушај још једном!' && !BS.celebrate && BS.pixels === 0, badScr);

    // 12. Numbers: loads 0, correct 0 -> PASS, auto-advance to 1
    await h.evalv(CLICK('tracingBack'));
    await sleep(150);
    await h.evalv(ENTER('numbers'));
    await sleep(200);
    const num = await h.evalv(CHECK_ACT);
    let U = JSON.parse(num || '{}');
    check('numbers loads 0', U.cap === 'Нацртај 0' && U.counter === '1 од 11' && U.refText === '0', num);
    await h.evalv(CLEAR_OVERLAYS);
    await h.evalv(DRAW_REF('0', null));
    await h.evalv(CLICK('tracingDone'));
    await sleep(150);
    const ok0 = await h.evalv(CHECK_RESULT);
    let Z = JSON.parse(ok0 || '{}');
    check('correct 0 is accepted', Z.cap === '0 · нула' && Z.celebrate, ok0);
    await sleep(2900);
    const adv3 = await h.evalv(CHECK_ACT);
    let AD3 = JSON.parse(adv3 || '{}');
    check('success auto-advances to 1', AD3.cap === 'Нацртај 1' && AD3.counter === '2 од 11', adv3);

    // 13. Blob on 1 -> REJECT (filled shape containing the glyph)
    await h.evalv(BLOB);
    await h.evalv(CLICK('tracingDone'));
    await sleep(150);
    const blob = await h.evalv(CHECK_RESULT);
    let BO = JSON.parse(blob || '{}');
    check('filled blob is rejected', BO.cap === 'Покушај још једном!' && !BO.celebrate && BO.pixels === 0, blob);

    // 14. Shapes: loads Круг, correct circle -> PASS, auto-advance
    await h.evalv(CLICK('tracingBack'));
    await sleep(150);
    await h.evalv(ENTER('shapes'));
    await sleep(200);
    const sh = await h.evalv(CHECK_ACT);
    let S = JSON.parse(sh || '{}');
    check('shapes loads Круг (1 of 4)', S.cap === 'Нацртај Круг' && S.counter === '1 од 4' && S.refCircle, sh);
    await h.evalv(CLEAR_OVERLAYS);
    await h.evalv(DRAW_REF(null, 'circle'));
    await h.evalv(CLICK('tracingDone'));
    await sleep(150);
    const okC = await h.evalv(CHECK_RESULT);
    let C = JSON.parse(okC || '{}');
    check('correct circle is accepted', C.cap === 'Круг' && C.celebrate, okC);
    await sleep(2900);
    const adv4 = await h.evalv(CHECK_ACT);
    let AD4 = JSON.parse(adv4 || '{}');
    check('success auto-advances to Квадрат', AD4.cap === 'Нацртај Квадрат' && AD4.counter === '2 од 4', adv4);

    // 15. Next through shapes, wraps around
    await h.evalv(CLICK('tracingNext'));
    await sleep(120);
    await h.evalv(CLICK('tracingNext'));
    await sleep(120);
    const wrap = await h.evalv(CHECK_ACT);
    let W = JSON.parse(wrap || '{}');
    check('shapes next wraps Квадрат->Троугао->Звезда', W.cap === 'Нацртај Звезда' && W.counter === '4 од 4', wrap);
    await h.evalv(CLICK('tracingNext'));
    await sleep(120);
    const wrap2 = await h.evalv(CHECK_ACT);
    let W2 = JSON.parse(wrap2 || '{}');
    check('shapes wraps to start', W2.cap === 'Нацртај Круг' && W2.counter === '1 од 4', wrap2);

    // 16. index.html hub wiring
    await h.navigate(`http://127.0.0.1:${h.port}/index.html`);
    await sleep(800);
    const idx = await h.evalv(`JSON.stringify({ btn: (document.querySelector('[data-go="game-tracing"]')||{}).textContent, count: document.querySelectorAll('[data-go]').length })`);
    let I = JSON.parse(idx || '{}');
    check('index.html has game-tracing button', I.btn === '✏️' && I.count === 11, idx);
  } finally {
    h.close();
  }
  console.log(getFails() ? '\nRESULT: ' + getFails() + ' FAILED' : '\nRESULT: ALL PASS');
  process.exit(getFails() ? 1 : 0);
})();
