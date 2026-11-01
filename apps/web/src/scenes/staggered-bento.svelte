<script lang="ts">
  import { Count, Icon, Phone, Stage, type Act } from 'svelte-stageshow'
  import './staggered-bento.css'

  // A staggered pair, light: the features section of Wayline, an invented
  // travel journal for iPhone. Two columns of rounded tiles, tall and short
  // alternating so no row lines up across the columns (Apple's MacBook grid).
  //
  // One phone and no window: two of six tiles are UI. The coast is the one
  // tile with its own ground. Across and down, no kind sits next to itself.
  // Each picture is its own Stage at 1:1, pinned to its tile's bottom. The
  // coast holds still; each tile that moves plays one beat, once, 110ms after
  // the one before it in reading order.

  const STEP = 110
  const LEAD = 450

  type Beat = { on: boolean }
  const before: Beat = { on: false }
  const after: Beat = { on: true }
  const beat = (i: number) => async (a: Act<Beat>) => {
    await a.wait(LEAD + i * STEP)
    await a.set({ on: true })
  }

  let distanceSeen = $state(false)
  let reduced = $state(false)
  let voiceW = $state(340)
  let bookW = $state(340)
  let dayW = $state(340)
  let dayGutter = $state(26)

  $effect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    reduced = mq.matches
    const on = () => (reduced = mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  })

  function watchView(node: HTMLElement, delay: number) {
    let t: ReturnType<typeof setTimeout> | undefined
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      io.disconnect()
      t = setTimeout(() => (distanceSeen = true), delay)
    }, { threshold: 0.4 })
    io.observe(node)
    return {
      destroy() {
        io.disconnect()
        clearTimeout(t)
      },
    }
  }

  function measurePicture(node: HTMLElement, key: 'voice' | 'book' | 'day') {
    const measure = () => {
      const width = node.clientWidth
      const gutter = parseFloat(getComputedStyle(node).getPropertyValue('--pad'))
      if (key === 'voice') voiceW = width
      else if (key === 'book') bookW = width
      else {
        dayW = width
        dayGutter = gutter
      }
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(node)
    return { destroy() { observer.disconnect() } }
  }

  /* ---------------- Coast (the hero picture) ---------------- */

  // One still, a blue-and-white tile pattern: a different visual role from
  // every neighboring tile, with no external image or asset dependency.
  const AZ = { blue: '#1f3f8f', wash: '#8ea5d4', white: '#f6f3ec', grout: '#d3d9e5' }
  const T = 80
  // A lens from (0,-L) to (0,L), half-width w: both arcs share radius r
  const lens = (L: number, w: number) => {
    const r = (L * L + w * w) / (2 * w)
    return `M0 ${-L} A${r} ${r} 0 0 1 0 ${L} A${r} ${r} 0 0 1 0 ${-L} Z`
  }
  const CORNERS = [[0, 0], [T, 0], [0, T], [T, T]]
  const uid = $props.id()
  const cleanId = uid.replace(/:/g, '')
  const tileId = `az-tile-${cleanId}`
  const friezeId = `az-frieze-${cleanId}`
  const P = 300 // the field's top edge, on a row of tile corners
  const F = 40 // the frieze: a row of half tiles

  /* ---------------- Voice (component) ---------------- */

  const WAVE = Array.from({ length: 30 }, (_, i) => {
    const v = 0.3 + 0.45 * Math.abs(Math.sin(i * 0.55)) * (0.6 + 0.4 * Math.cos(i * 0.23)) + 0.2 * Math.abs(Math.sin(i * 1.9))
    return Math.min(1, v)
  })

  const dayPhoneWidth = $derived(Math.min(276, dayW - dayGutter * 2))
</script>

<div class="staggered-bento">
  <div class="sg-grid">
    <div class="sg-col">
      <section class="sg-tile sg-tile--coast" data-photo data-crop>
        <div class="sg-picture sg-picture--coast" data-art="azulejo">
          <Stage width={600} height={600} className="sg-stage">
            {#snippet children()}
              <div class="sg-art">
                <svg class="sg-art__svg" viewBox="0 0 600 600" width="600" height="600" aria-hidden="true">
                  <defs>
                    <pattern id={tileId} width={T} height={T} patternUnits="userSpaceOnUse" x={300 - T / 2} y={P}>
                      <rect width={T} height={T} fill={AZ.grout} />
                      <rect x="0.6" y="0.6" width={T - 1.2} height={T - 1.2} rx="1" fill={AZ.white} />
                      <!-- the net: a lens on each edge, center to center across the joint -->
                      {#each [[T / 2, 0, 0], [T, T / 2, 90], [T / 2, T, 0], [0, T / 2, 90]] as [x, y, r]}
                        <g transform={`translate(${x} ${y}) rotate(${r})`}>
                          <path d={lens(T / 2, 10)} fill={AZ.blue} />
                          <path d={lens(T / 2 - 13, 3.5)} fill={AZ.wash} />
                        </g>
                      {/each}
                      <!-- the boss where the lenses cross -->
                      <circle cx={T / 2} cy={T / 2} r="10" fill={AZ.blue} />
                      <circle cx={T / 2} cy={T / 2} r="5.5" fill={AZ.white} />
                      <circle cx={T / 2} cy={T / 2} r="2.25" fill={AZ.blue} />
                      <!-- a four-petal flower on every corner, completed by four tiles -->
                      {#each CORNERS as [x, y], i}
                        <g transform={`translate(${x} ${y})`}>
                          {#each [45, 135, 225, 315] as d}
                            <path d={lens(9, 4.5)} transform={`rotate(${d}) translate(0 -12)`} fill={AZ.blue} />
                          {/each}
                          <circle r="3" fill={AZ.wash} />
                        </g>
                      {/each}
                    </pattern>
                    <pattern id={friezeId} width={T} height={F} patternUnits="userSpaceOnUse" x={300} y={P - F}>
                      <rect width={T} height={F} fill={AZ.grout} />
                      <rect x="0.6" y="0.6" width={T - 1.2} height={F - 1.2} rx="1" fill={AZ.white} />
                      <rect y="0" width={T} height="5" fill={AZ.blue} />
                      <rect y={F - 5} width={T} height="5" fill={AZ.blue} />
                      <g transform={`translate(${T / 2} ${F / 2}) rotate(90)`}>
                        <path d={lens(T / 2, 7)} fill={AZ.blue} />
                        <path d={lens(T / 2 - 13, 2.5)} fill={AZ.wash} />
                      </g>
                      {#each [0, T] as x}
                        <g>
                          <circle cx={x} cy={F / 2} r="7" fill={AZ.blue} />
                          <circle cx={x} cy={F / 2} r="3" fill={AZ.white} />
                        </g>
                      {/each}
                    </pattern>
                  </defs>
                  <rect width="600" height="600" fill={AZ.blue} />
                  <rect y={P - F} width="600" height={F} fill={`url(#${friezeId})`} />
                  <rect y={P} width="600" height={600 - P} fill={`url(#${tileId})`} />
                </svg>
              </div>
            {/snippet}
          </Stage>
        </div>
        <p class="sg-copy">
          <b>Every trip, written up for you.</b> Wayline turns your photos into a journal, a page a day.
        </p>
      </section>

      <section class="sg-tile sg-tile--stat" data-crop>
        <div class="sg-stat" use:watchView={LEAD + 2 * STEP}>
          <span class="sg-stat-lead">This year you went</span>
          <span class="sg-stat-number">
            <span class="sg-stat-value">
              <span class="sg-stat-sizer" aria-hidden="true">38,604</span><Count value={distanceSeen || reduced ? 38604 : 0} duration={1600} /></span><span class="sg-stat-unit">km</span>
          </span>
          <span class="sg-stat-label">measured from where your photos were taken.</span>
        </div>
      </section>

      <section class="sg-tile sg-tile--book" data-crop>
        <div class="sg-picture sg-picture--small" use:measurePicture={'book'}>
          <Stage width={bookW} height={190} initial={before} poster={after} play="once" script={beat(4)} className="sg-stage">
            {#snippet children(s)}
              <div class="sg-books" data-on={s.on || undefined}>
                <span class="sg-book sg-book--back" aria-hidden="true"></span>
                <span class="sg-book sg-book--front">
                  <span class="sg-book__spine" aria-hidden="true"></span>
                  <span class="sg-book__title">Portugal</span>
                  <span class="sg-book__by">Maya Chen · 2026</span>
                </span>
              </div>
            {/snippet}
          </Stage>
        </div>
        <p class="sg-copy">
          <b>Print the trip.</b> Clothbound, at your door in a week.
        </p>
      </section>
    </div>

    <div class="sg-col">
      <section class="sg-tile sg-tile--private" data-crop>
        <div class="sg-statement">
          <Icon name="lock" filled size={30} className="sg-lock" />
          <p class="sg-statement__text">
            <b>Private by design.</b> Your journal stays on your iPhone.
          </p>
        </div>
      </section>

      <section class="sg-tile sg-tile--voice" data-crop>
        <div class="sg-picture sg-picture--small" use:measurePicture={'voice'}>
          <Stage width={voiceW} height={206} initial={before} poster={after} play="once" script={beat(3)} className="sg-stage">
            {#snippet children(s)}
              <div class="sg-note" data-on={s.on || undefined}>
                <div class="sg-recorder">
                  <span class="sg-rec" aria-hidden="true">
                    <span class="sg-rec__stop"></span>
                  </span>
                  <span class="sg-wave" aria-hidden="true">
                    {#each WAVE as h, i}
                      <span class="sg-wave__bar" style={`--h:${h};--i:${i}`}></span>
                    {/each}
                  </span>
                  <span class="sg-rec__time">
                    0:<Count value={s.on ? 14 : 0} duration={1400} format={(n) => String(Math.round(n)).padStart(2, '0')} />
                  </span>
                </div>
                <p class="sg-transcript">“Fog all morning, then the whole coast at once.”</p>
                <div class="sg-transcript-rest">
                  <span style="width:88%"></span>
                  <span style="width:64%"></span>
                </div>
              </div>
            {/snippet}
          </Stage>
        </div>
        <p class="sg-copy">
          <b>Say it instead.</b> Voice notes become the day’s words.
        </p>
      </section>

      <section class="sg-tile sg-tile--day" data-crop>
        <div class="sg-picture sg-picture--phone" use:measurePicture={'day'}>
          <Stage width={dayW} height={400} initial={before} poster={after} play="once" script={beat(5)} className="sg-stage">
            {#snippet children(s)}
              <!-- Centered in its tile: the one device in the grid stands in
                   the middle of its card, running off the bottom -->
              <Phone width={dayPhoneWidth} className="sg-phone" style={`left:${(dayW - dayPhoneWidth) / 2}px`} data-on={s.on || undefined}>
                <div class="sg-page">
                  <div class="sg-page__head">
                    <span class="sg-page__eyebrow">Day 2 · Tuesday</span>
                    <span class="sg-page__title">Sintra</span>
                  </div>
                  <div class="sg-mapcard">
                    <!-- Fills the card at the page width, so its edge lines up with the photos under it -->
                    <svg viewBox="0 0 345 190" width="100%" height="190" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
                      <rect width="345" height="190" fill="#eef0e6" />
                      <path d="M0 150 C60 140 110 160 170 150 C230 140 290 120 345 128 L345 190 L0 190 Z" fill="#cfe1ea" />
                      <path d="M30 0 C60 40 70 90 130 110 M200 0 C190 50 230 80 300 90 M0 70 C80 60 160 80 345 60" stroke="#ffffff" stroke-width="5" fill="none" />
                      <path d="M120 20 C150 30 170 26 190 40" stroke="#dfe3d4" stroke-width="14" stroke-linecap="round" fill="none" />
                      <path class="sg-route" d="M60 120 C90 100 104 72 140 70 C176 68 186 104 220 98 C252 92 258 52 290 44" pathLength={1} stroke="#f2643b" stroke-width="4" stroke-linecap="round" fill="none" />
                      <circle cx="60" cy="120" r="7" fill="#fff" stroke="#f2643b" stroke-width="3" />
                      <circle class="sg-route__end" cx="290" cy="44" r="7" fill="#f2643b" stroke="#fff" stroke-width="3" />
                    </svg>
                  </div>
                  <div class="sg-thumbs">
                    <span class="sg-thumb sg-thumb--a"></span>
                    <span class="sg-thumb sg-thumb--b"></span>
                    <span class="sg-thumb sg-thumb--c"></span>
                  </div>
                  <div class="sg-lines">
                    <span style="width:92%"></span>
                    <span style="width:84%"></span>
                    <span style="width:58%"></span>
                  </div>
                </div>
              </Phone>
            {/snippet}
          </Stage>
        </div>
        <p class="sg-copy">
          <b>A page for every day.</b> Route, photos and notes, laid out for you.
        </p>
      </section>
    </div>
  </div>
</div>
