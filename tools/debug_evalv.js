const { start, check, getFails } = require('./headless.js');

const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const h = await start({ page: '/pages/driving.html', tag: 'debug-smoke', width: 1100, height: 700 });

  await sleep(1000);

  const test1 = await h.evalv('JSON.stringify({hello: "world"})');
  console.log('test1 (simple string):', typeof test1, JSON.stringify(test1));

  const test2 = await h.evalv(`(() => { return JSON.stringify({hello: "world"}); })()`);
  console.log('test2 (iife string):', typeof test2, JSON.stringify(test2));

  const test3 = await h.evalv(`(() => { return {hello: "world"}; })()`);
  console.log('test3 (iife object):', typeof test3, JSON.stringify(test3));

  h.close();
  process.exit(0);
})().catch(e => { console.error('ERR:', e); process.exit(1); });
