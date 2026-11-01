<script lang="ts">
  import { Avatar, Bar, Camera, Collapse, Field, Popover, Stage, Text, Window, type Act, type Layout, type Rect } from 'svelte-stageshow'
  import './linear.css'

  // Linear, light, in its desktop window (860 wide), as it looks after the
  // 2026 refresh: grayscale chrome, a dimmed sidebar, compact rounded tabs.
  // Color stays only on Linear's own content marks (status circles, label
  // dots, avatars) and the accent on the one avatar the story lands. The issue list is the
  // context; Cmd+K opens the command menu over it, "assign" filters it, the
  // user picks "Assign to me", and ENG-142's row takes their avatar while its
  // status turns from Todo to In Progress. Cmd+Z undoes it, so the loop closes
  // with a caused reset.
  //
  // Real strings: the team, the view, ENG-142 and its title, the command menu
  // (its rows are what the typing filters, so they must be words), and what is
  // typed. Every other row is placeholder lines around Linear's own signature
  // marks: priority bars, status circles, avatars.
  //
  // Icons: Linear ships no public icon pack, so the nav and command glyphs are
  // lucide-react (installed here), chosen for its thin, even line, which is
  // close to Linear's own. The status circles and priority bars are Linear's
  // own geometry, drawn from circles and rects, because they are its content.

  type S = {
    focus: boolean
    open: boolean
    query: string
    hoverMe: boolean
    assigned: boolean
    zoom: Rect | null
  }

  const initial: S = { focus: false, open: false, query: '', hoverMe: false, assigned: false, zoom: null }

  type Status = 'backlog' | 'todo' | 'progress' | 'done'
  type Row = { status: Status; pri: 0 | 1 | 2 | 3 | 4; id: number; title: number; label?: number; who?: string; date: number }

  const ROWS: Row[] = [
    { status: 'progress', pri: 4, id: 44, title: 210, label: 34, who: 'Mara', date: 30 },
    { status: 'progress', pri: 2, id: 40, title: 168, who: 'Theo', date: 26 },
    { status: 'todo', pri: 3, id: 0, title: 0, label: 30, date: 30 }, // ENG-142
    { status: 'todo', pri: 2, id: 42, title: 236, who: 'Ines', date: 28 },
    { status: 'todo', pri: 1, id: 38, title: 150, label: 40, date: 30 },
    { status: 'backlog', pri: 0, id: 44, title: 192, who: 'Mara', date: 24 },
    { status: 'backlog', pri: 2, id: 40, title: 128, date: 30 },
    { status: 'backlog', pri: 3, id: 42, title: 178, who: 'Theo', date: 28 },
    { status: 'done', pri: 1, id: 38, title: 204, date: 26 },
    { status: 'done', pri: 2, id: 44, title: 140, who: 'Ines', date: 30 },
    { status: 'done', pri: 0, id: 40, title: 186, who: 'Mara', date: 28 },
    { status: 'done', pri: 3, id: 42, title: 122, date: 24 },
  ]

  const COMMANDS: { label: string; key: string; icon: string; target?: string }[] = [
    { label: 'Change status…', key: 'S', icon: 'circle-dashed' },
    { label: 'Assign to…', key: 'A', icon: 'user-round' },
    { label: 'Assign to me', key: 'I', icon: 'user-round-check', target: 'me' },
    { label: 'Change priority…', key: 'P', icon: 'signal-high' },
    { label: 'Add labels…', key: 'L', icon: 'tag' },
  ]

  const REST = { at: 'rest', x: 0.64, y: 0.5 }

  async function script(a: Act<S>) {
    const compact = a.layout === 'compact'
    await a.wait(900)

    // 1. Context: the pointer comes to rest on ENG-142, which takes focus
    a.mark('focus')
    await a.move({ at: 'row', x: compact ? 0.86 : 0.7, y: 0.6 })
    await a.set({ focus: true })
    await a.wait(700)

    // 2. Cmd+K opens the command menu on that issue
    a.mark('open')
    await a.key('cmd+k')
    await a.set({ open: true })
    await a.wait(800)

    // 3. Type "assign": the menu narrows to the two assign commands
    a.mark('type')
    await a.type('query', 'assign', { interval: 95 })
    await a.wait(700)

    // 4. Pick yourself
    a.mark('pick')
    await a.move({ at: 'me', x: 0.62, y: 0.55 })
    await a.set({ hoverMe: true })
    await a.wait(350)
    await a.click()
    await a.wait(120)
    await a.set({ open: false })
    // Step the pointer off the row so it doesn't sit over the change
    await a.move({ at: 'rest', x: compact ? 0.5 : 0.42, y: 0.5 })

    // 5. The camera comes in on the row (the change is two 16px marks in a
    // 920px scene), then the row updates: avatar in, Todo -> In Progress
    a.mark('result')
    if (!compact) {
      const who = a.rect('who142', { layout: true })
      const row = a.rect('row', { layout: true })
      await a.set({ zoom: { x: row.x, y: row.y, width: who.x + who.width + 12 - row.x, height: row.height } })
      await a.wait(900)
    }
    await a.set({ assigned: true })
    await a.wait(2200)
    if (!compact) {
      await a.set({ zoom: null })
      await a.wait(1100)
    }

    // Undo, the way Linear does it, then let go of the row
    a.mark('undo')
    await a.key('cmd+z')
    await a.set({ assigned: false })
    await a.wait(900)
    await a.snap({ query: '', hoverMe: false })
    await a.move(REST)
    await a.set({ focus: false })
    await a.wait(900)
  }

  type GlyphNode = readonly [string, Record<string, string | number>]
  const GLYPHS: Record<string, GlyphNode[]> = {
    'chevron-down': [['path', { d: 'm6 9 6 6 6-6' }]],
    search: [
      ['circle', { cx: 11, cy: 11, r: 8 }],
      ['path', { d: 'm21 21-4.3-4.3' }],
    ],
    'square-pen': [
      ['path', { d: 'M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7' }],
      ['path', { d: 'M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z' }],
    ],
    inbox: [
      ['polyline', { points: '22 12 16 12 14 15 10 15 8 12 2 12' }],
      ['path', { d: 'M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z' }],
    ],
    'user-round': [
      ['circle', { cx: 12, cy: 8, r: 5 }],
      ['path', { d: 'M20 21a8 8 0 0 0-16 0' }],
    ],
    layers: [
      ['path', { d: 'M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z' }],
      ['path', { d: 'M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12' }],
      ['path', { d: 'M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17' }],
    ],
    'iteration-ccw': [
      ['path', { d: 'M20 10c0-4.4-3.6-8-8-8s-8 3.6-8 8 3.6 8 8 8h8' }],
      ['polyline', { points: '16 14 20 18 16 22' }],
    ],
    box: [
      ['path', { d: 'M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z' }],
      ['path', { d: 'm3.3 7 8.7 5 8.7-5' }],
      ['path', { d: 'M12 22V12' }],
    ],
    folder: [['path', { d: 'M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z' }]],
    'list-filter': [
      ['path', { d: 'M3 6h18' }],
      ['path', { d: 'M7 12h10' }],
      ['path', { d: 'M10 18h4' }],
    ],
    'sliders-horizontal': [
      ['line', { x1: 21, x2: 14, y1: 4, y2: 4 }],
      ['line', { x1: 10, x2: 3, y1: 4, y2: 4 }],
      ['line', { x1: 21, x2: 12, y1: 12, y2: 12 }],
      ['line', { x1: 8, x2: 3, y1: 12, y2: 12 }],
      ['line', { x1: 21, x2: 16, y1: 20, y2: 20 }],
      ['line', { x1: 12, x2: 3, y1: 20, y2: 20 }],
      ['line', { x1: 14, x2: 14, y1: 2, y2: 6 }],
      ['line', { x1: 8, x2: 8, y1: 10, y2: 14 }],
      ['line', { x1: 16, x2: 16, y1: 18, y2: 22 }],
    ],
    'circle-dashed': [
      ['path', { d: 'M10.1 2.182a10 10 0 0 1 3.8 0' }],
      ['path', { d: 'M13.9 21.818a10 10 0 0 1-3.8 0' }],
      ['path', { d: 'M17.609 3.721a10 10 0 0 1 2.69 2.7' }],
      ['path', { d: 'M2.182 13.9a10 10 0 0 1 0-3.8' }],
      ['path', { d: 'M20.279 17.609a10 10 0 0 1-2.7 2.69' }],
      ['path', { d: 'M21.818 10.1a10 10 0 0 1 0 3.8' }],
      ['path', { d: 'M3.721 6.391a10 10 0 0 1 2.7-2.69' }],
      ['path', { d: 'M6.391 20.279a10 10 0 0 1-2.69-2.7' }],
    ],
    'user-round-check': [
      ['path', { d: 'M2 21a8 8 0 0 1 13.292-6' }],
      ['circle', { cx: 10, cy: 8, r: 5 }],
      ['path', { d: 'm16 19 2 2 4-4' }],
    ],
    'signal-high': [
      ['path', { d: 'M2 20h.01' }],
      ['path', { d: 'M7 20v-4' }],
      ['path', { d: 'M12 20v-8' }],
      ['path', { d: 'M17 20V8' }],
    ],
    tag: [
      ['path', { d: 'M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z' }],
      ['circle', { cx: 7.5, cy: 7.5, r: 0.5, fill: 'currentColor' }],
    ],
  }
