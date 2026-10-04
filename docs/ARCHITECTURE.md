# Architecture and lettering model

## Stack and flow

Svelte 5 with runes, Vite, strict TypeScript modules, static JSON outline data, and Bun's test runner. TypeScript 7.0.2 performs diagnostics, with TypeScript 6.0.3 retained for Svelte tooling compatibility. Bun 1.4.2 runs installation, checks, tests, and Vite. There is no backend, database, account system, or generative API.

```text
source → lex → parse → style-specific glyph selection
       → word/line layout → contextual ornaments → SVG
```

`App.svelte` owns editor state. Its derived AST and render result update synchronously when input or settings change. The parser and engine do not depend on Svelte.

## Files

| File                              | Responsibility                                             |
| --------------------------------- | ---------------------------------------------------------- |
| `src/lib/parser.ts`               | Lexer, grammar, validation, AST                            |
| `src/lib/engine.ts`               | Style metadata, metrics, shaping, placement, rules, SVG    |
| `src/lib/reference-paths.json`    | Source paths plus measured bounds                          |
| `src/lib/inferred-rat-paths.json` | Generated inferred brush capitals                          |
| `src/lib/fallback-paths.json`     | Precomputed outlines from fallback fonts                   |
| `scripts/design-rat-glyphs.cjs`   | Reproducible inferred Rat King glyph generation            |
| `src/App.svelte`                  | Editor, selection, overrides, settings, preview, export    |
| `src/app.css`                     | Industrial workshop UI and responsive layout               |
| `public/references/`              | Source wordmark SVGs and fallback font licenses            |
| `tests/engine.test.ts`            | Parser, contextual rules, deterministic output, precedence |

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
- `initial`: `auto`, `on`, `off` (Venator V; Celeste contextual capitals).
- `plate`, `rook`: `auto`, `on`, `off` (Solomon).

Comma-separated settings may share brackets. Global/automatic behavior is used when a setting is `auto`. The selected UI override is consulted before the inline modifier. UI overrides are keyed by glyph index and cleared when text changes.

## Renderer contract

`render(ast, options)` returns `{ svg, width, height, hits, applied, inferred, empty }`.

Options include `plates`, `platePhase` (`even` by default, or `odd`), `rook`, `style`, `crown`, `swash`, `ornaments`, `texture`, `irregular`, `tracking`, `swashLength`, `color`, and `overrides`. Style IDs are `rat`, `harrow`, `baba`, `solomon`, `venator`, `celeste`, `violet`, and `graves`.

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

The source crown is positioned relative to the first word, with extra vertical clearance for inferred capitals. An explicit crown/star I dot suppresses that first-word crown; its mark follows the glyph's actual top. Unseen capitals are built from deterministic pressure ribbons around angular stroke skeletons. Long facets, split-bristle terminals and sparse longitudinal edge tears supply brush character without dense contour noise. Closed O/Q bowls use oppositely wound contours to preserve their counters. The generator measures finished ink bounds, including the bristle tips, for every inferred capital. Original pair overlaps are retained, while unrelated pairs and word boundaries receive additional clearance.

### Nurse Harrow

One word occupies a single row. For multiple words, the first occupies the top row and the remaining words share the bottom row. The source has a combined N/U/R path, so those top-row glyphs are isolated with clip regions. S and E preserve their native outlines on top, and are scaled and translated for the lower row. A reference R flourish is drawn separately at the R's layout position; it is automatic for multiple rows and can be forced for a single word, expanding the viewport to contain its reach. Some offsets are tuned to the original name rather than calculated from a general collision solver.

### Baba

Two A and two B variants are available from the reference, including their small counter details. Later glyph positions choose alternates automatically. The crown and side ornaments are separate source paths, positioned against the final letter's ink bounds. An explicit I dot replaces the shared crown. Missing letters use Rye outlines; additional interior decoration uses transparent SVG masks and supports other backgrounds on export.

SVG definitions use a deterministic namespace derived from the AST and render options. Different specimens can coexist without resolving clips, masks, or filters against another preview. Punctuation scales to a fraction of cap height and uses its own vertical placement.

### Solomon

`solomon.ts` supplies an isolated style renderer, invoked by the shared engine after option defaults, color validation, and deterministic namespace construction. Existing style layout branches are preserved. `solomon-paths.json` contains S/L/M/N, three O contours with counters, and the rook copied from the verified chessmaster reference SVG. `scripts/extract-solomon.py` splits the plate compound paths at their second contour and measures cubic extrema; it does not trace raster pixels or synthesize reference letters.

