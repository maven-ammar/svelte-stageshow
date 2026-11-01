<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import Avatar from '../Avatar.svelte'

  type Tone = 'accent' | 'ink' | 'success' | 'person' | 'ios'

  interface Props extends Omit<HTMLAttributes<HTMLSpanElement>, 'class' | 'children'> {
    names: string[]
    size?: number
    overlap?: number
    gap?: number
    tones?: Tone[]
    className?: string
    /** Svelte's own class attribute; merged after className. */
    class?: string
    style?: string
  }

  let { names, size = 22, overlap = 6, gap = 2, tones, className = '', class: klass = '', style = '', ...rest }: Props = $props()

  const r = $derived(size / 2)
  // Center of the next avatar, measured from this one's left edge
  const next = $derived(size - overlap + r)
  const mask = $derived(`radial-gradient(circle at ${next}px 50%, transparent ${r + gap}px, #000 ${r + gap + 0.5}px)`)
  const rootStyle = $derived(`--ss-overlap:${-overlap}px;${style}`)
  const maskStyle = $derived(`-webkit-mask-image:${mask};mask-image:${mask};`)
</script>

<span
  {...rest}
  class={`ss-facepile${className ? ` ${className}` : ''}${klass ? ` ${klass}` : ''}`}
  style={rootStyle}
>
  {#each names as n, i (i)}
    <span class="ss-facepile__face" style={i < names.length - 1 ? maskStyle : undefined}>
      <Avatar name={n} {size} tone={tones?.[i] ?? 'person'} />
    </span>
  {/each}
</span>
