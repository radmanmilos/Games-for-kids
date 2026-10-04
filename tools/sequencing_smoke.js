/* Sequencing smoke test — R24 "Редослед" pilot */
const { start, check, getFails } = require('./headless.js');
const { checkRouteWired } = require('./route_contract.js');
const fs = require('fs');
const path = require('path');
const sleep = ms => new Promise(r=>setTimeout(r,ms));
const STUB = `window.speech={speak:function(){},cancel:function(){}};window.audioBuses.play=function(){};window.audioBuses.speakWithDuck=function(t,cb){if(cb)cb();};window.celebrate=function(){}; true`;
(async()=>{
  const h=await start({page:'/pages/sequencing.html',tag:'seq-smoke',width:1024,height:800});
  let ready=false; for(let i=0;i<20&&!ready;i++){ ready=await h.evalv(`typeof window.startSequencing==='function'&&!!window.__sequencing&&document.querySelectorAll('.seq-slot').length>=3&&document.querySelectorAll('.seq-card').length>=3`); if(!ready) await sleep(200); }
  check('sequencing booted', ready); await h.evalv(STUB);
  const st=async()=>JSON.parse(await h.evalv(`JSON.stringify(window.__sequencing.state())`));
  const s=await st(); check('3 slots+cards', s.slots>=3 && s.placed===0, JSON.stringify(s));
  const root=path.join(__dirname,'..'); const idx=fs.readFileSync(path.join(root,'game','index.html'),'utf8');
  check('hub wired', idx.includes('data-go="game-sequencing"'));
  checkRouteWired('sequencing','game-sequencing','pages/sequencing.html',{back:'seq-back',start:'startSequencing',check});
  await h.close(); const f=getFails(); console.log(f===0?'ALL PASS':'SOME FAIL ('+f+')'); process.exit(f?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
