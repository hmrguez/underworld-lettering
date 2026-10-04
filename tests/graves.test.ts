import { describe, expect, test } from 'bun:test';
import { render, styles } from '../src/lib/engine.ts';
import { parse } from '../src/lib/parser.ts';
import { fracturePattern } from '../src/lib/graves.ts';
import data from '../src/lib/graves-paths.json';
const draw = (text: string, options: Parameters<typeof render>[1] = {}) =>
  render(parse(text), { style: 'graves', ...options });
const treatments = (svg: string) =>
  [...svg.matchAll(/data-fracture="([^"]+)"/g)].map((m) => m[1]);

describe('Graves', () => {
  test('preset and reference disclosure preserve editable characters', () => {
    expect(styles.find((s) => s.id === 'graves')?.sample).toBe('GRAVES');
    const r = draw('GRAVES');
    expect(r.inferred).toEqual([]);
    expect(r.hits.map((h) => h.char).join('')).toBe('GRAVES');
    expect(treatments(r.svg)).toEqual(Array(6).fill('reference'));
    expect(draw('BONE').inferred).toEqual(['B', 'O', 'N']);
  });
  test('the shared V/E contour gives E its upper-left fragment and keeps preset positions', () => {
    const v = data.letters.V.ds.join('');
    const e = data.letters.E.ds.join('');
    // These landmarks are on E's upper-left stem and diagonal shoulder.
    expect(e).toContain('L986.508 113.027');
    expect(e).toContain('1063.58 24.228');
    expect(v).not.toContain('L986.508 113.027');
    expect(v).not.toContain('1063.58 24.228');
    expect(data.letters.V.w).toBeLessThan(260);
    for (const fractures of [false, true]) {
      const r = draw('GRAVES', { fractures });
      expect(r.hits[3].x).toBeCloseTo(731.348, 2);
      expect(r.hits[4].x).toBeCloseTo(967.119, 2);
      expect(r.hits[5].x).toBeCloseTo(1178.37, 2);
    }
  });
  test('reference first occurrences and curated repeat selection are stable', () => {
    for (const c of 'GRAVES') expect(fracturePattern(c, 0)).toBe(-1);
    for (const c of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') {
      const patterns = [1, 2, 3].map((i) => fracturePattern(c, i));
      expect(new Set(patterns).size).toBe(3);
    }
    for (const char of "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-'") {
      expect(
        treatments(draw(char.repeat(4), { fractures: true }).svg),
      ).not.toContain('intact');
    }
    expect(draw('GRAVES').svg).toBe(draw('GRAVES').svg);
    expect(treatments(draw('GGGG').svg).slice(1)).toEqual(
      treatments(draw('AGGGG').svg).slice(2),
    );
  });
  test('interface > inline > global, including explicit automatic', () => {
    expect(
      treatments(
        draw('G[fracture=off]R[fracture=on]A', { fractures: false }).svg,
      ),
    ).toEqual(['intact', 'reference', 'intact']);
    expect(
      treatments(
        draw('G[fracture=off]R[fracture=on]', {
          fractures: false,
          overrides: { 0: { fracture: 'on' }, 1: { fracture: 'auto' } },
        }).svg,
      ),
    ).toEqual(['reference', 'intact']);
    expect(
      treatments(
        draw('G[fracture=on]', {
          fractures: true,
          overrides: { 0: { fracture: 'off' } },
        }).svg,
      ),
    ).toEqual(['intact']);
    expect(parse('G[fracture=diagonal]').errors).toHaveLength(1);
  });
  test('transparent masks and collision-safe definitions contain no painted canvas or fonts', () => {
    const specimens = ['GRAVES', 'GGGG', 'IRON WITCH'].map((t) => draw(t));
    const seen = new Set<string>();
    for (const r of specimens) {
      expect(r.svg).not.toMatch(
        /<text|<image|<script|font-family|filter=|#20221c/,
      );
      const ids = [...r.svg.matchAll(/ id="([^"]+)"/g)].map((m) => m[1]);
      expect(new Set(ids).size).toBe(ids.length);
      for (const id of ids) {
        expect(seen.has(id)).toBe(false);
        seen.add(id);
      }
      for (const m of r.svg.matchAll(/url\(#([^)]+)\)/g))
        expect(ids).toContain(m[1]);
      expect(r.svg).toContain('mask-type:luminance');
    }
    expect(draw('GRAVES', { fractures: false }).svg).not.toContain('<mask');
    expect(draw('GRAVES', { color: '#000000' }).svg).not.toBe(
      draw('GRAVES', { color: '#ffffff' }).svg,
    );
  });
  test('cuts fit connected ink runs and widths cannot erase a thin part', () => {
    for (const p of Object.values({ ...data.letters, ...data.inferred }))
      for (const pattern of p.patterns)
        for (const cut of pattern) {
          expect(cut.width).toBeGreaterThan(0);
          expect(cut.width).toBeLessThanOrEqual(4.2);
          const numbers = [...cut.d.matchAll(/-?\d*\.?\d+/g)].map((m) =>
            Number(m[0]),
          );
          for (let i = 0; i < numbers.length; i += 2) {
            expect(numbers[i]).toBeGreaterThanOrEqual(-3);
            expect(numbers[i]).toBeLessThanOrEqual(p.w + 3);
            expect(numbers[i + 1]).toBeGreaterThanOrEqual(p.y - 3);
            expect(numbers[i + 1]).toBeLessThanOrEqual(p.y + p.h + 3);
          }
        }
  });
  test('finite bounds contain every glyph at extreme tracking; unsupported options are sanitized', () => {
    for (const tracking of [-1000, -35, 0, 60, 1000, NaN])
      for (const fractureIntensity of [-100, 0, 0.4, 1, 100, NaN]) {
        const r = draw("I WWWW Q 0123456789-'", {
          tracking,
          fractureIntensity,
        });
        expect(r.svg).not.toMatch(/NaN|Infinity/);
        expect(r.width).toBeGreaterThan(0);
        expect(r.height).toBeGreaterThan(0);
        for (const hit of r.hits) {
          expect(hit.x).toBeGreaterThanOrEqual(0);
          expect(hit.x + hit.w).toBeLessThan(r.width);
        }
      }
    expect(draw('').empty).toBe(true);
    expect(draw('GRAVES', { fractureIntensity: 0.4 }).svg).not.toBe(
      draw('GRAVES', { fractureIntensity: 1 }).svg,
    );
  });
});
