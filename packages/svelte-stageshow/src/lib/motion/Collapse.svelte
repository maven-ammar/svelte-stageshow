<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { HTMLAttributes } from 'svelte/elements'

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'class' | 'children'> {
    open: boolean
    /**
     * clip: the opening space uncovers the content, for rows and text. The
     * content is faint while the edge passes it, so nothing is ever seen sliced.
     * drop: the space opens and the content arrives whole, gliding into place.
     * For cards and messages: a notification, a toast, a chat message.
     */
    reveal?: 'clip' | 'drop'
    /** Where drop content comes from: 'above' (a notification), or 'below' (a chat message landing at the bottom of a feed). */
    from?: 'above' | 'below'
    /**
     * Opaque throughout: the height opens and closes over the content without
     * fading it. For a surface unlike the ground (a dark log panel on a light
     * window), which would otherwise pass through gray. Its content is there
     * from the first frame: open it with what it shows, never empty.
     */
    solid?: boolean
    children: Snippet
    /** React's callback name, kept verbatim; compose it with the element's own handler. */
    onTransitionEnd?: (event: TransitionEvent) => void
    className?: string
    /** Svelte's own class attribute; merged after className. */
    class?: string
    style?: string
  }

  let {
    open,
    reveal = 'clip',
    from = 'above',
    solid = false,
    children,
    onTransitionEnd,
    ontransitionend: nativeTransitionEnd,
    className = '',
    class: klass = '',
    style = '',
    ...rest
  }: Props = $props()

  // Marked moving from the frame open changes until the height settles
  let moving = $state(false)
  // Taller than a row: unfolding from the middle would cut its first line
  // while it's already visible, so it reveals from the top and fades in late
  let tall = $state(false)
  let inner = $state<HTMLDivElement | null>(null)
  let first = true

  $effect(() => {
    const node = inner
    const isOpen = open
    if (!node) return
    void isOpen
    const h = node.scrollHeight ?? 0
    if (h) tall = h > 44
    if (first) {
      first = false
      return
    }
    moving = true
    // No transitionend without a transition (reduced motion): never leave it moving
    const t = setTimeout(() => (moving = false), 900)
    return () => clearTimeout(t)
  })

  function transitionEnd(event: TransitionEvent & { currentTarget: EventTarget & HTMLDivElement }) {
    if (event.target === event.currentTarget && event.propertyName === 'grid-template-rows') moving = false
    onTransitionEnd?.(event)
    nativeTransitionEnd?.(event)
  }
</script>

<div
  {...rest}
  class={`ss-collapse${className ? ` ${className}` : ''}${klass ? ` ${klass}` : ''}`}
  data-open={open || undefined}
  data-reveal={reveal}
  data-solid={solid || undefined}
  data-from={reveal === 'drop' ? from : undefined}
  data-moving={moving || undefined}
  data-tall={tall || undefined}
  style={style}
  ontransitionend={transitionEnd}
>
  <div bind:this={inner} class="ss-collapse__inner" data-crop={reveal === 'clip' || undefined}>{@render children()}</div>
</div>
