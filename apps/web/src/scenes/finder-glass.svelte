<script lang="ts">
  import { Bar, Stage, States, Text, Window, type Act, type Layout } from 'svelte-stageshow'
  import './finder-glass.css'

  // Finder in the Liquid Glass design (macOS Tahoe, 26), in column view, drawn
  // from a real macOS 26 screenshot: a floating rounded sidebar panel inset in
  // the window that holds the larger traffic lights, a toolbar with no bar of
  // its own (separate glass buttons, each with its label under it, the icon and
  // text mode), the path bar as one rounded capsule with a round + beside it,
  // and columns split by hairlines.
  //
  // The story: in films, a click on japan slides its column in and the title
  // follows; a click picks a photo in it; Space opens Quick Look out of its
  // thumbnail and Space again zooms it back; a click on films in the first
  // column closes the japan column, which is exactly where the loop began.
  //
  // Icons: Finder has no web icon pack, so lucide is used deliberately for its
  // SF Symbols-like outlines (one family, one stroke).

  type S = { lis: boolean; file: boolean; ql: boolean }

  const initial: S = { lis: false, file: false, ql: false }

  const FILE = 'Fuji.jpg'

  type Geo = {
    win: { x: number; y: number; w: number; h: number }
    side: number
    /** The folders shown as columns, left to right: films, japan and before them, in wide, Documents */
    docs: boolean
    ql: { x: number; y: number; w: number }
  }

  const GEO: Record<Layout, Geo> = {
    wide: { win: { x: 40, y: 40, w: 780, h: 480 }, side: 196, docs: true, ql: { x: 328, y: 142, w: 270 } },
    compact: { win: { x: 20, y: 20, w: 460, h: 400 }, side: 132, docs: false, ql: { x: 20, y: 108, w: 232 } },
  }

  const QL_BAR = 38
  const qlHeight = (w: number) => QL_BAR + Math.round((w * 3) / 4)

  // Column rows: what each row is, and how long its placeholder name runs
  type Kind = 'folder' | 'doc' | 'image'
  type GlassRow = { kind: Kind; name: number | string; target?: string }

  const DOCUMENTS: GlassRow[] = [
    { kind: 'folder', name: 74 },
    { kind: 'folder', name: 96 },
    { kind: 'folder', name: 'films', target: 'films' },
    { kind: 'folder', name: 62 },
    { kind: 'doc', name: 104 },
    { kind: 'doc', name: 82 },
    { kind: 'doc', name: 92 },
  ]

  const FILMS: GlassRow[] = [
    { kind: 'folder', name: 58 },
    { kind: 'folder', name: 'japan', target: 'japan' },
    { kind: 'folder', name: 72 },
    { kind: 'doc', name: 96 },
    { kind: 'doc', name: 80 },
    { kind: 'doc', name: 88 },
  ]

  const LISBON: GlassRow[] = [
    { kind: 'image', name: 70 },
    { kind: 'image', name: 88 },
    { kind: 'image', name: FILE, target: 'file' },
    { kind: 'image', name: 64 },
    { kind: 'image', name: 80 },
  ]

  async function script(a: Act<S>) {
    await a.wait(700)

    // 1. Open japan: its column slides in and the title follows
    a.mark('folder')
    await a.click({ at: 'japan', x: 0.62, y: 0.6 })
    await a.set({ lis: true })
    await a.wait(900)

    // 2. Pick the photo in it
    a.mark('file')
    await a.click({ at: 'file', x: 0.66, y: 0.6 })
    await a.set({ file: true })
    await a.wait(600)

    // 3. Space: Quick Look zooms out of the thumbnail
    a.mark('open')
    await a.key('space')
    await a.set({ ql: true })
    await a.wait(2400)

    // 4. Space again: it zooms back into the row
    a.mark('close')
    await a.key('space')
    await a.set({ ql: false })
    await a.wait(800)

    // 5. Back to films: the japan column closes, as at the start
    a.mark('back')
    // (compact has no first column: Back does it, aimed at the back half)
    await a.click(a.layout === 'wide' ? { at: 'films', x: 0.66, y: 0.6 } : { at: 'back', x: 0.4, y: 0.56 })
    await a.set({ lis: false, file: false })
    await a.wait(1400)
  }

  // The same local photograph is shared by its thumbnail and Quick Look.
  const PHOTO = new URL('../assets/kawaguchiko.jpg', import.meta.url).href
  const ALT_PHOTO = new URL('../assets/fuji.jpg', import.meta.url).href

  type Sel = 'focus' | 'quiet' | undefined
</script>

