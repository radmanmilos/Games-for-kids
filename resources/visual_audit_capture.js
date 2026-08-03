/* Visual audit screenshot harness for "Petrin svet" (Петрин свет).
   Used by the visual audit task (PROJECT_TASKS.md task 45) to capture every
   screen/state of every game as PNGs that an image-capable model (MiMo V2.5 Free)
   then reviews. No external dependencies — Node >= 22 (global fetch + WebSocket).

   USAGE
     node resources/visual_audit_capture.js               # capture all SHOTS
     node resources/visual_audit_capture.js --shot hub    # capture one shot
     node resources/visual_audit_capture.js --out C:/tmp/audit --size 1024x768

   EXTENDING
     Add entries to SHOTS. Each entry:
       name    – unique short id used as the PNG filename
       page    – html file under game/ ("index.html", "pages/coloring.html", ...)
       width   – viewport width px (use 1280x800 landscape and 800x1280 portrait)
       height  – viewport height px
       actions – array of strings, run in order:
                   "await 600"                wait 600 ms
                   any other string           JS expression evaluated in the page
                                              (exceptions are logged and skipped)
   NOTES
     - Run the pages over file:// like a real offline run. Audio may fail from
       file:// — ignore; we only need pixels.
     - "await" waits are essential after clicks so animations/screens settle.
*/
const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');

const CHROME = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const GAME_DIR = path.join(__dirname, '..', 'game');
const DEFAULT_OUT = path.join(process.env.TEMP, 'petrin_visual_audit');

