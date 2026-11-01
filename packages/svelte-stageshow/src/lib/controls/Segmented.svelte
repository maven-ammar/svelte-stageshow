<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { HTMLAttributes } from 'svelte/elements'
  import type { CursorKind } from '../types.js'

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'class' | 'children'> {
    items: (string | Snippet)[]
    value: number
    targets?: (string | undefined)[]
    cursor?: CursorKind
    className?: string
    /** Svelte's own class attribute; merged after className. */
    class?: string
    style?: string
  }

  let { items, value, targets, cursor, className = '', class: klass = '', style = '', ...rest }: Props = $props()

  const rootStyle = $derived(`--n:${items.length};${style}`)
  const thumbStyle = $derived(`transform:translateX(${value * 100}%)`)
</script>

<div
  {...rest}
  class={`ss-seg${className ? ` ${className}` : ''}${klass ? ` ${klass}` : ''}`}
  style={rootStyle}
>
  <span class="ss-seg__thumb" style={thumbStyle}></span>
  {#each items as o, i (i)}
    <span class="ss-seg__option" data-on={i === value || undefined} data-target={targets?.[i]} data-cursor={cursor}>
      {#if typeof o === 'string'}{o}{:else}{@render o()}{/if}
    </span>
  {/each}
</div>
