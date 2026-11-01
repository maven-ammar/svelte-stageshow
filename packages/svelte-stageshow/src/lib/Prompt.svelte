<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { HTMLAttributes } from 'svelte/elements'

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'class' | 'children'> {
    /** The working directory shown before the prompt. */
    path?: string
    /** What was typed. A string, or a snippet (a typed string, a Caret after it). */
    children?: Snippet | string
    className?: string
    class?: string
  }

  let { path = '~', children, className = '', class: klass = '', ...rest }: Props = $props()
</script>

<div {...rest} class={`ss-term__line ss-term__prompt${className ? ` ${className}` : ''}${klass ? ` ${klass}` : ''}`}>
  <span class="ss-term__path">{path}</span>
  <span class="ss-term__sigil">❯</span>
  <span class="ss-term__cmd">
    {#if typeof children === 'string'}{children}{:else if children}{@render children()}{/if}
  </span>
</div>