/* ------------------------------------------------------------------ */
/* SHOT LIST — capture the initial screen + key states of every game. */
/* Add / remove entries freely for each audit pass.                    */
/* ------------------------------------------------------------------ */
const SHOTS = [
  // Hub (main menu)
  { name: 'hub', page: 'index.html', width: 1280, height: 800, actions: ['await 800'] },
  { name: 'hub-portrait', page: 'index.html', width: 800, height: 1280, actions: ['await 800'] },

  // Animals
  { name: 'animals', page: 'pages/animals.html', width: 1280, height: 800, actions: ['await 700'] },
  { name: 'animals-tapped', page: 'pages/animals.html', width: 1280, height: 800, actions: ['await 700', "document.querySelector('.animal-card').click()", 'await 900'] },

  // Shape Match
  { name: 'shapes', page: 'pages/shapes.html', width: 1280, height: 800, actions: ['await 700'] },

  // Candy Pop (only in index.html)
  { name: 'candy', page: 'index.html', width: 1280, height: 800, actions: ["document.querySelector('[data-go=\"game-candy\"]').click()", 'await 900'] },

  // Paper Kitty — direct page load (the game canvas lives in its own page,
  // not visible through the hub iframe)
  { name: 'kitty', page: 'pages/papper_kitty.html', width: 1280, height: 800, actions: ['await 1200'] },
  { name: 'kitty-portrait', page: 'pages/papper_kitty.html', width: 800, height: 1280, actions: ['await 1200'] },
  { name: 'kitty-worlds-menu', page: 'pages/papper_kitty.html', width: 1280, height: 800, actions: ['await 1200', "document.querySelector('#worlds-btn').click()", 'await 500'] },

  // Kitty — forced worlds (data-driven set + fix verification)
  { name: 'kitty-spring-stairs', page: 'pages/papper_kitty.html', width: 1280, height: 800, actions: ['await 800', "worldOrder=[0];worldPos=0;coinCount=0;loadWorld();player.x=2060;player.y=510-48;cameraX=1600;", 'await 700'] },
  { name: 'kitty-igloo', page: 'pages/papper_kitty.html', width: 1280, height: 800, actions: ['await 800', "worldOrder=[9];worldPos=0;coinCount=0;loadWorld();player.x=4380;player.y=510-48;cameraX=3700;", 'await 700'] },
  { name: 'kitty-torii', page: 'pages/papper_kitty.html', width: 1280, height: 800, actions: ['await 800', "worldOrder=[8];worldPos=0;coinCount=0;loadWorld();player.x=4380;player.y=510-48;cameraX=3700;", 'await 700'] },
  { name: 'kitty-pyramid', page: 'pages/papper_kitty.html', width: 1280, height: 800, actions: ['await 800', "worldOrder=[10];worldPos=0;coinCount=0;loadWorld();player.x=4380;player.y=510-48;cameraX=3700;", 'await 700'] },
  { name: 'kitty-coins-no-disc', page: 'pages/papper_kitty.html', width: 1280, height: 800, actions: ['await 800', "worldOrder=[0];worldPos=0;coinCount=0;loadWorld();player.x=2060;player.y=510-48;cameraX=2000;", 'await 700'] },

  // Puzzle
  { name: 'puzzle', page: 'pages/animal_puzzle.html', width: 1280, height: 800, actions: ['await 700'] },

  // Counting
  { name: 'counting', page: 'pages/animal_counting.html', width: 1280, height: 800, actions: ['await 700'] },

  // Memory
  { name: 'memory', page: 'pages/animal_memory.html', width: 1280, height: 800, actions: ['await 700'] },
  { name: 'memory-two-flipped', page: 'pages/animal_memory.html', width: 1280, height: 800, actions: ['await 700', "document.querySelectorAll('#board .card')[0].click()", "document.querySelectorAll('#board .card')[2].click()", 'await 400'] },

  // Coloring
  { name: 'coloring', page: 'pages/coloring.html', width: 1280, height: 800, actions: ['await 1500'] },
  { name: 'coloring-fill', page: 'pages/coloring.html', width: 1280, height: 800, actions: ['await 1500', "document.querySelectorAll('.coloring-swatch')[0].click()", "document.querySelector('#coloringSvg .coloring-region').dispatchEvent(new MouseEvent('click', {bubbles:true}))", 'await 700'] },

  // Classroom (Учионица) — hub + all four activities
  { name: 'classroom', page: 'pages/classroom.html', width: 1280, height: 800, actions: ['await 800'] },
  { name: 'classroom-alphabet', page: 'pages/classroom.html', width: 1280, height: 800, actions: ["document.querySelector('#classroomHub .activity-btn[data-activity=\"alphabet\"]').click()", 'await 500'] },
  { name: 'classroom-numbers', page: 'pages/classroom.html', width: 1280, height: 800, actions: ["document.querySelector('#classroomHub .activity-btn[data-activity=\"numbers\"]').click()", 'await 500', "document.querySelectorAll('#activityGrid .class-tile')[5].click()", 'await 400'] },
  { name: 'classroom-shapes', page: 'pages/classroom.html', width: 1280, height: 800, actions: ["document.querySelector('#classroomHub .activity-btn[data-activity=\"shapes\"]').click()", 'await 500', "document.querySelectorAll('#activityGrid .class-tile')[5].click()", 'await 400'] },
  { name: 'classroom-colors', page: 'pages/classroom.html', width: 1280, height: 800, actions: ["document.querySelector('#classroomHub .activity-btn[data-activity=\"colors\"]').click()", 'await 500', "document.querySelectorAll('#activityGrid .class-tile')[0].click()", 'await 400'] },
  { name: 'classroom-portrait', page: 'pages/classroom.html', width: 800, height: 1280, actions: ["document.querySelector('#classroomHub .activity-btn[data-activity=\"alphabet\"]').click()", 'await 500'] },

  // Tracing (Писање) — hub + all three activities
  { name: 'tracing', page: 'pages/tracing.html', width: 1280, height: 800, actions: ['await 900'] },
  { name: 'tracing-letters', page: 'pages/tracing.html', width: 1280, height: 800, actions: ["document.querySelector('#tracingHub .activity-btn[data-activity=\"letters\"]').click()", 'await 400'] },
  { name: 'tracing-numbers', page: 'pages/tracing.html', width: 1280, height: 800, actions: ["document.querySelector('#tracingHub .activity-btn[data-activity=\"numbers\"]').click()", 'await 400', "document.querySelector('#tracingNext').click()", 'await 300'] },
  { name: 'tracing-shapes', page: 'pages/tracing.html', width: 1280, height: 800, actions: ["document.querySelector('#tracingHub .activity-btn[data-activity=\"shapes\"]').click()", 'await 400'] },
  { name: 'tracing-portrait', page: 'pages/tracing.html', width: 800, height: 1280, actions: ['await 900'] },
];

