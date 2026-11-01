<script module lang="ts">
  /** Re-exported for callers that set a Phone's wallpaper. */
  export { WALLPAPER } from './wallpaper.js'
</script>

<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { HTMLAttributes } from 'svelte/elements'

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'class'> {
    date?: string
    time?: string
    /** The flashlight and camera buttons at the bottom. */
    controls?: boolean
    /** Where notifications stack. `bottom` is how iOS does it. */
    stack?: 'bottom' | 'top'
    /** satellite: a phone beside a window; controls go and notifications stack under the clock. */
    size?: 'full' | 'satellite'
    /** The date and clock. Off for a crop that shows only the notifications. */
    clock?: boolean
    className?: string
    class?: string
    children?: Snippet
  }

  let {
    date = 'Tuesday, October 21',
    time = '9:41',
    controls = true,
    stack = 'bottom',
    size = 'full',
    clock = true,
    className = '',
    class: klass = '',
    children,
    ...rest
  }: Props = $props()
</script>

<div
  {...rest}
  class={`ss-lock${className ? ` ${className}` : ''}${klass ? ` ${klass}` : ''}`}
  data-size={size}
  data-clock={clock ? undefined : 'off'}
>
  {#if clock}
    <div class="ss-lock__date">{date}</div>
    <div class="ss-lock__clock">{time}</div>
  {/if}
  <div class="ss-lock__stack" data-at={stack}>
    {#if children}{@render children()}{/if}
  </div>
  {#if controls && size === 'full'}
    <div class="ss-lock__controls">
      <span class="ss-lock__control">
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
          <path
            fill="currentColor"
            fill-rule="evenodd"
            d="M7.6 1.6h8.8a1.6 1.6 0 0 1 1.6 1.6v1.9H6V3.2a1.6 1.6 0 0 1 1.6-1.6ZM6 6h12l-2.6 4v10.4a2 2 0 0 1-2 2h-2.8a2 2 0 0 1-2-2V10ZM10.6 14a1.4 1.4 0 1 0 2.8 0 1.4 1.4 0 1 0-2.8 0Z"
          />
        </svg>
      </span>
      <span class="ss-lock__control">
        <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
          <path
            fill="currentColor"
            fill-rule="evenodd"
            d="M4.6 6.6h3.3l1.2-1.8a1.3 1.3 0 0 1 1.1-.6h3.6a1.3 1.3 0 0 1 1.1.6l1.2 1.8h3.3A2.6 2.6 0 0 1 22 9.2v8.6a2.6 2.6 0 0 1-2.6 2.6H4.6A2.6 2.6 0 0 1 2 17.8V9.2a2.6 2.6 0 0 1 2.6-2.6ZM7.5 13.4a4.5 4.5 0 1 0 9 0 4.5 4.5 0 1 0-9 0ZM9 13.4a3 3 0 1 0 6 0 3 3 0 1 0-6 0Z"
          />
        </svg>
      </span>
    </div>
  {/if}
</div>
