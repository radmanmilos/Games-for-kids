/* tools/adventure_smoke.js
   Shared adventure engine smoke test.
   Verifies boot, mode, player spawn, coin pickup, obstacle knockback,
   goal trigger, and resize re-anchor across drive/fly/ground modes.
   Run: node tools/adventure_smoke.js */
const { start, check, getFails } = require('./headless.js');
const fs = require('fs');
const path = require('path');

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function waitReady(h) {
  let ready = false;
  for (let i = 0; i < 25 && !ready; i++) {
    ready = await h.evalv(`typeof window.__adv === 'object' && window.__adv !== null`);
    if (!ready) await sleep(200);
  }
  return ready;
}

(async () => {
  const h = await start({ page: '/pages/driving.html', tag: 'adventure-smoke', width: 1100, height: 700 });

  // ---- DRIVE MODE (driving.html) ----
  const driveReady = await waitReady(h);
  check('drive mode: engine boots (window.__adv ready)', driveReady);

  const driveMode = await h.evalv(`window.__adv.mode`);
  check('drive mode: mode is drive', driveMode === 'drive');

  const drivePlayer = await h.evalv(`JSON.stringify({ x: window.__adv.player.x, y: window.__adv.player.y, offsetX: window.__adv.player.offsetX })`);
  const dp = JSON.parse(drivePlayer);
  check('drive mode: player spawns at valid position', dp.x >= 0 && dp.y >= 0 && dp.offsetX >= 0, drivePlayer);

  const driveDraw = await h.evalv(`(() => { try { window.__adv.draw(); return true; } catch (e) { return e.message; } })()`);
  check('drive mode: draw() runs without error', driveDraw === true, driveDraw);

  const driveCoinBefore = await h.evalv(`window.__adv.coinCount`);
  const driveCoinResult = await h.evalv(`(() => {
    const a = window.__adv;
    const c = a.coins[0];
    a.coins.slice(1).forEach(other => { other.collected = true; });
    a.player.offsetX = c.x - a.cameraX;
    a.player.y = c.y;
    a.update();
    return JSON.stringify({ collected: c.collected, count: a.coinCount });
  })()`);
  const dcr = JSON.parse(driveCoinResult);
  check('drive mode: coin pickup increments count', dcr.collected === true && dcr.count > driveCoinBefore, driveCoinResult);

  await h.evalv(`window.__adv.loadWorld()`);
  await sleep(1100);
  const driveBumpBefore = await h.evalv(`window.__adv.bumpCount`);
  const driveBumpResult = await h.evalv(`(() => {
    const a = window.__adv;
    const o = a.obstacles[0];
    a.obstacles.forEach(ob => { ob.x = -9999; });
    o.x = a.player.x + 20;
    o.y = a.player.y;
    a.update();
    return JSON.stringify({ bumpCount: a.bumpCount, completed: a.levelCompleted });
  })()`);
  const dbr = JSON.parse(driveBumpResult);
  check('drive mode: obstacle knockback (bumpCount++, no win)', dbr.bumpCount > driveBumpBefore && dbr.completed === false, driveBumpResult);

  const driveGoalResult = await h.evalv(`(() => {
    const a = window.__adv;
    a.setPaused(true);
    a.obstacles.length = 0;
    a.goal.x = a.player.x - 60;
    a.goal.width = 400;
    a.goal.y = a.player.y;
    a.goal.height = 100;
    a.update();
    a.update();
    return JSON.stringify({ completed: a.levelCompleted, shown: document.getElementById('adv-win-modal').classList.contains('show') });
  })()`);
  const dgr = JSON.parse(driveGoalResult);
  check('drive mode: goal triggers levelCompleted + win modal', dgr.completed === true && dgr.shown === true, driveGoalResult);

  const driveResizeBefore = await h.evalv(`(() => {
    const a = window.__adv;
    return JSON.stringify({ coinY: a.coins[0].y });
  })()`);
  await h.c.send('Emulation.setDeviceMetricsOverride', { width: 1100, height: 1200, deviceScaleFactor: 1, mobile: false });
  await h.evalv(`window.dispatchEvent(new Event('resize'))`);
  await sleep(200);
  const driveResizeAfter = await h.evalv(`(() => {
    const a = window.__adv;
    return JSON.stringify({ coinY: a.coins[0].y });
  })()`);
  const drBefore = JSON.parse(driveResizeBefore);
  const drAfter = JSON.parse(driveResizeAfter);
  check('drive mode: resize re-anchors world geometry', drAfter.coinY !== drBefore.coinY, driveResizeBefore + ' -> ' + driveResizeAfter);

  // Reset viewport for next modes
  await h.c.send('Emulation.setDeviceMetricsOverride', { width: 1100, height: 700, deviceScaleFactor: 1, mobile: false });

  // ---- GROUND MODE (dino.html) ----
  await h.navigate(`http://127.0.0.1:${h.port}/pages/dino.html`);
  await sleep(300);
  const groundReady = await waitReady(h);
  check('ground mode: engine boots (window.__adv ready)', groundReady);

  // Dino page shows a hero picker at level start; pick the first dino to unpause.
  let picked = false;
  for (let i = 0; i < 10 && !picked; i++) {
    picked = await h.evalv(`document.querySelector('#adv-dino-grid .adv-dino-btn') !== null`);
    if (!picked) await sleep(200);
  }
  if (picked) {
    await h.evalv(`document.querySelector('#adv-dino-grid .adv-dino-btn').click(); true`);
    await sleep(300);
  }

  const groundMode = await h.evalv(`window.__adv.mode`);
  check('ground mode: mode is ground', groundMode === 'ground');

  const groundPlayer = await h.evalv(`JSON.stringify({ x: window.__adv.player.x, y: window.__adv.player.y })`);
  const gp = JSON.parse(groundPlayer);
  check('ground mode: player spawns at valid position', gp.x >= 0 && gp.y >= 0, groundPlayer);

  const groundDraw = await h.evalv(`(() => { try { window.__adv.draw(); return true; } catch (e) { return e.message; } })()`);
  check('ground mode: draw() runs without error', groundDraw === true, groundDraw);

  const groundCoinResult = await h.evalv(`(() => {
    const a = window.__adv;
    const c = a.coins[0];
    a.player.x = c.x;
    a.player.y = c.y - a.player.height;
    a.player.vx = 0;
    a.player.vy = 0;
    a.update();
    return JSON.stringify({ collected: c.collected, count: a.coinCount });
  })()`);
  const gcr = JSON.parse(groundCoinResult);
  check('ground mode: coin pickup works', gcr.collected === true && gcr.count === 1, groundCoinResult);

  const groundBumpResult = await h.evalv(`(() => {
    const a = window.__adv;
    const m = a.mice[0];
    m.visible = true;
    m.y = m.visibleY;
    a.player.x = m.x;
    a.player.y = m.y - a.player.height;
    a.player.vx = 0;
    a.player.vy = 0;
    a.update();
    return JSON.stringify({ bumpCount: a.bumpCount, visible: m.visible });
  })()`);
  const gbr = JSON.parse(groundBumpResult);
  check('ground mode: mouse hit knocks back (bumpCount++, mouse hides)', gbr.bumpCount === 1 && gbr.visible === false, groundBumpResult);

  const groundGoalResult = await h.evalv(`(() => {
    const a = window.__adv;
    a.setPaused(true);
    a.goal.x = a.player.x + 200;
    a.goal.width = 400;
    a.goal.y = a.player.y - 100;
    a.goal.height = 200;
    a.player.x = a.goal.x + a.goal.width / 2 - a.player.width / 2;
    a.player.y = a.goal.y - a.player.height;
    a.player.vx = 0;
    a.player.vy = 0;
    a.update();
    a.update();
    return JSON.stringify({ completed: a.levelCompleted, shown: document.getElementById('adv-win-modal').classList.contains('show') });
  })()`);
  const ggr = JSON.parse(groundGoalResult);
  check('ground mode: goal triggers levelCompleted + win modal', ggr.completed === true && ggr.shown === true, groundGoalResult);

  // ---- FLY MODE (ocean.html) ----
  await h.navigate(`http://127.0.0.1:${h.port}/pages/ocean.html`);
  await sleep(300);
  const flyReady = await waitReady(h);
  check('fly mode: engine boots (window.__adv ready)', flyReady);

  const flyMode = await h.evalv(`window.__adv.mode`);
  check('fly mode: mode is fly', flyMode === 'fly');

  const flyPlayer = await h.evalv(`JSON.stringify({ x: window.__adv.player.x, y: window.__adv.player.y })`);
  const fp = JSON.parse(flyPlayer);
  check('fly mode: player spawns at valid position', fp.x >= 0 && fp.y >= 0, flyPlayer);

  const flyDraw = await h.evalv(`(() => { try { window.__adv.draw(); return true; } catch (e) { return e.message; } })()`);
  check('fly mode: draw() runs without error', flyDraw === true, flyDraw);

  const flyCoinResult = await h.evalv(`(() => {
    const a = window.__adv;
    const c = a.coins[0];
    a.player.x = c.x;
    a.player.y = c.y;
    a.player.vx = 0;
    a.player.vy = 0;
    a.update();
    return JSON.stringify({ collected: c.collected, count: a.coinCount });
  })()`);
  const fcr = JSON.parse(flyCoinResult);
  check('fly mode: coin pickup works', fcr.collected === true && fcr.count === 1, flyCoinResult);

  await h.evalv(`window.__adv.loadWorld()`);
  await sleep(1100);
  const flyBumpResult = await h.evalv(`(() => {
    const a = window.__adv;
    const o = a.obstacles[0];
    a.obstacles.forEach(ob => { ob.x = -9999; });
    o.x = a.player.x + 20;
    o.y = a.player.y;
    a.update();
    return JSON.stringify({ bumpCount: a.bumpCount, completed: a.levelCompleted });
  })()`);
  const fbr = JSON.parse(flyBumpResult);
  check('fly mode: obstacle knockback (bumpCount++, no win)', fbr.bumpCount === 1 && fbr.completed === false, flyBumpResult);

  const flyGoalResult = await h.evalv(`(() => {
    const a = window.__adv;
    a.setPaused(true);
    a.obstacles.length = 0;
    a.goal.x = a.player.x - 60;
    a.goal.width = 400;
    a.goal.y = a.player.y;
    a.goal.height = 100;
    a.update();
    a.update();
    return JSON.stringify({ completed: a.levelCompleted, shown: document.getElementById('adv-win-modal').classList.contains('show') });
  })()`);
  const fgr = JSON.parse(flyGoalResult);
  check('fly mode: goal triggers levelCompleted + win modal', fgr.completed === true && fgr.shown === true, flyGoalResult);

  // ---- Static wiring ----
  const root = path.join(__dirname, '..');
  const indexHtml = fs.readFileSync(path.join(root, 'game', 'index.html'), 'utf8');
  check('hub button wired (data-go="game-driving")', indexHtml.includes('data-go="game-driving"'));
  const nav = fs.readFileSync(path.join(root, 'game', 'shared', 'navigation.js'), 'utf8');
  check('navigation route wired (game-driving -> driving.html)', nav.includes("'game-driving'") && nav.includes("'pages/driving.html'"));
  const main = fs.readFileSync(path.join(root, 'game', 'shared', 'main.js'), 'utf8');
  check('standalone boot wired (driving -> driving-back/startDriving)', main.includes("'driving': ['driving-back', 'startDriving']"));

  h.close();
  process.exit(getFails() ? 1 : 0);
})();
