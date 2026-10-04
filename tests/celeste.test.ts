import { test, expect } from 'bun:test';
import { render } from '../src/lib/engine.ts';
import { parse } from '../src/lib/parser.ts';
const celeste = (text: string, options: Parameters<typeof render>[1] = {}) =>
  render(parse(text), { style: 'celeste', ...options });
const initials = (text: string, options: Parameters<typeof render>[1] = {}) =>
  celeste(text, options)
    .applied.filter((r) => r.label.includes('initial'))
    .map((r) => r.glyph);
test('Celeste reference coverage and contextual initial are independent of word breaks', () => {
  expect(celeste('CELESTE').inferred).toEqual([]);
  expect(initials('CELESTE STAR')).toEqual([0]);
  expect(initials('STAR LIGHT')).toEqual([0]);
  expect(celeste('STAR').inferred).toContain('S');
  expect(celeste('CELESTE', { initial: false }).inferred).toContain('C');
  expect(initials('S[initial=off]TAR C[initial=on]')).toEqual([4]);
  expect(initials('I[initial=on] L[initial=on]', { initial: false })).toEqual([
    0, 1,
  ]);
});
test('Celeste initial and decoration preserve interface > inline > global, including auto', () => {
  expect(
    initials('C[initial=off]', {
      initial: false,
      overrides: { 0: { initial: 'on' } },
    }),
  ).toEqual([0]);
  expect(
    initials('C[initial=on]', {
      initial: false,
      overrides: { 0: { initial: 'auto' } },
    }),
  ).toEqual([]);
  const plain = celeste('CELESTE', { ornaments: false, swash: false });
  expect(plain.svg).not.toContain('data-star');
  expect(plain.svg).not.toContain('<mask');
  expect(plain.svg).not.toContain('data-underline');
  const local = celeste('C[ornament=on,swash=word]ELESTE', {
    ornaments: false,
    swash: false,
  });
  expect(local.svg).toContain('<mask');
  expect(local.svg).toContain('data-underline');
  expect(
    celeste('C[ornament=off]', { overrides: { 0: { ornament: 'on' } } }).svg,
  ).toContain('<mask');
  expect(
    celeste('C[ornament=on]', {
      ornaments: false,
      overrides: { 0: { ornament: 'auto' } },
    }).svg,
  ).not.toContain('<mask');
  expect(celeste('CELESTE[ornament=off]').svg).not.toContain('data-star="6"');
});
test('Each word gets an adaptive ribbon pair with local underline suppression', () => {
  expect(
    (celeste('CELESTE STAR').svg.match(/data-underline=/g) || []).length,
  ).toBe(4);
  expect(
    (celeste('C[swash=off]ELESTE STAR').svg.match(/data-underline=/g) || [])
      .length,
  ).toBe(2);
  expect(
    celeste('C[swash=off]', {
      swash: false,
      overrides: { 0: { swash: 'word' } },
    }).svg,
  ).toContain('data-underline');
  const short = celeste('C'),
    long = celeste('CELESTE');
  expect(long.width).toBeGreaterThan(short.width);
  expect(celeste('CELESTE', { swashLength: 1.75 }).width).toBeGreaterThan(
    long.width,
  );
});
test('Adaptive underline control hulls fit the viewBox at extreme spacing and reach', () => {
  for (const text of [
    'C',
    'I',
    'IIII LLLL',
    'MMMM WWWW',
    'CELESTE',
    'BLACK THORN',
    'ABCDEFGHIJKLMNOPQRSTUVWX',
  ])
    for (const tracking of [-1000, -35, 0, 60, 1000])
      for (const swashLength of [0.4, 1, 2]) {
        const r = celeste(text, { tracking, swashLength });
        const [x, y, w, h] = r.svg
          .match(/viewBox="([^"]+)"/)![1]
          .split(' ')
          .map(Number);
        expect(r.svg).not.toMatch(/NaN|Infinity/);
        for (const match of r.svg.matchAll(
          /data-underline="[^"]+" d="([^"]+)"/g,
        )) {
          const nums = match[1].match(/-?\d+(?:\.\d+)?/g)!.map(Number);
          for (let i = 0; i < nums.length; i += 2) {
            expect(nums[i]).toBeGreaterThanOrEqual(x);
            expect(nums[i]).toBeLessThanOrEqual(x + w);
            expect(nums[i + 1]).toBeGreaterThanOrEqual(y);
            expect(nums[i + 1]).toBeLessThanOrEqual(y + h);
          }
        }
      }
});
test('Celeste exports are deterministic outlined SVGs with isolated transparent masks', () => {
  const r = celeste('CELESTE');
  expect(celeste('CELESTE').svg).toBe(r.svg);
  expect(r.svg).not.toMatch(/<text|<image|<script|font-family|href=/);
  expect(r.svg).toContain('maskUnits="userSpaceOnUse"');
  expect(r.svg.match(/<mask id="([^"]+)"/)![1]).not.toBe(
    celeste('CELESTE', { tracking: 60 }).svg.match(/<mask id="([^"]+)"/)![1],
  );
  expect(
    celeste('<script>bad</script>', { color: 'url(https://evil)' }).svg,
  ).not.toContain('evil');
  expect(celeste('').empty).toBe(true);
  expect(celeste('C[initial=oops]').hits).toHaveLength(1);
  expect(celeste('ABCDEFGHIJKLMNOPQRSTUVWXYZ').hits).toHaveLength(24);
});
