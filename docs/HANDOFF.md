# Project handoff

Recorded 2026-10-04.

## Location and repository

- Working repository: `~/Programming/Personal/underworld-lettering`.
- GitHub: https://github.com/hmrguez/underworld-lettering
- Branch: `main`.
- Latest pushed commit when this handoff was written: `11c2300` — compact README overview and lettering close-ups.
- A separate original staging copy exists under `~/Documents/Codex/2026-10-04/let/outputs/letterpress`. Use the Personal repository for future product work.
- The original preview on port 5173 was started in the staging copy. Editing the Personal repository will not update that server. See `DEVELOPMENT.md`.

## What the user wants

A personal, experimental industrial / punk / underground logo lettering designer inspired by Valve's Deadlock hero presentation typography. Each hero has a different visual hand; a single generic font plus decoration does not meet the intent.

Agreed v1 decisions:

1. Rat King should be very close to the reference.
2. Support Rat King, Nurse Harrow, and Baba.
3. Combine global settings, letter-level overrides, and optional editable syntax.
4. Prefer automatic / simple controls over manual vector editing.
5. Support short names rather than paragraphs.
6. Use Svelte and instant updates rather than stroke-drawing animation.

The user liked the result and published it on GitHub. The most recent work fixed README screenshots that were tall, hard to read, and occasionally malformed by the capture tool.

## Implemented

- A lexer/parser for text, word boundaries, glyphs, modifiers, source offsets, and diagnostics.
- A deterministic SVG renderer with three styles and reference-derived outlines.
- Inferred angular brush capitals for Rat King letters missing from its source wordmark.
- Contextual R swashes, a first-word crown, explicit crown/star I dots, alternate glyph treatment, and style-specific ornaments.
- Settings for spacing, swash reach, ink, extra wear, and uneven Rat King letter heights.
- Per-letter selection through the preview and an equivalent letter button strip.
- Reference comparison, guides, parser inspection, and SVG download.
- Responsive interface, Svelte diagnostics, five behavior tests, static Vite build.
- Public README with usage, fidelity limits, attribution, and four PNG images.

## Fidelity boundaries

| Style        | Reference-derived letters  | Other letters                                         |
| ------------ | -------------------------- | ----------------------------------------------------- |
| Rat King     | R, A, T, K, I, N, G        | Custom inferred capitals; fallback digits/punctuation |
| Nurse Harrow | N, U, R, S, E, H, A, O, W  | Cormorant Garamond outlines                           |
| Baba         | A, B, including alternates | Rye outlines with additional decoration               |

The original source wordmarks are isolated SVGs obtained from DeadlockSkins.gg. They contain letters and ornaments, not complete font families. The app reconstructs spacing and composition; it cannot establish Valve's unseen glyph designs. The UI explicitly identifies inferred glyphs.

## Validation at handoff

- Last source validation: `npm run check` reported zero errors and warnings; all five `npm test` cases passed; `npm run build` succeeded.
- The later README/image-only changes did not alter application code.
- All four current README image URLs were verified to load on GitHub after the push.
- Untracked `.idea/` files were left untouched during the screenshot work. The working tree was clean before adding these handoff docs.

## Useful future work, not yet requested

- Refine inferred alphabets and compare a set of arbitrary names against each style's visual principles.
- Separate style metadata/rules from the shared renderer once new styles are added.
- Improve collision handling and geometry-derived bounds for long names, extreme tracking, and forced flourishes.
- Audit SVG definition IDs when multiple previews coexist on a page. The current renderer uses IDs based on glyph indices, while style cards and the main preview render multiple SVGs.
- Audit top-row Nurse Harrow clipping, crossing-stroke placement, and single-word flourish bounds.
- Verify the small-name cap and modifier handling at the 24-glyph boundary before expanding the grammar.
- Expand meaningful geometry/export coverage without writing tests that merely mirror implementation.

These are review candidates, not claims that all cases are broken or an authorization to expand scope.

