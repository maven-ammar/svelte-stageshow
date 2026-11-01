<script lang="ts">
  import { Bar, BrandMark, Facepile, Follow, Popover, Stage, Text, Window, type Act, type Point, type Rect } from 'svelte-stageshow'
  import './figma.css'

  // Figma: select a button layer, drag its fill's hue in the color picker and
  // watch the button change live, while Maya's cursor drifts around nearby.
  // Loops by undoing the change (cmd+z) and deselecting.

  type S = {
    hover: boolean
    selected: boolean
    picker: boolean
    hue: number
    dragging: boolean
    /** Maya's cursor; null is her resting spot */
    maya: Point | null
  }

  // The fill keeps its saturation and brightness; only the hue is dragged
  const SAT = 0.66
  const VAL = 0.97
  const HUE_FROM = 252
  const HUE_TO = 336

  function hex(h: number) {
    const f = (n: number) => {
      const k = (n + h / 60) % 6
      return VAL - VAL * SAT * Math.max(0, Math.min(k, 4 - k, 1))
    }
    return [f(5), f(3), f(1)].map((c) => Math.round(c * 255).toString(16).padStart(2, '0')).join('').toUpperCase()
  }

  // Maya's cursor waypoints, in canvas fractions resolved against the canvas rect
  const MAYA = {
    rest: { x: 0.8, y: 0.3 },
    a: { x: 0.86, y: 0.46 },
    b: { x: 0.74, y: 0.36 },
    c: { x: 0.6, y: 0.1 },
    d: { x: 0.47, y: 0.13 },
    e: { x: 0.62, y: 0.27 },
  }

  const initial: S = { hover: false, selected: false, picker: false, hue: HUE_FROM, dragging: false, maya: null }

  function mayaAt(c: { x: number; y: number; width: number; height: number }, p: Point): Point {
    return { x: c.x + c.width * p.x, y: c.y + c.height * p.y }
  }

  async function script(a: Act<S>) {
    const maya = (p: Point) => a.set({ maya: mayaAt(a.rect('canvas'), p) })
    await a.wait(500)
    maya(MAYA.a)

    // 1. Select the button on the canvas
    a.mark('select')
    await a.move({ at: 'button', x: 0.82, y: 0.7 })
    await a.set({ hover: true })
    await a.wait(350)
    await a.click()
    await a.set({ hover: false, selected: true })
    maya(MAYA.b)
    await a.wait(900)

    // 2. Open its fill
    a.mark('fill')
    await a.move('fill-swatch')
    await a.wait(150)
    await a.click()
    await a.set({ picker: true })
    maya(MAYA.c)
    await a.wait(700)

    // 3. Drag the hue; the button follows live
    a.mark('drag')
    await a.move('hue-thumb')
    await a.wait(200)
    const track = a.rect('hue-track')
    const span = track.width - 12
    const end = { x: track.x + 6 + (span * HUE_TO) / 360, y: track.y + track.height / 2 }
    await a.drag(end, (at) => {
      const t = Math.max(0, Math.min(1, (at.x - track.x - 6) / span))
      a.put({ dragging: true, hue: Math.max(HUE_FROM, t * 360) })
    })
    await a.set({ dragging: false, hue: HUE_TO })
    maya(MAYA.d)
    await a.wait(900)

    // 4. Click away: the picker closes, the change holds
    a.mark('done')
    await a.click('blank')
    await a.set({ picker: false, selected: false })
    maya(MAYA.e)
    await a.wait(2200)

    // 5. Undo, so the loop starts where it began
    a.mark('undo')
    await a.key('cmd+z')
    await a.set({ hue: HUE_FROM })
    a.set({ maya: null })
    await a.wait(1600)
  }

  const LAYERS: { depth: number; icon: 'frame' | 'type' | 'image' | 'rect'; w: number; name?: string }[] = [
    { depth: 0, icon: 'frame', w: 46 },
    { depth: 1, icon: 'rect', w: 28 },
    { depth: 1, icon: 'frame', w: 36 },
    { depth: 2, icon: 'type', w: 52 },
    { depth: 2, icon: 'type', w: 40 },
    { depth: 2, icon: 'frame', w: 0, name: 'Button' },
    { depth: 2, icon: 'image', w: 34 },
    { depth: 0, icon: 'frame', w: 40 },
    { depth: 0, icon: 'frame', w: 50 },
    { depth: 0, icon: 'frame', w: 38 },
  ]

  const boxStyle = (r: Rect) => `left:${r.x}px;top:${r.y}px;width:${r.width}px;height:${r.height}px`

  const iconPaths: Record<string, string[]> = {
    pointer: ['M4.037 4.688a.495.495 0 0 1 .651-.651l16 6.5a.5.5 0 0 1-.063.947l-6.124 1.58a2 2 0 0 0-1.438 1.435l-1.579 6.126a.5.5 0 0 1-.947.063z'],
    frame: ['M3 9h18', 'M9 21V9'],
    square: [],
    pen: [
      'M15.707 21.293a1 1 0 0 1-1.414 0l-1.586-1.586a1 1 0 0 1 0-1.414l5.586-5.586a1 1 0 0 1 1.414 0l1.586 1.586a1 1 0 0 1 0 1.414z',
      'm18 13-1.375-6.874a1 1 0 0 0-.746-.776L3.235 2.028a1 1 0 0 0-1.207 1.207L5.35 15.879a1 1 0 0 0 .776.746L13 18',
      'm2.3 2.3 7.286 7.286',
    ],
    type: ['M4 7V4h16v3', 'M9 20h6', 'M12 4v16'],
    chat: ['M7.9 20A9 9 0 1 0 4 16.1L2 22Z'],
    eye: ['M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0'],
    minus: ['M5 12h14'],
    pipette: [
      'm2 22 1-1h3l9-9',
      'M3 21v-3l9-9',
      'm15 6 3.4-3.4a2.1 2.1 0 1 1 3 3L18 9l.4.4a2.1 2.1 0 1 1-3 3l-3.8-3.8a2.1 2.1 0 1 1 3-3l.4.4Z',
    ],
    plus: ['M5 12h14', 'M12 5v14'],
    x: ['M18 6 6 18', 'm6 6 12 12'],
  }
