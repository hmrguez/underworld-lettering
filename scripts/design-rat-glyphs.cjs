// Inferred glyphs: angular brush skeletons fitted to the traced Rat King cap height.
const fs = require('fs');
const strokes = {
  B: [
    [
      [25, 0],
      [15, 490],
    ],
    [
      [25, 8],
      [175, 20],
      [225, 70],
      [165, 205],
      [30, 215],
    ],
    [
      [30, 215],
      [185, 240],
      [230, 330],
      [185, 460],
      [15, 478],
    ],
  ],
  C: [
    [
      [228, 45],
      [180, 0],
      [60, 45],
      [5, 190],
      [10, 370],
      [80, 490],
      [225, 425],
    ],
  ],
  D: [
    [
      [20, 0],
      [10, 490],
    ],
    [
      [20, 0],
      [165, 30],
      [235, 170],
      [230, 350],
      [150, 478],
      [10, 490],
    ],
  ],
  E: [
    [
      [30, 0],
      [10, 490],
    ],
    [
      [15, 10],
      [245, -4],
    ],
    [
      [20, 218],
      [190, 205],
    ],
    [
      [10, 480],
      [228, 475],
    ],
  ],
  F: [
    [
      [30, 0],
      [15, 490],
    ],
    [
      [20, 10],
      [240, 0],
    ],
    [
      [20, 220],
      [185, 205],
    ],
  ],
  H: [
    [
      [25, 0],
      [5, 490],
    ],
    [
      [222, -10],
      [204, 490],
    ],
    [
      [10, 240],
      [215, 215],
    ],
  ],
  J: [
    [
      [210, 0],
      [196, 365],
      [142, 478],
      [45, 490],
      [0, 395],
    ],
    [
      [75, 12],
      [240, 0],
    ],
  ],
  L: [
    [
      [35, -10],
      [10, 485],
      [240, 475],
    ],
  ],
  M: [
    [
      [0, 490],
      [30, 0],
      [138, 310],
      [215, -10],
      [252, 490],
    ],
  ],
  O: [
    [
      [118, -4],
      [35, 30],
      [0, 210],
      [18, 418],
      [100, 490],
      [212, 430],
      [239, 210],
      [210, 45],
      [118, -4],
    ],
  ],
  P: [
    [
      [25, 0],
      [8, 490],
    ],
    [
      [22, 10],
      [160, 0],
      [235, 55],
      [218, 165],
      [145, 220],
      [18, 225],
    ],
  ],
  Q: [
    [
      [118, -4],
      [35, 30],
      [0, 210],
      [18, 418],
      [100, 490],
      [212, 430],
      [239, 210],
      [210, 45],
      [118, -4],
    ],
    [
      [140, 370],
      [267, 525],
    ],
  ],
  S: [
    [
      [230, 40],
      [142, 0],
      [33, 65],
      [7, 150],
      [80, 228],
      [190, 290],
      [217, 388],
      [135, 485],
      [25, 447],
    ],
  ],
  U: [
    [
      [20, 0],
      [0, 365],
      [45, 470],
      [121, 490],
      [203, 410],
      [239, -8],
    ],
  ],
  V: [
    [
      [15, -5],
      [91, 490],
      [250, -10],
    ],
  ],
  W: [
    [
      [8, -5],
      [50, 487],
      [145, 177],
      [185, 490],
      [292, -10],
    ],
  ],
  X: [
    [
      [0, 0],
      [235, 490],
    ],
    [
      [235, 0],
      [0, 490],
    ],
  ],
  Y: [
    [
      [0, 0],
      [110, 235],
      [250, -5],
    ],
    [
      [110, 235],
      [89, 490],
    ],
  ],
  Z: [
    [
      [0, 10],
      [250, -5],
      [2, 481],
      [243, 490],
    ],
  ],
};
function poly(points) {
  return (
    'M' +
    points.map((p) => p.map((n) => n.toFixed(1)).join(' ')).join('L') +
    'Z'
  );
}
function ribbon(pts, seed) {
  let rng = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  let samples = [];
  for (let i = 0; i < pts.length - 1; i++) {
    let [x, y] = pts[i],
      dx = pts[i + 1][0] - x,
      dy = pts[i + 1][1] - y,
      n = Math.max(1, Math.ceil(Math.hypot(dx, dy) / 23));
    for (let j = 0; j < n; j++)
      samples.push([x + (dx * j) / n, y + (dy * j) / n]);
  }
  samples.push(pts.at(-1));
  let left = [],
    right = [];
  samples.forEach(([x, y], i) => {
    let prev = samples[Math.max(0, i - 1)],
      next = samples[Math.min(samples.length - 1, i + 1)],
      dx = next[0] - prev[0],
      dy = next[1] - prev[1],
      l = Math.hypot(dx, dy) || 1,
      nx = -dy / l,
      ny = dx / l;
    let w = 17 + rng() * 12;
    if (i === 0 || i === samples.length - 1) w *= 0.8;
    left.push([x + nx * w + (rng() - 0.5) * 4, y + ny * w + (rng() - 0.5) * 4]);
    right.push([
      x - nx * w + (rng() - 0.5) * 4,
      y - ny * w + (rng() - 0.5) * 4,
    ]);
  });
  let outer = [...left, ...right.reverse()];
  let d = poly(outer); // Narrow paint cracks run with the stroke.
  let [a, b] = [pts[0], pts[1]],
    dx = b[0] - a[0],
    dy = b[1] - a[1],
    len = Math.hypot(dx, dy),
    nx = -dy / len,
    ny = dx / len;
  for (let q of [0.18, 0.73]) {
    let x = a[0] + dx * q,
      y = a[1] + dy * q;
    let end = Math.min(0.97, q + 0.09);
    let xx = a[0] + dx * end,
      yy = a[1] + dy * end;
    let cut = [
      [x + nx * 2, y + ny * 2],
      [xx + nx, yy + ny],
      [xx - nx, yy - ny],
      [x - nx * 2, y - ny * 2],
    ]; // Outer winding is negative; cuts are positive.
    d += poly(cut.reverse());
  }
  return d;
}
let result = {};
for (let [ch, list] of Object.entries(strokes)) {
  let d = list
    .map((pts, i) => ribbon(pts, ch.charCodeAt(0) * 100 + i))
    .join('');
  let flat = list.flat();
  let minx = Math.min(...flat.map((p) => p[0])) - 30,
    maxx = Math.max(...flat.map((p) => p[0])) + 30;
  result[ch] = {
    d,
    x: minx,
    y: 0,
    w: maxx - minx,
    h: 490,
    advance: maxx - minx - 20,
  };
}
fs.writeFileSync('src/lib/inferred-rat-paths.json', JSON.stringify(result));
