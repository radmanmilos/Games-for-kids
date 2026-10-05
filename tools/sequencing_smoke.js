/* Sequencing smoke test — R24 "Редослед" pilot.
   Covers reachable drag targets, gentle wrong-drop feedback, three-card
   completion, celebration cadence, and registry/hub wiring. */
const { start, check, getFails } = require('./headless.js');
const { checkRouteWired } = require('./route_contract.js');
const fs = require('fs');
const path = require('path');
const sleep = ms => new Promise(r=>setTimeout(r,ms));
const STUB = `window.speech={speak:function(){},cancel:function(){}};window.audioBuses.play=function(){};window.audioBuses.speakWithDuck=function(t,cb){if(cb)cb();};window.__seqCelebrations=0;window.__seqMisses=0;window.celebrate=function(){window.__seqCelebrations++};window.gentleMiss=function(){window.__seqMisses++};window.successChime=function(){};window.speakSr=function(){}; true`;
(async()=>{
  const h=await start({page:'/pages/sequencing.html',tag:'seq-smoke',width:1024,height:800});
  let ready=false; for(let i=0;i<20&&!ready;i++){ ready=await h.evalv(`typeof window.startSequencing==='function'&&!!window.__sequencing&&document.querySelectorAll('.seq-slot').length>=3&&document.querySelectorAll('.seq-card').length>=3`); if(!ready) await sleep(200); }
  check('sequencing booted', ready); await h.evalv(STUB);
  const st=async()=>JSON.parse(await h.evalv(`JSON.stringify(window.__sequencing.state())`));
  const s=await st(); check('starts with three cards and empty slots', s.slots===3 && s.placed===0, JSON.stringify(s));
  const geometry=JSON.parse(await h.evalv(`JSON.stringify([...document.querySelectorAll('.seq-slot,.seq-card')].map(el=>{const r=el.getBoundingClientRect(),hit=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return r.width>=80&&r.height>=80&&r.top>=0&&r.left>=0&&r.bottom<=innerHeight&&r.right<=innerWidth&&(hit===el||el.contains(hit))}))`));
  check('all cards and slots are reachable large targets',geometry.length===6&&geometry.every(Boolean),JSON.stringify(geometry));

  const drag=async(order,slot)=>{
    const from=await h.boxOf(`#seq-tray .seq-card[data-order="${order}"]`);
    const to=await h.boxOf(`#seq-slots .seq-slot[data-idx="${slot}"]`);
    if(!from.ok||!to.ok)return{ok:false,why:!from.ok?from.why:to.why};
    await h.dragTo(from.x,from.y,to.x,to.y);
    return{ok:true};
  };
  const firstWrong=await drag(1,0);
  const wrong=await st();
  const missFeedback=await h.evalv(`document.getElementById('seq-feedback').textContent`);
  check('wrong drag is gentle and does not advance',firstWrong.ok&&wrong.placed===0&&wrong.misses===1&&missFeedback==='Покушај поново'&&await h.evalv(`window.__seqMisses===1`),JSON.stringify(wrong));

  for(let i=0;i<3;i++){
    const moved=await drag(i,i);
    if(!moved.ok){check(`card ${i+1} can be dragged into its slot`,false,moved.why);break;}
    const placed=await h.waitFor(`window.__sequencing.state().placed===${i+1}`,{label:`card ${i+1} to fill its matching slot`});
    check(`card ${i+1} fills its matching slot`,placed.ok,placed.why);
  }
  let nextRound=false; for(let i=0;i<30&&!nextRound;i++){nextRound=(await st()).round===1;if(!nextRound)await sleep(100);}
  check('three correct drops complete the round and celebrate',nextRound&&await h.evalv(`window.__seqCelebrations===1`),JSON.stringify(await st()));

  for(let i=0;i<3;i++)await drag(i,i);
  let wrapped=false; for(let i=0;i<30&&!wrapped;i++){wrapped=(await st()).round===0&&(await st()).placed===0;if(!wrapped)await sleep(100);}
  check('the next completed three-card sequence also celebrates',wrapped&&await h.evalv(`window.__seqCelebrations===2`),JSON.stringify(await st()));
  // Touch draggability. The drag uses pointer events and a mouse-driven harness
  // cannot reproduce a finger: at the default `touch-action:auto` the browser
  // claims the gesture for panning and fires `pointercancel`, so the card stops
  // following the child's thumb while mouse smokes stay green. Pin the computed
  // style instead. Same bug class as the sorting drag fixed in task 200.
  const dragStyle = JSON.parse(await h.evalv(`JSON.stringify((() => {
    const el = document.querySelector('.seq-card');
    if (!el) return { found: false };
    const cs = getComputedStyle(el);
    return { found: true, touchAction: cs.touchAction };
  })())`));
  check('sequence cards declare touch-action:none so a finger drag is not cancelled by the browser',
    dragStyle.found === true && dragStyle.touchAction === 'none',
    `computed touch-action = ${dragStyle.touchAction} (must be 'none')`);

  const root=path.join(__dirname,'..'); const idx=fs.readFileSync(path.join(root,'game','index.html'),'utf8');
  check('hub wired', idx.includes('data-go="game-sequencing"'));
  checkRouteWired('sequencing','game-sequencing','pages/sequencing.html',{back:'seq-back',start:'startSequencing',check});
  await h.close(); const f=getFails(); console.log(f===0?'ALL PASS':'SOME FAIL ('+f+')'); process.exit(f?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
