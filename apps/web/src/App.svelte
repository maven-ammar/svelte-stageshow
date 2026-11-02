<script lang="ts">
  import type { Component } from 'svelte'
  import { StillProvider } from 'svelte-stageshow'
  import DeterminismTest from './scenes/DeterminismTest.svelte'
  import HeroDemo from './scenes/HeroDemo.svelte'
  import StaticCard from './scenes/StaticCard.svelte'
  import Landing from './Landing.svelte'
  
  const params = new URLSearchParams(window.location.search)
  const capture = params.get('capture')
  const test = params.get('test')
  const width = Number(params.get('w') ?? 0)

  // Dev-only annotation inspector: the owner marks up the page and hands back
  // structured notes. Dynamically imported so it never reaches a production bundle.
  let Inspector = $state<Component | null>(null)
  if (import.meta.env.DEV) {
    import('sv-agentation').then((mod) => {
      Inspector = mod.Agentation as unknown as Component
    })
  }
  // The skill's film method screenshots a 900px-wide #example wrapper around
  // the stage. `still=1` is the old direct-still route; the skill's own
  // film.mjs captures the opening frame without it.
  const still = params.get('still') === '1' || params.get('ref') === '1'

  // The shell ships one generic description, so per-route values are written onto
  // the existing tags rather than added as second ones — otherwise the static tag
  // wins and every scene page advertises the landing page.
  $effect(() => {
    if (capture || test) return
    const description = landing
      ? "A complete Svelte 5 port of Benji Taylor's Stageshow kit: 69 framed product-shot scenes, real browser chrome, scripted cursors, and no React at runtime."
      : `The ${selectedSlug} scene from Benji Taylor's Stageshow kit, ported to Svelte 5. Working component, authored design size, compared against his own render.`
    const canonical = landing
      ? 'https://svelte-stageshow.vercel.app/'
      : `https://svelte-stageshow.vercel.app/scenes/${selectedSlug}`

    let meta = document.head.querySelector<HTMLMetaElement>('meta[name="description"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.name = 'description'
      document.head.appendChild(meta)
    }
    meta.content = description

    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!link) {
      link = document.createElement('link')
      link.rel = 'canonical'
      document.head.appendChild(link)
    }
    link.href = canonical
  })

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

  // Scenes get real paths, not query parameters, so each one is its own page for
  // search engines, link previews and analytics. ?scene= keeps working.
  const pathSlug = window.location.pathname.match(/^\/scenes\/([a-z0-9-]+)\/?$/)?.[1]
  const selectedSlug = pathSlug ?? params.get('scene') ?? 'static-card'
  // A visitor at the bare URL gets the landing page; the gallery lives behind a scene
  // link, so the capture route keeps working unchanged.
  const landing = !capture && !test && !pathSlug && !params.get('scene') && !width
  const loadSlug = capture ?? selectedSlug
  const sceneHref = (slug: string) => `/scenes/${slug}`
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
  <title
    >{capture
      ? `${capture} - svelte-stageshow`
      : landing
        ? 'svelte-stageshow: a Svelte 5 port of Stageshow'
        : `${selectedSlug} - a Stageshow scene in Svelte 5`}</title
  >
  <link rel="icon" href="data:," />
</svelte:head>

{#if landing}
  <Landing scenes={sceneNames}  />
{:else if test === 'determinism'}
  <main class="capture" style="width:720px">
    <DeterminismTest />
  </main>
{:else if capture === 'static-card'}
  <StillProvider still={still}>
    <main id="example" class="capture-example">
      <StaticCard />
    </main>
  </StillProvider>
{:else if capture === 'hero-demo'}
  <StillProvider still={still}>
    <main id="example" class="capture-example">
      {#if still}<HeroDemo still />{:else}<HeroDemo />{/if}
    </main>
  </StillProvider>
{:else if capture}
  <StillProvider still={still}>
    <main id="example" class="capture-example">
      {#if current}
        {@const Current = current}
        <Current />
      {:else if loadError}
        <p class="capture-missing">{loadError}</p>
      {/if}
    </main>
  </StillProvider>
{:else}
  <main class="gallery">
    <header class="gallery-head">
      <a class="gallery-back" href="/">← back to the landing page</a>
      <h1>{selectedSlug}</h1>
      <p class="lede">
        One of {sceneNames.length} scenes in the whole Stageshow kit, ported from Benji Taylor's React
        source. The stage below is the shot.
      </p>
    </header>

    <nav class="scene-nav" aria-label="Scenes">
      {#each sceneNames as slug}
        <a class="scene-link" href={sceneHref(slug)} aria-current={slug === selectedSlug ? 'page' : undefined}>
          {slug}
        </a>
      {/each}
    </nav>

    <section class="scene-block">
      <div class="scene-head">
        <p>Capture: <code>?capture={selectedSlug}</code> / design size as authored in the scene.</p>
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
        Ported from the MIT-licensed Stageshow kit, (c) 2026 Benji Taylor. Every scene keeps the upstream
        design size, copy, DOM order and Act script. See <code>REHEARSAL.md</code> and the diff table in
        <code>README.md</code>.
      </p>
    </footer>
  </main>
{/if}

{#if Inspector}
  {@const InspectorComponent = Inspector}
  <InspectorComponent />
{/if}



