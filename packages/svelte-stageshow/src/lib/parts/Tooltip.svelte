<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Rect } from '../measure.js'

  interface Props extends Omit<HTMLAttributes<HTMLSpanElement>, 'class' | 'children'> {
    show: boolean
    at: Rect
    side?: 'below' | 'above'
    gap?: number
    children: string | Snippet
    className?: string
    /** Svelte's own class attribute; merged after className. */
    class?: string
    style?: string
  }

  let { show, at, side = 'below', gap = 6, children, className = '', class: klass = '', style = '', ...rest }: Props = $props()

  const x = $derived(at.x + at.width / 2)
  const y = $derived(side === 'below' ? at.y + at.height + gap : at.y - gap)
  const tipStyle = $derived(`left:${x}px;top:${y}px;${style}`)
</script>

<span
  {...rest}
  class={`ss-tooltip${className ? ` ${className}` : ''}${klass ? ` ${klass}` : ''}`}
  data-show={(show && at.width > 0) || undefined}
  data-side={side}
  style={tipStyle}
  role="tooltip"
>
  <span class="ss-tooltip__label">{#if typeof children === 'string'}{children}{:else}{@render children()}{/if}</span>
</span>
