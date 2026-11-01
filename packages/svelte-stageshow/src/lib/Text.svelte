<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { HTMLAttributes } from 'svelte/elements'
  import Bar from './Bar.svelte'
  import { getLook } from './look.js'

  interface Props extends Omit<HTMLAttributes<HTMLSpanElement>, 'class' | 'children'> {
    children: Snippet
    /** Filler: the words show only at `realistic` fidelity. */
    filler?: boolean
    /** Bar width in minimal fidelity. Estimated from the rendered text if left out. */
    w?: number
    h?: number
    tone?: 1 | 2 | 3 | 4 | 5
    /** Let it wrap. Text is one line by default. */
    wrap?: boolean
    className?: string
    /** Svelte's own class attribute; merged after className. */
    class?: string
    style?: string
  }

  let { children, filler = false, w, h = 6, tone = 3, wrap = false, className = '', class: klass = '', style = '', ...rest }: Props = $props()

  const look = getLook()
  let measureEl = $state<HTMLSpanElement | null>(null)
  let measured = $state(0)

  const asBar = $derived(look.fidelity === 'minimal' || (filler && look.fidelity !== 'realistic'))
  const barW = $derived(w ?? (measured > 0 ? Math.round(measured) : 60))

  $effect(() => {
    if (asBar && measureEl) measured = measureEl.offsetWidth
  })
</script>

{#if asBar}
  <span bind:this={measureEl} class="ss-text-measure" aria-hidden="true" style={`position:absolute;visibility:hidden;white-space:nowrap;pointer-events:none;${style}`}>{@render children()}</span>
  <Bar {h} {tone} w={barW} className={className} class={klass} {style} {...rest} />
{:else}
  <span {...rest} class={`ss-text${className ? ` ${className}` : ''}${klass ? ` ${klass}` : ''}`} data-wrap={wrap || undefined} style={style}>{@render children()}</span>
{/if}
