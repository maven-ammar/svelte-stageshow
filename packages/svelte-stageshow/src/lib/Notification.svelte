<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { HTMLAttributes } from 'svelte/elements'

  type Node = Snippet | string

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'class'> {
    icon?: Snippet | string
    title: Node
    body?: Node
    time?: string
    /** The phone is unlocked: the banner drops in at the top, under the island. */
    banner?: boolean
    className?: string
    class?: string
  }

  let { icon, title, body, time = 'now', banner = false, className = '', class: klass = '', ...rest }: Props = $props()
</script>

<div {...rest} class={`ss-notification${className ? ` ${className}` : ''}${klass ? ` ${klass}` : ''}`} data-banner={banner || undefined}>
  <span class="ss-notification__icon">
    {#if typeof icon === 'string'}{icon}{:else if icon}{@render icon()}{/if}
  </span>
  <span class="ss-notification__text">
    <span class="ss-notification__head">
      <span class="ss-notification__title">
        {#if typeof title === 'string'}{title}{:else}{@render title()}{/if}
      </span>
      <span class="ss-notification__time">{time}</span>
    </span>
    {#if body}
      <span class="ss-notification__body">
        {#if typeof body === 'string'}{body}{:else}{@render body()}{/if}
      </span>
    {/if}
  </span>
</div>
