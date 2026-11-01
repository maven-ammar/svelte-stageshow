<script lang="ts">
  import type { Component } from 'svelte'
  import DeterminismTest from './scenes/DeterminismTest.svelte'
  import HeroDemo from './scenes/HeroDemo.svelte'
  import StaticCard from './scenes/StaticCard.svelte'

  const params = new URLSearchParams(window.location.search)
  const capture = params.get('capture')
  const test = params.get('test')
  const width = Number(params.get('w') ?? 0)
  // The skill's film method screenshots a 900px-wide #example wrapper around
  // the stage. `still=1` is the old direct-still route; the skill's own
  // film.mjs captures the opening frame without it.
  const still = params.get('still') === '1' || params.get('ref') === '1'

  type SceneModule = { default: Component<Record<string, never>> }
  // Every scene file in this directory is registered automatically. A new
  // port is a new file; no index edit and no chance of forgetting a slug.
  const modules = import.meta.glob<SceneModule>([
    './scenes/*.svelte',
    '!./scenes/Determinism*.svelte',
    '!./scenes/HeroIcon.svelte',
    '!./scenes/HeroToolbar.svelte',
    '!./scenes/zz-*.svelte',
  ])
  const entries = Object.entries(modules)
    .filter(([path]) => !/Determinism|DeterminismProbe|HeroIcon|HeroToolbar|zz-/.test(path))
    .map(([path, loader]) => ({
      slug: path
        .replace('./scenes/', '')
        .replace('.svelte', '')
        .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
        .toLowerCase(),
      loader,
    }))
  const loaders = Object.fromEntries(entries.map((entry) => [entry.slug, entry.loader]))
  const sceneNames = entries.map((entry) => entry.slug).sort((a, b) => a.localeCompare(b))

  const selectedSlug = params.get('scene') ?? 'static-card'
  const loadSlug = capture ?? selectedSlug
  let current = $state<Component<Record<string, never>> | null>(null)
  let loadError = $state('')

  $effect(() => {
    const slug = loadSlug
    let live = true
    current = null
    loadError = ''
    const loader = loaders[slug]
    if (!loader) {
      loadError = `Unknown scene: ${slug}`
      return
    }
    loader()
      .then((mod) => {
        if (live) current = mod.default
      })
      .catch((error: unknown) => {
        if (live) loadError = error instanceof Error ? error.message : String(error)
      })
    return () => {
      live = false
    }
  })
</script>

<svelte:head>
  <title>{capture ? `${capture} – svelte-stageshow` : 'svelte-stageshow – gallery'}</title>
  <link rel="icon" href="data:," />
</svelte:head>

{#if test === 'determinism'}
  <main class="capture" style="width:720px">
    <DeterminismTest />
  </main>
{:else if capture === 'static-card'}
  <main id="example" class="capture-example">
    <StaticCard />
  </main>
{:else if capture === 'hero-demo'}
  <main id="example" class="capture-example">
    {#if still}<HeroDemo still />{:else}<HeroDemo />{/if}
  </main>
{:else if capture}
  <main id="example" class="capture-example">
    {#if current}
      {@const Current = current}
      <Current />
    {:else if loadError}
      <p class="capture-missing">{loadError}</p>
    {/if}
  </main>
{:else}
  <main class="gallery">
    <header class="gallery-head">
      <p class="eyebrow">Svelte 5 · runes · MIT</p>
      <h1>Stageshow</h1>
      <p class="lede">
        The whole Stageshow kit, ported from Benji Taylor's React source. {sceneNames.length} scenes. Pick one;
        the stage is the shot.
      </p>
    </header>

    <nav class="scene-nav" aria-label="Scenes">
      {#each sceneNames as slug}
        <a class="scene-link" href={`?scene=${slug}`} aria-current={slug === selectedSlug ? 'page' : undefined}>
          {slug}
        </a>
      {/each}
    </nav>

    <section class="scene-block">
      <div class="scene-head">
        <h2>{selectedSlug}</h2>
        <p>Capture: <code>?capture={selectedSlug}</code> · design size as authored in the scene.</p>
      </div>
      <div class="scene-stage">
        {#if current}
          {@const Current = current}
          <Current />
        {:else if loadError}
          <p class="capture-missing">{loadError}</p>
        {/if}
      </div>
    </section>

    <footer class="gallery-foot">
      <p>
        Ported from the MIT-licensed Stageshow kit, © 2026 Benji Taylor. Every scene keeps the upstream
        design size, copy, DOM order and Act script. See <code>REHEARSAL.md</code> and the diff table in
        <code>README.md</code>.
      </p>
    </footer>
  </main>
{/if}