{#snippet icon(name: string, size = 16, stroke = 1.6, className = '')}
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
    {:else if name === 'users'}
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    {:else if name === 'app-window'}
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M10 4v4" />
      <path d="M2 8h20" />
      <path d="M6 4v4" />
    {:else if name === 'folder'}
      <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
    {:else if name === 'circle-arrow-down'}
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v8" />
      <path d="m8 12 4 4 4-4" />
    {:else if name === 'monitor'}
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8" />
      <path d="M12 17v4" />
    {:else if name === 'file-text'}
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M10 9H8" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
    {:else if name === 'file'}
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    {:else if name === 'house'}
      <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
      <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    {:else if name === 'chevron-left'}
      <path d="m15 18-6-6 6-6" />
    {:else if name === 'chevron-right'}
      <path d="m9 18 6-6-6-6" />
    {:else if name === 'chevron-down'}
      <path d="m6 9 6 6 6-6" />
    {:else if name === 'chevrons-up-down'}
      <path d="m7 15 5 5 5-5" />
      <path d="m7 9 5-5 5 5" />
    {:else if name === 'columns'}
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 3v18" />
      <path d="M15 3v18" />
    {:else if name === 'layout-grid'}
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
    {:else if name === 'ellipsis'}
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
      <circle cx="5" cy="12" r="1" />
    {:else if name === 'share'}
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <path d="M12 2v15" />
    {:else if name === 'tag'}
      <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
      <circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />
    {:else if name === 'search'}
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    {:else if name === 'plus'}
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    {:else if name === 'x'}
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    {:else if name === 'maximize'}
      <path d="M15 3h6v6" />
      <path d="M9 21H3v-6" />
      <path d="M21 3l-7 7" />
      <path d="M3 21l7-7" />
    {/if}
  </svg>
{/snippet}

{#snippet names(on: boolean, align: 'start' | 'center' = 'start')}
  <States className="fgl-names" value={on ? 'japan' : 'films'} {align} states={{ films: 'films', japan: 'japan' }} />
{/snippet}

{#snippet fileIcon(kind: Kind, thumb = false)}
  {#if kind === 'folder'}
    {@render icon('folder', 15, 1.25, 'fgl-folder')}
  {:else if kind === 'doc'}
    {@render icon('file', 15, 1.25, 'fgl-doc')}
  {:else}
    <span class="fgl-thumb" data-target={thumb ? 'thumb' : undefined}>
      <img class="fgl-photo" src={thumb ? PHOTO : ALT_PHOTO} alt="" draggable={false} />
    </span>
  {/if}
{/snippet}

{#snippet column(rows: GlassRow[], sel: Record<string, Sel>, open = true)}
  <div class="fgl-col" data-open={open || undefined}>
    {#each rows as r, i}
      {@const state = r.target ? sel[r.target] : undefined}
      <div class="fgl-row" data-sel={state} data-target={r.target}>
        {@render fileIcon(r.kind, r.target === 'file')}
        {#if typeof r.name === 'string'}
          <span class="fgl-row__name">{r.name}</span>
        {:else}
          <Bar w={r.name} h={6} tone={3} />
        {/if}
        {#if r.kind === 'folder'}
          {@render icon('chevron-right', 12, 2, 'fgl-row__chev')}
        {/if}
      </div>
    {/each}
  </div>
{/snippet}

<Stage
  width={860}
  height={440}
  compact={{ below: 560, width: 400, height: 340 }}
  {initial}
  {script}
  accent="#0a6de6"
  greys="cool"
  cursor={{ at: { wide: { at: 'films', x: 0.66, y: 0.6 }, compact: { at: 'back', x: 0.4, y: 0.56 } } }}
  className="fgl"
>
  {#snippet children(s: S, rect, layout)}
    {@const g = GEO[layout]}
    {@const wide = layout === 'wide'}
    {@const qh = qlHeight(g.ql.w)}
    <!-- Quick Look closed sits on the thumbnail, shrunk to its width. It
         zooms by layout, not transform, so its text lands without a hop -->
    {@const t = rect('thumb')}
    {@const k = t.width ? t.width / g.ql.w : 0.05}
    {@const qlStyle = s.ql
      ? `left:${g.ql.x}px;top:${g.ql.y}px;width:${g.ql.w}px;height:${qh}px;border-radius:18px`
      : `left:${t.x}px;top:${t.y + t.height / 2 - (qh * k) / 2}px;width:${g.ql.w * k}px;height:${qh * k}px;border-radius:${18 * k}px`}
    <Window
      className="fgl-window"
      style={`left:${g.win.x}px;top:${g.win.y}px;width:${g.win.w}px;height:${g.win.h}px`}
      sidebarWidth={g.side}
      sidebarStyle="floating"
      lightsSize="large"
      barSize="tall"
      body={{ class: 'fgl-body', 'data-crop': '' }}
    >
      {#snippet sidebar()}
        <div class="fgl-side">
          <div class="fgl-side__item">
            <span class="fgl-side__icon">{@render icon('clock', 16, 1.6)}</span>
            <Text>Recents</Text>
          </div>
          <div class="fgl-side__item">
            <span class="fgl-side__icon">{@render icon('users', 16, 1.6)}</span>
            <Text>Shared</Text>
          </div>
          <Text className="fgl-side__label">Favorites</Text>
          <div class="fgl-side__item">
            <span class="fgl-side__icon">{@render icon('app-window', 16, 1.6)}</span>
            <Text>Applications</Text>
          </div>
          <div class="fgl-side__item">
            <span class="fgl-side__icon">{@render icon('folder', 16, 1.6)}</span>
            <Text>Studio</Text>
          </div>
          <div class="fgl-side__item">
            <span class="fgl-side__icon">{@render icon('circle-arrow-down', 16, 1.6)}</span>
            <Text>Downloads</Text>
          </div>
          <div class="fgl-side__item">
            <span class="fgl-side__icon">{@render icon('monitor', 16, 1.6)}</span>
            <Text>Desktop</Text>
            {@render icon('cloud', 13, 1.6, 'fgl-side__cloud')}
          </div>
          <div class="fgl-side__item" data-current>
            <span class="fgl-side__icon">{@render icon('file-text', 16, 1.6)}</span>
            <Text>Documents</Text>
            {@render icon('cloud', 13, 1.6, 'fgl-side__cloud')}
          </div>
          <Text className="fgl-side__label">Locations</Text>
          <div class="fgl-side__item">
            <span class="fgl-side__icon">{@render icon('cloud', 16, 1.6)}</span>
            <Text>iCloud Drive</Text>
          </div>
          <div class="fgl-side__item">
            <span class="fgl-side__icon">{@render icon('house', 16, 1.6)}</span>
            <Text>mayachen</Text>
          </div>
        </div>
      {/snippet}
      {#snippet lead()}
        <span class="fgl-lead">
          <span class="fgl-tool">
            <span class="fgl-cap fgl-nav" data-target={wide ? undefined : 'back'}>
              {@render icon('chevron-left', 16, 1.6)}
              <span class="fgl-nav__rule"></span>
              {@render icon('chevron-right', 16, 1.6, 'fgl-off')}
            </span>
            <span class="fgl-tool__label">Back/Forward</span>
          </span>
          <span class="fgl-heading">
            {@render names(s.lis)}
          </span>
        </span>
      {/snippet}
      {#snippet toolbar()}
        {#if wide}
          <span class="fgl-tools">
            <span class="fgl-tool">
              <span class="fgl-cap">
                {@render icon('columns', 16, 1.6)}
                {@render icon('chevrons-up-down', 11, 2)}
              </span>
              <span class="fgl-tool__label">View</span>
            </span>
            <span class="fgl-tool">
              <span class="fgl-cap">
                {@render icon('layout-grid', 16, 1.6)}
                {@render icon('chevron-down', 11, 2)}
              </span>
              <span class="fgl-tool__label">Group</span>
            </span>
            <span class="fgl-tool">
              <span class="fgl-round">
                {@render icon('ellipsis', 16, 1.6)}
              </span>
              <span class="fgl-tool__label">Action</span>
            </span>
            <span class="fgl-tool">
              <span class="fgl-round">
                {@render icon('share', 16, 1.6)}
              </span>
              <span class="fgl-tool__label">Share</span>
            </span>
            <span class="fgl-tool">
              <span class="fgl-round">
                {@render icon('tag', 16, 1.6)}
              </span>
              <span class="fgl-tool__label">Add Tags</span>
            </span>
            <span class="fgl-tool">
              <span class="fgl-round">
                {@render icon('search', 16, 1.6)}
              </span>
              <span class="fgl-tool__label">Search</span>
            </span>
          </span>
        {/if}
      {/snippet}
      <div class="fgl-path">
        <span class="fgl-path__tab">
          {@render names(s.lis, 'center')}
        </span>
        <span class="fgl-path__add">
          {@render icon('plus', 14, 1.75)}
        </span>
      </div>
      <div class="fgl-cols" data-docs={g.docs || undefined}>
        {#if g.docs}
          {@render column(DOCUMENTS, { films: s.lis ? 'quiet' : 'focus' })}
        {/if}
        {@render column(FILMS, { japan: s.lis ? (s.file ? 'quiet' : 'focus') : undefined })}
        {@render column(LISBON, { file: s.file ? 'focus' : undefined }, s.lis)}
      </div>
    </Window>

    <div class="fgl-ql" data-open={s.ql || undefined} style={qlStyle}>
      <div class="fgl-ql__bar" style={`height:${s.ql ? QL_BAR : QL_BAR * k}px`}>
        <span class="fgl-round fgl-ql__round">
          {@render icon('x', 14, 1.75)}
        </span>
        <span class="fgl-round fgl-ql__round">
          {@render icon('maximize', 12, 1.75)}
        </span>
        <span class="fgl-ql__title">{FILE}</span>
        {#if g.ql.w >= 300}<span class="fgl-cap fgl-ql__open">Open with Preview</span>{/if}
        <span class="fgl-round fgl-ql__round">
          {@render icon('share', 14, 1.75)}
        </span>
      </div>
      <img class="fgl-photo fgl-ql__photo" src={PHOTO} alt="" draggable={false} />
    </div>
  {/snippet}
</Stage>
