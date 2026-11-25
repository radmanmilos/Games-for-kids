/* little_adventure_shots.js — deterministic screenshots/filmstrips for the Little Adventure quality pass.
 *
 * Usage: node tools/little_adventure_shots.js --phase=<card id> [--only=preset,...] [--filmstrips]
 * Writes PNGs to resources/General_reviews/Little_adventure/Quality_Plan/shots/<phase>/
 * with a small INDEX.md. Fails loudly (non-zero exit) if WebGL is missing or a shot is blank.
 */
'use strict';
const { start } = require('./headless.js');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT_BASE = path.join(ROOT, 'resources', 'General_reviews', 'Little_adventure', 'Quality_Plan', 'shots');

function arg(name) {
  const a = process.argv.find((x) => x.startsWith('--' + name + '='));
  return a ? a.slice(name.length + 3) : null;
}

const phase = arg('phase') || '00_baseline';
const only = arg('only');
const filmstrips = process.argv.includes('--filmstrips');

const PRESETS = ['hero-front','hero-side','hero-34','meadow-wide','meadow-flowers','forest-wide','forest-lane','shrine-wide','pedestals-lit','lighthouse','owl-closeup','grumpy-angry','grumpy-happy','boss','gate-closed','gate-open','chest-open','bridge-built','complete-bloom','start-screen','hud-landscape'];
const FILMSTRIPS = ['hero-idle','hero-walk','hero-swing','hero-shield','hero-bump','hero-pickup','hero-celebrate','grumpy-walk','grumpy-notice','grumpy-hit','grumpy-befriend','happy-dance','boss-stomp','owl-talk','chest-open','gate-open','bridge-build','bloom-wave'];

const sizes = [{ w: 1280, h: 800 }, { w: 844, h: 390 }];

function validatePng(buf) {
  if (buf.length < 8000) throw new Error('too small (' + buf.length + ' bytes)');
  // crude non-blank check: more than a handful of distinct byte values
  const seen = new Set();
  for (let i = 0; i < Math.min(buf.length, 4096); i++) seen.add(buf[i]);
  if (seen.size < 8) throw new Error('appears blank (only ' + seen.size + ' distinct byte values)');
}

async function captureOne(h, name, isFilmstrip) {
  // ensure start overlay is dismissed
  await h.evalv('(function(){const s=document.getElementById("i3d-start"); if(s) s.style.display="none"; return true;})()');
  if (isFilmstrip) {
    await h.evalv(`window.__little_adventure && window.__little_adventure.sheet(${JSON.stringify(name)}, 8)`);
  } else {
    await h.evalv(`window.__little_adventure && window.__little_adventure.photo(${JSON.stringify(name)})`);
  }
  await h.evalv('window.__visualAdvance && window.__visualAdvance(30)');
  await new Promise((r) => setTimeout(r, 200));
  // wait for images
  await h.waitFor('Array.from(document.images).every(i => i.complete)', { timeout: 15000, label: 'images' }).catch(() => {});
  await h.evalv('window.__visualAdvance && window.__visualAdvance(3)');
  await new Promise((r) => setTimeout(r, 100));
  const result = await h.c.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
  return Buffer.from(result.data, 'base64');
}

async function runSize(w, h, presetList, filmstripList, outDir) {
  const handle = await start({ page: '/pages/little_adventure.html', tag: 'la-shots', width: w, height: h });
  try {
    for (let i = 0; i < 40; i++) {
      const ready = await handle.evalv('typeof window.startlittle_adventure === "function" && window.__little_adventure ? true : false');
      if (ready) break;
      await new Promise((r) => setTimeout(r, 250));
    }
    const webgl = await handle.evalv('window.__little_adventure ? window.__little_adventure.state().webgl : false');
    if (webgl !== true) {
      console.error('WebGL is NOT available on this host. Shots require a WebGL-capable machine.');
      console.error('Run this tool on a host with GPU/WebGL, or have the user run it.');
      process.exitCode = 2;
      return false;
    }
    for (const name of presetList) {
      const buf = await captureOne(handle, name, false);
      validatePng(buf);
      const file = path.join(outDir, name + '_' + w + 'x' + h + '.png');
      fs.writeFileSync(file, buf);
      console.log('CAPTURE', path.basename(file), Math.round(buf.length / 1024) + 'KB');
    }
    if (filmstrips) {
      for (const name of filmstripList) {
        const buf = await captureOne(handle, name, true);
        validatePng(buf);
        const file = path.join(outDir, 'sheet_' + name + '_' + w + 'x' + h + '.png');
        fs.writeFileSync(file, buf);
        console.log('CAPTURE', path.basename(file), Math.round(buf.length / 1024) + 'KB');
      }
    }
    return true;
  } finally {
    await handle.close();
  }
}

(async () => {
  const outDir = path.join(OUT_BASE, phase);
  fs.mkdirSync(outDir, { recursive: true });
  const presetList = only ? only.split(',') : PRESETS;
  const filmstripList = only ? [] : FILMSTRIPS;
  let ok = true;
  for (const { w, h } of sizes) {
    const r = await runSize(w, h, presetList, filmstripList, outDir);
    if (r === false) { ok = false; break; }
  }
  if (ok) {
    // write a tiny INDEX.md
    const files = fs.readdirSync(outDir).filter((f) => f.endsWith('.png')).sort();
    const lines = ['# Shots — ' + phase, '', 'Generated ' + new Date().toISOString(), '', '| file |', '| --- |'];
    for (const f of files) lines.push('| ' + f + ' |');
    fs.writeFileSync(path.join(outDir, 'INDEX.md'), lines.join('\n') + '\n');
    console.log('Wrote', files.length, 'PNGs to', outDir);
  }
  process.exit(ok ? 0 : 2);
})().catch((e) => {
  console.error('FATAL:', e && e.stack ? e.stack : e);
  process.exit(1);
});
