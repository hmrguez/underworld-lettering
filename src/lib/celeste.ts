import data from './celeste-paths.json' with { type: 'json' };
import type { Glyph, ModifierKey, NameAST } from './parser.ts';
import type { RenderOptions, RenderResult } from './engine.ts';
type Outline = { d: string; x: number; y: number; w: number; h: number };
const fmt = (n: number) => Math.round(n * 100) / 100;
const enabled = (value: string, auto: boolean) =>
  value === 'auto' ? auto : value === 'on';
const path = (p: Outline) => `<path d="${p.d}"/>`;
export function renderCeleste(
  ast: NameAST,
  o: RenderOptions,
  namespace: string,
  color: string,
): RenderResult {
  const hits: RenderResult['hits'] = [],
    applied: RenderResult['applied'] = [],
    inferred: string[] = [];
  const local = (g: Glyph, key: ModifierKey) =>
    o.overrides[g.id]?.[key] ?? g.modifiers[key] ?? 'auto';
  const tracking = Number.isFinite(Number(o.tracking)) ? Number(o.tracking) : 0;
  const reach = Number.isFinite(Number(o.swashLength))
    ? Math.max(0.4, Math.min(2, Number(o.swashLength)))
    : 1;
  const placed: {
    g: Glyph;
    p: Outline;
    x: number;
    y: number;
    scale: number;
    initial: boolean;
    original: boolean;
    detail?: Outline;
    decoration: boolean;
  }[] = [];
  let cursor = 0,
    eIndex = 0;
  for (const g of ast.glyphs) {
    const initial =
      /^[A-Z]$/.test(g.char) &&
      enabled(local(g, 'initial'), o.initial && g.id === 0);
    const decoration = enabled(local(g, 'ornament'), o.ornaments);
    let p = (data.letters as Record<string, Outline>)[g.char];
    let detail: Outline | undefined = (data.details as Record<string, Outline>)[
      g.char
    ];
    if (g.char === 'E') {
      const i = Math.min(eIndex++, 2);
      p = data.ees[i];
      detail = data.eDetails[i];
    }
    const original = !!p && (g.char !== 'C' || initial);
    if (!p || (g.char === 'C' && !initial)) {
      p = (data.inferred as Record<string, Outline>)[g.char];
      detail = undefined;
    }
    const sourceC = g.char === 'C' && initial;
    const scale = initial && !sourceC ? 1.6 : 1;
    // Preserve source contours and their ascending baseline; reconstruct only
    // placement. The C retains its native height independently of body letters.
    const sourceBaseline = 462 - 0.15 * (p.x - 370);
    const baseline = 517.5 - Math.min(200, 0.15 * cursor);
    const y = sourceC
      ? 0
      : initial
        ? 570 - p.y * scale - p.h * scale
        : original
          ? baseline - sourceBaseline
          : baseline;
    placed.push({
      g,
      p,
      x: cursor,
      y,
      scale,
      initial,
      original,
      detail,
      decoration,
    });
    if (!original) inferred.push(g.char);
    if (initial) {
      applied.push({
        glyph: g.id,
        label: sourceC ? 'Reference C initial' : 'Inferred decorated initial',
      });
      if (!sourceC && !inferred.includes(g.char)) inferred.push(g.char);
    }
    const next = ast.glyphs[g.id + 1];
    cursor +=
      p.w * scale +
      Math.max(6, 7 + tracking) +
      (next && next.word !== g.word ? 72 : 0);
  }
  let minX = 0,
    maxX = 1,
    minY = 0,
    maxY = 1,
    body = '',
    marks = '',
    defs = '';
  const include = (x: number, y: number, w: number, h: number) => {
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x + w);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y + h);
  };
  const star = (x: number, y: number, w: number, h = w, glyph?: number) => {
    // Source four-point star, normalized without baking a background into ink.
    const p = data.stars[0];
    marks += `<g data-star="${glyph ?? 'word'}" transform="translate(${fmt(x)} ${fmt(y)}) scale(${fmt(w / p.w)} ${fmt(h / p.h)}) translate(${-p.x} ${-p.y})">${path(p)}</g>`;
    include(x, y, w, h);
  };
  for (const item of placed) {
    const { g, p, x, y, scale, initial, original, detail, decoration } = item;
    const top = p.y * scale + y,
      bottom = top + p.h * scale,
      w = p.w * scale;
    include(x, top, w, p.h * scale);
    const transform = `translate(${fmt(x - p.x * scale)} ${fmt(y)}) scale(${scale})`;
    let ink = path(p),
      extras = '';
    if (decoration) {
      if (g.char === 'C' && initial) {
        const id = `${namespace}-dots-${g.id}`;
        defs += `<mask id="${id}" maskUnits="userSpaceOnUse" x="${p.x - 2}" y="${p.y - 2}" width="${p.w + 4}" height="${p.h + 4}"><rect x="${p.x - 2}" y="${p.y - 2}" width="${p.w + 4}" height="${p.h + 4}" fill="white"/><g fill="black">${data.dots.map(path).join('')}</g></mask>`;
        ink = `<g mask="url(#${id})">${ink}</g>`;
      }
      if (detail) {
        ink = `<path d="${p.d} ${detail.d}"/>`;
        if (g.char === 'C' && initial)
          ink = `<g mask="url(#${namespace}-dots-${g.id})">${ink}</g>`;
        include(
          x + (detail.x - p.x) * scale,
          detail.y * scale + y,
          detail.w * scale,
          detail.h * scale,
        );
      } else if (/^[A-Z0-9]$/.test(g.char)) {
        // An independent fine spindle beside the left stem: inferred geometry,
        // fitted to this letter rather than copied from a finished wordmark.
        const dx = x + Math.min(18, w * 0.18),
          dy = top + p.h * scale * 0.45;
        extras = '';
        marks += `<path data-interior="${g.id}" d="M${fmt(dx)} ${fmt(dy - 45)}C${fmt(dx + 1)} ${fmt(dy - 8)} ${fmt(dx + 2)} ${fmt(dy - 6)} ${fmt(dx + 12)} ${fmt(dy)}C${fmt(dx + 2)} ${fmt(dy + 6)} ${fmt(dx + 1)} ${fmt(dy + 8)} ${fmt(dx)} ${fmt(dy + 45)}C${fmt(dx - 1)} ${fmt(dy + 8)} ${fmt(dx - 2)} ${fmt(dy + 6)} ${fmt(dx - 12)} ${fmt(dy)}C${fmt(dx - 2)} ${fmt(dy - 6)} ${fmt(dx - 1)} ${fmt(dy - 8)} ${fmt(dx)} ${fmt(dy - 45)}Z"/>`;
        include(dx - 12, dy - 45, 24, 90);
      }
      applied.push({ glyph: g.id, label: 'Interior ornament' });
      if (initial) {
        star(x + w * 0.7, top - 32, 40, 40, g.id);
        star(x + 12, bottom - 85, 40, 40, g.id);
      }
    }
    body += `<g data-glyph="${g.id}" role="button" tabindex="0" aria-label="Select letter ${g.char}, position ${g.id + 1}"><g pointer-events="none" transform="${transform}" fill-rule="nonzero">${ink}<g data-detail="${g.id}">${extras}</g></g><rect data-hit="${g.id}" x="${fmt(x)}" y="${fmt(top)}" width="${fmt(w)}" height="${fmt(p.h * scale)}" fill="transparent" pointer-events="all"/></g>`;
    hits.push({ id: g.id, char: g.char, x: fmt(x), w: fmt(w), original });
  }
  for (const word of ast.words) {
    const items = placed.filter((i) => i.g.word === word.index),
      first = items[0],
      last = items.at(-1);
    if (!first || !last) continue;
    const end = last.x + last.p.w * last.scale,
      wordBottom = Math.max(
        ...items.map((i) => i.p.y * i.scale + i.y + i.p.h * i.scale),
      );
    const value = local(first.g, 'swash');
    if (value === 'word' || (value === 'auto' && o.swash)) {
      const start = first.x + first.p.w * first.scale * 0.3;
      const span = Math.max(180, (end - start + 80) * reach);
      const lastBottom = last.p.y * last.scale + last.y + last.p.h * last.scale;
      const shift = wordBottom - 570;
      // Remap the ribbon body along its source control-point template. The
      // terminal's last 108 units retain their width; vertical thickness is
      // retained even as body reach changes. Both paths remain separate.
      const root = start + span - 108;
      const lift = Math.max(-85, lastBottom - wordBottom + 222);
      const point = (x: number, y: number) => {
        const t = (x - 108) / 982;
        const px = x <= 1090 ? start + t * (root - start) : root + x - 1090;
        const py = y + shift + Math.max(0, Math.min(1, t)) * lift;
        include(px, py, 0, 0);
        return `${fmt(px)} ${fmt(py)}`;
      };
      if (span < 500) {
        // Short names need a shallower sweep: preserve ribbon thickness rather
        // than compressing a tall reference curve into a tight looping hook.
        const ex = start + span,
          sy = wordBottom + 14;
        for (let i = 0; i < 2; i++) {
          const dy = i * 14,
            tip = i ? 32 : 0;
          const d = `M${fmt(start)} ${fmt(sy + dy)}C${fmt(start + span * 0.2)} ${fmt(sy + 35 + dy)} ${fmt(start + span * 0.5)} ${fmt(sy - 25 + dy)} ${fmt(ex)} ${fmt(sy + 12 + dy + tip)}L${fmt(ex - Math.min(80, span * 0.22))} ${fmt(sy + 26 + dy)}C${fmt(start + span * 0.5)} ${fmt(sy - 5 + dy)} ${fmt(start + span * 0.2)} ${fmt(sy + 42 + dy)} ${fmt(start)} ${fmt(sy + dy + 3)}Z`;
          marks += `<path data-underline="${word.index}-${i}" d="${d}"/>`;
          include(start, sy - 25, span, 100);
        }
      } else
        for (const [i, p] of data.underlines.entries()) {
          const tokens = p.d.match(/[MLCHVZ]|-?\d*\.?\d+(?:e[-+]?\d+)?/gi)!;
          let d = '',
            x = 0,
            y = 0;
          for (let j = 0; j < tokens.length;) {
            const command = tokens[j++];
            if (command === 'Z') {
              d += 'Z';
              continue;
            }
            if (command === 'V') {
              y = Number(tokens[j++]);
              d += 'L' + point(x, y);
              continue;
            }
            if (command === 'H') {
              x = Number(tokens[j++]);
              d += 'L' + point(x, y);
              continue;
            }
            const count = command === 'C' ? 3 : 1;
            d += command;
            for (let k = 0; k < count; k++) {
              x = Number(tokens[j++]);
              y = Number(tokens[j++]);
              d += point(x, y) + ' ';
            }
          }
          marks += `<path data-underline="${word.index}-${i}" d="${d}"/>`;
        }
      applied.push({ glyph: first.g.id, label: 'Adaptive double underline' });
    }
    if (last.decoration) {
      const bottom = last.p.y * last.scale + last.y + last.p.h * last.scale;
      star(
        end - last.p.w * 0.65,
        last.p.y * last.scale + last.y - 46,
        40,
        40,
        last.g.id,
      );
      star(end - 45, bottom + 12, 40, 40, last.g.id);
      star(end + 8, bottom - 35, 60, 90, last.g.id);
      star(
        first.x + (end - first.x) * 0.67,
        wordBottom - 55,
        40,
        40,
        last.g.id,
      );
    }
  }
  const width = fmt(maxX - minX + 64),
    height = fmt(maxY - minY + 64);
  return {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${fmt(minX - 32)} ${fmt(minY - 32)} ${width} ${height}" role="img" aria-label="Celeste preview" fill="${color}"><defs>${defs}</defs>${body}<g pointer-events="none">${marks}</g></svg>`,
    width,
    height,
    hits,
    applied,
    inferred: [...new Set(inferred)],
    empty: !ast.glyphs.length,
  };
}
