<script lang="ts">
  import { Bar, Stage, Text, Window, type Act, type Layout } from 'svelte-stageshow'
  import './powerpoint.css'

  // PowerPoint for Mac: pick slide 2 in the rail, it opens in the editor, open
  // Designer and pick a suggested layout, and the slide restyles in place (the
  // rail thumbnail follows). Cmd+Z undoes it, the pane closes, slide 1 is
  // picked again, so the loop ends where it began.

  type Design = 'plain' | 'split' | 'band' | 'overlay'
  type S = { slide: 1 | 2; pane: boolean; design: Design; picked: number; ideas: boolean }

  const initial: S = { slide: 1, pane: false, design: 'plain', picked: 0, ideas: false }
  const poster: S = { slide: 2, pane: true, design: 'split', picked: 2, ideas: true }

  // Geometry per layout, in design px. The slide is drawn at 640 × 360 and scaled.
  const G = {
    wide: { w: 920, h: 540, win: { x: 30, y: 30, w: 860, h: 570 }, rail: 140, pane: 220, canvas: 350, thumb: 100, step: 70, idea: 188, pad: 24 },
    // Narrow, the window keeps its size and runs off the left: the slide rail
    // goes out of frame so the slide and Designer draw at true scale, not shrunk
    compact: { w: 358, h: 400, win: { x: -78, y: 20, w: 420, h: 432 }, rail: 72, pane: 150, canvas: 220, thumb: 48, step: 44, idea: 126, pad: 14 },
  } as const

  function fit(l: Layout, pane: boolean) {
    const g = G[l]
    const editor = g.win.w - g.rail - (pane ? g.pane : 0)
    const k = Math.min((editor - g.pad * 2) / 640, (g.canvas - g.pad * 2) / 360, l === 'wide' ? 0.8 : 0.5)
    // Compact with the pane open: top-align with the second rail thumbnail rather than land a few px off it.
    const y = l === 'compact' && pane ? 12 + g.step : (g.canvas - 360 * k) / 2
    return { k, x: (editor - 640 * k) / 2, y }
  }

  /* ---- The slide itself ---- */

  type Box = [number, number, number, number]
  const LOOK: Record<Design, { photo: Box; title: [number, number]; bullets: [number, number]; light: boolean; panel: number; shade: number; rule: boolean }> = {
    plain: { photo: [360, 112, 232, 174], title: [48, 40], bullets: [56, 128], light: false, panel: 0, shade: 0, rule: false },
    split: { photo: [0, 0, 300, 360], title: [336, 128], bullets: [340, 200], light: true, panel: 1, shade: 0, rule: true },
    band: { photo: [0, 0, 640, 188], title: [48, 216], bullets: [52, 280], light: false, panel: 0, shade: 0, rule: false },
    overlay: { photo: [0, 0, 640, 360], title: [48, 222], bullets: [52, 284], light: true, panel: 0, shade: 1, rule: false },
  }

  /* ---- Chrome ---- */

  const ICON = { size: 15, strokeWidth: 1.6 }
  const IDEAS: Design[] = ['band', 'split', 'overlay']

  /* ---- Script ---- */

  async function script(a: Act<S>) {
    // Narrow, the rail is out of frame: the story starts on slide 2
    const t = a.rect('thumb-2')
    const rail = t.x + t.width > 0
    if (!rail) a.snap({ slide: 2 })
    await a.wait(700)
    a.mark('open')
    if (rail) {
      await a.click('thumb-2')
      await a.set({ slide: 2 })
      await a.wait(1000)
    }

    a.mark('designer')
    await a.click({ at: 'designer', x: 0.5, y: 0.3 })
    await a.set({ pane: true, ideas: true })
    await a.wait(1300)

    await a.move({ at: 'idea-2', x: 0.82, y: 0.78 })
    await a.wait(400)
    a.mark('pick')
    await a.click()
    await a.set({ design: 'split', picked: 2 })
    await a.wait(2800)

    a.mark('undo')
    await a.key('cmd+z')
    await a.set({ design: 'plain', picked: 0 })
    await a.wait(1200)
    await a.click('close')
    await a.set({ pane: false, ideas: false })
    await a.wait(900)
    if (rail) {
      await a.click('thumb-1')
      await a.set({ slide: 1 })
    }
    await a.wait(1200)
  }
</script>

