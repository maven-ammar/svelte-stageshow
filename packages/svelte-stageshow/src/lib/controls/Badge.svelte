<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { HTMLAttributes } from 'svelte/elements'

  interface Props extends Omit<HTMLAttributes<HTMLSpanElement>, 'class' | 'children'> {
    tone?: 'neutral' | 'accent' | 'success' | 'danger' | 'warning'
    dot?: boolean
    icon?: Snippet
    children: string | Snippet
    className?: string
    /** Svelte's own class attribute; merged after className. */
    class?: string
    style?: string
  }

  let { tone = 'neutral', dot, icon, children, className = '', class: klass = '', style = '', ...rest }: Props = $props()
</script>

<span
  {...rest}
  class={`ss-badge${className ? ` ${className}` : ''}${klass ? ` ${klass}` : ''}`}
  data-tone={tone}
  data-lead={dot || icon ? '' : undefined}
  style={style || undefined}
>
  {#if dot}<span class="ss-badge__dot"></span>{/if}
  {#if icon}{@render icon()}{/if}
  <span class="ss-badge__label">{#if typeof children === 'string'}{children}{:else}{@render children()}{/if}</span>
</span>
