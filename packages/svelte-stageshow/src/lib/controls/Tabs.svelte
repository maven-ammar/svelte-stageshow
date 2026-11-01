<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { HTMLAttributes } from 'svelte/elements'

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'class' | 'children'> {
    items: (string | Snippet)[]
    value: number
    targets?: (string | undefined)[]
    className?: string
    /** Svelte's own class attribute; merged after className. */
    class?: string
    style?: string
  }

  let { items, value, targets, className = '', class: klass = '', style = '', ...rest }: Props = $props()

  let rowEl = $state<HTMLDivElement | null>(null)
  let bar = $state({ x: 0, w: 0 })

  $effect(() => {
    const count = items.length
    const current = value
    if (!rowEl) return
    const el = rowEl.children[current + 1] as HTMLElement | undefined
    if (el) bar = { x: el.offsetLeft, w: el.offsetWidth }
  })

  const barStyle = $derived(`transform:translateX(${bar.x}px) scaleX(${bar.w})`)
</script>

<div
  {...rest}
  bind:this={rowEl}
  class={`ss-tabs${className ? ` ${className}` : ''}${klass ? ` ${klass}` : ''}`}
  style={style || undefined}
>
  <!-- A 1px line scaled to the tab's width: it slides on transform alone -->
  <span class="ss-tabs__bar" style={barStyle}></span>
  {#each items as t, i (i)}
    <span class="ss-tabs__tab" data-on={i === value || undefined} data-target={targets?.[i]}>
      {#if typeof t === 'string'}{t}{:else}{@render t()}{/if}
    </span>
  {/each}
</div>
