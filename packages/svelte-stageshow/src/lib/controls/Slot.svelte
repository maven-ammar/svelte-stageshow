<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { HTMLAttributes } from 'svelte/elements'

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'class' | 'children'> {
    open: boolean
    height: number
    gap?: number
    dashed?: boolean
    children?: Snippet
    className?: string
    /** Svelte's own class attribute; merged after className. */
    class?: string
    style?: string
  }

  let { open, height, gap = 0, dashed, children, className = '', class: klass = '', style = '', ...rest }: Props = $props()

  const slotStyle = $derived(`height:${open ? height : 0}px;margin-top:${open ? 0 : -gap}px;${style}`)
  const markStyle = $derived(`height:${height}px`)
</script>

<div
  {...rest}
  class={`ss-slot${className ? ` ${className}` : ''}${klass ? ` ${klass}` : ''}`}
  data-open={open || undefined}
  data-dashed={dashed || undefined}
  style={slotStyle}
>
  <div class="ss-slot__clip">
    <div class="ss-slot__mark" style={markStyle}></div>
  </div>
  {#if children}{@render children()}{/if}
</div>