## TypeScript and Bun migration (2026-10-04)

- Converted application modules, Svelte script, Vite config, and tests to strict TypeScript. Paths now end in `.ts`.
- Bun 1.4.2 is pinned in `.bun-version` and `package.json`; use `bun install --frozen-lockfile` and `bun run dev`.
- `bun.lock` replaces the npm lockfile, retaining existing resolutions except the requested TypeScript update and its tooling dependencies.
- TypeScript 7.0.2 is aliased as `@typescript/native`, alongside TypeScript 6.0.3 for Svelte compatibility. `bun run check` performs TypeScript 7 diagnostics.
- Tests use `bun:test`; `bun test` and `bun run build` run on Bun.
- Verified on Bun 1.4.2: zero check errors/warnings, all five tests passed, production build succeeded, all three styles inspected in the built editor, and 195 render comparisons plus 13 parser comparisons matched the pre-migration source exactly.

## Solomon addition (2026-10-04)

Added style ID `solomon`, preset, comparison SVG, independent plates and transparent reversal masks, odd/even phase per word, separate rook placement and global/inline/interface controls. The renderer is isolated in `src/lib/solomon.ts`; existing styles are preserved. Reference S/O/L/M/N and rook contours come from the inspected chessmaster SVG, with custom inferred capitals and Cormorant fallback digits. See [VISUAL-VERIFICATION.md](VISUAL-VERIFICATION.md) for provenance, fidelity limits, checks and visual evidence. The formerly referenced verification document was absent and has now been created.

All 16 tests and format/check/build pass. 450 existing-style SVG comparisons against HEAD match after normalizing definition namespaces. The actual editor download was validated as XML and displayed independently on dark, white and blue backgrounds. No lockfile, hosting, remote or license changes were made.

## Venator addition (2026-10-04)

Added style `venator` with extracted V/E/N/A/T/O/R, custom inferred lowercase-form geometry and numerals, contextual reference V versus compact inferred v, inferred shoulder alternates, independent diamonds and optional XLVIII. The renderer uses ink-band profiles, protected clearance and disjoint transparent hit targets. Inscription defaults off. Existing Solomon work and all earlier styles were preserved; 240 comparisons against the pre-task working tree matched after definition namespace normalization. No lockfile, hosting or remote changes.

Preview for this checkout: `http://127.0.0.1:5184/`. See [VISUAL-VERIFICATION.md](VISUAL-VERIFICATION.md) for the official Venator asset, source-contour extraction, validation evidence and inference limits.

## Celeste addition (2026-10-04)

Added style `celeste` with a preset, reference comparison, separate C/E/L/S/T outlines (three E forms), details/dots/stars and adaptive double ribbons. Contextual initial defaults to the first letter of the first word; explicit overrides can mark any capital. Other initials use their own enlarged geometry and inferred decoration; compact C is inferred. `initial`, `ornament`, and first-word-letter `swash` reuse existing modifier meanings and precedence. Text edits clear UI overrides.

Existing uncommitted Solomon and Venator work was retained. All 28 tests and format/check/build pass; 300 comparisons against the pre-task working tree preserve all five earlier styles after namespace normalization. Browser interactions and actual downloads were verified; 1,330 transformed path bounds fit. Preview **5186** is confirmed in this checkout. See [VISUAL-VERIFICATION.md](VISUAL-VERIFICATION.md) for provenance, fidelity limits, visual evidence and independent exports. No lockfile, hosting or remote changes.

## Violet addition (2026-10-04)

Added style `violet`, preset and verified artist-wordmark comparison. Visible V and lowercase i/o/l/e/t contours are split into editable forms, with an independent crossbar. Shoulder cuts, joins, contextual endings and all unseen forms are disclosed as reconstructed/inferred. Pressure-based outlines require no new font. Style shaping preserves uppercase AST characters, source offsets and IDs; first alphabetic letters per word become capitals. Connections use measured ports and pair-specific tangents, break at punctuation/digits/words, and disengage at +50 tracking. Extended strokes and extra brush wear have global and per-letter controls; text edits still clear interface overrides.

