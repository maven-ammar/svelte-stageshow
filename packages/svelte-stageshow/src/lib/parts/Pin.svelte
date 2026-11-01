<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import { getLook } from '../look.js'

  interface Props extends Omit<HTMLAttributes<HTMLSpanElement>, 'class' | 'children'> {
    /** The commenter's initial. */
    name?: string
    src?: string
    size?: number
    /** Which corner is the point, the one that touches what the comment is about. */
    corner?: 'bl' | 'br' | 'tl' | 'tr'
    /** accent: the pin the story is about. ink: the others. */
    tone?: 'accent' | 'ink'
    /** The pin whose thread is open: a ring in its own color. */
    selected?: boolean
    className?: string
    /** Svelte's own class attribute; merged after className. */
    class?: string
    style?: string
  }

  let { name = '', src, size = 24, corner = 'bl', tone = 'accent', selected, className = '', class: klass = '', style = '', ...rest }: Props = $props()

  const look = getLook()
  const plain = $derived(look.fidelity === 'minimal')
  const pinStyle = $derived(`width:${size}px;height:${size}px;font-size:${Math.round(size * 0.42)}px;${style}`)
</script>

<span
  {...rest}
  class={`ss-pin${className ? ` ${className}` : ''}${klass ? ` ${klass}` : ''}`}
  data-corner={corner}
  data-tone={tone}
  data-selected={selected || undefined}
  style={pinStyle}
>
  <span class="ss-pin__face">
    {#if src && !plain}
      <img {src} alt="" />
    {:else if !plain}
      {name.trim()[0]?.toUpperCase() ?? ''}
    {/if}
  </span>
</span>
