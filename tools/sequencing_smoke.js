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
    // A placed card must stay VISIBLE inside its slot. This is the task-205
    // regression: the old code absolute-positioned the card at (slotTrayOffset)
    // inside a tray without position:relative, so the card rendered above the
    // viewport and "disappeared" while the placed counter was perfectly happy.
    // Assert the DOM move AND the geometry so a future invisible-drop stays red.
    const vis=JSON.parse(await h.evalv(`JSON.stringify((()=>{const s=document.querySelector('#seq-slots .seq-slot[data-idx="${i}"]');if(!s)return{found:false};const c=s.querySelector('.seq-card');if(!c)return{found:false};const sr=s.getBoundingClientRect(),cr=c.getBoundingClientRect(),hit=document.elementFromPoint(cr.left+cr.width/2,cr.top+cr.height/2);return{found:true,parentIsSlot:s===c.parentNode,inside:cr.left>=sr.left&&cr.top>=sr.top&&cr.right<=sr.right&&cr.bottom<=sr.bottom,hitCard:hit===c||c.contains(hit)};})())`));
    check(`card ${i+1} stays visible inside its slot`,vis.found&&vis.parentIsSlot&&vis.inside&&vis.hitCard,JSON.stringify(vis));
  }
  let nextRound=false; for(let i=0;i<30&&!nextRound;i++){nextRound=(await st()).round===1;if(!nextRound)await sleep(100);}
  check('three correct drops complete the round and celebrate',nextRound&&await h.evalv(`window.__seqCelebrations===1`),JSON.stringify(await st()));

  const roundBefore = (await st()).round;
  for(let i=0;i<3;i++)await drag(i,i);
  /* The invariant is "completing a sequence advances to a DIFFERENT round and
     resets the placed count" — NOT "the round wraps back to 0". This check
     previously waited for `round===0`, which was only ever true because there
     used to be exactly two sequences; adding a third and fourth made the second
     completion advance to round 2 instead, so the check failed while the game
     was behaving perfectly. Same stale-literal trap as the old `===3` pin. */
  let advanced=false; for(let i=0;i<30&&!advanced;i++){const s=await st();advanced=s.placed===0&&s.round!==roundBefore;if(!advanced)await sleep(100);}
  const celebrationsNow = await h.evalv(`window.__seqCelebrations`);
  check('the next completed three-card sequence also celebrates', advanced && celebrationsNow === 2,
    JSON.stringify(await st())+` celebrations=${celebrationsNow}`);
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

  /* Every sequence, not just whichever one happens to be on screen. A sequence
     with duplicate or non-contiguous `order` values would silently break the
     child-facing logic (a duplicated order means two cards are "correct" and one
     slot can never be filled), and a duplicate `label` would give two cards the
     same accessible name. The old offline spec also pinned the step count to 3,
     which is exactly the stale-literal trap this repo keeps hitting — so the
     count is asserted against the data instead. */
  const seqIntegrity = JSON.parse(await h.evalv(`JSON.stringify((() => {
    const out = { seen: [], bad: [] };
    const ids = window.__sequencing.ids();
    out.count = ids.length;
    for (let i = 0; i < ids.length; i++) {
      window.__sequencing.goToRound(i);
      const cur = window.__sequencing.state();
      const slots = document.querySelectorAll('.seq-slot').length;
      const cards = [...document.querySelectorAll('.seq-card')];
      out.seen.push({ id: cur.id, slots, cards: cards.length });
      if (cur.id !== ids[i]) { out.bad.push('round ' + i + ' is ' + cur.id + ', expected ' + ids[i]); continue; }
      if (slots !== cards.length) out.bad.push(cur.id + ': ' + slots + ' slots vs ' + cards.length + ' cards');
      if (slots !== 3) out.bad.push(cur.id + ': expected 3 steps, got ' + slots);
      const orders = cards.map(c => Number(c.dataset.order)).sort((a, b) => a - b);
      if (orders.join(',') !== '0,1,2') out.bad.push(cur.id + ': orders are ' + orders.join(','));
      const labels = cards.map(c => c.querySelector('.seq-emoji').getAttribute('aria-label'));
      if (new Set(labels).size !== labels.length) out.bad.push(cur.id + ': duplicate labels ' + labels.join('/'));
    }
    return out;
  })())`));
  check('every sequence builds: 3 cards, 3 slots, orders 0-2, unique accessible labels',
    seqIntegrity.bad.length === 0 && seqIntegrity.seen.length === seqIntegrity.count,
    seqIntegrity.bad.length ? seqIntegrity.bad.join(' | ') : JSON.stringify(seqIntegrity.seen));

  const root=path.join(__dirname,'..'); const idx=fs.readFileSync(path.join(root,'game','index.html'),'utf8');
  check('hub wired', idx.includes('data-go="game-sequencing"'));
  checkRouteWired('sequencing','game-sequencing','pages/sequencing.html',{back:'seq-back',start:'startSequencing',check});

  // V5.1 (spec §23): learning-stage grammar regions tagged on sequencing.
  const lsj = JSON.parse(await h.evalv(`JSON.stringify({
    found: ['.learn-instruction','.learn-stage-mat','.learn-answers','.learn-feedback'].map(s => !!document.querySelector(s)),
    visible: ['.learn-instruction','.learn-stage-mat'].every(s => { const el = document.querySelector(s); if (!el) return false; const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; }),
    bogus: !!document.querySelector('.learn-does-not-exist'),
    overflow: document.documentElement.scrollWidth <= innerWidth + 1
  })`));
  check('V5.1 grammar: all four §23 regions present on sequencing', lsj.found.every(Boolean), JSON.stringify(lsj));
  check('V5.1 grammar: instruction + stage-mat render a real box; no h-overflow; non-vacuous', lsj.visible && lsj.overflow && lsj.bogus === false, JSON.stringify(lsj));

  await h.close(); const f=getFails(); console.log(f===0?'ALL PASS':'SOME FAIL ('+f+')'); process.exit(f?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
