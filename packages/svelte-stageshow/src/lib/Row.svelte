<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { HTMLAttributes } from 'svelte/elements'
  import Bar from './Bar.svelte'

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'class'> {
    /** The disc on the left: an Avatar, an icon tile, a thumbnail. */
    lead?: Snippet
    /** The first line: a name, a title. A Text or a Bar. */
    title: string | Snippet
    /** The second line: a preview, a description. */
    subtitle?: string | Snippet
    /** Trailing detail on the first line: a time, a count, a badge. */
    meta?: string | Snippet
    /** Preview lines under the subtitle: bar widths in px, or a snippet of real text. */
    preview?: number[] | Snippet
    /** An unread dot hanging in the margin left of the lead; the row never moves. */
    unread?: boolean
    selected?: boolean
    /** Inset of the row's fill, in px. 12 by default; a dense list takes 8. */
    pad?: number
    className?: string
    /** Svelte's own class attribute; merged after className. */
    class?: string
    style?: string
    /** Controls trailing at the end of the first line. */
    children?: Snippet
  }

  let {
    lead,
    title,
    subtitle,
    meta,
    preview,
    unread = false,
    selected = false,
    pad = 12,
    className = '',
    class: klass = '',
    style = '',
    children,
    ...rest
  }: Props = $props()

  const rowStyle = $derived(`--ss-row-pad:${pad}px;${style}`)
</script>

<div
  {...rest}
  class={`ss-row${className ? ` ${className}` : ''}${klass ? ` ${klass}` : ''}`}
  data-selected={selected || undefined}
  data-unread={unread || undefined}
  data-lead={lead ? '' : undefined}
  style={rowStyle}
>
  {#if unread}<span class="ss-row__dot" aria-hidden="true"></span>{/if}
  {#if lead}
    <span class="ss-row__lead">{@render lead()}</span>
  {/if}
  <span class="ss-row__body">
    <span class="ss-row__head">
      <span class="ss-row__title">
        {#if typeof title === 'string'}{title}{:else}{@render title()}{/if}
      </span>
      {#if meta !== undefined}
        <span class="ss-row__meta">
          {#if typeof meta === 'string'}{meta}{:else}{@render meta()}{/if}
        </span>
      {/if}
    </span>
    {#if subtitle !== undefined}
      <span class="ss-row__subtitle">
        {#if typeof subtitle === 'string'}{subtitle}{:else}{@render subtitle()}{/if}
      </span>
    {/if}
  </span>
  {#if preview !== undefined}
    {#if Array.isArray(preview)}
      <span class="ss-row__preview" aria-hidden="true">
        {#each preview as line}
          <Bar w={line} h={6} tone={2} />
        {/each}
      </span>
    {:else}
      <span class="ss-row__preview" data-text>{@render preview()}</span>
    {/if}
  {/if}
  {#if children}{@render children()}{/if}
</div>
