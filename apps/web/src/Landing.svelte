<script lang="ts">
  import DotHero from './DotHero.svelte'
  import StaticCard from './scenes/StaticCard.svelte'

  type Props = {
    scenes: string[]
  }

  let { scenes }: Props = $props()

  // static-card is mounted live above the strip, so it must not appear again in it.
  const strip = [
    'hero-demo',
    'bento',
    'phones',
    'google-calendar',
    'messages'
  ].filter((name) => scenes.includes(name))

  // The rail fades at its right edge while there is more to scroll, so the cut
  // card reads as "keep going" rather than as a mistake.
  let railEl = $state<HTMLDivElement | null>(null)
  let atEnd = $state(false)

  function syncRail() {
    const el = railEl
    if (!el) return
    atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 8
  }

  $effect(() => {
    syncRail()
    const onResize = () => syncRail()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  })

  const managers = [
    { id: 'pnpm', cmd: 'pnpm add svelte-stageshow' },
    { id: 'npm', cmd: 'npm install svelte-stageshow' },
    { id: 'yarn', cmd: 'yarn add svelte-stageshow' },
    { id: 'bun', cmd: 'bun add svelte-stageshow' }
  ]

  let manager = $state('npm')
  const command = $derived(managers.find((entry) => entry.id === manager)?.cmd ?? managers[0].cmd)

  // The active pill slides between tabs instead of the highlight jumping.
  let tabsEl = $state<HTMLDivElement | null>(null)
  const tabButtons: Record<string, HTMLButtonElement | undefined> = {}
  let pillX = $state(0)
  let pillW = $state(0)

  function syncPill() {
    const el = tabButtons[manager]
    if (!el) return
    pillX = el.offsetLeft
    pillW = el.offsetWidth
  }

  $effect(() => {
    manager
    syncPill()
  })

  $effect(() => {
    const onResize = () => syncPill()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  })

  const code = `<script lang="ts">
  import { Stage, Window } from 'svelte-stageshow'
  import 'svelte-stageshow/style.css'
<\\/script>

<Stage width={720} height={340}>
  <Window url="acme - invoices">
    <!-- your product, built from the kit's parts -->
  </Window>
</Stage>`

  let copied = $state(false)
  let timer: ReturnType<typeof setTimeout> | undefined

  async function copy() {
    // navigator.clipboard only exists in a secure context. The dev server is served
    // over plain HTTP on a tailnet IP, where it is undefined, so fall back to the
    // old selection-based copy instead of failing silently.
    let ok = false
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(command)
        ok = true
      }
    } catch {
      ok = false
    }
    if (!ok) {
      try {
        const area = document.createElement('textarea')
        area.value = command
        area.setAttribute('readonly', '')
        area.style.position = 'fixed'
        area.style.opacity = '0'
        document.body.appendChild(area)
        area.select()
        ok = document.execCommand('copy')
        document.body.removeChild(area)
      } catch {
        ok = false
      }
    }
    copied = ok
    clearTimeout(timer)
    timer = setTimeout(() => (copied = false), 1800)
  }
</script>

