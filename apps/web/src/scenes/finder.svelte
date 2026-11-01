<script lang="ts">
  import { Bar, Collapse, Stage, Text, Window, type Act, type Layout, type Point } from 'svelte-stageshow'
  import './finder.css'

  // Finder, list view. The user selects a photo, presses Space and Quick Look
  // zooms out of its thumbnail; Space again and it zooms back. Then they drag the
  // file onto Wallpapers in the sidebar: the drag image rides with the arrow (as
  // macOS draws it, no grabbing hand), Wallpapers lights up under it, the row
  // leaves the list. Cmd+Z puts it back and a click in the empty list clears the
  // selection, which is exactly where the loop began.
  //
  // Icons: Finder has no web icon pack, so lucide is used deliberately for its
  // SF Symbols-like outline sidebar glyphs (one family, one stroke).

  type Ghost = { on: boolean; dropped: boolean; off: Point; at: Point }
  type S = { sel: boolean; ql: boolean; moved: boolean; ghost: Ghost }

  const initial: S = { sel: false, ql: false, moved: false, ghost: { on: false, dropped: false, off: { x: 0, y: 0 }, at: { x: 0, y: 0 } } }

  const FILE = 'Fuji.jpg'
  const DROP = 'Wallpapers'

  type Geo = {
    win: { x: number; y: number; w: number; h: number }
    side: number
    rows: number
    cols: string
    ql: { x: number; y: number; w: number }
  }

  const GEO: Record<Layout, Geo> = {
    wide: { win: { x: 40, y: 40, w: 880, h: 500 }, side: 180, rows: 10, cols: 'minmax(0, 1fr) 150px 76px 120px', ql: { x: 350, y: 66, w: 380 } },
    compact: { win: { x: 24, y: 24, w: 520, h: 420 }, side: 150, rows: 8, cols: '196px 140px 70px 110px', ql: { x: 68, y: 72, w: 264 } },
  }

  const QL_BAR = 38
  const qlHeight = (w: number) => QL_BAR + Math.round((w * 3) / 4)

  // The list: what each row is, and how long its placeholder name runs.
  type Kind = 'folder' | 'doc' | 'image' | 'hero'
  type FinderRow = { kind: Kind; name: number; date: number; size: number; type: number }
  const ROWS: FinderRow[] = [
    { kind: 'folder', name: 92, date: 88, size: 14, type: 40 },
    { kind: 'doc', name: 124, date: 80, size: 34, type: 72 },
    { kind: 'folder', name: 70, date: 92, size: 14, type: 40 },
    { kind: 'hero', name: 0, date: 84, size: 38, type: 64 },
    { kind: 'image', name: 108, date: 76, size: 36, type: 64 },
    { kind: 'doc', name: 86, date: 90, size: 30, type: 78 },
    { kind: 'folder', name: 116, date: 84, size: 14, type: 40 },
    { kind: 'doc', name: 98, date: 78, size: 40, type: 70 },
    { kind: 'image', name: 80, date: 88, size: 34, type: 64 },
    { kind: 'doc', name: 112, date: 82, size: 32, type: 74 },
  ]

  async function script(a: Act<S>) {
    await a.wait(500)

    // 1. Select the photo: click the row, clear of its name
    a.mark('select')
    const row = a.rect('row-hero')
    await a.click({ x: row.x + 176, y: row.y + row.height * 0.6 })
    await a.set({ sel: true })
    await a.wait(650)

    // 2. Space: Quick Look zooms out of the thumbnail
    a.mark('open')
    await a.key('space')
    await a.set({ ql: true })
    await a.wait(2400)

    // 3. Space again: it zooms back into the row
    a.mark('close')
    await a.key('space')
    await a.set({ ql: false })
    await a.wait(700)

    // 4. Drag the file by its icon onto Wallpapers in the sidebar
    a.mark('drag')
    const icon = a.rect('hero-drag')
    const thumb = a.rect('thumb')
    const grab = { x: thumb.x + thumb.width / 2, y: thumb.y + thumb.height / 2 + 1 }
    await a.move(grab)
    await a.wait(220)
    const line = a.rect('row-hero')
    const off = { x: grab.x - icon.x, y: grab.y - line.y }
    // Finder keeps its arrow. Pickup and each carried position belong to the
    // drag callback, so the image and cursor are painted together after press.
    // Drop just past the folder's name, so the drag image never hides it.
    const drop = a.rect('side-drop')
    await a.drag({ x: drop.x + 114, y: drop.y + drop.height * 0.55 }, (at) => {
      a.put({ ghost: { on: true, dropped: false, off, at } })
    }, { duration: 1150, cursor: 'preserve' })
    a.mark('drop')
    await a.set((s) => ({ moved: true, ghost: { ...s.ghost, dropped: true } }))
    await a.wait(1900)

    // 5. Cmd+Z: the move is undone and the file comes back, still selected
    a.mark('undo')
    await a.key('cmd+z')
    await a.set({ moved: false, ghost: initial.ghost })
    await a.wait(1100)

    // 6. A click in the empty list clears the selection: back to the start
    await a.click({ at: 'blank', x: 0.56, y: 0.5 })
    await a.set({ sel: false })
    await a.wait(900)
  }

  // The same local photograph is shared by its thumbnail and Quick Look.
  const PHOTO = new URL('../assets/kawaguchiko.jpg', import.meta.url).href
  const ALT_PHOTO = new URL('../assets/fuji.jpg', import.meta.url).href

  /** The drag image uses the same frame's callback point, with no second RAF. */
  function dragOver(node: HTMLElement, param: { ghost: Ghost }) {
    let ghost = param.ghost
    let over: HTMLElement | null = null
    const run = () => {
      const following = ghost.on && !ghost.dropped
      let next: HTMLElement | null = null
      const root = node.closest<HTMLElement>('.ss-stage')
      if (following && root) {
        const bounds = root.getBoundingClientRect()
        const scale = bounds.width / root.offsetWidth || 1
        const hit = document.elementFromPoint(bounds.left + ghost.at.x * scale, bounds.top + ghost.at.y * scale)?.closest<HTMLElement>('[data-drop]') ?? null
        if (hit && root.contains(hit)) next = hit
      }
      if (next !== over) {
        over?.removeAttribute('data-over')
        next?.setAttribute('data-over', '')
        over = next
      }
    }
    run()
    return {
      update(next: { ghost: Ghost }) {
        ghost = next.ghost
        run()
      },
      destroy() {
        over?.removeAttribute('data-over')
      },
    }
  }
