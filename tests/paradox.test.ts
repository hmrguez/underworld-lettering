import { describe, expect, test } from 'bun:test';
import { render, styles } from '../src/lib/engine.ts';
import { parse } from '../src/lib/parser.ts';
import data from '../src/lib/paradox-paths.json';
const draw = (text: string, options: Parameters<typeof render>[1] = {}) =>
  render(parse(text), { style: 'paradox', ...options });
const counters = (svg: string) =>
  [...svg.matchAll(/data-counter="([^"]+)"/g)].map((m) => m[1]);
const variants = (svg: string) =>
  [...svg.matchAll(/data-variant="([^"]+)"/g)].map((m) => m[1]);
describe('Paradox', () => {
  test('editable source contours preserve native bearings and selective solid letters', () => {
    expect(styles.find((s) => s.id === 'paradox')?.sample).toBe('PARADOX');
    const r = draw('PARADOX');
    expect(r.inferred).toEqual([]);
    expect(r.hits.map((h) => h.char).join('')).toBe('PARADOX');
    expect(r.hits.map((h) => h.x)).toEqual([
      0, 285.735, 679.848, 1024.28, 1420.45, 1764.09, 2081,
    ]);
    expect(counters(r.svg)).toEqual([
      'off',
      'on',
      'off',
      'on',
      'off',
      'on',
      'off',
    ]);
    expect(draw('HOURGLASS').inferred).toEqual(['H', 'U', 'G', 'L', 'S']);
    expect(counters(draw('BPRDX').svg)).toEqual([
      'off',
      'off',
      'off',
      'off',
      'off',
    ]);
    expect(counters(draw('Q0').svg)).toEqual(['on', 'on']);
  });
  test('A counter forms alternate by occurrence independently of syntax and can be selected', () => {
    expect(variants(draw('AA AA').svg)).toEqual(['base', 'alt', 'base', 'alt']);
    expect(variants(draw('A[counter=off]A').svg)).toEqual(['base', 'alt']);
    expect(variants(draw('A[variant=alt]A[variant=base]').svg)).toEqual([
      'alt',
      'base',
    ]);
    expect(
      variants(
        draw('A[variant=alt]', { overrides: { 0: { variant: 'auto' } } }).svg,
      ),
    ).toEqual(['base']);
    expect(variants(draw('P[variant=alt]').svg)).toEqual(['base']);
    expect(data.letters.A[0].counters).not.toEqual(data.letters.A[1].counters);
  });
  test('counter interface > inline > automatic/global including explicit auto', () => {
    expect(counters(draw('AO', { hourglasses: false }).svg)).toEqual([
      'off',
      'off',
    ]);
    expect(counters(draw('A[counter=on]', { hourglasses: false }).svg)).toEqual(
      ['on'],
    );
    expect(
      counters(
        draw('A[counter=off]', { overrides: { 0: { counter: 'on' } } }).svg,
      ),
    ).toEqual(['on']);
    expect(
      counters(
        draw('A[counter=on]', {
          hourglasses: false,
          overrides: { 0: { counter: 'auto' } },
        }).svg,
      ),
    ).toEqual(['off']);
    expect(
      counters(
        draw('A[counter=off]', { overrides: { 0: { counter: 'auto' } } }).svg,
      ),
    ).toEqual(['on']);
    expect(
      counters(
        draw('P[counter=on]R[counter=on]D[counter=on]', { hourglasses: false })
          .svg,
      ),
    ).toEqual(['on', 'on', 'on']);
    expect(counters(draw('X[counter=on]I[counter=on]').svg)).toEqual([
      'off',
      'off',
    ]);
    expect(draw('P[counter=on]').applied[0].label).toContain('Inferred');
  });
  test('supported outlines remain finite and preserve ink separation at extreme spacing', () => {
    const forms: Record<string, { profile: (number[] | null)[]; w: number }[]> =
      { ...data.letters, ...data.inferred };
    for (const char of "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-'")
      for (const tracking of [-1000, 0, 1000]) {
        const r = draw(char.repeat(4), {
          tracking,
          overrides: { 0: { counter: 'on' } },
        });
        expect(r.hits).toHaveLength(4);
        expect(r.svg).not.toMatch(/NaN|Infinity/);
        const chosen = variants(r.svg);
        for (let i = 1; i < r.hits.length; i++) {
          const prev = forms[char][chosen[i - 1] === 'alt' ? 1 : 0],
            next = forms[char][chosen[i] === 'alt' ? 1 : 0];
          prev.profile.forEach((right, band) => {
            const left = next.profile[band];
            if (left && right)
              expect(
                r.hits[i].x + left[0] - r.hits[i - 1].x - right[1],
              ).toBeGreaterThan(5.998);
          });
        }
        expect(r.width).toBeGreaterThan(r.hits[3].x + r.hits[3].w);
      }
    expect(draw('A A').hits[1].x - draw('AA').hits[1].x).toBeGreaterThan(79);
  });
  test('deterministic transparent standalone outlines with safe definitions and malformed input', () => {
    const text = 'A[counter=off]O P[counter=on]Q0';
    const r = draw(text, { color: '<script>' });
    expect(draw(text, { color: '<script>' }).svg).toBe(r.svg);
    expect(r.svg).not.toMatch(/<text|<image|<script|font-family|NaN|Infinity/);
    expect(r.svg).toContain('fill="#eee6d1"');
    expect(r.svg).toContain('mask-type:luminance');
    const ids = [...r.svg.matchAll(/id="([^"]+)"/g)].map((m) => m[1]);
    expect(new Set(ids).size).toBe(ids.length);
    for (const m of r.svg.matchAll(/url\(#([^)]*)\)/g))
      expect(ids).toContain(m[1]);
    expect(draw('').empty).toBe(true);
    expect(draw('').width).toBeGreaterThan(0);
    expect(parse('A[counter=bad]').errors).toHaveLength(1);
    expect(draw('A[counter=on').hits).toHaveLength(1);
    expect(draw('A'.repeat(30)).hits).toHaveLength(24);
  });
});