{#snippet glyph(name: string, size = 15, stroke = 1.6)}
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width={stroke}
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    {#if name === 'clipboard-paste'}
      <path d="M15 2H9a1 1 0 0 0-1 1v2c0 .6.4 1 1 1h6c.6 0 1-.4 1-1V3c0-.6-.4-1-1-1Z" />
      <path d="M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2" />
      <path d="M9 12h6" />
      <path d="M9 16h6" />
    {:else if name === 'square-plus'}
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M8 12h8" />
      <path d="M12 8v8" />
    {:else if name === 'bold'}
      <path d="M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8" />
    {:else if name === 'italic'}
      <path d="M19 4h-9" />
      <path d="M14 20H5" />
      <path d="M15 4 9 20" />
    {:else if name === 'underline'}
      <path d="M6 4v6a6 6 0 0 0 12 0V4" />
      <path d="M4 20h16" />
    {:else if name === 'strikethrough'}
      <path d="M16 4H9a3 3 0 0 0-2.83 4" />
      <path d="M14 12a4 4 0 0 1 0 8H6" />
      <path d="M4 12h16" />
    {:else if name === 'align-left'}
      <path d="M15 12H3" />
      <path d="M17 18H3" />
      <path d="M21 6H3" />
    {:else if name === 'align-center'}
      <path d="M17 12H7" />
      <path d="M19 18H5" />
      <path d="M21 6H3" />
    {:else if name === 'align-right'}
      <path d="M21 12H9" />
      <path d="M21 18H7" />
      <path d="M21 6H3" />
    {:else if name === 'align-justify'}
      <path d="M3 12h18" />
      <path d="M3 18h18" />
      <path d="M3 6h18" />
    {:else if name === 'list'}
      <path d="M8 6h13" />
      <path d="M8 12h13" />
      <path d="M8 18h13" />
      <path d="M3 6h.01" />
      <path d="M3 12h.01" />
      <path d="M3 18h.01" />
    {:else if name === 'list-ordered'}
      <path d="M10 6h11" />
      <path d="M10 12h11" />
      <path d="M10 18h11" />
      <path d="M4 6h1v4" />
      <path d="M4 10h2" />
      <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" />
    {:else if name === 'shapes'}
      <path d="M8.3 10a.7.7 0 0 1-.626-1.079L11.4 3a.7.7 0 0 1 1.198-.043L16.3 8.9a.7.7 0 0 1-.572 1.1Z" />
      <rect width="7" height="7" x="3" y="14" rx="1" />
      <circle cx="17.5" cy="17.5" r="3.5" />
    {:else if name === 'layers'}
      <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
      <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" />
      <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
    {:else if name === 'layout-dashboard'}
      <rect width="7" height="9" x="3" y="3" rx="1" />
      <rect width="7" height="5" x="14" y="3" rx="1" />
      <rect width="7" height="9" x="14" y="12" rx="1" />
      <rect width="7" height="5" x="3" y="16" rx="1" />
    {:else if name === 'x'}
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    {/if}
  </svg>
{/snippet}

{#snippet photo()}
  <!-- A harbor at dusk: sky, sun, water, a far shore and a hill of rooftops.
       The gradients are identical in every instance, so the fixed ids are safe. -->
  <svg viewBox="0 0 640 360" preserveAspectRatio="xMinYMid slice" class="pp-photo-svg" aria-hidden="true">
    <defs>
      <linearGradient id="pp-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#f2b58a" />
        <stop offset="0.55" stop-color="#f6d3ae" />
        <stop offset="1" stop-color="#f9e6cf" />
      </linearGradient>
      <linearGradient id="pp-sea" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#7fa3b8" />
        <stop offset="1" stop-color="#3f6a84" />
      </linearGradient>
    </defs>
    <rect width="640" height="360" fill="url(#pp-sky)" />
    <circle cx="430" cy="170" r="34" fill="#fbe9d2" />
    <path d="M0 200 C 120 186 220 192 320 196 S 520 184 640 194 L640 230 L0 230Z" fill="#b98f86" />
    <rect y="214" width="640" height="146" fill="url(#pp-sea)" />
    <path d="M0 260 C 80 236 150 226 230 232 C 280 236 300 252 320 360 L0 360Z" fill="#c97b5a" />
    <path d="M0 290 C 70 270 140 262 210 270 C 250 276 270 300 280 360 L0 360Z" fill="#a85f45" />
    <g fill="#f3e3cf">
      <rect x="40" y="262" width="22" height="16" rx="1" />
      <rect x="76" y="254" width="26" height="18" rx="1" />
      <rect x="118" y="250" width="20" height="16" rx="1" />
      <rect x="150" y="256" width="24" height="16" rx="1" />
      <rect x="24" y="296" width="28" height="18" rx="1" />
      <rect x="70" y="288" width="24" height="18" rx="1" />
      <rect x="112" y="284" width="30" height="18" rx="1" />
      <rect x="160" y="290" width="22" height="16" rx="1" />
    </g>
    <path d="M470 236 h40 l-6 8 h-30z" fill="#2f4f63" />
    <path d="M488 236 v-22 l14 20z" fill="#f9efe2" />
  </svg>
{/snippet}

{#snippet slideArt(n: number, design: Design)}
  {#if n === 1}
    <div class="pp-slide" data-n="1">
      <span class="pp-s1-title">Team Offsite 2026</span>
      <span class="pp-s1-sub"></span>
    </div>
  {:else if n >= 3}
    {@const rows = [
      [300, 240, 270],
      [260, 300, 200],
      [280, 220, 250],
      [240, 290, 230],
    ][(n - 3) % 4]}
    <div class="pp-slide" data-n="other">
      <span class="pp-o-title" style={`width:${[260, 300, 220, 280][(n - 3) % 4]}px`}></span>
      {#each rows as w, i (i)}
        <span class="pp-o-row" style={`width:${w}px`}></span>
      {/each}
    </div>
  {:else}
    {@const L = LOOK[design]}
    {@const [px, py, pw, ph] = L.photo}
    <div class="pp-slide" data-light={L.light || undefined}>
      <div class="pp-panel" data-show={L.panel > 0 || undefined}></div>
      <div class="pp-photo" style={`left:${px}px;top:${py}px;width:${pw}px;height:${ph}px`}>
        {@render photo()}
      </div>
      <div class="pp-shade" style={`opacity:${L.shade}`}></div>
      <span class="pp-rule" data-show={L.rule || undefined}></span>
      <span class="pp-title" style={`transform:translate(${L.title[0]}px, ${L.title[1]}px)`}>
        Lisbon, in May
      </span>
      <div class="pp-bullets" style={`transform:translate(${L.bullets[0]}px, ${L.bullets[1]}px)`}>
        {#each [210, 168, 188] as w, i (i)}
          <span class="pp-bullet">
            <span class="pp-dot"></span>
            <span class="pp-line" style={`width:${w}px`}></span>
          </span>
        {/each}
      </div>
    </div>
  {/if}
{/snippet}

{#snippet mini(n: number, design: Design, width: number, extra: string)}
  {@const k = width / 640}
  <div class="pp-mini" style={`width:${width}px;height:${360 * k}px;${extra}`}>
    <div style={`transform:scale(${k});transform-origin:0 0`}>
      {@render slideArt(n, design)}
    </div>
  </div>
{/snippet}

{#snippet tabsRow(layout: Layout)}
  {@const tabs = layout === 'wide' ? ['Home', 'Insert', 'Draw', 'Design', 'Transitions', 'Animations', 'Slide Show', 'Review', 'View'] : ['Home', 'Insert', 'Draw', 'Design']}
  <div class="pp-tabs">
    {#each tabs as t, i (t)}
      <span class="pp-tab" data-active={i === 0 || undefined}>{t}</span>
    {/each}
    <span class="pp-spacer"></span>
    {#if layout === 'wide'}<Bar w={52} h={18} r={5} tone={2} />{/if}
    <span class="pp-share">
      <Bar w={30} h={5} tone={1} className="pp-share-bar" />
    </span>
  </div>
{/snippet}

{#snippet big(iconName: string, label: number)}
  <span class="pp-big">
    {@render glyph(iconName, 22, 1.4)}
    <Bar w={label} h={5} tone={3} />
  </span>
{/snippet}

{#snippet ribbon(layout: Layout, open: boolean)}
  {@const wide = layout === 'wide'}
  <div class="pp-ribbon">
    {@render big('clipboard-paste', 24)}
    {@render big('square-plus', 34)}
    <span class="pp-sep"></span>
    {#if wide}
      <span class="pp-group">
        <span class="pp-row">
          <span class="pp-field" style="width:104px">
            <Bar w={52} h={5} tone={3} />
          </span>
          <span class="pp-field" style="width:34px">
            <Bar w={12} h={5} tone={3} />
          </span>
        </span>
        <span class="pp-row pp-icons">
          {@render glyph('bold', ICON.size, ICON.strokeWidth)}
          {@render glyph('italic', ICON.size, ICON.strokeWidth)}
          {@render glyph('underline', ICON.size, ICON.strokeWidth)}
          {@render glyph('strikethrough', ICON.size, ICON.strokeWidth)}
        </span>
      </span>
    {:else}
      <span class="pp-group">
        <span class="pp-row pp-icons">
          {@render glyph('bold', ICON.size, ICON.strokeWidth)}
          {@render glyph('italic', ICON.size, ICON.strokeWidth)}
          {@render glyph('underline', ICON.size, ICON.strokeWidth)}
        </span>
        <span class="pp-row pp-icons">
          {@render glyph('align-left', ICON.size, ICON.strokeWidth)}
          {@render glyph('align-center', ICON.size, ICON.strokeWidth)}
          {@render glyph('list', ICON.size, ICON.strokeWidth)}
        </span>
      </span>
    {/if}
    {#if wide}
      <span class="pp-sep"></span>
      <span class="pp-group">
        <span class="pp-row pp-icons">
          {@render glyph('list', ICON.size, ICON.strokeWidth)}
          {@render glyph('list-ordered', ICON.size, ICON.strokeWidth)}
        </span>
        <span class="pp-row pp-icons">
          {@render glyph('align-left', ICON.size, ICON.strokeWidth)}
          {@render glyph('align-center', ICON.size, ICON.strokeWidth)}
          {@render glyph('align-right', ICON.size, ICON.strokeWidth)}
          {@render glyph('align-justify', ICON.size, ICON.strokeWidth)}
        </span>
      </span>
      <span class="pp-sep"></span>
      {@render big('shapes', 30)}
      {@render big('layers', 32)}
    {/if}
    <span class="pp-spacer"></span>
    <span class="pp-sep"></span>
    <span class="pp-designer" data-target="designer" data-open={open || undefined}>
      {@render glyph('layout-dashboard', 22, 1.5)}
      <span class="pp-designer-label">Designer</span>
    </span>
  </div>
{/snippet}

<Stage
  width={G.wide.w}
  height={G.wide.h}
  compact={{ below: 600, width: G.compact.w, height: G.compact.h }}
  {initial}
  {poster}
  {script}
  cursor={{ at: 'thumb-1' }}
  accent="#c43e1c"
  className="pp-stage"
>
  {#snippet children(s, _rect, layout)}
    {@const g = G[layout]}
    {@const f = fit(layout, s.pane)}
    <Window
      title="Team Offsite"
      className="pp-window"
      data-layout={layout}
      style={`left:${g.win.x}px;top:${g.win.y}px;width:${g.win.w}px;height:${g.win.h}px`}
    >
      {@render tabsRow(layout)}
      {@render ribbon(layout, s.pane)}
      <div class="pp-main">
        <aside class="pp-rail" style={`width:${g.rail}px`}>
          {#each [1, 2, 3, 4, 5, 6] as n, i (n)}
            <div class="pp-thumb" style={`top:${12 + i * g.step}px`}>
              <span class="pp-num">{n}</span>
              <div class="pp-thumb-box" data-target={`thumb-${n}`} data-selected={s.slide === n || undefined}>
                {@render mini(n, n === 2 ? s.design : 'plain', g.thumb, '')}
              </div>
            </div>
          {/each}
        </aside>
        <div class="pp-work" data-crop>
          <div class="pp-canvas" data-crop style={`height:${g.canvas}px`}>
            <div class="pp-fit" style={`transform:translate(${f.x}px, ${f.y}px) scale(${f.k})`}>
              {#each [1, 2] as n (n)}
                <div class="pp-page" data-on={s.slide === n || undefined}>
                  {@render slideArt(n, n === 2 ? s.design : 'plain')}
                </div>
              {/each}
            </div>
          </div>
          <div class="pp-notes">
            <Bar w={layout === 'wide' ? 96 : 64} h={5} tone={2} />
          </div>
          <div class="pp-status">
            <Bar w={54} h={5} tone={3} />
            <span class="pp-spacer"></span>
            <Bar w={layout === 'wide' ? 120 : 60} h={5} tone={2} />
          </div>
          <aside class="pp-pane" data-open={s.pane || undefined} style={`width:${g.pane}px`}>
            <div class="pp-pane-head">
              <Text className="pp-pane-title">Designer</Text>
              <span class="pp-close" data-target="close">
                {@render glyph('x', 14, 1.8)}
              </span>
            </div>
            {#each IDEAS as d, i (d)}
              <div
                class="pp-idea"
                data-target={`idea-${i + 1}`}
                data-show={s.ideas || undefined}
                data-picked={s.picked === i + 1 || undefined}
                style={`--d:${s.ideas ? `${180 + i * 70}ms` : `${(2 - i) * 40}ms`}`}
              >
                {@render mini(2, d, g.idea, '')}
              </div>
            {/each}
          </aside>
        </div>
      </div>
    </Window>
  {/snippet}
</Stage>
