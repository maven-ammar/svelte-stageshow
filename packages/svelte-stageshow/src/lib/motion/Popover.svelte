<script module lang="ts">
  /** CSS transform-origin keywords: a side, or a vertical and horizontal pair. */
  export type PopoverOrigin =
    | 'top'
    | 'bottom'
    | 'left'
    | 'right'
    | 'center'
    | `${'top' | 'bottom' | 'center'} ${'left' | 'right' | 'center'}`
    | `${'left' | 'right'} center`
</script>

<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { HTMLAttributes } from 'svelte/elements'

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'class' | 'children'> {
    show: boolean
    origin?: PopoverOrigin
    children: Snippet
    className?: string
    /** Svelte's own class attribute; merged after className. */
    class?: string
    style?: string
  }

  let {
    show,
    origin = 'top left',
    className = '',
    class: klass = '',
    style = '',
    children,
    ...rest
  }: Props = $props()

  // Closing, it keeps the place and contents it had open: a scene that resets
  // the anchor or the items as it closes would otherwise make the fading
  // popover jump or change under the eye. Once it has faded, it lets go and
  // takes the live contents instantly, out of sight, so a change made while
  // it was hidden (a list reset for the next loop) doesn't play when it reopens.
  let root = $state<HTMLDivElement | null>(null)
  let held = $state<{ style?: string; children: Snippet; origin: PopoverOrigin } | null>(null)
  let heldHtml = $state<string | null>(null)
  let released = $state(false)
  let wasShown = false

  // Svelte snippets stay live, unlike the ReactNode upstream held. Snapshot
  // the rendered contents before the closing update takes them away, so the
  // fading copy is the thing that was open.
  $effect.pre(() => {
    const showing = show
    if (wasShown && !showing) heldHtml = root?.innerHTML ?? null
    if (showing) heldHtml = null
    wasShown = showing
  })

  $effect(() => {
    if (show) {
      released = false
      held = { style, children, origin }
      return
    }
    const t = setTimeout(() => (released = true), 320)
    return () => clearTimeout(t)
  })

  const shown = $derived(show || released || !held ? { style, children, origin } : held)
  const shownStyle = $derived(`--ss-popover-origin:${shown.origin};${shown.style ?? ''}`)
  const frozen = $derived(!show && !released && heldHtml !== null)
</script>

<div
  {...rest}
  bind:this={root}
  class={`ss-popover${className ? ` ${className}` : ''}${klass ? ` ${klass}` : ''}`}
  data-show={show || undefined}
  data-instant={(!show && released) || undefined}
  style={shownStyle}
>{#if frozen}{@html heldHtml ?? ''}{:else}{@render shown.children()}{/if}</div>
