const { start } = require('./headless.js');
(async () => {
  const h = await start({ page: '/pages/little_adventure.html', tag: 'la-probe6', width: 1280, height: 800 });
  for (let i = 0; i < 40; i++) {
    const ready = await h.evalv('typeof window.startlittle_adventure === "function"');
    if (ready) break;
    await new Promise((r) => setTimeout(r, 250));
  }
  const r2 = await h.evalv('(function(){ try { window.startlittle_adventure(); return "started"; } catch(e){ return "ERR: "+e.message; } })()');
  console.log('START:', r2);
  await h.close();
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
