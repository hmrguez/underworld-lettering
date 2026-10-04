# Visual verification

## Baseline procedure

For every glyph geometry or style change, inspect all styles using `RAT KING`, `NURSE HARROW`, `BABA`, `RAVEN`, `NIGHT SHIFT`, `GUTTER`, `IRON WITCH`, `RED MOON`, `BLACK THORN`, and `ABBA`. Compare each reference preset with the original Deadlock artwork and bundled isolated SVG. Keep inferred letters identified. Exercise spacing at -35 / 0 / +60, ornament/flourish switches and inline/UI precedence. Check empty and malformed input, keyboard selection, and standalone exports on more than one background. A build alone does not verify typography.

For Solomon, additionally inspect `SOLOMON` with even / odd phase, plates disabled, rook disabled, repeated `OOOO LLLL` / `IIII WWWW`, `ABBA ABBA`, wide letters with forced plates, all inferred capitals and fallback digits. Verify parity restarts at word boundaries, modifiers do not change parity, and each plate fits its own glyph. Check forced and suppressed plate/rook settings with global switches off. Edit text after a UI override and confirm that the override clears.

## Solomon reference analysis — 2026-10-04

The [official update page](https://www.playdeadlock.com/cityneversleeps) and actual downloaded image contents were inspected. Asset names and even alt labels cannot establish their contents:

- `hero_solomon.webp` contains **Deadman Danny**.
- `hero_deadman_danny.webp` contains **Rat King**.
- `hero_rat_king.webp` contains **Baba**.
- [hero_baba.webp?v=2](https://cdn.fastly.steamstatic.com/apps/deadlock/images/react/cityneversleeps/hero_baba.webp?v=2) contains **Solomon**.
- Nurse Harrow's asset agrees with its contents.

Solomon uses tall, narrow, heavy serif capitals with thin connecting strokes and slightly irregular native outlines. The O has a very narrow vertical counter. There are roughly 94 units of spacing around capitals at a 430-unit cap height. The original plates are at positions 2, 4, 6, each behind an O, with rising slanted top/bottom edges. The short crenellated rook is above the L's stem, independent of those plates.

The [isolated chessmaster SVG](https://deadlockskins.gg/hero-art-provisional/chessmaster-wordmark.svg), linked from [DeadlockSkins.gg's update article](https://deadlockskins.gg/blog/deadlock-city-never-sleeps-update), was verified to contain SOLOMON. It is bundled as `public/references/solomon-wordmark.svg`. Its three compound plate paths contain O silhouette cutouts; three separate paths supply the counters. Extraction retains these contours and the S/L/M/N/rook paths. The renderer constructs plates afresh; it does not reuse a finished word image.

Reference-derived: **S, O, L, M, N**, three O variants, rook. Inferred: **A, B, C, D, E, F, G, H, I, J, K, P, Q, R, T, U, V, W, X, Y, Z**, punctuation. Digits use narrowed Cormorant Garamond fallback outlines under the existing bundled OFL notice. Spacing and plate geometry are reconstructed, and regularized; their native wobble is not copied. Unseen glyphs are matching designs, not exact reconstructions of Valve's alphabet. Default SOLOMON closely follows the source; arbitrary names have less certain fidelity.

## Recorded results

- `bun run format`, `bun run check`, `bun test` (16 passing tests), and `bun run build` succeeded.
- The preview was launched from `/Users/hmrguez/Programming/Personal/underworld-lettering` on port **5182**, with `--strictPort`; Vite confirmed this checkout. Existing preview servers were untouched.
- All 40 baseline specimens (10 names × 4 styles) were rendered and visually inspected. Existing styles retain their distinct silhouettes and ornament behavior. All four presets were compared with their vector sources and the verified official hero artwork.
- 450 SVG comparisons of existing styles against HEAD, covering the regression names, -35/0/+60 spacing, decoration switches and forced/suppressed R swashes, matched after normalizing the deterministic definition namespace. No existing glyph/layout geometry changed.
- Another 60 existing-style specimens were visually inspected across all regression names at -35 spacing with details disabled and +60 spacing with details enabled. Existing tight-spacing overlaps remain consistent with the prior renderer.
- Additional Solomon specimens cover phase, repeated letters, -35/+60 spacing, independent switches, forced plates on wide letters, the full inferred alphabet, punctuation and digits. No viewport cropping was observed. Rooks on plated letters rise above their plates so they remain distinct.
- Browser interaction confirmed default plates at IDs 1/3/5, odd phase at IDs 0/2/4/6, UI override effects, and clearing of those overrides on text edit. Reference mode displays the correct source SVG.
- The **actual editor-downloaded** `solomon-solomon.svg` parsed as standalone XML, contained no text/font/image dependency, and had selection button semantics removed. It was opened as independent `<img>` elements on dark, white and blue backgrounds. O cutouts remained transparent and counters retained the ink color. Light ink on white naturally has low contrast; choose darker ink for a light background.

The following saved contact sheets were inspected directly. In the comparison sheet, composition is left and source is right; each is fitted independently, so relative display size is not a metric comparison.

- [Preset comparison](verification/solomon/comparison.png)
- [Rat King regression set](verification/solomon/rat.png)
- [Nurse Harrow regression set](verification/solomon/harrow.png)
- [Baba regression set](verification/solomon/baba.png)
- [Solomon regression set](verification/solomon/solomon.png)
- [Solomon phase, spacing, switches, alphabet and repeats](verification/solomon/solomon-extra.png)

Original and reference-derived artwork remains Valve's third-party material. Existing font notices remain bundled; no blanket repository license is asserted.

## Venator reference analysis — 2026-10-04

The actual [official Venator poster](https://cdn.fastly.steamstatic.com/apps/deadlock/images/react/oldgods/splash_venator.png), found in the DOM of [Old Gods, New Blood](https://www.playdeadlock.com/oldgods), was downloaded and inspected. It shows the priest and **Venator**, with small diamonds and **XLVIII** below the compact letters. The [isolated priest SVG](https://deadlockskins.gg/hero-wordmarks/priest.svg), linked by [DeadlockSkins.gg's update article](https://deadlockskins.gg/blog/deadlock-old-gods-new-blood-update), was inspected separately and matches that wordmark. It is bundled as `public/references/venator-wordmark.svg`; the editable renderer never inserts that complete SVG as its lettering output.

The source is a single compound path. `scripts/extract-venator.py` separates its individual letter contours, counters and native wear, retaining the original outlines. One E wear contour is out of source order, immediately after T; extraction explicitly reassigns it to E. Reference-derived: **V, E, N, A, T, O, R**, the diamond pair, and XLVIII inscription. Only the hooked initial V is evidenced. Inferred: **B, C, D, F, G, H, I, J, K, L, M, P, Q, S, U, W, X, Y, Z**, compact interior **v**, digits and punctuation, and pointed-shoulder alternates for the inferred alphabet. No new fallback font or commercial blackletter font is used; existing bundled font notices remain untouched.

The construction is a large hooked capital V followed by dense lowercase-form blackletter: heavy stems, broken/angled bowls, narrow vertical counters, wedge shoulders and pointed terminals. T has its own tall ascender. The V treatment selects separate geometry at word starts; other first letters keep their own shapes. Base forces compact inferred v; alternate forces the source V at any position. Source E/N/A/T/O/R have only one evidenced variant. The inferred geometry is deliberately cleaner and more regular than the worn source letters; it is a structural interpretation, not Valve's unseen alphabet.

Spacing is reconstructed from conservative horizontal ink bands. Default spacing is a little wider than the source to retain clearance; -35 tightens it while preserving an 8-unit minimum gap. Ornaments follow the compact body's baseline and measured initial-V horizontal offset. A collision check moves them below forced/interior descending V shapes. XLVIII defaults off and is never implicitly attached to arbitrary input. Local `ornament` settings on the first glyph control diamonds, independently of inscription.

### Venator verification results

- `bun run format`, `bun run check` (zero Svelte errors/warnings, typecheck and lint), `bun test` (**23 passing**) and `bun run build` succeeded.
- Preview **5184** was launched with `--strictPort` from this Personal checkout. `lsof` confirmed its process cwd. Older servers and the existing Solomon work were preserved.
- All **50 baseline specimens** (10 names × 5 styles) were inspected, along with **80 existing-style spacing/detail specimens** (-35 disabled flourish/ornaments, +60 enabled), **60 Venator spacing/switch specimens** (-35/0/+60 with details off/on), and additional Venator source/base/alternate, narrow/wide repeat, inferred alphabet, numeral, independent ornament and ±1000-spacing specimens. No new viewport cropping or closed counters was observed. Prior tight-spacing overlaps in existing styles remain unchanged.
- All five presets were compared with their isolated vector sources and the actual original poster contents. Prior asset filename mismatches were respected: Rat King is in the Danny asset, Baba in the Rat King asset, Solomon in the Baba asset.
- **240 existing-style SVG comparisons** against the pre-task working tree matched after normalizing definition namespaces, preserving uncommitted Solomon behavior as well as Rat King, Nurse Harrow and Baba.
- Browser interactions verified V initial off/on, UI override superseding inline off, clearing that override on source edits, and keyboard selection of an SVG hit target at -35 tracking. Repeated I/L hit regions measured approximately 74–101 screen pixels in the inspected desktop view; the existing letter strip remains available for smaller displays. Reference mode loads the correct Venator SVG.
- The actual editor download was saved as [export.svg](verification/venator/export.svg), parsed as standalone XML and inspected through independent browser image elements on dark, white and blue backgrounds using [exports.html](verification/venator/exports.html). It contains seven outlined glyphs, two diamonds and the optional inscription, with no text, font, image, script, or external rendering dependency. Selection button semantics are removed. Counters and wear remain transparent. Light ink has low contrast on white, as expected.
- The new README close-up is **610 × 240**, rendered from the actual downloaded SVG and inspected directly. Existing overview and style screenshots were retained.

Saved visual evidence:

- [Five preset comparisons](verification/venator/comparison.png)
- Baseline sheets: [Rat King](verification/venator/rat.png), [Nurse Harrow](verification/venator/harrow.png), [Baba](verification/venator/baba.png), [Solomon](verification/venator/solomon.png), [Venator](verification/venator/venator.png)
- Spacing/details: [Rat King](verification/venator/rat-extremes.png), [Nurse Harrow](verification/venator/harrow-extremes.png), [Baba](verification/venator/baba-extremes.png), [Solomon](verification/venator/solomon-extremes.png), [Venator](verification/venator/venator-extremes.png)
- [Venator variants, repeats, inferred geometry, ornaments and extreme spacing](verification/venator/venator-extra.png)

Valve artwork and reference-derived contours retain their third-party attribution. No lockfile, remote, hosting, or license changes were made.

## Celeste reference analysis — 2026-10-04

The actual [official Celeste poster](https://cdn.fastly.steamstatic.com/apps/deadlock/images/react/oldgods/splash_celeste.png) on [Old Gods, New Blood](https://www.playdeadlock.com/oldgods) was downloaded and inspected. The separate [unicorn SVG](https://deadlockskins.gg/hero-wordmarks/unicorn.svg), linked by [DeadlockSkins.gg's article](https://deadlockskins.gg/blog/deadlock-old-gods-new-blood-update), was inspected against the poster. It is bundled as `public/references/celeste-wordmark.svg` for comparison only.

The source has a single compound path with 27 contours. `scripts/extract-celeste.py` separates **C, E, L, S, T**, three E contours, the initial's five dots, interior spindle/cutout details, stars and two ribbon templates. Original nonzero contour winding matters: painting the interior contours separately loses the thin transparent slots. The renderer recombines only a glyph and its local detail; dots subtract with a transparent luminance mask. Stars remain separate.

Reference-derived: **C, E, L, S, T**, three E forms and the source ornaments/ribbon templates. Inferred: **A, B, D, F, G, H, I, J, K, M, N, O, P, Q, R, U, V, W, X, Y, Z**, numerals, punctuation, compact C, non-C initial treatments and extra spindle details. No new fallback font is used. Missing capitals are narrow curved-serif designs with flared stems and contrasting connectors, distinct from Harrow's font fallback and Baba's slabs. Other initials use their own enlarged silhouette rather than replacing the letter with C. These are interpretations of an unseen alphabet, not exact Valve letters.

The first letter of the first word receives the default initial. `initial` applies to any capital with interface > inline > automatic/global precedence, including explicit `auto`. Local `ornament` settings govern interior details and, on the initial/final glyph, their associated stars. A word's first-letter `swash` controls its double underline independently. Global switches expose initial, ornaments and underline; the reach slider adjusts the ribbon span.

The composition preserves source heights and an ascending baseline, capped for extreme spacing. Spacing clamps to six units of horizontal ink separation. Multiple words retain separate ribbon pairs. The source ribbon control points remap to the word width while preserving vertical thickness and the final 108 units of terminal width. Short spans use shallower cubic curves to avoid hooks or loops. Bounds include glyph/detail extrema, all stars, and every ribbon control hull. Adaptive short underlines, arbitrary-name spacing and star placement are reconstructed, so they do not exactly reproduce a hypothetical Valve composition.

### Celeste verification results

- `bun run format`, `bun run check` (zero Svelte errors/warnings, types and lint), `bun test` (**28 passing**) and `bun run build` succeeded. Vite reports its bundle-size advisory; all six contour packs are included in the static client bundle.
- Preview **5186** was launched here with `--strictPort`. `lsof` verified process **61905** has cwd `/Users/hmrguez/Programming/Personal/underworld-lettering`. Older previews were untouched.
- **300 existing-style SVG comparisons** against a snapshot of the pre-task working tree matched after definition namespace normalization. This includes the user's uncommitted Solomon and Venator work, not just committed HEAD.
- All **60 baseline specimens** (10 names × 6 styles) were inspected. All six presets were compared with their isolated vector sources and the actual original artwork. Previously downloaded original poster contents were inspected again for Rat King, Nurse Harrow, Baba, Solomon and Venator; asset filename mismatches were respected.
- All **240 spacing/detail specimens** (10 names × 6 styles × -35/+60 × details disabled/enabled) were inspected. Existing tight-spacing overlaps are unchanged. Celeste's source preset, compact C, forced interior C, alternative initials, narrow/wide repeats, multiple words, inferred alphabet/numerals, ornament combinations, ±1000 spacing and 0.4/2 reach were inspected. Visual review prompted corrections to short ribbons, source interior contour composition and inferred component winding.
- Browser checks verified UI settings supersede inline `off`, all three overrides clear on text edits, reference comparison loads the Celeste SVG, and word-underline controls appear only on the word's first glyph. Mobile was inspected at 390 × 844. **1,330 transformed visible path bounds** fit inside their viewBoxes across Celeste baseline, spacing/detail and extra specimens.
- Actual editor downloads for **CELESTE**, **STAR LIGHT**, and **I** parse as standalone XML, contain outlines/masks only, and have no text/image/font/script dependency or interactive button/tabindex semantics. They loaded independently as browser `<img>` elements on dark, white and blue backgrounds. Counters, dots and slots remain transparent; pale ink naturally has low contrast on white.
- The new README close-up is **610 × 365**, rendered from the actual editor download and inspected directly. Existing screenshots were preserved.

Saved evidence (composition left/source right in the comparison; independent fitting is not a metric comparison):

- [Six preset comparisons](verification/celeste/comparison.png)
- Baseline: [Rat King](verification/celeste/rat.png), [Nurse Harrow](verification/celeste/harrow.png), [Baba](verification/celeste/baba.png), [Solomon](verification/celeste/solomon.png), [Venator](verification/celeste/venator.png), [Celeste](verification/celeste/celeste.png)
- Spacing/details: [Rat King](verification/celeste/rat-extremes.png), [Nurse Harrow](verification/celeste/harrow-extremes.png), [Baba](verification/celeste/baba-extremes.png), [Solomon](verification/celeste/solomon-extremes.png), [Venator](verification/celeste/venator-extremes.png), [Celeste](verification/celeste/celeste-extremes.png)
- [Celeste initials, switches, repeats, alphabet, numerals and reach](verification/celeste/celeste-extra.png)
- [Independent export viewer](verification/celeste/exports.html), [preset SVG](verification/celeste/export.svg), [inferred-name SVG](verification/celeste/export-inferred.svg), [short-name SVG](verification/celeste/export-short.svg)

Valve artwork and reference-derived geometry remain third-party material. Bundled font license notices remain intact. No lockfile, hosting or remote changes were made.

## Violet reference analysis — 2026-10-04

The actual [official Violet poster](https://cdn.fastly.steamstatic.com/apps/deadlock/images/react/cityneversleeps/hero_violet.webp) from [City Never Sleeps](https://www.playdeadlock.com/cityneversleeps) was downloaded and inspected. It shows the painter with a large brush and the lettering **Violet**, with the descriptors Ambitious, Nimble and Creative. The separate [artist wordmark SVG](https://deadlockskins.gg/hero-art-provisional/artist-wordmark.svg), linked from [DeadlockSkins.gg's article](https://deadlockskins.gg/blog/deadlock-city-never-sleeps-update), was also rendered and inspected against that poster. Filename/alt text alone was not used as evidence. The verified vector is bundled as `public/references/violet-wordmark.svg` for comparison.

The V has a deep narrow vertex and an exceptionally long rising right arm; it is deliberately separate from the following i. Lowercase forms lean forward, with broad descending strokes, light rising shoulders and compact open counters. The l ascends far above the body. The t has an ascending stem, a long nearly horizontal crossbar and a broad rounded lower turn. Dry-brush detail concentrates at the V's upper tip, crossbar tip and selected endings rather than evenly distressing every letter.

The main SVG path contains the connected **iolet** outline and its counters. `scripts/extract-violet.py` retains its exterior/counter segments, reconstructs short cuts between shoulders, separates the t crossbar and keeps the V and i dot contours. Reference-derived: **capital V**, **lowercase i, o, l, e, t**, including native wear. Inferred: every other capital and lowercase form, digits, punctuation, shortened V, connection geometry, entry/exit variants and extra wear. The unseen forms use explicit cubic stroke skeletons, forward shear and direction-dependent ribbon pressure, with no font substitution. They are cleaner and more regular than the source hand, and remain an interpretation of Valve's unseen alphabet.

The renderer retains the uppercase AST and shapes each word's first alphabetic letter as a capital. Local `initial` can force capital/lowercase at any letter. Capital and ascender ink overhang is independent of advance. Measured ports, reach checks and pair-dependent tangents connect eligible shoulders; word/punctuation/digit boundaries break them. `variant=base` adds clearance and detaches both adjacent joins. Tracking keeps default spacing connected, clamps excessively tight advances, tapers connections as spacing increases and disengages at +50 (including the UI maximum +60). Disengaged lowercase forms receive separate entries/endings. Long t crossbars can intentionally overlap subsequent ascenders; this is a controlled script model, not a complete collision solver.

Global extended strokes/extra brush wear and local initial/swash/ornament/connection settings preserve interface > inline > automatic/global precedence, including explicit `auto`. Native reference wear remains when extra wear is disabled. The reach slider controls crossbar/end-stroke reach; the extended-stroke switch selects the source V or an inferred shorter V. Letter selection still uses source IDs/characters. Transparent selection rectangles partition the preview; the letter strip provides equivalent selection for tall overhangs or small screens.

### Violet verification results

- `bun run format`, `bun run check` (zero Svelte errors/warnings, types and lint), `bun test` (**33 passing**) and `bun run build` succeeded. Vite retains its static bundle-size advisory; no lockfile change was made.
- Preview **5267** was launched with `--strictPort`. `lsof` confirmed process **65341** has cwd `/Users/hmrguez/Programming/Personal/underworld-lettering`. Existing previews were preserved.
- **360 existing-style SVG comparisons** against a snapshot of the pre-task working tree matched after namespace normalization, including the uncommitted Solomon, Venator and Celeste work.
- All **70 baseline specimens** (10 names × 7 styles) and **280 spacing/detail specimens** (-35/+60, extended strokes/ornaments disabled/enabled) were inspected. All seven presets were compared with their isolated sources and actual original artwork. Rat King/Baba/Solomon asset-name mismatches were respected. Existing tight-spacing overlaps remain unchanged.
- Additional Violet review covered VIOLET, VIVID, narrow/wide repeated letters, single-letter words, all 26 capital forms, the lowercase alphabet, numerals, hyphens/apostrophes, forced lowercase V, detached o, ±1000 tracking, 0.4/2 reach and brush wear with maximum reach. Review prompted corrections to inferred advance/port positions, inferred-capital connections, wide-spacing disengagement and crossbar mask coverage. No viewport cropping was observed in the final specimens.
- Browser checks confirmed keyboard selection of glyph ID 2, interface overrides superseding inline capital/wear/extension suppression, clearing those overrides after text edits, and the correct reference SVG. Desktop and 390 × 844 mobile surfaces were inspected. Visible transformed path bounds, wear-mask containment and disjoint positive-width hit rectangles were checked across the Violet specimen set.
- Actual editor downloads for **VIOLET**, **PAINT THE NIGHT**, **V**, and **VIOLET at +60 tracking** parsed as standalone XML and loaded independently as 12 browser image elements on dark, white and blue backgrounds. They contain filled outlines/masks with no text/image/font/script dependency or interactive button/tabindex semantics. Counters and wear remain transparent; pale ink naturally has low contrast on white.
- The README close-up is **610 × 365**, rendered from the actual downloaded preset and inspected directly. Earlier overview and close-ups were preserved.

Saved evidence (comparison fits composition/source independently):

- [Seven preset comparisons](verification/violet/comparison.png)
- Baseline: [Rat King](verification/violet/rat.png), [Nurse Harrow](verification/violet/harrow.png), [Baba](verification/violet/baba.png), [Solomon](verification/violet/solomon.png), [Venator](verification/violet/venator.png), [Celeste](verification/violet/celeste.png), [Violet](verification/violet/violet.png)
- Spacing/details: [Rat King](verification/violet/rat-extremes.png), [Nurse Harrow](verification/violet/harrow-extremes.png), [Baba](verification/violet/baba-extremes.png), [Solomon](verification/violet/solomon-extremes.png), [Venator](verification/violet/venator-extremes.png), [Celeste](verification/violet/celeste-extremes.png), [Violet](verification/violet/violet-extremes.png)
- [Violet repeats, modifiers, spacing, alphabet and reach](verification/violet/violet-extra.png), [capital forms](verification/violet/violet-capitals.png)
- [Independent export viewer](verification/violet/exports.html), [preset SVG](verification/violet/export.svg), [inferred-name SVG](verification/violet/export-inferred.svg), [single V SVG](verification/violet/export-short.svg), [disconnected-spacing SVG](verification/violet/export-wide.svg)

Valve artwork and reference-derived contours remain third-party material. Existing bundled font attribution/license notices remain intact. No blanket artwork license, hosting change, remote push or staging was performed.

## Graves reference analysis — 2026-10-04

The actual [official Graves poster](https://cdn.fastly.steamstatic.com/apps/deadlock/images/react/oldgods/splash_graves.png) from [Old Gods, New Blood](https://www.playdeadlock.com/oldgods) and the [isolated necro vector](https://deadlockskins.gg/hero-wordmarks/necro.svg), linked from [DeadlockSkins.gg's article](https://deadlockskins.gg/blog/deadlock-old-gods-new-blood-update), were downloaded and inspected. The poster shows Graves with pale hair, a dark jacket, green necromancy effects and the fractured GRAVES lettering. The verified comparison vector is bundled as `public/references/graves-wordmark.svg`; the renderer assembles separate glyphs rather than inserting the finished wordmark.

Broad serif masses, compact overlapping pairs, a triangular A counter, small R bowl, deep V vertex and compressed E distinguish Graves from Baba's ornamental slabs. The fracture network uses unequal angles and thicknesses: G has small detached chips, R's diagonal crack meets its bowl, A's top and left foot break separately, V has a stepped arm break, and S breaks around its curved joins. Surface nicks and irregular outline edges are incidental texture, not the structural fracture switch. No random wear filter is added.

Source fragments: **G, R, A, V, E, S**. Source paths cross the R/A, V/E and E/S boundaries; those boundaries are reconstructed and clipped. Intact envelopes reconnect the structural gaps with explicit solid geometry while retaining source fragments, and are disclosed as reconstructions. Missing **B, C, D, F, H, I, J, K, L, M, N, O, P, Q, T, U, W, X, Y, Z**, all numerals and punctuation are custom inferred heavy serif outlines. Repeated source letters also use reconstructed intact envelopes plus inferred cuts. No new font is bundled and no exact unseen alphabet is claimed.

The first occurrence of each source letter preserves its reference fractures at full intensity. Later occurrences and inferred glyphs select from three curated horizontal/vertical jagged cut patterns using character and occurrence. Dense contour sampling fits each template to a connected ink run, stopping inside the mass and limiting cut width to 4.2 units. This restrained construction protects counters and narrow parts; it is cleaner and simpler than the reference's large detached fragments. It is not a complete procedural destruction model. Tiny punctuation reuses a safe orientation when another orientation has no safe run.

Global **Structural fractures** and **Fracture intensity** (40–100%, default 100%) accompany per-letter Automatic / Intact / Fractured and the narrow syntax `fracture=auto|off|on`. Explicit interface automatic bypasses inline values; text edits clear interface overrides. Intact removes structural breaks, while native small contour irregularities remain. Existing swash/dot/ornament/variant modifiers have no Graves meaning and are hidden from its local controls. Transparent luminance masks and glyph clips contain all fracture operations; no background-colored paint, font, image or external rendering resource is exported.

### Graves verification results

- `bun run format`, `bun run check` (zero Svelte errors/warnings, types and lint), `bun test` (**40 passing**) and `bun run build` succeeded. The existing Vite static bundle-size advisory remains; no lockfile change was made.
- Preview **5278** was launched here with `--strictPort`; `lsof` verified process **69162** has cwd `/Users/hmrguez/Programming/Personal/underworld-lettering`. The occupied 5273 preview and all older servers were preserved.
- **420 existing-style comparisons** against a snapshot of the pre-task working tree matched after namespace normalization, including uncommitted Solomon, Venator, Celeste and Violet work. All **80 baseline specimens** (10 names × 8 styles) and **320 spacing/detail specimens** (-35/+60, switches off/on) were inspected. Graves' detail specimens use fractures off/on; earlier styles exercise their existing ornament/flourish switches. Existing tight-spacing overlaps remain unchanged.
- All eight presets were compared with their vector sources and actual original poster contents. Rat King/Baba/Solomon asset-name mismatches were respected. Graves extras cover GRAVES, repeats, narrow/wide forms, all inferred capitals, numerals/punctuation, mixed intact/fractured letters, 40/100% intensity, -35/+60 and ±1000 spacing. Review prompted solid intact envelopes, clearer 6/8/9 forms, a corrected Y fork and a separate mobile intensity row.
- Browser checks passed for interface > inline > global precedence including explicit automatic, forcing fractures with the global switch off, text-reset, keyboard selection and the correct reference image. Desktop and 390 × 844 mobile were inspected. **534 glyph selection bounds** fit in the inspected Graves viewBoxes; **69 raster specimens** have fully transparent viewport borders, with no new cropping observed.
- Six actual editor downloads (preset, intact, inferred name, mixed treatment, narrow/wide repeats and dark ink) parse as standalone XML. They contain no text/font/image/script or selection button/tabindex dependency. **17 independent browser images** load on dark, white, blue and gray backgrounds. Light ink naturally has low contrast on white; the dark-ink export makes its cracks clearly visible on light surfaces.
- Raster alpha checks found **11,967 fully transparent pixels** where the intact export has solid ink. The preset's alpha mean difference against the isolated source is **0.3858/255** after aligning to the source dimensions; this supports close preset geometry, not exact raster/poster identity. Shared boundaries and reconstructed placement account for small differences. The inspected README close-up is **610 × 240**, rendered from the actual preset download. Earlier screenshots are preserved.

Saved evidence (comparison fits composition/source independently):

- [Eight preset comparisons](verification/graves/comparison.png), [inspected original posters](verification/graves/posters.png)
- Baseline: [Rat King](verification/graves/rat.png), [Nurse Harrow](verification/graves/harrow.png), [Baba](verification/graves/baba.png), [Solomon](verification/graves/solomon.png), [Venator](verification/graves/venator.png), [Celeste](verification/graves/celeste.png), [Violet](verification/graves/violet.png), [Graves](verification/graves/graves.png)
- Spacing/details: [Rat King](verification/graves/rat-extremes.png), [Nurse Harrow](verification/graves/harrow-extremes.png), [Baba](verification/graves/baba-extremes.png), [Solomon](verification/graves/solomon-extremes.png), [Venator](verification/graves/venator-extremes.png), [Celeste](verification/graves/celeste-extremes.png), [Violet](verification/graves/violet-extremes.png), [Graves](verification/graves/graves-extremes.png)
- [Graves intact/fractured, repeats, alphabet and spacing](verification/graves/graves-extra.png), [editor](verification/graves/editor.png), [controls](verification/graves/controls.png), [mobile](verification/graves/mobile-top.png)
- [Independent export viewer](verification/graves/exports.html), [export screenshot](verification/graves/exports.png), [preset SVG](verification/graves/export.svg), [intact SVG](verification/graves/export-intact.svg), [inferred-name SVG](verification/graves/export-inferred.svg), [mixed SVG](verification/graves/export-mixed.svg), [repeats SVG](verification/graves/export-repeats.svg), [dark-ink SVG](verification/graves/export-dark-ink.svg)

Valve artwork and reference-derived contours remain third-party material, obtained via the attributed sources above. Existing bundled font license notices remain untouched. No blanket artwork license, hosting change, remote push, staging or unrelated-file overwrite was performed.

### Graves V/E contour correction — 2026-10-04

The shared source contour included both V’s upper-right serif and E’s upper-left fragment. It is now split at their junction, so standalone V no longer includes the E shoulder and standalone E retains it. Both intact envelopes were corrected. V’s measured width and V/E kerning changed together, preserving the reference positions of V, E and S in GRAVES. A regression test checks fragment ownership and preset positions.

The 40 tests, format/check/build, 420 existing-style comparisons, all 80 baseline specimens, browser precedence/reset checks and independent exports were rechecked. Additional [isolated V/E ownership specimens](verification/graves/ownership.png) cover V, E, VE, EV, repeated letters and GRAVES in both intact and fractured forms. Updated raster checks found 11,967 transparent crack pixels and a source alpha mean difference of 0.3858/255; all 69 inspected raster viewports retain transparent borders. Shared contour boundaries and intact forms remain reconstructions.
