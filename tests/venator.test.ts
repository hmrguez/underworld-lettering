import { test } from 'bun:test';
import assert from 'node:assert/strict';
import { parse } from '../src/lib/parser.ts';
import { render } from '../src/lib/engine.ts';
import outlines from '../src/lib/venator-paths.json' with { type: 'json' };
const venator = (source: string, options: Parameters<typeof render>[1] = {}) =>
  render(parse(source), { style: 'venator', ...options });
const initials = (r: ReturnType<typeof render>) =>
  r.applied
    .filter((x) => x.label === 'Reference V initial')
    .map((x) => x.glyph);

test('Venator uses all seven source letters; only V word initials receive the source treatment', () => {
  assert.deepEqual(venator('VENATOR').inferred, []);
  assert.deepEqual(initials(venator('VAV AV V')), [0, 5]);
  assert.deepEqual(initials(venator('RAVEN')), []);
  assert.deepEqual(initials(venator('VENATOR', { initial: false })), []);
  assert.deepEqual(venator('VENATOR', { initial: false }).inferred, ['V']);
  assert.deepEqual(
    initials(venator('AV[initial=on]', { initial: false })),
    [1],
  );
  assert.deepEqual(initials(venator('V[initial=off]ENATOR')), []);
});
test('Venator initial and alternate choices respect interface, inline and automatic precedence', () => {
  assert.deepEqual(
    initials(
      venator('V[initial=off]', { overrides: { 0: { initial: 'on' } } }),
    ),
    [0],
  );
  assert.deepEqual(
    initials(
      venator('V[initial=on]', { overrides: { 0: { initial: 'off' } } }),
    ),
    [],
  );
  assert.deepEqual(
    initials(
      venator('V[initial=on]', {
        initial: false,
        overrides: { 0: { initial: 'auto' } },
      }),
    ),
    [],
  );
  assert.deepEqual(initials(venator('AV[variant=alt]')), [1]);
  assert.deepEqual(
    initials(
      venator('V[variant=alt]', { overrides: { 0: { variant: 'base' } } }),
    ),
    [],
  );
  assert.notEqual(venator('B').svg, venator('B[variant=alt]').svg);
  assert.deepEqual(venator('B[variant=alt]').inferred, ['B']);
});
test('diamonds and reference inscription are independent and opt-in inscription applies only when requested', () => {
  assert.match(venator('VENATOR').svg, /data-diamond/);
  assert.doesNotMatch(venator('VENATOR').svg, /data-inscription/);
  assert.doesNotMatch(venator('RAVEN').svg, /data-inscription/);
  const inscription = venator('VENATOR', {
    diamonds: false,
    inscription: true,
  });
  assert.match(inscription.svg, /data-inscription="XLVIII"/);
  assert.doesNotMatch(inscription.svg, /data-diamond/);
  assert.doesNotMatch(venator('V[ornament=off]ENATOR').svg, /data-diamond/);
  assert.match(
    venator('V[ornament=off]ENATOR', {
      diamonds: false,
      overrides: { 0: { ornament: 'on' } },
    }).svg,
    /data-diamond/,
  );
  assert.doesNotMatch(
    venator('V[ornament=on]ENATOR', { overrides: { 0: { ornament: 'off' } } })
      .svg,
    /data-diamond/,
  );
  assert.doesNotMatch(
    venator('', { inscription: true }).svg,
    /data-diamond|data-inscription/,
  );
});
test('Venator protects ink clearance at extreme tracking and fits glyph bounds', () => {
  type P = typeof outlines.letters.V;
  const reference = outlines.letters as Record<string, P>,
    inferred = outlines.inferred as Record<string, P>;
  for (const name of [
    'VENATOR',
    'IIII LLLL',
    'MMMM WWWW',
    'NNNN VVVV',
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    '0123456789',
  ])
    for (const tracking of [-1000, -35, 0, 60, 1000]) {
      const r = venator(name, { tracking, diamonds: false });
      const box = r.svg
        .match(/viewBox="([^"]+)"/)![1]
        .split(' ')
        .map(Number);
      for (const [i, h] of r.hits.entries()) {
        const p = h.original ? reference[h.char] : inferred[h.char];
        assert.ok(h.x >= box[0] && h.x + p.w <= box[0] + box[2]);
        assert.ok(p.y >= box[1] && p.y + p.h <= box[1] + box[3]);
        if (i) {
          const prev = r.hits[i - 1],
            a = prev.original ? reference[prev.char] : inferred[prev.char];
          for (let j = 0; j < p.profile.length; j++) {
            const left = p.profile[j],
              right = a.profile[j];
            if (left && right)
              assert.ok(
                h.x + left[0] - (prev.x + right[1]) >= 7.98,
                `${name}: ${prev.char}/${h.char} closed clearance`,
              );
          }
        }
      }
    }
  assert.ok(
    venator('VENATOR', { tracking: 60 }).width >
      venator('VENATOR', { tracking: -35 }).width,
  );
  const sourceWidth = 1329;
  assert.ok(
    venator('VENATOR', { diamonds: false }).width < sourceWidth * 1.16,
    'reference spacing remains compact',
  );
});
test('Venator hit rectangles are contiguous, disjoint and usable with narrow stems', () => {
  const r = venator('IIII LLLL', { tracking: -35 });
  const rects = [
    ...r.svg.matchAll(/data-hit="(\d+)" x="([^"]+)" y="0" width="([^"]+)"/g),
  ];
  assert.equal(rects.length, 8);
  rects.forEach((m, i) => {
    assert.ok(Number(m[3]) >= 60);
    if (i)
      assert.ok(
        Math.abs(
          Number(rects[i - 1][2]) + Number(rects[i - 1][3]) - Number(m[2]),
        ) < 0.02,
      );
  });
  assert.equal((r.svg.match(/tabindex="0"/g) ?? []).length, 8);
});
test('Venator output is deterministic, safe, and font independent', () => {
  const options = {
    inscription: true,
    tracking: -35,
    overrides: { 0: { initial: 'on' as const } },
  };
  const r = venator('VENATOR', options);
  assert.equal(r.svg, venator('VENATOR', options).svg);
  assert.doesNotMatch(r.svg, /<text|<image|font-family|@font-face|href=|url\(/);
  assert.match(r.svg, /<path/);
  assert.doesNotMatch(
    venator('VENATOR', { color: '" onload="alert(1)' }).svg,
    /onload/,
  );
  assert.ok(venator('').empty);
  assert.ok(venator('V[initial=oops').width > 0);
  assert.ok(parse('V[initial=on]').errors.length === 0);
});

test('Venator ornaments follow the body without intersecting forced V descenders', () => {
  const y = (svg: string) =>
    [
      ...svg.matchAll(
        /data-diamond="\d" transform="translate\([^ ]+ ([^)]+)\)"/g,
      ),
    ].map((m) => Number(m[1]) + outlines.diamonds[0].y);
  const source = venator('VENATOR', { inscription: true });
  assert.ok(y(source.svg)[0] < outlines.letters.V.y + outlines.letters.V.h);
  const forced = venator('V[variant=alt]V[variant=alt]', { inscription: true });
  assert.ok(y(forced.svg)[0] > outlines.letters.V.y + outlines.letters.V.h);
  assert.ok(forced.height > source.height);
});
