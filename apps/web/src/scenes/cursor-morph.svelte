<script lang="ts">
  import { Segmented, Stage, type Act } from 'svelte-stageshow'
  import './cursor-morph.css'

  // The cursor styles, picked by the cursor itself: four options, and each
  // click turns the cursor into the one it chose. Round the four and back to
  // the default, so the loop ends where it began. Here the cursor is one
  // outline that morphs from style to style.

  type MorphStyle = 'real' | 'large' | 'circle' | 'arrow'

  const STYLES: MorphStyle[] = ['real', 'large', 'circle', 'arrow']
  const LABELS = ['Real', 'Large', 'Circle', 'Arrow']
  const ORDER = [1, 2, 3, 0]
  const REST = { x: 150, y: 150 }

  type S = { value: number }

  async function script(a: Act<S>) {
    await a.wait(600)
    for (const k of ORDER) {
      await a.click({ at: `opt-${k}`, x: 0.5, y: 0.62 })
      await a.set({ value: k })
      await a.wait(1000)
    }
    await a.move(REST)
    await a.wait(600)
  }

  // One outline that becomes each cursor style in turn: the pointer swells into
  // the large pointer, folds into the glass circle, then sharpens into the solid
  // arrowhead. Every shape is resampled to the same points, starting at the
  // hotspot and running the same way round, so a change of style moves each
  // point to its place in the next shape.

  type Pt = [number, number]
  type Look = { fill: number[]; stroke: number[]; sw: number }

  const N = 72

  /** Points evenly along a closed polygon, from its first vertex */
  function sample(poly: Pt[], scale = 1): Pt[] {
    const p = poly.map(([x, y]) => [x * scale, y * scale] as Pt)
    const seg = p.map((a, i) => {
      const b = p[(i + 1) % p.length]
      return Math.hypot(b[0] - a[0], b[1] - a[1])
    })
    const total = seg.reduce((s, l) => s + l, 0)
    const out: Pt[] = []
    let i = 0
    let walked = 0
    for (let k = 0; k < N; k++) {
      const d = (k / N) * total
      while (walked + seg[i] < d) walked += seg[i++]
      const a = p[i]
      const b = p[(i + 1) % p.length]
      const t = seg[i] ? (d - walked) / seg[i] : 0
      out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t])
    }
    return out
  }

  // The macOS pointer, tip at the hotspot, down its left edge first
  const POINTER: Pt[] = [[0, 0], [0, 16.5], [4, 12.8], [6.6, 18.6], [9.2, 17.5], [6.7, 11.8], [12, 11.8]]
  // The solid arrowhead, the same way round
  const HEAD: Pt[] = [[0, 0], [5.6, 15.5], [7.8, 8.8], [14.5, 6.6]]
  // The glass circle about the hotspot, from its upper left, the same way round
  const CIRCLE: Pt[] = Array.from({ length: N }, (_, k) => {
    const a = ((225 - (k / N) * 360) * Math.PI) / 180
    return [Math.cos(a) * 11, Math.sin(a) * 11] as Pt
  })

  const SHAPES: Record<MorphStyle, { pts: Pt[]; look: Look }> = {
    real: { pts: sample(POINTER), look: { fill: [0, 0, 0, 1], stroke: [255, 255, 255, 1], sw: 1.5 } },
    large: { pts: sample(POINTER, 1.5), look: { fill: [0, 0, 0, 1], stroke: [255, 255, 255, 1], sw: 2.2 } },
    circle: { pts: CIRCLE, look: { fill: [118, 118, 128, 0.34], stroke: [255, 255, 255, 0.55], sw: 0.8 } },
    arrow: { pts: sample(HEAD), look: { fill: [17, 17, 17, 1], stroke: [17, 17, 17, 1], sw: 2.6 } },
  }

  // A damped spring with a little overshoot, settled by about 0.5s
  function spring(t: number) {
    const z = 0.62
    const w = 15
    const wd = w * Math.sqrt(1 - z * z)
    return 1 - Math.exp(-z * w * t) * (Math.cos(wd * t) + ((z * w) / wd) * Math.sin(wd * t))
  }

  const rgba = (c: number[]) => `rgba(${c.map((v, i) => (i < 3 ? Math.round(v) : v.toFixed(3))).join(',')})`
  const path = (pts: Pt[]) => `M${pts.map(([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`).join('L')}Z`

  const first = SHAPES.real
  const initialD = path(first.pts)
  const initialFill = rgba(first.look.fill)
  const initialStroke = rgba(first.look.stroke)

  let frame = $state<HTMLDivElement | null>(null)
  let host = $state<HTMLElement | null>(null)
  let svg = $state<SVGSVGElement | null>(null)
  let glyph = $state<SVGPathElement | null>(null)
  let shape = { pts: first.pts.map((p) => [...p] as Pt), look: first.look }

  // The morph rides the kit's own cursor, so it keeps the movement and press.
  $effect(() => {
    if (!frame) return
    host = frame.closest('.ss-stage')?.querySelector<HTMLElement>('.ss-cursor') ?? null
  })

  $effect(() => {
    if (!host || !svg) return
    host.appendChild(svg)
    return () => svg?.remove()
  })

  $effect(() => {
    const hostEl = frame
    let raf = 0
    const morph = () => {
      const el = glyph
      if (!el) return
      const style = STYLES[Number(hostEl?.dataset.morphValue ?? 0)] ?? 'real'
      const to = SHAPES[style]
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        el.setAttribute('d', path(to.pts))
        el.setAttribute('fill', rgba(to.look.fill))
        el.setAttribute('stroke', rgba(to.look.stroke))
        el.setAttribute('stroke-width', String(to.look.sw))
        shape = { pts: to.pts.map((p) => [...p] as Pt), look: to.look }
        return
      }
      const from = { pts: shape.pts.map((p) => [...p] as Pt), look: shape.look }
      const mix = (a: number, b: number, k: number) => a + (b - a) * k
      cancelAnimationFrame(raf)
      const t0 = performance.now()
      const tick = (ms: number) => {
        const t = Math.min((ms - t0) / 1000, 0.7)
        const k = t >= 0.7 ? 1 : spring(t)
        const c = Math.max(0, Math.min(1, k))
        const pts = from.pts.map((p, i) => [mix(p[0], to.pts[i][0], k), mix(p[1], to.pts[i][1], k)] as Pt)
        const look = {
          fill: from.look.fill.map((v, i) => mix(v, to.look.fill[i], c)),
          stroke: from.look.stroke.map((v, i) => mix(v, to.look.stroke[i], c)),
          sw: mix(from.look.sw, to.look.sw, c),
        }
        shape = { pts, look }
        el.setAttribute('d', path(pts))
        el.setAttribute('fill', rgba(look.fill))
        el.setAttribute('stroke', rgba(look.stroke))
        el.setAttribute('stroke-width', look.sw.toFixed(2))
        if (t < 0.7) raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
    }
    if (!hostEl) return
    const observer = new MutationObserver(morph)
    observer.observe(hostEl, { attributes: true, attributeFilter: ['data-morph-value'] })
    morph()
    return () => {
      observer.disconnect()
      cancelAnimationFrame(raf)
    }
  })
</script>

<Stage
  width={550}
  height={200}
  compact={{ below: 540, width: 358, height: 200 }}
  initial={{ value: 0 }}
  {script}
  cursor={{ at: REST, style: 'real' }}
  className="cm-stage"
>
  {#snippet children(s)}
    <div class="cm-frame" bind:this={frame} data-morph-value={s.value}>
      <Segmented className="cm-seg" items={LABELS} value={s.value} targets={LABELS.map((_, k) => `opt-${k}`)} />
      <svg bind:this={svg} class="cm-morph" width="48" height="48" viewBox="-16 -16 48 48" aria-hidden="true">
        <path bind:this={glyph} d={initialD} fill={initialFill} stroke={initialStroke} stroke-width={first.look.sw} stroke-linejoin="round" />
      </svg>
    </div>
  {/snippet}
</Stage>
