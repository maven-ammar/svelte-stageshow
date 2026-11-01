<script lang="ts">
  import { getContext, onDestroy, onMount, untrack } from 'svelte'
  import type { Snippet } from 'svelte'
  import type { HTMLAttributes } from 'svelte/elements'
  import { getLook } from './look.js'
  import { prefersReducedMotion, reducedMotion } from './reduced-motion.js'
  import { THREAD_KEY, type ThreadContext } from './Thread.svelte'

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'class' | 'children'> {
    /** me sits on the right in the accent bubble; them on the left. */
    from: 'me' | 'them'
    /** Three bouncing dots in place of the text. Turning it off grows the bubble into the message. */
    typing?: boolean
    /** Set by Thread: true on the last bubble of a run. */
    tail?: boolean
    /**
     * Where the message comes from, as iMessage sends: a target name (or a
     * CSS selector) for the composer's text. The bubble forms out of it, the
     * words lifting from the field into place while the bubble fills in around
     * them. Clear the field in the same update that adds the bubble.
     */
    source?: string
    /**
     * A tapback on this bubble: the emoji, and `show` to pop it in and out.
     * It sits in a white circle on the bubble's bottom corner, and the bubble
     * makes room below so the emoji never covers the words.
     */
    tapback?: { emoji: Snippet | string; show?: boolean }
    /** A small `Avatar` beside a received bubble, as a group chat shows who is speaking. */
    avatar?: Snippet
    className?: string
    /** Svelte's own class attribute; merged after className. */
    class?: string
    style?: string
    /** Text, or a snippet for rich content. A string can also be passed to `children` directly. */
    children?: Snippet | string
  }

  let {
    avatar,
    from,
    typing = false,
    tail,
    source,
    tapback,
    className = '',
    class: klass = '',
    style = '',
    children,
    ...rest
  }: Props = $props()

  const { fidelity } = getLook()
  const thread = getContext<ThreadContext | undefined>(THREAD_KEY)
  // Bubbles in the thread on its first render are the opening picture and
  // don't animate; only later arrivals rise in.
  const arrived = thread ? thread.ready : true

  let rowEl = $state<HTMLDivElement | null>(null)
  let bubbleEl = $state<HTMLDivElement | null>(null)
  let autoTail = $state<boolean | undefined>(undefined)
  const effectiveTail = $derived(tail !== undefined ? tail : autoTail)

  onMount(() => {
    if (!thread) return
    return thread.register({
      row: () => rowEl,
      from: () => from,
      explicit: () => tail !== undefined,
      setTail: (value) => {
        autoTail = value
      },
    })
  })

  // Whether this bubble grew out of the typing dots (its words fade in as it
  // grows). The flag latches on, as the React ref did.
  let lastTyping = $state(untrack(() => typing))
  let grew = $state(false)
  $effect.pre(() => {
    if (lastTyping && !typing) grew = true
    lastTyping = typing
  })

  // Morph: measure the bubble before and after the content changes, then ease
  // its box from the old size to the new.
  let size: { w: number; h: number } | null = null
  let animating = false
  let morphTimer: ReturnType<typeof setTimeout> | null = null

  function measure(node: HTMLElement) {
    const measured = getComputedStyle(node)
    return { w: parseFloat(measured.width), h: parseFloat(measured.height) }
  }

  function morph() {
    const el = bubbleEl
    if (!el || animating) return
    const was = size
    el.style.width = ''
    el.style.height = ''
    // Resolved CSS dimensions retain the fractions offsetWidth/Height round
    // away, so releasing the measured box doesn't resize it at the endpoint.
    const now = measure(el)
    size = now
    if (!was || (was.w === now.w && was.h === now.h)) return
    if (reducedMotion(el)) return
    animating = true
    // The words keep their final line breaks while the box grows around them
    const text = el.querySelector<HTMLElement>('.ss-bubble__text')
    if (text) text.style.width = getComputedStyle(text).width
    el.style.transition = 'none'
    el.style.width = `${was.w}px`
    el.style.height = `${was.h}px`
    void el.offsetWidth
    el.style.transition = ''
    el.style.width = `${now.w}px`
    el.style.height = `${now.h}px`
    const end = () => {
      if (morphTimer) {
        clearTimeout(morphTimer)
        morphTimer = null
      }
      el.removeEventListener('transitionend', end)
      el.style.width = ''
      el.style.height = ''
      if (text) text.style.width = ''
      animating = false
      size = measure(el)
    }
    el.addEventListener('transitionend', end, { once: true })
    // Reduced motion or a stage still can remove the transition entirely, so a
    // timer releases the measured box even if transitionend never arrives.
    morphTimer = setTimeout(end, 600)
  }

  $effect(() => {
    void typing
    void children
    morph()
  })

  $effect(() => {
    const el = bubbleEl
    if (!el) return
    size = measure(el)
    const ro = new ResizeObserver(() => morph())
    ro.observe(el)
    return () => ro.disconnect()
  })

  onDestroy(() => {
    if (morphTimer) clearTimeout(morphTimer)
  })

  // Form out of the composer: start where the field's words were, in the
  // field's color with no fill, and travel into place as the fill comes in.
  $effect(() => {
    const el = bubbleEl
    if (!el || !arrived || !source) return
    const stage = el.closest('.ss-stage') ?? document
    const src =
      stage.querySelector<HTMLElement>(`[data-target="${source}"]`) ?? stage.querySelector<HTMLElement>(source)
    const text = el.querySelector<HTMLElement>('.ss-bubble__text')
    if (!src || !text) return
    if (prefersReducedMotion() || el.closest('[data-still]')) return
    // Measure where it rests, not where an earlier run already moved it
    el.style.transition = 'none'
    el.style.left = el.style.top = '0px'
    const k = el.getBoundingClientRect().width / el.offsetWidth || 1
    const o = src.getBoundingClientRect()
    const t = text.getBoundingClientRect()
    const dx = (o.left - t.left) / k
    const dy = (o.top + o.height / 2 - (t.top + t.height / 2)) / k
    const ease = 'cubic-bezier(0.22, 1, 0.36, 1)'
    // Travels by left and top, so the words land without a sub-pixel hop
    el.style.transition = 'none'
    el.style.left = `${dx}px`
    el.style.top = `${dy}px`
    el.setAttribute('data-flying', '')
    el.style.color = getComputedStyle(src).color
    void el.offsetWidth
    el.style.transition = `left 0.5s ${ease}, top 0.5s ${ease}, color 0.3s ease 0.06s`
    el.style.left = el.style.top = ''
    el.removeAttribute('data-flying')
    el.style.color = ''
    const end = (e: TransitionEvent) => {
      if (e.target !== el || e.propertyName !== 'top') return
      el.style.transition = ''
      el.removeEventListener('transitionend', end)
    }
    el.addEventListener('transitionend', end)
    return () => el.removeEventListener('transitionend', end)
  })

  const isBar = $derived(fidelity === 'minimal' && typeof children === 'string')
  const barWidth = $derived(typeof children === 'string' ? Math.min(180, children.length * 5.5) : 0)
