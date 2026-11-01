<script lang="ts">
  import DotHero from './DotHero.svelte'

  type Props = {
    scenes: string[]
  }

  let { scenes }: Props = $props()

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

  <DotHero />

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
    font-family: 'Instrument Serif', Georgia, serif;
    font-size: 34px;
    line-height: 1;
    color: #f6f1e7;
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
