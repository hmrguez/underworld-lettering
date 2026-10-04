import fallback from './fallback-paths.json' with { type: 'json' };
import outlines from './solomon-paths.json' with { type: 'json' };
import type { Glyph, ModifierKey, NameAST, Overrides } from './parser.ts';
import type { RenderOptions, RenderResult } from './engine.ts';

const fmt = (n: number) => Math.round(n * 100) / 100;
const path = (d: string, extra = '') => `<path d="${d}" ${extra}/>`;
const rect = (x: number, y: number, w: number, h: number) =>
  `M${x} ${y}h${w}v${h}h${-w}Z`;
// Inferred capitals: 430-unit cap height, heavy upright stems, fine connecting
// strokes and bracket-like wedge serifs. These are designs, not Valve outlines.
const stem = (x: number, width = 78) =>
  `M${x - 18} 0h${width + 36}v9l-18 14v384l18 14v9h${-width - 36}v-9l18-14V23l-18-14Z`;
const diagonal = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  w: number,
) => {
  const length = Math.hypot(x2 - x1, y2 - y1),
    dx = ((y2 - y1) * w) / length / 2,
    dy = (-(x2 - x1) * w) / length / 2;
  return `M${x1 + dx} ${y1 + dy}L${x2 + dx} ${y2 + dy}L${x2 - dx} ${y2 - dy}L${x1 - dx} ${y1 - dy}Z`;
};
const oval =
  'M115 0C15 0 0 38 0 215S15 430 115 430S230 392 230 215S215 0 115 0ZM115 16C93 16 88 60 88 215S93 414 115 414S142 370 142 215S137 16 115 16Z';
const bowl = (y: number, h: number) =>
  `M65 ${y}H115C228 ${y} 228 ${y + h} 115 ${y + h}H65V${y + h - 16}H112C142 ${y + h - 16} 142 ${y + 16} 112 ${y + 16}H65Z`;
