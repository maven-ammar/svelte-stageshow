<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { HTMLAttributes } from 'svelte/elements'

  type Url = string | Snippet

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'class'> {
    /** The address. A string, or a snippet. */
    url?: Url
    /** Browser: the address field's shape. */
    urlShape?: 'rounded' | 'pill'
    /** Tab titles; the first is the active tab. */
    tabs?: Url[]
    /** Browser: back and forward buttons before the address. */
    nav?: boolean
    /** App: the window title. */
    title?: string
    /** App: a full-height sidebar. The traffic lights sit in its top. */
    sidebar?: Snippet
    sidebarWidth?: number
    sidebarStyle?: 'flush' | 'floating'
    /** Controls on the right of the bar. */
    toolbar?: Snippet
    /** Controls on the left of the bar, after the title. */
    lead?: Snippet
    /** Props for the content column. `class` is merged with the body class. */
    body?: { class?: string; [key: string]: unknown }
    receded?: boolean
    chrome?: 'native' | 'glass' | 'terminal' | 'card' | 'hairline'
    lights?: 'color' | 'grey' | 'white'
    lightsSize?: 'standard' | 'large'
    barSize?: 'standard' | 'tall'
    className?: string
    /** Svelte's own class attribute; merged after className. */
    class?: string
    children?: Snippet
  }

  let {
    url,
    urlShape,
    tabs,
    nav = false,
    title,
    sidebar,
    sidebarWidth = 180,
    sidebarStyle,
    toolbar,
    lead,
    body,
    receded = false,
    chrome,
    lights,
    lightsSize,
    barSize,
    className = '',
    class: klass = '',
    children,
    ...rest
  }: Props = $props()

  const cls = $derived(`ss-window ss-recede${className ? ` ${className}` : ''}${klass ? ` ${klass}` : ''}`)
  const large = $derived(lightsSize === 'large' ? 'large' : undefined)
  const tall = $derived(barSize === 'tall' ? 'tall' : undefined)
  const nativeLights = $derived(lights === 'grey' ? 'grey' : undefined)
  const bodyClass = $derived(`ss-window__body${chrome === 'terminal' ? ' ss-term' : ''}${body?.class ? ` ${body.class}` : ''}`)
  const bodyAttrs = $derived({ ...body, class: bodyClass })

  function specialLights() {
    if (chrome === 'glass') return lights === 'color' || lights === 'white' ? lights : 'grey'
    return lights === 'color' || lights === 'white' ? lights : undefined
  }
</script>

