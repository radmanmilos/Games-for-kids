/* ---------------- PAPER KITTY ADVENTURE ---------------- */
const kittyCanvas = document.getElementById('kitty-canvas');
const kittyCtx = kittyCanvas.getContext('2d');
const kittyKeys = {left:false,right:false,jump:false};
let kittyRunning = false, kittyFrame = 0, kittyLast = 0;
let kittyPlayer, kittyPlatforms, kittyCoins, kittyGoal, kittyCoinTotal = 0;
const kittyWorlds = [
  {sky:'#5c94fc',ground:'#70c838',length:2100},
  {sky:'#fc7438',ground:'#f8b800',length:2300},
  {sky:'#00003c',ground:'#cc5500',length:2500},
  {sky:'#a0c0f8',ground:'#f8f8f8',length:2700}
];
let kittyWorld = 0;

function resizeKitty(){ kittyCanvas.width = kittyCanvas.clientWidth; kittyCanvas.height = kittyCanvas.clientHeight; }
window.addEventListener('resize', resizeKitty);
function bindKittyControl(id, key){
  const el = document.getElementById(id);
  const set = (e, value) => { e.preventDefault(); ctx(); kittyKeys[key] = value; };
  el.addEventListener('pointerdown', e=>set(e,true));
  ['pointerup','pointercancel','pointerleave'].forEach(type=>el.addEventListener(type,e=>set(e,false)));
}
bindKittyControl('kitty-left','left'); bindKittyControl('kitty-right','right'); bindKittyControl('kitty-jump','jump');
window.addEventListener('keydown', e=>{ if(e.key==='ArrowLeft'||e.key==='a') kittyKeys.left=true; if(e.key==='ArrowRight'||e.key==='d') kittyKeys.right=true; if(e.key==='ArrowUp'||e.key===' '||e.key==='w') kittyKeys.jump=true; });
window.addEventListener('keyup', e=>{ if(e.key==='ArrowLeft'||e.key==='a') kittyKeys.left=false; if(e.key==='ArrowRight'||e.key==='d') kittyKeys.right=false; if(e.key==='ArrowUp'||e.key===' '||e.key==='w') kittyKeys.jump=false; });
function loadKittyWorld(){
  const w=kittyWorlds[kittyWorld], ground=kittyCanvas.height-42;
  kittyPlayer={x:70,y:ground-52,w:44,h:52,vx:0,vy:0,grounded:false,face:1};
  kittyPlatforms=[{x:0,y:ground,w:560,h:42},{x:700,y:ground,w:650,h:42},{x:1500,y:ground,w:w.length-1500,h:42}];
  for(let x=220;x<w.length-250;x+=280) kittyPlatforms.push({x,y:ground-100-(x%3)*35,w:150,h:22});
  kittyCoins=[]; for(let x=180;x<w.length-250;x+=230) kittyCoins.push({x,y:ground-145-(x%2)*35,got:false});
  kittyGoal={x:w.length-150,y:ground-180,w:100,h:180}; kittyCoinTotal=0;
  document.getElementById('kitty-level').textContent=kittyWorld+1; document.getElementById('kitty-coins').textContent=0; document.getElementById('kitty-win').classList.remove('show');
}
const kittyEmbedded = document.getElementById('kitty-embedded');
function startKitty(){ kittyEmbedded.src = 'pages/papper_kitty.html'; }
function stopKitty(){ kittyEmbedded.src = 'about:blank'; }
function kittyLoop(time){ if(!kittyRunning)return; const dt=Math.min((time-kittyLast||16)/16.67,2); kittyLast=time; updateKitty(dt); drawKitty(); kittyFrame=requestAnimationFrame(kittyLoop); }
function updateKitty(dt){
  const p=kittyPlayer; p.vx=(kittyKeys.left?-3.2:0)+(kittyKeys.right?3.2:0); if(p.vx)p.face=p.vx>0?1:-1; if(kittyKeys.jump&&p.grounded){p.vy=-10; p.grounded=false; tone(430,.12);}
  p.vy+=.55*dt; p.x+=p.vx*dt; p.y+=p.vy*dt; p.grounded=false;
  kittyPlatforms.forEach(a=>{if(p.x+p.w>a.x&&p.x<a.x+a.w&&p.y+p.h>=a.y&&p.y+p.h<=a.y+24&&p.vy>=0){p.y=a.y-p.h;p.vy=0;p.grounded=true;}});
  if(p.y>kittyCanvas.height+80){p.x=Math.max(40,p.x-180);p.y=40;p.vy=0;}
  kittyCoins.forEach(c=>{if(!c.got&&p.x+p.w>c.x-18&&p.x<c.x+18&&p.y+p.h>c.y-18&&p.y<c.y+18){c.got=true;kittyCoinTotal++;document.getElementById('kitty-coins').textContent=kittyCoinTotal;popSound();}});
  if(p.x+p.w>kittyGoal.x){ kittyRunning=false; successChime(); document.getElementById('kitty-win-title').textContent=kittyWorld<3?'СВЕТ ПРЕЂЕН!':'🌟 СВИ СВЕТОВИ ПРЕЂЕНИ!'; document.getElementById('kitty-next').textContent=kittyWorld<3?'СЛЕДЕЋИ СВЕТ! 🚀':'ИГРАЈ ПОНОВО! 🔄'; document.getElementById('kitty-win').classList.add('show'); }
}
function drawKitty(){
  const w=kittyWorlds[kittyWorld], p=kittyPlayer, cam=Math.max(0,Math.min(w.length-kittyCanvas.width,p.x-kittyCanvas.width*.32)); kittyCtx.fillStyle=w.sky; kittyCtx.fillRect(0,0,kittyCanvas.width,kittyCanvas.height); kittyCtx.save(); kittyCtx.translate(-cam,0);
  kittyCtx.fillStyle='rgba(255,255,255,.7)'; for(let x=100;x<w.length;x+=420){kittyCtx.beginPath();kittyCtx.arc(x,75,34,0,7);kittyCtx.arc(x+35,65,45,0,7);kittyCtx.arc(x+75,75,34,0,7);kittyCtx.fill();}
  kittyPlatforms.forEach(a=>{kittyCtx.fillStyle='#fff';kittyCtx.fillRect(a.x-4,a.y-4,a.w+8,a.h+8);kittyCtx.fillStyle=w.ground;kittyCtx.fillRect(a.x,a.y,a.w,a.h);});
  kittyCoins.forEach(c=>{if(!c.got){kittyCtx.fillStyle='#FFD23F';kittyCtx.beginPath();kittyCtx.arc(c.x,c.y,15,0,7);kittyCtx.fill();}});
  kittyCtx.fillStyle='#f8edeb';kittyCtx.fillRect(kittyGoal.x,kittyGoal.y,kittyGoal.w,kittyGoal.h);kittyCtx.fillStyle='#e52521';kittyCtx.fillRect(kittyGoal.x-10,kittyGoal.y-35,kittyGoal.w+20,35);
  kittyCtx.save();kittyCtx.translate(p.x+p.w/2,p.y+p.h/2);kittyCtx.scale(p.face,1);kittyCtx.fillStyle='#ffa6c9';kittyCtx.beginPath();kittyCtx.arc(0,5,24,0,7);kittyCtx.fill();kittyCtx.beginPath();kittyCtx.moveTo(-20,-10);kittyCtx.lineTo(-13,-31);kittyCtx.lineTo(-3,-14);kittyCtx.moveTo(20,-10);kittyCtx.lineTo(13,-31);kittyCtx.lineTo(3,-14);kittyCtx.fill();kittyCtx.fillStyle='#2b2d42';kittyCtx.beginPath();kittyCtx.arc(-8,2,3,0,7);kittyCtx.arc(8,2,3,0,7);kittyCtx.fill();kittyCtx.restore();kittyCtx.restore();
}
document.getElementById('kitty-next').addEventListener('click',()=>{if(window.popSound)window.popSound();kittyWorld=kittyWorld<3?kittyWorld+1:0;startKitty();});

