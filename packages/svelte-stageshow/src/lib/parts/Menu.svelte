<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { HTMLAttributes } from 'svelte/elements'

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'class' | 'children'> {
    items: (string | Snippet)[]
    value?: number
    targets?: (string | undefined)[]
    className?: string
    /** Svelte's own class attribute; merged after className. */
    class?: string
    style?: string
  }

  let { items, value, targets, className = '', class: klass = '', style = '', ...rest }: Props = $props()
</script>

<div
  {...rest}
  class={`ss-menu${className ? ` ${className}` : ''}${klass ? ` ${klass}` : ''}`}
  style={style || undefined}
  role="menu"
>
  {#each items as item, i (i)}
    <div class="ss-menu__item" data-active={i === value || undefined} data-target={targets?.[i]} role="menuitem">
      {#if typeof item === 'string'}{item}{:else}{@render item()}{/if}
    </div>
  {/each}
</div>
