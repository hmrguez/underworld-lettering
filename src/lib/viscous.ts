import data from './viscous-paths.json' with { type: 'json' };
import type { NameAST } from './parser.ts';
import type { RenderOptions, RenderResult } from './engine.ts';

type Form = {
  x: number;
  y: number;
  w: number;
  h: number;
  ds: string[];
  bubbles: string[];
};
const letters: Record<string, Form[]> = data.letters;
const inferred: Record<string, Form[]> = data.inferred;
const fmt = (n: number) => Math.round(n * 1000) / 1000;
export function renderViscous(
  ast: NameAST,
  o: RenderOptions,
  namespace: string,
  color: string,
): RenderResult {
  const hits: RenderResult['hits'] = [],
    applied: RenderResult['applied'] = [],
    missing: string[] = [];
  const occurrences: Record<string, number> = {};
  const tracking = Number.isFinite(o.tracking) ? o.tracking : 0;
  let x = 0,
    maxX = 0,
    minY = 0,
    maxY = 1,
    defs = '',
    body = '';
  for (const word of ast.words) {
    for (const [index, g] of word.glyphs.entries()) {
      const forms = letters[g.char] ?? inferred[g.char];
      const occurrence = occurrences[g.char] ?? 0;
      occurrences[g.char] = occurrence + 1;
      const variant =
        o.overrides[g.id]?.variant ?? g.modifiers.variant ?? 'auto';
      const alt =
        variant === 'alt' ||
        (variant === 'auto' && g.char === 'S' && occurrence % 2 === 1);
      const p = forms[alt && forms.length > 1 ? 1 : 0];
      const local = o.overrides[g.id]?.bubble ?? g.modifiers.bubble ?? 'auto';
      // The source puts bubbles only inside O. Other letters receive an ink-fitted
      // inferred hole only when explicitly requested; no decorative confetti.
      const bubbles =
        local === 'on' || (local === 'auto' && o.bubbles && g.char === 'O');
      const id = `${namespace}-viscous-${g.id}`;
      let mask = '';
      if (bubbles && p.bubbles.length) {
        defs += `<mask id="${id}" maskUnits="userSpaceOnUse" x="${fmt(p.x - 2)}" y="${fmt(p.y - 2)}" width="${fmt(p.w + 4)}" height="${fmt(p.h + 4)}" style="mask-type:luminance"><rect x="${fmt(p.x - 2)}" y="${fmt(p.y - 2)}" width="${fmt(p.w + 4)}" height="${fmt(p.h + 4)}" fill="white"/>${p.bubbles.map((d) => `<path d="${d}" fill="black"/>`).join('')}</mask>`;
        mask = `mask="url(#${id})"`;
        applied.push({
          glyph: g.id,
          label:
            g.char === 'O' ? 'Reference bubbles' : 'Inferred fitted bubble',
        });
      }
      body += `<g transform="translate(${fmt(x - p.x)} 0)"><g ${mask} data-bubble="${mask ? 'on' : 'off'}" data-variant="${alt && forms.length > 1 ? 'alt' : 'base'}" pointer-events="none">${p.ds.map((d) => `<path d="${d}" fill-rule="evenodd"/>`).join('')}</g><rect data-glyph="${g.id}" role="button" tabindex="0" aria-label="Select letter ${g.char}, position ${g.id + 1}" x="${fmt(p.x)}" y="${fmt(p.y)}" width="${fmt(p.w)}" height="${fmt(p.h)}" fill="transparent"/></g>`;
      const original = Object.hasOwn(letters, g.char);
      hits.push({ id: g.id, char: g.char, x, w: p.w, original });
      if (!original) missing.push(g.char);
      maxX = Math.max(maxX, x + p.w);
      minY = Math.min(minY, p.y);
      maxY = Math.max(maxY, p.y + p.h);
      const next = word.glyphs[index + 1];
      // Native gaps preserve the source preset without locking arbitrary names
      // to source positions. Tight tracking always retains six units clearance.
      const gaps: Record<string, number> = {
        VI: 18.698,
        IS: 17.892,
        SC: 21.115,
        CO: 22.89,
        OU: 12.58,
        US: 24.82,
      };
      x +=
        p.w +
        Math.max(6, (next ? (gaps[g.char + next.char] ?? 18) : 18) + tracking);
    }
    x += 72;
  }
  const margin = 22,
    width = fmt(maxX + margin * 2),
    height = fmt(maxY - minY + margin * 2);
  return {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-${margin} ${fmt(minY - margin)} ${width} ${height}" role="img" aria-label="Viscous preview" fill="${color}"><defs>${defs}</defs>${body}</svg>`,
    width,
    height,
    hits,
    applied,
    inferred: [...new Set(missing)],
    empty: !ast.glyphs.length,
  };
}
