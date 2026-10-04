<script lang="ts">
  import { parse, MODIFIERS } from './lib/parser.ts';
  import { render, styles } from './lib/engine.ts';
  import type { ModifierKey, ModifierValues, Overrides } from './lib/parser.ts';
  import type { StyleId } from './lib/engine.ts';
  let style = $state<StyleId>('rat'),
    source = $state('RAT KING'),
    crown = $state(true),
    swash = $state(true),
    ornaments = $state(true),
    texture = $state(false),
    irregular = $state(true),
    tracking = $state(0),
    swashLength = $state(1),
    color = $state('#eee6d1'),
    overrides = $state<Overrides>({}),
    selected = $state<number | null>(null),
    guides = $state(false),
    compare = $state(false),
    advanced = $state(false),
    notice = $state('');
  let ast = $derived(parse(source));
  let result = $derived(
    render(ast, {
      style,
      crown,
      swash,
      ornaments,
      texture,
      irregular,
      tracking,
      swashLength,
      color,
      overrides,
    }),
  );
  let pack = $derived(styles.find((s) => s.id === style)!);
  let selectedGlyph = $derived(ast.glyphs.find((g) => g.id === selected));
  function switchStyle(id: StyleId) {
    style = id;
    source = styles.find((s) => s.id === id)!.sample;
    overrides = {};
    selected = null;
    tracking = 0;
    swashLength = 1;
    texture = false;
    irregular = true;
    crown = true;
    swash = true;
    ornaments = true;
  }
  function edit(event: Event & { currentTarget: HTMLTextAreaElement }) {
    source = event.currentTarget.value;
    overrides = {};
    selected = null;
    notice = '';
  }
  function select(event: MouseEvent | KeyboardEvent) {
    const g =
      event.target instanceof Element
        ? event.target.closest<SVGElement>('[data-glyph]')
        : null;
    if (g) selected = Number(g.dataset.glyph);
  }
  function selectKey(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      select(event);
    }
  }
  function override<K extends ModifierKey>(key: K, value: string) {
    if (
      selected === null ||
      !(MODIFIERS[key] as readonly string[]).includes(value)
    )
      return;
    overrides = {
      ...overrides,
      [selected]: { ...overrides[selected], [key]: value as ModifierValues[K] },
    };
  }
  function exportSVG() {
    let exportText = result.svg.replace(
      / role="button" tabindex="0" aria-label="[^"]*"/g,
      '',
    );
    let url = URL.createObjectURL(
      new Blob([exportText], { type: 'image/svg+xml' }),
    );
    let a = document.createElement('a');
    a.href = url;
    a.download = `${style}-${
      ast.glyphs
        .map((g) => g.char)
        .join('')
        .toLowerCase() || 'lettering'
    }.svg`;
    a.click();
    URL.revokeObjectURL(url);
    notice = 'SVG exported.';
  }
  const examples = ['RAT KING', 'RAVEN', 'NIGHT SHIFT', 'GUTTER'];
</script>