</script>

<div
  class={`ss-bubble-row${className ? ` ${className}` : ''}${klass ? ` ${klass}` : ''}`}
  data-from={from}
  data-avatar={avatar ? '' : undefined}
  style={style || undefined}
  bind:this={rowEl}
>
  {#if avatar && from !== 'me'}
    <span class="ss-bubble__avatar" aria-hidden="true">{@render avatar()}</span>
  {/if}
  <div
    {...rest}
    bind:this={bubbleEl}
    class="ss-bubble"
    data-arrived={arrived || undefined}
    data-source={source ? '' : undefined}
    data-tail={effectiveTail || undefined}
    data-typing={typing || undefined}
    data-grew={grew || undefined}
    data-tapback={tapback && tapback.show !== false ? '' : undefined}
  >
    {#if tapback}
      <span class="ss-tapback" data-show={tapback.show !== false || undefined} aria-hidden="true">
        <span class="ss-tapback__emoji">
          {#if typeof tapback.emoji === 'string'}{tapback.emoji}{:else}{@render tapback.emoji()}{/if}
        </span>
      </span>
    {/if}
    {#if typing}
      <span class="ss-bubble__dots" aria-label="typing">
        <i></i>
        <i></i>
        <i></i>
      </span>
    {:else}
      <span class="ss-bubble__text">
        {#if isBar}
          <span class="ss-bar ss-bubble__bar" style={`width:${barWidth}px`}></span>
        {:else if typeof children === 'string'}
          {children}
        {:else if children}
          {@render children()}
        {/if}
      </span>
    {/if}
    <!-- Always drawn, so a tail grows out of the corner when its bubble
         becomes the last of a run, and retracts when it stops being. -->
    <svg class="ss-bubble__tail" viewBox="0 0 18 16" aria-hidden="true">
      <path
        d={from === 'me'
          ? 'M0 0H12V8.5C12 12.6 14 15 17.5 16C15 16.7 12.2 16.5 9.8 15.3L0 15Z'
          : 'M18 0H6V8.5C6 12.6 4 15 0.5 16C3 16.7 5.8 16.5 8.2 15.3L18 15Z'}
      />
    </svg>
  </div>
</div>