The six existing styles, including uncommitted Solomon/Venator/Celeste work, were preserved: 360 baseline comparisons matched after namespace normalization. All 33 tests and format/check/build pass. Full visual regression and actual exports are recorded in [VISUAL-VERIFICATION.md](VISUAL-VERIFICATION.md). Preview **5267** is verified in this checkout. No lockfile, hosting, remote, staging or license changes.

## Graves addition (2026-10-04)

Added style `graves`, preset, source comparison and separate glyph/fracture renderer. Visible G/R/A/V/E/S fragments come from the inspected official Graves poster and necro wordmark. Intact envelopes and shared source boundaries are reconstructed; other glyphs and three ink-fitted repeat patterns are inferred. Global fractures, restrained 40–100% intensity and local `fracture=auto|on|off` preserve precedence and override reset. Cracks use transparent masks, never canvas-colored paint.

All seven earlier styles and their uncommitted work were retained; **420** comparisons against the pre-task checkout matched after namespace normalization. All **40** tests and format/check/build pass. Full baseline/spacing regression, browser controls and six actual exports are recorded in [VISUAL-VERIFICATION.md](VISUAL-VERIFICATION.md). Preview **5278** is confirmed in this checkout. No lockfile, hosting, remote, staging or license changes.

Graves follow-up: split the shared V/E contour at its junction, restoring E’s upper-left fragment and removing it from V. Corrected intact forms and adjusted V width plus V/E kerning preserve source preset placement. Isolated/repeated V/E checks and updated export evidence are in the visual verification document.

## Rat King brush refinement (2026-10-04)

Reworked all 19 inferred capitals with broad pressure facets, split-bristle terminals, intermittent edge tears and measured ink bearings. Dense per-sample contour noise was removed; closed O/Q counters use opposite winding. The seven reference letters and other seven styles remain unchanged (default RAT KING plus 420 other-style comparisons). All 80 baseline specimens, 60 Rat King spacing/detail combinations and inferred alphabet close-ups were inspected in the browser. Format/check, 40 tests and build pass. Preview 5278 serves this checkout. See VISUAL-VERIFICATION.md for evidence and the download-event collection limitation; standalone live SVG contents were verified independently.

## Viscous addition (2026-10-04)

Added ninth style `viscous`, preset, source comparison and an isolated outline renderer. The visually inspected V/I/S/C/O/U source forms preserve native height/spacing, including two S shapes and three transparent O bubbles. Unseen capitals, digits, punctuation, pressure alternates and fitted holes outside O are custom inferred geometry. No rounded fallback font was added. Global `bubbles` and local `bubble=auto|on|off`, plus restrained supported variants, preserve precedence and text-edit reset.

All eight earlier styles remain intact: **480** pre-task SVG comparisons matched after definition namespace normalization. **45** tests and format/check/build pass. All **90** baseline specimens and **540** spacing/detail combinations were visually inspected, along with alphabet/repeats/alternates and six actual editor downloads. Browser selection, precedence, override reset, mobile and **2,335** path/selection bounds passed. Downloads parse as XML; 18 independent image instances over three backgrounds retain transparent holes. Full evidence/limits are in [VISUAL-VERIFICATION.md](VISUAL-VERIFICATION.md). Preview **5289**, PID **37378**, is verified in this checkout. No lockfile, hosting, remote, staging or existing-license changes.

For the next sequential style: no next hero has been selected. Continue these nine styles in the current architecture; first identify and inspect its actual artwork, then preserve a pre-task renderer snapshot for comparison. Read the Viscous extraction/renderer/tests as the latest isolated-style pattern, keeping automatic decoration narrow, explicit interface auto semantics, source/inferred disclosure and independent exports. Preserve local ignored evidence under `docs/verification/viscous/` and earlier evidence directories. The existing bundle-size advisory remains; Viscous does not change the runtime architecture.
