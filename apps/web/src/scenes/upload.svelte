<script lang="ts">
  import { Bar, Collapse, Count, Meter, Stage, States, Window, type Act, type Layout, type Point } from 'svelte-stageshow'
  import './upload.css'

  type Ghost = { on: boolean; dropped: boolean; off: Point; at: Point }
  type S = { up: boolean; mb: number; done: boolean; ghost: Ghost }

  const initial: S = { up: false, mb: 0, done: false, ghost: { on: false, dropped: false, off: { x: 0, y: 0 }, at: { x: 0, y: 0 } } }

  const FILE = 'Launch deck.pdf'
  const MB = 4.2

  type Geo = {
    win: { x: number; y: number; w: number; h: number }
    rows: number
    cols: string
    desk: { x: number; y: number }
  }

  // Wide: one gutter (40) above the window and left of the file; the window
  // runs off the right and bottom, its Size column still whole in the crop.
  // Compact: the file sits above the window, which runs off the bottom only
  // with equal side gutters, so all three columns stay whole.
  const GEO: Record<Layout, Geo> = {
    wide: { win: { x: 184, y: 40, w: 620, h: 420 }, rows: 9, cols: 'minmax(0, 1fr) 132px 118px', desk: { x: 40, y: 124 } },
    compact: { win: { x: 24, y: 120, w: 352, h: 300 }, rows: 6, cols: 'minmax(0, 1fr) 92px 76px', desk: { x: 20, y: 18 } },
  }

  type Kind = 'folder' | 'doc'
  const ROWS: { kind: Kind; name: number; date: number; size: number }[] = [
    { kind: 'folder', name: 96, date: 84, size: 16 },
    { kind: 'doc', name: 132, date: 76, size: 40 },
    { kind: 'doc', name: 104, date: 88, size: 34 },
    { kind: 'folder', name: 80, date: 80, size: 16 },
    { kind: 'doc', name: 120, date: 72, size: 44 },
    { kind: 'doc', name: 92, date: 86, size: 36 },
    { kind: 'folder', name: 112, date: 78, size: 16 },
    { kind: 'doc', name: 100, date: 74, size: 38 },
    { kind: 'doc', name: 126, date: 82, size: 42 },
  ]

  async function script(a: Act<S>) {
    await a.wait(600)

    // 1. Pick the PDF up off the desktop by its icon
    a.mark('grab')
    const icon = a.rect('desk-icon')
    const file = a.rect('desk-file')
    const grab = { x: icon.x + icon.width / 2, y: icon.y + icon.height * 0.55 }
    await a.move(grab)
    await a.wait(240)
    const off = { x: grab.x - file.x, y: grab.y - file.y }

    // 2. Carry it into the window; the list lights up under it
    a.mark('drag')
    const list = a.rect('drop')
    await a.drag({ x: list.x + list.width * 0.36, y: list.y + list.height * 0.32 }, (at) => {
      a.put({ ghost: { on: true, dropped: false, off, at } })
    }, { duration: 1300, cursor: 'preserve' })

    // 3. Drop: the upload row opens at the top, its bar fills and the size
    //    counts up with it
    a.mark('drop')
    await a.set((s) => ({ up: true, ghost: { ...s.ghost, dropped: true } }))
    await a.wait(500)
    for (const [mb, ms] of [[1.1, 650], [2.3, 650], [3.4, 650], [MB, 600]] as const) {
      await a.set({ mb })
      await a.wait(ms)
    }

    // 4. Uploaded: the bar gives way to Just now and the tint fades
    a.mark('done')
    await a.set({ done: true })
    await a.wait(2400)

    // 5. Cmd+Z takes the upload back; the row closes: back to the start
    a.mark('undo')
    await a.key('cmd+z')
    await a.set({ up: false, ghost: initial.ghost })
    await a.wait(600)
    await a.snap({ mb: 0, done: false })
    await a.wait(300)
  }

  /** The drag image follows the cursor on the drag's own frame callback, and
   *  lights whatever [data-drop] it is over. */
  function dragFollow(node: HTMLElement, initial: { following: boolean; x: number; y: number }) {
    let over: HTMLElement | null = null
    let current = initial
    function update(p: { following: boolean; x: number; y: number }) {
      const root = node.closest<HTMLElement>('.ss-stage')
      let next: HTMLElement | null = null
      if (p.following && root) {
        const box = root.getBoundingClientRect()
        const scale = box.width / root.offsetWidth || 1
        const hit = document.elementFromPoint(box.left + p.x * scale, box.top + p.y * scale)?.closest<HTMLElement>('[data-drop]') ?? null
        if (hit && root.contains(hit)) next = hit
      }
      if (next !== over) {
        over?.removeAttribute('data-over')
        next?.setAttribute('data-over', '')
        over = next
      }
    }
    update(current)
    return {
      update(next: { following: boolean; x: number; y: number }) {
        current = next
        update(current)
      },
      destroy() {
        over?.removeAttribute('data-over')
      },
    }
  }
</script>

