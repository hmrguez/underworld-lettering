// Inferred glyphs: angular brush skeletons fitted to the traced Rat King cap height.
const fs = require('fs');
const strokes = {
  B: [
    [
      [52, 26],
      [10, 490],
    ],
    [
      [-22, 72],
      [155, -10],
      [235, 40],
      [220, 112],
      [130, 218],
      [20, 243],
    ],
    [
      [30, 235],
      [165, 228],
      [245, 285],
      [230, 370],
      [110, 480],
      [10, 475],
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
      [35, 18],
      [0, 494],
    ],
    [
      [-20, 45],
      [132, -14],
      [236, 64],
      [259, 205],
      [207, 348],
      [95, 484],
      [0, 475],
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
// Long pressure facets carry the gesture. Dry bristles belong at stroke ends,
// not at every sample of a curve (which made the old bowls look serrated).
function ribbon(pts, seed) {
  const rng = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const closed = pts[0].every((n, i) => n === pts.at(-1)[i]);
  const samples = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const [x, y] = pts[i];
    const dx = pts[i + 1][0] - x;
    const dy = pts[i + 1][1] - y;
    const count = Math.max(1, Math.ceil(Math.hypot(dx, dy) / 145));
    for (let j = 0; j < count; j++)
      samples.push([x + (dx * j) / count, y + (dy * j) / count]);
  }
  if (!closed) samples.push(pts.at(-1));
  const frames = samples.map(([x, y], i) => {
    const prev =
      samples[
        closed ? (i + samples.length - 1) % samples.length : Math.max(0, i - 1)
      ];
    const next =
      samples[
        closed ? (i + 1) % samples.length : Math.min(samples.length - 1, i + 1)
      ];
    const unit = (dx, dy) => {
      const len = Math.hypot(dx, dy) || 1;
      return [dx / len, dy / len];
    };
    const incoming =
      i === 0 && !closed
        ? unit(next[0] - x, next[1] - y)
        : unit(x - prev[0], y - prev[1]);
    const outgoing =
      i === samples.length - 1 && !closed
        ? incoming
        : unit(next[0] - x, next[1] - y);
    const [tx, ty] = unit(incoming[0] + outgoing[0], incoming[1] + outgoing[1]);
    const t = i / (samples.length - 1);
    // Broad loaded entry, lighter exit; small slow pressure shifts, no noise
    // added to coordinates. Limited miters keep angular shoulders connected.
    const pressure = closed
      ? 1 + 0.16 * Math.sin(t * Math.PI * 2)
      : 1.32 - 0.48 * t;
    const width = (23 + rng() * 5) * pressure;
    const miter = Math.min(
      1.45,
      1 / Math.max(0.4, tx * outgoing[0] + ty * outgoing[1]),
    );
    return { x, y, tx, ty, nx: -ty, ny: tx, width: width * miter };
  });
  const side = (sign) =>
    frames.map((f) => [
      f.x + sign * f.nx * f.width,
      f.y + sign * f.ny * f.width,
    ]);
  const left = side(1),
    right = side(-1);
  // One small longitudinal edge split per long stroke side. The placement is
  // intermittent; it never adds a repeated tooth to every curve segment.
  const splitEdge = (edge, sign) => {
    if (edge.length < 4) return edge;
    const index = sign === 1 ? 1 : edge.length - 3;
    const a = edge[index],
      b = edge[index + 1];
    const f = frames[index];
    const along = (t, inset) => [
      a[0] + (b[0] - a[0]) * t - sign * f.nx * inset,
      a[1] + (b[1] - a[1]) * t - sign * f.ny * inset,
    ];
    return [
      ...edge.slice(0, index + 1),
      along(0.35, -3),
      along(0.4, 8),
      along(0.82, 0),
      ...edge.slice(index + 1),
    ];
  };
  const l = splitEdge(left, 1),
    r = splitEdge(right, -1);
  if (closed) return poly(l) + poly(r.reverse());
  const cap = (f, end) => {
    const sign = end ? 1 : -1;
    // Unequal bristle lengths, with two deep narrow gaps, follow the direction
    // of the brush. These are transparent notches in the outline itself.
    const profile = [
      [0.76, 8],
      [0.39, 14],
      [0.29, -15],
      [0.16, 18],
      [-0.2, 11],
      [-0.32, -10],
      [-0.45, 23],
      [-0.83, 6],
    ];
    return profile.map(([across, reach]) => [
      f.x + sign * f.nx * f.width * across + sign * f.tx * reach,
      f.y + sign * f.ny * f.width * across + sign * f.ty * reach,
    ]);
  };
  return poly([
    ...l,
    ...cap(frames.at(-1), true),
    ...r.reverse(),
    ...cap(frames[0], false),
  ]);
}
let result = {};
for (let [ch, list] of Object.entries(strokes)) {
  let d = list
    .map((pts, i) => ribbon(pts, ch.charCodeAt(0) * 100 + i))
    .join('');
  // Measure the finished outline, including bristle tips, for every glyph.
  const coordinates = d.match(/-?\d+(?:\.\d+)?/g).map(Number);
  const xs = coordinates.filter((_, i) => i % 2 === 0);
  const ys = coordinates.filter((_, i) => i % 2 === 1);
  const minx = Math.min(...xs),
    maxx = Math.max(...xs);
  const miny = Math.min(...ys),
    height = Math.max(...ys) - miny;
  result[ch] = {
    d,
    x: minx,
    y: miny,
    w: maxx - minx,
    h: height,
    advance: maxx - minx + 4,
  };
}
fs.writeFileSync('src/lib/inferred-rat-paths.json', JSON.stringify(result));
