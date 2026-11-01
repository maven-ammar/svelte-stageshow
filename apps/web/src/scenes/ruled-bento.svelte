<script lang="ts">
  import { Caret, Count, Icon, Meter, Prompt, Stage, States, Window, type Act } from 'svelte-stageshow'
  import './ruled-bento.css'

  // A ruled bento on dark: the features section of Halite, an invented edge
  // database. One rounded container, 1px rules between the cells, no gaps,
  // mixed spans (2 + 1, then 1 + 2, then a full-width band), the way Linear,
  // Framer and Raycast's developer page set theirs.
  //
  //   Tile      Span   Kind        The one thing                         Moves
  //   Create    2 × 1  Hero UI     `halite create`, the only window      the migration bar fills, Ready prints
  //   Reads     1 × 1  Stat        "4ms" at the median                   counts down from 120
  //   Regions   1 × 1  Diagram     a primary and six replicas            the lines draw out, replicas light
  //   Restore   2 × 1  Component   the restore scrubber                  the handle slides back past the bad drop
  //   Drivers   3 × 1  Collection  ORM names, bleeding off both sides    the rows drift apart
  //
  // Two of five tiles are UI, one window. Across and down, no kind sits next
  // to itself. Each picture is its own Stage at 1:1, pinned to its cell's
  // bottom; the copy is page text. Each cell plays one beat, once, 110ms
  // after the one before it in reading order.

  const STEP = 110
  const LEAD = 450

  type Beat = { on: boolean; fill?: boolean }
  const before: Beat = { on: false }
  const after: Beat = { on: true, fill: true }
  const beat = (i: number) => async (a: Act<Beat>) => {
    await a.wait(LEAD + i * STEP)
    await a.set({ on: true })
  }

  const createScript = async (a: Act<Beat>) => {
    await a.wait(LEAD)
    await a.set({ on: true })
    await a.wait(800)
    await a.set({ on: true, fill: true })
  }

  let heroWidth = $state(340)
  let mapWidth = $state(340)
  let restoreWidth = $state(340)
  const restoreLayout = $derived(restoreWidth < 600 ? 'compact' : 'wide')

  let readsEl = $state<HTMLDivElement | null>(null)
  let readsSeen = $state(false)
  let reduced = $state(false)

  $effect(() => {
    const m = window.matchMedia('(prefers-reduced-motion: reduce)')
    reduced = m.matches
    const on = () => (reduced = m.matches)
    m.addEventListener('change', on)
    return () => m.removeEventListener('change', on)
  })

  $effect(() => {
    const el = readsEl
    if (!el) return
    let timer = 0
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        io.disconnect()
        timer = window.setTimeout(() => (readsSeen = true), LEAD + STEP)
      },
      { threshold: 0.4 },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      clearTimeout(timer)
    }
  })

  // Rough world positions on a 380 × 236 stage, the primary in Virginia
  // Every pill stays inside x 46 to 334, the part the narrowest cell shows
  const PRIMARY = { id: 'iad1', x: 124, y: 96 }
  const REPLICAS = [
    { id: 'sfo1', x: 62, y: 58 },
    { id: 'gru1', x: 148, y: 196 },
    { id: 'lhr1', x: 196, y: 40 },
    { id: 'fra1', x: 232, y: 86 },
    { id: 'sin1', x: 270, y: 146 },
    { id: 'syd1', x: 286, y: 204 },
  ]

  function arc(a: { x: number; y: number }, b: { x: number; y: number }) {
    // A gentle bow above the straight line, more for longer runs
    const mx = (a.x + b.x) / 2
    const my = (a.y + b.y) / 2
    const d = Math.hypot(b.x - a.x, b.y - a.y)
    return `M${a.x} ${a.y} Q${mx} ${my - d * 0.22} ${b.x} ${b.y}`
  }

  // Keep the region names native-size while moving their points inward.
  const point = (p: { id: string; x: number; y: number }) => ({
    ...p,
    x: mapWidth < 360 ? 38 + ((p.x - 62) / 224) * (mapWidth - 106) : p.x + (mapWidth - 380) / 2,
  })
  const primary = $derived(point(PRIMARY))
  const replicas = $derived(REPLICAS.map(point))

  // Write activity per minute, 13:00 to 14:40: varied, with a quiet lunch dip
  const WRITES = Array.from({ length: 50 }, (_, i) => {
    const base = 0.38 + 0.3 * Math.sin(i * 0.37) * Math.cos(i * 0.11) + 0.18 * Math.sin(i * 1.7)
    const dip = i > 14 && i < 22 ? 0.45 : 1
    return Math.max(0.12, Math.min(1, base * dip + 0.12))
  })
  // Two minutes a bar from 13:00: the handle stops at 14:02, the table went at 14:04
  const DROP = 31
  const AXIS_WIDE: [string, number][] = [['13:00', 0], ['13:30', 15], ['14:00', 30]]
  const AXIS_COMPACT: [string, number][] = [['13:50', 3], ['14:10', 13]]

  const ROWS = [
    ['ecto', 'prisma', 'drizzle', 'kysely', 'sqlalchemy', 'gorm', 'diesel', 'sequelize', 'typeorm', 'exposed'],
    ['knex', 'active record', 'sqlx', 'django', 'jooq', 'ent', 'mikro-orm', 'hibernate', 'pgx', 'slonik'],
    ['dapper', 'peewee', 'objection', 'bun', 'sqlc', 'psycopg', 'tortoise', 'doctrine', 'ebean', 'room'],
  ]