</script>

{#snippet icon(name: string, size = 13, className = 'fg-icon')}
  {#if name === 'square'}
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" class={className} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" />
    </svg>
  {:else}
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" class={className} aria-hidden="true">
      {#each iconPaths[name] ?? [] as d}
        <path {d} />
      {/each}
      {#if name === 'eye'}
        <circle cx="12" cy="12" r="3" />
      {/if}
    </svg>
  {/if}
{/snippet}

{#snippet layerIcon(kind: 'frame' | 'type' | 'image' | 'rect')}
  {#if kind === 'type'}
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" class="fg-icon" aria-hidden="true">
      <polyline points="4 7 4 4 20 4 20 7" />
      <line x1="9" y1="20" x2="15" y2="20" />
      <line x1="12" y1="4" x2="12" y2="20" />
    </svg>
  {:else if kind === 'image'}
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" class="fg-icon" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
  {:else if kind === 'rect'}
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" class="fg-icon" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" />
    </svg>
  {:else}
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" class="fg-icon" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18" />
      <path d="M9 21V9" />
    </svg>
  {/if}
{/snippet}

<Stage
  width={860}
  height={480}
  {initial}
  {script}
  cursor={{ at: 'blank' }}
  compact={{ below: 600, width: 358, height: 440 }}
  accent="#0D99FF"
  className="fg"
>
  {#snippet children(s: S, rect, layout)}
    {@const color = `#${hex(s.hue)}`}
    {@const fill = rect('fill-row')}
    {@const props = rect('props')}
    <!-- Wide: the picker sits beside the panel, lifted so its sliders stay in
         view. Compact: there is no room beside it without covering the
         button, so it opens over the panel, under the fill row. -->
    {@const pickerStyle = layout === 'compact'
      ? `left:${props.x + 8}px;top:${fill.y + fill.height + 6}px;width:${props.width - 16}px`
      : `left:${props.x - 8 - 220}px;top:${Math.min(fill.y - 10, 480 - 24 - 244)}px;width:220px`}
    {@const btn = rect('button')}
    {@const maya = s.maya ?? mayaAt(rect('canvas'), MAYA.rest)}
    <Window className="fg-window" data-layout={layout}>
      {#snippet lead()}
        <span class="fg-tools">
          <BrandMark brand="figma" tile={false} size={16} width={11} className="fg-mark" />
          <span class="fg-tool" data-active>
            {@render icon('pointer', 14, '')}
          </span>
          <span class="fg-tool">
            {@render icon('frame', 14, '')}
          </span>
          <span class="fg-tool">
            {@render icon('square', 14, '')}
          </span>
          <span class="fg-tool">
            {@render icon('pen', 14, '')}
          </span>
          <span class="fg-tool">
            {@render icon('type', 14, '')}
          </span>
          {#if layout === 'wide'}
            <span class="fg-tool">
              {@render icon('chat', 14, '')}
            </span>
          {/if}
        </span>
      {/snippet}
      {#snippet toolbar()}
        <span class="fg-share-row">
          <Facepile names={['Maya', 'Ana']} size={22} tones={['success', 'accent']} />
          <span class="fg-share">Share</span>
        </span>
      {/snippet}
      <div class="fg-body">
        {#if layout === 'wide'}
          <aside class="fg-layers" data-crop>
            <div class="fg-file">
              <Text className="fg-file-name">Landing page</Text>
              <Bar w={44} h={5} tone={3} />
            </div>
            <div class="fg-tabs">
              <Bar w={34} h={6} tone={5} />
              <Bar w={30} h={6} tone={3} />
            </div>
            <div class="fg-tree">
              {#each LAYERS as l, i}
                <div
                  class="fg-layer"
                  data-depth={l.depth}
                  data-selected={l.name && s.selected ? true : undefined}
                  data-parent={(i === 0 || i === 2) && s.selected ? true : undefined}
                  style={`padding-left:${10 + l.depth * 14}px`}
                >
                  {@render layerIcon(l.icon)}
                  {#if l.name}
                    <Text className="fg-layer-name">{l.name}</Text>
                  {:else}
                    <Bar w={l.w} h={5} tone={l.depth === 0 ? 4 : 3} />
                  {/if}
                </div>
              {/each}
            </div>
          </aside>
        {/if}

        <div class="fg-canvas" data-target="canvas" data-crop>
          <div class="fg-frames">
            <div class="fg-frame-wrap fg-desktop">
              <Text className="fg-frame-label">Desktop</Text>
              <div class="fg-frame">
                <div class="fg-nav">
                  <Bar w={12} h={12} r={4} tone={5} />
                  <span class="fg-nav-links">
                    <Bar w={22} h={4} tone={3} />
                    <Bar w={18} h={4} tone={3} />
                    <Bar w={24} h={4} tone={3} />
                  </span>
                  <Bar w={30} h={12} r={6} tone={2} />
                </div>
                <div class="fg-hero">
                  <div class="fg-hero-copy">
                    <Bar w={118} h={9} r={3} tone={5} />
                    <Bar w={84} h={9} r={3} tone={5} />
                    <div class="fg-sub">
                      <Bar w={112} h={4} tone={3} />
                      <Bar w={90} h={4} tone={3} />
                    </div>
                    <div class="fg-buttons">
                      <span
                        class="fg-cta"
                        data-target="button"
                        data-dragging={s.dragging || undefined}
                        style={`background:${color}`}
                      >
                        <span class="fg-cta-label"></span>
                      </span>
                      <Bar w={46} h={22} r={6} tone={2} />
                    </div>
                  </div>
                  <div class="fg-hero-art" data-crop>
                    <span class="fg-art-sun"></span>
                    <span class="fg-art-hill"></span>
                  </div>
                </div>
                <div class="fg-logos">
                  {#each [30, 24, 34, 26] as w, i}
                    <Bar w={w} h={5} tone={2} />
                  {/each}
                </div>
              </div>
            </div>

            <div class="fg-frame-wrap fg-mobile">
              <Bar className="fg-frame-label-bar" w={30} h={5} tone={3} />
              <div class="fg-frame">
                <div class="fg-nav">
                  <Bar w={10} h={10} r={3} tone={5} />
                  <Bar w={12} h={4} tone={3} />
                </div>
                <Bar w={64} h={7} r={3} tone={5} />
                <Bar w={48} h={7} r={3} tone={5} style="margin-top:7px" />
                <div class="fg-sub">
                  <Bar w={70} h={4} tone={3} />
                  <Bar w={56} h={4} tone={3} />
                </div>
                <Bar w={52} h={18} r={5} tone={4} style="margin-top:10px" />
                <div class="fg-mobile-art"></div>
              </div>
            </div>

            <div class="fg-frame-wrap fg-row2">
              <Bar className="fg-frame-label-bar" w={36} h={5} tone={3} />
              <div class="fg-frame">
                <Bar w={90} h={8} r={3} tone={5} />
                <div class="fg-cards">
                  {#each [0, 1, 2] as card, i}
                    <span class="fg-card"></span>
                  {/each}
                </div>
              </div>
            </div>
          </div>
          <div class="fg-blank" data-target="blank"></div>
        </div>

        <aside class="fg-props" data-target="props" data-crop>
          <div class="fg-props-tabs">
            <Bar w={34} h={6} tone={5} />
            <Bar w={44} h={6} tone={3} />
            <span class="fg-zoom">
              <Bar w={22} h={5} tone={3} />
            </span>
          </div>
          <div class="fg-props-body">
            <!-- Nothing selected: the page -->
            <div class="fg-props-layer" data-show={!s.selected || undefined}>
              <section class="fg-section">
                <div class="fg-section-head">
                  <Bar w={28} h={6} tone={5} />
                </div>
                <div class="fg-row">
                  <span class="fg-field fg-field-wide">
                    <span class="fg-swatch" style="background:#F5F5F5"></span>
                    <Bar w={44} h={5} tone={4} />
                    <Bar w={20} h={5} tone={3} style="margin-left:auto" />
                  </span>
                </div>
              </section>
              {#each [44, 36, 40] as w, i}
                <section class="fg-section">
                  <div class="fg-section-head">
                    <Bar w={w} h={6} tone={5} />
                    {@render icon('plus', 13)}
                  </div>
                </section>
              {/each}
            </div>

            <!-- The button -->
            <div class="fg-props-layer" data-show={s.selected || undefined}>
              {#if layout === 'wide'}
                <section class="fg-section">
                  <div class="fg-section-head">
                    <Bar w={40} h={6} tone={5} />
                  </div>
                  <div class="fg-row fg-pair">
                    <span class="fg-field">
                      <Bar w={7} h={5} tone={3} />
                      <Bar w={26} h={5} tone={4} />
                    </span>
                    <span class="fg-field">
                      <Bar w={7} h={5} tone={3} />
                      <Bar w={20} h={5} tone={4} />
                    </span>
                  </div>
                  <div class="fg-row fg-pair">
                    <span class="fg-field">
                      <Bar w={7} h={5} tone={3} />
                      <Bar w={22} h={5} tone={4} />
                    </span>
                    <span class="fg-field">
                      <Bar w={7} h={5} tone={3} />
                      <Bar w={18} h={5} tone={4} />
                    </span>
                  </div>
                </section>
              {/if}
              <section class="fg-section">
                <div class="fg-section-head">
                  <Text className="fg-section-title">Fill</Text>
                  {@render icon('plus', 13)}
                </div>
                <div class="fg-row" data-target="fill-row">
                  <span class="fg-field fg-field-wide" data-open={s.picker || undefined}>
                    <span class="fg-swatch" data-target="fill-swatch" style={`background:${color}`} data-dragging={s.dragging || undefined}></span>
                    <span class="fg-hex">{hex(s.hue)}</span>
                    <Bar w={20} h={5} tone={3} style="margin-left:auto" />
                  </span>
                  {@render icon('eye', 13)}
                  {@render icon('minus', 13)}
                </div>
              </section>
              {#each [38, 42, 36] as w, i}
                <section class="fg-section">
                  <div class="fg-section-head">
                    <Bar w={w} h={6} tone={5} />
                    {@render icon('plus', 13)}
                  </div>
                </section>
              {/each}
            </div>
          </div>
        </aside>
      </div>
    </Window>

    <!-- Hover and selection on the canvas, from the measured button -->
    <div class="fg-hover" data-show={(s.hover && !s.selected) || undefined} style={boxStyle(btn)}></div>
    <div class="fg-select" data-show={s.selected || undefined} style={boxStyle(btn)}>
      <i data-c="tl"></i>
      <i data-c="tr"></i>
      <i data-c="bl"></i>
      <i data-c="br"></i>
    </div>

    <!-- Maya, on the canvas with us -->
    <Follow className="fg-maya" to={{ ...maya, width: 0, height: 0 }} stiffness={0.012}>
      <svg width="16" height="17" viewBox="0 0 16 17" class="fg-maya-arrow" aria-hidden="true">
        <path d="M1.5 1.5 14 7.2l-5.6 1.6-2.3 5.6Z" />
      </svg>
      <span class="fg-maya-name">Maya</span>
    </Follow>

    <!-- The color picker, beside the properties panel -->
    <Popover
      show={s.picker}
      origin="top right"
      className="fg-picker"
      data-layout={layout}
      style={pickerStyle}
    >
      <div class="fg-picker-head">
        <Bar w={40} h={6} tone={5} />
        <Bar w={42} h={6} tone={3} />
        {@render icon('x', 13, 'fg-icon fg-picker-x')}
      </div>
      <div class="fg-picker-body">
        <div class="fg-sv" data-crop style={`--hue:hsl(${s.hue} 100% 50%)`}>
          <span class="fg-sv-knob" style={`left:${SAT * 100}%;top:${(1 - VAL) * 100}%;background:${color}`}></span>
        </div>
        <div class="fg-sliders">
          {@render icon('pipette', 14)}
          <div class="fg-tracks">
            <div class="fg-hue" data-target="hue-track">
              <span class="fg-hue-thumb" data-target="hue-thumb" style={`left:calc(6px + (100% - 12px) * ${s.hue / 360})`}></span>
            </div>
            <div class="fg-alpha" style={`--c:${color}`}>
              <span class="fg-hue-thumb" style="left:calc(100% - 6px)"></span>
            </div>
          </div>
        </div>
        <div class="fg-picker-hex">
          <span class="fg-field fg-field-sm">
            <Bar w={20} h={5} tone={4} />
          </span>
          <span class="fg-field fg-field-grow">
            <span class="fg-hex">{hex(s.hue)}</span>
            <Bar w={20} h={5} tone={3} style="margin-left:auto" />
          </span>
        </div>
      </div>
    </Popover>
  {/snippet}
</Stage>
