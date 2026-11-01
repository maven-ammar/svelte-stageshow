<script lang="ts">
  import { Bar, Stage, Swap, Text, Window, type Act } from 'svelte-stageshow'
  import './spotify.css'

  type Id = 'a' | 'b'
  type S = { playing: Id; sel: Id; elapsed: number }

  const initial: S = { playing: 'a', sel: 'a', elapsed: 0 }

  const SONGS: Record<Id, { title: string; artist: string; art: number; dur: number }> = {
    a: { title: 'Low Tide', artist: 'Marlo', art: 2, dur: 196 },
    b: { title: 'Neon Harbor', artist: 'The Vales', art: 4, dur: 168 },
  }

  // Rows of the playlist. Real text only on the two songs the story plays.
  const ROWS: { id?: Id; art: number; t: number; ar: number; al: number }[] = [
    { id: 'a', art: 2, t: 0, ar: 0, al: 58 },
    { art: 3, t: 52, ar: 46, al: 82 },
    { id: 'b', art: 4, t: 0, ar: 0, al: 64 },
    { art: 1, t: 64, ar: 40, al: 70 },
    { art: 5, t: 70, ar: 34, al: 50 },
    { art: 6, t: 58, ar: 44, al: 74 },
  ]

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  async function script(a: Act<S>) {
    // The song keeps playing under everything the cursor does
    let live = true
    ;(async () => {
      try {
        while (live) {
          await a.wait(1000)
          if (live) a.put((s) => ({ elapsed: s.elapsed + 1 }))
        }
      } catch {
        /* stopped */
      }
    })()

    await a.wait(1400)

    // Play Neon Harbor
    a.mark('play')
    await a.move({ at: 'row-b', x: 0.72, y: 0.5 })
    await a.wait(350)
    await a.click(undefined, { double: true })
    await a.set({ playing: 'b', sel: 'b', elapsed: 0 })
    await a.wait(1100)

    // Down to the player, where the new song is running: hovering the
    // progress bar lights it green and shows its handle, as Spotify does
    a.mark('progress')
    await a.move({ at: 'progress', x: 0.62, y: 0.5 })
    await a.wait(4400)

    // Back to Low Tide, which starts again from the top: the opening frame
    a.mark('back')
    await a.move({ at: 'row-a', x: 0.72, y: 0.5 })
    await a.wait(350)
    await a.click(undefined, { double: true })
    live = false
    await a.set({ playing: 'a', sel: 'a', elapsed: 0 })
  }
</script>

