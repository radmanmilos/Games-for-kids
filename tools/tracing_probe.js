/* Tracing (Писање) matching-metric table probe — dev tool for tuning the
   pass/reject thresholds. Draws the canonical good/bad drawings headlessly and
   prints, for each case, the exact metrics matchResult uses:
     cov    fraction of the guide covered by ink (dilated by TOL_COV)
     ink    grid ink cells
     ratio  ink/ref cell counts
     near   fraction of ink within 2 cells of the guide  (the MIN_NEAR metric)
     hist   [d0..d5] Chebyshev-distance histogram of ink to the guide
   Run:  node tools/tracing_probe.js
   The pass rule in tracing.js is: cov >= MIN_COVER && near >= MIN_NEAR && ink <= MAX_INK. */
const { start } = require('./headless.js');

const sleep = ms => new Promise(r => setTimeout(r, ms));

const CLEAR = `(function(){const cv=document.getElementById('tracingCanvas');cv.getContext('2d').clearRect(0,0,cv.width,cv.height);return true;})()`;
const DRAW_REF = (label, lineWidth, scale) => `(function(){
  const W=200;
  const off=document.createElement('canvas'); off.width=W; off.height=W;
  const g=off.getContext('2d');
  g.lineJoin='round'; g.lineCap='round'; g.lineWidth=${lineWidth}; g.strokeStyle='#000';
  g.font='900 144px Fredoka, "Segoe UI", Arial, sans-serif'; g.textAlign='center'; g.textBaseline='middle';
  g.strokeText('${label}', W/2, W/2+W*0.02);
  const cv=document.getElementById('tracingCanvas');
  const c=cv.getContext('2d');
  c.drawImage(off, ${scale}, ${scale}, ${scale + 180}, ${scale + 180});
  return true;
})()`;
const METRICS = `JSON.stringify((function(){
  const G=48, DC=5;
  const ref=window.__traceDebug.refGrid();
  const ink=window.__traceDebug.inkGrid();
  const dil=(g,r)=>{const R=G+2*r,RR=R+1;const acc=new Int32Array(RR*RR);const c0=v=>Math.max(0,v),c1=v=>Math.min(R,v);
    for(let j=0;j<G;j++)for(let i=0;i<G;i++){if(!g[j*G+i])continue;const x0=c0(i),x1=c1(i+2*r+1),y0=c0(j),y1=c1(j+2*r+1);
      acc[y0*RR+x0]++;acc[y0*RR+x1]--;acc[y1*RR+x0]--;acc[y1*RR+x1]++;}
    const out=new Uint8Array(G*G);const A=new Int32Array(RR*RR);
    for(let j=0;j<RR;j++)for(let i=0;i<RR;i++){A[j*RR+i]=acc[j*RR+i]+(i>0?A[j*RR+i-1]:0)+(j>0?A[(j-1)*RR+i]:0)-(i>0&&j>0?A[(j-1)*RR+i-1]:0);
      if(A[j*RR+i]>0&&j>=r&&j<r+G&&i>=r&&i<r+G)out[(j-r)*G+(i-r)]=1;}return out;};
  const dist=new Int32Array(G*G).fill(DC);let cur=ref;
  for(let d=0;d<=DC;d++){if(d>0)cur=dil(cur,1);for(let k=0;k<G*G;k++){if(cur[k]&&dist[k]>d)dist[k]=d;}}
  const inkD=dil(ink,4);
  let rc=0,ic=0,cov=0;for(let k=0;k<G*G;k++){if(ref[k]){rc++;if(inkD[k])cov++;}if(ink[k])ic++;}
  const hist=[0,0,0,0,0,0];for(let k=0;k<G*G;k++){if(ink[k])hist[dist[k]]++;}
  const near=(hist[0]+hist[1]+hist[2])/ic;
  return {cap:document.getElementById('tracingCaption').textContent, cov:+(cov/rc).toFixed(2), ink:ic, ratio:+(ic/rc).toFixed(2), near:+near.toFixed(2), hist};
})())`;

const ENTER = k => `document.querySelector('#tracingHub .activity-btn[data-activity="${k}"]').click(); true`;
const CLICK = id => `document.getElementById('${id}').click(); true`;
const LINE = `(function(){
  const cv=document.getElementById('tracingCanvas');const c=cv.getContext('2d');c.lineWidth=16;c.lineCap='round';c.strokeStyle='#000';
  c.beginPath();c.moveTo(20,cv.height/2);c.lineTo(cv.width-20,cv.height/2);c.stroke();return true;})()`;
const SCRIBBLE = `(function(){
  const cv=document.getElementById('tracingCanvas');const c=cv.getContext('2d');c.lineWidth=16;c.lineCap='round';c.strokeStyle='#9B6DFF';
  for(let i=0;i<=20;i++){c.beginPath();c.moveTo(i*20,0);c.lineTo(i*20-40,cv.height);c.stroke();c.beginPath();c.moveTo(0,i*20);c.lineTo(cv.width,i*20-40);c.stroke();}return true;})()`;
const BLOB = `(function(){const cv=document.getElementById('tracingCanvas');const c=cv.getContext('2d');c.lineWidth=16;c.strokeStyle='#000';c.beginPath();c.arc(200,200,150,0,Math.PI*2);c.fill();return true;})()`;

(async () => {
  const h = await start({ page: '/pages/tracing.html', tag: 'tracing-probe', width: 1280, height: 800 });
  try {
    await sleep(900);
    await h.evalv(`window.speech={speak:function(t,cb){if(cb)cb();},cancel:function(){}};window.popSound=window.gentleMiss=function(){}; true`);

    async function measure(name, fn) {
      await h.evalv(CLEAR);
      await h.evalv(fn);
      await sleep(60);
      console.log(name, ':', await h.evalv(METRICS));
    }

    await h.evalv(ENTER('letters')); await sleep(250);
    await measure('PERFECT А', DRAW_REF('А', 14, 20));
    await h.evalv(CLICK('tracingNext')); await sleep(200);
    await measure('SLOPPY Б', `(function(){
      const W=200;const off=document.createElement('canvas');off.width=W;off.height=W;
      const g=off.getContext('2d');g.lineJoin='round';g.lineCap='round';g.lineWidth=18;g.strokeStyle='#000';
      g.font='900 144px Fredoka, "Segoe UI", Arial, sans-serif';g.textAlign='center';g.textBaseline='middle';
      g.strokeText('Б',W/2,W/2+W*0.02);
      const cv=document.getElementById('tracingCanvas');const c=cv.getContext('2d');
      c.drawImage(off,45,55,260,260);
      c.beginPath();c.moveTo(30,40);c.lineTo(120,90);c.stroke();c.beginPath();c.moveTo(300,340);c.lineTo(360,320);c.stroke();return true;})()`);
    await h.evalv(CLICK('tracingNext')); await sleep(200);
    await measure('LINE В', LINE);

    await h.evalv(CLICK('tracingBack')); await sleep(150);
    await h.evalv(ENTER('numbers')); await sleep(250);
    await measure('PERFECT 0', DRAW_REF('0', 14, 20));
    await h.evalv(CLICK('tracingNext')); await sleep(200);
    await measure('BLOB 1', BLOB);
    await h.evalv(CLICK('tracingNext')); await sleep(200);
    await measure('PERFECT 2', DRAW_REF('2', 14, 20));
    await measure('FAT 2', DRAW_REF('2', 40, 20));
    await measure('SCRIBBLE 2', SCRIBBLE);
    await h.evalv(CLICK('tracingNext')); await sleep(200);
    await measure('LINE 3', LINE);
  } finally {
    h.close();
  }
  process.exit(0);
})();
