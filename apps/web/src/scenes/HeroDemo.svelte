<script lang="ts">
  import { Bar, Stage, Text, Window, inset, type Rect } from 'svelte-stageshow'
  import { HERO_INITIAL, HERO_POSTER, HERO_REST, HERO_TITLE, heroScript, type HeroState } from './hero.js'
  import HeroToolbar from './HeroToolbar.svelte'
  import './hero-demo.css'

  interface Props {
    /** The determinism probe runs the script on a virtual clock instead. */
    deterministic?: boolean
    /** The film-method still: no script, no cursor, the opening frame. */
    still?: boolean
  }

  let { deterministic = false, still = false }: Props = $props()

  let stage: { runFrames: (count?: number) => Promise<string[]> } | undefined = $state()

  export function runFrames(count = 600) {
    if (!stage) throw new Error('HeroDemo stage is not mounted')
    return stage.runFrames(count)
  }

  const cursor = { at: HERO_REST }
  const TABLE: (string | number)[][] = [
    ['api-gateway', 'main', 48],
    ['web', 'release-1.4', 42],
    [62, 38, 48],
  ]

  const boxStyle = (r: Rect) => `left:${r.x}px;top:${r.y}px;width:${r.width}px;height:${r.height}px`
  const insetStyle = (r: Rect, by: number) => boxStyle(inset(r, by))
</script>