Unseen capitals use explicit high-contrast serif geometry at a 430-unit cap height. Digits use narrowed Cormorant Garamond outlines. Punctuation keeps short advances. Reference glyph coordinates preserve native height variation; horizontal metrics reconstruct approximately 94-unit gaps (95 for S, 100 for M).

Plate parity counts glyphs within each word, including digits and punctuation; inline modifiers never consume a position. Each plate is a separate quadrilateral fitted to the glyph width plus 104 units, with a rising edge slope of 0.56 and enough lower clearance for wide capitals. A namespaced luminance mask subtracts only glyph ink, retaining counters and transparency on any background. All plates paint behind all glyphs. Neither a canvas color nor a font is needed for export.

The rook is independent of plate settings. Automatic placement selects the first L per word, otherwise the left middle glyph. `rook=on` can mark any letter; `rook=off` suppresses automatic placement without moving it elsewhere. It sits over the stem region, scales for narrow letters, and rises above its own plate when necessary. Bounds include plates, marks and glyph padding. O variants use their word position automatically; base/alt select the middle/last source O contour. The UI hides unsupported Solomon swash/dot controls and shows variant selection only for O.

## Extension guidance

Keep parsing independent from rendering. New styles should supply letter outlines, metrics, alternates, and rule behavior without changing the text grammar unnecessarily. The current engine contains style branches; there is not yet a generic external style-pack loader.

Reference art is comparison material. The editable renderer must continue to assemble its own glyphs and ornaments for both preset names and arbitrary names.

## Venator

`venator.ts` is dispatched by the shared renderer. Options `initial` and `diamonds` default true; `inscription` defaults false. `venator-paths.json` separates seven reference letters, inferred compact v and unseen characters, inferred shoulder alternates, diamonds and inscription. The reproducible Python extraction reuses the existing cubic-extrema utility, retains all source contours, and measures conservative 9-unit horizontal ink bands from densely sampled curves. No Python or font is required at runtime.

V uses the reference contour only at word starts when initial treatment is enabled, or when explicitly forced. `variant=base` suppresses the initial in favor of the inferred compact v; `variant=alt` explicitly selects the source V anywhere. Other first letters retain their normal shapes. Reference E/N/A/T/O/R have one evidenced form. Inferred alphabet alternates add a pointed shoulder. Interface values override inline values, and explicit `auto` falls through to global/contextual behavior.

Pair advances compare shared ink bands, adding 15 units at default spacing, and clamp tight tracking to 8 units of ink clearance. Word boundaries add 64 units. Native heights are retained, including the tall T and descending V. Bounds include actual glyph extrema and separate ornaments. With an initial V, ornaments keep the measured source horizontal offset and sit below the compact body. If another descending V intersects that row, the ornaments move below the ink. The first glyph's `ornament` modifier controls the diamond pair; the inscription is a global opt-in and stays enabled across text edits only if deliberately selected. Text edits clear letter overrides.

Transparent hit rectangles partition the preview between adjacent ink centers, so overlapping shoulders do not create competing hit regions. Glyph ink ignores pointer events. The existing letter strip provides equivalent selection for long names or small screens. Nonzero fill unions inferred components; reversed inner contours retain counters. Reference contours use even-odd fill. Exports contain paths only, with no font, image, background color or external definitions.

## Celeste

`celeste.ts` supplies the isolated renderer. It reuses `initial`, `swash`, `ornaments`, `swashLength`, tracking and overrides, without changing the parser. `celeste-paths.json` retains separately extracted source glyphs, three E forms, interior cutout/spindle contours, C dots, stars and two independent ribbon templates. `scripts/extract-celeste.py` also generates custom inferred curved-serif capitals, numerals, punctuation and compact C; it normalizes inferred component winding to union strokes while retaining counters. The existing cubic-extrema utility measures bounds.

Only glyph ID 0 receives the automatic initial; local initial settings work at any capital. C uses its original oversized contour; other initials scale their own outlines to 1.6 and disclose the initial treatment as inferred. Compact C is inferred. E contours advance through the three evidenced forms, holding the final form for subsequent occurrences. Letters rise along a 0.15 baseline slope capped at 200 units for very long or widely spaced input. Tracking clamps to six units of horizontal ink separation; word gaps add 72 units.