{#snippet pdfIcon(small: boolean)}
  <span class="up-pdf" data-small={small || undefined}>
    <span class="up-pdf__band">{small ? '' : 'PDF'}</span>
  </span>
{/snippet}

{#snippet uploadRow(mb: number, done: boolean)}
  {#snippet upState()}
    <Meter className="up-track" value={mb / MB} />
  {/snippet}
  {#snippet doneState()}
    <span>Just now</span>
  {/snippet}
  <div class="up-row up-new" data-done={done || undefined}>
    <span class="up-name">
      {@render pdfIcon(true)}
      <span class="up-name__text">{FILE}</span>
    </span>
    <States
      value={done ? 'done' : 'up'}
      align="start"
      states={{ up: upState, done: doneState }}
    />
    <span class="up-size">
      <Count value={mb} duration={600} format={(n) => n.toFixed(1)} />
      {' MB'}
    </span>
  </div>
{/snippet}

{#snippet folderIcon()}
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" class="up-folder" aria-hidden="true">
    <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
  </svg>
{/snippet}

{#snippet fileIcon()}
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" class="up-doc" aria-hidden="true">
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" fill="none" />
  </svg>
{/snippet}

{#snippet chevronLeft()}
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="m15 18-6-6 6-6" />
  </svg>
{/snippet}

{#snippet chevronRight()}
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="up-nav-off" aria-hidden="true">
    <path d="m9 18 6-6-6-6" />
  </svg>
{/snippet}

{#snippet layoutGrid()}
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <rect width="7" height="7" x="3" y="3" rx="1" />
    <rect width="7" height="7" x="14" y="3" rx="1" />
    <rect width="7" height="7" x="14" y="14" rx="1" />
    <rect width="7" height="7" x="3" y="14" rx="1" />
  </svg>
{/snippet}

{#snippet listIcon()}
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M8 6h13" />
    <path d="M8 12h13" />
    <path d="M8 18h13" />
    <path d="M3 6h.01" />
    <path d="M3 12h.01" />
    <path d="M3 18h.01" />
  </svg>
{/snippet}

{#snippet shareIcon()}
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
    <polyline points="16 6 12 2 8 6" />
    <line x1="12" x2="12" y1="2" y2="15" />
  </svg>
{/snippet}

{#snippet searchIcon()}
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
{/snippet}

<Stage
  width={760}
  height={420}
  compact={{ below: 560, width: 400, height: 340 }}
  {initial}
  {script}
  accent="#0a6de6"
  keys={{ wide: 'bottom-left', compact: 'top' }}
  cursor={{ at: { at: 'drop', x: 0.36, y: 0.32 } }}
  className="up"
>
  {#snippet children(s, _rect, layout)}
    {@const g = GEO[layout]}
    {@const lifted = s.ghost.on && !s.ghost.dropped}
    {@const following = s.ghost.on && !s.ghost.dropped}
    <div class="up-desk" data-target="desk-file" data-lifted={lifted || undefined} style={`left:${g.desk.x}px;top:${g.desk.y}px`}>
      <span data-target="desk-icon">
        {@render pdfIcon(false)}
      </span>
      <span class="up-desk__name">{FILE}</span>
    </div>

    <Window
      className="up-window"
      style={`left:${g.win.x}px;top:${g.win.y}px;width:${g.win.w}px;height:${g.win.h}px`}
      body={{ class: 'up-body', 'data-crop': true }}
    >
      {#snippet lead()}
        <span class="up-lead">
          <span class="up-nav">
            {@render chevronLeft()}
            {@render chevronRight()}
          </span>
          <span class="up-heading">Projects</span>
        </span>
      {/snippet}
      {#snippet toolbar()}
        <span class="up-tools">
          <span class="up-views">
            <span class="up-view">
              {@render layoutGrid()}
            </span>
            <span class="up-view" data-on>
              {@render listIcon()}
            </span>
          </span>
          {@render shareIcon()}
          {@render searchIcon()}
        </span>
      {/snippet}

      <div class="up-list" data-compact={layout === 'compact' || undefined} style={`--cols:${g.cols}`}>
        <div class="up-head">
          <span>Name</span>
          <span>{layout === 'wide' ? 'Date Modified' : 'Modified'}</span>
          <span>Size</span>
        </div>
        <div class="up-rows" data-target="drop" data-drop>
          <Collapse open={s.up}>
            {@render uploadRow(s.mb, s.done)}
          </Collapse>
          {#each ROWS.slice(0, g.rows) as r, i}
            {@const k = layout === 'wide' ? 1 : 0.75}
            <div class="up-row">
              <span class="up-name">
                {#if r.kind === 'folder'}
                  {@render folderIcon()}
                {:else}
                  {@render fileIcon()}
                {/if}
                <Bar w={Math.round(r.name * k)} h={7} tone={3} />
              </span>
              <Bar w={Math.round(r.date * k)} h={7} tone={2} />
              {#if r.kind === 'folder'}
                <Bar w={r.size} h={2} tone={3} />
              {:else}
                <Bar w={r.size} h={7} tone={2} />
              {/if}
            </div>
          {/each}
        </div>
      </div>
    </Window>

    <div
      class="up-drag"
      data-show={following || undefined}
      data-dropped={s.ghost.dropped || undefined}
      style={`transform:translate(${s.ghost.at.x - s.ghost.off.x}px, ${s.ghost.at.y - s.ghost.off.y}px)`}
      aria-hidden="true"
      use:dragFollow={{ following, x: s.ghost.at.x, y: s.ghost.at.y }}
    >
      <div class="up-drag__inner" style={`transform-origin:${s.ghost.off.x}px ${s.ghost.off.y}px`}>
        {@render pdfIcon(false)}
        <span class="up-drag__name">{FILE}</span>
      </div>
    </div>
  {/snippet}
</Stage>