</script>

{#snippet glyph(name: string, size: number, stroke: number, klass: string)}
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width={stroke} stroke-linecap="round" stroke-linejoin="round" class={klass} aria-hidden="true">
    {#each GLYPHS[name] ?? [] as [tag, attrs]}
      {#if tag === 'path'}
        <path {...attrs} />
      {:else if tag === 'circle'}
        <circle {...attrs} />
      {:else if tag === 'rect'}
        <rect {...attrs} />
      {:else if tag === 'line'}
        <line {...attrs} />
      {:else if tag === 'polyline'}
        <polyline {...attrs} />
      {/if}
    {/each}
  </svg>
{/snippet}

{#snippet priority(level: number)}
  {#if level === 0}
    <svg class="ln-pri" width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
      {#each [2, 6, 10] as x}
        <rect x={x - 0.75} y="6.25" width="2.5" height="1.5" rx="0.5" />
      {/each}
    </svg>
  {:else if level === 4}
    <svg class="ln-pri" data-urgent width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
      <rect x="1" y="1" width="12" height="12" rx="3" />
      <rect class="ln-pri__mark" x="6.25" y="3.5" width="1.5" height="4.5" rx="0.75" />
      <rect class="ln-pri__mark" x="6.25" y="9.25" width="1.5" height="1.5" rx="0.75" />
    </svg>
  {:else}
    <svg class="ln-pri" width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
      {#each [0, 1, 2] as i}
        <rect x={1.5 + i * 4} y={8 - i * 3} width="3" height={4 + i * 3} rx="1" data-on={i < level || undefined} />
      {/each}
    </svg>
  {/if}
{/snippet}

{#snippet statusIcon(status: Status)}
  {#if status === 'backlog'}
    <svg class="ln-status" data-status="backlog" width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
      <circle cx="7" cy="7" r="5.5" fill="none" stroke-width="1.5" stroke-dasharray="2.1 1.5" />
    </svg>
  {:else if status === 'done'}
    <svg class="ln-status" data-status="done" width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
      <circle cx="7" cy="7" r="6.25" />
      <path d="M4.4 7.2 6.2 9l3.4-3.6" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  {:else}
    <svg class="ln-status" data-status={status} width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
      <circle class="ln-status__ring" cx="7" cy="7" r="5.5" fill="none" stroke-width="1.5" />
      <circle class="ln-status__pie" cx="7" cy="7" r="1.75" fill="none" stroke-width="3.5" pathLength={100} transform="rotate(-90 7 7)" />
    </svg>
  {/if}
{/snippet}

{#snippet unassigned()}
  <svg class="ln-unassigned" width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
    <circle cx="9" cy="9" r="8" fill="none" stroke-width="1.2" stroke-dasharray="2 1.6" />
    <circle cx="9" cy="7.2" r="2.1" />
    <path d="M5.4 13.1a3.9 3.9 0 0 1 7.2 0z" />
  </svg>
{/snippet}

{#snippet sidebar()}
  <div class="ln-side">
    <div class="ln-workspace">
      <span class="ln-workspace__tile">A</span>
      <Bar w={46} h={6} tone={4} />
      {@render glyph('chevron-down', 12, 1.8, 'ln-icon')}
      <span class="ss-window__spacer"></span>
      {@render glyph('search', 14, 1.7, 'ln-icon')}
      <span class="ln-compose">
        {@render glyph('square-pen', 13, 1.7, 'ln-icon')}
      </span>
    </div>
    <div class="ln-group">
      <div class="ln-nav">
        {@render glyph('inbox', 14, 1.7, 'ln-icon')}
        <Bar w={34} h={5} tone={3} />
      </div>
      <div class="ln-nav">
        {@render glyph('user-round', 14, 1.7, 'ln-icon')}
        <Bar w={52} h={5} tone={3} />
      </div>
    </div>
    <div class="ln-group">
      <div class="ln-section"><Bar w={58} h={5} tone={2} /></div>
      <div class="ln-nav ln-team">
        <span class="ln-team__tile">E</span>
        <Text className="ln-team__name">Engineering</Text>
        {@render glyph('chevron-down', 11, 1.8, 'ln-icon')}
      </div>
      <div class="ln-sub">
        <div class="ln-nav" data-active>
          {@render glyph('layers', 14, 1.7, 'ln-icon ln-icon--on')}
          <Text className="ln-nav__label">Issues</Text>
        </div>
        <div class="ln-nav">
          {@render glyph('iteration-ccw', 14, 1.7, 'ln-icon')}
          <Bar w={38} h={5} tone={3} />
        </div>
        <div class="ln-nav">
          {@render glyph('box', 14, 1.7, 'ln-icon')}
          <Bar w={46} h={5} tone={3} />
        </div>
      </div>
    </div>
    <div class="ln-group">
      <div class="ln-section"><Bar w={44} h={5} tone={2} /></div>
      <div class="ln-nav">
        {@render glyph('folder', 14, 1.7, 'ln-icon')}
        <Bar w={56} h={5} tone={3} />
      </div>
      <div class="ln-nav">
        {@render glyph('folder', 14, 1.7, 'ln-icon')}
        <Bar w={42} h={5} tone={3} />
      </div>
    </div>
  </div>
{/snippet}

<Stage width={920} height={470} compact={{ below: 600, width: 420, height: 340 }} accent="#5e6ad2" initial={initial} poster={{ ...initial, focus: true, assigned: true }} script={script} cursor={{ at: REST }} className="ln-stage">
  {#snippet children(s: S, _rect, layout: Layout)}
    {@const compact = layout === 'compact'}
    {@const q = s.query.toLowerCase()}

    {#snippet lead()}
      <div class="ln-crumbs">
        {#if compact}<span class="ln-team__tile">E</span>{/if}
        <Text className="ln-crumbs__team">{compact ? 'Issues' : 'Engineering'}</Text>
        {#if !compact}
          <div class="ln-tabs">
            <span class="ln-tab" data-active>
              <Text>All issues</Text>
            </span>
            <span class="ln-tab"><Bar w={34} h={5} tone={3} /></span>
            <span class="ln-tab"><Bar w={42} h={5} tone={3} /></span>
          </div>
        {/if}
      </div>
    {/snippet}

    {#snippet toolbar()}
      <div class="ln-tools">
        <span class="ln-tool">{@render glyph('list-filter', 14, 1.7, 'ln-icon')}</span>
        <span class="ln-tool ln-tool--display">
          {@render glyph('sliders-horizontal', 13, 1.7, 'ln-icon')}
          {#if !compact}<Bar w={36} h={5} tone={3} />{/if}
        </span>
      </div>
    {/snippet}

    {#snippet list()}
      <div class="ln-list">
        {#each ROWS as r, i}
          {@const target = i === 2}
          <div class="ln-row" data-target={target ? 'row' : i === 6 ? 'rest' : undefined} data-focus={(target && s.focus) || undefined}>
            {@render priority(r.pri)}
            <span class="ln-id">{#if target}<Text tone={2}>ENG-142</Text>{:else}<Bar w={r.id} h={5} tone={2} />{/if}</span>
            {#if target}
              <span class="ln-st" data-target="st142">{@render statusIcon(s.assigned ? 'progress' : r.status)}</span>
            {:else}
              {@render statusIcon(r.status)}
            {/if}
            <span class="ln-title">{#if target}<Text className="ln-title__text">Fix login redirect loop</Text>{:else}<Bar w={compact ? Math.min(r.title, 150) : r.title} h={6} tone={3} />{/if}</span>
            {#if !compact}
              <span class="ln-labels">
                {#if r.label}
                  <span class="ln-chip">
                    <span class="ln-chip__dot" data-tone={i % 3}></span>
                    <Bar w={r.label} h={5} tone={3} />
                  </span>
                {/if}
              </span>
            {/if}
            <span class="ln-who">
              {#if target}
                <span class="ln-who__swap" data-target="who142" data-assigned={s.assigned || undefined}>
                  {@render unassigned()}
                  <Avatar name="Maya" size={18} tone="accent" className="ln-who__me" style="font-size:9.5px" />
                </span>
              {:else if r.who}
                <Avatar name={r.who} size={18} className="ln-avatar" data-face={i % 3} style="font-size:9.5px" />
              {:else}
                {@render unassigned()}
              {/if}
            </span>
            {#if !compact}
              <span class="ln-date">
                <Bar w={r.date} h={5} tone={2} />
              </span>
            {/if}
          </div>
        {/each}
      </div>
    {/snippet}

    <Camera focus={s.zoom} max={1.6} pad={20} feather={44}>
      {#if compact}
        <Window lead={lead} toolbar={toolbar} className="ln-window" body={{ class: 'ln-body', 'data-crop': true }}>
          {@render list()}
        </Window>
      {:else}
        <Window lead={lead} toolbar={toolbar} sidebar={sidebar} sidebarWidth={212} className="ln-window" body={{ class: 'ln-body', 'data-crop': true }}>
          {@render list()}
        </Window>
      {/if}

      <div class="ln-scrim" data-show={s.open || undefined}></div>
      <Popover show={s.open} origin="top center" className="ln-cmd">
        <div class="ln-cmd__context">
          <span class="ln-cmd__chip">
            <Text>ENG-142</Text>
            <Text className="ln-cmd__chip-title">Fix login redirect loop</Text>
          </span>
        </div>
        <Field value={s.query} placeholder="Type a command or search…" focused={s.open} className="ln-cmd__field" box={{ 'data-cursor': 'pointer' }} />
        <div class="ln-cmd__list">
          {#each (compact ? COMMANDS.slice(0, 3) : COMMANDS) as c, i (c.label)}
            {@const match = !q || c.label.toLowerCase().includes(q)}
            {@const firstMatch = COMMANDS.findIndex((x) => !q || x.label.toLowerCase().includes(q))}
            {@const active = s.hoverMe ? c.target === 'me' : i === firstMatch}
            <Collapse open={match}>
              <div class="ln-cmd__item" data-target={c.target} data-active={active || undefined}>
                <span class="ln-cmd__icon">{@render glyph(c.icon, 15, 1.6, '')}</span>
                <Text className="ln-cmd__label">{c.label}</Text>
                <span class="ln-cmd__key">{c.key}</span>
              </div>
            </Collapse>
          {/each}
        </div>
      </Popover>
    </Camera>
  {/snippet}
</Stage>
