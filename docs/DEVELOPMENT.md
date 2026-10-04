# Development, verification, and screenshots

## Work in the correct checkout

```sh
cd ~/Programming/Personal/underworld-lettering
bun install --frozen-lockfile
bun run dev
```

Requires Bun 1.4.2, pinned in `.bun-version` and `package.json`. `bun.lock` is the authoritative dependency lockfile, migrated from the original npm lockfile while preserving existing dependency resolutions. Vite and Svelte diagnostics run on Bun via `--bun`.

Application modules, tests, and Vite configuration use strict TypeScript. TypeScript 7.0.2 is installed under the `@typescript/native` alias; TypeScript 6.0.3 provides the compatibility API required by `svelte-check`. The check script uses `--tsgo` for Svelte and invokes the TypeScript 7 compiler directly for standalone modules. The inferred glyph generator remains a self-contained CommonJS utility and can be run with `bun scripts/design-rat-glyphs.cjs`.

The original port-5173 preview came from the staging copy under Documents/Codex. If it is still running, use a different port from this repository:

```sh
bun run dev -- --port 5174
```

Open the exact URL Vite prints. Do not assume the existing browser tab is serving this checkout. `node_modules` and `dist` were intentionally excluded when the Personal repository was created.

## Checks

```sh
bun run format  # Apply formatting after changes
bun run check   # Verify formatting, types, and lint
bun test
bun run build
```

`bun run typecheck`, `bun run lint`, and `bun run format:check` can also run individually. Prettier formats code and docs with Svelte support; ESLint uses recommended JavaScript, TypeScript, and Svelte rules. Generated outline JSON, reference artwork, build output, and IDE files are excluded.

Tests currently cover modifier parsing, incomplete/invalid input, the glyph cap, reference-letter coverage for the three presets, adaptive R behavior, override precedence, empty input, inferred letters, and deterministic dots/output.

For geometry or rule changes, also verify:

1. `RAT KING`, `NURSE HARROW`, and `BABA` against their source SVGs using Reference mode.
2. At least one arbitrary name using inferred glyphs, such as `RAVEN`.
3. An R swash globally disabled, locally forced, and locally suppressed.
4. `I[dot=crown]` and `I[dot=star]`, plus a UI override taking precedence.
5. Empty text and malformed modifiers without an editor crash.
6. Exported SVG in a separate viewer; it should not require any fonts.
7. Relevant narrow layouts and keyboard-accessible letter selection.

`bun run build` produces static files in `dist/`. Interface fonts currently load from Google Fonts; glyph rendering uses committed outlines and makes no network requests. There is no hosted runtime required by the app.

## README screenshot policy

Current images:

- `docs/screenshots/workshop.png`: 1085 × 800 compact editor overview.
- `docs/screenshots/rat-king.png`: 610 × 365 lettering close-up.
- `docs/screenshots/nurse-harrow.png`: 610 × 365 lettering close-up.
- `docs/screenshots/baba.png`: 610 × 240 lettering close-up.

The original full-page JPEGs were replaced because GitHub scaled them down, making tiny UI text unreadable and leaving excessive empty space. The first Baba capture was visibly malformed; a later full-page replacement also unnecessarily included the expanded parser.

Capture workflow that worked:

1. Set a consistent 1100 × 800 desktop capture surface when supported.
2. Reset/reload the page for each style; select the preset and scroll back to the top.
3. Close optional panels, and disable Reference/Guides unless they are the subject of the image.
4. Capture one image, then inspect the actual saved bytes before reusing them.
5. Keep one overview and crop the lettering area for style-specific images.
6. Restore temporary viewport overrides when finished.

The Codex in-app screenshot tool sometimes changed layout between captures or returned blank/malformed buffers. Its clip coordinates did not reliably produce the intended offset. Resetting/reloading between captures and capturing from x=0/y=0, followed by explicit image cropping, worked. Do not treat this as an application rendering bug without checking the live preview separately.

The current PNGs were encoded from the capture tool's JPEG output; conversion does not restore lost JPEG detail. If a future capture API supports native lossless PNG, use it.

At the working 1100 × 800 capture size, the source crop rectangles were:

