<script lang="ts">
  import type { Snippet } from 'svelte'

  interface Props {
    show?: boolean
    /** Names the × for the cursor. */
    remove?: string
    /** The row's own gap, so a removed chip takes no space at all. */
    gap?: number
    children: Snippet
    className?: string
    /** Svelte's own class attribute; merged after className. */
    class?: string
    style?: string
  }

  let { show = true, remove, gap = 0, children, className = '', class: klass = '', style = '' }: Props = $props()

  let chipEl = $state<HTMLSpanElement | null>(null)
  let measured = $state<number | null>(null)

  $effect(() => {
    if (chipEl) measured = chipEl.offsetWidth
  })

  const slotStyle = $derived(`width:${show ? (measured ?? 'auto') : 0}${typeof measured === 'number' || show ? 'px' : ''};margin-right:${show ? 0 : -gap}px;${style}`)
</script>

<span
  class={`ss-chip-slot${className ? ` ${className}` : ''}${klass ? ` ${klass}` : ''}`}
  data-show={show || undefined}
  style={slotStyle}
>
  <span bind:this={chipEl} class="ss-chip" data-removable={remove !== undefined || undefined}>
    <span class="ss-chip__label">{@render children()}</span>
    {#if remove !== undefined}
      <span class="ss-chip__x" data-target={remove}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
        </svg>
      </span>
    {/if}
  </span>
</span>
