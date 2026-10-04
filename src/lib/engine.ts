import type {
  Glyph,
  ModifierKey,
  ModifierValues,
  NameAST,
  Overrides,
} from './parser.ts';
export type StyleId = 'rat' | 'harrow' | 'baba';
export interface Style {
  id: StyleId;
  name: string;
  sample: string;
  number: string;
  description: string;
  accent: string;
}
interface Outline {
  d: string;
  x: number;
  y: number;
  w: number;
  h: number;
  advance?: number;
}
interface Asset {
  p: Outline;
  advance: number;
  x: number;
  y: number;
  scale: number;
  scaleX?: number;
  original: boolean;
  clip?: { x: number; y: number; w: number; h: number };
}
interface LayoutItem {
  g: Glyph;
  a: Asset;
  x: number;
  row: number;
  wordStart: number;
}
export interface RenderOptions {
  style: StyleId;
  crown: boolean;
  swash: boolean;
  ornaments: boolean;
  texture: boolean;
  irregular: boolean;
  tracking: number;
  swashLength: number;
  color: string;
  overrides: Overrides;
}
interface AppliedRule {
  glyph?: number;
  label: string;
}
interface Hit {
  id: number;
  char: string;
  x: number;
  w: number;
  original: boolean;
}
export interface RenderResult {
  svg: string;
  width: number;
  height: number;
  hits: Hit[];
  applied: AppliedRule[];
  inferred: string[];
  empty: boolean;
}
import refs from './reference-paths.json' with { type: 'json' };
import fallback from './fallback-paths.json' with { type: 'json' };
import inferredRat from './inferred-rat-paths.json' with { type: 'json' };
const fmt = (n: number) => Math.round(n * 100) / 100;
const path = (d: string, transform = '', extra = '') =>
  `<path d="${d}" transform="${transform}" ${extra}/>`;
