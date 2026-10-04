import { test, expect } from 'bun:test';
import { parse } from '../src/lib/parser.ts';
import { render } from '../src/lib/engine.ts';
const violet = (text: string, options: Parameters<typeof render>[1] = {}) =>
  render(parse(text), { style: 'violet', texture: false, ...options });
const forms = (svg: string) =>
  [...svg.matchAll(/data-form="([^"]+)"/g)].map((m) => m[1]);
const joins = (svg: string) =>
  [...svg.matchAll(/data-join="([^"]+)"/g)].map((m) => m[1]);
test('Violet shapes each word, preserves normalized parser IDs and source mapping', () => {
  const text = "vio[swash=off]let PAINT o'clock",
    ast = parse(text),
    snapshot = JSON.stringify(ast),
    r = render(ast, { style: 'violet' });
  expect(forms(r.svg)).toEqual([
    'V',
    'i',
    'o',
    'l',
    'e',
    't',
    'P',
    'a',
    'i',
    'n',
    't',
    'O',
    "'",
    'c',
    'l',
    'o',
    'c',
    'k',
  ]);
  expect(JSON.stringify(ast)).toBe(snapshot);
  expect(r.hits.map((h) => [h.id, h.char])).toEqual(
    ast.glyphs.map((g) => [g.id, g.char]),
  );
  for (const g of ast.glyphs)
    expect(r.svg).toContain(
      `data-source-start="${g.start}" data-source-end="${g.end}"`,
    );
  expect(violet('VIOLET').inferred).toEqual([]);
  expect(violet('IOLET').inferred).toEqual(['I']);
  expect(violet('V[initial=off]').inferred).toEqual(['v']);
});
test('reachable shoulders join at normal tracking; boundaries and detached letters break them', () => {
  expect(joins(violet('VIOLET').svg)).toEqual(['1-2', '2-3', '3-4', '4-5']);
  expect(joins(violet('VIO LET').svg)).toEqual(['1-2', '3-4', '4-5']);
  for (const name of ['VIO-LET', "VIO'LET"]) {
    const r = violet(name);
    expect(joins(r.svg)).toEqual(['1-2', '4-5', '5-6']);
  }
  expect(joins(violet('VIO[variant=base]LET').svg)).toEqual(['3-4', '4-5']);
  expect(violet('VIO[variant=base]LET').width).toBeGreaterThan(
    violet('VIOLET').width,
  );
  expect(joins(violet('A I O V').svg)).toEqual([]);
  expect(joins(violet('A1B').svg)).toEqual([]);
  expect(parse('VIO.LET').errors).toHaveLength(1);
  expect(joins(violet('VIO.LET').svg)).toEqual(['1-2', '3-4', '4-5']);
  expect(violet('VIVID').svg).toContain('data-entry');
  expect(joins(violet('ABBA').svg)).toHaveLength(3);
  expect(joins(violet('NURSE').svg)).toHaveLength(4);
  const pairPaths = [
    ...violet('VIOLET').svg.matchAll(/data-join="[^"]+" d="([^"]+)"/g),
  ].map((m) => m[1]);
  expect(new Set(pairPaths).size).toBe(4);
});
test('tracking preserves tight script and disengages wide connections with entry/exit forms', () => {
  const tight = violet('VIOLET', { tracking: -35 }),
    normal = violet('VIOLET'),
    wide = violet('VIOLET', { tracking: 100 });
  expect(joins(tight.svg)).toHaveLength(4);
  expect(joins(normal.svg)).toHaveLength(4);
  expect(joins(wide.svg)).toEqual([]);
  expect(wide.svg).toContain('data-entry="2"');
  expect(wide.svg).toContain('data-exit="2"');
  expect(wide.width).toBeGreaterThan(normal.width);
  expect(tight.width).toBeLessThan(normal.width);
  expect(joins(violet('VIOLET', { tracking: 49 }).svg).length).toBeGreaterThan(
    0,
  );
  expect(joins(violet('VIOLET', { tracking: 50 }).svg)).toEqual([]);
  expect(violet('IIII', { tracking: -1000 }).hits.every((h) => h.w > 0)).toBe(
    true,
  );
});
test('capital, extension, wear and detachment honor interface > inline > automatic including auto', () => {
  expect(
    forms(
      violet('V[initial=off]', { overrides: { 0: { initial: 'on' } } }).svg,
    ),
  ).toEqual(['V']);
  expect(
    forms(
      violet('V[initial=off]', { overrides: { 0: { initial: 'auto' } } }).svg,
    ),
  ).toEqual(['V']);
  expect(forms(violet('VI[initial=on]OLET').svg)).toEqual([
    'V',
    'I',
    'o',
    'l',
    'e',
    't',
  ]);
  const off = violet('VIOLET', { swash: false }),
    forced = violet('VIOLET[swash=word]', { swash: false });
  expect(forced.width).toBeGreaterThan(off.width);
  expect(
    violet('VIOLET[swash=off]', {
      overrides: { 5: { swash: 'word' } },
    }).applied.some((r) => r.label === 'Extended t crossbar'),
  ).toBe(true);
  expect(
    violet('VIOLET[swash=word]', {
      swash: false,
      overrides: { 5: { swash: 'auto' } },
    }).applied.some((r) => r.label === 'Extended t crossbar'),
  ).toBe(false);
  expect(violet('V[ornament=on]', { texture: false }).svg).toContain('<mask');
  expect(
    violet('V[ornament=on]', { overrides: { 0: { ornament: 'auto' } } }).svg,
  ).not.toContain('<mask');
  expect(
    violet('V[ornament=off]', { overrides: { 0: { ornament: 'on' } } }).svg,
  ).toContain('<mask');
  expect(
    joins(
      violet('VIO[variant=base]LET', { overrides: { 2: { variant: 'auto' } } })
        .svg,
    ),
  ).toHaveLength(4);
});
test('arbitrary forms, repeats, punctuation, bounds and exports remain deterministic outline-only SVG', () => {
  for (const name of [
    'VIOLET',
    'ABBA ABBA',
    'OOOO LLLL',
    'IIII TTTT',
    'MMMM WWWW',
    "O'CLOCK",
    '0123456789',
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    'A I O V',
    '',
    'V[swash=oops',
  ]) {
    for (const tracking of [-1000, -35, 0, 60, 100, 1000]) {
      const r = violet(name, { tracking, texture: true, swashLength: 2 });
      expect(r.svg).toBe(
        violet(name, { tracking, texture: true, swashLength: 2 }).svg,
      );
      expect(r.width).toBeGreaterThan(0);
      expect(r.height).toBeGreaterThan(0);
      expect(r.svg).not.toMatch(
        /NaN|Infinity|<text|<image|<script|font-family|href=/,
      );
      expect(r.hits).toHaveLength(parse(name).glyphs.length);
    }
  }
  expect(violet('VIOLET', { color: 'red" onload="alert(1)' }).svg).toContain(
    'fill="#eee6d1"',
  );
  expect(violet('').empty).toBe(true);
  const normal = violet('VIOLET', { texture: true }).svg,
    other = violet('VIOLET', { texture: true, tracking: 60 }).svg;
  expect(normal.match(/<mask id="([^"]+)/)?.[1]).not.toBe(
    other.match(/<mask id="([^"]+)/)?.[1],
  );
});
