<script lang="ts">
  import type { Component } from 'svelte'

  type Props = {
    scenes: string[]
    Hero: Component<Record<string, never>>
  }

  let { scenes, Hero }: Props = $props()
  const featured = $derived(
    scenes.filter((name) =>
      ['static-card', 'hero-demo', 'bento', 'phones', 'google-calendar', 'messages', 'spotify', 'stacked-cards'].includes(name)
    )
  )
</script>

<main class="landing">
  <header class="masthead">
    <span class="mark">STAGESHOW</span>
    <span class="tag">for Svelte 5</span>
  </header>

  <section class="hero">
    <div class="pitch">
      <h1>Product illustrations that look like the product.</h1>
      <p>
        A Svelte 5 port of the Stageshow kit: framed faux UI, real chrome, a scripted cursor, and
        sixty-nine worked examples to start from. React-free, one peer dependency, no animation
        runtime.
      </p>
      <pre><code>pnpm add svelte-stageshow</code></pre>
      <nav>
        <a class="button" href="?scene=static-card">Browse the gallery</a>
        <a class="quiet" href="#scenes">See the scenes</a>
      </nav>
    </div>

    <div class="showcase">
      <div class="frame">
        <Hero />
      </div>
    </div>
  </section>

  <section class="facts">
    <div><strong>69</strong><span>scene slugs, every one ported</span></div>
    <div><strong>42</strong><span>stylesheets, byte-identical to upstream</span></div>
    <div><strong>13</strong><span>motion primitives</span></div>
    <div><strong>0</strong><span>React, react-dom or lucide in the bundle</span></div>
  </section>

  <section id="scenes" class="scenes">
    <h2>Start from one of these</h2>
    <ul>
      {#each featured as name (name)}
        <li><a href={`?scene=${name}`}>{name}</a></li>
      {/each}
    </ul>
    <a class="quiet" href="?scene=static-card">All {scenes.length} scenes</a>
  </section>

  <footer>
    <span>MIT. Ported from Benji Taylor's Stageshow; the original licence and notices travel with it.</span>
    <span class="mono">svelte-stageshow / 0.2.0</span>
  </footer>
</main>

<style>
  .landing {
    --ink: #14120f;
    --paper: #f4f1e6;
    --orange: #e8622a;
    min-height: 100dvh;
    background: #0b0908;
    color: var(--paper);
    padding: 28px clamp(18px, 4vw, 56px) 40px;
    display: grid;
    gap: 40px;
    align-content: start;
    font-family: var(--ss-font, system-ui, sans-serif);
  }

  .masthead {
    display: flex;
    align-items: baseline;
    gap: 10px;
    border-bottom: 1px solid rgba(244, 241, 230, 0.16);
    padding-bottom: 12px;
  }

  .mark {
    font-family: var(--ss-display, 'Bahnschrift', 'Arial Narrow', sans-serif);
    font-size: 15px;
    letter-spacing: 0.22em;
  }

  .tag {
    font-family: var(--ss-mono, ui-monospace, monospace);
    font-size: 11px;
    color: rgba(244, 241, 230, 0.55);
  }

  .hero {
    display: grid;
    grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
    gap: clamp(20px, 4vw, 56px);
    align-items: center;
  }

  h1 {
    margin: 0 0 14px;
    font-family: var(--ss-display, 'Bahnschrift', 'Arial Narrow', sans-serif);
    font-size: clamp(30px, 4.4vw, 52px);
    line-height: 0.96;
    letter-spacing: -0.015em;
    text-transform: uppercase;
  }

  .pitch p {
    margin: 0 0 18px;
    max-width: 46ch;
    font-size: 14px;
    line-height: 1.6;
    color: rgba(244, 241, 230, 0.72);
  }

  pre {
    margin: 0 0 20px;
    padding: 10px 14px;
    border: 1px solid rgba(244, 241, 230, 0.18);
    border-radius: 4px;
    background: rgba(244, 241, 230, 0.04);
    font-family: var(--ss-mono, ui-monospace, monospace);
    font-size: 12.5px;
    color: rgba(244, 241, 230, 0.86);
    width: fit-content;
  }

  nav {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .button {
    display: inline-block;
    padding: 10px 16px;
    border-radius: 999px;
    background: var(--paper);
    color: var(--ink);
    font-family: var(--ss-mono, ui-monospace, monospace);
    font-size: 11.5px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    text-decoration: none;
  }

  .quiet {
    font-family: var(--ss-mono, ui-monospace, monospace);
    font-size: 11.5px;
    color: rgba(244, 241, 230, 0.62);
    text-decoration: none;
    border-bottom: 1px solid rgba(244, 241, 230, 0.28);
    padding-bottom: 2px;
  }

  .showcase {
    display: grid;
    place-items: center;
    padding: clamp(14px, 3vw, 28px);
    border: 1px solid rgba(244, 241, 230, 0.12);
    border-radius: 8px;
    background: radial-gradient(120% 120% at 30% 0%, rgba(232, 98, 42, 0.12), transparent 60%), #0f0d0c;
    overflow: hidden;
  }

  .frame {
    width: 100%;
    display: grid;
    place-items: center;
  }

  .facts {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 14px;
    border-top: 1px solid rgba(244, 241, 230, 0.16);
    border-bottom: 1px solid rgba(244, 241, 230, 0.16);
    padding: 18px 0;
  }

  .facts div {
    display: grid;
    gap: 4px;
  }

  .facts strong {
    font-family: var(--ss-display, 'Bahnschrift', 'Arial Narrow', sans-serif);
    font-size: 26px;
    line-height: 1;
  }

  .facts span {
    font-size: 11.5px;
    color: rgba(244, 241, 230, 0.55);
    max-width: 22ch;
  }

  .scenes h2 {
    margin: 0 0 14px;
    font-family: var(--ss-display, 'Bahnschrift', 'Arial Narrow', sans-serif);
    font-size: 18px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .scenes ul {
    list-style: none;
    margin: 0 0 16px;
    padding: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .scenes a {
    display: inline-block;
    padding: 7px 12px;
    border: 1px solid rgba(244, 241, 230, 0.2);
    border-radius: 999px;
    font-family: var(--ss-mono, ui-monospace, monospace);
    font-size: 11.5px;
    color: rgba(244, 241, 230, 0.86);
    text-decoration: none;
  }

  .scenes a:hover {
    border-color: var(--orange);
  }

  footer {
    display: flex;
    justify-content: space-between;
    gap: 20px;
    border-top: 1px solid rgba(244, 241, 230, 0.16);
    padding-top: 14px;
    font-size: 11.5px;
    color: rgba(244, 241, 230, 0.5);
  }

  .mono {
    font-family: var(--ss-mono, ui-monospace, monospace);
  }

  @media (max-width: 820px) {
    .hero {
      grid-template-columns: minmax(0, 1fr);
    }

    .facts {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    footer {
      flex-direction: column;
    }
  }
</style>

