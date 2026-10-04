import data from './paradox-paths.json' with { type: 'json' };
import type { Glyph, NameAST } from './parser.ts';
import type { RenderOptions, RenderResult } from './engine.ts';
type Form = {
  x: number;
  y: number;
  w: number;
  h: number;
  ds: string[];
  counters: string[];
  profile: (number[] | null)[];
};
const letters: Record<string, Form[]> = data.letters;
const inferred: Record<string, Form[]> = data.inferred;
const gaps: Record<string, number> = data.gaps;
const fmt = (n: number) => Math.round(n * 1000) / 1000;
export function renderParadox(
  ast: NameAST,
  o: RenderOptions,
  namespace: string,
  color: string,
): RenderResult {
  const hits: RenderResult['hits'] = [],
    applied: RenderResult['applied'] = [],
    missing: string[] = [];
  const occurrences: Record<string, number> = {};
  const placed: { g: Glyph; p: Form; x: number; alt: boolean }[] = [];
  const tracking = Number.isFinite(o.tracking) ? o.tracking : 0;
  for (const g of ast.glyphs) {
    const forms = letters[g.char] ?? inferred[g.char];
    const occurrence = occurrences[g.char] ?? 0;
    occurrences[g.char] = occurrence + 1;
    const variant = o.overrides[g.id]?.variant ?? g.modifiers.variant ?? 'auto';
    const alt =
      forms.length > 1 &&
      (variant === 'alt' || (variant === 'auto' && occurrence % 2 === 1));
    const p = forms[alt ? 1 : 0];
    const previous = placed.at(-1);
    let x = 0;
    if (previous) {
      let advance = -Infinity;
      p.profile.forEach((left, band) => {
        const right = previous.p.profile[band];
        if (left && right) advance = Math.max(advance, right[1] - left[0]);
      });
      if (!Number.isFinite(advance)) advance = previous.p.w;
      const wordGap = previous.g.word !== g.word ? 80 : 0;
      const native = gaps[previous.g.char + g.char];
      // Native pair bearings preserve PARADOX. Shared ink bands protect tight
      // spacing while allowing the source's high P shoulder above the A foot.
      x =
        previous.x +
        Math.max(
          (wordGap ? previous.p.w + 20 : previous.p.w + (native ?? 20)) +
            tracking +
            wordGap,
          advance + 6 + wordGap,
          previous.p.w * 0.32,
        );
    }
    placed.push({ g, p, x: fmt(x), alt });
  }
  let maxX = 1,
    minY = 0,
    maxY = 1,
    defs = '',
    body = '';
  for (const [index, item] of placed.entries()) {
    const { g, p, x, alt } = item;
    const local = o.overrides[g.id]?.counter ?? g.modifiers.counter ?? 'auto';
    const automatic = 'AOQ0'.includes(g.char);
    const counter =
      p.counters.length > 0 &&
      (local === 'on' || (local === 'auto' && o.hourglasses && automatic));
    const id = `${namespace}-paradox-${g.id}`;
    let mask = '';
    if (counter) {
      defs += `<mask id="${id}" maskUnits="userSpaceOnUse" x="${fmt(p.x - 2)}" y="${fmt(p.y - 2)}" width="${fmt(p.w + 4)}" height="${fmt(p.h + 4)}" style="mask-type:luminance"><rect x="${fmt(p.x - 2)}" y="${fmt(p.y - 2)}" width="${fmt(p.w + 4)}" height="${fmt(p.h + 4)}" fill="white"/>${p.counters.map((d) => `<path d="${d}" fill="black"/>`).join('')}</mask>`;
      mask = `mask="url(#${id})"`;
      applied.push({
        glyph: g.id,
        label: 'AO'.includes(g.char)
          ? 'Reference hourglass counter'
          : 'Inferred hourglass counter',
      });
    }
    const center = x + p.w / 2;
    const previous = placed[index - 1],
      next = placed[index + 1];
    const left = previous ? (previous.x + previous.p.w / 2 + center) / 2 : x;
    const right = next ? (center + next.x + next.p.w / 2) / 2 : x + p.w;
    body += `<g data-glyph="${g.id}" role="button" tabindex="0" aria-label="Select letter ${g.char}, position ${g.id + 1}"><g transform="translate(${fmt(x - p.x)} 0)" pointer-events="none" ${mask} data-counter="${counter ? 'on' : 'off'}" data-variant="${alt ? 'alt' : 'base'}">${p.ds.map((d) => `<path d="${d}" fill-rule="evenodd"/>`).join('')}</g><rect data-hit="${g.id}" x="${fmt(left)}" y="${fmt(p.y)}" width="${fmt(right - left)}" height="${fmt(p.h)}" fill="transparent" pointer-events="all"/></g>`;
    const original = Object.hasOwn(letters, g.char);
    hits.push({ id: g.id, char: g.char, x, w: p.w, original });
    if (!original) missing.push(g.char);
    maxX = Math.max(maxX, x + p.w, right);
    minY = Math.min(minY, p.y);
    maxY = Math.max(maxY, p.y + p.h);
  }
  const margin = 22,
    width = fmt(maxX + margin * 2),
    height = fmt(maxY - minY + margin * 2);
  return {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-${margin} ${fmt(minY - margin)} ${width} ${height}" role="img" aria-label="Paradox preview" fill="${color}"><defs>${defs}</defs>${body}</svg>`,
    width,
    height,
    hits,
    applied,
    inferred: [...new Set(missing)],
    empty: !ast.glyphs.length,
  };
}
