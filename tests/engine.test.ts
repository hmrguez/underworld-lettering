import { test } from 'bun:test';
import assert from 'node:assert/strict';
import { parse } from '../src/lib/parser.ts';
import { render, styles } from '../src/lib/engine.ts';
test('modifier syntax produces word AST and rejects incomplete settings without throwing', () => {
  const a = parse('R[swash=word]AT I[dot=crown]');
  assert.equal(a.words.length, 2);
  assert.equal(a.glyphs[0].modifiers.swash, 'word');
  assert.equal(a.glyphs[3].modifiers.dot, 'crown');
  assert.equal(a.errors.length, 0);
  assert.ok(parse('R[swash=oops').errors.length);
  assert.ok(parse('<script>').errors.length);
  assert.equal(parse('A'.repeat(40)).glyphs.length, 24);
});
test('reference specimens use traced glyphs in every style', () => {
  for (const s of styles) {
    const r = render(parse(s.sample), { style: s.id, texture: false });
    assert.deepEqual(r.inferred, []);
    assert.ok(r.svg.startsWith('<svg'));
    assert.ok(Number.isFinite(r.width));
  }
});
test('R swash adapts to the word, respects global disable and local precedence', () => {
  const short = render(parse('RAT'), { texture: false });
  const long = render(parse('RATAT'), { texture: false });
  assert.notEqual(short.svg, long.svg);
  assert.ok(short.applied.some((r) => r.label.includes('R leg')));
  assert.ok(
    !render(parse('RAT'), { swash: false }).applied.some((r) =>
      r.label.includes('R leg'),
    ),
  );
  assert.ok(
    render(parse('R[swash=word]AT'), { swash: false }).applied.some((r) =>
      r.label.includes('R leg'),
    ),
  );
  assert.ok(
    !render(parse('R[swash=off]AT')).applied.some((r) =>
      r.label.includes('R leg'),
    ),
  );
});
test('empty and malformed input stays renderable; arbitrary names disclose inferred glyphs', () => {
  assert.equal(render(parse('')).empty, true);
  assert.ok(render(parse('R[bad=x]')).svg);
  assert.ok(render(parse('RAVEN')).inferred.includes('V'));
});
test('dot overrides are deterministic and selected settings supersede source settings', () => {
  const a = parse('I[dot=crown]');
  assert.ok(
    render(a, { crown: false }).applied.some(
      (r) => r.label === 'I dot → crown',
    ),
  );
  assert.ok(
    !render(a, { overrides: { 0: { dot: 'off' } } }).applied.some((r) =>
      r.label.includes('I dot'),
    ),
  );
  assert.equal(render(a).svg, render(a).svg);
});

