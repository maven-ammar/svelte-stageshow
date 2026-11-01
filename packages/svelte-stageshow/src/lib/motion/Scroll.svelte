<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { HTMLAttributes } from 'svelte/elements'
  import { thumb } from '../measure.js'

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'class' | 'children'> {
    name: string
    bar?: 'overlay' | 'always' | 'none'
    className?: string
    /** Svelte's own class attribute; merged after className. */
    class?: string
    style?: string
    children: Snippet
  }

  let {
    name,
    bar = 'overlay',
    className = '',
    class: klass = '',
    style = '',
    children,
    ...rest
  }: Props = $props()

  let ref = $state<HTMLDivElement | null>(null)

  $effect(() => {
    const el = ref
    // The React part ran on every render; keep that snapshot current as the
    // content or its name changes, and follow any later size change.
    void name
    void children
    if (!el) return
    thumb(el)
    const ro = new ResizeObserver(() => thumb(el))
    ro.observe(el)
    if (el.parentElement) ro.observe(el.parentElement)
    return () => ro.disconnect()
  })
</script>

<div
  {...rest}
  class={`ss-scroller${className ? ` ${className}` : ''}${klass ? ` ${klass}` : ''}`}
  data-bar={bar}
  style={style}
>
  <div bind:this={ref} class="ss-scroll" data-target={name}>{@render children()}</div>
  {#if bar !== 'none'}
    <span class="ss-scroller__thumb"></span>
  {/if}
</div>
