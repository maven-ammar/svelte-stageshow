<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'

  interface Props extends Omit<HTMLAttributes<HTMLSpanElement>, 'class' | 'children'> {
    value: number
    tone?: 'accent' | 'danger' | 'warning' | 'success' | 'ink'
    className?: string
    /** Svelte's own class attribute; merged after className. */
    class?: string
    style?: string
  }

  let { value, tone = 'accent', className = '', class: klass = '', style = '', ...rest }: Props = $props()

  const hidden = $derived((1 - Math.max(0, Math.min(1, value))) * 100)
  const fillStyle = $derived(`clip-path:inset(0 ${hidden}% 0 0 round 3px)`)
</script>

<span
  {...rest}
  class={`ss-meter${className ? ` ${className}` : ''}${klass ? ` ${klass}` : ''}`}
  data-tone={tone}
  style={style || undefined}
>
  <!-- Revealed with clip-path rather than width, so nothing re-lays out and the end stays round -->
  <span class="ss-meter__fill" style={fillStyle}></span>
</span>