function inferred(char: string): { ds: string[]; w: number } {
  const left = stem(20),
    right = stem(164, 66),
    bar = (y: number, w = 210) => rect(20, y, w, 16);
  const shapes: Record<string, { ds: string[]; w: number }> = {
    A: {
      ds: [
        diagonal(20, 424, 115, 5, 16),
        diagonal(115, 5, 215, 424, 76),
        rect(0, 414, 65, 16),
        rect(160, 414, 95, 16),
        rect(60, 278, 125, 16),
      ],
      w: 255,
    },
    B: { ds: [left, bowl(0, 213), bowl(207, 223)], w: 230 },
    C: { ds: [oval, rect(192, 0, 38, 90)], w: 230 },
    D: { ds: [left, bowl(0, 430)], w: 230 },
    E: {
      ds: [
        left,
        bar(0),
        bar(207, 165),
        bar(414),
        rect(204, 0, 26, 85),
        rect(204, 345, 26, 85),
      ],
      w: 230,
    },
    F: { ds: [left, bar(0), bar(207, 165), rect(204, 0, 26, 85)], w: 230 },
    G: { ds: [oval, rect(140, 215, 90, 16), rect(164, 215, 66, 205)], w: 230 },
    H: { ds: [left, right, rect(60, 210, 160, 16)], w: 248 },
    I: { ds: [stem(20, 78)], w: 134 },
    J: {
      ds: [
        stem(132, 78),
        'M132 330V387Q132 430 86 430Q0 430 0 345H65Q65 414 90 414Q116 414 116 380V330Z',
      ],
      w: 228,
    },
    K: {
      ds: [
        left,
        diagonal(85, 215, 224, 9, 16),
        diagonal(95, 205, 219, 421, 70),
      ],
      w: 254,
    },
    P: { ds: [left, bowl(0, 228)], w: 230 },
    Q: { ds: [oval, diagonal(123, 332, 236, 445, 28)], w: 260 },
    R: { ds: [left, bowl(0, 228), diagonal(122, 217, 222, 416, 70)], w: 258 },
    T: {
      ds: [
        stem(88, 78),
        rect(0, 0, 252, 16),
        rect(0, 0, 24, 86),
        rect(228, 0, 24, 86),
      ],
      w: 252,
    },
    U: {
      ds: [
        'M0 0H132V10L110 23V348Q110 410 146 410Q190 410 190 342V23L164 10V0H232V10L210 23V350Q210 430 137 430Q22 430 22 350V23L0 10Z',
      ],
      w: 232,
    },
    V: {
      ds: [
        diagonal(44, 7, 145, 426, 80),
        diagonal(235, 7, 145, 426, 16),
        rect(0, 0, 109, 16),
        rect(204, 0, 58, 16),
      ],
      w: 262,
    },
    W: {
      ds: [
        diagonal(45, 7, 123, 423, 76),
        diagonal(184, 7, 123, 423, 14),
        diagonal(184, 7, 260, 423, 76),
        diagonal(321, 7, 260, 423, 14),
        rect(0, 0, 105, 16),
        rect(294, 0, 56, 16),
      ],
      w: 350,
    },
    X: {
      ds: [
        diagonal(45, 8, 210, 422, 76),
        diagonal(211, 8, 45, 422, 16),
        rect(0, 0, 108, 16),
        rect(165, 414, 92, 16),
        rect(12, 414, 64, 16),
        rect(190, 0, 64, 16),
      ],
      w: 258,
    },
    Y: {
      ds: [
        diagonal(45, 7, 126, 219, 76),
        diagonal(218, 7, 126, 219, 16),
        rect(0, 0, 107, 16),
        rect(193, 0, 59, 16),
        'M88 200H166V407L184 421V430H70V421L88 407Z',
      ],
      w: 252,
    },
    Z: {
      ds: [
        rect(0, 0, 230, 16),
        diagonal(185, 8, 45, 422, 77),
        rect(0, 414, 230, 16),
        rect(0, 0, 20, 85),
        rect(210, 345, 20, 85),
      ],
      w: 230,
    },
  };
  // Open the right side of C/G without punching through other overlapping
  // components: glyph() supplies a separate open contour.
  if (char === '-') return { ds: [rect(0, 205, 90, 18)], w: 90 };
  if (char === "'") return { ds: ['M0 0H35V55L10 92H0L10 55H0Z'], w: 35 };
  return shapes[char] ?? { ds: [oval], w: 230 };
}
function local(g: Glyph, overrides: Overrides, key: ModifierKey) {
  return overrides[g.id]?.[key] ?? g.modifiers[key] ?? 'auto';
}
function on(
  g: Glyph,
  overrides: Overrides,
  key: ModifierKey,
  automatic: boolean,
) {
  const value = local(g, overrides, key);
  return value === 'auto' ? automatic : value === 'on';
}
function glyph(g: Glyph, wordIndex: number, overrides: Overrides) {
  const original =
    g.char === 'O'
      ? outlines.ovals[
          local(g, overrides, 'variant') === 'base'
            ? 1
            : local(g, overrides, 'variant') === 'alt'
              ? 2
              : Math.floor(wordIndex / 2) % 3
        ]
      : (outlines.letters as Record<string, typeof outlines.letters.S>)[g.char];
  if (original)
    return {
      shape: `<g transform="translate(${-original.x} 0)">${path(original.d, 'fill-rule="evenodd"')}</g>`,
      w: original.w,
      original: true,
    };
  if (/^[0-9]$/.test(g.char)) {
    const p = (fallback.harrow as Record<string, typeof fallback.harrow.A>)[
      g.char
    ];
    return {
      shape: `<g transform="translate(0 180) scale(${170 / p.w} ${430 / p.h}) translate(${-p.x} ${-p.y})">${path(p.d)}</g>`,
      w: 170,
      original: false,
    };
  }
  const { ds, w } = inferred(g.char);
  let shape = ds.map((d) => path(d, 'fill-rule="evenodd"')).join('');
  if (g.char === 'C' || g.char === 'G') {
    shape = path(
      'M115 0C15 0 0 38 0 215S15 430 115 430Q190 430 230 392V322H211Q187 414 115 414C93 414 88 370 88 215S93 16 115 16Q188 16 211 108H230V38Q190 0 115 0Z',
    );
    if (g.char === 'G')
      shape += path(rect(142, 220, 88, 16)) + path(rect(164, 220, 66, 192));
  }
  return {
    shape: `<g transform="translate(0 180)">${shape}</g>`,
    w,
    original: false,
  };
}

