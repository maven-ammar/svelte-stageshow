<script lang="ts">
  import type { Component } from 'svelte'

  type Props = {
    scenes: string[]
    Hero: Component<Record<string, never>>
  }

  let { scenes, Hero }: Props = $props()

  const index = [
    'static-card',
    'hero-demo',
    'bento',
    'phones',
    'google-calendar',
    'messages',
    'stacked-cards',
    'spotify'
  ].filter((name) => scenes.includes(name))

  const facts = [
    ['69', 'scene slugs ported, every one'],
    ['42', 'stylesheets, byte-identical to upstream'],
    ['13', 'motion primitives'],
    ['0', 'React, react-dom or lucide in the bundle']
  ]
</script>

<main class="page">
  <header class="bar">
    <a class="mark" href="/">Stageshow</a>
    <span class="rule"></span>
    <span class="sub">A Svelte 5 port of Benji Taylor's Stageshow</span>
    <a class="src" href="https://benji.org/stageshow" target="_blank" rel="noreferrer">original</a>
  </header>

  <section class="hero">
    <div class="lead">
      <p class="eyebrow">Specimen 01 — the port</p>
      <h1>Product shots that hold up as product.</h1>
      <p class="body">
        The Stageshow kit, rewritten for Svelte 5: window frames with real chrome, a cursor that
        types and clicks under a script, and sixty-nine worked scenes to start from. The design
        rules travel with it. No React in the bundle, one peer dependency, no animation runtime.
      </p>
      <div class="actions">
        <code>pnpm add svelte-stageshow</code>
        <a class="go" href="?scene=static-card">Open the gallery</a>
      </div>
    </div>

    <figure class="plate">
      <div class="plate__stage">
        <Hero />
      </div>
      <figcaption>
        <span>svelte 5</span>
        <span class="dots"></span>
        <span class="mono">dot lattice / 120 × 64</span>
      </figcaption>
    </figure>
  </section>

  <section class="ledger">
    {#each facts as [value, label] (label)}
      <div>
        <span class="n">{value}</span>
        <span class="l">{label}</span>
      </div>
    {/each}
  </section>

  <section class="index" id="scenes">
    <h2>Start from one of these</h2>
    <ol>
      {#each index as name, position (name)}
        <li>
          <a href={`?scene=${name}`}>
            <span class="num">{String(position + 1).padStart(2, '0')}</span>
            <span class="name">{name}</span>
          </a>
        </li>
      {/each}
    </ol>
    <a class="all" href="?scene=static-card">All {scenes.length} scenes</a>
  </section>

  <footer>
    <p>
      Ported from <a href="https://benji.org/stageshow" target="_blank" rel="noreferrer">Stageshow</a>
      by Benji Taylor. The original is MIT licensed; its licence, notices and third-party
      attributions travel with this port unchanged.
    </p>
    <span class="mono">svelte-stageshow / 0.2.0</span>
  </footer>
</main>

<style>
  .page {
    --ink: #14120f;
    --paper: #f4f1e6;
    --line: rgba(244, 241, 230, 0.14);
    --dim: rgba(244, 241, 230, 0.58);
    --orange: #e8622a;
    min-height: 100dvh;
    background: #0b0908;
    color: var(--paper);
    padding: 22px clamp(18px, 4vw, 64px) 32px;
    display: grid;
    gap: clamp(28px, 4vw, 48px);
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

  .hero {
    display: grid;
    grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.15fr);
    gap: clamp(24px, 4vw, 64px);
    align-items: start;
  }

  .eyebrow {
    margin: 0 0 18px;
    font-family: var(--ss-mono, ui-monospace, monospace);
    font-size: 11px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--dim);
  }

  h1 {
    margin: 0 0 18px;
    font-family: var(--ss-display, 'Bahnschrift', 'Arial Narrow', sans-serif);
    font-size: clamp(34px, 4.6vw, 60px);
    line-height: 0.92;
    letter-spacing: -0.02em;
    text-transform: uppercase;
    max-width: 15ch;
  }

  .body {
    margin: 0 0 26px;
    max-width: 44ch;
    font-size: 14.5px;
    line-height: 1.65;
    color: rgba(244, 241, 230, 0.78);
  }

  .actions {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
  }

  code {
    padding: 9px 13px;
    border: 1px solid var(--line);
    border-radius: 3px;
    font-family: var(--ss-mono, ui-monospace, monospace);
    font-size: 12px;
    color: rgba(244, 241, 230, 0.9);
  }

  .go {
    font-family: var(--ss-mono, ui-monospace, monospace);
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--paper);
    text-decoration: none;
    border-bottom: 1px solid var(--orange);
    padding-bottom: 3px;
  }

  .plate {
    margin: 0;
    border: 1px solid var(--line);
    border-radius: 5px;
    overflow: hidden;
    background: #0f0d0c;
  }

  .plate__stage {
    display: grid;
    place-items: center;
    padding: clamp(16px, 3vw, 34px);
    background:
      linear-gradient(180deg, rgba(232, 98, 42, 0.07), transparent 55%),
      repeating-linear-gradient(90deg, rgba(244, 241, 230, 0.04) 0 1px, transparent 1px 64px);
  }

  figcaption {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 14px;
    border-top: 1px solid var(--line);
    font-family: var(--ss-mono, ui-monospace, monospace);
    font-size: 10.5px;
    color: var(--dim);
  }

  .dots {
    flex: 1;
    height: 1px;
    background-image: linear-gradient(90deg, var(--line) 50%, transparent 50%);
    background-size: 6px 1px;
  }

  .ledger {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    border-top: 1px solid var(--line);
    border-bottom: 1px solid var(--line);
  }

  .ledger div {
    padding: 16px 18px 16px 0;
    display: grid;
    gap: 6px;
    border-right: 1px solid var(--line);
  }

  .ledger div:last-child {
    border-right: 0;
  }

  .n {
    font-family: var(--ss-display, 'Bahnschrift', 'Arial Narrow', sans-serif);
    font-size: 30px;
    line-height: 1;
  }

  .l {
    font-size: 11.5px;
    line-height: 1.4;
    color: var(--dim);
    max-width: 24ch;
  }

  .index h2 {
    margin: 0 0 16px;
    font-family: var(--ss-mono, ui-monospace, monospace);
    font-size: 11px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--dim);
    font-weight: 400;
  }

  .index ol {
    list-style: none;
    margin: 0 0 18px;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .index li {
    border-top: 1px solid var(--line);
  }

  .index a {
    display: flex;
    align-items: baseline;
    gap: 10px;
    padding: 12px 12px 12px 0;
    color: var(--paper);
    text-decoration: none;
    font-size: 13px;
  }

  .num {
    font-family: var(--ss-mono, ui-monospace, monospace);
    font-size: 10.5px;
    color: var(--orange);
  }

  .name {
    font-family: var(--ss-mono, ui-monospace, monospace);
    letter-spacing: 0.02em;
  }

  .index a:hover .name {
    border-bottom: 1px solid var(--orange);
  }

  .all {
    font-family: var(--ss-mono, ui-monospace, monospace);
    font-size: 11px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--dim);
    text-decoration: none;
  }

  footer {
    display: flex;
    justify-content: space-between;
    gap: 28px;
    border-top: 1px solid var(--line);
    padding-top: 16px;
  }

  footer p {
    margin: 0;
    max-width: 62ch;
    font-size: 11.5px;
    line-height: 1.6;
    color: var(--dim);
  }

  footer a {
    color: rgba(244, 241, 230, 0.9);
  }

  .mono {
    font-family: var(--ss-mono, ui-monospace, monospace);
    font-size: 10.5px;
    color: var(--dim);
    white-space: nowrap;
  }

  @media (max-width: 900px) {
    .hero {
      grid-template-columns: minmax(0, 1fr);
    }

    .ledger {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .ledger div:nth-child(2n) {
      border-right: 0;
    }

    .index ol {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .bar .sub {
      display: none;
    }

    footer {
      flex-direction: column;
      gap: 10px;
    }
  }
</style>
