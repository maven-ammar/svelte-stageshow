<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { HTMLAttributes } from 'svelte/elements'
  import { css as easeCss, type Bezier, type EaseName } from '../ease.js'
  import type { Rect } from '../measure.js'
  import { inStillStage, onReducedMotionChange, prefersReducedMotion } from '../reduced-motion.js'

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'class' | 'children'> {
    focus: Rect | null
    pad?: number
    max?: number
    duration?: number
    feather?: number
    ease?: EaseName | Bezier
    children: Snippet
    className?: string
    /** Svelte's own class attribute; merged after className. */
    class?: string
    style?: string
  }

  let {
    focus,
    pad = 32,
    max = 2,
    duration = 1100,
    feather = 28,
    ease: curve = 'camera',
    children,
    className = '',
    class: klass = '',
    style = '',
    ...rest
  }: Props = $props()

  let reduced = $state(prefersReducedMotion())
  let camera = $state<HTMLDivElement | null>(null)
  let size = $state({ w: 0, h: 0 })

  $effect(() => {
    const update = () => (reduced = prefersReducedMotion() || inStillStage(camera))
    update()
    return onReducedMotionChange(update)
  })

  // Followed, not read once: a Stage switching to its compact design (or any
  // resize) changes the frame the zoom is worked out in
  $effect(() => {
    const p = camera?.parentElement?.parentElement
    if (!p) return
    let w = 0
    let h = 0
    const read = () => {
      if (w === p.offsetWidth && h === p.offsetHeight) return
      w = p.offsetWidth
      h = p.offsetHeight
      size = { w, h }
    }
    read()
    const ro = new ResizeObserver(read)
    ro.observe(p)
    return () => ro.disconnect()
  })

  const transform = $derived.by(() => {
    if (!focus || !size.w) return 'none'
    const s = Math.max(1, Math.min(max, size.w / (focus.width + pad * 2), size.h / (focus.height + pad * 2)))
    const tx = Math.min(0, Math.max(size.w - size.w * s, size.w / 2 - (focus.x + focus.width / 2) * s))
    const ty = Math.min(0, Math.max(size.h - size.h * s, size.h / 2 - (focus.y + focus.height / 2) * s))
    return `translate(${tx}px, ${ty}px) scale(${s})`
  })

  const ease = $derived(`${reduced ? 0 : duration}ms ${easeCss(curve)}`)
  const viewStyle = $derived(
    `--ss-feather:${transform === 'none' ? 0 : feather}px;transition:--ss-feather ${ease};${style}`,
  )
  const innerStyle = $derived(`transform:${transform};transition:transform ${ease};`)
</script>

<div
  {...rest}
  class="ss-camera-view"
  data-zoomed={transform === 'none' ? undefined : true}
  data-focus={transform === 'none' || !focus
    ? undefined
    : `${focus.x},${focus.y},${focus.width},${focus.height}`}
  data-feather={feather}
  style={viewStyle}
>
  <div bind:this={camera} class={`ss-camera${className ? ` ${className}` : ''}${klass ? ` ${klass}` : ''}`} style={innerStyle}>{@render children()}</div>
</div>