Interior source details combine with their glyph using native nonzero contour winding, preserving transparent fine cutouts. C dots subtract through a namespaced luminance mask. Inferred letters get a separate fitted spindle. The initial's ornament setting controls its stars/details; each word's last-letter setting controls that word's end stars. Other ornament settings control their own interior details. The first letter of each word controls its underline with `swash`; the UI exposes this field only there.

Ribbon bodies remap source control points to the composed word span, preserving the final 108 units of terminal width and native vertical contour thickness. Short spans below 500 units use shallow closed cubic ribbons to avoid tall loops. Bounds include all transformed detail/glyph extrema, stars and ribbon control hulls. Rendering uses paths and transparent masks only. No full-name reference SVG is inserted into the live composition or export.

## Violet

`violet.ts` shapes normalized AST glyphs independently of parsing. Each word's first alphabetic letter uses a capital; following letters use lowercase. Local `initial` can force either form. Source IDs, offsets, word indices and original uppercase characters remain unchanged. `shapeViolet` returns measured outlines, advances and entry/exit ports; the V/i/o/l/e/t forms retain split reference contours. Missing forms use outlined pressure ribbons from explicit cubic skeletons, generated by the standard-library `extract-violet.py` script. Ascender overhangs are independent of advances.

Connections require adjacent letters in the same word, reachable ports, tracking below +50 and no detached (`variant=base`) override. Port positions and tangent depths vary with form and pair; width tapers with tracking. Tight tracking clamps to an 8-unit advance reduction. Word boundaries and punctuation receive separate gaps and interrupt joins. Unconnected lowercase forms receive entry/exit strokes; the native V has no exit port. Capitals have their own inferred exits. `variant=alt` restores contextual eligibility without overriding boundary/reach checks.

`swash` controls extended V/t/endings; `swashLength` clamps to 0.4–2 for t crossbars and endings. Shortened V uses inferred geometry. `texture` adds deterministic transparent terminal wedges; local `ornament` overrides it. Native source wear stays in the contours. The crossbar is a separate outline with a fixed left shoulder and variable right reach. Bounds and wear masks include its complete transformed extent. Interface > inline > automatic/global precedence applies to every local setting, including explicit `auto`.

Disjoint transparent hit rectangles partition the preview horizontally; visible ink ignores pointer events. The button strip provides equivalent source-letter selection. Definitions are namespaced by the existing engine; exports contain filled outlines/masks only. Reference comparison alone loads the complete wordmark SVG. This controlled connection model permits intentional stroke overlaps and is not a complete script collision solver.

## Graves

`graves.ts` dispatches through the shared engine with style ID `graves`. `fractures` defaults true and `fractureIntensity` defaults 1; intensity clamps to 0.4–1 with non-finite inputs falling back to 1. `fracture=auto|on|off` is the sole new modifier, with interface > inline > global precedence. Explicit interface `auto` bypasses inline values. The UI exposes Automatic/Intact/Fractured and clears overrides on text edits.

`graves-paths.json` holds separate visible reference fragments, reconstructed intact envelopes, and explicit inferred components with measured bounds. Source compound R/A, V/E and E/S contours are clipped at disclosed reconstructed boundaries. Source placement and five negative/zero pair adjustments preserve the compact GRAVES preset; arbitrary pairs use positive clearance and tight tracking clamps. Cap masses vary naturally (G/S around 353 units, R/A/E around 264; V descends). Numerals and punctuation have independent geometry and bounds.

The first occurrence of each source letter selects its reference fracture mask. Other occurrences choose one of three patterns from character and occurrence, independent of syntax offsets or unrelated characters. Extraction densely samples each glyph's contours, finds connected horizontal/vertical ink runs, and fits restrained jagged cuts within those runs. Cuts stop before traversing the entire run; widths are capped at 4.2 units. Component counters use local even-odd filling; overlapping components remain solid.

Reference luminance masks retain native fragments at full intensity. Lower intensity grows their mask ink only within the reconstructed envelope. Inferred/repeat masks subtract the fitted paths. All black/white fills belong to definitions; visible lettering contains no background paint. Clip/mask IDs include the deterministic composition namespace and glyph ID. Identical specimens intentionally share equivalent definitions, following the existing engine contract. Exports remain outlines only, with no font or image dependency.
