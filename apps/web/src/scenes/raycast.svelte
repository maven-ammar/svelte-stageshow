<script lang="ts">
  import { Bar, Collapse, Stage, Text, type Act } from 'svelte-stageshow'
  import './raycast.css'

  // Raycast over a blurred desktop. Type "clip", Clipboard History is the first
  // result, Enter pushes the command, the list opens with its preview pane,
  // Down moves to a copied color, Esc pops back to root search (the loop).

  type S = { query: string; view: 'root' | 'clip'; sel: number }

  const initial: S = { query: '', view: 'root', sel: 0 }

  type Row = { id: string; icon: string; tile: string; title: number; sub: number; acc: number }

  // Root rows. Clipboard History is its own row; the rest are placeholders.
  const ROWS: Row[] = [
    { id: 'r1', icon: 'folder', tile: '#3d8bfd', title: 52, sub: 0, acc: 56 },
    { id: 'r2', icon: 'calendar', tile: '#ff5f57', title: 64, sub: 40, acc: 50 },
    { id: 'r3', icon: 'music', tile: '#fc3c64', title: 44, sub: 0, acc: 56 },
    { id: 'r4', icon: 'settings', tile: '#8e8e93', title: 78, sub: 46, acc: 50 },
    { id: 'r5', icon: 'app-window', tile: '#5e5ce6', title: 58, sub: 0, acc: 56 },
    { id: 'r6', icon: 'calculator', tile: '#ff9f0a', title: 70, sub: 0, acc: 50 },
    { id: 'r7', icon: 'image', tile: '#30b0c7', title: 86, sub: 52, acc: 50 },
    { id: 'r8', icon: 'folder', tile: '#3d8bfd', title: 66, sub: 0, acc: 56 },
  ]

  // Which rows survive each query, in the order Raycast ranks them.
  function shown(q: string): string[] {
    if (q === '') return ['r1', 'r2', 'r3', 'r4', 'r5', 'r6', 'r7', 'r8']
    if (q === 'c') return ['ch', 'r2', 'r6', 'r3']
    if (q === 'cl') return ['ch', 'r6', 'r7']
    return ['ch', 'r7']
  }

  const FALLBACK = [
    { icon: 'globe', tile: '#0a84ff', title: 92, acc: 50 },
    { icon: 'search', tile: '#636366', title: 74, acc: 56 },
    { icon: 'book-open', tile: '#34c759', title: 60, acc: 50 },
  ]

  type Entry = { kind: 'text' | 'color' | 'link' | 'image'; label?: string; w: number }
  const ENTRIES: Entry[] = [
    { kind: 'text', label: 'Ship the new onboarding on Thursday', w: 0 },
    { kind: 'color', label: '#FF6363', w: 0 },
    { kind: 'link', w: 96 },
    { kind: 'text', w: 120 },
    { kind: 'image', w: 82 },
    { kind: 'text', w: 104 },
    { kind: 'link', w: 74 },
  ]

  async function script(a: Act<S>) {
    await a.wait(1000)
    a.mark('type')
    await a.type('query', 'clip', { interval: 150 })
    await a.wait(900)
    a.mark('open')
    await a.key('enter')
    await a.set({ view: 'clip', sel: 0 })
    await a.wait(2200)
    a.mark('down')
    // The reference mark catches the selection before the down step; hold
    // that frame long enough for the recorder's mark capture, then move.
    await a.wait(1100)
    await a.key('down')
    await a.set({ sel: 1 })
    await a.wait(2400)
    a.mark('back')
    await a.key('esc')
    await a.set({ view: 'root', query: '', sel: 0 })
    await a.wait(1400)
  }
</script>

