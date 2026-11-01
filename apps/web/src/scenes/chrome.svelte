<script lang="ts">
  import { Icon, Prompt, Stage, Window } from 'svelte-stageshow'
  import './chrome.css'

  // One native-size figure per option. The page reflows; the chrome does not
  // shrink as part of a large sheet. All frame measurements come from Window.
  const files = [{ name: 'Brief.pdf', size: '24 KB' }, { name: 'Notes.md', size: '4 KB' }, { name: 'Sketch.fig', size: '86 KB' }, { name: 'Assets.zip', size: '2 MB' }]

  type Specimen = { id: string; title: string; note: string; cool?: boolean }
  const specimens: Specimen[] = [
    { id: 'glass', title: 'Glass', note: 'Frosted frame and inset page.' },
    { id: 'card', title: 'Card', note: 'Pale address field and a soft lifted edge.' },
    { id: 'hairline', title: 'Hairline', note: 'A short bar with a fine separator.' },
    { id: 'terminal', title: 'Terminal', note: 'One dark surface, without a bar divider.' },
    { id: 'browser', title: 'Browser', note: 'Native address bar.' },
    { id: 'tabs', title: 'Browser with tabs', note: 'Tabs and back/forward controls.' },
    { id: 'app', title: 'App toolbar', note: 'Title and controls in one bar.' },
    { id: 'sidebar', title: 'Sidebar', note: 'Lights in a full-height sidebar.' },
    { id: 'large-lights', title: 'Larger lights', note: 'The native 12px traffic lights.', cool: true },
    { id: 'floating-sidebar', title: 'Floating sidebar', note: 'An inset panel with nested corners.', cool: true },
    { id: 'tall-toolbar', title: 'Tall toolbar', note: 'A taller bar with inline controls and larger lights.', cool: true },
    { id: 'combined', title: 'Combined', note: 'Floating sidebar, tall bar and larger lights.', cool: true },
  ]

  let widths = $state<Record<string, number>>(Object.fromEntries(specimens.map((item) => [item.id, 288])))
</script>

{#snippet content(short: boolean)}
  <div class="wc-content" aria-label="Files">
    {#each files.slice(0, short ? 3 : 4) as file, i}
      <div class="wc-file-row" data-selected={i === 0 || undefined}><Icon name="file" size={14} /><span>{file.name}</span><span class="wc-file-size">{file.size}</span></div>
    {/each}
  </div>
{/snippet}

{#snippet tool()}
  <span class="wc-tools"><Icon name="search" size={14} /><Icon name="plus" size={14} /></span>
{/snippet}

{#snippet tallTool()}
  <span class="wc-tall-tool"><span class="wc-tall-tool__icon"><svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.5 6V4.5h5L9 6h8.5v10h-15ZM10 9v4M8 11h4" /></svg></span><span>New folder</span></span>
{/snippet}

{#snippet side()}
  <div class="wc-side"><span data-active>All files</span><span>Shared</span><span>Archive</span></div>
{/snippet}

{#snippet hairlineUrl()}
  <span class="wc-address">files.example</span>
{/snippet}

<div class="wc-gallery">
  {#each specimens as item}
    {@const width = widths[item.id] || 288}
    <figure class="wc-figure" data-specimen={item.id}>
      <div class="wc-picture" bind:clientWidth={widths[item.id]}>
        <Stage specimen width={width} height={224} greys={item.cool ? 'cool' : undefined}>
          {#snippet children()}
            <div class="wc-ground" data-material={item.id}>
              {#if item.id === 'glass'}
                <Window chrome="glass" url="files.example" className="wc-window" style={`width:${width - 32}px;height:176px`}>
                  {@render content(false)}
                </Window>
              {:else if item.id === 'card'}
                <Window chrome="card" url="files.example" className="wc-window" style={`width:${width - 32}px;height:176px`}>
                  {@render content(false)}
                </Window>
              {:else if item.id === 'hairline'}
                <Window chrome="hairline" url={hairlineUrl} className="wc-window" style={`width:${width - 32}px;height:176px`}>
                  {@render content(false)}
                </Window>
              {:else if item.id === 'terminal'}
                <Window chrome="terminal" title="workspace — zsh" lights="grey" className="wc-window" style={`width:${width - 32}px;height:176px`}>
                  <div class="wc-terminal"><Prompt>pwd</Prompt><span>/workspace</span></div>
                </Window>
              {:else if item.id === 'browser'}
                <Window url="files.example" className="wc-window" style={`width:${width - 32}px;height:176px`}>
                  {@render content(false)}
                </Window>
              {:else if item.id === 'tabs'}
                <Window url="files.example" nav tabs={['Files', 'Docs']} className="wc-window" style={`width:${width - 32}px;height:176px`}>
                  {@render content(true)}
                </Window>
              {:else if item.id === 'app'}
                <Window title="Files" className="wc-window" style={`width:${width - 32}px;height:176px`}>
                  {#snippet toolbar()}{@render tool()}{/snippet}
                  {@render content(false)}
                </Window>
              {:else if item.id === 'sidebar'}
                <Window title="Files" sidebarWidth={96} className="wc-window" style={`width:${width - 32}px;height:176px`}>
                  {#snippet sidebar()}{@render side()}{/snippet}
                  {#snippet toolbar()}{@render tool()}{/snippet}
                  {@render content(false)}
                </Window>
              {:else if item.id === 'large-lights'}
                <Window title="Files" lightsSize="large" className="wc-window" style={`width:${width - 32}px;height:176px`}>
                  {#snippet toolbar()}{@render tool()}{/snippet}
                  {@render content(false)}
                </Window>
              {:else if item.id === 'floating-sidebar'}
                <Window title="Files" sidebarWidth={96} sidebarStyle="floating" className="wc-window" style={`width:${width - 32}px;height:176px`}>
                  {#snippet sidebar()}{@render side()}{/snippet}
                  {#snippet toolbar()}{@render tool()}{/snippet}
                  {@render content(false)}
                </Window>
              {:else if item.id === 'tall-toolbar'}
                <Window title="Files" lightsSize="large" barSize="tall" className="wc-window" style={`width:${width - 32}px;height:176px`}>
                  {#snippet toolbar()}{@render tallTool()}{/snippet}
                  {@render content(false)}
                </Window>
              {:else if item.id === 'combined'}
                <Window title="Files" sidebarWidth={96} sidebarStyle="floating" lightsSize="large" barSize="tall" className="wc-window" style={`width:${width - 32}px;height:176px`}>
                  {#snippet sidebar()}{@render side()}{/snippet}
                  {#snippet toolbar()}{@render tallTool()}{/snippet}
                  {@render content(false)}
                </Window>
              {/if}
            </div>
          {/snippet}
        </Stage>
      </div>
      <figcaption><strong>{item.title}</strong><span>{item.note}</span></figcaption>
    </figure>
  {/each}
</div>
