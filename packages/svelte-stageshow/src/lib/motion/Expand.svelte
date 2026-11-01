<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { HTMLAttributes } from 'svelte/elements'
  import { untrack } from 'svelte'
  import type { Rect } from '../measure.js'
  import { inStillStage, onReducedMotionChange, prefersReducedMotion } from '../reduced-motion.js'

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'class' | 'children'> {
    open: boolean
    from: Rect
    radius?: number
    duration?: number
    face?: Snippet
    children: Snippet
    className?: string
    /** Svelte's own class attribute; merged after className. */
    class?: string
    style?: string
  }

  let {
    open,
    from,
    radius = 16,
    duration,
    face,
    children,
    className = '',
    class: klass = '',
    style = '',
    ...rest
  }: Props = $props()

  let reduced = $state(prefersReducedMotion())
  let ref = $state<HTMLDivElement | null>(null)
  // Where the parent sits on the stage, and how much it is scaled on screen
  // (the stage's scale, times a phone screen's own)
  let box = $state({ w: 0, h: 0, x: 0, y: 0, k: 1, r: 0 })

  $effect(() => {
    const update = () => (reduced = prefersReducedMotion() || inStillStage(ref))
    update()
    return onReducedMotionChange(update)
  })

  $effect(() => {
    const fx = from.x
    const fy = from.y
    const fw = from.width
    const fh = from.height
    void fx
    void fy
    void fw
    void fh
    const p = ref?.parentElement
    const stage = p?.closest<HTMLElement>('.ss-stage')
    if (!p || !stage) return
    const sr = stage.getBoundingClientRect()
    const pr = p.getBoundingClientRect()
    const s = sr.width / stage.offsetWidth || 1
    const k = pr.width / p.offsetWidth || 1
    // Inside a Phone, open is the display's own corner, not square: the app
    // keeps its rounded corners all the way in and lands under the bezel's
    const r = parseFloat(getComputedStyle(p).getPropertyValue('--ss-screen-r')) || 0
    box = {
      w: p.clientWidth,
      h: p.clientHeight,
      x: (pr.left - sr.left) / s + (p.clientLeft * k) / s,
      y: (pr.top - sr.top) / s + (p.clientTop * k) / s,
      k: k / s,
      r,
    }
  })

  // Only opening and closing animate. A new `from` while the state holds (the
  // first measure, a re-measure) is applied at once: animating it would sweep
  // the clip in from wherever the unmeasured rect put it, the stage's top left.
  // A card not measured yet (no size) isn't shown at all
  const key = $derived(`${open}|${from.x}|${from.y}|${from.width}|${from.height}|${box.w}|${box.h}|${box.x}|${box.y}`)
  let last = untrack(() => ({ open, key }))
  // Open, the target doesn't depend on `from`, so a re-measure mid-open (the
  // tapped notification easing back from its press) must not cut it short
  const moving = $derived(last.key === key || last.open !== open || open)

  $effect(() => {
    last = { open, key }
  })

  const unmeasured = $derived(!open && (!from.width || !from.height || !box.w))
  // `from` in the parent's own pixels
  const x = $derived((from.x - box.x) / box.k)
  const y = $derived((from.y - box.y) / box.k)
  const w = $derived(from.width / box.k)
  const h = $derived(from.height / box.k)
  const r = $derived(Math.max(0, box.w - x - w))
  const b = $derived(Math.max(0, box.h - y - h))
  // A card: a quick start that settles long, like a UIKit spring with no
  // overshoot. A launch is gentler and longer: with the card's curve the app
  // is nearly full screen within a tenth of a second, which reads as a jump
  const curve = $derived(face ? 'cubic-bezier(0.25, 0.6, 0.2, 1)' : 'cubic-bezier(0.3, 0.75, 0.1, 1)')
  const ms = $derived(reduced ? 0 : (duration ?? (face ? 640 : 520)))
  const ease = $derived(`${ms}ms ${curve}`)

  const faceScale = $derived(box.w ? w / box.w : 1)
  const clipH = $derived(Math.max(0, box.h - h / faceScale))
  const faceRootStyle = $derived(
    `${
      open
        ? `transform:translate(0px, 0px) scale(1);clip-path:inset(0px 0px 0px 0px round ${box.r}px);`
        : `transform:translate(${x}px, ${y}px) scale(${faceScale});clip-path:inset(0px 0px ${clipH}px 0px round ${radius / faceScale}px);`
    }--ss-expand-ms:${ms}ms;--ss-expand-ease:${curve};${moving ? '' : 'transition:none;'}${unmeasured ? 'visibility:hidden;' : ''}${style}`,
  )
  const faceInnerStyle = $derived(`width:${w}px;height:${h}px;transform:scale(${1 / faceScale});`)

  const clip = $derived(
    open ? `inset(0px 0px 0px 0px round ${box.r}px)` : `inset(${y}px ${r}px ${b}px ${x}px round ${radius}px)`,
  )
  // Retain the same composited content layer at both ends, so the text does
  // not re-rasterise when the card finishes opening or closing.
  const ride = $derived(`transform:translate3d(0, ${open ? 0 : y}px, 0);transition:${moving ? `transform ${ease}` : 'none'};`)
  const rootStyle = $derived(
    `clip-path:${clip};transition:${moving ? `clip-path ${ease}` : 'none'};${unmeasured ? 'visibility:hidden;' : ''}${style}`,
  )
</script>

{#if face}
  <div
    {...rest}
    bind:this={ref}
    class={`ss-expand${className ? ` ${className}` : ''}${klass ? ` ${klass}` : ''}`}
    data-open={open || undefined}
    data-launch=""
    style={faceRootStyle}
  >
    <div class="ss-expand__content">{@render children()}</div>
    <div class="ss-expand__face" style={faceInnerStyle}>{@render face()}</div>
  </div>
{:else}
  <div
    {...rest}
    bind:this={ref}
    class={`ss-expand${className ? ` ${className}` : ''}${klass ? ` ${klass}` : ''}`}
    data-open={open || undefined}
    style={rootStyle}
  >
    <div class="ss-expand__content" style={ride}>{@render children()}</div>
  </div>
{/if}
