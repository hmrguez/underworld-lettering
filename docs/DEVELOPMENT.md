# Development, verification, and screenshots

## Work in the correct checkout

```sh
cd ~/Programming/Personal/underworld-lettering
npm ci
npm run dev
```

Requires Node.js 20.19+ or 22.12+ for Vite. Use a current Node release supporting the JSON import attributes used by the renderer and tests.

The original port-5173 preview came from the staging copy under Documents/Codex. If it is still running, use a different port from this repository:

```sh
npm run dev -- --port 5174
```

Open the exact URL Vite prints. Do not assume the existing browser tab is serving this checkout. `node_modules` and `dist` were intentionally excluded when the Personal repository was created.

## Checks

```sh
npm run check
npm test
npm run build
```

Tests currently cover modifier parsing, incomplete/invalid input, the glyph cap, reference-letter coverage for the three presets, adaptive R behavior, override precedence, empty input, inferred letters, and deterministic dots/output.

For geometry or rule changes, also verify:

1. `RAT KING`, `NURSE HARROW`, and `BABA` against their source SVGs using Reference mode.
2. At least one arbitrary name using inferred glyphs, such as `RAVEN`.
3. An R swash globally disabled, locally forced, and locally suppressed.
4. `I[dot=crown]` and `I[dot=star]`, plus a UI override taking precedence.
5. Empty text and malformed modifiers without an editor crash.
6. Exported SVG in a separate viewer; it should not require any fonts.
7. Relevant narrow layouts and keyboard-accessible letter selection.

`npm run build` produces static files in `dist/`. Interface fonts currently load from Google Fonts; glyph rendering uses committed outlines and makes no network requests. There is no hosted runtime required by the app.

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

| Image | Left | Top | Width | Height |
| --- | --- | --- | --- | --- |
| Overview | 0 | 0 | 1085 | 800 |
| Rat King | 400 | 250 | 610 | 365 |
| Nurse Harrow | 400 | 250 | 610 | 365 |
| Baba | 400 | 310 | 610 | 240 |

Re-measure when the UI changes. Never use those coordinates blindly against another viewport.

## Git and publication

The remote is `https://github.com/hmrguez/underworld-lettering.git`, branch `main`. Before an authorized push, check working-tree changes and fetch the remote. Stage only task-related changes. Any `.idea/` files belong to the user's IDE setup.

The previous push permission covered the README screenshot fix. This handoff does not grant standing permission to push unrelated future changes.

No broad project license was chosen. Keep the README's third-party attribution and the SIL Open Font License texts in `public/references/`. Request a licensing decision if the user asks to apply a license to the repository.
