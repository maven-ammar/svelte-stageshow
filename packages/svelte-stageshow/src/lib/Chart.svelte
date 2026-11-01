<script lang="ts">
  import { untrack } from 'svelte'
  import { onReducedMotionChange, prefersReducedMotion, reducedMotion } from './reduced-motion.js'
  import { chartPoints, DRAW_MS, ease, resample, smooth, yAt, type ChartProps } from './chart.js'

  interface Props extends ChartProps {}

  let {
    data,
    kind = 'line',
    width,
    height,
    show = true,
    area = true,
    dot = true,
    max,
    className = '',
    class: klass = '',
    style = '',
  }: Props = $props()

  let uid = $props.id()
  const id = uid.replace(/:/g, '')

  let reduced = $state(prefersReducedMotion())
  $effect(() => {
    reduced = prefersReducedMotion()
    return onReducedMotionChange(() => (reduced = prefersReducedMotion()))
  })

  let drawEl = $state<SVGGElement | null>(null)
  let wipeEl = $state<SVGRectElement | null>(null)
  let dotEl = $state<SVGCircleElement | null>(null)

  const top = $derived(max ?? Math.max(...data, 1))
  const pad = $derived(kind === 'line' && dot ? 4 : 1)
  const h = $derived(height - pad * 2)
  const gap = $derived(Math.max(2, Math.round(width / data.length / 4)))
  const bw = $derived(data.length ? (width - gap * (data.length - 1)) / data.length : 0)
  const pts = $derived(chartPoints({ data, kind, width, height, dot, max }))
  const curve = $derived(resample(pts))
  const line = $derived(smooth(curve))
  const fill = $derived(`${line}L${pts[pts.length - 1].x} ${height}L${pts[0].x} ${height}Z`)
  const end = $derived(pts[pts.length - 1])

  // Draw-in: the dot leads and the line follows it. One timeline moves the
  // wipe's edge and puts the dot on the curve at that edge, every frame.
  let shown = false
  $effect(() => {
    const was = shown
    const g = drawEl
    // The React effect re-ran when the data's *length* crossed one, not on
    // every value change: changing values morphs the path instead.
    const visible = show && data.length > 1
    shown = visible && !!g
    if (!show || was || !g) return
    const c = dotEl
    const p = untrack(() => curve)
    if (reduced || reducedMotion(g) || p.length < 2) return
    const x0 = p[0].x
    const x1 = p[p.length - 1].x
    const wipe = wipeEl
    if (!wipe) return
    // The clip is a rect in the chart's own units, so its edge is exactly the dot's x
    const at = (e: number) => {
      const x = x0 + (x1 - x0) * e
      wipe.setAttribute('width', `${x + 6}`)
      if (c) {
        c.style.setProperty('cx', `${x}px`)
        c.style.setProperty('cy', `${yAt(p, x)}px`)
      }
    }
    g.style.transition = 'opacity 0.15s ease'
    if (c) {
      c.style.transition = 'opacity 0.2s ease, transform 0.3s cubic-bezier(0.34, 1.4, 0.64, 1)'
      c.style.opacity = '1'
      c.style.transform = 'none'
    }
    at(0)
    let drawing = true
    // Back to the stylesheet: the end state matches it, so nothing moves
    const done = () => {
      drawing = false
      wipe.setAttribute('width', `${width + 12}`)
      g.style.removeProperty('transition')
      if (c) for (const k of ['cx', 'cy', 'transition', 'opacity', 'transform']) c.style.removeProperty(k)
    }
    const t0 = performance.now()
    let raf = requestAnimationFrame(function step(now) {
      const t = Math.min(1, (now - t0) / DRAW_MS)
      at(ease(t))
      if (t < 1) raf = requestAnimationFrame(step)
      else done()
    })
    return () => {
      cancelAnimationFrame(raf)
      // An interrupted setup can draw again. A completed draw does not replay
      // when motion is restored.
      if (drawing) shown = false
      done()
    }
  })
</script>

{#if !data.length}
  <svg
    class={`ss-chart${className ? ` ${className}` : ''}${klass ? ` ${klass}` : ''}`}
    data-kind={kind}
    data-show={show || undefined}
    {width}
    {height}
    style={style || undefined}
    aria-hidden="true"
  ></svg>
{:else if kind === 'bars'}
  <svg
    class={`ss-chart${className ? ` ${className}` : ''}${klass ? ` ${klass}` : ''}`}
    data-kind="bars"
    data-still={reduced || undefined}
    data-show={show || undefined}
    {width}
    {height}
    style={style || undefined}
    aria-hidden="true"
  >
    {#each data as v, i (i)}
      {@const bh = Math.max(2, (v / top) * h)}
      <rect
        class="ss-chart__bar"
        x={i * (bw + gap)}
        width={bw}
        rx={Math.min(2, bw / 2)}
        style={`y:${height - (show ? bh : 0)}px;height:${show ? bh : 0}px;transition-delay:${i * 22}ms`}
      />
    {/each}
  </svg>
{:else}
  <svg
    class={`ss-chart${className ? ` ${className}` : ''}${klass ? ` ${klass}` : ''}`}
    data-kind="line"
    data-still={reduced || undefined}
    data-show={show || undefined}
    {width}
    {height}
    style={style || undefined}
    aria-hidden="true"
  >
    <defs>
      <linearGradient id={`${id}-fill`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="var(--ss-accent)" stop-opacity="0.18" />
        <stop offset="1" stop-color="var(--ss-accent)" stop-opacity="0" />
      </linearGradient>
      <clipPath id={`${id}-wipe`}>
        <rect bind:this={wipeEl} x={-6} y={-6} width={width + 12} height={height + 12} />
      </clipPath>
    </defs>
    <!-- One wipe reveals the line and its fill together, so the fill never
         runs ahead of the line. d is also set as a style so a data change
         eases the shape. -->
    <g bind:this={drawEl} class="ss-chart__draw" clip-path={`url(#${id}-wipe)`}>
      {#if area && pts.length > 1}
        <path
          class="ss-chart__area"
          d={fill}
          style={`d:path("${fill}")`}
          fill={`url(#${id}-fill)`}
        />
      {/if}
      <path class="ss-chart__line" d={line} style={`d:path("${line}")`} />
    </g>
    {#if dot}
      <circle
        bind:this={dotEl}
        class="ss-chart__dot"
        data-lead=""
        cx={end.x}
        cy={end.y}
        r={3.5}
        style={`cx:${end.x}px;cy:${end.y}px`}
      />
    {/if}
  </svg>
{/if}
