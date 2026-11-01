<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'

  interface Props extends Omit<HTMLAttributes<HTMLSpanElement>, 'class'> {
    /** Width in px, or any CSS length. */
    w: number | string
    h?: number
    /** 1 (faintest) to 5. */
    tone?: 1 | 2 | 3 | 4 | 5
    r?: number
    /** Let it narrow in a row too tight for it. On by default for a line. */
    shrink?: boolean
    className?: string
    /** Svelte's own class attribute; merged after className. */
    class?: string
    style?: string
  }

  let { w, h = 6, tone = 3, r = 2, shrink, className = '', class: klass = '', style = '', ...rest }: Props = $props()

  const INK = ['var(--ss-ink-1)', 'var(--ss-ink-2)', 'var(--ss-ink-3)', 'var(--ss-ink-4)', 'var(--ss-ink-5)'] as const
  const gives = $derived(shrink ?? (typeof w === 'number' && w > h * 3))
  const width = $derived(typeof w === 'number' ? `${w}px` : w)
  const css = $derived(`width:${width};height:${h}px;border-radius:${r}px;background:${INK[tone - 1]};${style}`)
</script>

<span {...rest} class={`ss-bar${className ? ` ${className}` : ''}${klass ? ` ${klass}` : ''}`} data-shrink={gives || undefined} style={css}></span>
