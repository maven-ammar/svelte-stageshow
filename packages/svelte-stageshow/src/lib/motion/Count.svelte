<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import { untrack } from 'svelte'
  import { inStillStage, onReducedMotionChange, prefersReducedMotion } from '../reduced-motion.js'

  interface Props extends Omit<HTMLAttributes<HTMLSpanElement>, 'class' | 'children'> {
    value: number
    /** How a number is written, e.g. n => `$${n.toFixed(2)}` */
    format?: (n: number) => string
    /** ms for a digit to roll from the old figure to the new one. */
    duration?: number
    /** ms between one digit starting and the next, from the right. */
    stagger?: number
    className?: string
    /** Svelte's own class attribute; merged after className. */
    class?: string
    style?: string
  }

  let {
    value,
    format = (n) => Math.round(n).toLocaleString('en-US'),
    duration = 700,
    stagger = 45,
    className = '',
    class: klass = '',
    style = '',
    ...rest
  }: Props = $props()

  // Three decades of figures, so a digit can roll on past 9 into 0 (or back
  // past 0 into 9) without ever running off the end of the strip
  const STRIP = '012345678901234567890123456789'.split('')
  const MIDDLE = 10

  // A unit after the figure ("21°", "240ms", "40%", "12 min"): the run of
  // letters or signs that ends the text, after its last digit. It gets a box of
  // its own, a hair from the digits (a word space when the format writes one),
  // so the pair reads as one figure without the unit sitting on the last digit
  const unitOf = (text: string) => {
    const m = /^(.*\d)(\s*)([^\d\s.,]+)$/.exec(text)
    return m ? { head: m[1], space: m[2].length > 0, unit: m[3] } : { head: text, space: false, unit: '' }
  }

  const digitsFromRight = (text: string) => {
    const out: number[] = []
    for (let i = text.length - 1; i >= 0; i--) {
      const c = text[i]
      if (c >= '0' && c <= '9') out.push(Number(c))
    }
    return out
  }

  let reduced = $state(prefersReducedMotion())
  let el = $state<HTMLSpanElement | null>(null)

  const text = $derived(format(value))
  const split = $derived(unitOf(text))
  const chars = $derived(split.head.split(''))
  const digits = $derived(digitsFromRight(text))

  // Where each column's strip sits, by column from the right. Starts in the
  // middle decade; a change moves it by the shortest turn in the value's
  // direction, and it is put back in the middle once the roll has settled
  let idx = $state<number[]>(untrack(() => digits).map((d) => MIDDLE + d))
  let shown = untrack(() => ({ text, value, idx }))
  let homing = false

  const parts = $derived.by(() => {
    // Columns are keyed from the right, so a total that gains a digit keeps the
    // digits it already had rolling in place and only the new leading one appears
    let fromRight = digits.length
    return chars.map((c, i) => {
      if (c < '0' || c > '9') return { kind: 'char' as const, text: c, key: `s${i}-${c}` }
      const column = --fromRight
      return { kind: 'digit' as const, digit: Number(c), column, key: `d${column}` }
    })
  })

  $effect(() => {
    reduced = prefersReducedMotion()
    return onReducedMotionChange(() => (reduced = prefersReducedMotion()))
  })

  $effect(() => {
    const node = el
    const nextText = text
    const nextValue = value
    const ms = duration
    const isReduced = reduced
    if (!node) return
    const prev = shown
    if (prev.text === nextText) return
    const instant =
      isReduced || ms <= 0 || !!node.closest('[data-instant], [data-offscreen]') || inStillStage(node)
    const before = digitsFromRight(prev.text)
    const up = nextValue >= prev.value
    const next = digits.map((d, c) => {
      const was = before[c]
      const at = prev.idx[c]
      if (was === undefined || at === undefined || instant) return MIDDLE + d
      if (was === d) return at
      return up ? at + ((d - was + 10) % 10) : at - ((was - d + 10) % 10)
    })
    node.toggleAttribute('data-snap', instant)
    if (!instant) {
      // Settle the old transforms in the browser first, so the new ones transition
      for (const strip of Array.from(node.querySelectorAll<HTMLElement>('.ss-count__strip'))) void getComputedStyle(strip).transform
      node.setAttribute('data-rolling', '')
    }
    shown = { text: nextText, value: nextValue, idx: next }
    idx = next
  })

  // Once every digit has landed, put the strips back in the middle decade
  // without a transition, and drop the rolling mark a still waits on
  $effect(() => {
    const node = el
    const watched = idx
    void watched
    if (!node || !node.hasAttribute('data-rolling')) return
    const currentDigits = digits
    const ms = duration
    const step = stagger
    const id = window.setTimeout(() => {
      node.setAttribute('data-snap', '')
      homing = true
      const home = currentDigits.map((d) => MIDDLE + d)
      shown.idx = home
      idx = home
      node.removeAttribute('data-rolling')
    }, ms + step * currentDigits.length + 60)
    return () => window.clearTimeout(id)
  })

  // The snap comes off only after the home transforms are in the DOM (a
  // frame callback could run before Svelte commits them, and the strips
  // would then roll a whole decade back to the middle)
  $effect(() => {
    const node = el
    const watched = idx
    void watched
    if (!node || !homing) return
    homing = false
    for (const strip of Array.from(node.querySelectorAll<HTMLElement>('.ss-count__strip'))) void getComputedStyle(strip).transform
    node.removeAttribute('data-snap')
  })
</script>

<span {...rest} bind:this={el} class={`ss-count${className ? ` ${className}` : ''}${klass ? ` ${klass}` : ''}`} style={style} aria-label={text}>
  {#each parts as part (part.key)}
    {#if part.kind === 'char'}
      <span class="ss-count__char" aria-hidden="true">{part.text}</span>
    {:else}
      <span class="ss-count__digit" data-crop="true" aria-hidden="true">
        <span
          class="ss-count__strip"
          style={`transform:translateY(${-(idx[part.column] ?? MIDDLE + part.digit)}em);transition-duration:${duration}ms;transition-delay:${part.column * stagger}ms`}
        >
          {#each STRIP as n, k (k)}
            <span>{n}</span>
          {/each}
        </span>
      </span>
    {/if}
  {/each}
  {#if split.unit}
    <span class="ss-count__unit" data-space={split.space || undefined} aria-hidden="true">{split.unit}</span>
  {/if}
</span>
