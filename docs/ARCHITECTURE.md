# Architecture and lettering model

## Stack and flow

Svelte 5 with runes, Vite, strict TypeScript modules, static JSON outline data, and Bun's test runner. TypeScript 7.0.2 performs diagnostics, with TypeScript 6.0.3 retained for Svelte tooling compatibility. Bun 1.4.2 runs installation, checks, tests, and Vite. There is no backend, database, account system, or generative API.

```text
source → lex → parse → style-specific glyph selection
       → word/line layout → contextual ornaments → SVG
```

`App.svelte` owns editor state. Its derived AST and render result update synchronously when input or settings change. The parser and engine do not depend on Svelte.

## Files

| File | Responsibility |
| --- | --- |
| `src/lib/parser.ts` | Lexer, grammar, validation, AST |
| `src/lib/engine.ts` | Style metadata, metrics, shaping, placement, rules, SVG |
| `src/lib/reference-paths.json` | Source paths plus measured bounds |
| `src/lib/inferred-rat-paths.json` | Generated inferred brush capitals |
| `src/lib/fallback-paths.json` | Precomputed outlines from fallback fonts |
| `scripts/design-rat-glyphs.cjs` | Reproducible inferred Rat King glyph generation |
| `src/App.svelte` | Editor, selection, overrides, settings, preview, export |
| `src/app.css` | Industrial workshop UI and responsive layout |
| `public/references/` | Source wordmark SVGs and fallback font licenses |
| `tests/engine.test.ts` | Parser, contextual rules, deterministic output, precedence |

The reference/fallback extraction scripts used during initial bootstrapping were temporary tools and are not in this repository. Their generated JSON is committed. The inferred Rat King generator is self-contained and retained.

## Parser contract

`lex(source)` returns tokens with `type`, `value`, `start`, and `end`. Types are `glyph`, `space`, `modifier`, and `invalid`; modifiers also record whether their closing bracket exists.

`parse(source)` returns:

```js
{
  type: 'Name',
  tokens,
  words: [{ index, glyphs }],
  glyphs: [{ id, char, start, end, word, modifiers }],
  errors: [{ start, message }]
}
```

Accepted glyph input is ASCII letters, digits, hyphen, and apostrophe. Letters normalize to uppercase. Whitespace starts a new word; newlines are not a separately preserved line-break node. Rendering is capped at 24 glyphs. Invalid syntax leaves valid glyphs available for preview rather than throwing.

Example:

```text
R[swash=word]AT KI[dot=crown]NG
```

Supported keys:

- `swash`: `auto`, `word`, `off`.
- `dot`: `auto`, `crown`, `star`, `off`.
- `variant`: `auto`, `base`, `alt`.
- `ornament`: `auto`, `on`, `off`.

Comma-separated settings may share brackets. Global/automatic behavior is used when a setting is `auto`. The selected UI override is consulted before the inline modifier. UI overrides are keyed by glyph index and cleared when text changes.

## Renderer contract

`render(ast, options)` returns `{ svg, width, height, hits, applied, inferred, empty }`.

Options include `style`, `crown`, `swash`, `ornaments`, `texture`, `irregular`, `tracking`, `swashLength`, `color`, and `overrides`. Style IDs are `rat`, `harrow`, and `baba`.

- `svg` is a complete inline SVG string.
- `hits` contains selection metadata and reference/inferred status.
- `applied` describes active composition rules for the UI.
- `inferred` lists unique letters whose outlines do not come from the reference.
- Color is restricted to a six-digit hexadecimal value before insertion.
- Glyphs carry `data-glyph`, keyboard focus, and selection labels.

The UI disables extra ink wear by default. The engine's default `texture` option is true, so callers wanting the reference appearance should explicitly pass `texture: false`.

## Style-specific behavior

### Rat King

Reference path indices map to individual glyphs. Their measured advance widths deliberately differ from outline bounds: some shapes overlap. Preserve these metrics when refining shapes.

The R outline includes its long tail. The engine clips base and tail separately, stretches the tail horizontally according to the current word width, and expands the viewport for its reach. Automatic swashes apply to an R at the beginning of a word of at most six glyphs. A local modifier can force or suppress the swash.

The source crown is positioned relative to the first word. An explicit crown/star I dot suppresses that first-word crown. Unseen capitals are built from deterministic irregular ribbons around angular stroke skeletons.

### Nurse Harrow

One word occupies a single row. For multiple words, the first occupies the top row and the remaining words share the bottom row. The source has a combined N/U/R path, so those top-row glyphs are isolated with clip regions. A reference R flourish is drawn separately and can cross into the lower row. Some offsets are tuned to the original name rather than calculated from a general collision solver.

### Baba

Two A and two B variants are available from the reference. Later glyph positions choose alternates automatically. The crown and side ornaments are separate source paths. Missing letters use Rye outlines; additional interior decorative shapes are drawn in the canvas's dark color rather than being transparent cutouts. Consider this when changing canvas backgrounds or refining export transparency.

## Extension guidance

Keep parsing independent from rendering. New styles should supply letter outlines, metrics, alternates, and rule behavior without changing the text grammar unnecessarily. The current engine contains style branches; there is not yet a generic external style-pack loader.

Reference art is comparison material. The editable renderer must continue to assemble its own glyphs and ornaments for both preset names and arbitrary names.

