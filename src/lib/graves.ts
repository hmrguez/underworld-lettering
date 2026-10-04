import data from './graves-paths.json' with { type: 'json' };
import type { NameAST } from './parser.ts';
import type { RenderOptions, RenderResult } from './engine.ts';

const fmt = (n: number) => Math.round(n * 100) / 100;
const path = (d: string) => `<path d="${d}" fill-rule="evenodd"/>`;
type Geometry = (typeof data.letters)['G'];
const letters = data.letters as Record<string, Geometry>;
const inferred = data.inferred as Record<string, Geometry>;

/** Selection depends on character and occurrence, never timing or input offsets. */
export function fracturePattern(char: string, occurrence: number): number {
  if ('GRAVES'.includes(char) && occurrence === 0) return -1;
  return (char.charCodeAt(0) * 17 + occurrence) % 3;
}

export function renderGraves(
  ast: NameAST,
  o: RenderOptions,
  namespace: string,
  color: string,
): RenderResult {
  const hits: RenderResult['hits'] = [],
    applied: RenderResult['applied'] = [];
  const inferredLetters: string[] = [],
    occurrences: Record<string, number> = {};
  const tracking = Number.isFinite(o.tracking) ? o.tracking : 0;
  const intensity = Number.isFinite(o.fractureIntensity)
    ? Math.max(0.4, Math.min(1, o.fractureIntensity))
    : 1;
  let defs = '',
    body = '',
    x = 0,
    maxX = 0,
    minY = 0,
    maxY = 353;
  for (const word of ast.words) {
    for (const [index, g] of word.glyphs.entries()) {
      const original = Object.hasOwn(letters, g.char),
        p = letters[g.char] ?? inferred[g.char];
      const occurrence = occurrences[g.char] ?? 0;
      occurrences[g.char] = occurrence + 1;
      const requestedPattern = fracturePattern(g.char, occurrence);
      // Small punctuation reuses a safe orientation rather than ignoring an
      // explicit fractured choice or cutting away its thin terminal.
      const pattern =
        requestedPattern >= 0 && !p.patterns[requestedPattern]?.length
          ? p.patterns.findIndex((cuts) => cuts.length > 0)
          : requestedPattern;
      const local =
        o.overrides[g.id]?.fracture ?? g.modifiers.fracture ?? 'auto';
      const fractured = local === 'auto' ? o.fractures : local === 'on';
      const id = `${namespace}-graves-${g.id}`;
      const native = `<g transform="translate(${-p.x} 0)">${p.ds.map(path).join('')}</g>`;
      const bridge = `<g transform="translate(${-p.x} 0)">${p.bridges.map(path).join('')}</g>`;
      // Shared source fragments need reconstructed R/A, V/E and E/S boundaries.
      // Clip before masking so neither contour leaks into the neighboring glyph.
      defs += `<clipPath id="${id}-ink"><rect x="0" y="${fmt(p.y - 2)}" width="${fmt(p.w)}" height="${fmt(p.h + 4)}"/></clipPath>`;
      let mask = '';
      if (fractured && pattern === -1) {
        // At full intensity original white source fragments preserve reference
        // cracks exactly. Lower intensity grows only into the reconstructed ink.
        defs += `<mask id="${id}-fracture" maskUnits="userSpaceOnUse" x="-2" y="${fmt(p.y - 4)}" width="${fmt(p.w + 4)}" height="${fmt(p.h + 8)}" style="mask-type:luminance"><g fill="white" stroke="white" stroke-width="${fmt((1 - intensity) * 9)}" stroke-linejoin="bevel">${native}</g></mask>`;
        mask = `mask="url(#${id}-fracture)"`;
      } else if (fractured && p.patterns[pattern]?.length) {
        const cracks = p.patterns[pattern]
          .map(
            (c) =>
              `<path d="${c.d}" fill="none" stroke="black" stroke-width="${fmt(c.width * intensity)}" stroke-linejoin="bevel"/>`,
          )
          .join('');
        defs += `<mask id="${id}-fracture" maskUnits="userSpaceOnUse" x="-2" y="${fmt(p.y - 4)}" width="${fmt(p.w + 4)}" height="${fmt(p.h + 8)}" style="mask-type:luminance"><rect x="-2" y="${fmt(p.y - 4)}" width="${fmt(p.w + 4)}" height="${fmt(p.h + 8)}" fill="white"/>${cracks}</mask>`;
        mask = `mask="url(#${id}-fracture)"`;
      }
      body += `<g transform="translate(${fmt(x)} 0)"><g clip-path="url(#${id}-ink)" ${mask} data-fracture="${mask ? (pattern === -1 ? 'reference' : pattern) : 'intact'}">${native}${bridge}</g><rect data-glyph="${g.id}" role="button" tabindex="0" aria-label="Select letter ${g.char}, position ${g.id + 1}" x="0" y="${fmt(p.y)}" width="${fmt(p.w)}" height="${fmt(p.h)}" fill="transparent"/></g>`;
      if (mask)
        applied.push({
          glyph: g.id,
          label: pattern === -1 ? 'Reference fracture' : 'Fitted fracture',
        });
      hits.push({ id: g.id, char: g.char, x, w: p.w, original });
      if (!original) inferredLetters.push(g.char);
      maxX = Math.max(maxX, x + p.w);
      minY = Math.min(minY, p.y);
      maxY = Math.max(maxY, p.y + p.h);
      const next = word.glyphs[index + 1];
      const pair = next ? g.char + next.char : '';
      const kerning: Record<string, number> = {
        GR: -8.931,
        RA: -4.949,
        AV: -82.888,
        VE: -16.867,
        ES: 0,
      };
      // Preserve visible preset overlap; arbitrary pairs retain ink clearance.
      x += p.w + Math.max((kerning[pair] ?? 9) + tracking, kerning[pair] ?? 4);
    }
    x += 65;
  }
  const margin = 22,
    width = fmt(Math.max(1, maxX) + margin * 2),
    height = fmt(maxY - minY + margin * 2);
  return {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-${margin} ${fmt(minY - margin)} ${width} ${height}" role="img" aria-label="Graves preview" fill="${color}"><defs>${defs}</defs>${body}</svg>`,
    width,
    height,
    hits,
    applied,
    inferred: [...new Set(inferredLetters)],
    empty: !ast.glyphs.length,
  };
}