| Image        | Left | Top | Width | Height |
| ------------ | ---- | --- | ----- | ------ |
| Overview     | 0    | 0   | 1085  | 800    |
| Rat King     | 400  | 250 | 610   | 365    |
| Nurse Harrow | 400  | 250 | 610   | 365    |
| Baba         | 400  | 310 | 610   | 240    |

Re-measure when the UI changes. Never use those coordinates blindly against another viewport.

## Git and publication

The remote is `https://github.com/hmrguez/underworld-lettering.git`, branch `main`. Before an authorized push, check working-tree changes and fetch the remote. Stage only task-related changes. Any `.idea/` files belong to the user's IDE setup.

The previous push permission covered the README screenshot fix. This handoff does not grant standing permission to push unrelated future changes.

No broad project license was chosen. Keep the README's third-party attribution and the SIL Open Font License texts in `public/references/`. Request a licensing decision if the user asks to apply a license to the repository.

## Solomon (2026-10-04)

The current verified preview serves this Personal checkout at `http://127.0.0.1:5182/`, started here with `bun run dev -- --port 5182 --strictPort`. Port 5174 was occupied, so a new port was used. Do not assume either older preview serves this checkout.

Run `python3 scripts/extract-solomon.py` to reproduce `src/lib/solomon-paths.json` from the bundled vector reference. Python's standard library is sufficient; the app still runs on Svelte/Vite/Bun and needs no Python at runtime. See [VISUAL-VERIFICATION.md](VISUAL-VERIFICATION.md) for the complete regression names, parity/rook checks, source-content verification and independent export results.

## Venator (2026-10-04)

The Venator verification preview was launched from this Personal repository on **5184**, with `bun run dev -- --port 5184 --strictPort`; process cwd was verified with `lsof`. Older preview servers were left intact. Run `python3 scripts/extract-venator.py` from the root to reproduce source contours, inferred outlines and ink profiles. The script uses Python's standard library and the existing Solomon bounds utility without running Solomon extraction.

Venator behavior tests live in `tests/venator.test.ts`. Check the contextual V against compact/base/forced-alternate V, the inferred alphabet and numerals, repeated stems and wide letters, independent diamonds/inscription, first-letter ornament overrides, and separate downloads. Reference inspection, fidelity limits and visual evidence are recorded in [VISUAL-VERIFICATION.md](VISUAL-VERIFICATION.md).

## Celeste (2026-10-04)

Preview **5186** serves this Personal checkout; `lsof -a -p 61905 -d cwd` verified the Vite process directory. Run `python3 scripts/extract-celeste.py` to reproduce the static geometry (Python standard library, with the existing Solomon extrema utility). No extraction dependency runs in the app.

`tests/celeste.test.ts` covers first-name initials, alternative/forced initials, interface/inline/global precedence including `auto`, independent ornaments and underlines, word-level suppression, control-hull bounds at ±1000 tracking and 0.4/1/2 reach, deterministic masks and export-safe outlines. Follow the Celeste additions in [VISUAL-VERIFICATION.md](VISUAL-VERIFICATION.md) for contact sheets and actual standalone downloads. The new README close-up is 610 × 365 and was rendered from the editor download, then inspected directly; earlier screenshots were preserved.

## Violet (2026-10-04)

Preview **5267** was launched from this Personal checkout with `--strictPort`; `lsof -a -p 65341 -d cwd` confirmed the directory. Older previews were preserved. Run `python3 scripts/extract-violet.py` to reproduce the static geometry from `public/references/violet-wordmark.svg`. The script reuses the existing cubic-extrema utility and requires only standard Python; no runtime font or extraction dependency was added.

`tests/violet.test.ts` covers word shaping, normalized IDs/offsets, source/inferred disclosures, native and inferred-capital joins, punctuation/digit/word boundaries, pair-specific paths, detached forms, spacing/disengagement, initial/extension/wear precedence including `auto`, malformed/empty input, determinism and safe SVG output. See [VISUAL-VERIFICATION.md](VISUAL-VERIFICATION.md) for artwork analysis, contact sheets, browser selection/override checks and actual independent exports. The new README close-up is 610 × 365; all earlier images remain intact.

