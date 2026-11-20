/* Shared painted-surface helpers (scene cover, stem measurement, tiling, goal art).
   Extracted from games/kitty-standalone.js so the adventure games can reuse them
   with configuration instead of rewrites. Loaded as a shared module AFTER the
   game script; helpers are reached through window.SceneTiles at call time. */
(function () {
    'use strict';

    const stemBoxCache = {};

    function stemBox(stem, im) {
        if (stemBoxCache[stem]) return stemBoxCache[stem];
        const full = { x: 0, y: 0, w: im.naturalWidth, h: im.naturalHeight || im.naturalWidth };
        try {
            const c = document.createElement('canvas');
            c.width = full.w; c.height = full.h;
            const g = c.getContext('2d', { willReadFrequently: true });
            g.drawImage(im, 0, 0);
            const d = g.getImageData(0, 0, c.width, c.height).data;
            let x0 = c.width, y0 = c.height, x1 = -1, y1 = -1;
            for (let y = 0; y < c.height; y++) {
                for (let x = 0; x < c.width; x++) {
                    if (d[(y * c.width + x) * 4 + 3] > 24) {
                        if (x < x0) x0 = x; if (x > x1) x1 = x;
                        if (y < y0) y0 = y; if (y > y1) y1 = y;
                    }
                }
            }
            let solidTop = y0;
            if (x1 >= 0) {
                const spanX0 = Math.floor(x0 + (x1 - x0 + 1) * 0.2);
                const spanX1 = Math.ceil(x0 + (x1 - x0 + 1) * 0.8);
                const need = Math.max(1, Math.round((spanX1 - spanX0) * 0.5));
                for (let y = y0; y <= y1; y++) {
                    let solid = 0;
                    for (let x = spanX0; x < spanX1; x++) if (d[(y * c.width + x) * 4 + 3] >= 128) solid++;
                    if (solid >= need) { solidTop = y; break; }
                }
            }
            stemBoxCache[stem] = x1 < 0 ? full : { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1, solidTop };
        } catch (e) {
            stemBoxCache[stem] = full;
        }
        return stemBoxCache[stem];
    }

    function tileStem(ctx, stem, x, y, w, h) {
        if (!stem || !window.Art || !window.Art.imageStem) return false;
        const im = window.Art.imageStem(stem);
        if (!im || !im.complete || im.naturalWidth <= 0) return false;
        const box = stemBox(stem, im);
        const cx = box.x + box.w * 0.2;
        const cw = box.w * 0.6;
        const sy = box.solidTop === undefined ? box.y : box.solidTop;
        const sh = Math.max(1, box.h - (sy - box.y));
        const tileW = Math.max(16, Math.round(h * cw / sh));
        for (let tx = x; tx < x + w; tx += tileW) {
            const tw = Math.min(tileW, x + w - tx);
            ctx.drawImage(im, cx, sy, cw * (tw / tileW), sh, tx, y, tw, h);
        }
        return true;
    }

    function drawGoalArt(ctx, stem, c, hover) {
        if (!window.Art || !window.Art.imageStem || !window.Art.drawStem) return false;
        const im = window.Art.imageStem(stem);
        if (!im || !im.complete || im.naturalWidth <= 0) return false;
        const box = stemBox(stem, im);
        const k = Math.min(c.width / box.w, c.height / box.h);
        const side = Math.max(im.naturalWidth, im.naturalHeight || im.naturalWidth) * k;
        const left = c.x + (c.width - box.w * k) / 2 - box.x * k;
        const top = (hover ? c.y + (c.height - box.h * k) / 2 : c.y + c.height - box.h * k) - box.y * k;
        return window.Art.drawStem(ctx, stem, left + side / 2, top + side / 2, side);
    }

    function drawSceneCover(ctx, sceneImg, cameraX, canvas, groundY) {
        if (!sceneImg || !sceneImg.complete || !sceneImg.naturalWidth) return false;
        const scale = groundY / sceneImg.naturalHeight;
        const drawW = Math.ceil(sceneImg.naturalWidth * scale);
        const firstTile = Math.floor(cameraX / drawW);
        const below = canvas.height - groundY;
        const nh = sceneImg.naturalHeight;
        const nw = sceneImg.naturalWidth;
        for (let i = firstTile; i * drawW < cameraX + canvas.width; i++) {
            const sx = i * drawW;
            ctx.save();
            if (i % 2 !== 0) { ctx.translate(sx + drawW, 0); ctx.scale(-1, 1); }
            else { ctx.translate(sx, 0); }
            ctx.drawImage(sceneImg, 0, 0, drawW, groundY);
            if (below > 0) ctx.drawImage(sceneImg, 0, nh - 2, nw, 2, 0, groundY, drawW, below);
            ctx.restore();
        }
        return true;
    }

    window.SceneTiles = { stemBox, tileStem, drawGoalArt, drawSceneCover, _cache: stemBoxCache };
    // Back-compat aliases for code/tests that reference them as bare globals.
    window.stemBox = stemBox;
    window.tileStem = tileStem;
    window.drawGoalArt = drawGoalArt;
    window.drawSceneCover = drawSceneCover;
    window.stemBoxCache = stemBoxCache;
})();