export function renderSolomon(
  ast: NameAST,
  o: RenderOptions,
  namespace: string,
  color: string,
): RenderResult {
  const hits: RenderResult['hits'] = [],
    applied: RenderResult['applied'] = [],
    inferredLetters: string[] = [];
  let plates = '',
    letters = '',
    marks = '',
    defs = '',
    x = 0,
    minX = 0,
    maxX = 1,
    minY = 175,
    maxY = 630;
  const tracking = Number.isFinite(Number(o.tracking)) ? Number(o.tracking) : 0;
  for (const word of ast.words) {
    // First L in each word; if absent, the middle letter. Any letter can be
    // explicitly marked, and an explicit off suppresses the automatic mark.
    const anchor =
      word.glyphs.find((g) => g.char === 'L') ??
      word.glyphs[Math.floor((word.glyphs.length - 1) / 2)];
    for (const [index, g] of word.glyphs.entries()) {
      const a = glyph(g, index, o.overrides),
        w = a.w;
      const plated = on(
        g,
        o.overrides,
        'plate',
        o.plates && index % 2 === (o.platePhase === 'odd' ? 0 : 1),
      );
      const marked = on(g, o.overrides, 'rook', o.rook && g.id === anchor.id);
      const id = `${namespace}-plate-${g.id}`;
      let shape = a.shape;
      if (plated) {
        const pw = w + 104,
          slant = pw * 0.56,
          left = x - 52,
          top = 195 - slant,
          bottom = Math.max(800, 630 + slant - 52 * 0.56);
        const plate = `M${fmt(left)} 195L${fmt(left + pw)} ${fmt(top)}V${fmt(bottom - slant)}L${fmt(left)} ${bottom}Z`;
        defs += `<mask id="${id}" maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse" x="${fmt(left - 1)}" y="${fmt(top - 1)}" width="${fmt(pw + 2)}" height="${fmt(bottom - top + 2)}" style="mask-type:luminance"><path d="${plate}" fill="white"/><g fill="black" transform="translate(${fmt(x)} 0)">${a.shape}</g></mask>`;
        plates += `<path data-plate="${g.id}" d="${plate}" mask="url(#${id})"/>`;
        // Mask subtracts the glyph ink; counters retain plate ink. No canvas
        // color or installed font is embedded in the export.
        shape = `<rect x="-52" y="${fmt(top)}" width="${fmt(pw)}" height="${fmt(bottom - top)}" fill="transparent"/>`;
        minX = Math.min(minX, left);
        maxX = Math.max(maxX, left + pw);
        minY = Math.min(minY, top);
        maxY = Math.max(maxY, bottom);
        applied.push({ glyph: g.id, label: 'Reversed plate' });
      }
      letters += `<g data-glyph="${g.id}" role="button" tabindex="0" aria-label="Select letter ${g.char}, position ${g.id + 1}" transform="translate(${fmt(x)} 0)">${shape}</g>`;
      if (marked) {
        const p = outlines.rook,
          scale = Math.min(1, w / 165),
          mx = x + Math.min(w / 2, 70) - (p.w * scale) / 2,
          my = plated
            ? Math.min(90, 195 - (w + 104) * 0.56 - p.h * scale - 20)
            : 90;
        marks += `<g data-rook="${g.id}" transform="translate(${fmt(mx)} ${fmt(my)}) scale(${fmt(scale)}) translate(${-p.x} ${-p.y})">${path(p.d)}</g>`;
        minY = Math.min(minY, my);
        minX = Math.min(minX, mx);
        maxX = Math.max(maxX, mx + p.w * scale);
        applied.push({ glyph: g.id, label: 'Rook mark' });
      }
      hits.push({ id: g.id, char: g.char, x, w, original: a.original });
      if (!a.original) inferredLetters.push(g.char);
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x + w);
      const gap = g.char === 'S' ? 95 : g.char === 'M' ? 100 : 94;
      x += Math.max(w + gap + tracking, w + 8);
    }
    x += 85;
  }
  const margin = 65,
    width = fmt(maxX - minX + margin * 2),
    height = fmt(maxY - minY + margin * 2);
  return {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${fmt(minX - margin)} ${fmt(minY - margin)} ${width} ${height}" role="img" aria-label="Solomon preview" fill="${color}"><defs>${defs}</defs>${plates}${letters}${marks}</svg>`,
    width,
    height,
    hits,
    applied,
    inferred: [...new Set(inferredLetters)],
    empty: !ast.glyphs.length,
  };
}
