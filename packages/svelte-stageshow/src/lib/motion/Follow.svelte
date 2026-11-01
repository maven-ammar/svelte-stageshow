<script module lang="ts">
  /**
   * Which cell a value falls in, sticky at the borders: it only changes once
   * the value is `hysteresis` of a cell past the edge, so a drag along a border
   * doesn't flicker between two cells.
   */
  export function cellOf(value: number, size: number, prev: number | null, hysteresis = 0.2) {
    const raw = Math.floor(value / size)
    if (prev === null || raw === prev) return raw
    const edge = raw > prev ? (prev + 1) * size : prev * size
    return Math.abs(value - edge) > size * hysteresis ? raw : prev
  }
</script>

<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { HTMLAttributes } from 'svelte/elements'
  import { untrack } from 'svelte'
  import type { Rect } from '../measure.js'
  import { inStillStage, onReducedMotionChange, prefersReducedMotion } from '../reduced-motion.js'

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'class' | 'children'> {
    /** The rect to sit on, in stage pixels. null hides it. */
    to: Rect | null
    /** Higher is snappier. 0.25 is a quick, settled follow. */
    stiffness?: number
    children?: Snippet
    className?: string
    /** Svelte's own class attribute; merged after className. */
    class?: string
    style?: string
  }

  let {
    to,
    stiffness = 0.25,
    className = '',
    class: klass = '',
    style = '',
    children,
    ...rest
  }: Props = $props()

  let el = $state<HTMLDivElement | null>(null)
  let reduced = $state(prefersReducedMotion())
  let cur: Rect | null = null
  let vel = { x: 0, y: 0, width: 0, height: 0 }
  let wake: () => void = () => {}

  $effect(() => {
    const update = () => (reduced = prefersReducedMotion() || inStillStage(el))
    update()
    return onReducedMotionChange(update)
  })

  // The loop sleeps once it has settled; a new target wakes it
  $effect(() => {
    const k = stiffness
    const isReduced = reduced
    let id = 0
    let running = false
    const damp = 2 * Math.sqrt(k) * 0.95
    const frame = 1000 / 60
    const keys = ['x', 'y', 'width', 'height'] as const
    let previous = performance.now()
    let remainder = 0
    let simulation: Rect | null = cur ? { ...cur } : null
    let velocity = { ...vel }
    let priorTarget: Rect | null = null
    const integrate = (c: Rect, v: typeof velocity, t: Rect) => {
      for (const key of keys) {
        v[key] += (t[key] - c[key]) * k - v[key] * damp
        c[key] += v[key]
      }
    }
    const step = (time = performance.now()) => {
      const elapsed = Math.min(100, Math.max(0, time - previous))
      previous = time
      const t = untrack(() => to)
      const node = untrack(() => el)
      // Hidden: forget where it was, so it next appears on its target rather than sliding in from the last one
      if (!t || isReduced) {
        cur = t ? { ...t } : null
        vel = { x: 0, y: 0, width: 0, height: 0 }
        simulation = cur ? { ...cur } : null
        velocity = { ...vel }
        remainder = 0
      }
      if (node && t) {
        if (!cur) cur = { ...t }
        if (!simulation || !priorTarget || keys.some((key) => priorTarget![key] !== t[key])) {
          // Retarget from the last rendered position and velocity, including
          // a partial simulation step, so an interruption cannot rewind.
          simulation = { ...cur }
          velocity = { ...vel }
          remainder = 0
        }
        priorTarget = { ...t }
        const c = cur
        const v = vel
        const sim = simulation
        // Preserve the existing 60Hz spring trajectory. Interpolate its next
        // step at higher refresh rates instead of integrating faster per RAF.
        remainder += elapsed
        while (remainder >= frame - 1e-6) {
          integrate(sim, velocity, t)
          remainder = Math.max(0, remainder - frame)
        }
        const next = { ...sim }
        const nextVelocity = { ...velocity }
        integrate(next, nextVelocity, t)
        const part = remainder / frame
        for (const key of keys) {
          c[key] = sim[key] + (next[key] - sim[key]) * part
          v[key] = velocity[key] + (nextVelocity[key] - velocity[key]) * part
          if (Math.abs(t[key] - c[key]) < 0.05 && Math.abs(v[key]) < 0.05) {
            c[key] = t[key]
            v[key] = 0
          }
        }
        node.style.transform = `translate(${c.x}px, ${c.y}px)`
        node.style.width = `${c.width}px`
        node.style.height = `${c.height}px`
      }
      const c = cur
      const v = vel
      const settled =
        !t ||
        !node ||
        (c !== null &&
          v.x === 0 &&
          v.y === 0 &&
          v.width === 0 &&
          v.height === 0 &&
          c.x === t.x &&
          c.y === t.y &&
          c.width === t.width &&
          c.height === t.height)
      running = !settled
      if (running) id = requestAnimationFrame(step)
    }
    wake = () => {
      const t = untrack(() => to)
      if (isReduced || !t || !cur) {
        // Initial placement and reappearance are layout, not spring motion.
        // A paused host must not need Step just to reveal the first target.
        cancelAnimationFrame(id)
        running = false
        step()
        return
      }
      if (running || keys.every((key) => cur![key] === t[key] && vel[key] === 0)) return
      running = true
      previous = performance.now()
      id = requestAnimationFrame(step)
    }
    untrack(() => wake())
    return () => {
      running = false
      cancelAnimationFrame(id)
      wake = () => {}
    }
  })

  $effect(() => {
    const t = to
    if (t) {
      void t.x
      void t.y
      void t.width
      void t.height
    }
    wake()
  })

  const followStyle = $derived(`${style}${reduced ? 'transition:none;' : ''}`)
</script>

<div
  {...rest}
  bind:this={el}
  class={`ss-follow${className ? ` ${className}` : ''}${klass ? ` ${klass}` : ''}`}
  data-show={to ? true : undefined}
  style={followStyle}
>{#if children}{@render children()}{/if}</div>
