<script lang="ts">
  import { parse, MODIFIERS } from './lib/parser.ts';
  import { render, styles } from './lib/engine.ts';
  import type { ModifierKey, ModifierValues, Overrides } from './lib/parser.ts';
  import type { StyleId } from './lib/engine.ts';
  let style = $state<StyleId>('rat'),
    source = $state('RAT KING'),
    bubbles = $state(true),
    fractures = $state(true),
    fractureIntensity = $state(1),
    crown = $state(true),
    initial = $state(true),
    diamonds = $state(true),
    inscription = $state(false),
    plates = $state(true),
    platePhase = $state<'odd' | 'even'>('even'),
    rook = $state(true),
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
      bubbles,
      fractures,
      fractureIntensity,
      crown,
      initial,
      diamonds,
      inscription,
      plates,
      platePhase,
      rook,
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
    bubbles = true;
    fractures = true;
    fractureIntensity = 1;
    crown = true;
    initial = true;
    diamonds = true;
    inscription = false;
    plates = true;
    platePhase = 'even';
    rook = true;
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
        {:else if style === 'viscous'}
          <label class="toggle"
            ><span
              >Bubble cutouts <small>Three native holes inside O</small></span
            ><input type="checkbox" bind:checked={bubbles} /><span
              class="switch"
            ></span></label
          >
        {:else if style === 'graves'}
          <label class="toggle"
            ><span
              >Structural fractures <small>Transparent breaks in the ink</small
              ></span
            ><input type="checkbox" bind:checked={fractures} /><span
              class="switch"
            ></span></label
          >
        {:else if style === 'violet'}
          <label class="toggle"
            ><span
              >Extended strokes <small
                >V sweep, t crossbar and word endings</small
              ></span
            ><input type="checkbox" bind:checked={swash} /><span class="switch"
            ></span></label
          >
          <label class="toggle"
            ><span
              >Subtle brush wear <small
                >Selective transparent terminal scratches</small
              ></span
            ><input type="checkbox" bind:checked={texture} /><span
              class="switch"
            ></span></label
          >
        {:else if style === 'celeste'}
          <label class="toggle"
            ><span
              >Decorated initial <small>First letter of the name</small></span
            ><input type="checkbox" bind:checked={initial} /><span
              class="switch"
            ></span></label
          >
          <label class="toggle"
            ><span
              >Double underline <small>Follows each word’s width</small></span
            ><input type="checkbox" bind:checked={swash} /><span class="switch"
            ></span></label
          >
          <label class="toggle"
            ><span>Stars and interior details</span><input
              type="checkbox"
              bind:checked={ornaments}
            /><span class="switch"></span></label
          >
        {:else if style === 'venator'}
          <label class="toggle"
            ><span
              >Contextual V initial <small
                >Hooked reference V at word starts</small
              ></span
            ><input type="checkbox" bind:checked={initial} /><span
              class="switch"
            ></span></label
          >
          <label class="toggle"
            ><span
              >Diamonds <small>Independent pair beneath the name</small></span
            ><input type="checkbox" bind:checked={diamonds} /><span
              class="switch"
            ></span></label
          >
          <label class="toggle"
            ><span
              >XLVIII inscription <small>Reference-specific · optional</small
              ></span
            ><input type="checkbox" bind:checked={inscription} /><span
              class="switch"
            ></span></label
          >
        {:else if style === 'solomon'}
          <label class="toggle"
            ><span
              >Alternating plates <small>Restart with each word</small></span
            ><input type="checkbox" bind:checked={plates} /><span class="switch"
            ></span></label
          >
          <label
            >Plate phase <select bind:value={platePhase}
              ><option value="even">Even letters · 2, 4, 6</option><option
                value="odd">Odd letters · 1, 3, 5</option
              ></select
            ></label
          >
          <label class="toggle"
            ><span
              >Rook mark <small
                >First L, otherwise middle letter, per word</small
              ></span
            ><input type="checkbox" bind:checked={rook} /><span class="switch"
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
      {#if style === 'graves'}<label
          class="slider-label"
          for="fracture-intensity"
          ><span>Fracture intensity</span><output
            >{Math.round(fractureIntensity * 100)}%</output
          ></label
        ><input
          id="fracture-intensity"
          type="range"
          min="0.4"
          max="1"
          step="0.05"
          bind:value={fractureIntensity}
        />{/if}
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
      {#if (style === 'rat' || style === 'celeste' || style === 'violet') && swash}<label
          class="slider-label"
          for="length"
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
                  src={`${import.meta.env.BASE_URL}references/${style === 'viscous' ? 'viscous' : style === 'rat' ? 'ratking' : style === 'harrow' ? 'nurse' : style === 'solomon' ? 'solomon' : style === 'venator' ? 'venator' : style === 'celeste' ? 'celeste' : style === 'graves' ? 'graves' : style === 'violet' ? 'violet' : 'baba'}-wordmark.svg`}
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
            {#if selectedGlyph.char === 'R' && style !== 'solomon' && style !== 'venator' && style !== 'celeste' && style !== 'violet' && style !== 'graves' && style !== 'viscous'}<label
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
            {#if selectedGlyph.char === 'I' && style !== 'solomon' && style !== 'venator' && style !== 'celeste' && style !== 'violet' && style !== 'graves' && style !== 'viscous'}<label
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
            {#if style === 'viscous'}<label
                >Bubble cutouts<select
                  value={overrides[selectedGlyph.id]?.bubble ??
                    selectedGlyph.modifiers.bubble ??
                    'auto'}
                  onchange={(e) => override('bubble', e.currentTarget.value)}
                  ><option value="auto">Automatic</option><option value="off"
                    >Off</option
                  ><option value="on">On (fitted to ink)</option></select
                ></label
              >{/if}
            {#if style === 'graves'}<label
                >Fracture<select
                  value={overrides[selectedGlyph.id]?.fracture ??
                    selectedGlyph.modifiers.fracture ??
                    'auto'}
                  onchange={(e) => override('fracture', e.currentTarget.value)}
                  ><option value="auto">Automatic</option><option value="off"
                    >Intact</option
                  ><option value="on">Fractured</option></select
                ></label
              >{/if}
            {#if style === 'violet'}
              {#each ['initial', 'swash', 'ornament', 'variant'] as key (key)}
                <label
                  >{key === 'initial'
                    ? 'Capital form'
                    : key === 'swash'
                      ? 'Extended stroke'
                      : key === 'ornament'
                        ? 'Brush wear'
                        : 'Connection'}
                  <select
                    value={overrides[selectedGlyph.id]?.[key as ModifierKey] ??
                      selectedGlyph.modifiers[key as ModifierKey] ??
                      'auto'}
                    onchange={(e) =>
                      override(key as ModifierKey, e.currentTarget.value)}
                  >
                    <option value="auto">Automatic</option>
                    <option
                      value={key === 'variant'
                        ? 'alt'
                        : key === 'swash'
                          ? 'word'
                          : 'on'}
                      >{key === 'variant'
                        ? 'Contextual connection'
                        : 'On'}</option
                    >
                    <option value={key === 'variant' ? 'base' : 'off'}
                      >{key === 'variant' ? 'Detached' : 'Off'}</option
                    >
                  </select>
                </label>
              {/each}
            {/if}
            {#if style === 'celeste'}
              {#each ['initial', 'ornament', ...(ast.words[selectedGlyph.word]?.glyphs[0]?.id === selectedGlyph.id ? ['swash'] : [])] as key (key)}
                <label
                  >{key === 'initial'
                    ? 'Decorated initial'
                    : key === 'ornament'
                      ? 'Stars / details'
                      : 'Word underline'}<select
                    value={overrides[selectedGlyph.id]?.[key as ModifierKey] ??
                      selectedGlyph.modifiers[key as ModifierKey] ??
                      'auto'}
                    onchange={(e) =>
                      override(key as ModifierKey, e.currentTarget.value)}
                    ><option value="auto">Automatic</option><option
                      value={key === 'swash' ? 'word' : 'on'}>On</option
                    ><option value="off">Off</option></select
                  ></label
                >
              {/each}
            {/if}
            {#if style === 'venator'}
              {#if selectedGlyph.char === 'V'}<label
                  >V initial<select
                    value={overrides[selectedGlyph.id]?.initial ??
                      selectedGlyph.modifiers.initial ??
                      'auto'}
                    onchange={(e) => override('initial', e.currentTarget.value)}
                    ><option value="auto">Automatic</option><option value="on"
                      >On</option
                    ><option value="off">Off</option></select
                  ></label
                >{/if}
              {#if selectedGlyph.id === 0}<label
                  >Diamonds<select
                    value={overrides[selectedGlyph.id]?.ornament ??
                      selectedGlyph.modifiers.ornament ??
                      'auto'}
                    onchange={(e) =>
                      override('ornament', e.currentTarget.value)}
                    ><option value="auto">Automatic</option><option value="on"
                      >On</option
                    ><option value="off">Off</option></select
                  ></label
                >{/if}
            {/if}
            {#if style === 'solomon'}
              {#each ['plate', 'rook'] as key (key)}
                <label
                  >{key === 'plate' ? 'Plate' : 'Rook'}<select
                    value={overrides[selectedGlyph.id]?.[key as ModifierKey] ??
                      selectedGlyph.modifiers[key as ModifierKey] ??
                      'auto'}
                    onchange={(e) =>
                      override(key as ModifierKey, e.currentTarget.value)}
                    ><option value="auto">Automatic</option><option value="on"
                      >On</option
                    ><option value="off">Off</option></select
                  ></label
                >
              {/each}
            {/if}
            {#if (style !== 'solomon' && style !== 'venator' && style !== 'celeste' && style !== 'violet' && style !== 'graves' && style !== 'viscous') || (style === 'viscous' && (selectedGlyph.char === 'S' || (/^[A-Z]$/.test(selectedGlyph.char) && !'VICOUQ'.includes(selectedGlyph.char)))) || (style === 'solomon' && selectedGlyph.char === 'O') || (style === 'venator' && (selectedGlyph.char === 'V' || (/^[A-Z]$/.test(selectedGlyph.char) && !'ENATOR'.includes(selectedGlyph.char))))}
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
            {/if}
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
          >{#each style === 'viscous' ? ['VISCOUS', 'GUTTER', 'BUBBLE'] : style === 'rat' ? examples : style === 'harrow' ? ['NURSE HARROW', 'SISTER RAVEN', 'NIGHT WATCH'] : style === 'graves' ? ['GRAVES', 'GRAVEYARD', 'IRON WITCH'] : style === 'violet' ? ['VIOLET', 'VIVID', 'PAINT THE NIGHT'] : style === 'celeste' ? ['CELESTE', 'STAR LIGHT', 'MOON'] : style === 'venator' ? ['VENATOR', 'VIVID', 'NIGHT SHIFT'] : style === 'solomon' ? ['SOLOMON', 'IRON WITCH', 'RED MOON'] : ['BABA', 'BLACK BIRD', 'BONE'] as ex (ex)}<button
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
        {#if style === 'viscous'}<p class="fidelity">
            V, I, S (two forms), C, O and U retain source contours. All other
            letters, digits, punctuation, pressure alternates and forced bubbles
            outside O are custom inferred designs. Automatic bubbles affect O
            only; letter overrides can add a fitted hole. Unseen letters are not
            exact Valve reconstructions.
          </p>{/if}
        {#if style === 'graves'}<p class="fidelity">
            G, R, A, V, E, S retain visible reference fragments and their
            first-occurrence fractures. Intact bridges, shared boundaries,
            spacing, repeat patterns and all other glyphs are reconstructed or
            inferred.
          </p>{/if}
        {#if style === 'violet'}<p class="fidelity">
            V and lowercase i, o, l, e, t retain visible reference contours.
            Shoulder cuts, contextual joins and spacing are reconstructed; other
            forms are inferred.
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
            <code>bubble=on|off|auto</code> (Viscous) ·
            <code>fracture=on|off|auto</code> (Graves) ·
            <code>variant=base|alt|auto</code>
            ·
            <code>swash=word|off|auto</code>
            · <code>dot=crown|star|off|auto</code>
            · <code>initial=on|off|auto</code>
            · <code>plate=on|off|auto</code> · <code>rook=on|off|auto</code>
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
