const G = 6;
function dilate(grid, r) {
  const R = G + 2 * r;
  const RR = R + 1;
  const acc = new Int32Array(RR * RR);
  const c0 = v => Math.max(0, v), c1 = v => Math.min(R, v);
  for (let j = 0; j < G; j++) for (let i = 0; i < G; i++) {
    if (!grid[j * G + i]) continue;
    const x0 = c0(i), x1 = c1(i + 2 * r + 1), y0 = c0(j), y1 = c1(j + 2 * r + 1);
    acc[y0 * RR + x0] += 1; acc[y0 * RR + x1] -= 1; acc[y1 * RR + x0] -= 1; acc[y1 * RR + x1] += 1;
  }
  const out = new Uint8Array(G * G);
  const A = new Int32Array(RR * RR);
  for (let j = 0; j < RR; j++) for (let i = 0; i < RR; i++) {
    A[j * RR + i] = acc[j * RR + i] + (i > 0 ? A[j * RR + i - 1] : 0) + (j > 0 ? A[(j - 1) * RR + i] : 0) - (i > 0 && j > 0 ? A[(j - 1) * RR + i - 1] : 0);
    if (A[j * RR + i] > 0 && j >= r && j < r + G && i >= r && i < r + G) out[(j - r) * G + (i - r)] = 1;
  }
  return out;
}
function show(g) {
  const rows = [];
  for (let j = 0; j < G; j++) rows.push(Array.from(g.slice(j * G, j * G + G)).join(''));
  return rows.join('\n');
}

let g = new Uint8Array(G * G); g[3 * G + 3] = 1;
console.log('r=1 single center:\n' + show(dilate(g, 1)));
let g2 = new Uint8Array(G * G); g2[0] = 1;
console.log('r=1 corner:\n' + show(dilate(g2, 1)));
let g3 = new Uint8Array(G * G); g3[0 * G + 0] = 1; g3[5 * G + 5] = 1;
console.log('r=1 two corners:\n' + show(dilate(g3, 1)));
