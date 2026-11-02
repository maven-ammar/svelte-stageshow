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

  const managers = [
    { id: 'pnpm', cmd: 'pnpm add svelte-stageshow' },
    { id: 'npm', cmd: 'npm install svelte-stageshow' },
    { id: 'yarn', cmd: 'yarn add svelte-stageshow' },
    { id: 'bun', cmd: 'bun add svelte-stageshow' }
  ]

  let manager = $state('pnpm')
  const command = $derived(managers.find((entry) => entry.id === manager)?.cmd ?? managers[0].cmd)

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
    try {
      await navigator.clipboard.writeText(command)
      copied = true
      clearTimeout(timer)
      timer = setTimeout(() => (copied = false), 1800)
    } catch {
      copied = false
    }
  }
</script>

<main class="page">
  <header class="bar">
    <a class="mark" href="/">Stageshow</a>
    <span class="rule"></span>
    <span class="sub">A Svelte 5 port of Benji Taylor's Stageshow</span>
    <a class="src" href="https://benji.org/stageshow" target="_blank" rel="noreferrer">original</a>
  </header>

  <DotHero />

  <section class="port">
    <div class="claim">
      <h2>A complete port, not a subset.</h2>
      <p>
        Benji Taylor's whole kit, rebuilt in Svelte 5 — then every scene rendered and compared against
        his own output, so the claim is checkable rather than promised.
      </p>
      <a
        class="evidence"
        href="https://github.com/maven-ammar/svelte-stageshow/blob/main/shots/acceptance.md"
        target="_blank"
        rel="noreferrer">71 comparisons, 71 matched — the acceptance table →</a
      >
    </div>

    <table class="parity">
      <tbody>
        <tr><th scope="row">scenes</th><td>69 slugs, each one ported</td></tr>
        <tr><th scope="row">stylesheets</th><td>42, byte-identical to upstream</td></tr>
        <tr><th scope="row">brand marks</th><td>44 SVGs</td></tr>
        <tr><th scope="row">runtime deps</th><td>none — no React, react-dom or lucide</td></tr>
      </tbody>
    </table>
  </section>

  <section class="showcase" id="scenes">
    <div class="head">
      <h2>Six of the seventy</h2>
      <div class="aside">
        <p>
          Every scene is a working Svelte component — a frame, real chrome, and one moment worth
          showing.
        </p>
        <a class="all" href="?scene=static-card">All {scenes.length} scenes →</a>
      </div>
    </div>

    <div class="carousel">
      <figure class="live">
        <a class="card" href="?scene=static-card" aria-label="Open the static-card scene">
          <span class="stage-slot">
            <StaticCard />
          </span>
        </a>
        <figcaption>
          <span>static-card · live</span>
          <a href="?scene=static-card">open</a>
        </figcaption>
      </figure>
      {#each strip as name (name)}
        <figure>
          <a class="card" href={`?scene=${name}`}>
            <img src={`/scenes/${name}.png`} alt={`The ${name} scene`} loading="lazy" />
          </a>
          <figcaption>
            <span>{name}</span>
            <a href={`?scene=${name}`}>open</a>
          </figcaption>
        </figure>
      {/each}
    </div>
  </section>

  <section class="snippet">
    <div class="head">
      <h2>Two components and a stylesheet.</h2>
      <p>
        <code>Stage</code> sets the design size, <code>Window</code> draws the browser chrome, and
        your product's own markup goes inside it. The stylesheet carries the tokens.
      </p>
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
      <div class="tabs" role="tablist" aria-label="Package manager">
        {#each managers as entry (entry.id)}
          <button
            type="button"
            role="tab"
            aria-selected={manager === entry.id}
            data-on={manager === entry.id}
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
        <a class="secondary" href="?scene=static-card">See the demos</a>
      </div>
      <p class="caveat">
        Not on npm yet. Until it is,
        <a
          href="https://github.com/maven-ammar/svelte-stageshow/releases/tag/v0.2.0"
          target="_blank"
          rel="noreferrer">the 0.2.0 tarball installs today</a
        >
        — 185 KB, no build step.
      </p>
    </div>
  </section>

  <footer class="site-footer">
    <div class="foot-links">
      <div>
        <span class="mono">this port</span>
        <a href="?scene=static-card">Gallery</a>
        <a href="?scene=hero-demo">Hero demo</a>
        <a href="?scene=bento">Bento</a>
      </div>
      <div>
        <span class="mono">the kit</span>
        <a href="?scene=phones">Phones</a>
        <a href="?scene=google-calendar">Calendar</a>
        <a href="?scene=messages">Messages</a>
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
    <div class="legal">
      <span>
        svelte-stageshow / 0.2.0 — MIT. Stageshow is Benji Taylor's; this port keeps his licence and
        notices.
      </span>
      <span class="mono">ported by Maven</span>
    </div>
    <img class="dunes" src="/dunes-ascii.png" alt="" aria-hidden="true" />
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

  .parity {
    border-collapse: collapse;
    width: 100%;
    font-size: 12.5px;
  }

  .parity th,
  .parity td {
    text-align: left;
    font-weight: 400;
    padding: 9px 0;
    border-top: 1px solid var(--line);
    vertical-align: baseline;
  }

  .parity th {
    width: 38%;
    font-family: var(--ss-mono, ui-monospace, monospace);
    font-size: 11px;
    color: rgba(244, 241, 230, 0.45);
    padding-right: 16px;
  }

  .parity td {
    color: rgba(244, 241, 230, 0.88);
  }

  .head {
    display: grid;
    grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
    gap: 24px;
    align-items: baseline;
    margin-bottom: 20px;
  }

  .head .aside {
    display: grid;
    gap: 12px;
    justify-items: start;
  }

  .head .aside p {
    margin: 0;
  }

  .all {
    font-family: var(--ss-mono, ui-monospace, monospace);
    font-size: 10.5px;
    letter-spacing: 0.08em;
    color: var(--orange);
    text-decoration: none;
    border-bottom: 1px solid rgba(232, 98, 42, 0.45);
    padding-bottom: 2px;
  }

  .all:hover {
    border-bottom-color: var(--orange);
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

  .head a {
    color: rgba(244, 241, 230, 0.9);
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
    background: #0b0908;
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
    display: flex;
    gap: 4px;
    padding: 3px;
    border: 1px solid rgba(244, 241, 230, 0.18);
    border-radius: 999px;
  }

  .tabs button {
    border: 0;
    background: transparent;
    border-radius: 999px;
    padding: 6px 12px;
    font-family: var(--ss-mono, ui-monospace, monospace);
    font-size: 11px;
    color: rgba(244, 241, 230, 0.55);
    cursor: pointer;
  }

  .tabs button[data-on='true'] {
    background: #f4f1e6;
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
  }

  .primary span {
    font-size: 10px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    opacity: 0.6;
  }

  .primary[data-copied='true'] {
    background: #2f7a4a;
    color: #f6f1e7;
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
    position: relative;
    background: #0b0908;
    color: var(--paper);
    padding: clamp(26px, 3vw, 40px) 0 0;
    overflow: hidden;
    border-top: 1px solid var(--line);
  }

  .foot-links {
    padding: 0 clamp(18px, 4vw, 64px);
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

  .foot-links a:hover {
    border-bottom: 1px solid rgba(232, 98, 42, 0.7);
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

  .legal .mono {
    color: rgba(244, 241, 230, 0.42);
  }

  .dunes {
    position: relative;
    z-index: 0;
    display: block;
    width: 100%;
    margin: 18px 0 0;
    height: auto;
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
  }
</style>
