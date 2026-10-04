import { describe, expect, test } from 'bun:test';
import { render, styles } from '../src/lib/engine.ts';
import { parse } from '../src/lib/parser.ts';
import data from '../src/lib/viscous-paths.json';
const draw = (text: string, options: Parameters<typeof render>[1] = {}) =>
  render(parse(text), { style: 'viscous', ...options });
const bubbles = (svg: string) =>
  [...svg.matchAll(/data-bubble="([^"]+)"/g)].map((m) => m[1]);
const variants = (svg: string) =>
  [...svg.matchAll(/data-variant="([^"]+)"/g)].map((m) => m[1]);
describe('Viscous', () => {
  test('editable source forms, native heights and explicit inferred coverage', () => {
    expect(styles.find((s) => s.id === 'viscous')?.sample).toBe('VISCOUS');
    const r = draw('VISCOUS');
    expect(r.inferred).toEqual([]);
    expect(r.hits.map((h) => h.char).join('')).toBe('VISCOUS');
    expect(draw('BUBBLE').inferred).toEqual(['B', 'L', 'E']);
    expect(data.letters.V[0].h).toBeGreaterThan(data.letters.C[0].h * 1.5);
    expect(data.letters.O[0].bubbles).toHaveLength(3);
    expect(r.hits.map((h) => Math.round(h.x * 1000) / 1000)).toEqual([
      0, 359.933, 519.187, 793.529, 1056.91, 1319.65, 1626.87,
    ]);
  });
  test('native S alternates depend on occurrence and can be forced or suppressed', () => {
    expect(variants(draw('SS SS').svg)).toEqual(['base', 'alt', 'base', 'alt']);
    expect(variants(draw('S[variant=alt]S[variant=base]').svg)).toEqual([
      'alt',
      'base',
    ]);
    expect(
      variants(
        draw('S[variant=alt]', { overrides: { 0: { variant: 'auto' } } }).svg,
      ),
    ).toEqual(['base']);
    expect(draw('B[variant=alt]').svg).not.toBe(draw('B[variant=base]').svg);
  });
  test('bubble precedence including interface auto bypassing inline modifiers', () => {
    expect(bubbles(draw('VISCOUS').svg)).toEqual([
      'off',
      'off',
      'off',
      'off',
      'on',
      'off',
      'off',
    ]);
    expect(bubbles(draw('O', { bubbles: false }).svg)).toEqual(['off']);
    expect(bubbles(draw('O[bubble=on]', { bubbles: false }).svg)).toEqual([
      'on',
    ]);
    expect(
      bubbles(
        draw('O[bubble=off]', { overrides: { 0: { bubble: 'on' } } }).svg,
      ),
    ).toEqual(['on']);
    expect(
      bubbles(
        draw('O[bubble=on]', {
          bubbles: false,
          overrides: { 0: { bubble: 'auto' } },
        }).svg,
      ),
    ).toEqual(['off']);
    expect(bubbles(draw('B[bubble=on]', { bubbles: false }).svg)).toEqual([
      'on',
    ]);
    expect(bubbles(draw('B').svg)).toEqual(['off']);
  });
  test('outline-only deterministic safe exports with complete mask references', () => {
    const text = "B[bubble=on]O O'CLOCK";
    const r = draw(text, { color: '<script>' });
    expect(draw(text, { color: '<script>' }).svg).toBe(r.svg);
    expect(r.svg).not.toMatch(/<text|<image|<script|font-family|NaN|Infinity/);
    expect(r.svg).toContain('fill="#eee6d1"');
    const ids = [...r.svg.matchAll(/id="([^"]+)"/g)].map((m) => m[1]);
    expect(new Set(ids).size).toBe(ids.length);
    for (const m of r.svg.matchAll(/url\(#([^)]*)\)/g))
      expect(ids).toContain(m[1]);
    expect(r.svg).toContain('mask-type:luminance');
  });
  test('all supported glyphs retain finite bounds and safe tight spacing', () => {
    for (const char of "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-'")
      for (const variant of ['base', 'alt'] as const) {
        const r = draw(char.repeat(4), {
          tracking: -1000,
          overrides: { 0: { variant, bubble: 'on' } },
        });
        expect(r.hits).toHaveLength(4);
        expect(r.svg).not.toMatch(/NaN|Infinity/);
        for (let i = 1; i < r.hits.length; i++)
          expect(
            r.hits[i].x - r.hits[i - 1].x - r.hits[i - 1].w,
          ).toBeGreaterThan(5.99);
        expect(r.width).toBeGreaterThan(r.hits[3].x + r.hits[3].w);
      }
    expect(draw('').empty).toBe(true);
    expect(draw('').width).toBeGreaterThan(0);
    expect(parse('O[bubble=bad]').errors).toHaveLength(1);
    expect(draw('O[bubble=on').hits).toHaveLength(1);
    expect(draw('O'.repeat(30)).hits).toHaveLength(24);
  });
});
