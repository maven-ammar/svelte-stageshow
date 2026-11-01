<script lang="ts">
  import { BrandMark, Stage, brandMarks } from 'svelte-stageshow'
  import './brand-marks.css'

  const names = Object.keys(brandMarks) as (keyof typeof brandMarks)[]
  const groups = ['Payments', 'Banks', 'Apps', 'Crypto'] as const
  const themes: ('light' | 'dark')[] = ['light', 'dark']

  let widths = $state<Record<'light' | 'dark', number>>({ light: 0, dark: 0 })

  function metrics(width: number) {
    const columns = width >= 600 ? 6 : 3
    const padding = width >= 600 ? 24 : 16
    const gridHeight = groups.reduce((total, group) => {
      const rows = Math.ceil(names.filter((name) => brandMarks[name].category === group).length / columns)
      return total + rows * 82 + (rows - 1) * 20
    }, 0)
    const height = padding * 2 + (groups.length - 1) * 28 + groups.length * 36 + gridHeight
    return { columns, padding, height }
  }
</script>

<div class="bm-gallery">
  {#each themes as theme}
    {@const width = widths[theme]}
    {@const { columns, padding, height } = metrics(width)}
    <section class="bm-sheet">
      <h2>{theme === 'light' ? 'Light' : 'Dark'}</h2>
      <div class="bm-frame" bind:clientWidth={widths[theme]}>
        {#if width > 0}
          <Stage specimen width={width} {height} theme={theme} greys="cool" className="bm-stage">
            {#snippet children()}
              <div class="bm-content" style={`padding:${padding}px`}>
                {#each groups as group}
                  <section class="bm-group">
                    <h3>{group}</h3>
                    <div class="bm-grid" style={`grid-template-columns:repeat(${columns}, minmax(0, 1fr))`}>
                      {#each names.filter((name) => brandMarks[name].category === group) as brand}
                        <div class="bm-item">
                          <BrandMark brand={brand} size={40} />
                          <span>{brandMarks[brand].name}</span>
                        </div>
                      {/each}
                    </div>
                  </section>
                {/each}
              </div>
            {/snippet}
          </Stage>
        {/if}
      </div>
    </section>
  {/each}
</div>
