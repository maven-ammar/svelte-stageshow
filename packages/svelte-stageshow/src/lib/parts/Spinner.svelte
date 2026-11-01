<script lang="ts">
  import type { SVGAttributes } from 'svelte/elements'

  interface Props extends Omit<SVGAttributes<SVGSVGElement>, 'class' | 'children'> {
    size?: number
    className?: string
    /** Svelte's own class attribute; merged after className. */
    class?: string
    style?: string
  }

  let { size = 14, className = '', class: klass = '', style = '', ...rest }: Props = $props()
</script>

<svg
  {...rest}
  class={`ss-spinner${className ? ` ${className}` : ''}${klass ? ` ${klass}` : ''}`}
  viewBox="0 0 16 16"
  width={size}
  height={size}
  style={style || undefined}
  aria-hidden="true"
>
  <circle cx="8" cy="8" r="6.25" fill="none" stroke="currentColor" stroke-opacity="0.18" stroke-width="1.5" />
  <path d="M8 1.75a6.25 6.25 0 0 1 6.25 6.25" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
</svg>
