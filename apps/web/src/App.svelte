<script lang="ts">
  import DeterminismTest from './scenes/DeterminismTest.svelte'
  import HeroDemo from './scenes/HeroDemo.svelte'
  import StaticCard from './scenes/StaticCard.svelte'

  const params = new URLSearchParams(window.location.search)
  const capture = params.get('capture')
  const test = params.get('test')
  const width = Number(params.get('w') ?? 0)
  // The skill's film method screenshots a 900px-wide #example wrapper at 8px
  // vertical padding around the stage, with no script and no cursor.
  const still = params.get('still') === '1' || params.get('ref') === '1'
</script>

<svelte:head>
  <title>{capture ? `${capture} — svelte-stageshow` : 'svelte-stageshow — gallery'}</title>
</svelte:head>

{#if test === 'determinism'}
  <main class="capture" style="width:720px">
    <DeterminismTest />
  </main>
{:else if capture === 'static-card'}
  {#if still}
    <main id="example" class="film-example">
      <StaticCard />
    </main>
  {:else}
    <main class="capture" style={`width:${width || 400}px`}>
      <StaticCard />
    </main>
  {/if}
{:else if capture === 'hero-demo'}
  {#if still}
    <main id="example" class="film-example">
      <HeroDemo still />
    </main>
  {:else}
    <main class="capture" style={`width:${width || 720}px`}>
      <HeroDemo />
    </main>
  {/if}
{:else}
  <main class="gallery">
    <header class="gallery-head">
      <p class="eyebrow">Svelte 5 · runes · MIT</p>
      <h1>Stageshow</h1>
      <p class="lede">
        Framed faux product UI, ported from Benji Taylor's React kit. Two gold scenes, rebuilt in
        Svelte. The stage is the shot: no surrounding card, no plate.
      </p>
    </header>

    <section class="scene-block">
      <div class="scene-head">
        <h2>Static card</h2>
        <p>Quiet hierarchy, a hard crop, one satellite, real words only on the selected customer, its neighbors and the total.</p>
      </div>
      <div class="scene-row">
        <figure class="preview preview-card">
          <StaticCard />
          <figcaption>400 × 300 · wide</figcaption>
        </figure>
        <figure class="preview preview-compact">
          <StaticCard />
          <figcaption>358 × 300 · compact</figcaption>
        </figure>
      </div>
    </section>

    <section class="scene-block">
      <div class="scene-head">
        <h2>Hero demo</h2>
        <p>Five beats, named targets, an annotation, a terminal coming forward. The Act loop runs on screen; reduced motion holds the payoff.</p>
      </div>
      <div class="scene-row">
        <figure class="preview preview-wide">
          <HeroDemo />
          <figcaption>720 × 340 · wide</figcaption>
        </figure>
        <figure class="preview preview-compact">
          <HeroDemo />
          <figcaption>358 × 400 · compact</figcaption>
        </figure>
      </div>
    </section>

    <footer class="gallery-foot">
      <p>
        Ported from the MIT-licensed Stageshow kit, © 2026 Benji Taylor. The two scenes are ports of the
        public gold examples in <code>benjitaylor/skills</code>; the originals were filmed from that source
        for the parity sheet. See <code>REHEARSAL.md</code> for the verification record.
      </p>
    </footer>
  </main>
{/if}