test('different inline specimens cannot share clipping or texture definitions', () => {
  const specimens = [
    render(parse('RAVEN'), { texture: true }),
    render(parse('RAT KING'), { texture: true }),
    render(parse('NURSE HARROW'), { style: 'harrow' }),
    render(parse('NIGHT SHIFT'), { style: 'harrow' }),
    render(parse('SOLOMON'), { style: 'solomon' }),
    render(parse('SOLOMON'), { style: 'solomon', platePhase: 'odd' }),
  ];
  const ids = specimens.flatMap((s) =>
    [...s.svg.matchAll(/ id="([^"]+)"/g)].map((m) => m[1]),
  );
  assert.equal(new Set(ids).size, ids.length);
  for (const specimen of specimens) {
    const ownIds = new Set(
      [...specimen.svg.matchAll(/ id="([^"]+)"/g)].map((m) => m[1]),
    );
    for (const match of specimen.svg.matchAll(/url\(#([^)]*)\)/g)) {
      assert.ok(ownIds.has(match[1]), `Unresolved SVG definition: ${match[1]}`);
    }
  }
});

test('reference spacing survives while unrelated Rat King pairs gain clearance', () => {
  assert.deepEqual(
    render(parse('RAT KING')).hits.map((h) => h.x),
    [0, 315, 471, 806, 1025, 1123, 1346],
  );
  assert.deepEqual(
    render(parse('BABA'), { style: 'baba' }).hits.map((h) => h.x),
    [0, 145, 299, 442],
  );
  const ab = render(parse('ABBA')).hits;
  assert.ok(ab[1].x - ab[0].x >= 237, 'A must not overlap the inferred B stem');
});

test('Harrow crossing flourish requires another row automatically, but can be forced without cropping', () => {
  const single = render(parse('RAVEN'), { style: 'harrow', texture: false });
  assert.ok(!single.applied.some((r) => r.label.includes('flourish')));
  const forced = render(parse('R[swash=word]AVEN'), {
    style: 'harrow',
    swash: false,
  });
  assert.ok(forced.applied.some((r) => r.label.includes('flourish')));
  assert.ok(
    forced.height >= 932 + 170,
    'Viewport must contain the whole forced crossing stroke',
  );
  const suppressed = render(parse('R[swash=word]AVEN'), {
    style: 'harrow',
    overrides: { 0: { swash: 'off' } },
  });
  assert.ok(!suppressed.applied.some((r) => r.label.includes('flourish')));
});

test('Baba export ornaments use transparent cutouts, with self-contained outlines', () => {
  const svg = render(parse('RAVEN'), { style: 'baba', texture: false }).svg;
  assert.ok(svg.includes('<mask'));
  assert.ok(!svg.includes('#20221c'));
  assert.ok(!/<text|<image|<use|font-family|href=/i.test(svg));
});

test('short punctuation keeps an advance smaller than a capital in every style', () => {
  for (const { id: style } of styles) {
    const specimen = render(parse("A-'A"), { style, texture: false });
    assert.ok(
      specimen.hits[1].w < specimen.hits[0].w,
      `${style}: oversized hyphen`,
    );
    assert.ok(
      specimen.hits[2].w < specimen.hits[0].w,
      `${style}: oversized apostrophe`,
    );
  }
});

test('Harrow S and E occupy the lower row when they belong to its word', () => {
  for (const [name, glyphId, sourceY] of [
    ['NIGHT SHIFT', 5, 0],
    ['NURSE EVE', 5, 6],
  ] as const) {
    const { svg } = render(parse(name), { style: 'harrow', texture: false });
    const transform = svg.match(
      new RegExp(
        `data-glyph="${glyphId}"[^>]*><g transform="translate\\([^ ]+ ([^)]+)\\) scale\\([^ ]+ ([^)]+)\\)"`,
      ),
    );
    assert.ok(transform);
    const inkTop = Number(transform[1]) + sourceY * Number(transform[2]);
    assert.ok(
      Math.abs(inkTop - 540) < 1,
      `${name}: lower glyph painted at ${inkTop}`,
    );
  }
});

test('an explicit Baba I dot replaces the shared crown while preserving side ornaments', () => {
  const specimen = render(parse('I[dot=star]RON'), {
    style: 'baba',
    texture: false,
  });
  assert.ok(specimen.applied.some((r) => r.label === 'I dot → star'));
  assert.ok(specimen.applied.some((r) => r.label === 'Folk side ornaments'));
  assert.ok(
    !specimen.applied.some((r) => r.label === 'Folk crown + side ornaments'),
  );
});

const solomon = (source: string, options: Parameters<typeof render>[1] = {}) =>
  render(parse(source), { style: 'solomon', texture: false, ...options });
const plateIds = (r: ReturnType<typeof render>) =>
  [...r.svg.matchAll(/data-plate="(\d+)"/g)].map((m) => Number(m[1]));
const rookIds = (r: ReturnType<typeof render>) =>
  [...r.svg.matchAll(/data-rook="(\d+)"/g)].map((m) => Number(m[1]));

test('Solomon plates restart parity at each word, counting glyphs rather than source offsets', () => {
  assert.deepEqual(plateIds(solomon('SOLOMON')), [1, 3, 5]);
  assert.deepEqual(
    plateIds(solomon('SOLOMON', { platePhase: 'odd' })),
    [0, 2, 4, 6],
  );
  assert.deepEqual(plateIds(solomon('A[rook=off]BB\nABBA')), [1, 4, 6]);
  assert.deepEqual(
    plateIds(solomon('ABB ABBA', { platePhase: 'odd' })),
    [0, 2, 3, 5],
  );
  assert.deepEqual(plateIds(solomon("A-' A-'")), [1, 4]);
});

test('Solomon plate overrides preserve interface > inline > global, including explicit auto', () => {
  assert.deepEqual(plateIds(solomon('S[plate=on]O[plate=off]L')), [0]);
  assert.deepEqual(
    plateIds(
      solomon('S[plate=on]O[plate=off]L', {
        plates: false,
        overrides: { 0: { plate: 'off' }, 1: { plate: 'on' } },
      }),
    ),
    [1],
  );
  assert.deepEqual(
    plateIds(
      solomon('S[plate=on]O[plate=off]', {
        overrides: { 0: { plate: 'auto' }, 1: { plate: 'auto' } },
      }),
    ),
    [1],
  );
  assert.deepEqual(plateIds(solomon('SOL[plate=on]', { plates: false })), [2]);
  assert.ok(parse('S[plate=maybe,rook=king]').errors.length);
});

test('Solomon rook placement is independent of parity and works on any letter', () => {
  assert.deepEqual(rookIds(solomon('SOLOMON')), [2]);
  assert.deepEqual(
    rookIds(solomon('SOLOMON', { plates: false, platePhase: 'odd' })),
    [2],
  );
  assert.deepEqual(rookIds(solomon('ABBA LLL')), [1, 4]);
  assert.deepEqual(
    rookIds(solomon('S[rook=on]OL[rook=off]', { rook: false })),
    [0],
  );
  assert.deepEqual(
    rookIds(
      solomon('S[rook=on]OL[rook=off]', {
        overrides: { 0: { rook: 'off' }, 2: { rook: 'on' } },
      }),
    ),
    [2],
  );
  assert.deepEqual(rookIds(solomon('SOLOMON', { rook: false })), []);
});

test('Solomon geometry is deterministic, bounded at extreme spacing and export-safe', () => {
  for (const tracking of [-1000, -35, 0, 60, 1000]) {
    const r = solomon('W[plate=on,rook=on] III OOO MW', {
      tracking,
      platePhase: 'odd',
    });
    assert.equal(
      r.svg,
      solomon('W[plate=on,rook=on] III OOO MW', { tracking, platePhase: 'odd' })
        .svg,
    );
    assert.ok(!/NaN|Infinity|<text|<image|<use|font-family|href=/.test(r.svg));
    assert.ok(r.width > 0 && r.height > 0);
    const [x, y, w, h] = r.svg
      .match(/viewBox="([^"]+)"/)![1]
      .split(' ')
      .map(Number);
    for (const hit of r.hits) assert.ok(hit.x >= x && hit.x + hit.w <= x + w);
    // Every plate corner fits within the final viewport (including a wide W).
    for (const match of r.svg.matchAll(
      /data-plate="\d+" d="M([-\d.]+) ([-\d.]+)L([-\d.]+) ([-\d.]+)V([-\d.]+)L([-\d.]+) ([-\d.]+)Z/g,
    )) {
      const v = match.slice(1).map(Number);
      assert.ok(v[0] >= x && v[2] <= x + w);
      for (const py of [v[1], v[3], v[4], v[6]])
        assert.ok(py >= y && py <= y + h);
    }
    const ownIds = new Set(
      [...r.svg.matchAll(/ id="([^"]+)"/g)].map((m) => m[1]),
    );
    for (const m of r.svg.matchAll(/url\(#([^)]*)\)/g))
      assert.ok(ownIds.has(m[1]));
    assert.ok(r.svg.includes('mask-type:luminance'));
    assert.ok(!r.svg.includes('#20221c'));
  }
  assert.deepEqual(solomon('SOLOMON').inferred, []);
  assert.deepEqual(solomon('RAVEN').inferred, ['R', 'A', 'V', 'E']);
  assert.ok(solomon('0123456789').hits.length === 10);
  assert.ok(solomon('').empty);
  assert.ok(
    !solomon('SOLOMON', { color: '"/><script>' }).svg.includes('<script>'),
  );
  assert.notEqual(
    solomon('SOLOMON').svg,
    solomon('SOLOMON', { platePhase: 'odd' }).svg,
  );
});
