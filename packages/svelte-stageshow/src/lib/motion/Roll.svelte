<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { HTMLAttributes } from 'svelte/elements'
  import { untrack } from 'svelte'
  import { inStillStage, onReducedMotionChange, prefersReducedMotion } from '../reduced-motion.js'

  interface Props extends Omit<HTMLAttributes<HTMLSpanElement>, 'class' | 'children'> {
    /** Hold the old text this many ms before rolling: a total that changes
     * after the row that caused it has landed, not on the same frame. */
    delay?: number
    children: string | Snippet
    stagger?: number
    /** The side the text is pinned to. Found from the layout when left out: a
     * right-aligned value (text-align right, or last in a space-between or
     * flex-end row) changes against its right edge, so it never drifts. */
    align?: 'start' | 'end'
    /** 'roll' slides text up through the line, for numbers and inline text. 'fade'
     * crossfades in place with a small lift, for labels on buttons and other
     * controls, where a full roll shows two lines at once. */
    variant?: 'roll' | 'fade'
    className?: string
    /** Svelte's own class attribute; merged after className. */
    class?: string
    style?: string
  }

  let {
    delay = 0,
    children,
    stagger = 45,
    variant = 'roll',
    align,
    className = '',
    class: klass = '',
    style = '',
    ...rest
  }: Props = $props()

  let reduced = $state(prefersReducedMotion())
  let held = $state(untrack(() => (typeof children === 'string' ? children : '')))
  let view = $state(
    untrack(() => ({
      text: typeof children === 'string' ? children : '',
      head: 0,
      tail: 0,
      old: '',
      key: 0,
      numeric: true,
    })),
  )
  let mid = $state<HTMLSpanElement | null>(null)
  let root = $state<HTMLSpanElement | null>(null)
  let probe = $state<HTMLSpanElement | null>(null)
  let probeText = $state(untrack(() => (typeof children === 'string' ? children : '')))
  let fromWidth: number | null = null
  let side = $state<'start' | 'end'>(untrack(() => align ?? 'start'))

  $effect(() => {
    const update = () => (reduced = prefersReducedMotion() || inStillStage(root))
    update()
    return onReducedMotionChange(update)
  })

  // A text child is passed as a Svelte snippet, so read the words from a
  // hidden copy. The roll itself is built from the string, as upstream.
  $effect(() => {
    if (typeof children === 'string') {
      probeText = children
      return
    }
    const node = probe
    if (!node) return
    const read = () => {
      const next = node.textContent ?? ''
      if (untrack(() => probeText) !== next) probeText = next
    }
    read()
    const mo = new MutationObserver(read)
    mo.observe(node, { characterData: true, childList: true, subtree: true })
    return () => mo.disconnect()
  })

  const sourceText = $derived(typeof children === 'string' ? children : probeText)

  $effect(() => {
    const next = sourceText
    if (!delay || reduced) {
      held = next
      return
    }
    const id = setTimeout(() => (held = next), delay)
    return () => clearTimeout(id)
  })

  const textValue = $derived(delay && !reduced ? held : sourceText)

  // Inline text has no computed width. Use the line box's scale to convert
  // its painted width back to local CSS pixels, including inside a Phone or
  // Camera. offsetWidth rounds away the fractions that keep a suffix still.
  const rootWidth = () => {
    if (!root || !mid) return 0
    const height = parseFloat(getComputedStyle(mid).height)
    const scale = height > 0 ? mid.getBoundingClientRect().height / height : 1
    return root.getBoundingClientRect().width / (scale || 1)
  }

  $effect(() => {
    const chosen = align
    if (chosen) {
      side = chosen
      return
    }
    const el = root
    if (!el?.parentElement) return
    // Look through wrappers that only hold the roll (a <b>, a value span):
    // they size to it, so where the wrapper sits is where the text pins
    let box: HTMLElement = el
    while (
      box.parentElement &&
      box.parentElement.childElementCount === 1 &&
      Math.abs(box.parentElement.getBoundingClientRect().width - box.getBoundingClientRect().width) < 1
    )
      box = box.parentElement
    const parent = box.parentElement
    if (!parent) return
    const p = getComputedStyle(parent)
    const flex = /flex/.test(p.display) && p.flexDirection.startsWith('row')
    // Pushed to the right edge by an auto margin (or anything else) reads the
    // same from the layout: flush with the row's end, slack before it
    const pushed = () => {
      const prev = box.previousElementSibling
      const r = box.getBoundingClientRect()
      const pr = parent.getBoundingClientRect()
      const flush =
        Math.abs(
          pr.right -
            parseFloat(p.paddingRight) -
            parseFloat(p.borderRightWidth) -
            r.right,
        ) < 1
      const slack = prev ? r.left - prev.getBoundingClientRect().right - (parseFloat(p.columnGap) || 0) : 0
      return flush && slack > 1
    }
    const end =
      /right|end/.test(getComputedStyle(el).textAlign) ||
      (flex && box === parent.lastElementChild && (/space-between|flex-end|^end/.test(p.justifyContent) || pushed()))
    side = end ? 'end' : 'start'
  })

  $effect(() => {
    const nextText = textValue
    const isReduced = reduced
    if (isReduced) {
      view = { text: nextText, head: 0, tail: 0, old: '', key: 0, numeric: true }
      return
    }
    const prev = untrack(() => view)
    if (prev.text === nextText) return
    const a = prev.text
    const b = nextText
    let head = 0
    while (head < a.length && head < b.length && a[head] === b[head]) head++
    let tail = 0
    while (tail < a.length - head && tail < b.length - head && a[a.length - 1 - tail] === b[b.length - 1 - tail]) tail++
    // Digits can change one at a time; words can't. Snap a wordy change out to
    // whole words.
    const numeric = /^[\d.,$€£%+\-−\s]*$/.test(a.slice(head, a.length - tail) + b.slice(head, b.length - tail))
    if (!numeric) {
      const space = (c: string | undefined) => c === undefined || /\s/.test(c)
      while (head > 0 && !space(b[head - 1]) && !space(b[head])) head--
      while (tail > 0 && !space(b[b.length - tail - 1]) && !space(b[b.length - tail])) tail--
    }
    const key = prev.key + 1
    // Capture the rendered width before repartitioning head/middle/tail.
    // During interruption this is between endpoints, not the old target.
    fromWidth = rootWidth()
    view = { text: b, head, tail, old: a.slice(head, a.length - tail), key, numeric }
    const id = setTimeout(() => {
      if (view.key === key) view = { ...view, old: '' }
    }, 700)
    return () => clearTimeout(id)
  })

  // While the old and new text swap, the box starts at the old text's width,
  // opens to the wider of the two so neither runs into what follows, then
  // settles to the new width. Set on the element directly so the starting
  // width never animates from a stale value.
  $effect(() => {
    const el = mid
    const key = view.key
    const isReduced = reduced
    const liveText = isReduced ? textValue : undefined
    void liveText
    const live = el?.querySelector<HTMLElement>('[data-live]')
    const out = el?.querySelector<HTMLElement>('[data-out]')
    if (!el || !live) return
    const width = (node: HTMLElement) => parseFloat(getComputedStyle(node).width) || 0
    const next = width(live)
    if (isReduced || key === 0) {
      el.style.transition = 'none'
      el.style.width = `${next}px`
      fromWidth = null
      return
    }
    // Repartitioning moves unchanged text out of the grid. Subtract its new
    // width from the old rendered total so that move itself changes no room.
    const affixes = rootWidth() - width(el)
    const previous = fromWidth
    fromWidth = null
    const start = previous === null ? (out ? width(out) : 0) : Math.max(0, previous - affixes)
    el.style.transition = 'none'
    el.style.width = `${start}px`
    void el.offsetWidth
    el.style.transition = ''
    // A control's label: the box and the crossfade are one move, straight to
    // the new width, and the box clips the old label as it goes
    if (variant === 'fade') {
      el.style.width = `${next}px`
      return
    }
    const widest = Math.max(next, start, out ? width(out) : 0)
    el.style.width = `${widest}px`
    if (widest === next) return
    const id = setTimeout(() => (el.style.width = `${next}px`), 360)
    return () => clearTimeout(id)
  })

  const display = $derived(
    reduced ? { text: textValue, head: 0, tail: 0, old: '', key: 0, numeric: true } : view,
  )
  const now = $derived(display.text.slice(display.head, display.text.length - display.tail))
  // Characters for numbers, whole words (with their spaces) for text
  const units = $derived(display.numeric ? now.split('') : now.split(/(?<=\s)/))
</script>

<span bind:this={root} class={`ss-roll${className ? ` ${className}` : ''}${klass ? ` ${klass}` : ''}`} data-variant={variant} data-align={side} style={style} {...rest}>{#if typeof children !== 'string'}<span bind:this={probe} aria-hidden="true" style="position:absolute;width:0;height:0;overflow:hidden;visibility:hidden;white-space:pre;pointer-events:none">{@render children()}</span>{/if}{display.text.slice(0, display.head)}<span bind:this={mid} class="ss-roll__mid">{#if display.old}{#key display.key}<span class="ss-roll__item" data-out>{display.old}</span>{/key}{/if}{#key `n${display.key}`}<span class="ss-roll__item" data-live>{#if display.key > 0 && variant === 'fade'}<span class="ss-roll__char">{now}</span>{:else if display.key > 0}{#each units as c, i}<span class="ss-roll__char" style={`animation-delay:${110 + i * stagger}ms`}>{c}</span>{/each}{:else}{now}{/if}</span>{/key}</span>{display.text.slice(display.text.length - display.tail)}</span>
