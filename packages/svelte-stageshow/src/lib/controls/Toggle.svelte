<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'

  interface Props extends Omit<HTMLAttributes<HTMLSpanElement>, 'class' | 'children'> {
    on: boolean
    className?: string
    /** Svelte's own class attribute; merged after className. */
    class?: string
    style?: string
  }

  let { on, className = '', class: klass = '', style = '', ...rest }: Props = $props()
</script>

<span
  {...rest}
  class={`ss-toggle${className ? ` ${className}` : ''}${klass ? ` ${klass}` : ''}`}
  data-on={on || undefined}
  role="switch"
  aria-checked={on}
  style={style || undefined}
>
  <span class="ss-toggle__knob"></span>
</span>