{#snippet lightsRow()}
  <span class="ss-window__lights">
    <span class="ss-window__dot"></span>
    <span class="ss-window__dot"></span>
    <span class="ss-window__dot"></span>
  </span>
{/snippet}

{#snippet lock()}
  <svg class="ss-window__lock" width="7" height="8" viewBox="0 0 7 8" aria-hidden="true">
    <path d="M1.5 3.3V2.4a2 2 0 0 1 4 0v.9" fill="none" stroke="currentColor" stroke-width="1.1" />
    <rect x="0" y="3.3" width="7" height="4.7" rx="1.2" fill="currentColor" />
  </svg>
{/snippet}

{#snippet chevron(back: boolean)}
  <svg class="ss-window__chev" width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
    <path d={back ? 'M6.5 1.5 3 5l3.5 3.5' : 'M3.5 1.5 7 5 3.5 8.5'} fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
{/snippet}

{#snippet address()}
  {#if url !== undefined}
    <span class="ss-window__url">
      <span class="ss-window__url-text">
        {#if typeof url === 'string'}{url}{:else}{@render url()}{/if}
      </span>
    </span>
  {/if}
{/snippet}

{#if chrome === 'terminal'}
  <div
    {...rest}
    class={cls}
    data-chrome="terminal"
    data-lights={nativeLights}
    data-lights-size={large}
    data-receded={receded || undefined}
  >
    <div class="ss-window__bar">
      {@render lightsRow()}
      {#if title !== undefined}<span class="ss-term__title">{title}</span>{/if}
    </div>
    <div {...bodyAttrs}>
      {#if children}{@render children()}{/if}
    </div>
  </div>
{:else if chrome === 'glass' || chrome === 'card' || chrome === 'hairline'}
  <div
    {...rest}
    class={cls}
    data-chrome={chrome}
    data-lights={specialLights()}
    data-receded={receded || undefined}
  >
    <div class="ss-window__bar">
      {@render lightsRow()}
      {#if url !== undefined}
        <span class="ss-window__url">
          {#if chrome === 'glass'}{@render lock()}{/if}
          <span class="ss-window__url-text">
            {#if typeof url === 'string'}{url}{:else}{@render url()}{/if}
          </span>
        </span>
      {/if}
      <span class="ss-window__end">
        {#if toolbar}{@render toolbar()}{/if}
      </span>
    </div>
    <div {...bodyAttrs}>
      {#if children}{@render children()}{/if}
    </div>
  </div>
{:else if sidebar !== undefined}
  <div
    {...rest}
    class={cls}
    data-kind="sidebar"
    data-side={sidebarStyle === 'floating' ? 'floating' : undefined}
    data-lights={nativeLights}
    data-lights-size={large}
    data-bar={tall}
    data-receded={receded || undefined}
    data-url-shape={urlShape}
  >
    <aside class="ss-window__side" style={`width:${sidebarWidth}px`}>
      <div class="ss-window__side-top">
        {@render lightsRow()}
      </div>
      {@render sidebar()}
    </aside>
    <div class="ss-window__main">
      <div class="ss-window__bar">
        {#if title !== undefined}<span class="ss-window__heading">{title}</span>{/if}
        {#if lead}{@render lead()}{/if}
        {#if url !== undefined}
          {#if nav}
            <span class="ss-window__nav">
              {@render chevron(true)}
              {@render chevron(false)}
            </span>
          {/if}
          {@render address()}
        {/if}
        <span class="ss-window__spacer"></span>
        {#if toolbar}{@render toolbar()}{/if}
      </div>
      <div {...bodyAttrs}>
        {#if children}{@render children()}{/if}
      </div>
    </div>
  </div>
{:else if tabs?.length}
  <div
    {...rest}
    class={cls}
    data-kind="tabs"
    data-lights={nativeLights}
    data-lights-size={large}
    data-receded={receded || undefined}
    data-url-shape={urlShape}
  >
    <div class="ss-window__tabs">
      {@render lightsRow()}
      {#each tabs as tab, i}
        <span class="ss-window__tab" data-active={i === 0 || undefined}>
          <span class="ss-window__favicon"></span>
          <span class="ss-window__tab-label">
            {#if typeof tab === 'string'}{tab}{:else}{@render tab()}{/if}
          </span>
        </span>
      {/each}
    </div>
    <div class="ss-window__bar">
      {#if url !== undefined}
        {#if nav}
          <span class="ss-window__nav">
            {@render chevron(true)}
            {@render chevron(false)}
          </span>
        {/if}
        {@render address()}
      {/if}
      {#if toolbar}{@render toolbar()}{/if}
    </div>
    <div {...bodyAttrs}>
      {#if children}{@render children()}{/if}
    </div>
  </div>
{:else}
  <div
    {...rest}
    class={cls}
    data-receded={receded || undefined}
    data-url-shape={urlShape}
    data-lights={nativeLights}
    data-lights-size={large}
    data-bar={tall}
  >
    <div class="ss-window__bar">
      {@render lightsRow()}
      {#if url !== undefined}
        {#if nav}
          <span class="ss-window__nav">
            {@render chevron(true)}
            {@render chevron(false)}
          </span>
        {/if}
        {@render address()}
      {/if}
      {#if title !== undefined}<span class="ss-window__title" data-toolbar={toolbar ? true : undefined}>{title}</span>{/if}
      {#if lead}{@render lead()}{/if}
      {#if url === undefined && title === undefined}<span class="ss-window__spacer"></span>{/if}
      {#if toolbar}{@render toolbar()}{/if}
    </div>
    <div {...bodyAttrs}>
      {#if children}{@render children()}{/if}
    </div>
  </div>
{/if}