{#snippet glyph(name: string, size: number, stroke = 1.75, className = '')}
  <svg
    class={className || undefined}
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
    {#if name === 'folder'}
      <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
    {:else if name === 'calendar'}
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
    {:else if name === 'music'}
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    {:else if name === 'settings'}
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    {:else if name === 'app-window'}
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="M10 4v4" />
      <path d="M2 8h20" />
      <path d="M6 4v4" />
    {:else if name === 'calculator'}
      <rect width="16" height="20" x="4" y="2" rx="2" />
      <line x1="8" x2="16" y1="6" y2="6" />
      <line x1="16" x2="16" y1="14" y2="18" />
      <path d="M16 10h.01" />
      <path d="M12 10h.01" />
      <path d="M8 10h.01" />
      <path d="M12 14h.01" />
      <path d="M8 14h.01" />
      <path d="M12 18h.01" />
      <path d="M8 18h.01" />
    {:else if name === 'image'}
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    {:else if name === 'globe'}
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    {:else if name === 'search'}
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    {:else if name === 'book-open'}
      <path d="M12 7v14" />
      <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
    {:else if name === 'arrow-left'}
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    {:else if name === 'chevron-down'}
      <path d="m6 9 6 6 6-6" />
    {:else if name === 'clipboard-list'}
      <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="M12 11h4" />
      <path d="M12 16h4" />
      <path d="M8 11h.01" />
      <path d="M8 16h.01" />
    {:else if name === 'link'}
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    {:else if name === 'text'}
      <path d="M17 6.1H3" />
      <path d="M21 12.1H3" />
      <path d="M15.1 18H3" />
    {/if}
  </svg>
{/snippet}

{#snippet entryIcon(e: Entry)}
  {#if e.kind === 'color'}
    <span class="rc-swatch"></span>
  {:else}
    {@render glyph(e.kind === 'link' ? 'link' : e.kind === 'image' ? 'image' : 'text', 15, 1.75, 'rc-entry-icon')}
  {/if}
{/snippet}

{#snippet rootPage(s: S)}
  {@const vis = shown(s.query)}
  {@const first = vis[0]}
  <div class="rc-page rc-root" data-show={s.view === 'root' || undefined}>
    <div class="rc-search">
      <span class="rc-input">
        {#if s.query}<span class="rc-query">{s.query}</span>{/if}
        {#key s.query}<span class="rc-caret"></span>{/key}
        <span class="rc-placeholder" data-hidden={!!s.query || undefined}>Search for apps and commands...</span>
      </span>
    </div>
    <div class="rc-list">
      <div class="rc-section">
        <span class="rc-heads">
          <Text className="rc-head" data-show={!s.query || undefined}>Suggestions</Text>
          <Text className="rc-head" data-show={!!s.query || undefined}>Results</Text>
        </span>
      </div>
      <Collapse className="rc-filter" open={vis.includes('ch')}>
        <div class="rc-row" data-selected={first === 'ch' || undefined}>
          <span class="rc-tile" style="background:#ff6363">
            {@render glyph('clipboard-list', 13, 2.25)}
          </span>
          <Text className="rc-title">Clipboard History</Text>
          <Text className="rc-sub">Raycast</Text>
          <span class="rc-spacer"></span>
          <Text className="rc-acc">Command</Text>
        </div>
      </Collapse>
      {#each ROWS as r (r.id)}
        <Collapse className="rc-filter" open={vis.includes(r.id)}>
          <div class="rc-row" data-selected={first === r.id || undefined}>
            <span class="rc-tile" style={`background:${r.tile}`}>
              {@render glyph(r.icon, 13, 2.25)}
            </span>
            <Bar w={r.title} h={7} tone={5} />
            {#if r.sub > 0}<Bar w={r.sub} h={7} tone={3} />{/if}
            <span class="rc-spacer"></span>
            <Bar w={r.acc} h={6} tone={3} />
          </div>
        </Collapse>
      {/each}
      <Collapse className="rc-filter" open={!!s.query}>
        <div class="rc-section">
          <span class="rc-heads">
            <Text className="rc-head" data-show>{`Use "${s.query || 'clip'}" with...`}</Text>
          </span>
        </div>
        {#each FALLBACK as f, i (i)}
          <div class="rc-row">
            <span class="rc-tile" style={`background:${f.tile}`}>
              {@render glyph(f.icon, 13, 2.25)}
            </span>
            <Bar w={f.title} h={7} tone={5} />
            <span class="rc-spacer"></span>
            <Bar w={f.acc} h={6} tone={3} />
          </div>
        {/each}
      </Collapse>
    </div>
  </div>
{/snippet}

{#snippet clipPage(s: S, layout: string)}
  {@const compact = layout === 'compact'}
  <div class="rc-page rc-clip" data-show={s.view === 'clip' || undefined}>
    <div class="rc-search">
      <span class="rc-back">
        {@render glyph('arrow-left', 14, 2)}
      </span>
      <span class="rc-input">
        <span class="rc-caret"></span>
        <span class="rc-placeholder">Type to filter entries...</span>
      </span>
      <span class="rc-dropdown">
        <Text>All Types</Text>
        {@render glyph('chevron-down', 13, 2)}
      </span>
    </div>
    <div class="rc-split">
      <div class="rc-entries">
        <div class="rc-section">
          <Text>Today</Text>
        </div>
        {#each ENTRIES as e, i (i)}
          <div class="rc-row rc-entry" data-selected={s.sel === i || undefined}>
            {@render entryIcon(e)}
            {#if e.label}
              <Text className="rc-title rc-clamp">{e.label}</Text>
            {:else}
              <Bar w={compact ? Math.round(e.w * 0.7) : e.w} h={7} tone={4} />
            {/if}
          </div>
        {/each}
      </div>
      <div class="rc-preview">
        <div class="rc-preview-top">
          <div class="rc-layer" data-show={s.sel === 0 || undefined}>
            <Text className="rc-preview-text" wrap>Ship the new onboarding on Thursday</Text>
          </div>
          <div class="rc-layer rc-layer-color" data-show={s.sel === 1 || undefined}>
            <span class="rc-big-swatch"></span>
            <Text className="rc-preview-text">#FF6363</Text>
          </div>
        </div>
        <div class="rc-info">
          <Text className="rc-info-head">Information</Text>
          {#each [[58, 46, 52], [70, 34, 28], [44, 60, 66], [62, 52, 40]] as [l, v0, v1], i (i)}
            <div class="rc-info-row">
              <Bar w={l} h={6} tone={3} />
              <span class="rc-info-val">
                <Bar className="rc-v" data-show={s.sel === 0 || undefined} w={v0} h={6} tone={4} />
                <Bar className="rc-v" data-show={s.sel === 1 || undefined} w={v1} h={6} tone={4} />
              </span>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>
{/snippet}

<Stage
  width={760}
  height={440}
  compact={{ below: 560, width: 400, height: 380 }}
  {initial}
  {script}
  theme="dark"
  keys="bottom"
  className="rc-stage"
>
  {#snippet children(s, _rect, layout)}
    <div class="rc-desktop" data-layout={layout}>
      <div class="rc-wallpaper"></div>
      <div class="rc-menubar">
        <span class="rc-menubar-left">
          <Bar w={34} h={7} tone={5} />
          <Bar w={22} h={6} tone={4} />
          <Bar w={26} h={6} tone={4} />
          <Bar w={30} h={6} tone={4} />
        </span>
        <span class="rc-menubar-right">
          <Bar w={14} h={10} r={3} tone={4} />
          <Bar w={14} h={10} r={3} tone={4} />
          <Bar w={14} h={10} r={3} tone={4} />
          <Bar w={58} h={6} tone={5} />
        </span>
      </div>
      <div class="rc-window">
        {@render rootPage(s)}
        {@render clipPage(s, layout)}
        <div class="rc-actions">
          <span class="rc-mark"></span>
          <span class="rc-spacer"></span>
          <Bar w={78} h={6} tone={3} />
          <span class="rc-actions-sep"></span>
          <Bar w={52} h={6} tone={3} />
        </div>
      </div>
    </div>
  {/snippet}
</Stage>