</script>

{#snippet icon(name: string, size = 15, stroke = 1.6, className = '')}
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width={stroke}
    stroke-linecap="round"
    stroke-linejoin="round"
    class={className}
    aria-hidden="true"
  >
    {#if name === 'clock'}
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    {:else if name === 'cloud'}
      <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
    {:else if name === 'download'}
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="M7 10l5 5 5-5" />
      <path d="M12 15V3" />
    {:else if name === 'file'}
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    {:else if name === 'file-text'}
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M10 9H8" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
    {:else if name === 'folder'}
      <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
    {:else if name === 'hard-drive'}
      <path d="M22 12H2" />
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11Z" />
      <path d="M6 16h.01" />
      <path d="M10 16h.01" />
    {:else if name === 'layout-grid'}
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
    {:else if name === 'list'}
      <path d="M8 6h13" />
      <path d="M8 12h13" />
      <path d="M8 18h13" />
      <path d="M3 6h.01" />
      <path d="M3 12h.01" />
      <path d="M3 18h.01" />
    {:else if name === 'maximize'}
      <path d="M15 3h6v6" />
      <path d="M9 21H3v-6" />
      <path d="M21 3l-7 7" />
      <path d="M3 21l7-7" />
    {:else if name === 'monitor'}
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8" />
      <path d="M12 17v4" />
    {:else if name === 'search'}
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    {:else if name === 'share'}
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <path d="M12 2v15" />
    {:else if name === 'x'}
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    {:else if name === 'app-window'}
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M10 4v4" />
      <path d="M2 8h20" />
      <path d="M6 4v4" />
    {:else if name === 'chevron-left'}
      <path d="m15 18-6-6 6-6" />
    {:else if name === 'chevron-right'}
      <path d="m9 18 6-6-6-6" />
    {/if}
  </svg>
{/snippet}

{#snippet fileIcon(kind: Kind)}
  {#if kind === 'folder'}
    {@render icon('folder', 16, 1.25, 'fq-folder')}
  {:else if kind === 'doc'}
    {@render icon('file', 16, 1.25, 'fq-doc')}
  {:else}
    <span class="fq-thumb" data-target={kind === 'hero' ? 'thumb' : undefined}>
      <img class="fq-photo" src={kind === 'image' ? ALT_PHOTO : PHOTO} alt="" draggable={false} />
    </span>
  {/if}
{/snippet}

{#snippet fileRow(r: FinderRow, hero = false, sel = false)}
  <div class="fq-row" data-sel={sel || undefined} data-target={hero ? 'row-hero' : undefined}>
    <span class="fq-name">
      <span class="fq-name__drag" data-target={hero ? 'hero-drag' : undefined}>
        {@render fileIcon(r.kind)}
        {#if hero}
          <span class="fq-name__text">{FILE}</span>
        {:else}
          <Bar w={r.name} h={6} tone={3} />
        {/if}
      </span>
    </span>
    <Bar w={r.date} h={6} tone={2} />
    {#if r.kind === 'folder'}
      <Bar w={r.size} h={2} tone={3} />
    {:else}
      <Bar w={r.size} h={6} tone={2} />
    {/if}
    <Bar w={r.type} h={6} tone={2} />
  </div>
{/snippet}

<Stage
  width={820}
  height={420}
  compact={{ below: 560, width: 400, height: 340 }}
  {initial}
  {script}
  accent="#0a6de6"
  cursor={{ at: { at: 'blank', x: 0.56, y: 0.5 } }}
  className="fq"
>
  {#snippet children(s: S, rect, layout)}
    {@const g = GEO[layout]}
    {@const qh = qlHeight(g.ql.w)}
    <!-- Quick Look closed sits on the thumbnail, shrunk to its width. It
         zooms by layout, not transform, so its text lands without a hop -->
    {@const t = rect('thumb')}
    {@const k = t.width ? t.width / g.ql.w : 0.05}
    {@const qlStyle = s.ql
      ? `left:${g.ql.x}px;top:${g.ql.y}px;width:${g.ql.w}px;height:${qh}px;border-radius:12px`
      : `left:${t.x}px;top:${t.y + t.height / 2 - (qh * k) / 2}px;width:${g.ql.w * k}px;height:${qh * k}px;border-radius:${12 * k}px`}
    {@const ghost = s.ghost}
    {@const following = ghost.on && !ghost.dropped}
    <Window
      className="fq-window"
      style={`left:${g.win.x}px;top:${g.win.y}px;width:${g.win.w}px;height:${g.win.h}px`}
      sidebarWidth={g.side}
      body={{ class: 'fq-body', 'data-crop': '' }}
    >
      {#snippet sidebar()}
        <div class="fq-side">
          <Bar w={44} h={5} tone={3} className="fq-side__label" />
          <div class="fq-side__item">
            <span class="fq-side__icon">{@render icon('clock', 15, 1.6)}</span>
            <Bar w={46} h={6} tone={3} />
          </div>
          <div class="fq-side__item">
            <span class="fq-side__icon">{@render icon('app-window', 15, 1.6)}</span>
            <Bar w={64} h={6} tone={3} />
          </div>
          <div class="fq-side__item">
            <span class="fq-side__icon">{@render icon('monitor', 15, 1.6)}</span>
            <Bar w={42} h={6} tone={3} />
          </div>
          <div class="fq-side__item">
            <span class="fq-side__icon">{@render icon('file-text', 15, 1.6)}</span>
            <Bar w={58} h={6} tone={3} />
          </div>
          <div class="fq-side__item" data-current>
            <span class="fq-side__icon">{@render icon('download', 15, 1.6)}</span>
            <Text>Downloads</Text>
          </div>
          <div class="fq-side__item" data-target="side-drop" data-drop>
            <span class="fq-side__icon">{@render icon('folder', 15, 1.6)}</span>
            <Text>{DROP}</Text>
          </div>
          <Bar w={52} h={5} tone={3} className="fq-side__label" />
          <div class="fq-side__item">
            <span class="fq-side__icon">{@render icon('cloud', 15, 1.6)}</span>
            <Bar w={56} h={6} tone={3} />
          </div>
          <div class="fq-side__item">
            <span class="fq-side__icon">{@render icon('hard-drive', 15, 1.6)}</span>
            <Bar w={70} h={6} tone={3} />
          </div>
        </div>
      {/snippet}
      {#snippet lead()}
        <span class="fq-lead">
          <span class="fq-nav">
            {@render icon('chevron-left', 17, 1.75)}
            {@render icon('chevron-right', 17, 1.75, 'fq-nav-off')}
          </span>
          <span class="fq-heading">Downloads</span>
        </span>
      {/snippet}
      {#snippet toolbar()}
        <span class="fq-tools">
          <span class="fq-views">
            <span class="fq-view">
              {@render icon('layout-grid', 14, 1.75)}
            </span>
            <span class="fq-view" data-on>
              {@render icon('list', 15, 1.75)}
            </span>
          </span>
          {@render icon('share', 15, 1.75)}
          {@render icon('search', 15, 1.75)}
        </span>
      {/snippet}
      <div class="fq-list" style={`--cols:${g.cols}`}>
        <div class="fq-head">
          <span>Name</span>
          <span>Date Modified</span>
          <span>Size</span>
          <span>Kind</span>
        </div>
        <div class="fq-rows">
          <!-- Stripes belong to positions, not to rows, as in AppKit:
               a row that leaves slides the rest up over them -->
          <div class="fq-stripes" aria-hidden="true">
            {#each Array.from({ length: g.rows + 4 }) as _, i}
              <span></span>
            {/each}
          </div>
          {#each ROWS.slice(0, g.rows) as r, i}
            {#if r.kind === 'hero'}
              <Collapse open={!s.moved}>
                {@render fileRow(r, true, s.sel)}
              </Collapse>
            {:else}
              {@render fileRow(r)}
            {/if}
          {/each}
          <div class="fq-blank" data-target="blank"></div>
        </div>
      </div>
    </Window>

    <div class="fq-ql" data-open={s.ql || undefined} style={qlStyle}>
      <div class="fq-ql__bar" style={`height:${s.ql ? 38 : 38 * k}px`}>
        <span class="fq-ql__btns">
          {@render icon('x', 14, 1.75)}
          {@render icon('maximize', 12, 1.75)}
        </span>
        <span class="fq-ql__title">{FILE}</span>
        <span class="fq-ql__right">
          {#if layout === 'wide'}<span class="fq-ql__open">Open with Preview</span>{/if}
          {@render icon('share', 14, 1.75)}
        </span>
      </div>
      <img class="fq-photo fq-ql__photo" src={PHOTO} alt="" draggable={false} />
    </div>

    <div
      class="fq-drag"
      use:dragOver={{ ghost }}
      data-show={following || undefined}
      data-dropped={ghost.dropped || undefined}
      style={`transform:translate(${ghost.at.x - ghost.off.x}px, ${ghost.at.y - ghost.off.y}px)`}
      aria-hidden="true"
    >
      <div class="fq-drag__inner" style={`transform-origin:${ghost.off.x}px ${ghost.off.y}px`}>
        <span class="fq-thumb">
          <img class="fq-photo" src={PHOTO} alt="" draggable={false} />
        </span>
        <span class="fq-drag__name">{FILE}</span>
      </div>
    </div>
  {/snippet}
</Stage>
