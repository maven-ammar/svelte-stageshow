<script lang="ts">
  import { Bar, Menu, Popover, Stage, Text, Window, type Act, type Layout } from 'svelte-stageshow'
  import './notion.css'

  // Notion's slash command. Beats: click into an empty line, press "/", the
  // block menu opens, pick "To-do list", type a task, tick it off. The finished
  // task stays checked until the host's Replay starts on the empty line.
  // Real words: the page title, the placeholder, the menu, the task.

  type S = {
    focus: boolean
    slash: boolean
    menu: boolean
    active: number | undefined
    todo: boolean
    task: string
    typing: boolean
    done: boolean
  }

  const initial: S = {
    focus: false,
    slash: false,
    menu: false,
    active: 0,
    todo: false,
    task: '',
    typing: false,
    done: false,
  }

  const TITLE = 'Launch plan'
  const TASK = 'Send launch email'

  type Item = { label: string; hint: string; icon: string }
  const ITEMS: Item[] = [
    { label: 'Text', hint: '', icon: 'type' },
    { label: 'Heading 1', hint: '#', icon: 'heading-1' },
    { label: 'Heading 2', hint: '##', icon: 'heading-2' },
    { label: 'Heading 3', hint: '###', icon: 'heading-3' },
    { label: 'Bulleted list', hint: '-', icon: 'list' },
    { label: 'Numbered list', hint: '1.', icon: 'list-ordered' },
    { label: 'To-do list', hint: '[]', icon: 'square-check' },
  ]
  const TODO = ITEMS.findIndex((i) => i.label === 'To-do list')

  async function script(a: Act<S>) {
    await a.wait(500)

    // Click into the empty line under the paragraph
    await a.click({ at: 'line', x: 0.72, y: 0.5 })
    await a.set({ focus: true })
    await a.wait(600)

    // "/" opens the block menu, its first row selected
    a.mark('slash')
    await a.key('/')
    await a.set({ slash: true })
    await a.wait(90)
    await a.set({ menu: true })
    await a.wait(800)

    // The pointer takes over the selection, then runs down to To-do list
    await a.move({ at: 'item-0', x: 0.62, y: 0.55 })
    await a.set({ active: undefined })
    await a.wait(200)
    await a.move({ at: `item-${TODO}`, x: 0.62, y: 0.6 })
    await a.wait(350)
    a.mark('pick')
    await a.click()
    await a.set({ menu: false, todo: true })
    await a.wait(650)

    // Type the task
    await a.set({ typing: true })
    await a.type('task', TASK, { interval: 65 })
    await a.set({ typing: false })
    await a.wait(500)

    // Tick it off
    await a.click({ at: 'check', x: 0.72, y: 0.78 })
    a.mark('tick')
    await a.set({ done: true, focus: false })
    await a.wait(2200)

    // Step away and keep the completed task visible. Replay is the reset.
    await a.move({ at: 'rest', x: 0.5, y: 0.5 })
    a.mark('done')
  }

  type GlyphNode = readonly [string, Record<string, string | number>]
  const GLYPHS: Record<string, GlyphNode[]> = {
    check: [['path', { d: 'M20 6 9 17l-5-5' }]],
    'chevron-down': [['path', { d: 'm6 9 6 6 6-6' }]],
    'chevrons-right': [
      ['path', { d: 'm6 17 5-5-5-5' }],
      ['path', { d: 'm13 17 5-5-5-5' }],
    ],
    ellipsis: [
      ['circle', { cx: 12, cy: 12, r: 1 }],
      ['circle', { cx: 19, cy: 12, r: 1 }],
      ['circle', { cx: 5, cy: 12, r: 1 }],
    ],
    'file-text': [
      ['path', { d: 'M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z' }],
      ['path', { d: 'M14 2v4a2 2 0 0 0 2 2h4' }],
      ['path', { d: 'M10 9H8' }],
      ['path', { d: 'M16 13H8' }],
      ['path', { d: 'M16 17H8' }],
    ],
    'grip-vertical': [
      ['circle', { cx: 9, cy: 12, r: 1 }],
      ['circle', { cx: 9, cy: 5, r: 1 }],
      ['circle', { cx: 9, cy: 19, r: 1 }],
      ['circle', { cx: 15, cy: 12, r: 1 }],
      ['circle', { cx: 15, cy: 5, r: 1 }],
      ['circle', { cx: 15, cy: 19, r: 1 }],
    ],
    'heading-1': [
      ['path', { d: 'M4 12h8' }],
      ['path', { d: 'M4 18V6' }],
      ['path', { d: 'M12 18V6' }],
      ['path', { d: 'm17 12 3-2v8' }],
    ],
    'heading-2': [
      ['path', { d: 'M4 12h8' }],
      ['path', { d: 'M4 18V6' }],
      ['path', { d: 'M12 18V6' }],
      ['path', { d: 'M21 18h-4c0-4 4-3 4-6 0-1.5-2-2.5-4-1' }],
    ],
    'heading-3': [
      ['path', { d: 'M4 12h8' }],
      ['path', { d: 'M4 18V6' }],
      ['path', { d: 'M12 18V6' }],
      ['path', { d: 'M17.5 10.5c1.7-1 3.5 0 3.5 1.5a2 2 0 0 1-2 2' }],
      ['path', { d: 'M17 17.5c2 1.5 4 .3 4-1.5a2 2 0 0 0-2-2' }],
    ],
    house: [
      ['path', { d: 'M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8' }],
      ['path', { d: 'M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' }],
    ],
    inbox: [
      ['polyline', { points: '22 12 16 12 14 15 10 15 8 12 2 12' }],
      ['path', { d: 'M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z' }],
    ],
    list: [
      ['path', { d: 'M3 12h.01' }],
      ['path', { d: 'M3 18h.01' }],
      ['path', { d: 'M3 6h.01' }],
      ['path', { d: 'M8 12h13' }],
      ['path', { d: 'M8 18h13' }],
      ['path', { d: 'M8 6h13' }],
    ],
    'list-ordered': [
      ['path', { d: 'M10 12h11' }],
      ['path', { d: 'M10 18h11' }],
      ['path', { d: 'M10 6h11' }],
      ['path', { d: 'M4 10h2' }],
      ['path', { d: 'M4 6h1v4' }],
      ['path', { d: 'M6 18H4c0-1 2-2 2-3s-1-1.5-2-1' }],
    ],
    plus: [
      ['path', { d: 'M5 12h14' }],
      ['path', { d: 'M12 5v14' }],
    ],
    search: [
      ['circle', { cx: 11, cy: 11, r: 8 }],
      ['path', { d: 'm21 21-4.3-4.3' }],
    ],
    'square-check': [
      ['rect', { width: 18, height: 18, x: 3, y: 3, rx: 2 }],
      ['path', { d: 'm9 12 2 2 4-4' }],
    ],
    star: [['path', { d: 'M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z' }]],
    type: [
      ['polyline', { points: '4 7 4 4 20 4 20 7' }],
      ['line', { x1: 9, x2: 15, y1: 20, y2: 20 }],
      ['line', { x1: 12, x2: 12, y1: 4, y2: 20 }],
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

{#snippet sidebar()}
  <div class="nt-side">
    <div class="nt-ws">
      <span class="nt-ws__mark">B</span>
      <Bar w={74} h={7} tone={4} />
      {@render glyph('chevron-down', 13, 2, 'nt-ico-faint')}
    </div>
    <div class="nt-nav">
      {#each [{ name: 'search', w: 40 }, { name: 'house', w: 34 }, { name: 'inbox', w: 38 }] as row}
        <div class="nt-nav__row">
          {@render glyph(row.name, 16, 1.75, 'nt-ico')}
          <Bar w={row.w} h={6} tone={3} />
        </div>
      {/each}
    </div>
    <div class="nt-section">
      <Bar w={36} h={5} tone={2} />
    </div>
    <div class="nt-nav">
      {#each [62, 0, 48, 70, 54] as w}
        <div class="nt-nav__row" data-active={w === 0 || undefined}>
          {@render glyph('file-text', 16, 1.75, 'nt-ico')}
          {#if w === 0}
            <Text className="nt-nav__label">{TITLE}</Text>
          {:else}
            <Bar w={w} h={6} tone={3} />
          {/if}
        </div>
      {/each}
    </div>
  </div>
{/snippet}

{#snippet crumb(compact: boolean)}
  <span class="nt-crumb">
    {#if compact}
      {@render glyph('chevrons-right', 16, 1.75, 'nt-ico nt-crumb__toggle')}
    {/if}
    {@render glyph('file-text', 14, 1.75, 'nt-ico')}
    <Text className="nt-crumb__label">{TITLE}</Text>
  </span>
{/snippet}

{#snippet tools()}
  <span class="nt-tools">
    <span class="nt-share">Share</span>
    {@render glyph('star', 16, 1.75, 'nt-ico')}
    {@render glyph('ellipsis', 16, 1.75, 'nt-ico')}
  </span>
{/snippet}

{#snippet itemText()}
  <span class="nt-menu__icon">{@render glyph('type', 18, 1.75, '')}</span>
  <span class="nt-menu__label">Text</span>
  <span class="nt-menu__hint"></span>
{/snippet}

{#snippet itemHeading1()}
  <span class="nt-menu__icon">{@render glyph('heading-1', 18, 1.75, '')}</span>
  <span class="nt-menu__label">Heading 1</span>
  <span class="nt-menu__hint">#</span>
{/snippet}

{#snippet itemHeading2()}
  <span class="nt-menu__icon">{@render glyph('heading-2', 18, 1.75, '')}</span>
  <span class="nt-menu__label">Heading 2</span>
  <span class="nt-menu__hint">##</span>
{/snippet}

{#snippet itemHeading3()}
  <span class="nt-menu__icon">{@render glyph('heading-3', 18, 1.75, '')}</span>
  <span class="nt-menu__label">Heading 3</span>
  <span class="nt-menu__hint">###</span>
{/snippet}

{#snippet itemBulleted()}
  <span class="nt-menu__icon">{@render glyph('list', 18, 1.75, '')}</span>
  <span class="nt-menu__label">Bulleted list</span>
  <span class="nt-menu__hint">-</span>
{/snippet}

{#snippet itemNumbered()}
  <span class="nt-menu__icon">{@render glyph('list-ordered', 18, 1.75, '')}</span>
  <span class="nt-menu__label">Numbered list</span>
  <span class="nt-menu__hint">1.</span>
{/snippet}

{#snippet itemTodo()}
  <span class="nt-menu__icon">{@render glyph('square-check', 18, 1.75, '')}</span>
  <span class="nt-menu__label">To-do list</span>
  <span class="nt-menu__hint">[]</span>
{/snippet}

<Stage play="once" width={720} height={538} compact={{ below: 600, width: 400, height: 494 }} initial={initial} poster={{ ...initial, todo: true, task: TASK, done: true }} script={script} cursor={{ at: { at: 'rest', x: 0.5, y: 0.5 } }} keys={{ wide: 'bottom-left', compact: 'bottom-right' }} accent="#2383e2" className="nt">
  {#snippet children(s: S, _rect, layout: Layout)}
    {@const compact = layout === 'compact'}

    {#snippet page()}
      <div class="nt-page">
        <div class="nt-title">{TITLE}</div>
        <div class="nt-block">
          <Bar w="92%" h={7} tone={3} />
        </div>
        <div class="nt-block">
          <Bar w="58%" h={7} tone={3} />
        </div>

        <!-- The line the story happens on: a text line that becomes a to-do -->
        <div class="nt-line" data-target="line" data-cursor="ibeam">
          <span class="nt-handle" aria-hidden="true">
            {@render glyph('plus', 16, 1.75, '')}
            {@render glyph('grip-vertical', 16, 1.75, '')}
          </span>

          <div class="nt-layer nt-text" data-show={!s.todo || undefined}>
            {#if s.slash}<span class="nt-slash">/</span>{/if}
            <span class="nt-caret" data-show={(s.focus && !s.todo) || undefined}></span>
            <span class="nt-placeholder" data-show={(s.focus && !s.slash) || undefined}>
              Press ‘/’ for commands
            </span>
          </div>

          <div class="nt-layer nt-todo" data-show={s.todo || undefined} data-done={s.done || undefined}>
            <span class="nt-box" data-target="check" data-cursor="hand">
              {@render glyph('check', 12, 3.25, '')}
            </span>
            <span class="nt-todo__text">
              {s.task}
              <span class="nt-caret" data-show={(s.focus && s.todo) || undefined} data-typing={s.typing || undefined}></span>
              <span class="nt-placeholder" data-show={(s.focus && !s.task) || undefined}>
                To-do
              </span>
            </span>
          </div>

          <Popover show={s.menu} className="nt-menu" origin="top left">
            <div class="nt-menu__head">Basic blocks</div>
            <Menu
              className="nt-items"
              value={s.active}
              targets={ITEMS.map((_, i) => `item-${i}`)}
              items={[itemText, itemHeading1, itemHeading2, itemHeading3, itemBulleted, itemNumbered, itemTodo]}
            />
          </Popover>
        </div>

        <div class="nt-block nt-h2">
          <Bar w={120} h={10} tone={4} />
        </div>
        <div class="nt-block">
          <Bar w="84%" h={7} tone={3} />
        </div>
        <div class="nt-block">
          <Bar w="66%" h={7} tone={3} />
        </div>
      </div>
    {/snippet}

    {#if compact}
      <Window className="nt-window">
        {#snippet lead()}{@render crumb(true)}{/snippet}
        {@render page()}
      </Window>
    {:else}
      <Window className="nt-window" sidebar={sidebar} sidebarWidth={224}>
        {#snippet lead()}{@render crumb(false)}{/snippet}
        {#snippet toolbar()}{@render tools()}{/snippet}
        {@render page()}
      </Window>
    {/if}
    <!-- Where the pointer rests between loops, over the page's empty right side -->
    <span class="nt-rest" data-target="rest"></span>
  {/snippet}
</Stage>
