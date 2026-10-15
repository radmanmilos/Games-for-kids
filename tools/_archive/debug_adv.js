const { start } = require('./headless.js');
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const h = await start({ page: '/pages/driving.html', tag: 'debug-adv', width: 1100, height: 700 });

  let ready = false;
  for (let i = 0; i < 25 && !ready; i++) {
    ready = await h.evalv(`typeof window.__adv === 'object' && window.__adv !== null`);
    if (!ready) await sleep(200);
  }
  console.log('ready:', ready);

  const raw = await h.evalv('window.__adv');
  console.log('typeof raw:', typeof raw);
  console.log('raw keys:', Object.keys(raw || {}));
  console.log('raw mode:', raw && raw.mode);
  console.log('raw levels:', raw && raw.levels);
  console.log('raw player:', raw && raw.player);

  h.close();
  process.exit(0);
})().catch(e => { console.error('ERR:', e); process.exit(1); });