<svelte:head><title>Underworld — Lettering workshop</title></svelte:head>
<div class="app" style:--accent={pack.accent}>
  <header>
    <div class="brand">
      <span class="brand-symbol">✳</span> UNDERWORLD<span class="edition"
        >LETTERING WORKSHOP / V.01</span
      >
    </div>
    <div class="header-right">
      <span class="live-dot"></span><span>LIVE VECTOR ENGINE</span><button
        class="export"
        onclick={exportSVG}
        disabled={result.empty}>Export SVG <span>↗</span></button
      >
    </div>
  </header>
  <main>
    <aside class="controls">
      <div class="section-label">01 / THE LETTERS</div>
      <label for="name" class="input-label">Give it a name.</label>
      <textarea
        id="name"
        rows="3"
        spellcheck="false"
        value={source}
        oninput={edit}
        aria-describedby="input-help"
        maxlength="500"></textarea>
      <div class="input-bottom">
        <span id="input-help">Short names. Big personality.</span><span
          >{ast.glyphs.length}/24</span
        >
      </div>
      {#if ast.errors.length}<div class="errors" role="alert">
          {#each ast.errors as error (error)}<p>{error.message}</p>{/each}
        </div>{/if}
      <div class="section-label styles-label">02 / THE HAND</div>
      <div class="style-list">
        {#each styles as s (s.id)}
          <button
            class:active={style === s.id}
            class="style-card"
            onclick={() => switchStyle(s.id)}
            aria-pressed={style === s.id}
          >
            <span class="style-number">{s.number}</span>
            <div class="style-sample">
              {@html render(parse(s.sample), {
                style: s.id,
                color: style === s.id ? '#eee6d1' : '#b3b5a8',
                texture: false,
              }).svg}
            </div>
            <span class="style-info"
              ><strong>{s.name}</strong><small>{s.description}</small></span
            ><span class="radio-dot"></span>
          </button>
        {/each}
      </div>
      <div class="section-label rules-label">03 / THE DETAILS</div>
      <div class="rules">
        {#if style === 'rat'}
          <label class="toggle"
            ><span>Crown <small>Above the first word</small></span><input
              type="checkbox"
              bind:checked={crown}
            /><span class="switch"></span></label
          >
          <label class="toggle"
            ><span>Extended R leg <small>Follows the word’s width</small></span
            ><input type="checkbox" bind:checked={swash} /><span class="switch"
            ></span></label
          >
          <label class="toggle"
            ><span>Uneven letter heights</span><input
              type="checkbox"
              bind:checked={irregular}
            /><span class="switch"></span></label
          >
          <label class="toggle"
            ><span>Extra ink wear</span><input
              type="checkbox"
              bind:checked={texture}
            /><span class="switch"></span></label
          >
        {:else if style === 'harrow'}
          <label class="toggle"
            ><span
              >Crossing R flourish <small>Reaches into the lower line</small
              ></span
            ><input type="checkbox" bind:checked={swash} /><span class="switch"
            ></span></label
          >
        {:else}
          <label class="toggle"
            ><span>Folk ornaments <small>Crown and side flourishes</small></span
            ><input type="checkbox" bind:checked={ornaments} /><span
              class="switch"
            ></span></label
          >
        {/if}
      </div>
      <label class="slider-label" for="spacing"
        ><span>Letter spacing</span><output
          >{tracking > 0 ? '+' : ''}{tracking}</output
        ></label
      ><input
        id="spacing"
        type="range"
        min="-35"
        max="60"
        step="1"
        bind:value={tracking}
      />
      {#if style === 'rat' && swash}<label class="slider-label" for="length"
          ><span>Swash reach</span><output
            >{Number(swashLength).toFixed(2)}×</output
          ></label
        ><input
          id="length"
          type="range"
          min="0.5"
          max="1.5"
          step="0.05"
          bind:value={swashLength}
        />{/if}
      <div class="ink">
        <span>Ink</span>
        <div>
          {#each ['#eee6d1', '#d9543c', '#95a25a', '#83a8a1'] as c (c)}<button
              style:background={c}
              class:chosen={color === c}
              aria-label={`Use ink ${c}`}
              aria-pressed={color === c}
              onclick={() => (color = c)}
            ></button>{/each}<label class="custom-color"
            ><input
              type="color"
              bind:value={color}
              aria-label="Custom ink color"
            />+</label
          >
        </div>
      </div>
    </aside>
    <section class="workbench" aria-label="Lettering preview and overrides">
      <div class="bench-toolbar">
        <span
          ><span class="live-dot"></span>
          {pack.name.toUpperCase()} / LIVE PREVIEW</span
        >
        <div>
          <button
            class:pressed={compare}
            onclick={() => (compare = !compare)}
            aria-pressed={compare}>Reference</button
          ><button
            class:pressed={guides}
            onclick={() => (guides = !guides)}
            aria-pressed={guides}>Guides <span>⌗</span></button
          >
        </div>
      </div>
      <div class="canvas" class:guides class:baba={style === 'baba'}>
        <span class="corner top-left"></span><span class="corner top-right"
        ></span><span class="corner bottom-left"></span><span
          class="corner bottom-right"
        ></span>
        <span class="canvas-meta"
          >SPECIMEN {pack.number} <span> / </span>
          {compare ? 'REFERENCE + COMPOSITION' : 'CUSTOM LETTERING'}</span
        >
        {#if result.empty}<p class="empty">
            Your next name starts here.<small
              >Type a short name in the box.</small
            >
          </p>{:else}
          <div class="composition" class:split={compare}>
            <!-- svelte-ignore a11y_no_noninteractive_element_interactions (Events delegate to focusable SVG glyph buttons; the letter bar provides equivalent controls.) -->
            <div
              class="render-wrap"
              role="group"
              aria-label="Select a letter in the preview"
              onclick={select}
              onkeydown={selectKey}
            >
              {@html result.svg}{#if compare}<span class="image-label"
                  >YOUR COMPOSITION</span
                >{/if}
            </div>
            {#if compare}<div class="reference-wrap">
                <img
                  src={`/references/${style === 'rat' ? 'ratking' : style === 'harrow' ? 'nurse' : 'baba'}-wordmark.svg`}
                  alt={`${pack.name} source wordmark`}
                /><span class="image-label">SOURCE WORDMARK</span>
              </div>{/if}
          </div>
        {/if}
        <div class="canvas-footer">
          <span
            >{ast.glyphs.length} GLYPHS <span>·</span>
            {ast.words.length} WORDS</span
          ><span>SVG / SCALABLE OUTLINES</span>
        </div>
      </div>
      <div class="under-canvas">
        <span class="hint">↖ Select a letter to override its details.</span
        ><button class="reset" onclick={() => switchStyle(style)}
          >Reset specimen ↺</button
        >
      </div>
      <div class="glyph-bar" aria-label="Choose a letter">
        {#each ast.glyphs as g (g.id)}<button
            class:selected={selected === g.id}
            onclick={() => (selected = selected === g.id ? null : g.id)}
            aria-label={`Select ${g.char}, letter ${g.id + 1}`}
            aria-pressed={selected === g.id}
            >{g.char}<small>{g.id + 1}</small></button
          >{/each}
      </div>
      {#if selectedGlyph}
        <div class="override-panel">
          <div>
            <span class="section-label">LETTER {selectedGlyph.id + 1}</span>
            <h2>{selectedGlyph.char} <span>Local overrides</span></h2>
          </div>
          <div class="override-fields">
            {#if selectedGlyph.char === 'R'}<label
                >Swash<select
                  value={overrides[selectedGlyph.id]?.swash ??
                    selectedGlyph.modifiers.swash ??
                    'auto'}
                  onchange={(e) => override('swash', e.currentTarget.value)}
                  ><option value="auto">Automatic</option><option value="word"
                    >Extend</option
                  ><option value="off">Off</option></select
                ></label
              >{/if}
            {#if selectedGlyph.char === 'I'}<label
                >Dot<select
                  value={overrides[selectedGlyph.id]?.dot ??
                    selectedGlyph.modifiers.dot ??
                    'auto'}
                  onchange={(e) => override('dot', e.currentTarget.value)}
                  ><option value="auto">Automatic</option><option value="crown"
                    >Crown</option
                  ><option value="star">Star</option><option value="off"
                    >Off</option
                  ></select
                ></label
              >{/if}
            <label
              >Letter variant<select
                value={overrides[selectedGlyph.id]?.variant ??
                  selectedGlyph.modifiers.variant ??
                  'auto'}
                onchange={(e) => override('variant', e.currentTarget.value)}
                ><option value="auto">Automatic</option><option value="base"
                  >Base</option
                ><option value="alt">Alternate</option></select
              ></label
            >
            <button
              class="text-button"
              onclick={() => {
                const next = { ...overrides };
                delete next[selectedGlyph.id];
                overrides = next;
              }}>Clear overrides</button
            >
          </div>
        </div>
      {:else}
        <div class="try-strip">
          <span>TRY A NAME</span
          >{#each style === 'rat' ? examples : style === 'harrow' ? ['NURSE HARROW', 'SISTER RAVEN', 'NIGHT WATCH'] : ['BABA', 'BLACK BIRD', 'BONE'] as ex (ex)}<button
              onclick={() => {
                source = ex;
                overrides = {};
                selected = null;
              }}>{ex} ↗</button
            >{/each}
        </div>
      {/if}
      <div class="engine-notes">
        <div class="section-label">IN THE COMPOSITION</div>
        <div class="rule-chips">
          {#each result.applied as rule (rule)}<span><i></i>{rule.label}</span
            >{/each}{#if !result.applied.length}<span>Base letter shapes</span
            >{/if}
        </div>
        {#if result.inferred.length}<p class="fidelity">
            Inferred glyphs: {result.inferred.join(', ')}. These are matching
            designs, not traced reference letters.
          </p>{:else if !result.empty}<p class="fidelity">
            All letters in this name use reference-derived outlines.
          </p>{/if}
      </div>
      <button
        class="advanced-button"
        aria-expanded={advanced}
        onclick={() => (advanced = !advanced)}
        ><span>{advanced ? '−' : '+'} Advanced syntax & parser</span><span
          >OPTIONAL</span
        ></button
      >
      {#if advanced}<div class="advanced">
          <p>
            Add settings after a letter: <code
              >R[swash=word]AT KI[dot=crown]NG</code
            >. Local settings take priority over global toggles.
          </p>
          <p>
            <code>variant=base|alt|auto</code> ·
            <code>swash=word|off|auto</code>
            · <code>dot=crown|star|off|auto</code>
          </p>
          <pre>{JSON.stringify(
              {
                words: ast.words.map((w) =>
                  w.glyphs.map((g) => ({
                    letter: g.char,
                    settings: { ...g.modifiers, ...overrides[g.id] },
                  })),
                ),
                errors: ast.errors,
              },
              null,
              2,
            )}</pre>
        </div>{/if}
    </section>
  </main>
  <footer>
    <span>UNDERWORLD <span>/</span> AN EXPERIMENT IN LETTERING</span><span
      >Reference art: Valve · <a
        href="https://www.playdeadlock.com/cityneversleeps"
        target="_blank"
        rel="noreferrer">Deadlock ↗</a
      ></span
    >
  </footer>
  {#if notice}<div class="toast" role="status">
      {notice}<button onclick={() => (notice = '')} aria-label="Dismiss"
        >×</button
      >
    </div>{/if}
</div>
