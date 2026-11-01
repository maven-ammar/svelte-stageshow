<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { HTMLAttributes } from 'svelte/elements'
  import { untrack } from 'svelte'
  import { inStillStage, onReducedMotionChange, prefersReducedMotion } from '../reduced-motion.js'

  interface Props extends Omit<HTMLAttributes<HTMLSpanElement>, 'class' | 'children' | 'id'> {
    id: string | number
    children: string | Snippet
    duration?: number
    className?: string
    /** Svelte's own class attribute; merged after className. */
    class?: string
    style?: string
  }

  let {
    id,
    children,
    duration = 450,
    className = '',
    class: klass = '',
    style = '',
    ...rest
  }: Props = $props()

  let reduced = $state(prefersReducedMotion())
  let box = $state<HTMLSpanElement | null>(null)
  let inner = $state<HTMLSpanElement | null>(null)
  let prev = $state<{ id: string | number; node: string | Snippet; w?: number } | null>(null)
  // The id on screen, kept in state so a render pass still hands the old
  // content to the fading copy
  let shownId = $state(untrack(() => id))
  let last = untrack(() => children)
  let size = $state<{ w: number; h: number } | null>(null)

  $effect(() => {
    const update = () => (reduced = prefersReducedMotion() || inStillStage(box))
    update()
    return onReducedMotionChange(update)
  })

  $effect.pre(() => {
    const nextId = id
    const isReduced = reduced
    const width = size?.w
    if (shownId !== nextId) {
      // The old words keep the width they had, so they never rewrap as the box
      // narrows under them. A plain-text child is snapshotted before it
      // changes, so the fading copy holds the old words; anything else keeps
      // the previous snippet (Svelte snippets stay live, unlike a ReactNode).
      const text = inner && inner.childElementCount === 0 ? (inner.textContent ?? '') : last
      prev = isReduced ? null : { id: shownId, node: text, w: width }
      shownId = nextId
    }
  })

  // The content last committed: written after commit, never during a render
  // pass, so the fading copy always holds the old words
  $effect(() => {
    last = children
  })

  // Measured on every change of id, and kept current after: a font or the
  // demo's own CSS arriving late changes the size without a swap
  $effect(() => {
    const el = inner
    const frame = box
    const watchedId = id
    const isReduced = reduced
    void watchedId
    void isReduced
    if (!el || !frame) return
    // Measured with the box at its natural size for one synchronous read: the
    // box still holds the old size, and longer text measured inside it would
    // be squeezed to the old width. Restored before the browser paints. The
    // observer skips while a swap runs: switching the transition off for the
    // read would cancel the height animation and snap the box to its end.
    const measure = (observed?: boolean) => {
      if (observed && untrack(() => !reduced && prev !== null)) return
      const { width, height, transition } = frame.style
      const own = { width: el.style.width, maxWidth: el.style.maxWidth }
      frame.style.transition = 'none'
      frame.style.width = ''
      frame.style.height = ''
      el.style.width = ''
      el.style.maxWidth = ''
      // The exact used size, not offsetWidth: that rounds down, and a label
      // a fraction of a pixel wider than its box wraps onto two lines.
      // Computed style also ignores the stage's own scale
      const cs = getComputedStyle(el)
      const w = parseFloat(cs.width) || 0
      const h = parseFloat(cs.height) || 0
      el.style.width = own.width
      el.style.maxWidth = own.maxWidth
      frame.style.width = width
      frame.style.height = height
      void frame.offsetWidth
      frame.style.transition = transition
      untrack(() => {
        if (!size || size.w !== w || size.h !== h) size = { w, h }
      })
    }
    measure()
    const ro = new ResizeObserver(() => measure(true))
    ro.observe(el)
    return () => ro.disconnect()
  })

  $effect(() => {
    const current = prev
    if (!current) return
    if (reduced) {
      prev = null
      return
    }
    const t = setTimeout(() => (prev = null), duration)
    return () => clearTimeout(t)
  })

  // Narrowing, the box waits while the old words fade, so they are never cut
  // by its edge mid-word; widening, it opens at once for the new ones
  const shrink = $derived(!!(prev && size && prev.w !== undefined && size.w < prev.w))
  // The soft edge is for words passing a moving edge: an image swapped for
  // one the same size keeps its own edges
  const resizing = $derived(!!(prev && size && prev.w !== undefined && size.w !== prev.w))

  const boxStyle = $derived.by(() => {
    let css = ''
    if (size) css += `width:${size.w}px;height:${size.h}px;`
    css += `transition:${
      !reduced && prev
        ? `width ${duration}ms cubic-bezier(0.25, 0.8, 0.25, 1) ${shrink ? Math.round(duration * 0.5) : 0}ms, height ${duration}ms cubic-bezier(0.25, 0.8, 0.25, 1)`
        : 'none'
    };`
    return `${css}${style}`
  })

  const outStyle = (old: { w?: number }) =>
    `animation-duration:${duration * 0.5}ms;${old.w === undefined ? '' : `width:${old.w}px;max-width:none;`}`
  const innerStyle = () => {
    let css = reduced ? 'animation-name:none;' : ''
    css += `animation-duration:${duration}ms;`
    if (!reduced && prev && size) css += `width:${size.w}px;max-width:none;`
    return css
  }
</script>

<span {...rest} bind:this={box} class={`ss-swap${className ? ` ${className}` : ''}${klass ? ` ${klass}` : ''}`} data-swapping={(!reduced && resizing) || undefined} style={boxStyle}>{#if !reduced && prev}{@const old = prev}{#key old.id}<span class="ss-swap__out" style={outStyle(old)}>{#if typeof old.node === 'string'}{old.node}{:else}{@render old.node()}{/if}</span>{/key}{/if}{#key id}<span bind:this={inner} class="ss-swap__in" style={innerStyle()}>{#if typeof children === 'string'}{children}{:else}{@render children()}{/if}</span>{/key}</span>