{#snippet welcome()}
  <svg viewBox="0 0 240 76" fill="none" style="width:100%;height:auto;display:block" aria-hidden="true">
    <rect x="4" y="4" width="148" height="68" rx="3" stroke="#D97757" stroke-width="1.5" fill="none" />
    <text x="160" y="16" fill="rgba(0,0,0,0.7)" font-size="9" font-family="ui-monospace, SFMono-Regular, monospace" font-weight="500">Claude Code</text>
    <text x="160" y="26" fill="rgba(0,0,0,0.4)" font-size="7" font-family="ui-monospace, SFMono-Regular, monospace">v2.1.14</text>
    <text x="78" y="20" fill="rgba(0,0,0,0.6)" font-size="8" font-family="ui-monospace, SFMono-Regular, monospace" text-anchor="middle">Welcome back Maya!</text>
    <g transform="translate(56, 26) scale(0.35)">
      <path d="M104.998 0H20.998V16.2H104.998V0Z" fill="#D77757" />
      <path d="M34.998 16.1953H20.998V32.3953H34.998V16.1953Z" fill="#D77757" />
      <rect x="35" y="14.7266" width="56" height="29.4545" fill="black" />
      <path d="M84 14.7266H42V36.8175H84V14.7266Z" fill="#D77757" />
      <path d="M105.002 16.1953H91.002V32.3953H105.002V16.1953Z" fill="#D77757" />
      <path d="M119 32.4023H7V48.6023H119V32.4023Z" fill="#D77757" />
      <path d="M104.998 48.5977H20.998V64.7977H104.998V48.5977Z" fill="#D77757" />
      <path d="M35 64.8047H28V81.0047H35V64.8047Z" fill="#D77757" />
      <path d="M49 64.8047H42V81.0047H49V64.8047Z" fill="#D77757" />
      <path d="M84 64.8047H77V81.0047H84V64.8047Z" fill="#D77757" />
      <path d="M98.002 64.8047H91.002V81.0047H98.002V64.8047Z" fill="#D77757" />
    </g>
    <text x="78" y="62" fill="rgba(0,0,0,0.4)" font-size="7" font-family="ui-monospace, SFMono-Regular, monospace" text-anchor="middle">Opus 5.5 · ~/code/dashboard</text>
  </svg>
{/snippet}

<Stage
  width={720}
  height={340}
  compact={{ below: 600, width: 358, height: 400 }}
  className="hd"
  initial={HERO_INITIAL}
  poster={still ? HERO_INITIAL : HERO_POSTER}
  script={still ? undefined : heroScript}
  cursor={still ? undefined : cursor}
  {deterministic}
  bind:this={stage}
>
  {#snippet children(s: HeroState, rect, layout)}
    <Window
      url="localhost:3000"
      className="hd-browser"
      data-cursor={s.toolbar ? 'crosshair' : 'pointer'}
      receded={s.terminal}
    >
      <div class="hd-content">
        <aside class="hd-sidebar">
          <Bar className="hd-sidebar-logo" w={20} h={20} r={5} tone={4} />
          <div class="hd-sidebar-icons" data-target="icons">
            {#each [0, 1, 2] as i}
              <Bar
                data-target={`icon-${i}`}
                className="hd-sidebar-icon"
                w={16}
                h={16}
                r={4}
                tone={i === 1 ? 5 : 3}
                data-selected={s.picked.includes(`icon-${i}`) ? 'true' : undefined}
              />
            {/each}
          </div>
          <div class="hd-sidebar-bottom">
            <Bar w={16} h={16} r={8} tone={3} />
          </div>
        </aside>

        <main class="hd-main">
          <div class="hd-header">
            <div class="hd-header-left">
              <span class="hd-logo"></span>
              <span class="hd-title" data-target="title" data-cursor="ibeam">{HERO_TITLE}</span>
            </div>
            <Bar data-target="export" w={55} h={26} r={5} tone={3} />
          </div>

          <div class="hd-metrics">
            {#each [[45, 50], [55, 65], [38, 40]] as [label, value], i}
              <div class="hd-card" data-target={`metric-${i}`}>
                <Bar w={label} h={5} tone={3} style="margin-bottom:8px" />
                <Bar w={value} h={18} r={3} tone={4} />
              </div>
            {/each}
          </div>

          <div class="hd-table" data-crop>
            <div class="hd-row head">
              <Bar w={60} tone={4} />
              <Bar w={45} tone={4} />
              <Bar w={40} tone={4} />
            </div>
            {#each TABLE as row, i}
              <div class="hd-row" data-target={`row-${i}`}>
                {#if typeof row[0] === 'string'}<Text className="hd-cell">{row[0]}</Text>{:else}<Bar w={row[0]} h={7} tone={2} />{/if}
                {#if typeof row[1] === 'string'}<Text className="hd-cell hd-cell--faint">{row[1]}</Text>{:else}<Bar w={row[1]} h={7} tone={2} />{/if}
                <Bar w={row[2]} h={18} r={9} tone={1} />
              </div>
            {/each}
          </div>

          <HeroToolbar open={s.toolbar} copied={s.copied} />
        </main>
      </div>
    </Window>

    <div class="hd-highlight" data-show={s.highlight ? 'true' : undefined} style={insetStyle(rect('export'), 4)}></div>
    <div class="hd-dragbox" data-show={s.dragging ? 'true' : undefined} style={s.drag ? boxStyle(s.drag) : undefined}></div>
    <div class="hd-area" data-show={s.area.show ? 'true' : undefined} style={boxStyle(s.area.r)}></div>
    {#if s.selection}
      <div class="hd-selection" style={`left:${s.selection.x}px;top:${s.selection.y}px;width:${s.selection.width}px`}></div>
    {/if}

    <div class="hd-marker" data-show="true" style={`left:${rect('metric-0').x + 28}px;top:${rect('metric-0').y + 14}px`}>1</div>
    <div class="hd-marker" data-show="true" style={`left:${rect('row-0').x + 140}px;top:${rect('row-0').y + 10}px`}>2</div>
    <div class="hd-marker" data-show={s.m3.show ? 'true' : undefined} style={`left:${s.m3.at.x}px;top:${s.m3.at.y}px`}>3</div>
    <div class="hd-marker" data-tone="green" data-show={s.m4.show ? 'true' : undefined} style={`left:${s.m4.at.x}px;top:${s.m4.at.y}px`}>4</div>
    <div class="hd-marker" data-tone="orange" data-show={s.m5.show ? 'true' : undefined} style={`left:${s.m5.at.x}px;top:${s.m5.at.y}px`}>5</div>

    <div class="hd-popup" data-show={s.popup.show ? 'true' : undefined} data-tone={s.popup.tone} style={`left:${s.popup.at.x}px;top:${s.popup.at.y}px`}>
      <div class="hd-popup-header">{s.popup.header}</div>
      <div class="hd-popup-input" data-cursor="ibeam">
        {s.typed}
        <span class="hd-caret" style="opacity:.4">|</span>
      </div>
      <div class="hd-popup-actions">
        <div class="hd-popup-btn">Cancel</div>
        <div class="hd-popup-btn submit" data-target="add" data-cursor="hand">Add</div>
      </div>
    </div>

    <Window title="Maya's Project" className="hd-terminal" data-show={s.terminal ? 'true' : undefined}>
      <div class="hd-terminal-body" data-target="terminal-input" data-cursor="ibeam" data-snap>
        <div class="hd-terminal-welcome">{@render welcome()}</div>
        {s.pasted}<span style="opacity:.4">█</span>
      </div>
    </Window>
    <span data-target="rest" style={`position:absolute;left:${HERO_REST[layout].x}px;top:${HERO_REST[layout].y}px`}></span>
  {/snippet}
</Stage>
