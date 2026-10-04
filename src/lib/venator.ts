import outlines from './venator-paths.json' with { type: 'json' };
import type { Glyph, ModifierKey, NameAST, Overrides } from './parser.ts';
import type { RenderOptions, RenderResult } from './engine.ts';

type Outline = {
  d: string;
  x: number;
  y: number;
  w: number;
  h: number;
  profile: (number[] | null)[];
};
const fmt = (n: number) => Math.round(n * 100) / 100;
const local = (g: Glyph, overrides: Overrides, key: ModifierKey) =>
  overrides[g.id]?.[key] ?? g.modifiers[key] ?? 'auto';
const enabled = (value: string, automatic: boolean) =>
  value === 'auto' ? automatic : value === 'on';
const shape = (p: { d: string }, original = true) =>
  `<path d="${p.d}" fill-rule="${original ? 'evenodd' : 'nonzero'}"/>`;

export function renderVenator(
  ast: NameAST,
  o: RenderOptions,
  color: string,
): RenderResult {
  const hits: RenderResult['hits'] = [],
    applied: RenderResult['applied'] = [],
    inferred: string[] = [];
  const placed: {
    g: Glyph;
    p: Outline;
    x: number;
    original: boolean;
    initial: boolean;
  }[] = [];
  const tracking = Number.isFinite(Number(o.tracking)) ? Number(o.tracking) : 0;
  let previous: (typeof placed)[number] | undefined;
  for (const word of ast.words) {
    for (const [index, g] of word.glyphs.entries()) {
      const variant = local(g, o.overrides, 'variant');
      // Only the V has reference evidence for an initial. Other first letters
      // retain their own geometry. Alt can explicitly request this V anywhere.
      const initial =
        g.char === 'V' &&
        (variant === 'alt' ||
          (variant !== 'base' &&
            enabled(
              local(g, o.overrides, 'initial'),
              o.initial && index === 0,
            )));
      const reference = (outlines.letters as Record<string, Outline>)[g.char];
      const p =
        (g.char === 'V' && !initial ? outlines.inferred.V : reference) ??
        (variant === 'alt'
          ? (outlines.alternates as Record<string, Outline>)[g.char]
          : undefined) ??
        (outlines.inferred as Record<string, Outline>)[g.char];
      const original = !!reference && (g.char !== 'V' || initial);
      let x = 0;
      if (previous) {
        let advance = -Infinity;
        for (let band = 0; band < p.profile.length; band++) {
          const left = p.profile[band],
            right = previous.p.profile[band];
          if (left && right) advance = Math.max(advance, right[1] - left[0]);
        }
        if (!Number.isFinite(advance)) advance = previous.p.w;
        const wordGap = previous.g.word !== g.word ? 64 : 0;
        // Tight tracking never consumes the protected 8-unit ink clearance.
        // At default tracking there is 15 units of clear space in shared bands.
        x =
          previous.x +
          Math.max(
            advance + 15 + tracking + wordGap,
            advance + 8 + wordGap,
            previous.p.w * 0.32,
          );
      }
      const item = { g, p, x: fmt(x), original, initial };
      placed.push(item);
      previous = item;
    }
  }
  let minX = 0,
    maxX = 1,
    minY = 100,
    maxY = 350,
    letters = '',
    marks = '';
  for (const [index, item] of placed.entries()) {
    const { g, p, x, original, initial } = item;
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x + p.w);
    minY = Math.min(minY, p.y);
    maxY = Math.max(maxY, p.y + p.h);
    // Partition hit regions at the midpoint between ink centers: they remain
    // disjoint even when high shoulders tuck over an adjacent letter.
    const center = x + p.w / 2;
    const left = index
      ? (placed[index - 1].x + placed[index - 1].p.w / 2 + center) / 2
      : x;
    const next = placed[index + 1];
    const right = next ? (center + next.x + next.p.w / 2) / 2 : x + p.w;
    letters += `<g data-glyph="${g.id}" role="button" tabindex="0" aria-label="Select letter ${g.char}, position ${g.id + 1}"><g pointer-events="none" transform="translate(${x - p.x} 0)">${shape(p, original)}</g><rect data-hit="${g.id}" x="${fmt(left)}" y="0" width="${fmt(right - left)}" height="430" fill="transparent" pointer-events="all"/></g>`;
    hits.push({ id: g.id, char: g.char, x, w: p.w, original });
    if (!original) inferred.push(g.char);
    if (initial) applied.push({ glyph: g.id, label: 'Reference V initial' });
  }
  const center =
    (minX + maxX) / 2 +
    (placed[0]?.initial ? outlines.initialOrnamentOffset : 0);
  // Global ornaments are separate from glyphs. A local ornament override on
  // the first glyph has the same precedence as other composition settings.
  const anchor = ast.glyphs[0];
  const diamonds =
    anchor && enabled(local(anchor, o.overrides, 'ornament'), o.diamonds);
  const bodyBottom = Math.max(
    350,
    ...placed
      .filter((item) => !item.initial)
      .map((item) => item.p.y + item.p.h),
  );
  let baseline = bodyBottom + 25;
  // The source V descends beside the ornaments. Forced/interior V initials
  // can instead descend into them; move the separate ornament row down then.
  const markIntervals = [
    ...(o.inscription
      ? [
          [
            center - outlines.inscription.w / 2,
            center + outlines.inscription.w / 2,
          ],
        ]
      : []),
    ...(diamonds
      ? [
          [
            center - 152 - outlines.diamonds[0].w / 2,
            center - 152 + outlines.diamonds[0].w / 2,
          ],
          [
            center + 152 - outlines.diamonds[1].w / 2,
            center + 152 + outlines.diamonds[1].w / 2,
          ],
        ]
      : []),
  ];
  const collides = placed.some((item) =>
    item.p.profile.some(
      (ink, band) =>
        ink &&
        band * 9 + 9 >= baseline - 8 &&
        band * 9 <= baseline + 48 &&
        markIntervals.some(
          ([left, right]) =>
            item.x + ink[1] + 8 > left && item.x + ink[0] - 8 < right,
        ),
    ),
  );
  if (collides) baseline = maxY + 25;
  if (anchor && (diamonds || o.inscription)) {
    if (o.inscription) {
      const p = outlines.inscription;
      marks += `<g data-inscription="XLVIII" transform="translate(${fmt(center - p.w / 2 - p.x)} ${fmt(baseline - p.y)})">${shape(p)}</g>`;
      minX = Math.min(minX, center - p.w / 2);
      maxX = Math.max(maxX, center + p.w / 2);
      applied.push({ label: 'Reference inscription · XLVIII' });
    }
    if (diamonds) {
      for (const [index, p] of outlines.diamonds.entries()) {
        const dx = center + (index === 0 ? -152 - p.w / 2 : 152 - p.w / 2);
        marks += `<g data-diamond="${index}" transform="translate(${fmt(dx - p.x)} ${fmt(baseline + 7 - p.y)})">${shape(p)}</g>`;
        minX = Math.min(minX, dx);
        maxX = Math.max(maxX, dx + p.w);
      }
      applied.push({ glyph: anchor.id, label: 'Diamond pair' });
    }
    maxY = Math.max(maxY, baseline + 48);
  }
  const width = fmt(maxX - minX + 64),
    height = fmt(maxY - minY + 64);
  return {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${fmt(minX - 32)} ${fmt(minY - 32)} ${width} ${height}" role="img" aria-label="Venator preview" fill="${color}">${letters}${marks}</svg>`,
    width,
    height,
    hits,
    applied,
    inferred: [...new Set(inferred)],
    empty: !ast.glyphs.length,
  };
}
