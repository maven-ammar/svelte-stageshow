<script lang="ts">
  import type { Snippet } from 'svelte'

  interface Props {
    children?: Snippet | string
    className?: string
    /** Svelte's own class attribute; merged after className. */
    class?: string
  }

  let { children, className = '', class: klass = '' }: Props = $props()
</script>

<div class={`ss-stamp${className ? ` ${className}` : ''}${klass ? ` ${klass}` : ''}`}>
  {#if typeof children === 'string'}{children}{:else if children}{@render children()}{/if}
</div>
