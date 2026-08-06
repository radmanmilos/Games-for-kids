/* Adventure mode-specific draw helpers — extracted from adventure.js for task 79. */
(function () {
    'use strict';

    function drawRoad(ctx, theme, roadTopY, t, cameraX, canvas) {
        const top = roadTopY;
        ctx.fillStyle = theme.roadColor || '#7a7a7a';
        ctx.fillRect(0, top, canvas.width, canvas.height - top);

        ctx.fillStyle = theme.grassColor || '#67c971';
        ctx.fillRect(0, top - 14, canvas.width, 14);

        ctx.save();
        ctx.strokeStyle = 'rgba(255,255,255,0.85)';
        ctx.lineWidth = 6;
        ctx.setLineDash([26, 34]);
        ctx.beginPath();
        const middle = top + (canvas.height - top) / 2;
        ctx.moveTo(-(cameraX % 60), middle);
        ctx.lineTo(canvas.width - (cameraX % 60), middle);
        ctx.stroke();
        ctx.restore();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(0, top);
        ctx.lineTo(canvas.width, top);
        ctx.stroke();
    }

    function drawObstacle(ctx, type, o) {
        const x = o.x, y = o.y, w = o.width, h = o.height;
        ctx.fillStyle = 'rgba(0,0,0,0.16)';
        ctx.beginPath();
        ctx.ellipse(x + w / 2, y + h + 3, w * 0.55, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        if (type === 'car') {
            const c = o.color || '#ff6f91';
            ctx.fillStyle = '#2b2d42';
            ctx.beginPath(); ctx.roundRect(x + 6, y + h - 13, 15, 11, 4); ctx.fill();
            ctx.beginPath(); ctx.roundRect(x + w - 21, y + h - 13, 15, 11, 4); ctx.fill();
            ctx.fillStyle = c;
            ctx.beginPath(); ctx.roundRect(x, y + 8, w, h - 16, 12); ctx.fill();
            ctx.fillStyle = 'rgba(255,255,255,0.28)';
            ctx.beginPath(); ctx.roundRect(x + 4, y + 12, w * 0.62, h * 0.34, 8); ctx.fill();
            ctx.fillStyle = 'rgba(43,45,66,0.6)';
            ctx.beginPath(); ctx.roundRect(x + w * 0.38, y + 15, w * 0.28, h * 0.24, 5); ctx.fill();
            ctx.fillStyle = '#FFD23F';
            ctx.fillRect(x + w - 7, y + h - 20, 5, 8);
            ctx.fillStyle = '#e52521';
            ctx.fillRect(x + 2, y + h - 20, 5, 8);
        } else if (type === 'truck') {
            const c = o.color || '#4a3f6b';
            ctx.fillStyle = '#2b2d42';
            ctx.beginPath(); ctx.roundRect(x + 6, y + h - 13, 15, 11, 4); ctx.fill();
            ctx.beginPath(); ctx.roundRect(x + w - 21, y + h - 13, 15, 11, 4); ctx.fill();
            ctx.fillStyle = c;
            ctx.beginPath(); ctx.roundRect(x, y + 10, w * 0.62, h - 20, 8); ctx.fill();
            ctx.fillStyle = 'rgba(255,255,255,0.22)';
            ctx.fillRect(x + 8, y + 16, 8, h - 36);
            ctx.fillRect(x + w * 0.28, y + 16, 8, h - 36);
            ctx.fillRect(x + w * 0.46, y + 16, 8, h - 36);
            ctx.fillStyle = c;
            ctx.beginPath(); ctx.roundRect(x + w * 0.62, y + 20, w * 0.38, h - 34, 8); ctx.fill();
            ctx.fillStyle = 'rgba(43,45,66,0.55)';
            ctx.beginPath(); ctx.roundRect(x + w * 0.66, y + 24, w * 0.24, 14, 5); ctx.fill();
        } else if (type === 'bus') {
            const c = o.color || '#fbd000';
            ctx.fillStyle = '#2b2d42';
            ctx.beginPath(); ctx.roundRect(x + 6, y + h - 13, 15, 11, 4); ctx.fill();
            ctx.beginPath(); ctx.roundRect(x + w - 21, y + h - 13, 15, 11, 4); ctx.fill();
            ctx.fillStyle = c;
            ctx.beginPath(); ctx.roundRect(x, y, w, h - 8, 14); ctx.fill();
            ctx.fillStyle = 'rgba(255,255,255,0.35)';
            ctx.fillRect(x + 6, y + 8, w - 12, 12);
            for (let i = 0; i < 3; i++) {
                ctx.fillStyle = 'rgba(43,45,66,0.6)';
                ctx.beginPath(); ctx.roundRect(x + 10 + i * (w - 24) / 3, y + 26, (w - 36) / 3, 16, 4); ctx.fill();
            }
            ctx.fillStyle = '#e52521';
            ctx.fillRect(x + w - 9, y + h - 22, 5, 8);
        } else if (type === 'cone') {
            ctx.fillStyle = '#2b2d42';
            ctx.beginPath(); ctx.ellipse(x + w / 2, y + h + 3, w * 0.55, 5, 0, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#ff6f3c';
            ctx.beginPath();
            ctx.moveTo(x, y + h);
            ctx.lineTo(x + w, y + h);
            ctx.lineTo(x + w / 2, y);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(x + w / 2 - w * 0.18, y + h * 0.42, w * 0.36, h * 0.18);
        } else if (type === 'rock') {
            const c = o.color || '#8a8a8a';
            ctx.fillStyle = 'rgba(0,0,0,0.16)';
            ctx.beginPath(); ctx.ellipse(x + w / 2, y + h + 3, w * 0.55, 6, 0, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = c;
            ctx.beginPath();
            ctx.moveTo(x + 4, y + h - 4);
            ctx.quadraticCurveTo(x, y + h * 0.55, x + w * 0.35, y + 6);
            ctx.quadraticCurveTo(x + w * 0.75, y - 2, x + w - 6, y + h * 0.4);
            ctx.quadraticCurveTo(x + w, y + h, x + 4, y + h - 4);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = 'rgba(255,255,255,0.3)';
            ctx.beginPath();
            ctx.ellipse(x + w * 0.35, y + h * 0.3, w * 0.14, h * 0.1, -0.4, 0, Math.PI * 2);
            ctx.fill();
        } else if (type === 'barrier') {
            ctx.fillStyle = '#2b2d42';
            ctx.fillRect(x + 6, y + h - 6, 9, 6);
            ctx.fillRect(x + w - 15, y + h - 6, 9, 6);
            ctx.fillStyle = '#e52521';
            ctx.fillRect(x, y + 6, w, h - 18);
            ctx.save();
            ctx.beginPath();
            ctx.rect(x, y + 6, w, h - 18);
            ctx.clip();
            ctx.fillStyle = '#ffffff';
            for (let i = -h; i < w; i += 20) {
                ctx.beginPath();
                ctx.moveTo(x + i, y + h - 6);
                ctx.lineTo(x + i + 14, y + h - 6);
                ctx.lineTo(x + i + 14 - 16, y + 6);
                ctx.lineTo(x + i - 16, y + 6);
                ctx.closePath();
                ctx.fill();
            }
            ctx.restore();
        } else if (type === 'lamp') {
            ctx.fillStyle = '#4a3f6b';
            ctx.fillRect(x + w / 2 - 4, y, 8, h);
            ctx.fillStyle = '#FFD23F';
            ctx.beginPath();
            ctx.arc(x + w / 2, y - 6, 8, Math.PI, 0);
            ctx.fill();
            ctx.fillRect(x + w / 2 - 8, y - 8, 16, 6);
        }
    }

    function drawDriveCar(ctx, w, h, t) {
        const x = -w / 2;
        const y = -h / 2;
        const wheelR = h * 0.18;

        ctx.fillStyle = '#e52521';
        ctx.beginPath();
        ctx.roundRect(x, y + h * 0.24, w, h * 0.48, h * 0.12);
        ctx.fill();
        ctx.fillStyle = '#8f1720';
        ctx.beginPath();
        ctx.roundRect(x + w * 0.02, y + h * 0.62, w * 0.96, h * 0.16, h * 0.06);
        ctx.fill();

        ctx.fillStyle = '#c5161d';
        ctx.beginPath();
        ctx.moveTo(x + w * 0.18, y + h * 0.28);
        ctx.lineTo(x + w * 0.22, y + h * 0.04);
        ctx.quadraticCurveTo(x + w * 0.25, y - h * 0.02, x + w * 0.34, y - h * 0.02);
        ctx.lineTo(x + w * 0.7, y + h * 0.02);
        ctx.lineTo(x + w * 0.88, y + h * 0.28);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#2f3338';
        ctx.beginPath();
        ctx.roundRect(x + w * 0.27, y + h * 0.06, w * 0.24, h * 0.2, h * 0.04);
        ctx.roundRect(x + w * 0.55, y + h * 0.06, w * 0.24, h * 0.2, h * 0.04);
        ctx.fill();

        [x + w * 0.2, x + w * 0.8].forEach(wx => {
            const wy = y + h * 0.76;
            ctx.save();
            ctx.translate(wx, wy);
            ctx.rotate(t * 18);
            ctx.scale(1, 0.82);
            ctx.fillStyle = '#24282d';
            ctx.beginPath();
            ctx.arc(0, 0, wheelR, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#d9d9d9';
            ctx.beginPath();
            ctx.arc(0, 0, wheelR * 0.62, 0, Math.PI * 2);
            ctx.fill();
            for (let spoke = 0; spoke < 5; spoke++) {
                const angle = spoke * Math.PI * 2 / 5;
                ctx.strokeStyle = '#24282d';
                ctx.lineWidth = Math.max(3, h * 0.028);
                ctx.beginPath();
                ctx.moveTo(Math.cos(angle) * wheelR * 0.12, Math.sin(angle) * wheelR * 0.12);
                ctx.lineTo(Math.cos(angle) * wheelR * 0.52, Math.sin(angle) * wheelR * 0.52);
                ctx.stroke();
            }
            ctx.fillStyle = '#24282d';
            ctx.beginPath();
            ctx.arc(0, 0, wheelR * 0.18, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });

        ctx.fillStyle = '#ffd23f';
        ctx.beginPath();
        ctx.roundRect(x + w * 0.91, y + h * 0.39, w * 0.06, h * 0.12, h * 0.04);
        ctx.fill();
        ctx.fillStyle = '#f5f5f5';
        ctx.beginPath();
        ctx.roundRect(x + w * 0.01, y + h * 0.39, w * 0.06, h * 0.12, h * 0.04);
        ctx.fill();
        ctx.fillStyle = '#2f3338';
        ctx.fillRect(x + w * 0.48, y + h * 0.42, w * 0.08, h * 0.035);
    }

    function drawPitHazards(ctx, theme, t, canvas) {
        const hazard = theme.pitHazard;
        if (!hazard) return;
        const gy = canvas.height - 140;
        const depth = canvas.height - gy;
        const grounds = theme.grounds.slice().sort((a, b) => a.x - b.x);
        for (let i = 0; i < grounds.length - 1; i++) {
            const gx = grounds[i].x + grounds[i].w;
            const gapEnd = grounds[i + 1].x;
            if (gapEnd - gx < 8) continue;
            if (hazard === 'lava') {
                const grad = ctx.createLinearGradient(0, gy, 0, canvas.height);
                grad.addColorStop(0, '#ff5f2e');
                grad.addColorStop(0.5, '#ff7f1f');
                grad.addColorStop(1, '#b33a00');
                ctx.fillStyle = grad;
                ctx.fillRect(gx, gy, gapEnd - gx, depth);
                ctx.fillStyle = '#ffd166';
                ctx.fillRect(gx, gy, gapEnd - gx, 5);
                ctx.fillStyle = '#fff3c4';
                for (let k = 0; k < 6; k++) {
                    const bx = gx + ((k * 41 + t * 26) % (gapEnd - gx));
                    const by = canvas.height - 12 - ((k * 29 + t * 70) % (depth * 0.7));
                    ctx.beginPath();
                    ctx.arc(bx, by, 3.5, 0, Math.PI * 2);
                    ctx.fill();
                }
            } else if (hazard === 'water') {
                const grad = ctx.createLinearGradient(0, gy, 0, canvas.height);
                grad.addColorStop(0, 'rgba(90,190,255,0.9)');
                grad.addColorStop(1, 'rgba(15,80,160,0.95)');
                ctx.fillStyle = grad;
                ctx.fillRect(gx, gy, gapEnd - gx, depth);
                ctx.fillStyle = 'rgba(255,255,255,0.5)';
                for (let k = 0; k < 3; k++) {
                    const ry = gy + 8 + k * 14;
                    const off = Math.sin(t * 2 + k) * 4;
                    ctx.fillRect(gx + 4 + off, ry, gapEnd - gx - 8, 2);
                }
                ctx.fillStyle = '#ffffff';
                ctx.font = '22px "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                for (let k = 0; k < 2; k++) {
                    const fx = gx + 18 + ((k * 37 + t * 22) % Math.max(1, gapEnd - gx - 36));
                    const fy = canvas.height - 26 - ((k * 19 + Math.sin(t * 1.6 + k * 2.4) * 6) % (depth * 0.55));
                    ctx.fillText('🐟', fx, fy);
                }
            } else if (hazard === 'spikes') {
                ctx.fillStyle = 'rgba(18,20,30,0.92)';
                ctx.fillRect(gx, gy, gapEnd - gx, depth);
                ctx.fillStyle = '#c7d2e0';
                for (let sx = gx + 12; sx < gapEnd - 6; sx += 24) {
                    const h = 30 + Math.sin(sx * 0.33 + gx) * 8;
                    ctx.beginPath();
                    ctx.moveTo(sx - 10, canvas.height);
                    ctx.lineTo(sx, canvas.height - h);
                    ctx.lineTo(sx + 10, canvas.height);
                    ctx.closePath();
                    ctx.fill();
                }
                ctx.fillStyle = '#5c6a7a';
                ctx.fillRect(gx, canvas.height - 6, gapEnd - gx, 6);
            }
        }
    }

    function drawCeiling(ctx, theme, canvas) {
        ctx.fillStyle = theme.ceilingColor;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(canvas.width, 0);
        for (let x = canvas.width; x >= 0; x -= 90) {
            const y = 62 + Math.sin(x * 0.05) * 16 + ((x / 90) % 2) * 12;
            ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        for (let sx = 40; sx < canvas.width; sx += 170) {
            ctx.beginPath();
            ctx.moveTo(sx - 16, 72);
            ctx.lineTo(sx, 72 + 26 + (sx % 3) * 14);
            ctx.lineTo(sx + 16, 72);
            ctx.closePath();
            ctx.fill();
        }
    }

    function drawEnemy(ctx, type) {
        ctx.fillStyle = '#2b2d42';
        ctx.beginPath();
        ctx.arc(0, 5, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f4a6c1';
        ctx.beginPath();
        ctx.arc(0, 9, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-6, 0, 2.5, 0, Math.PI * 2);
        ctx.arc(6, 0, 2.5, 0, Math.PI * 2);
        ctx.fill();
    }

    function drawGoalFinish(ctx, goal) {
        const gx = goal.x, gy = goal.y, gw = goal.width, gh = goal.height;
        const cell = 26;
        for (let yy = gy; yy < gy + gh; yy += cell) {
            for (let xx = gx; xx < gx + gw; xx += cell) {
                ctx.fillStyle = (((xx - gx) / cell | 0) + ((yy - gy) / cell | 0)) % 2 === 0 ? '#2b2d42' : '#ffffff';
                ctx.fillRect(xx, yy, cell, cell);
            }
        }
        ctx.strokeStyle = '#FFD23F';
        ctx.lineWidth = 7;
        ctx.strokeRect(gx + 4, gy + 4, gw - 8, gh - 8);
        const bw = Math.min(gw - 44, 200), bh = 48;
        const by = gy + Math.max(10, (gh - bh) / 2 - 6);
        ctx.fillStyle = '#4a3f6b';
        ctx.beginPath();
        ctx.roundRect(gx + (gw - bw) / 2, by, bw, bh, 14);
        ctx.fill();
        ctx.fillStyle = '#FFD23F';
        ctx.font = 'bold 32px "Fredoka", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('ЦИЉ', gx + gw / 2, by + bh / 2 + 2);
    }

    window.AdventureModes = {
        drawRoad,
        drawObstacle,
        drawDriveCar,
        drawPitHazards,
        drawCeiling,
        drawEnemy,
        drawGoalFinish
    };
})();
