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

| Style | Reference-derived letters | Other letters |
| --- | --- | --- |
| Rat King | R, A, T, K, I, N, G | Custom inferred capitals; fallback digits/punctuation |
| Nurse Harrow | N, U, R, S, E, H, A, O, W | Cormorant Garamond outlines |
| Baba | A, B, including alternates | Rye outlines with additional decoration |

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
