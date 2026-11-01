<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'

  interface Props extends Omit<HTMLAttributes<HTMLSpanElement>, 'class' | 'children'> {
    on: boolean
    pending?: boolean
    size?: number
    className?: string
    /** Svelte's own class attribute; merged after className. */
    class?: string
    style?: string
  }

  let { on, pending, size = 16, className = '', class: klass = '', style = '', ...rest }: Props = $props()

  const boxStyle = $derived(`width:${size}px;height:${size}px;${style}`)
</script>

<span
  {...rest}
  class={`ss-check${className ? ` ${className}` : ''}${klass ? ` ${klass}` : ''}`}
  data-on={on || undefined}
  data-pending={(pending && !on) || undefined}
  style={boxStyle}
>
  <svg viewBox="0 0 16 16" width={size} height={size} aria-hidden="true">
    <circle class="ss-check__ring" cx="8" cy="8" r="7.25" />
    <circle class="ss-check__arc" cx="8" cy="8" r="7.25" pathLength={1} />
    <circle class="ss-check__fill" cx="8" cy="8" r="8" />
    <path class="ss-check__tick" d="M4.5 8.2 7 10.6l4.6-5" pathLength={1} />
  </svg>
</span>
