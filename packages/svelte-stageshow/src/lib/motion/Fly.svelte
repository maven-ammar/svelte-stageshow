<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Rect } from '../measure.js'
  import { inStillStage, onReducedMotionChange, prefersReducedMotion } from '../reduced-motion.js'
  import { warn } from '../util.js'

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'class' | 'children'> {
    /** Where it starts and where it lands, in stage pixels (from `rect()`): the source element's own rect and the landing element's own rect, never a slot or wrapper around them. */
    from: Rect
    to: Rect
    /** False waits at `from`, hidden; true shows it there and flies to `to`. Hide the source in the same set that turns it true. */
    go: boolean
    /** Shown while it waits at `from`: the thing being carried (under the cursor, before it flies), or a chip budding off a value, which grows out of it (it scales up from the source as it fades in) rather than popping in whole. Off by default, so it never doubles the element it leaves. */
    held?: boolean
    /** ms for the flight. Default 750. */
    duration?: number
    children: Snippet
    className?: string
    /** Svelte's own class attribute; merged after className. */
    class?: string
    style?: string
  }

  let {
    from: liveFrom,
    to: liveTo,
    go,
    held: shownAtRest = false,
    duration = 750,
    children,
    className = '',
    class: klass = '',
    style = '',
    ...rest
  }: Props = $props()

  let reduced = $state(prefersReducedMotion())
  let root = $state<HTMLDivElement | null>(null)
  // Both ends are fixed at take-off. Measured live, they move under the flight
  // (a closing menu scales the start away) and every change restarts the
  // transition: a creep near the end, then a jump when the real one appears.
  let held = $state<{ from: Rect; to: Rect } | null>(null)

  $effect(() => {
    const update = () => (reduced = prefersReducedMotion() || inStillStage(root))
    update()
    return onReducedMotionChange(update)
  })

  $effect(() => {
    if (!go) {
      held = null
      return
    }
    if (!held) held = { from: liveFrom, to: liveTo }
  })

  const startRect = $derived(held?.from ?? liveFrom)
  const toRect = $derived(held?.to ?? liveTo)
  // An empty start (nothing measured yet) takes the landing size, so the
  // flyer never grows from a point
  const from = $derived(
    startRect.width ? startRect : { ...startRect, width: toRect.width || 1, height: toRect.height || 1 },
  )
  const at = $derived(go ? toRect : from)
  const ms = $derived(reduced ? 0 : duration)
  const sx = $derived(at.width / (from.width || 1))
  // A child that doesn't fill the start box takes off or lands at the wrong size
  let body = $state<HTMLDivElement | null>(null)

  $effect(() => {
    const el = body?.firstElementChild as HTMLElement | null
    if (!el || !startRect.width) return
    if (Math.abs(el.offsetWidth - from.width) > 1 || Math.abs(el.offsetHeight - from.height) > 1)
      warn(
        `Fly: the child is ${el.offsetWidth}×${el.offsetHeight} but takes off from ${Math.round(from.width)}×${Math.round(from.height)}. Draw it at the start size, and pass the landing element's own rect as \`to\`.`,
      )
  })

  const rootStyle = $derived(
    `${go || shownAtRest ? '' : 'visibility:hidden;'}left:${from.x}px;top:${from.y}px;width:${from.width}px;height:${from.height}px;transform:translateX(${at.x - from.x}px);transition:transform ${ms}ms cubic-bezier(0.35, 0, 0.2, 1);${style}`,
  )
  const innerStyle = $derived(
    `transform:translateY(${at.y - from.y}px) scale(${sx});transform-origin:0 0;transition:transform ${ms}ms cubic-bezier(0.3, 0.6, 0.15, 1);`,
  )
</script>

<div
  {...rest}
  bind:this={root}
  class={`ss-fly${className ? ` ${className}` : ''}${klass ? ` ${klass}` : ''}`}
  data-go={go || undefined}
  data-held={shownAtRest || undefined}
  style={rootStyle}
>
  <div style={innerStyle}>
    <div bind:this={body} class="ss-fly__lift" style={go ? `animation-duration:${ms}ms` : undefined}>{@render children()}</div>
  </div>
</div>