{#snippet art(n: number, className: string)}
  <span class={`spt-art spt-art--${n}${className ? ` ${className}` : ''}`}></span>
{/snippet}

{#snippet eq()}
  <span class="spt-eq" aria-hidden="true">
    <i></i>
    <i></i>
    <i></i>
    <i></i>
  </span>
{/snippet}

{#snippet chevronLeft(size: number)}
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="m15 18-6-6 6-6" />
  </svg>
{/snippet}

{#snippet chevronRight(size: number, className: string)}
  <svg class={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="m9 18 6-6-6-6" />
  </svg>
{/snippet}

{#snippet house(size: number)}
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
    <path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
  </svg>
{/snippet}

{#snippet search(size: number)}
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
{/snippet}

{#snippet library(size: number)}
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="m16 6 4 14" />
    <path d="M12 6v14" />
    <path d="M8 8v12" />
    <path d="M4 4v16" />
  </svg>
{/snippet}

{#snippet plus(size: number)}
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </svg>
{/snippet}

{#snippet pause(size: number)}
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true">
    <rect x="14" y="4" width="4" height="16" rx="1" />
    <rect x="6" y="4" width="4" height="16" rx="1" />
  </svg>
{/snippet}

{#snippet shuffle(size: number, className: string)}
  <svg class={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="m18 14 4 4-4 4" />
    <path d="m18 2 4 4-4 4" />
    <path d="M2 18h1.973a4 4 0 0 0 3.3-1.7l5.454-8.6a4 4 0 0 1 3.3-1.7H22" />
    <path d="M2 6h1.972a4 4 0 0 1 3.6 2" />
    <path d="M22 18h-6.041a4 4 0 0 1-3.3-1.8l-.359-.45" />
  </svg>
{/snippet}

{#snippet circlePlus(size: number, className: string)}
  <svg class={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <path d="M8 12h8" />
    <path d="M12 8v8" />
  </svg>
{/snippet}

{#snippet clock(size: number, className: string)}
  <svg class={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
{/snippet}

{#snippet skipBack(size: number, className: string)}
  <svg class={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true">
    <polygon points="19 20 9 12 19 4 19 20" />
    <line x1="5" x2="5" y1="19" y2="5" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
  </svg>
{/snippet}

{#snippet skipForward(size: number, className: string)}
  <svg class={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true">
    <polygon points="5 4 15 12 5 20 5 4" />
    <line x1="19" x2="19" y1="5" y2="19" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
  </svg>
{/snippet}

{#snippet repeat(size: number, className: string)}
  <svg class={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="m17 2 4 4-4 4" />
    <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
    <path d="m7 22-4-4 4-4" />
    <path d="M21 13v1a4 4 0 0 1-4 4H3" />
  </svg>
{/snippet}

{#snippet micVocal(size: number, className: string)}
  <svg class={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="m11 7.601-5.994 8.19a1 1 0 0 0 .1 1.298l.817.818a1 1 0 0 0 1.314.087L15.09 12" />
    <path d="M16.5 21.174C15.5 20.5 14.372 20 13 20c-2.058 0-3.928 2.356-6 2-2.072-.356-2.775-3.369-1.5-4.5" />
    <circle cx="16" cy="7" r="5" />
  </svg>
{/snippet}

{#snippet listMusic(size: number, className: string)}
  <svg class={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M21 15V6" />
    <path d="M18.5 18a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
    <path d="M12 12H3" />
    <path d="M16 6H3" />
    <path d="M12 18H3" />
  </svg>
{/snippet}

{#snippet monitorSpeaker(size: number, className: string)}
  <svg class={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M5.5 20H8" />
    <path d="M17 9h.01" />
    <rect width="10" height="16" x="12" y="4" rx="2" />
    <path d="M8 6H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h4" />
    <circle cx="17" cy="15" r="1" />
  </svg>
{/snippet}

{#snippet volume2(size: number, className: string)}
  <svg class={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z" />
    <path d="M16 9a5 5 0 0 1 0 6" />
    <path d="M19.364 18.364a9 9 0 0 0 0-12.728" />
  </svg>
{/snippet}

<Stage
  width={860}
  height={600}
  compact={{ below: 600, width: 400, height: 520 }}
  {initial}
  {script}
  theme="dark"
  accent="#1ed760"
  cursor={{ at: { at: 'row-a', x: 0.72, y: 0.5 } }}
  className="spt-stage"
>
  {#snippet children(s, _rect, layout)}
    {@const song = SONGS[s.playing]}
    {@const compact = layout === 'compact'}
    <Window className="spt-window" data-layout={layout}>
      {#snippet lead()}
        <span class="spt-nav">
          {@render chevronLeft(18)}
          {@render chevronRight(18, 'spt-faint')}
        </span>
        <span class="spt-center">
          <span class="spt-home">
            {@render house(16)}
          </span>
          <span class="spt-search">
            {@render search(15)}
            <Bar w={compact ? 96 : 196} h={5} tone={3} />
          </span>
        </span>
      {/snippet}
      {#snippet toolbar()}<span class="spt-me"></span>{/snippet}

      <div class="spt-panels">
        <!-- Your Library -->
        <aside class="spt-library" data-crop>
          {#if compact}
            <div class="spt-lib-head spt-lib-head--rail">
              {@render library(18)}
            </div>
          {:else}
            <div class="spt-lib-head">
              {@render library(18)}
              <Text className="spt-lib-title">Your Library</Text>
              <span class="spt-spacer"></span>
              {@render plus(16)}
            </div>
            <div class="spt-chips">
              <Bar w={58} h={24} r={12} tone={2} />
              <Bar w={48} h={24} r={12} tone={2} />
            </div>
          {/if}
          <div class="spt-lib-list" data-crop>
            {#each [
              { art: 7, t: 72, m: 50, on: true },
              { art: 3, t: 54, m: 62 },
              { art: 8, t: 66, m: 40 },
              { art: 5, t: 48, m: 56 },
              { art: 1, t: 60, m: 44 },
              { art: 6, t: 52, m: 58 },
              { art: 2, t: 68, m: 42 },
            ] as p}
              <div class="spt-lib-row" data-on={p.on || undefined}>
                {@render art(p.art, 'spt-art--lib')}
                {#if !compact}
                  <span class="spt-lines">
                    <Bar w={p.t} h={5} tone={p.on ? 5 : 3} />
                    <Bar w={p.m} h={4} tone={2} />
                  </span>
                {/if}
              </div>
            {/each}
          </div>
        </aside>

        <!-- The playlist -->
        <main class="spt-main" data-crop>
          <header class="spt-header">
            {@render art(7, 'spt-art--cover')}
            <div class="spt-heading">
              <Bar w={44} h={4} tone={4} />
              <Text className="spt-title">Late Night Drive</Text>
              <span class="spt-meta">
                <span class="spt-meta-dot"></span>
                <Bar w={compact ? 60 : 96} h={4} tone={3} />
              </span>
            </div>
          </header>

          <div class="spt-actions">
            <span class="spt-bigplay">
              {@render pause(18)}
            </span>
            {@render shuffle(20, 'spt-faint-icon')}
            {@render circlePlus(20, 'spt-faint-icon')}
            <span class="spt-more">
              <i></i>
              <i></i>
              <i></i>
            </span>
          </div>

          <div class="spt-tracks">
            <div class="spt-row spt-row--head">
              <span class="spt-num">#</span>
              <Bar w={30} h={4} tone={3} />
              {#if !compact}<Bar w={34} h={4} tone={3} />{/if}
              {@render clock(14, 'spt-faint-icon spt-dur')}
            </div>
            {#each ROWS as r, i}
              {@const real = r.id ? SONGS[r.id] : null}
              {@const on = r.id === s.playing}
              <div
                class="spt-row"
                data-target={r.id ? `row-${r.id}` : undefined}
                data-playing={on || undefined}
                data-selected={r.id === s.sel || undefined}
              >
                <span class="spt-num">
                  <span class="spt-num__n">{i + 1}</span>
                  {@render eq()}
                </span>
                <span class="spt-song">
                  {@render art(r.art, 'spt-art--row')}
                  {#if real}
                    <span class="spt-song-text">
                      <span class="spt-song-title">{real.title}</span>
                      <span class="spt-song-artist">{real.artist}</span>
                    </span>
                  {:else}
                    <span class="spt-lines">
                      <Bar w={r.t} h={5} tone={4} />
                      <Bar w={r.ar} h={4} tone={2} />
                    </span>
                  {/if}
                </span>
                {#if !compact}<Bar w={r.al} h={4} tone={2} />{/if}
                <span class="spt-dur">
                  <Bar w={24} h={4} tone={2} />
                </span>
              </div>
            {/each}
          </div>
        </main>
      </div>

      <!-- Now playing -->
      <footer class="spt-player">
        <div class="spt-now">
          <!-- Both songs sit in the same place and crossfade: the art keeps its
               edges, and the column is as wide as the longer title, so the
               + after it stays put -->
          <span class="spt-now-art">
            {#each ['a', 'b'] as id}
              {@render art(SONGS[id as Id].art, `spt-art--now${s.playing === id ? ' is-on' : ''}`)}
            {/each}
          </span>
          <span class="spt-now-text">
            {#each ['a', 'b'] as id}
              <span class="spt-now-song" data-on={s.playing === id || undefined} aria-hidden={s.playing !== id || undefined}>
                <span class="spt-now-title">{SONGS[id as Id].title}</span>
                <span class="spt-now-artist">{SONGS[id as Id].artist}</span>
              </span>
            {/each}
          </span>
          {#if !compact}{@render circlePlus(16, 'spt-faint-icon')}{/if}
        </div>

        <div class="spt-transport">
          <div class="spt-controls">
            {@render shuffle(16, 'spt-faint-icon')}
            {@render skipBack(16, 'spt-ctl')}
            <span class="spt-playbtn">
              {@render pause(14)}
            </span>
            {@render skipForward(16, 'spt-ctl')}
            {@render repeat(16, 'spt-faint-icon')}
          </div>
          <div class="spt-progress">
            <span class="spt-t spt-t--start">{fmt(s.elapsed)}</span>
            <span class="spt-track" data-target="progress">
              {#key s.playing}
                <span
                  class="spt-fill"
                  style={`clip-path:inset(0 ${(1 - s.elapsed / song.dur) * 100}% 0 0 round 2px)`}
                ></span>
              {/key}
              {#key `k${s.playing}`}
                <span class="spt-knob" style={`transform:translateX(${(s.elapsed / song.dur) * 100}%)`}>
                  <i></i>
                </span>
              {/key}
            </span>
            <span class="spt-t">
              <Swap id={s.playing} duration={500}>
                {fmt(song.dur)}
              </Swap>
            </span>
          </div>
        </div>

        <div class="spt-extras" hidden={compact}>
          {@render micVocal(16, 'spt-faint-icon')}
          {@render listMusic(16, 'spt-faint-icon')}
          {@render monitorSpeaker(16, 'spt-faint-icon')}
          {@render volume2(16, 'spt-faint-icon')}
          <span class="spt-volume">
            <span></span>
          </span>
        </div>
      </footer>
    </Window>
  {/snippet}
</Stage>
