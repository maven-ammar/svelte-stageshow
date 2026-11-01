<script lang="ts">
  import { Badge, Bar, Collapse, Spinner, Stage, Window, type Act } from 'svelte-stageshow'
  import './dark-hero.css'

  // A dark desktop hero: a deploy lands at the top of a project's deployments
  // and goes live. Beats: the new deploy opens in at the top and pushes the
  // list down, Building with a spinner; its timer counts; the badge turns to
  // Ready on the same pill and the timer settles on the build's time; the
  // row's Current mark moves to it.

  type S = { open: boolean; ready: boolean; t: number }

  const initial: S = { open: false, ready: false, t: 0 }

  async function script(a: Act<S>) {
    await a.wait(900)
    a.mark('deploy')
    a.put({ open: true })
    for (let t = 1; t <= 4; t++) {
      await a.wait(520)
      a.put({ t: t * 9 })
    }
    await a.wait(300)
    a.mark('ready')
    a.put({ ready: true, t: 38 })
    await a.wait(2000)
    // The list loses what the loop added in one motion; the closed row's
    // status and timer go back where nobody sees them
    a.put({ open: false })
    await a.wait(700)
    await a.snap({ ready: false, t: 0 })
  }

  const OLD = [
    { msg: 'Fix pricing copy', when: '2h ago', t: '41s' },
    { msg: null, when: null, t: null },
    { msg: null, when: null, t: null },
    { msg: null, when: null, t: null },
  ]

  let wBuilding = $state(0)
  let wReady = $state(0)
</script>

{#snippet side()}
  <nav class="dh-side">
    {#each [64, 88, 52, 76, 60] as w, i (i)}
      <span class="dh-nav" data-active={i === 1 || undefined}>
        <Bar w={12} h={12} r={3} tone={i === 1 ? 4 : 2} />
        <Bar w={w} h={6} tone={i === 1 ? 4 : 2} />
      </span>
    {/each}
  </nav>
{/snippet}

<Stage
  width={760}
  height={440}
  compact={{ below: 760, width: 358, height: 440 }}
  theme="dark"
  {initial}
  poster={{ open: true, ready: true, t: 38 }}
  {script}
  className="dh"
>
  {#snippet children(s, _rect, layout)}
    {@const on = s.ready ? 1 : 0}
    {@const widths = [wBuilding, wReady]}
    {@const shrink = widths[0] > 0 && widths[1] > 0 && widths[on] < widths[1 - on]}
    <Window
      url="app.shipyard.dev/northwind/deployments"
      className="dh-win"
      sidebarWidth={168}
      sidebar={layout === 'compact' ? undefined : side}
    >
      <div class="dh-body">
        <header class="dh-head">
          <div class="dh-title">Deployments</div>
          <span class="dh-proj">
            <Bar w={14} h={14} r={4} tone={3} />
            northwind-web
          </span>
        </header>
        <div class="dh-list">
          <Collapse open={s.open} reveal="drop">
            <div class="dh-row" data-lead>
              <span class="dh-lines">
                <span class="dh-msg">
                  Add annual plans
                  <span class="dh-current" data-on={s.ready || undefined}>Current</span>
                </span>
                <!-- Each icon is held with its words, and the pairs sit a clear
                     gap apart, so no word runs into the next icon -->
                <span class="dh-meta">
                  <span class="dh-meta__item">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                      <line x1="6" x2="6" y1="3" y2="15" />
                      <circle cx="18" cy="6" r="3" />
                      <circle cx="6" cy="18" r="3" />
                      <path d="M18 9a9 9 0 0 1-9 9" />
                    </svg>
                    main
                  </span>
                  <span class="dh-meta__item">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                      <circle cx="12" cy="12" r="3" />
                      <line x1="3" x2="9" y1="12" y2="12" />
                      <line x1="15" x2="21" y1="12" y2="12" />
                    </svg>
                    a41c9e2
                  </span>
                  <span class="dh-when">Just now</span>
                </span>
              </span>
              <Badge tone={s.ready ? 'success' : 'neutral'} className="dh-badge">
                {#snippet icon()}
                  <span class="dh-mark" data-ready={s.ready || undefined}>
                    <Spinner size={8} />
                    <i class="dh-dot"></i>
                  </span>
                {/snippet}
                <span class="dh-label" data-shrink={shrink || undefined} style={widths[0] && widths[1] ? `width:${widths[on]}px` : undefined}>
                  <span class="dh-word" data-on={!s.ready || undefined} bind:clientWidth={wBuilding}>Building</span>
                  <span class="dh-word" data-on={s.ready || undefined} bind:clientWidth={wReady}>Ready</span>
                </span>
              </Badge>
              <span class="dh-time">{s.t}s</span>
            </div>
          </Collapse>
          {#each OLD as r, i (i)}
            {#if r.msg}
              <div class="dh-row">
                <span class="dh-lines">
                  <span class="dh-msg">
                    {r.msg}
                    <span class="dh-current" data-on={!(s.open && s.ready) || undefined}>Current</span>
                  </span>
                  <span class="dh-meta">
                    <span class="dh-meta__item">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <line x1="6" x2="6" y1="3" y2="15" />
                        <circle cx="18" cy="6" r="3" />
                        <circle cx="6" cy="18" r="3" />
                        <path d="M18 9a9 9 0 0 1-9 9" />
                      </svg>
                      main
                    </span>
                    <span class="dh-meta__item">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <circle cx="12" cy="12" r="3" />
                        <line x1="3" x2="9" y1="12" y2="12" />
                        <line x1="15" x2="21" y1="12" y2="12" />
                      </svg>
                      7d02b18
                    </span>
                    <span class="dh-when">{r.when}</span>
                  </span>
                </span>
                <Badge tone="neutral" className="dh-badge dh-badge--old">
                  {#snippet icon()}
                    <span class="dh-mark" data-ready>
                      <Spinner size={8} />
                      <i class="dh-dot"></i>
                    </span>
                  {/snippet}
                  Ready
                </Badge>
                <span class="dh-time">{r.t}</span>
              </div>
            {:else}
              <div class="dh-row dh-row--filler">
                <span class="dh-lines">
                  <Bar w={[180, 150, 200][i - 1]} h={8} r={4} tone={2} />
                  <Bar w={110} h={7} r={3.5} tone={1} />
                </span>
                <Bar w={52} h={18} r={9} tone={1} />
                <Bar w={28} h={7} r={3.5} tone={1} />
              </div>
            {/if}
          {/each}
        </div>
      </div>
    </Window>
  {/snippet}
</Stage>
