import data from './violet-paths.json' with { type: 'json' };
import type { Glyph, ModifierKey, NameAST } from './parser.ts';
import type { RenderOptions, RenderResult } from './engine.ts';
type Outline = { d: string; x: number; y: number; w: number; h: number };
type Point = [number, number];
export interface VioletForm {
  glyph: Glyph;
  form: string;
  original: boolean;
  outline: Outline;
  anchor: number;
  advance: number;
  entry?: Point;
  exit?: Point;
  extended: boolean;
  wear: boolean;
  detached: boolean;
}
const f = (n: number) => Math.round(n * 100) / 100;
const letters = data.letters as Record<string, Outline>;
const lower = data.lower as Record<string, Outline>;
const capitals = data.capitals as Record<string, Outline>;
const anchors: Record<string, number> = {
  V: 20,
  i: 103,
  o: 218,
  l: 326,
  e: 399,
  t: 490,
};
const advances: Record<string, number> = {
  V: 83,
  i: 115,
  o: 108,
  l: 73,
  e: 91,
  t: 148,
};
const ports: Record<string, { entry?: Point; exit?: Point }> = {
  V: {},
  i: { entry: [62, 410], exit: [115, 385] },
  o: { entry: [2, 385], exit: [112, 315] },
  l: { entry: [40, 300], exit: [73, 380] },
  e: { entry: [0, 380], exit: [108, 345] },
  t: { entry: [25, 345], exit: [144, 371] },
};
// Ports measured from the inferred stroke skeletons, after the forward shear.
// Ascender overhang is independent of advance; it must not widen every pair.
const lowerMetrics: Record<
  string,
  { advance: number; entry: Point; exit: Point }
