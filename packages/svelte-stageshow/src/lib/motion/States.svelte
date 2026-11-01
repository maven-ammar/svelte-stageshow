<script lang="ts" generics="K extends string">
  import type { Snippet } from 'svelte'
  import type { HTMLAttributes } from 'svelte/elements'
  import { inStillStage, onReducedMotionChange, prefersReducedMotion } from '../reduced-motion.js'

  interface Props extends Omit<HTMLAttributes<HTMLSpanElement>, 'class' | 'children'> {
    value: K
    states: Record<K, string | Snippet>
    /** Where a smaller state sits in the box: start for text in a row, center for a button's label, end for a right-aligned value. */
    align?: 'start' | 'center' | 'end'
    className?: string
    /** Svelte's own class attribute; merged after className. */
    class?: string
    style?: string
  }

  let {
    value,
    states,
    align = 'center',
    className = '',
    class: klass = '',
    style = '',
    ...rest
  }: Props = $props()

  let reduced = $state(prefersReducedMotion())
  let root = $state<HTMLSpanElement | null>(null)

  $effect(() => {
    const update = () => (reduced = prefersReducedMotion() || inStillStage(root))
    update()
    return onReducedMotionChange(update)
  })

  const entries = $derived((Object.keys(states) as K[]).map((k) => ({ k, node: states[k] })))
</script>

<span
  {...rest}
  bind:this={root}
  class={`ss-states${className ? ` ${className}` : ''}${klass ? ` ${klass}` : ''}`}
  data-align={align}
  data-reduced={reduced || undefined}
  style={style}
>
  {#each entries as item (item.k)}
    <span class="ss-states__item" data-on={item.k === value || undefined} aria-hidden={item.k !== value || undefined}>{#if typeof item.node === 'string'}{item.node}{:else}{@render item.node()}{/if}</span>
  {/each}
</span>
