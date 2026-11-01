<script lang="ts">
  import type { Snippet } from 'svelte'
  import Roll from './motion/Roll.svelte'

  interface Props {
    show?: boolean
    children: string | Snippet
    className?: string
    /** Svelte's own class attribute; merged after className. */
    class?: string
  }

  let { show = true, children, className = '', class: klass = '' }: Props = $props()
</script>

<div class={`ss-receipt${className ? ` ${className}` : ''}${klass ? ` ${klass}` : ''}`} data-show={show || undefined}>
  <span>
    {#if typeof children === 'string'}
      <Roll variant="fade" children={children} />
    {:else}
      <Roll variant="fade">{@render children()}</Roll>
    {/if}
  </span>
</div>