## Graves (2026-10-04)

Preview **5278** serves this Personal checkout; `lsof -a -p 69162 -d cwd` verified the Vite process directory. Existing previews were preserved. Run `python3 scripts/extract-graves.py` to reproduce the static source fragments, reconstructed intact envelopes, inferred glyphs and fitted cut paths (standard Python plus the existing Solomon bounds helper; no runtime dependency).

`tests/graves.test.ts` covers source disclosure, stable pattern selection, occurrence variation, override precedence including explicit automatic, transparent masks, unique definitions/reference resolution, bounded cut widths and finite viewBoxes at extreme tracking/intensity. Run all four standard checks. See [VISUAL-VERIFICATION.md](VISUAL-VERIFICATION.md) for the complete style regression, actual editor downloads and transparent alpha checks. The added README close-up is an inspected **610 × 240** raster of the actual preset download; prior screenshots are preserved.

## Viscous (2026-10-04)

Preview **5289** was launched from this Personal checkout with `bun run dev -- --port 5289 --strictPort`; `lsof -a -p 37378 -d cwd` confirmed its directory. Older preview servers were preserved. Run `python3 scripts/extract-viscous.py` from the repository root to regenerate source forms, inferred outlines, pressure alternates and fitted bubbles. It uses standard Python and the existing Solomon cubic-extrema helper; no runtime dependency or new font was added.

`tests/viscous.test.ts` covers source placement/disclosure, uneven heights, contextual and forced S forms, bubble precedence including explicit auto, supported glyphs, protected tight spacing, malformed/empty input, deterministic masks and export safety. Run all four standard checks. Verification used bundled Playwright because `agent-browser` was absent; Chromium needed sandbox escalation. See [VISUAL-VERIFICATION.md](VISUAL-VERIFICATION.md) for complete regression, actual downloads and independently inspected exports. The README close-up is **610 × 240**, flattened onto the workshop background from the actual preset download and inspected. Earlier screenshots remain unchanged.

## Paradox (2026-10-04)

The existing preview **5289**, PID **37378**, was reused after `lsof -a -p 37378 -d cwd` confirmed this Personal checkout. Older servers were untouched. Run `python3 scripts/extract-paradox.py` to reproduce extracted source contours, inferred geometry, fitted counters and sampled side profiles. It uses standard Python and isolated helper definitions from the existing extraction scripts, without executing those scripts or modifying their outputs.

`tests/paradox.test.ts` covers native preset positions, source/inferred disclosure, selective solid letters, contextual A forms, counter/variant precedence including explicit auto, safe tight spacing, deterministic transparent definitions and malformed/empty input. Run all four standard checks. Browser verification used bundled Playwright because `agent-browser` was unavailable; Chromium required sandbox escalation. See [VISUAL-VERIFICATION.md](VISUAL-VERIFICATION.md) for complete regression and six actual independent editor downloads. The added README close-up is an inspected **610 × 240** raster flattened onto the workshop background from the preset download; all earlier screenshots remain untouched.

## Paige (2026-10-04)

Preview **5289**, PID **37378**, was reused after `lsof -a -p 37378 -d cwd` confirmed this Personal checkout. Run `python3 scripts/extract-paige.py` from the repository root to reproduce the source contours, custom inferred alphabet, enlarged initials, frame and sampled profiles. It uses standard Python and isolated bounds/profile helper definitions from existing scripts without running their extraction or modifying earlier packs. JSON regeneration was verified byte-identical.

`tests/paige.test.ts` covers native source bearings, independent initial/frame controls, first-alphabetic context, interface/inline/global precedence including explicit auto, frame clearance around dots/descenders/forced initials, interior-frame bearings, preserved border thickness, arbitrary tight spacing, determinism and malformed/empty input. All four standard checks pass with **56 tests**. See [VISUAL-VERIFICATION.md](VISUAL-VERIFICATION.md) for the complete eleven-style regression and eight actual independent downloads. Browser verification used bundled Playwright because agent-browser was unavailable; Chromium required sandbox escalation. The added README close-up is an inspected **610 × 365** raster from the actual preset download; prior screenshots are preserved.
