import data from './paige-paths.json' with { type: 'json' };
import type { Glyph, NameAST } from './parser.ts';
import type { RenderOptions, RenderResult } from './engine.ts';
type Form = {
  ds: string[];
  rawX: number;
  scale: number;
  dy: number;
  w: number;
  y: number;
  h: number;
  profile: (number[] | null)[];
};
const letters: Record<string, Form> = data.letters;
const inferred: Record<string, Form> = data.inferred;
const initials: Record<string, Form> = data.initials;
const gaps: Record<string, number> = data.gaps;
const fmt = (n: number) => Math.round(n * 1000) / 1000;
const isLetter = (g: Glyph) => /^[A-Z]$/.test(g.char);
export function renderPaige(
  ast: NameAST,
  o: RenderOptions,
  color: string,
): RenderResult {
  const hits: RenderResult['hits'] = [],
    applied: RenderResult['applied'] = [],
    missing: string[] = [];
  const placed: {
    g: Glyph;
    p: Form;
    x: number;
    initial: boolean;
    frame: boolean;
    original: boolean;
  }[] = [];
  const first = ast.glyphs.find(isLetter)?.id;
  const tracking = Number.isFinite(o.tracking) ? o.tracking : 0;
  for (const g of ast.glyphs) {
    const local = o.overrides[g.id]?.initial ?? g.modifiers.initial ?? 'auto';
    const initial =
      isLetter(g) &&
      (local === 'on' || (local === 'auto' && o.initial && g.id === first));
    const frameSetting =
      o.overrides[g.id]?.frame ?? g.modifiers.frame ?? 'auto';
    const frame =
      isLetter(g) &&
      (frameSetting === 'on' ||
        (frameSetting === 'auto' && o.frame && g.id === first));
    const p = initial
      ? initials[g.char]
      : (letters[g.char] ?? inferred[g.char]);
    const original =
      Object.hasOwn(letters, g.char) || (initial && g.char === 'P');
    const previous = placed.at(-1);
    let x = 0;
    if (previous) {
      let advance = -Infinity;
      p.profile.forEach((left, band) => {
        const right = previous.p.profile[band];
        if (left && right) advance = Math.max(advance, right[1] - left[0]);
      });
      if (!Number.isFinite(advance)) advance = previous.p.w;
      const sameWord = previous.g.word === g.word;
      const native =
        sameWord &&
        !initial &&
        previous.original &&
        original &&
        (!previous.initial || previous.g.char === 'P')
          ? gaps[previous.g.char + g.char]
          : undefined;
      // Source pairs intentionally meet at their folded feet. Never tighten
      // those contacts further; arbitrary pairs retain six units of clearance.
      const normal = previous.p.w + (native ?? 14);
      const minimum =
        native === undefined ? advance + 6 : Math.min(normal, advance + 6);
      x =
        previous.x +
        Math.max(normal + tracking, minimum, previous.p.w * 0.3) +
        (sameWord ? 0 : 100);
      // An explicitly framed interior letter reserves both outer side bearings.
      if (frame)
        x = Math.max(
          x,
          previous.x +
            previous.p.w +
            79.0608 +
            12 +
            (previous.frame ? 47.1042 : 0),
        );
    }
    placed.push({ g, p, x: fmt(x), initial, frame, original });
  }
  let minX = 0,
    maxX = 1,
    minY = 0,
    maxY = 1,
    body = '',
    frames = '';
  const extend = (x: number, y: number, w: number, h: number) => {
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x + w);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y + h);
  };
  for (const item of placed) {
    const { g, p, x, frame } = item;
    if (!frame) continue;
    const left = x - 79.0608,
      right = x + p.w + 47.105;
    let top = p.y - 67.5566,
      bottom = p.y + p.h + 73.827;
    let upper = top + ((bottom - top) * 196.045) / 763;
    let lower = top + ((bottom - top) * 592.511) / 763;
    // Clear every glyph whose ink bounds enter the right arm, including dots,
    // descenders and forced initials. Both neighboring directions are covered.
    for (const neighbor of placed) {
      if (
        neighbor === item ||
        neighbor.x > right + 12 ||
        neighbor.x + neighbor.p.w < right - 29
      )
        continue;
      upper = Math.min(upper, neighbor.p.y - 36.322);
      lower = Math.max(lower, neighbor.p.y + neighbor.p.h + 43.184);
    }
    top = Math.min(top, upper - 65);
    bottom = Math.max(bottom, lower + 65);
    // Preserve the top/bottom ink thickness when the opening grows. Only the
    // arm lengths and left-side middle stretch; a short arm needs 65 units.
    const mapY = (y: number) =>
      y <= 35
        ? top + y
        : y <= 196.045
          ? top + 35 + ((y - 35) / (196.045 - 35)) * (upper - top - 35)
          : y < 592.511
            ? upper + ((y - 196.045) / (592.511 - 196.045)) * (lower - upper)
            : y < 728
              ? lower +
                ((y - 592.511) / (728 - 592.511)) * (bottom - lower - 35)
              : bottom - (763 - y);
    const mapX = (v: number) =>
      v <= 35
        ? left + v
        : v >= 488
          ? right + (v - 517.091)
          : left +
            35 +
            ((v - 35) / (488 - 35)) * (right - left - (517.091 - 488) - 35);
    const vertices = data.frame.map(([vx, vy]) => [
      fmt(mapX(vx)),
      fmt(mapY(vy)),
    ]);
    frames += `<path data-frame="${g.id}" data-opening="${fmt(upper)} ${fmt(lower)}" d="M${vertices.map((v) => v.join(' ')).join('L')}Z" pointer-events="none"/>`;
    extend(left, top, right - left, bottom - top);
    applied.push({ glyph: g.id, label: 'Independent open initial frame' });
  }
  for (const [index, item] of placed.entries()) {
    const { g, p, x, initial, original } = item;
    const center = x + p.w / 2,
      previous = placed[index - 1],
      next = placed[index + 1];
    const left = previous ? (previous.x + previous.p.w / 2 + center) / 2 : x;
    const right = next ? (center + next.x + next.p.w / 2) / 2 : x + p.w;
    body += `<g data-glyph="${g.id}" role="button" tabindex="0" aria-label="Select letter ${g.char}, position ${g.id + 1}"><g transform="translate(${fmt(x - p.rawX * p.scale)} ${fmt(p.dy)}) scale(${p.scale})" pointer-events="none" data-initial="${initial ? 'on' : 'off'}">${p.ds.map((d) => `<path d="${d}" fill-rule="evenodd"/>`).join('')}</g><rect data-hit="${g.id}" x="${fmt(left)}" y="${fmt(p.y)}" width="${fmt(right - left)}" height="${fmt(p.h)}" fill="transparent" pointer-events="all"/></g>`;
    extend(
      Math.min(x, left),
      p.y,
      Math.max(x + p.w, right) - Math.min(x, left),
      p.h,
    );
    hits.push({ id: g.id, char: g.char, x, w: p.w, original });
    if (!original) missing.push(g.char);
    if (initial)
      applied.push({
        glyph: g.id,
        label:
          g.char === 'P'
            ? 'Reference oversized P'
            : 'Inferred enlarged initial treatment',
      });
  }
  const margin = 22,
    width = fmt(maxX - minX + margin * 2),
    height = fmt(maxY - minY + margin * 2);
  return {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${fmt(minX - margin)} ${fmt(minY - margin)} ${width} ${height}" role="img" aria-label="Paige preview" fill="${color}">${frames}${body}</svg>`,
    width,
    height,
    hits,
    applied,
    inferred: [...new Set(missing)],
    empty: !ast.glyphs.length,
  };
}
