<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { HTMLAttributes } from 'svelte/elements'
  import { getLook } from '../look.js'

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'class' | 'children'> {
    show: boolean
    icon?: Snippet
    children: string | Snippet
    action?: Snippet
    className?: string
    /** Svelte's own class attribute; merged after className. */
    class?: string
    style?: string
  }

  let { show, icon, children, action, className = '', class: klass = '', style = '', ...rest }: Props = $props()

  const look = getLook()
  // Minimal: words become a placeholder line, as everywhere else
  const minimalText = $derived(look.fidelity === 'minimal' && typeof children === 'string' ? children : null)
  const placeholderStyle = $derived(`width:${Math.min(160, (minimalText?.length ?? 0) * 5.5)}px;height:6px;border-radius:3px;background:var(--ss-ink-3);display:inline-block`)
</script>

<div
  {...rest}
  class={`ss-toast${className ? ` ${className}` : ''}${klass ? ` ${klass}` : ''}`}
  data-show={show || undefined}
  style={style || undefined}
  role="status"
>
  {#if icon}
    <span class="ss-toast__icon">{@render icon()}</span>
  {/if}
  <span>
    {#if minimalText !== null}
      <span class="ss-bar" style={placeholderStyle}></span>
    {:else if typeof children === 'string'}
      {children}
    {:else}
      {@render children()}
    {/if}
  </span>
  {#if action}
    <span class="ss-toast__action">{@render action()}</span>
  {/if}
</div>
