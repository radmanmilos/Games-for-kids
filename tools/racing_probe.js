/* Dev probe: capture racing page screenshots (boot + in-game) headlessly.
   Run: node tools/racing_probe.js [viewport] */
const { start } = require('./headless.js');
const fs = require('fs');
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
    const vw = process.argv[2] || '1280x800';
    const [width, height] = vw.split('x').map(Number);
    const h = await start({ page: '/pages/racing.html', tag: 'racing-probe', width, height });

    const shot = async (name) => {
        const r = await h.c.send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(`resources/racing-${name}.png`, Buffer.from(r.data, 'base64'));
        console.log('saved resources/racing-' + name + '.png');
    };

    for (let i = 0; i < 20; i++) {
        const ok = await h.evalv(`document.getElementById('racing-canvas') ? true : false`);
        if (ok) break;
        await sleep(100);
    }
    // char picker open
    await sleep(300);
    await shot('probe-picker-' + vw);

    // choose first character
    await h.evalv(`document.querySelector('.racing-char-btn') && document.querySelector('.racing-char-btn').click(); true`);
    await sleep(400);
    await shot('probe-play-' + vw);

    // layout facts
    const facts = await h.evalv(`(() => {
        const game = document.getElementById('racing-game');
        const cv = document.getElementById('racing-canvas');
        const gs = getComputedStyle(game), cs = getComputedStyle(document.body);
        return JSON.stringify({
            innerW: window.innerWidth, innerH: window.innerHeight,
            clientW: document.documentElement.clientWidth, clientH: document.documentElement.clientHeight,
            gameRect: [game.getBoundingClientRect().left, game.getBoundingClientRect().top, game.getBoundingClientRect().right, game.getBoundingClientRect().bottom],
            gamePos: gs.position, gameInset: [gs.top, gs.right, gs.bottom, gs.left],
            canvasClientW: cv.clientWidth, canvasClientH: cv.clientHeight,
            canvasBW: cv.width, canvasBH: cv.height,
            bodyMargin: cs.margin, bodyH: cs.height, htmlH: cs.height,
            ROAD_BOTTOM_Y: window.__racing ? window.__racing.ROAD_BOTTOM_Y : null,
            W: window.__racing ? window.__racing.W() : null,
            H: window.__racing ? window.__racing.H() : null,
            controlsTop: (() => { const c = document.querySelector('.racing-zone'); const r = c.getBoundingClientRect(); return r.top; })()
        });
    })()`);
    console.log('LAYOUT FACTS: ' + facts);

    const px = await h.evalv(`(() => {
        const c = document.getElementById('racing-canvas').getContext('2d');
        const s = (x, y) => Array.from(c.getImageData(x, y, 1, 1).data.slice(0, 3)).join(',');
        const a = window.__racing;
        const cx = Math.round(a.ROAD_CENTER()), bot = Math.round(a.ROAD_BOTTOM_Y());
        const ml = Math.round(a.maxLateral());
        const vert = []; for (let y = bot - 30; y <= bot + 10; y += 10) vert.push(y + ':' + s(cx, y));
        return JSON.stringify({
            cx, bot, ml,
            horiz: a.HORIZON_Y(),
            sky_topCenter: s(cx, 5),
            roadNearBottom: s(cx, bot - 30),
            roadAt720: s(cx, 718),
            carBody: s(cx, Math.round(bot - 55)),
            farLeftBottom: s(10, Math.round(a.H()) - 30),
            roadMidLeftEdge: s(Math.round(cx - ml - 20), Math.round(bot - 120)),
            verticalCenterStrip: vert
        });
    })()`);
    console.log('PIXELS: ' + px);

    const region = await h.evalv(`(() => {
        const c = document.getElementById('racing-canvas').getContext('2d');
        const s = (x, y) => Array.from(c.getImageData(x, y, 1, 1).data.slice(0, 3)).join(',');
        const rowRuns = (y) => {
            const out = [];
            let last = null, start = 0;
            for (let x = 0; x < 1280; x++) {
                const v = s(x, y);
                if (v !== last) {
                    if (last !== null) out.push(x + '-' + start + ':' + last);
                    last = v; start = x;
                }
            }
            out.push('1280-' + start + ':' + last);
            return 'y' + y + ' ' + out.join(' ').replaceAll('90,90,90', 'RD').replaceAll('176,228,146', 'G1').replaceAll('177,229,146', 'G1').replaceAll('177,229,147', 'G1').replaceAll('177,229,145', 'G1').replaceAll('176,229,146', 'G1').replaceAll('176,229,145', 'G1').replaceAll('176,228,145', 'G1');
        };
        return [rowRuns(700), rowRuns(701), rowRuns(702), rowRuns(703), rowRuns(704)].join('\\n');
    })()`);
    console.log('ROW RUNS at y=700..704:');
    console.log(region);
    h.close();
    process.exit(0);
})().catch(e => { console.error('probe crashed:', e); process.exit(1); });