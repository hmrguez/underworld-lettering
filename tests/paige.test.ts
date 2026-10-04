import { describe, expect, test } from 'bun:test';
import { render, styles } from '../src/lib/engine.ts';
import { parse } from '../src/lib/parser.ts';
import data from '../src/lib/paige-paths.json';
const draw = (text: string, options: Parameters<typeof render>[1] = {}) =>
  render(parse(text), { style: 'paige', ...options });
const initials = (svg: string) =>
  [...svg.matchAll(/data-initial="([^"]+)"/g)].map((m) => m[1]);
const frames = (svg: string) =>
  [...svg.matchAll(/data-frame="(\d+)"/g)].map((m) => Number(m[1]));
describe('Paige', () => {
  test('source preset is editable with native bearings and independent frame', () => {
    expect(styles.find((s) => s.id === 'paige')?.sample).toBe('PAIGE');
    const r = draw('PAIGE');
    expect(r.inferred).toEqual([]);
    expect(r.hits.map((h) => h.char).join('')).toBe('PAIGE');
    expect(r.hits.map((h) => h.x)).toEqual([
      0, 373.172, 590.234, 708.706, 957.959,
    ]);
    expect(initials(r.svg)).toEqual(['on', 'off', 'off', 'off', 'off']);
    expect(frames(r.svg)).toEqual([0]);
    expect(draw('PAIGE', { frame: false }).hits).toEqual(r.hits);
    expect(draw('PAIGE', { initial: false }).inferred).toEqual(['P']);
    expect(frames(draw('PAIGE', { initial: false }).svg)).toEqual([0]);
    expect(draw('RAVEN').inferred).toEqual(['R', 'V', 'N']);
    expect(draw('PPPP').hits.map((h) => h.original)).toEqual([
      true,
      false,
      false,
      false,
    ]);
  });
  test('first alphabetic initial and frame are independent with interface precedence and explicit auto', () => {
    expect(initials(draw("1-'RAVEN").svg)).toEqual([
      'off',
      'off',
      'off',
      'on',
      'off',
      'off',
      'off',
      'off',
    ]);
    expect(frames(draw('RAVEN MOON').svg)).toEqual([0]);
    expect(
      initials(draw('R[initial=on]A[initial=on]', { initial: false }).svg),
    ).toEqual(['on', 'on']);
    expect(
      frames(draw('R[frame=off]A[frame=on]', { frame: false }).svg),
    ).toEqual([1]);
    expect(
      initials(
        draw('R[initial=off]', { overrides: { 0: { initial: 'on' } } }).svg,
      ),
    ).toEqual(['on']);
    expect(
      frames(draw('R[frame=off]', { overrides: { 0: { frame: 'on' } } }).svg),
    ).toEqual([0]);
    expect(
      initials(
        draw('R[initial=on]', {
          initial: false,
          overrides: { 0: { initial: 'auto' } },
        }).svg,
      ),
    ).toEqual(['off']);
    expect(
      frames(
        draw('R[frame=on]', {
          frame: false,
          overrides: { 0: { frame: 'auto' } },
        }).svg,
      ),
    ).toEqual([]);
    expect(
      frames(draw('R[frame=off]', { overrides: { 0: { frame: 'auto' } } }).svg),
    ).toEqual([0]);
    expect(draw('R[initial=on]').svg).not.toBe(draw('P[initial=on]').svg);
    expect(
      frames(draw('1[frame=on,initial=on]', { frame: false }).svg),
    ).toEqual([]);
  });
  test('frame opening clears dots, descenders and forced neighbor initials, and interior frames reserve bearings', () => {
    for (const text of [
      'PI',
      'PG',
      'PM',
      'PI[initial=on]',
      'PG[initial=on]',
      'PM[initial=on]',
    ]) {
      const r = draw(text),
        [upper, lower] = r.svg
          .match(/data-opening="([^"]+)"/)![1]
          .split(' ')
          .map(Number);
      const char = text[1],
        p = text.includes('initial=on')
          ? data.initials[char as keyof typeof data.initials]
          : { ...data.letters, ...data.inferred }[
              char as keyof typeof data.letters
            ];
      expect(upper).toBeLessThanOrEqual(p.y - 36.32);
      expect(lower).toBeGreaterThanOrEqual(p.y + p.h + 43.18);
    }
    const r = draw('R[frame=on]A[frame=on]V', { tracking: -1000 });
    expect(
      r.hits[1].x - 79.0608 - r.hits[0].x - r.hits[0].w - 47.105,
    ).toBeGreaterThan(11.99);
  });
  test('expanded openings preserve top and bottom border thickness', () => {
    const topInner = data.frame.findIndex(([, y]) => y === 24.0175);
    const topOuter = data.frame.findIndex(([, y]) => y === 1.77469);
    const bottomInner = data.frame.findIndex(([, y]) => y === 730.819);
    const bottomOuter = data.frame.findIndex(([, y]) => y === 760.515);
    for (const [text, options] of [
      ['PAIGE', { initial: false }],
      ['P[frame=off]A[frame=on]I[initial=on]GE', {}],
      ['PI[initial=on]', {}],
    ] as const) {
      const d = draw(text, options).svg.match(
        /data-frame="\d+"[^>]* d="([^"]+)"/,
      )![1];
      const vertices = [...d.matchAll(/[ML](-?[\d.]+) (-?[\d.]+)/g)].map(
        (m) => [Number(m[1]), Number(m[2])],
      );
      expect(vertices[topInner][1] - vertices[topOuter][1]).toBeCloseTo(
        22.24281,
        2,
      );
      expect(vertices[bottomOuter][1] - vertices[bottomInner][1]).toBeCloseTo(
        29.696,
        2,
      );
    }
  });
  test('custom alphabet remains finite and arbitrary tight pairs retain profile clearance', () => {
    for (const char of "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-'") {
      for (const tracking of [-1000, 0, 1000]) {
        const r = draw(char.repeat(4), {
          initial: false,
          frame: false,
          tracking,
        });
        expect(r.hits).toHaveLength(4);
        expect(r.svg).not.toMatch(/NaN|Infinity/);
        const p = { ...data.letters, ...data.inferred }[
          char as keyof typeof data.inferred
        ];
        for (let i = 1; i < 4; i++)
          p.profile.forEach((band) => {
            if (band)
              expect(
                r.hits[i].x + band[0] - r.hits[i - 1].x - band[1],
              ).toBeGreaterThan(5.998);
          });
      }
    }
    expect(draw('A A').hits[1].x - draw('AA').hits[1].x).toBeGreaterThan(99);
    expect(draw('RA', { tracking: NaN }).svg).not.toMatch(/NaN/);
  });
  test('deterministic standalone outlines handle invalid syntax, empty input, and hostile color', () => {
    const text = 'R[initial=on,frame=on]AVEN';
    const r = draw(text, { color: '<script>' });
    expect(draw(text, { color: '<script>' }).svg).toBe(r.svg);
    expect(r.svg).not.toMatch(
      /<text|<image|<script|font-family|url\(|NaN|Infinity/,
    );
    expect(r.svg).toContain('fill="#eee6d1"');
    expect(draw('').empty).toBe(true);
    expect(draw('').width).toBeGreaterThan(0);
    expect(parse('R[frame=bad]').errors).toHaveLength(1);
    expect(draw('R[frame=on').hits).toHaveLength(1);
    expect(draw('A'.repeat(30)).hits).toHaveLength(24);
  });
});