> = {};
const metric = (chars: string, advance: number, entry: Point, exit: Point) => {
  for (const char of chars) lowerMetrics[char] = { advance, entry, exit };
};
const shear = (x: number, y: number): Point => [x + 0.52 * (430 - y), y];
metric('a', 125, shear(5, 382), shear(129, 365));
metric('b', 108, shear(-1, 382), shear(108, 365));
metric('c', 92, shear(0, 370), shear(88, 368));
metric('d', 132, shear(5, 382), shear(132, 365));
metric('f', 100, shear(30, 330), shear(25, 323));
metric('g', 108, shear(5, 382), shear(101, 377));
metric('h', 113, shear(-1, 382), shear(107, 405));
metric('i', 65, shear(0, 382), shear(41, 411));
metric('j', 65, shear(15, 355), shear(48, 365));
metric('k', 100, shear(-1, 382), shear(85, 402));
metric('l', 73, shear(19, 323), shear(72, 378));
metric('m', 175, shear(-1, 382), shear(168, 405));
metric('n', 110, shear(-1, 382), shear(99, 405));
metric('o', 108, shear(5, 382), shear(108, 365));
metric('p', 120, shear(2, 382), shear(133, 365));
metric('q', 108, shear(5, 382), shear(103, 365));
metric('r', 105, shear(-1, 382), shear(88, 365));
metric('s', 90, shear(0, 370), shear(78, 374));
metric('u', 140, shear(0, 382), shear(140, 365));
metric('v', 120, shear(4, 370), shear(115, 365));
metric('w', 175, shear(4, 370), shear(170, 365));
metric('x', 115, shear(13, 390), shear(111, 365));
metric('y', 108, shear(0, 382), shear(93, 380));
metric('z', 110, shear(10, 289), shear(90, 398));
// Inferred capital exit ports follow their actual final downstroke or bowl.
const capitalMetrics: Record<string, { advance: number; exit: Point }> = {};
const capMetric = (chars: string, advance: number, point: Point) => {
  for (const char of chars)
    capitalMetrics[char] = { advance, exit: shear(...point) };
};
capMetric('A', 124, [113, 419]);
capMetric('B', 95, [36, 411]);
capMetric('C', 176, [148, 343]);
capMetric('D', 95, [36, 411]);
capMetric('E', 142, [125, 398]);
capMetric('F', 85, [36, 411]);
capMetric('G', 155, [130, 298]);
capMetric('H', 148, [139, 411]);
capMetric('I', 94, [87, 407]);
capMetric('J', 100, [30, 424]);
capMetric('K', 125, [113, 424]);
capMetric('L', 150, [141, 401]);
capMetric('M', 188, [179, 425]);
capMetric('N', 140, [120, 422]);
capMetric('O', 140, [120, 389]);
capMetric('P', 95, [36, 411]);
capMetric('Q', 166, [155, 467]);
capMetric('R', 155, [143, 425]);
capMetric('S', 120, [80, 421]);
capMetric('T', 125, [107, 411]);
capMetric('U', 145, [100, 374]);
capMetric('W', 154, [117, 429]);
capMetric('X', 155, [143, 425]);
capMetric('Y', 95, [38, 426]);
capMetric('Z', 160, [149, 402]);
/** Shape without mutating normalized characters, IDs, offsets or modifiers. */
export function shapeViolet(ast: NameAST, o: RenderOptions): VioletForm[] {
  const local = (g: Glyph, key: ModifierKey) =>
    o.overrides[g.id]?.[key] ?? g.modifiers[key] ?? 'auto';
  return ast.glyphs.map((glyph) => {
    const alpha = /^[A-Z]$/.test(glyph.char);
    const first =
      ast.words[glyph.word].glyphs.find((g) => /^[A-Z]$/.test(g.char))?.id ===
      glyph.id;
    const initial = local(glyph, 'initial');
    const capital = alpha && (initial === 'auto' ? first : initial === 'on');
    const form = alpha && !capital ? glyph.char.toLowerCase() : glyph.char;
    const swash = local(glyph, 'swash');
    const extended = swash === 'auto' ? o.swash : swash === 'word';
    const wear = local(glyph, 'ornament');
    const original = !!letters[form] && !(form === 'V' && !extended);
    const outline = original
      ? letters[form]
      : capital || !alpha
        ? capitals[form]
        : lower[form];
    const metric = lowerMetrics[form];
    const cap = capitalMetrics[form];
    const anchor = original ? anchors[form] : metric ? 0 : outline.x;
    const advance = original
      ? advances[form]
      : (metric?.advance ??
        (cap ? cap.advance - anchor : Math.max(36, outline.w - 55)));
    const native = original ? ports[form] : metric;
    const exit: Point = [advance, 405];
    return {
      glyph,
      form,
      original,
      outline,
      anchor,
      advance,
      entry: alpha && !capital ? native?.entry : undefined,
      exit: alpha
        ? original
          ? native?.exit
          : capital
            ? cap
              ? [cap.exit[0] - anchor, cap.exit[1]]
              : undefined
            : (native?.exit ?? exit)
        : undefined,
      extended,
      wear: wear === 'auto' ? o.texture : wear === 'on',
      detached: local(glyph, 'variant') === 'base',
    };
  });
}
export function renderViolet(
  ast: NameAST,
  o: RenderOptions,
  namespace: string,
  color: string,
): RenderResult {
  const forms = shapeViolet(ast, o);
  const tracking = Number.isFinite(Number(o.tracking))
    ? Math.max(-1000, Math.min(1000, Number(o.tracking)))
    : 0;
  const reach = Number.isFinite(Number(o.swashLength))
    ? Math.max(0.4, Math.min(2, Number(o.swashLength)))
    : 1;
  const placed = forms.map((item) => ({ ...item, x: 0 }));
  const hits: RenderResult['hits'] = [],
    applied: RenderResult['applied'] = [],
    inferred: string[] = [];
  const incoming = new Set<number>();
  // Invalid punctuation remains a parser diagnostic, but never silently
  // connects the valid glyphs on either side of its source offset.
  const separates = (a: Glyph, b: Glyph) =>
    a.word !== b.word ||
    ast.tokens.some(
      (t) => t.type === 'invalid' && t.start >= a.end && t.end <= b.start,
    );
  let cursor = 0,
    body = '',
    joins = '',
    defs = '',
    minX = 0,
    maxX = 1,
    minY = 0,
    maxY = 1;
  const include = (x: number, y: number, w: number, h: number) => {
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x + w);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y + h);
  };
  for (let i = 0; i < placed.length; i++) {
    const item = placed[i],
      previous = placed[i - 1];
    if (previous) {
      const boundary = previous.glyph.word !== item.glyph.word;
      const punctuation =
        !/^[a-zA-Z]$/.test(previous.form) ||
        !/^[a-zA-Z]$/.test(item.form) ||
        separates(previous.glyph, item.glyph);
      cursor += boundary
        ? 100
        : punctuation
          ? 35
          : previous.detached || item.detached
            ? 55
            : 0;
    }
    item.x = cursor;
    cursor += item.advance + Math.max(-8, tracking * 0.55);
  }
  for (let i = 0; i < placed.length; i++) {
    const item = placed[i],
      { glyph: g, outline: p, x, anchor, form } = item,
      next = placed[i + 1];
    const terminal =
      !next ||
      separates(g, next.glyph) ||
      !next.entry ||
      tracking >= 50 ||
      item.detached ||
      next.detached;
    let connected = false;
    let ink = `<path d="${p.d}" transform="translate(${f(x - anchor)} 0)"/>`;
    let inkLeft = x + p.x - anchor,
      inkRight = inkLeft + p.w;
    include(inkLeft, p.y, p.w, p.h);
    if (form === 't') {
      const b = data.crossbar;
      // Keep the left shoulder fixed while extending the crossbar's right arm.
      const scale = item.extended ? reach : 0.42;
      ink += `<path data-crossbar="${g.id}" d="${b.d}" transform="translate(${f(x - anchor + 500 * (1 - scale))} 0) scale(${f(scale)} 1)"/>`;
      inkLeft = Math.min(inkLeft, x - anchor + 500 + (b.x - 500) * scale);
      inkRight = Math.max(
        inkRight,
        x - anchor + 500 + (b.x + b.w - 500) * scale,
      );
      include(x - anchor + 500 + (b.x - 500) * scale, b.y, b.w * scale, b.h);
      if (item.extended)
        applied.push({ glyph: g.id, label: 'Extended t crossbar' });
    }
    if (item.wear && (terminal || form === 'V')) {
      const id = `${namespace}-wear-${g.id}`;
      // Selective terminal scratches: transparent wedges, with no stochastic
      // filter or painted canvas color. Source dry-brush contours remain native.
      const tx = x + p.x - anchor + p.w * (form === 'V' ? 0.96 : 0.83),
        ty = form === 'V' ? p.y + 22 : form === 't' ? 348 : p.y + p.h - 25;
      defs += `<mask id="${id}" maskUnits="userSpaceOnUse" x="${f(inkLeft - 20)}" y="${f(p.y - 20)}" width="${f(inkRight - inkLeft + 40)}" height="${f(p.h + 40)}"><rect x="${f(inkLeft - 20)}" y="${f(p.y - 20)}" width="${f(inkRight - inkLeft + 40)}" height="${f(p.h + 40)}" fill="white"/><path fill="black" d="M${f(tx)} ${f(ty)}l24 -13 -19 16Z M${f(tx + 8)} ${f(ty + 9)}l18 -9 -14 12Z"/></mask>`;
      ink = `<g mask="url(#${id})">${ink}</g>`;
      applied.push({ glyph: g.id, label: 'Selective brush wear' });
    }
    body += `<g pointer-events="none" data-form="${form}" data-source-start="${g.start}" data-source-end="${g.end}">${ink}</g>`;
    if (!item.original) inferred.push(form);
    if (
      item.exit &&
      next?.entry &&
      !separates(g, next.glyph) &&
      !item.detached &&
      !next.detached &&
      tracking < 50
    ) {
      const a: Point = [x + item.exit[0], item.exit[1]],
        b: Point = [next.x + next.entry[0], next.entry[1]];
      const dx = b[0] - a[0];
      // Only reachable ports connect. Downhill/ascending shoulders use
      // different tangent depths; broad gaps disengage instead of long wires.
      if (dx >= -32 && dx <= 90 && Math.abs(b[1] - a[1]) < 100) {
        connected = true;
        incoming.add(next.glyph.id);
        const strength = Math.max(0, (50 - Math.max(0, tracking)) / 50),
          thick = 3 + 3 * strength;
        const c1: Point = [
            a[0] + Math.max(8, dx * 0.45),
            a[1] - (b[1] < a[1] ? 5 : 16),
          ],
          c2: Point = [b[0] - Math.max(8, dx * 0.35), b[1] + 8];
        joins += `<path data-join="${g.id}-${next.glyph.id}" d="M${f(a[0])} ${f(a[1] - thick)}C${f(c1[0])} ${f(c1[1] - thick)} ${f(c2[0])} ${f(c2[1] - thick)} ${f(b[0])} ${f(b[1] - thick)}L${f(b[0])} ${f(b[1] + thick)}C${f(c2[0])} ${f(c2[1] + thick)} ${f(c1[0])} ${f(c1[1] + thick)} ${f(a[0])} ${f(a[1] + thick)}Z"/>`;
        for (const [px, py] of [a, b, c1, c2]) include(px - 8, py - 8, 16, 16);
        applied.push({
          glyph: g.id,
          label: `Script join ${form} → ${next.form}`,
        });
      }
    }
    if (
      !connected &&
      item.exit &&
      !item.detached &&
      item.extended &&
      /^[a-z]$/.test(form) &&
      form !== 't'
    ) {
      const [px, py] = item.exit,
        end = x + px + 24 * reach;
      joins += `<path data-exit="${g.id}" d="M${f(x + px - 4)} ${py + 5}Q${f(x + px + 14)} ${py - 4} ${f(end)} ${py - 24}L${f(end - 3)} ${py - 15}Q${f(x + px + 12)} ${py + 5} ${f(x + px - 4)} ${py + 10}Z"/>`;
      include(x + px - 4, py - 24, end - (x + px) + 8, 34);
    }
    if (item.entry && !incoming.has(g.id)) {
      const [px, py] = item.entry;
      joins += `<path data-entry="${g.id}" d="M${f(x + px - 18)} ${py + 14}Q${f(x + px - 3)} ${py + 4} ${f(x + px + 3)} ${py - 4}L${f(x + px + 7)} ${py + 2}Q${f(x + px - 5)} ${py + 15} ${f(x + px - 18)} ${py + 18}Z"/>`;
      include(x + px - 18, py - 4, 25, 22);
    }
    hits.push({
      id: g.id,
      char: g.char,
      x,
      w: item.advance,
      original: item.original,
    });
  }
  const width = f(maxX - minX + 64),
    height = f(maxY - minY + 64);
  // Disjoint transparent selection regions stay selectable across connected ink.
  const targets = placed
    .map((item, i) => {
      const left = i === 0 ? minX - 20 : (placed[i - 1].x + item.x) / 2;
      const right =
        i === placed.length - 1 ? maxX + 20 : (item.x + placed[i + 1].x) / 2;
      return `<rect data-glyph="${item.glyph.id}" role="button" tabindex="0" aria-label="Select letter ${item.glyph.char}, position ${item.glyph.id + 1}" x="${f(left)}" y="${f(minY - 20)}" width="${f(right - left)}" height="${f(maxY - minY + 40)}" fill="transparent"/>`;
    })
    .join('');
  return {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${f(minX - 32)} ${f(minY - 32)} ${width} ${height}" role="img" aria-label="Violet preview" fill="${color}"><defs>${defs}</defs><g pointer-events="none">${joins}${body}</g>${targets}</svg>`,
    width,
    height,
    hits,
    applied,
    inferred: [...new Set(inferred)],
    empty: !forms.length,
  };
}
