<script module lang="ts">
  // Thread's context and geometry, shared with Bubble. The React kit used a
  // Ready context plus React.Children/cloneElement to assign tails; Svelte
  // needs a registry, so each Bubble registers itself and Thread derives the
  // last bubble in each run from the rendered order.

  export interface BubbleEntry {
    /** The Bubble's own row element, for document-order sorting. */
    row: () => HTMLElement | null
    from: () => 'me' | 'them'
    /** True when the caller passed `tail`, which always wins over the run. */
    explicit: () => boolean
    setTail: (tail: boolean) => void
  }

  export interface ThreadContext {
    /** False during the first render; true once its bubbles have mounted. */
    readonly ready: boolean
    register(entry: BubbleEntry): () => void
  }

  export const THREAD_KEY = 'stageshow.thread'

  // offsetTop rounds to whole pixels. Keep fractional positions through the
  // FLIP, including inside a scaled Phone, or a row steps before its glide
  // starts.
  export function threadTops(root: HTMLElement) {
    const style = getComputedStyle(root)
    const extra =
      style.boxSizing === 'border-box'
        ? 0
        : [style.paddingLeft, style.paddingRight, style.borderLeftWidth, style.borderRightWidth].reduce(
            (sum, value) => sum + (parseFloat(value) || 0),
            0,
          )
    const width = parseFloat(style.width) + extra
    const scale = (width && root.getBoundingClientRect().width / width) || 1
    const parents = new Map<Element, number>()
    return new Map(
      Array.from(root.children, (el) => {
        const parent = (el as HTMLElement).offsetParent
        if (parent && !parents.has(parent)) parents.set(parent, parent.getBoundingClientRect().top)
        return [el, (el.getBoundingClientRect().top - (parent ? parents.get(parent)! : 0)) / scale]
      }),
    )
  }
</script>

<script lang="ts">
  import { onMount, setContext } from 'svelte'
  import type { Snippet } from 'svelte'
  import type { HTMLAttributes } from 'svelte/elements'

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'class'> {
    /**
     * imessage: blue and gray bubbles with tails (sms for green). chat: the
     * AI-app look, a quiet gray bubble for the person and plain text for the reply.
     */
    app?: 'imessage' | 'sms' | 'chat'
    className?: string
    /** Svelte's own class attribute; merged after className. */
    class?: string
    style?: string
    children?: Snippet
  }

  let {
    app = 'imessage',
    className = '',
    class: klass = '',
    style = '',
    children,
    ...rest
  }: Props = $props()

  let root = $state<HTMLDivElement | null>(null)
  let ready = $state(false)
  // Bumping this asks the tail pass to run again after a Bubble mounts or
  // leaves. The registry itself is plain, so registration never mutates state
  // during another component's render.
  let version = $state(0)
  const entries: BubbleEntry[] = []

  const context: ThreadContext = {
    get ready() {
      return ready
    },
    register(entry) {
      entries.push(entry)
      version++
      return () => {
        const i = entries.indexOf(entry)
        if (i !== -1) entries.splice(i, 1)
        version++
      }
    },
  }
  setContext(THREAD_KEY, context)

  // Bubbles present on the first render are the opening picture and don't
  // rise in; only later arrivals do. Children mount before this runs.
  onMount(() => {
    ready = true
  })

  // A tail closes each run: the last bubble before the sender changes. The
  // registry is sorted into document order so insertions in the middle of a
  // thread still leave the right bubble with the tail.
  $effect(() => {
    void version
    const rootEl = root
    if (!rootEl) return
    const list = entries
      .filter((entry) => entry.row())
      .sort((a, b) => {
        const ea = a.row()!
        const eb = b.row()!
        if (ea === eb) return 0
        return ea.compareDocumentPosition(eb) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1
      })
    list.forEach((entry, i) => {
      if (entry.explicit()) return
      const next = list[i + 1]
      entry.setTail(!next || next.from() !== entry.from())
    })
  })

  // Glide: every message that moved since the last DOM change starts where it
  // was and eases to where it is (FLIP), so an arrival pushes the rest up.
  // React re-ran this on every render; a MutationObserver is the Svelte
  // equivalent — the thread's DOM is what changes when a message arrives.
  let tops = new Map<Element, number>()
  $effect(() => {
    const el = root
    if (!el) return
    tops = threadTops(el)
    let frame = 0
    const glide = () => {
      const next = threadTops(el)
      for (const [node, top] of Array.from(next)) {
        const row = node as HTMLElement
        const was = tops.get(row)
        if (was === undefined || Math.abs(was - top) < 0.001) continue
        // Start from where it is on screen: a glide still under way continues
        // from its current offset instead of jumping back.
        const now = parseFloat(getComputedStyle(row).top) || 0
        row.style.transition = 'none'
        row.style.top = `${was + now - top}px`
        void row.offsetWidth
        row.style.transition = ''
        row.style.top = ''
      }
      tops = next
    }
    // One glide per frame: a message arriving can add several nodes and text
    // runs in one update, and measuring between them would start the same
    // glide twice.
    const schedule = () => {
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        glide()
      })
    }
    // Text that loads after mount moves the rows without a DOM change; take a
    // fresh settled position so the next arrival glides from where they are.
    let live = true
    const settle = () => {
      if (!live) return
      if (Array.from(el.children).some((child) => (child as HTMLElement).style.top)) return
      tops = threadTops(el)
    }
    document.fonts?.ready.then(settle)
    const mo = new MutationObserver(schedule)
    mo.observe(el, { childList: true, subtree: true, characterData: true })
    return () => {
      live = false
      mo.disconnect()
      if (frame) cancelAnimationFrame(frame)
    }
  })
</script>

<div
  {...rest}
  bind:this={root}
  class={`ss-thread${className ? ` ${className}` : ''}${klass ? ` ${klass}` : ''}`}
  data-app={app}
  style={style || undefined}
>
  {#if children}{@render children()}{/if}
</div>
