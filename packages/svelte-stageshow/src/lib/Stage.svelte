<script lang="ts" generics="S extends object">
  import type { Snippet } from 'svelte'
  import { tick, untrack } from 'svelte'
  import Cursor from './Cursor.svelte'
  import { createAct, Stopped } from './act.js'
  import { realClock, VirtualClock, type Clock } from './clock.js'
  import { setLook, type Fidelity, type Layout, type Palette, type Theme } from './look.js'
  import { EMPTY, layoutRectOf, nameOf, rectOf, sameRects, stageSpace, targetRectOf, type Point, type Rect, type Target } from './measure.js'
  import type { CompactConfig, CursorConfig, CursorKind, Ground, KeysAt, LookTokens, Play, Script } from './types.js'
  import { warn } from './util.js'

  interface Props {
    /** Design size. The stage scales down to fit its container, and only grows past it with `fill`. */
    width: number
    height: number
    /** Scene state at the start of each loop. Statics can leave it out. */
    initial?: S
    /** Loops while on screen. Leave out for a static illustration. */
    script?: Script<S>
    /** The still frame shown under reduced motion or with no script. Defaults to initial. */
    poster?: S
    cursor?: CursorConfig
    play?: Play
    /** A second, smaller design for narrow containers. */
    compact?: CompactConfig
    /** Where keycaps from act.key appear. */
    keys?: KeysAt | { wide: KeysAt; compact: KeysAt }
    /** Targets shown hovered in a still. */
    hover?: string[]
    theme?: Theme
    palette?: Palette
    fidelity?: Fidelity
    /** `cool` swaps the warm canvas and well for cool ones. Light theme only. */
    greys?: 'warm' | 'cool'
    /** A look as values: any `--ss-*` tokens. */
    tokens?: LookTokens
    /** Grow past the design size to fill the container (up to 2x). */
    fill?: boolean
    /** The accent color for this stage. */
    accent?: string
    /** What the scene sits on. `orbs` is a pale tile lit by soft color orbs. */
    ground?: Ground
    /** Plays the script faster (above 1) or slower (below 1). */
    speed?: number
    className?: string
    /** Svelte's own class attribute; merged after className. */
    class?: string
    specimen?: boolean
    unframed?: boolean
    /**
     * Run the script only through runFrames(): CSS transitions are off and a
     * virtual 60fps clock drives every wait, tween and type. The same script
     * and frame index then render the same DOM, for the determinism test.
     */
    deterministic?: boolean
    children: Snippet<[S, (name: string) => Rect, Layout]>
  }

  let {
    width,
    height,
    initial,
    script,
    poster,
    cursor,
    play: playProp = 'loop',
    compact,
    keys: keysAt = 'bottom',
    hover,
    theme: themeProp = 'light',
    palette = 'accent',
    fidelity = 'standard',
    greys,
    tokens,
    fill: fillProp = false,
    accent,
    ground,
    speed: speedProp = 1,
    className = '',
    class: klass = '',
    specimen = false,
    unframed = false,
    deterministic = false,
    children,
  }: Props = $props()

  let reduced = $state(false)
  let hoverNone = $state(false)

  $effect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const hoverMedia = window.matchMedia('(hover: none)')
    reduced = motion.matches
    hoverNone = hoverMedia.matches
    const onMotion = () => (reduced = motion.matches)
    const onHover = () => (hoverNone = hoverMedia.matches)
    motion.addEventListener('change', onMotion)
    hoverMedia.addEventListener('change', onHover)
    return () => {
      motion.removeEventListener('change', onMotion)
      hoverMedia.removeEventListener('change', onHover)
    }
  })

  const still = $derived(!script || reduced)
  const play: Play = $derived(playProp === 'hover' && hoverNone ? 'once' : playProp)

  let scene = $state<S>(untrack(() => (initial ?? {}) as S))
  const display = $derived<S>((still && !deterministic ? (poster ?? initial ?? {}) : scene) as S)

  const film =
    typeof window === 'undefined'
      ? ({} as { slow?: number; theme?: Theme })
      : ((window as unknown as { __stageshow?: { slow?: number; theme?: Theme } }).__stageshow ?? {})
  const speed = $derived(speedProp / (film.slow ?? 1))
  const theme: Theme = $derived(film.theme ?? themeProp)

  let layout = $state<Layout>('wide')
  let grows = $state(false)
  let scale = $state(1)
  let inset = $state(0)
  const designW = $derived(layout === 'compact' && compact ? compact.width : width)
  const designH = $derived(layout === 'compact' && compact ? compact.height : height)

  let fitEl = $state<HTMLDivElement | null>(null)
  let stageEl = $state<HTMLDivElement | null>(null)

  $effect(() => {
    const fit = fitEl
    if (!fit) return
    const measure = () => {
      const w = fit.clientWidth
      const wide = !!fit.parentElement?.closest('[data-ss-wide]')
      const next: Layout = compact && !wide && w < compact.below ? 'compact' : 'wide'
      layout = next
      const grow = fillProp || !!fit.parentElement?.closest('[data-ss-fill]')
      grows = grow
      const dw = next === 'compact' && compact ? compact.width : width
      const s = Math.min(grow ? 2 : 1, w / dw)
      scale = s
      inset = Math.max(0, (w - dw * s) / 2)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(fit)
    const hosts = new MutationObserver(measure)
    for (let host = fit.parentElement; host; host = host.parentElement) {
      hosts.observe(host, { attributes: true, attributeFilter: ['data-ss-wide', 'data-ss-fill'] })
    }
    return () => {
      ro.disconnect()
      hosts.disconnect()
    }
  })

  let rects = $state<Record<string, Rect>>({})
  let rectsCache: Record<string, Rect> = {}
  const passes = { n: 0, frame: 0, owed: false }

  function measureAll() {
    const root = stageEl
    if (!root) return {}
    const out: Record<string, Rect> = {}
    const targets = root.querySelectorAll<HTMLElement>('[data-target]')
    if (!targets.length) return out
    const space = stageSpace(root, scale)
    targets.forEach((el) => {
      out[el.dataset.target!] = targetRectOf(root, el, scale, space)
    })
    return out
  }

  function publish(next: Record<string, Rect>) {
    if (sameRects(rectsCache, next)) return
    rectsCache = next
    rects = next
  }

  function remeasure() {
    const p = passes
    if (!p.frame)
      p.frame = requestAnimationFrame(() => {
        p.n = 0
        p.frame = 0
        if (!p.owed) return
        p.owed = false
        publish(measureAll())
      })
    if (p.n >= 4) {
      p.owed = true
      return
    }
    p.n++
    publish(measureAll())
  }

  $effect(() => {
    void display
    void layout
    remeasure()
  })

  $effect(() => {
    const root = stageEl
    if (!root) return
    const on = () => remeasure()
    root.addEventListener('transitionend', on)
    root.addEventListener('animationend', on)
    return () => {
      root.removeEventListener('transitionend', on)
      root.removeEventListener('animationend', on)
    }
  })

  $effect(() => () => {
    cancelAnimationFrame(passes.frame)
    passes.n = 0
    passes.frame = 0
    passes.owed = false
  })

  let settling = $state(true)
  $effect(() => {
    void layout
    settling = true
    let live = true
    const release = async () => {
      if (document.fonts && document.fonts.status !== 'loaded') await document.fonts.ready
      if (!live) return
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (live) settling = false
        })
      })
    }
    void release()
    return () => {
      live = false
    }
  })

  const rectFor = (name: string) => rects[name] ?? EMPTY

  let cursorAt = $state<Point>({ x: 0, y: 0 })
  let cursorKind = $state<CursorKind>(untrack(() => cursor?.kind ?? 'pointer'))
  let cursorPressed = $state(false)
  let cursorTouching = $state(false)
  let hoveredEl = $state<Element | null>(null)

  function resolve(t: Target): Point {
    let target: Target = t
    if (typeof target === 'object' && target !== null && 'wide' in target) target = layout === 'compact' ? target.compact : target.wide
    const name = nameOf(target)
    if (name === null) return target as Point
    const root = stageEl
    const el = root?.querySelector<HTMLElement>(`[data-target="${name}"]`)
    if (!root || !el) {
      warn(`no element with data-target="${name}"`)
      return cursorAt
    }
    const r = rectOf(root, el, scale)
    const f = typeof target === 'string' ? { x: 0.5, y: 0.5 } : (target as { x: number; y: number })
    return { x: r.x + r.width * f.x, y: r.y + r.height * f.y }
  }

  function restAt(): Target {
    if (!cursor) return { x: 0, y: 0 }
    const at = cursor.at
    return typeof at === 'object' && at !== null && 'wide' in at ? (layout === 'compact' ? at.compact : at.wide) : at
  }

  function chain(el: Element | null) {
    const out: Element[] = []
    for (let n = el; n && n !== stageEl; n = n.parentElement) if (n.hasAttribute('data-target')) out.push(n)
    return out
  }

  function setHover(el: Element | null) {
    if (hoveredEl === el) return
    const next = chain(el)
    chain(hoveredEl).forEach((n) => {
      if (!next.includes(n)) n.removeAttribute('data-hover')
    })
    next.forEach((n) => n.setAttribute('data-hover', ''))
    hoveredEl = el
  }

  function targetEl(t: Target) {
    const name = nameOf(t)
    return name === null ? null : (stageEl?.querySelector(`[data-target="${name}"]`) ?? null)
  }

  function rectAt(name: string, opts?: { layout?: boolean }) {
    const root = stageEl
    const el = root?.querySelector<HTMLElement>(`[data-target="${name}"]`)
    if (!root || !el) {
      warn(`no element with data-target="${name}"`)
      return EMPTY
    }
    return opts?.layout ? layoutRectOf(root, el) : rectOf(root, el, scale)
  }

  function flashInstant(on: boolean) {
    if (!stageEl) return
    if (on) stageEl.setAttribute('data-instant', '')
    else stageEl.removeAttribute('data-instant')
  }

  const flush = async () => {
    await tick()
    await Promise.resolve()
    await tick()
  }

  function makeAct(clock: Clock, signal: AbortSignal) {
    return createAct<S>(signal, {
      clock,
      speed,
      layout,
      cursor,
      stage: () => stageEl,
      getPoint: () => cursorAt,
      getHovered: () => hoveredEl,
      getKind: () => cursorKind,
      resolve,
      place: (p) => (cursorAt = p),
      setScene: (fn) => (scene = fn(scene)),
      setKind: (k) => (cursorKind = k),
      setHover,
      setPressed: (v) => (cursorPressed = v),
      setTouching: (v) => (cursorTouching = v),
      targetEl,
      rect: rectAt,
      flashInstant,
      remeasure,
      flush,
    })
  }

  async function resetScene() {
    scene = (initial ?? {}) as S
    cursorKind = cursor?.kind ?? 'pointer'
    cursorPressed = false
    cursorTouching = false
    setHover(null)
    const root = stageEl
    root?.querySelectorAll('[data-hover],[data-pressed]').forEach((el) => {
      el.removeAttribute('data-hover')
      el.removeAttribute('data-pressed')
    })
    root?.removeAttribute('data-mark')
    root?.removeAttribute('data-instant')
    await flush()
    if (cursor) cursorAt = resolve(restAt())
  }

  /**
   * Run the stage's script on a virtual 60fps clock and return a hash of the
   * rendered stage for each frame, frame 0 through `count`. Called by the
   * determinism test; CSS transitions are off, so a frame is a settled state.
   */
  export async function runFrames(count = 240): Promise<string[]> {
    if (!script) throw new Error('Stage has no script to step')
    if (document.fonts) await document.fonts.ready
    while (settling) await new Promise((resolve) => requestAnimationFrame(resolve))
    const clock = new VirtualClock()
    const ctrl = new AbortController()
    await resetScene()
    await flush()
    const act = makeAct(clock, ctrl.signal)
    const run = script(act).catch((error) => {
      if (!(error instanceof Stopped)) console.error('[stageshow] deterministic script error', error)
    })
    const hashes: string[] = []
    for (let f = 0; f <= count; f++) {
      await flush()
      hashes.push(await hashStage())
      if (f === count) break
      clock.advanceFrame()
      await flush()
    }
    ctrl.abort()
    await run.catch(() => {})
    return hashes
  }

  // Attribute order is not a rendered property: Svelte may add a dynamic
  // attribute before or after the static ones depending on whether this is
  // the first render or an update. Sort attributes on a clone so two equal
  // frames hash equal, while every tag, attribute, value, text node and
  // comment still takes part.
  function canonicalHtml(el: Element): string {
    const clone = el.cloneNode(true) as Element
    for (const node of [clone, ...clone.querySelectorAll('*')]) {
      const attrs = [...node.attributes].sort((a, b) => a.name.localeCompare(b.name))
      for (const attr of attrs) node.removeAttribute(attr.name)
      for (const attr of attrs) node.setAttribute(attr.name, attr.value)
    }
    return clone.outerHTML
  }

  async function hashStage() {
    const el = stageEl
    if (!el) return ''
    const bytes = new TextEncoder().encode(canonicalHtml(el))
    const digest = await crypto.subtle.digest('SHA-256', bytes)
    return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
  }

  $effect(() => {
    if (!script || deterministic) return
    const root = stageEl
    if (!root) return
    if (still) {
      void resetScene()
      return
    }
    let ctrl: AbortController | null = null
    let done = false
    let hovering = false
    let onScreen = false

    const start = () => {
      if (ctrl || done || !onScreen || document.hidden) return
      if (play === 'hover' && !hovering) return
      void resetScene().then(() => {
        if (!onScreen || document.hidden) return
        ctrl = new AbortController()
        const signal = ctrl.signal
        const act = makeAct(realClock, signal)
        void (async () => {
          do {
            await resetScene()
            try {
              await script(act)
            } catch (error) {
              if (error instanceof Stopped) return
              console.error('[stageshow] script error', error)
              ctrl = null
              return
            }
          } while (play === 'loop' && !signal.aborted)
          if (play === 'once' && !signal.aborted) done = true
        })()
      })
    }
    const stop = () => {
      ctrl?.abort()
      ctrl = null
      if (!done) void resetScene()
    }
    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting
      onScreen ? start() : stop()
    })
    io.observe(root)
    const onVisibility = () => {
      document.hidden ? stop() : start()
    }
    document.addEventListener('visibilitychange', onVisibility)
    const enter = () => {
      hovering = true
      start()
    }
    const leave = () => {
      hovering = false
      stop()
    }
    if (play === 'hover') {
      root.addEventListener('pointerenter', enter)
      root.addEventListener('pointerleave', leave)
    }
    return () => {
      io.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      root.removeEventListener('pointerenter', enter)
      root.removeEventListener('pointerleave', leave)
      ctrl?.abort()
      ctrl = null
    }
  })

  $effect(() => {
    if (!cursor) return
    void display
    void rects
    void layout
    void scale
    if (script && !still && !deterministic) return
    if (script && deterministic) return
    cursorAt = resolve(restAt())
    cursorKind = cursor.kind ?? 'pointer'
  })

  $effect(() => {
    void display
    const root = stageEl
    if (!root || !still || !hover) return
    const els = hover.map((name) => root.querySelector<HTMLElement>(`[data-target="${name}"]`))
    els.forEach((el) => el?.setAttribute('data-hover', ''))
    return () => els.forEach((el) => el?.removeAttribute('data-hover'))
  })

  const tokenStyle = $derived(Object.entries(tokens ?? {}).map(([key, value]) => `${key}:${value}`).join(';'))
  const accentStyle = $derived(
    accent ? `--ss-accent:${accent};--ss-accent-2:${accent};--ss-accent-soft:color-mix(in srgb, ${accent} 14%, transparent)` : '',
  )
  const stageStyle = $derived(
    [`width:${designW}px`, `height:${designH}px`, inset ? `margin-left:${inset}px` : '', `transform:scale(${scale})`, tokenStyle, accentStyle]
      .filter(Boolean)
      .join(';'),
  )
  const fitStyle = $derived(`max-width:${grows ? 'none' : `${width}px`};height:${designH * scale}px`)
  const groundStyle = $derived(
    Array.isArray(ground) ? `--ss-orb-1:${ground[0]};--ss-orb-2:${ground[1]};${ground[2] ? `--ss-orb-3:${ground[2]};` : ''}` : '',
  )

  const showCursor = $derived(!!cursor && (!script || !still || !!cursor.still || deterministic))

  const look = {
    get theme() {
      return theme
    },
    get palette() {
      return palette
    },
    get fidelity() {
      return fidelity
    },
    get layout() {
      return layout
    },
  }
  setLook(look)

  // Keycaps are not ported yet; `keys` stays in the public API so adding them
  // later is not a breaking change.
</script>

<div bind:this={fitEl} class={`ss-fit${className ? ` ${className}` : ''}${klass ? ` ${klass}` : ''}`} style={fitStyle}>
  <div
    bind:this={stageEl}
    class="ss-stage"
    data-specimen={specimen || undefined}
    data-unframed={unframed || undefined}
    data-still={still || deterministic || undefined}
    data-placing={settling || undefined}
    data-theme={theme}
    data-palette={palette}
    data-greys={greys === 'cool' ? 'cool' : undefined}
    data-fidelity={fidelity}
    data-layout={layout}
    style={stageStyle}
  >
    {#if ground}
      <div class="ss-ground" aria-hidden="true" style={groundStyle}></div>
    {/if}
    {#if children}{@render children(display, rectFor, layout)}{/if}
    {#if showCursor && cursor}
      <Cursor x={cursorAt.x} y={cursorAt.y} kind={cursorKind} style={cursor.style} pressed={cursorPressed} touching={cursorTouching} />
    {/if}
  </div>
</div>