<main class="page">
  <header class="bar">
    <a class="mark" href="/">svelte stageshow</a>
    <span class="rule"></span>
    <span class="sub">A Svelte 5 port of Benji Taylor's Stageshow</span>
    <a class="src" href="/docs/">docs</a>
    <a class="src" href="https://benji.org/stageshow" target="_blank" rel="noreferrer">original</a>
  </header>

  <DotHero />

  <section class="port">
    <div class="claim">
      <h2>A complete port.</h2>
      <p>
        Benji Taylor's whole kit, rebuilt in Svelte 5 — every scene rendered and compared against his
        own output, with no React, react-dom or lucide at runtime.
      </p>
      <a
        class="evidence"
        href="https://github.com/maven-ammar/svelte-stageshow/blob/main/shots/acceptance.md"
        target="_blank"
        rel="noreferrer">71 comparisons, 71 matched — the acceptance table →</a
      >
    </div>
  </section>

  <section class="showcase" id="scenes">
    <div class="head">
      <h2>Explore demos</h2>
      <div class="aside">
        <p>
          Every scene is a working Svelte component — a frame, real chrome, and one moment worth
          showing.
        </p>
      </div>
    </div>

    <div class="rail" data-more={!atEnd}>
      <div class="carousel" bind:this={railEl} onscroll={syncRail}>
        <figure class="live">
          <a class="card" href="/scenes/static-card">
            <span class="stage-slot" aria-hidden="true">
              <StaticCard />
            </span>
            <span class="sr-only">static-card, live — open the scene</span>
          </a>
          <figcaption>
            <span>static-card · live</span>
            <a href="/scenes/static-card">open</a>
          </figcaption>
        </figure>
        {#each strip as name (name)}
          <figure>
            <a class="card" href={`/scenes/${name}`}>
              <img src={`/scenes/${name}.webp`} alt={`The ${name} scene`} loading="lazy" />
            </a>
            <figcaption>
              <span>{name}</span>
              <a href={`/scenes/${name}`}>open</a>
            </figcaption>
          </figure>
        {/each}
        <figure class="more">
          <a class="rail-more" href="/scenes/static-card">
            <span>All {scenes.length} scenes</span>
            <span class="rail-more__arrow" aria-hidden="true">→</span>
          </a>
        </figure>
      </div>
    </div>
  </section>

  <section class="snippet">
    <div class="head">
      <h2>Drop it into any Svelte 5 app.</h2>
      <div class="aside">
        <p>
          <code>Stage</code> sets the design size, <code>Window</code> draws the browser chrome, and
          your product's own markup goes inside it. The stylesheet carries the tokens.
        </p>
      </div>
    </div>
    <pre><code>{code}</code></pre>
  </section>

</main>

  <section class="cta">
    <h2>Everything Stageshow does, in Svelte.</h2>
    <p class="lede">
      The design language, the kit and the scenes were made by
      <a href="https://benji.org/stageshow" target="_blank" rel="noreferrer">Benji Taylor</a>. This
      is a port of that system to Svelte 5, with his rules intact and every scene checked against
      his own renders.
    </p>

    <div class="install">
      <div class="tabs" role="tablist" aria-label="Package manager" bind:this={tabsEl}>
        <span
          class="tab-pill"
          aria-hidden="true"
          style={`transform: translateX(${pillX}px); width: ${pillW}px`}
        ></span>
        {#each managers as entry (entry.id)}
          <button
            type="button"
            role="tab"
            aria-selected={manager === entry.id}
            data-on={manager === entry.id}
            bind:this={tabButtons[entry.id]}
            onclick={() => (manager = entry.id)}
          >
            {entry.id}
          </button>
        {/each}
      </div>
      <div class="actions">
        <button class="primary" type="button" onclick={copy} data-copied={copied}>
          <code>{command}</code>
          <span>{copied ? 'copied' : 'copy'}</span>
        </button>
        <a class="secondary" href="/scenes/static-card">See the demos</a>
      </div>
      <p class="caveat">
        Not on npm yet —
        <a
          href="https://github.com/maven-ammar/svelte-stageshow/releases/tag/v0.2.0"
          target="_blank"
          rel="noreferrer">download from source</a
        >.
      </p>
    </div>
  </section>

  <footer class="site-footer">
    <div class="foot-main">
      <div class="foot-brand">
        <a class="foot-mark" href="/">svelte stageshow</a>
        <p>A Svelte 5 port of Benji Taylor's kit. MIT, notices kept.</p>
      </div>

      <div class="foot-links">
        <div>
          <span class="mono">this port</span>
          <a href="/scenes/static-card">Gallery</a>
          <a href="/docs/">Docs</a>
          <a href="/scenes/hero-demo">Hero demo</a>
          <a href="/scenes/bento">Bento</a>
        </div>
        <div>
          <span class="mono">the kit</span>
          <a href="/scenes/phones">Phones</a>
          <a href="/scenes/google-calendar">Calendar</a>
          <a href="/scenes/messages">Messages</a>
        </div>
        <div>
          <span class="mono">upstream</span>
          <a href="https://benji.org/stageshow" target="_blank" rel="noreferrer">Stageshow</a>
          <a href="https://github.com/benjitaylor/skills" target="_blank" rel="noreferrer">Source</a>
        </div>
        <div>
          <span class="mono">package</span>
          <a href="https://github.com/maven-ammar/svelte-stageshow" target="_blank" rel="noreferrer">GitHub</a>
          <a
            href="https://github.com/maven-ammar/svelte-stageshow/releases/tag/v0.2.0"
            target="_blank"
            rel="noreferrer">Release 0.2.0</a
          >
        </div>
      </div>
    </div>

    <div class="legal">
      <span>
        svelte-stageshow / 0.2.0 —
        <a href="https://github.com/maven-ammar/svelte-stageshow/blob/main/LICENSE" target="_blank" rel="noreferrer">MIT</a>.
        Stageshow is
        <a href="https://benji.org/stageshow" target="_blank" rel="noreferrer">Benji Taylor's</a>; this
        port keeps his licence and notices.
      </span>
      <span class="mono"
        >ported with ♥ by
        <a href="https://github.com/maven-ammar" target="_blank" rel="noreferrer">Maven</a> and
        <a href="https://github.com/Amm4r03" target="_blank" rel="noreferrer">Ammar</a></span
      >
    </div>

    <div class="dunes-wrap" aria-hidden="true">
      <img class="dunes" src="/dunes-band.png" alt="" />
    </div>
  </footer>

<style>
  .page {
    /* A single implicit grid column is sized by its widest child's min-content, and
       every sibling then stretches to that width — the page scrolled 1962px on a
       1440 viewport because of it. Clamp the track so the page can never outgrow
       the viewport, whatever a child asks for. */
    grid-template-columns: minmax(0, 1fr);
    --ink: #14120f;
    --paper: #f4f1e6;
    --line: rgba(244, 241, 230, 0.14);
    --dim: rgba(244, 241, 230, 0.58);
    --orange: #e8622a;
    --serif: 'Instrument Serif', 'Iowan Old Style', Georgia, serif;
    background: #0b0908;
    color: var(--paper);
    padding: 22px clamp(18px, 4vw, 64px) 0;
    display: grid;
    gap: clamp(28px, 4vw, 52px);
    align-content: start;
    font-family: var(--ss-font, system-ui, sans-serif);
  }

  .bar {
    display: flex;
    align-items: baseline;
    gap: 14px;
    font-family: var(--ss-mono, ui-monospace, monospace);
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .mark {
    color: var(--paper);
    text-decoration: none;
    letter-spacing: 0.24em;
  }

  .rule {
    flex: 1;
    height: 1px;
    background: var(--line);
    transform: translateY(-3px);
  }

  .sub {
    color: var(--dim);
    text-transform: none;
    letter-spacing: 0.02em;
  }

  .src {
    color: var(--orange);
    text-decoration: none;
  }

  .port {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: clamp(24px, 5vw, 72px);
    border-top: 1px solid var(--line);
    padding-top: 26px;
    align-items: start;
  }

  .claim h2 {
    margin: 0 0 12px;
    font-family: var(--serif);
    font-weight: 400;
    font-size: clamp(26px, 2.6vw, 38px);
    line-height: 1.05;
    letter-spacing: -0.01em;
  }

  .claim p {
    margin: 0 0 14px;
    max-width: 46ch;
    font-size: 13.5px;
    line-height: 1.65;
    color: var(--dim);
  }

  .evidence {
    font-family: var(--ss-mono, ui-monospace, monospace);
    font-size: 10.5px;
    letter-spacing: 0.06em;
    color: var(--orange);
    text-decoration: none;
    border-bottom: 1px solid rgba(232, 98, 42, 0.45);
    padding-bottom: 2px;
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .head {
    display: grid;
    grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
    gap: 24px;
    align-items: start;
    margin-bottom: 20px;
  }

  .head .aside {
    display: grid;
    gap: 12px;
    justify-items: end;
    text-align: right;
  }

  .head .aside p {
    margin: 0;
  }

  h2 {
    margin: 0;
    font-family: var(--serif);
    font-weight: 400;
    font-size: clamp(26px, 2.6vw, 38px);
    line-height: 1.05;
    letter-spacing: -0.01em;
    color: #f6f1e7;
  }

  .head p {
    margin: 0;
    font-size: 13.5px;
    line-height: 1.65;
    color: var(--dim);
    max-width: 52ch;
  }

  .rail {
    position: relative;
  }

  /* The fade says "there is more"; it disappears at the end of the rail. */
  .rail::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    bottom: 12px;
    width: 96px;
    background: linear-gradient(to right, rgba(11, 9, 8, 0) 0%, #0b0908 78%);
    pointer-events: none;
    opacity: 0;
    transition: opacity 200ms ease;
  }

  .rail[data-more='true']::after {
    opacity: 1;
  }

  .carousel {
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: 260px;
    gap: 14px;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    padding-bottom: 12px;
    max-width: 100%;
    scrollbar-width: thin;
  }

  .carousel figure {
    margin: 0;
    display: grid;
    gap: 8px;
    scroll-snap-align: start;
  }

  .card {
    display: block;
    border: 1px solid var(--line);
    border-radius: 6px;
    overflow: hidden;
    background: #0f0d0c;
    aspect-ratio: 16 / 10;
    position: relative;
  }

  .stage-slot {
    position: absolute;
    inset: 0;
    display: block;
    /* The scene is authored at 400x300; scale it to the card and crop the rest. */
    transform: scale(0.66);
    transform-origin: top left;
    width: 400px;
    height: 300px;
    pointer-events: none;
  }

  .card img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: top left;
    display: block;
  }

  /* The way out of the rail is a button, not another card. */
  .carousel figure.more {
    display: grid;
    place-items: center;
    padding-bottom: 24px;
  }

  .rail-more {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    padding: 12px 18px;
    border-radius: 999px;
    border: 1px solid rgba(232, 98, 42, 0.45);
    background: rgba(232, 98, 42, 0.1);
    color: #f0a382;
    text-decoration: none;
    white-space: nowrap;
    font-family: var(--ss-mono, ui-monospace, monospace);
    font-size: 11px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    transition:
      background-color 220ms cubic-bezier(0.22, 1, 0.36, 1),
      border-color 220ms ease,
      color 220ms ease;
  }

  .rail-more:hover {
    background: rgba(232, 98, 42, 0.2);
    border-color: rgba(232, 98, 42, 0.8);
    color: #ffd9c6;
  }

  .rail-more__arrow {
    transition: transform 220ms cubic-bezier(0.22, 1, 0.36, 1);
  }

  .rail-more:hover .rail-more__arrow {
    transform: translateX(3px);
  }

  .carousel figcaption {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    font-family: var(--ss-mono, ui-monospace, monospace);
    font-size: 10.5px;
    color: var(--dim);
  }

  .carousel figcaption a {
    color: rgba(244, 241, 230, 0.8);
    text-decoration: none;
  }

  .snippet {
    border-top: 1px solid var(--line);
    padding-top: 26px;
    display: grid;
    gap: 16px;
  }

  .snippet pre {
    margin: 0;
    padding: 16px 18px;
    border: 1px solid var(--line);
    border-radius: 6px;
    background: rgba(244, 241, 230, 0.03);
    overflow-x: auto;
  }

  .snippet code {
    font-family: var(--ss-mono, ui-monospace, monospace);
    font-size: 12px;
    line-height: 1.7;
    color: rgba(244, 241, 230, 0.86);
    white-space: pre;
  }

  .cta {
    /* The page ends here, so the ground lifts into a soft warm bloom instead of
       stopping flat. */
    background:
      radial-gradient(58% 72% at 50% 118%, rgba(232, 98, 42, 0.16) 0%, rgba(232, 98, 42, 0) 68%),
      radial-gradient(46% 60% at 78% 8%, rgba(120, 78, 190, 0.12) 0%, rgba(120, 78, 190, 0) 62%),
      linear-gradient(180deg, #0b0908 0%, #120c09 62%, #0b0908 100%);
    color: var(--paper);
    padding: clamp(48px, 6vw, 86px) clamp(18px, 4vw, 64px);
    display: grid;
    justify-items: center;
    gap: 14px;
    text-align: center;
    border-top: 1px solid var(--line);
  }

  .cta h2 {
    color: #f6f1e7;
    max-width: 18ch;
  }

  .lede {
    margin: 0;
    max-width: 54ch;
    font-size: 13.5px;
    line-height: 1.65;
    color: rgba(244, 241, 230, 0.62);
  }

  .lede a {
    color: rgba(244, 241, 230, 0.94);
  }

  .install {
    display: grid;
    gap: 12px;
    justify-items: center;
    margin-top: 8px;
  }

  .tabs {
    position: relative;
    display: flex;
    gap: 4px;
    padding: 3px;
    border: 1px solid rgba(244, 241, 230, 0.18);
    border-radius: 999px;
  }

  .tab-pill {
    position: absolute;
    top: 3px;
    left: 0;
    height: calc(100% - 6px);
    border-radius: 999px;
    background: #f4f1e6;
    transition:
      transform 260ms cubic-bezier(0.22, 1, 0.36, 1),
      width 260ms cubic-bezier(0.22, 1, 0.36, 1);
    z-index: 0;
  }

  .tabs button {
    position: relative;
    z-index: 1;
    border: 0;
    background: transparent;
    border-radius: 999px;
    padding: 6px 12px;
    font-family: var(--ss-mono, ui-monospace, monospace);
    font-size: 11px;
    color: rgba(244, 241, 230, 0.55);
    cursor: pointer;
    transition: color 260ms cubic-bezier(0.22, 1, 0.36, 1);
  }

  .tabs button:hover {
    color: rgba(244, 241, 230, 0.9);
  }

  .tabs button[data-on='true'] {
    background: transparent;
    color: #16130f;
  }

  .actions {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
    justify-content: center;
  }

  .primary,
  .secondary {
    font-family: var(--ss-mono, ui-monospace, monospace);
    font-size: 12px;
    padding: 10px 16px;
    border-radius: 999px;
    cursor: pointer;
    border: 1px solid transparent;
    transition:
      background-color 260ms cubic-bezier(0.22, 1, 0.36, 1),
      color 260ms cubic-bezier(0.22, 1, 0.36, 1),
      border-color 200ms ease;
  }

  .primary {
    background: #f4f1e6;
    color: #16130f;
    display: inline-flex;
    align-items: center;
    gap: 14px;
  }

  .primary code {
    font-family: var(--ss-mono, ui-monospace, monospace);
    font-size: 12px;
    color: #16130f;
    background: none;
    padding: 0;
    transition: color 260ms cubic-bezier(0.22, 1, 0.36, 1);
  }

  .primary span {
    font-size: 10px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    opacity: 0.6;
    transition:
      opacity 200ms ease,
      transform 260ms cubic-bezier(0.22, 1, 0.36, 1);
  }

  .primary[data-copied='true'] {
    background: #2f7a4a;
    color: #f6f1e7;
  }

  .primary[data-copied='true'] code {
    color: #f6f1e7;
  }

  .primary[data-copied='true'] span {
    opacity: 1;
    transform: translateY(-1px);
  }

  .secondary {
    background: transparent;
    color: #f6f1e7;
    border-color: rgba(244, 241, 230, 0.28);
    text-decoration: none;
  }

  .caveat {
    margin: 2px 0 0;
    font-family: var(--ss-mono, ui-monospace, monospace);
    font-size: 10.5px;
    color: rgba(244, 241, 230, 0.45);
  }

  .caveat a {
    color: rgba(244, 241, 230, 0.8);
  }

  .site-footer {
    /* The footer sits outside .page, so the tokens defined there do not reach it:
       --serif and --paper were silently falling back to the inherited sans. */
    --paper: #f4f1e6;
    --serif: 'Instrument Serif', 'Iowan Old Style', Georgia, serif;
    position: relative;
    background: #0b0908;
    color: var(--paper);
    padding: clamp(26px, 3vw, 40px) 0 0;
    overflow: hidden;
    border-top: 1px solid var(--line);
  }

  /* Wordmark on the left, link groups on the right. The dunes are a thin
     horizon band at the very bottom, not a full-bleed wall of dots. */
  .foot-main {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.6fr);
    gap: clamp(24px, 4vw, 56px);
    align-items: start;
    padding: 0 clamp(18px, 4vw, 64px) 30px;
  }

  .foot-brand {
    display: grid;
    gap: 10px;
    align-content: start;
  }

  .foot-mark {
    font-family: var(--serif);
    font-size: clamp(26px, 2.4vw, 34px);
    line-height: 1;
    letter-spacing: -0.01em;
    color: #f6f1e7;
    text-decoration: none;
  }

  .foot-brand p {
    margin: 0;
    max-width: 28ch;
    font-size: 12px;
    line-height: 1.55;
    color: rgba(244, 241, 230, 0.5);
  }

  .foot-links {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 20px;
    position: relative;
    z-index: 1;
  }

  .foot-links div {
    display: grid;
    gap: 8px;
    align-content: start;
  }

  .mono {
    font-family: var(--ss-mono, ui-monospace, monospace);
    font-size: 10.5px;
    letter-spacing: 0.04em;
    color: rgba(244, 241, 230, 0.42);
  }

  .foot-links a {
    font-size: 12.5px;
    color: rgba(244, 241, 230, 0.86);
    text-decoration: none;
  }

  /* A border sat under the whole grid cell; underline only the words. */
  .foot-links a:hover {
    text-decoration: underline;
    text-decoration-color: rgba(232, 98, 42, 0.7);
    text-underline-offset: 3px;
  }

  .legal {
    margin-left: clamp(18px, 4vw, 64px);
    margin-right: clamp(18px, 4vw, 64px);
    display: flex;
    justify-content: space-between;
    gap: 20px;
    margin-top: 24px;
    padding-top: 12px;
    border-top: 1px solid rgba(244, 241, 230, 0.16);
    font-size: 11px;
    color: rgba(244, 241, 230, 0.55);
    position: relative;
    z-index: 1;
  }

  .legal a {
    color: rgba(244, 241, 230, 0.82);
    text-underline-offset: 3px;
  }

  .legal a:hover {
    color: #f6f1e7;
  }

  .legal .mono {
    color: rgba(244, 241, 230, 0.42);
  }

  .dunes-wrap {
    position: relative;
    z-index: 0;
    height: clamp(110px, 14vw, 168px);
    margin-top: 24px;
    overflow: hidden;
  }

  /* A fade so the band meets the footer instead of starting with a hard edge. */
  .dunes-wrap::after {
    content: '';
    position: absolute;
    inset: 0 0 auto;
    height: 45%;
    background: linear-gradient(to bottom, #0b0908 0%, rgba(11, 9, 8, 0) 100%);
    pointer-events: none;
  }

  /* The dune art only reads as a landscape with vertical room, so in the footer
     it is used as what it can be at 150px: a fine dot horizon that fades out. */
  .dunes {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: 50% 30%;
    opacity: 0.45;
    -webkit-mask-image: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 1) 0%,
      rgba(0, 0, 0, 0.55) 45%,
      transparent 100%
    );
    mask-image: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 1) 0%,
      rgba(0, 0, 0, 0.55) 45%,
      transparent 100%
    );
  }

  @media (max-width: 900px) {
    .head {
      grid-template-columns: minmax(0, 1fr);
    }

    .port {
      grid-template-columns: minmax(0, 1fr);
      gap: 22px;
    }

    .bar .sub {
      display: none;
    }

    .legal {
      flex-direction: column;
      gap: 8px;
    }

    .foot-main {
      grid-template-columns: minmax(0, 1fr);
      gap: 26px;
    }

    .foot-links {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 22px 16px;
    }
  }
</style>