/* ------------------------------------------------------------------ */

function parseArgs(argv) {
  const args = { out: DEFAULT_OUT, shots: null };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--out') args.out = argv[++i];
    else if (argv[i] === '--shot') { args.shots = args.shots || []; args.shots.push(argv[++i]); }
    else if (argv[i] === '--size') { const [w, h] = argv[++i].split('x'); args.width = +w; args.height = +h; }
  }
  return args;
}

function cdp(wsUrl) {
  let id = 0;
  const pending = new Map();
  const ws = new WebSocket(wsUrl);
  return new Promise((resolve) => {
    ws.onopen = () => resolve({
      send(method, params = {}, sessionId) {
        return new Promise((res) => {
          const mid = ++id;
          pending.set(mid, res);
          ws.send(JSON.stringify({ id: mid, method, params, ...(sessionId ? { sessionId } : {}) }));
        });
      },
    });
    ws.onmessage = (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg.result); pending.delete(msg.id); }
    };
  });
}

async function runShot(c, shot, outDir) {
  const file = 'file:///' + path.join(GAME_DIR, shot.page).replace(/\\/g, '/');
  await c.send('Page.navigate', { url: file });
  await new Promise(r => setTimeout(r, 700));
  for (const action of shot.actions || []) {
    if (/^await \d+$/.test(action)) {
      await new Promise(r => setTimeout(r, +action.split(' ')[1]));
      continue;
    }
    try {
      const r = await c.send('Runtime.evaluate', { expression: action, returnByValue: true });
      if (r.exceptionDetails) console.log('    [warn] action skipped:', r.exceptionDetails.exception?.description || r.exceptionDetails.text);
    } catch (e) { console.log('    [warn] action error:', e.message); }
  }
  const shotR = await c.send('Page.captureScreenshot', { format: 'png' });
  const out = path.join(outDir, shot.name + '.png');
  fs.writeFileSync(out, Buffer.from(shotR.data, 'base64'));
  return out;
}

(async () => {
  const args = parseArgs(process.argv);
  const shots = args.shots ? SHOTS.filter(s => args.shots.includes(s.name)) : SHOTS;
  if (!shots.length) { console.log('no shots matched', args.shots); process.exit(1); }
  fs.mkdirSync(args.out, { recursive: true });

  const port = 9350 + Math.floor(Math.random() * 50);
  execFile(CHROME, ['--headless=new', '--disable-gpu', `--remote-debugging-port=${port}`,
    '--user-data-dir=' + path.join(process.env.TEMP, 'petrin-audit-chrome'), '--no-first-run', 'about:blank']);
  await new Promise(r => setTimeout(r, 1500));

  let version;
  for (let i = 0; i < 20 && !version; i++) {
    try { version = await (await fetch(`http://127.0.0.1:${port}/json/version`)).json(); }
    catch { await new Promise(r => setTimeout(r, 500)); }
  }
  if (!version) { console.log('Chrome did not start'); process.exit(1); }

  const dbg = await cdp(version.webSocketDebuggerUrl);
  const page = await dbg.send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await dbg.send('Target.attachToTarget', { targetId: page.targetId, flatten: true });
  const c = { send: (m, p) => dbg.send(m, p, sessionId) };
  await c.send('Page.enable'); await c.send('Runtime.enable');

  for (const shot of shots) {
    await c.send('Emulation.setDeviceMetricsOverride', { width: shot.width, height: shot.height, deviceScaleFactor: 1, mobile: false });
    try {
      const out = await runShot(c, shot, args.out);
      console.log('OK  ' + shot.name + '  -> ' + out + '  (' + shot.width + 'x' + shot.height + ')');
    } catch (e) {
      console.log('ERR ' + shot.name + '  ' + e.message);
    }
  }
  console.log('done: ' + shots.length + ' shot(s) in ' + args.out);
  process.exit(0);
})();