const group = (s: string, t: string) => `<g transform="${t}">${s}</g>`;
export const styles: Style[] = [
  {
    id: 'rat',
    name: 'Rat King',
    sample: 'RAT KING',
    number: '01',
    description: 'Angular brushwork · sweeping leg',
    accent: '#d9543c',
  },
  {
    id: 'harrow',
    name: 'Nurse Harrow',
    sample: 'NURSE HARROW',
    number: '02',
    description: 'Tall serifs · crossing strokes',
    accent: '#83a8a1',
  },
  {
    id: 'baba',
    name: 'Baba',
    sample: 'BABA',
    number: '03',
    description: 'Folk ornaments · patterned slabs',
    accent: '#95a25a',
  },
];
function sourceGlyph(
  style: StyleId,
  ch: string,
  row: number,
  alt: boolean,
): Asset | null {
  if (style === 'rat') {
    const map: Record<string, number> = {
      R: 0,
      A: 4,
      T: 5,
      K: 1,
      I: 7,
      N: 2,
      G: 3,
    };
    const p = refs.ratking[map[ch]];
    if (p) {
      const advances: Record<string, number> = {
        R: 315,
        A: 156,
        T: 320,
        K: 219,
        I: 98,
        N: 223,
        G: 301,
      };
      return {
        p,
        advance: advances[ch],
        x: p.x,
        y: 0,
        scale: 1,
        original: true,
      };
    }
  } else if (style === 'harrow') {
    const map: Record<string, number | null> = {
      E: 0,
      H: 1,
      R: row ? 4 : null,
      W: 3,
      A: 5,
      S: 7,
      O: 8,
    };
    if (!row && ['N', 'U', 'R'].includes(ch)) {
      const [x, w] = (
        { N: [326, 294], U: [620, 308], R: [928, 257] } as Record<
          string,
          [number, number]
        >
      )[ch];
      return {
        p: refs.nurse[6],
        advance: w,
        x,
        y: 0,
        scale: 1,
        clip: { x, y: 0, w, h: 545 },
        original: true,
      };
    }
    const index = map[ch];
    const p = index == null ? undefined : refs.nurse[index];
    if (p) {
      const upper = !row;
      const s = upper ? 460 / p.h : 1;
      const adv = row
        ? (
            { H: 304, A: 317, R: 312, O: 285, W: 508 } as Record<string, number>
          )[ch]
        : ({ S: 188, E: 257 } as Record<string, number>)[ch];
      return {
        p,
        advance: adv ?? p.w * s,
        x: p.x,
        y: upper ? -p.y * s + 7 : 0,
        scale: s,
        original: true,
      };
    }
  } else if (style === 'baba' && ['A', 'B'].includes(ch)) {
    const p = refs.baba[ch === 'B' ? (alt ? 1 : 0) : alt ? 22 : 2];
    return {
      p,
      advance: ch === 'B' ? 155 : 154,
      x: p.x,
      y: 0,
      scale: 1,
      original: true,
    };
  }
  if (
    style === 'rat' &&
    (inferredRat as Record<string, Outline & { advance: number }>)[ch]
  ) {
    const p = (inferredRat as Record<string, Outline & { advance: number }>)[
      ch
    ];
    return { p, advance: p.advance, x: p.x, y: 310, scale: 1, original: false };
  }
  const p = (fallback as Record<StyleId, Record<string, Outline>>)[style][ch];
  if (!p) return null;
  const height =
    style === 'rat' ? 490 : style === 'harrow' ? (row ? 574 : 460) : 127;
  const scale = height / p.h,
    advance =
      p.w * scale * (style === 'harrow' ? 0.7 : 1) +
      (style === 'baba' ? 22 : 25);
  return {
    p,
    advance,
    x: p.x,
    y:
      -p.y * scale +
      (style === 'rat' ? 310 : style === 'harrow' ? (row ? 540 : 7) : 52),
    scale,
    scaleX: style === 'harrow' ? 0.7 : 1,
    original: false,
  };
}
function setting<K extends ModifierKey>(
  g: Glyph,
  overrides: Overrides,
  key: K,
): ModifierValues[K] {
  return overrides[g.id]?.[key] ?? g.modifiers[key] ?? 'auto';
}
function enabled(
  g: Glyph,
  overrides: Overrides,
  key: ModifierKey,
  global: boolean,
) {
  const v = setting(g, overrides, key);
  return v === 'auto' ? global : !['off', 'base'].includes(v);
}
export function render(
  ast: NameAST,
  options: Partial<RenderOptions> = {},
): RenderResult {
  const o: RenderOptions = {
    style: 'rat',
    crown: true,
    swash: true,
    ornaments: true,
    texture: true,
    irregular: true,
    tracking: 0,
    swashLength: 1,
    color: '#eee6d1',
    overrides: {},
    ...options,
  };
  const color = /^#[\da-f]{6}$/i.test(o.color) ? o.color : '#eee6d1';
  let defs = '',
    body = '';
  const applied: AppliedRule[] = [],
    inferred: string[] = [],
    hits: Hit[] = [];
  const isH = o.style === 'harrow',
    isB = o.style === 'baba';
  const rows =
    isH && ast.words.length > 1
      ? [ast.words.slice(0, 1), ast.words.slice(1)]
      : [ast.words];
  const layouts = rows.map((words, row) => {
    let x = 0;
    const items: LayoutItem[] = [];
    for (const w of words) {
      const start = x;
      for (const g of w.glyphs) {
        const alt =
          setting(g, o.overrides, 'variant') === 'alt' ||
          (setting(g, o.overrides, 'variant') === 'auto' && isB && g.id > 1);
        const asset = sourceGlyph(o.style, g.char, row, alt);
        if (asset) {
          items.push({ g, a: asset, x, row, wordStart: start });
          x += asset.advance + Number(o.tracking) * (isB ? 0.22 : 1);
        }
      }
      x += isB ? 60 : isH ? 85 : 15;
    }
    return {
      items,
      width: Math.max(
        1,
        x - (isB ? 60 : isH ? 85 : 15) - Number(o.tracking) * (isB ? 0.22 : 1),
      ),
    };
  });
  let maxW = Math.max(1, ...layouts.map((l) => l.width));
  const firstWidth =
    layouts[0]?.items
      .filter((i) => i.g.word === 0)
      .reduce(
        (n, i) => n + i.a.advance + Number(o.tracking) * (isB ? 0.22 : 1),
        0,
      ) || 0;
  const height = isB ? 220 : isH ? (rows.length > 1 ? 1170 : 610) : 990;
  for (const layout of layouts) {
    const offset =
      (maxW - layout.width) / 2 -
      (isH && rows.length > 1 && layout === layouts[0] ? 42 : 0);
    for (const { g, a, x: originalX } of layout.items) {
      const x = originalX + offset;
      const id = `glyph-${g.id}`,
        s = a.scale,
        tx = -a.x * (a.scaleX ?? 1) * s,
        ty = a.y;
      let shape: string;
      if (a.clip) {
        defs += `<clipPath id="clip-${id}"><rect x="${a.clip.x}" y="${a.clip.y}" width="${a.clip.w}" height="${a.clip.h}"/></clipPath>`;
        shape = path(a.p.d, '', `clip-path="url(#clip-${id})"`);
      } else shape = path(a.p.d);
      shape = group(
        shape,
        `translate(${fmt(tx)} ${fmt(ty)}) scale(${fmt(s * (a.scaleX ?? 1))} ${fmt(s)})`,
      );
      if (o.style === 'rat' && g.char === 'R') {
        const word = ast.words[g.word];
        const use = enabled(
          g,
          o.overrides,
          'swash',
          o.swash && word.glyphs[0].id === g.id && word.glyphs.length <= 6,
        );
        defs += `<clipPath id="rbase-${id}"><rect x="-5" y="0" width="320" height="990"/></clipPath><clipPath id="rtail-${id}"><rect x="315" y="0" width="700" height="990"/></clipPath>`;
        const base = group(shape, `translate(0 0)`);
        shape = `<g clip-path="url(#rbase-${id})">${base}</g>`;
        if (use) {
          const ww = layout.items
            .filter((i) => i.g.word === g.word)
            .reduce((n, i) => n + i.a.advance + Number(o.tracking), 0);
          const stretch =
            Math.min(2.8, Math.max(0.15, (ww * 1.23 - 315) / 657)) *
            Number(o.swashLength);
          shape += group(
            `<g clip-path="url(#rtail-${id})">${base}</g>`,
            `translate(315 0) scale(${fmt(stretch)} 1) translate(-315 0)`,
          );
          maxW = Math.max(maxW, x + 315 + 657 * stretch);
          applied.push({ glyph: g.id, label: 'R leg → word width' });
        }
      }
      if (!o.irregular && o.style === 'rat' && a.original) {
        shape = group(shape, `translate(0 ${310 - a.p.y})`);
      }
      let glyphBody = shape;
      const dot = setting(g, o.overrides, 'dot');
      if (g.char === 'I' && dot !== 'off' && dot !== 'auto') {
        const cx = a.advance * 0.5,
          cy = isB ? 24 : 220;
        const mark =
          dot === 'star'
            ? `M${cx} ${cy - 35}l9 23 25 2-19 16 6 24-21-14-21 14 6-24-19-16 25-2Z`
            : `M${cx - 34} ${cy + 12}l-8-45 26 24 16-39 14 38 27-22-9 44Z`;
        glyphBody += path(mark);
        applied.push({
          glyph: g.id,
          label: `I dot → ${dot === 'star' ? 'star' : 'crown'}`,
        });
      }
      if (
        isB &&
        enabled(g, o.overrides, 'ornament', o.ornaments) &&
        !a.original
      ) {
        const cx = a.advance * 0.5;
        glyphBody += `<path d="M${cx} 72q-12 10 0 21q12-11 0-21M${cx} 120l-7 10 7 10 7-10Z" fill="#20221c"/>`;
      }
      const rot =
        setting(g, o.overrides, 'variant') === 'alt' && !isB
          ? g.id % 2
            ? 3
            : -3
          : 0;
      body += `<g data-glyph="${g.id}" role="button" tabindex="0" aria-label="Select letter ${g.char}, position ${g.id + 1}" transform="translate(${fmt(x)} 0) rotate(${rot} ${fmt(a.advance / 2)} ${isB ? 120 : 600})">${glyphBody}</g>`;
      hits.push({
        id: g.id,
        char: g.char,
        x,
        w: a.advance,
        original: a.original,
      });
      if (!a.original) inferred.push(g.char);
    }
  }
  if (
    o.style === 'rat' &&
    o.crown &&
    ast.glyphs.length &&
    !ast.glyphs.some(
      (g) =>
        g.char === 'I' &&
        ['crown', 'star'].includes(setting(g, o.overrides, 'dot')),
    )
  ) {
    const p = refs.ratking[6];
    body += path(
      p.d,
      `translate(${fmt(firstWidth * 0.823 - p.x - p.w / 2)} 0)`,
    );
    applied.push({ label: 'Crown → first word' });
  }
  if (isH) {
    const r = layouts[0].items.find(
      (i) => i.g.char === 'R' && enabled(i.g, o.overrides, 'swash', o.swash),
    );
    if (r) {
      const x = r.x + (maxW - layouts[0].width) / 2 - 928;
      body += group(
        path(refs.nurse[9].d) + path(refs.nurse[10].d),
        `translate(${fmt(x)} 0)`,
      );
      applied.push({ glyph: r.g.id, label: 'R flourish → lower line' });
    }
  }
  if (isB && o.ornaments && ast.glyphs.length) {
    const parts = [3, 14, 15, 16, 17, 18, 19, 20, 24];
    const crown = parts.map((i) => path(refs.baba[i].d)).join('');
    body += group(crown, `translate(${fmt(maxW / 2 - 318)} 0)`);
    const ornaments = [4, 5, 8, 12].map((i) => path(refs.baba[i].d)).join('');
    body += group(ornaments, 'translate(-34 0)');
    body += group(ornaments, `translate(${fmt(maxW + 34)} 0) scale(-1 1)`);
    applied.push({ label: 'Folk crown + side ornaments' });
  }
  if (o.texture && o.style === 'rat') {
    defs +=
      '<filter id="ink-grain" x="-3%" y="-3%" width="106%" height="106%"><feTurbulence type="fractalNoise" baseFrequency=".052" numOctaves="2" seed="8" result="noise"/><feColorMatrix in="noise" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1.2 -.15"/><feComposite in="SourceGraphic" operator="out"/></filter>';
    applied.push({ label: 'Ink grain' });
  }
  const margin = isB ? 65 : 85,
    w = fmt(maxW + margin * 2),
    h = height + margin * 2;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-margin} ${-margin} ${w} ${h}" role="img" aria-label="${styles.find((s) => s.id === o.style)?.name || 'Lettering'} preview" fill="${color}"><defs>${defs}</defs><g ${o.texture && o.style === 'rat' ? 'filter="url(#ink-grain)"' : ''}>${body}</g></svg>`;
  return {
    svg,
    width: w,
    height: h,
    hits,
    applied,
    inferred: [...new Set(inferred)],
    empty: !ast.glyphs.length,
  };
}
