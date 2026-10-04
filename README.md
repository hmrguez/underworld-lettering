# Underworld Lettering

An experimental typography workshop for industrial, punk, underground wordmarks. Type a short name, choose a hand, and see an SVG composition update instantly.

Built with **Svelte 5**, **Vite**, and a small lexer/parser and vector layout engine. Inspired by the individual hero wordmarks in Valve’s *Deadlock*.

![Underworld lettering editor with Rat King live preview](docs/screenshots/workshop.png)

## Features

- Three distinct lettering packs: **Rat King**, **Nurse Harrow**, and **Baba**.
- Instant previews for names of up to 24 letters or digits.
- An R leg that adapts to the width of its word.
- Crowns, decorative I dots, alternate letters, uneven heights, spacing, and ink controls.
- Global switches and per-letter overrides, from the preview or letter selector.
- Optional inline syntax and visible parser output.
- Side-by-side reference comparison and layout guides.
- Standalone SVG export with embedded outlines; exported lettering needs no installed fonts.

## Run locally

Requires Node.js **20.19+ or 22.12+** and npm.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite.

```sh
npm run check   # Svelte diagnostics
npm test        # Parser, layout rules, and override precedence
npm run build   # Static production build in dist/
```

The production output can be hosted by any static web server. Rendering runs entirely in the browser. Interface fonts currently load from Google Fonts; the lettering engine does not make network requests.

## Letter-level syntax

Type plain text or attach settings immediately after a letter:

```text
R[swash=word]AT KI[dot=crown]NG
R[swash=off]AVEN
I[dot=star]
B[variant=alt]ABA
```

| Setting | Values |
| --- | --- |
| `swash` | `auto`, `word`, `off` |
| `dot` | `auto`, `crown`, `star`, `off` |
| `variant` | `auto`, `base`, `alt` |
| `ornament` | `auto`, `on`, `off` |

Multiple settings can share a bracket, separated by commas. Settings apply when the style and letter support them. Interface overrides take precedence over inline settings; inline settings take precedence over automatic behavior. Editing the source clears interface overrides.

Input supports A–Z, digits, spaces, hyphens, and apostrophes. Lowercase is normalized to uppercase. Invalid syntax produces a diagnostic while valid letters continue to render.

## Three hands

### Rat King

Angular brushwork, fractured edges, an adaptive R swash, and a crown. R, A, T, K, I, N, and G use reference-derived vector outlines. Other capitals use inferred brush designs; digits and punctuation use fallback outlines.

![Close-up of Rat King lettering with an adaptive R swash and crown](docs/screenshots/rat-king.png)

### Nurse Harrow

Tall, high-contrast serifs, two-line compositions for multiple words, and an R flourish crossing into the lower line. N, U, R, S, E, H, A, O, and W come from the reference; missing glyphs use Cormorant Garamond outlines.

![Close-up of Nurse Harrow lettering with its crossing R flourish](docs/screenshots/nurse-harrow.png)

### Baba

Decorated slab letters, folk ornaments, and alternate A/B shapes. A and B use reference-derived outlines. Other glyphs use Rye outlines with additional decorative treatment.

![Close-up of Baba lettering with folk ornaments](docs/screenshots/baba.png)

## How it works

```text
source text
    ↓
lexer → tokens and source positions
    ↓
parser → words, glyphs, modifiers, diagnostics
    ↓
style pack → outlines, metrics, alternate shapes
    ↓
layout + contextual rules → flourishes and ornaments
    ↓
SVG → instant preview / export
```

- `src/lib/parser.js`: lexer, parser, validation, and modifiers.
- `src/lib/engine.js`: style selection, layout, contextual flourishes, and SVG generation.
- `src/lib/reference-paths.json`: extracted reference paths.
- `src/lib/inferred-rat-paths.json`: inferred angular brush capitals.
- `src/lib/fallback-paths.json`: precomputed fallback font outlines.
- `scripts/design-rat-glyphs.cjs`: regenerates the inferred Rat King capitals.
- `src/App.svelte`: editor, preview, settings, and export.
- `tests/engine.test.js`: parsing and rendering behavior checks.

The renderer composes glyph geometry rather than swapping in a finished name image. Flourishes respond to the surrounding word; the same engine renders presets and arbitrary input.

## Scope and fidelity

This is a personal v1 experiment, not a complete reconstructed font family. Original hero names are close to the references. Letters absent from those references are inferred, and the interface labels them. Spacing and some ornament placement are reconstructed. There is no manual Bézier editor, font uploader, or OpenType font export.

## References and attribution

- Visual direction and original hero lettering: **Valve**, [Deadlock — City Never Sleeps](https://www.playdeadlock.com/cityneversleeps).
- Isolated reference SVGs: [DeadlockSkins.gg](https://deadlockskins.gg/blog/deadlock-city-never-sleeps-update), stored in `public/references/`.
- Fallback outline sources: [Cormorant Garamond](https://github.com/google/fonts/tree/main/ofl/cormorantgaramond), [Rye](https://github.com/google/fonts/tree/main/ofl/rye), and [Sedgwick Ave](https://github.com/google/fonts/tree/main/ofl/sedgwickave). SIL Open Font License texts are included in `public/references/`.
- Interface fonts: Barlow Condensed and IBM Plex Mono via Google Fonts.

This project is unofficial and is not affiliated with Valve. Bundled reference artwork and reference-derived glyphs remain third-party material; this repository does not claim ownership of them or grant a license to them. No blanket license is applied to the repository.