</script>

{#snippet terminal(on: boolean, fill: boolean | undefined, layout: string)}
  {@const wide = layout === 'wide'}
  <Window
    chrome="terminal"
    lights="grey"
    title={wide ? 'demo — zsh' : undefined}
    className="rb-term"
    body={{ 'data-crop': '' }}
    data-on={on || undefined}
    data-fill={fill || undefined}
    data-layout={layout}
  >
    <div class="ss-term rb-term__body">
      <Prompt path="~/demo">halite create shop</Prompt>
      <div class="rb-out" style="--i:0">
        <span class="dim">Created</span> shop <span class="dim">in</span> iad1
      </div>
      <div class="rb-out rb-migrate" style="--i:1">
        <span class="dim">Migrating</span>
        <Meter className="rb-meter" value={fill ? 1 : 0} />
        <span class="rb-count">
          <Count value={fill ? 14 : 0} duration={1000} /><span class="dim">/14</span>
        </span>
      </div>
      <div class="rb-out rb-ready" style="--i:2">
        <span class="ok">✓</span> Ready <span class="dim">in 1.9s</span>
      </div>
      <div class="rb-out rb-url" style="--i:3">
        <span class="dim">{wide ? 'DATABASE_URL  ' : ''}</span>
        {wide ? 'halite://shop.demo.example' : 'halite://shop.demo…'}
      </div>
      <Prompt path="~/demo" className="rb-out" style="--i:4">
        <Caret />
      </Prompt>
    </div>
  </Window>
{/snippet}

{#snippet createTile()}
  <section class="rb-cell rb-cell--hero" data-crop>
    <p class="rb-copy">
      <b>A database in one command.</b> Halite provisions it, runs your migrations and hands back a URL.
    </p>
    <div bind:clientWidth={heroWidth} class="rb-picture rb-picture--hero" style={`--rb-picture-width:${heroWidth}px`}>
      <Stage
        width={Math.max(heroWidth, 1)}
        height={300}
        theme="dark"
        initial={before}
        poster={after}
        play="once"
        script={createScript}
        className="rb-stage"
      >
        {#snippet children(s: Beat)}
          {@render terminal(s.on, s.fill, heroWidth < 600 ? 'compact' : 'wide')}
        {/snippet}
      </Stage>
    </div>
  </section>
{/snippet}

{#snippet readsTile()}
  <section class="rb-cell rb-cell--stat" data-crop>
    <div bind:this={readsEl} class="rb-stat">
      <span class="rb-stat-lead">
        <Icon name="bolt" filled size={16} className="rb-bolt" />
        Reads in
      </span>
      <span class="rb-stat-number">
        <Count value={readsSeen || reduced ? 4 : 0} duration={1300} /><span class="rb-stat-unit">ms</span>
      </span>
      <span class="rb-stat-label">at the median, from the replica nearest each user.</span>
    </div>
  </section>
{/snippet}

{#snippet regionsTile()}
  <section class="rb-cell rb-cell--map" data-crop>
    <p class="rb-copy">
      <b>Replicas near every user.</b> Reads never cross an ocean.
    </p>
    <div bind:clientWidth={mapWidth} class="rb-picture rb-picture--map">
      <Stage width={Math.max(mapWidth, 1)} height={236} theme="dark" initial={before} poster={after} play="once" script={beat(2)} className="rb-stage">
        {#snippet children(s: Beat)}
          <div class="rb-map" data-on={s.on || undefined}>
            <svg class="rb-map__lines" width={mapWidth} height={236} aria-hidden="true">
              {#each replicas as r, i (r.id)}
                <g style={`--i:${i}`}>
                  <path d={arc(primary, r)} class="rb-arc" />
                  <path d={arc(primary, r)} class="rb-arc rb-arc--lit" pathLength={1} />
                </g>
              {/each}
            </svg>
            <span class="rb-node" data-primary style={`left:${primary.x}px;top:${primary.y}px`}>
              <span class="rb-node__dot"></span>
              {PRIMARY.id}
            </span>
            {#each replicas as r, i (r.id)}
              <span class="rb-node" style={`left:${r.x}px;top:${r.y}px;--i:${i}`}>
                <span class="rb-node__dot"></span>
                {r.id}
              </span>
            {/each}
          </div>
        {/snippet}
      </Stage>
    </div>
  </section>
{/snippet}

{#snippet restoreTile()}
  {@const wide = restoreLayout === 'wide'}
  {@const bars = wide ? WRITES : WRITES.slice(22, 46)}
  {@const drop = wide ? DROP : DROP - 22}
  <section class="rb-cell rb-cell--restore" data-crop>
    <p class="rb-copy">
      <b>Undo the bad migration.</b> Rewind to any second in the last 30 days.
    </p>
    <div bind:clientWidth={restoreWidth} class="rb-picture rb-picture--restore">
      <Stage
        width={Math.max(restoreWidth, 1)}
        height={wide ? 216 : 236}
        theme="dark"
        initial={before}
        poster={after}
        play="once"
        script={beat(3)}
        className="rb-stage"
      >
        {#snippet children(s: Beat)}
          <div class="rb-restore" data-on={s.on || undefined} data-layout={restoreLayout}>
            <div class="rb-restore__head">
              <span class="rb-restore__label">Restore shop to</span>
              <States
                value={s.on ? 'then' : 'now'}
                align="start"
                className="rb-restore__time"
                states={{ now: 'Now', then: '14:02:59' }}
              />
            </div>
            <div class="rb-track" style={`--n:${bars.length};--drop:${drop}`}>
              {#each bars as h, i (i)}
                <span class="rb-track__bar" data-after={i >= drop || undefined} style={`height:${Math.round(h * 100)}%`}></span>
              {/each}
              <span class="rb-event">
                <span class="rb-event__tag">DROP TABLE carts</span>
              </span>
              <span class="rb-handle"></span>
            </div>
            <div class="rb-axis" style={`--n:${bars.length}`}>
              {#each (wide ? AXIS_WIDE : AXIS_COMPACT) as [t, at] (t)}
                <span style={`--at:${at}`}>{t}</span>
              {/each}
            </div>
          </div>
        {/snippet}
      </Stage>
    </div>
  </section>
{/snippet}

{#snippet driversTile()}
  <section class="rb-cell rb-cell--orm" data-crop>
    <p class="rb-copy">
      <b>Bring your ORM.</b> Halite speaks the Postgres wire protocol, so your driver already works.
    </p>
    <div class="rb-picture rb-picture--orm">
      <Stage width={1200} height={150} theme="dark" initial={before} poster={after} play="once" script={beat(4)} className="rb-stage">
        {#snippet children(s: Beat)}
          <div class="rb-rows" data-on={s.on || undefined}>
            {#each ROWS as row, r (r)}
              <div class="rb-row" style={`--dir:${r % 2 ? 1 : -1};--off:${[-40, -96, -12][r]}px`}>
                {#each row as name (name)}
                  <span class="rb-chip">{name}</span>
                {/each}
              </div>
            {/each}
          </div>
        {/snippet}
      </Stage>
    </div>
  </section>
{/snippet}

<div class="ruled-bento">
  <div class="rb-grid">
    {@render createTile()}
    {@render readsTile()}
    {@render regionsTile()}
    {@render restoreTile()}
    {@render driversTile()}
  </div>
</div>
