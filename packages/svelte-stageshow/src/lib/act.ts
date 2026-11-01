// The script API: the act a demo's script is handed each run. It drives the
// scene state and the cursor, measures targets, and stops the moment its
// signal aborts (the stage left the screen, or the layout changed). Time comes
// from a Clock, so the same script can run on the browser's clock or on a
// virtual one for deterministic frame stepping.

import { bezier } from './ease.js'
import type { Clock } from './clock.js'
import { capsOf, type Keys } from './keys.js'
import type { Layout } from './look.js'
import { EMPTY, layoutRectOf, nameOf, rectOf, thumb, type Point, type Rect, type Target } from './measure.js'
import type { Act, CursorConfig, CursorKind } from './types.js'
import { clamp, easeInOutCubic, hash, warn } from './util.js'

export { type Act, type Script } from './types.js'

export class Stopped extends Error {}

export interface ActEnv<S> {
  clock: Clock
  speed: number
  layout: Layout
  cursor?: CursorConfig
  stage: () => HTMLElement | null
  getPoint: () => Point
  getHovered: () => Element | null
  getKind: () => CursorKind
  resolve: (t: Target) => Point
  place: (p: Point) => void
  setScene: (fn: (s: S) => S) => void
  setKind: (k: CursorKind) => void
  setHover: (el: Element | null) => void
  setPressed: (v: boolean) => void
  setTouching: (v: boolean) => void
  getKeys: () => Keys
  setKeys: (k: Keys) => void
  setLastKeys: (k: Keys | null) => void
  targetEl: (t: Target) => Element | null
  rect: (name: string, opts?: { layout?: boolean }) => Rect
  flashInstant: (on: boolean) => void
  remeasure: () => void
  flush: () => Promise<void>
}

export function createAct<S>(signal: AbortSignal, env: ActEnv<S>): Act<S> {
  const { clock, speed, layout, cursor, stage, getPoint, getHovered, getKind, resolve, place, setScene, setKind, setHover, setPressed, setTouching, getKeys, setKeys, setLastKeys, targetEl, rect, flashInstant, remeasure, flush } = env
  const entering = bezier('enter')
  let keyId = 0
  const check = () => {
    if (signal.aborted) throw new Stopped()
  }
  const pause = <T>(schedule: (done: () => void) => T, cancel: (id: T) => void) =>
    new Promise<void>((res, rej) => {
      check()
      const abort = () => {
        cancel(id)
        signal.removeEventListener('abort', abort)
        rej(new Stopped())
      }
      const id = schedule(() => {
        signal.removeEventListener('abort', abort)
        if (signal.aborted) rej(new Stopped())
        else res()
      })
      signal.addEventListener('abort', abort, { once: true })
    })
  const frame = () => pause((done) => clock.raf(done), (id) => clock.cancelRaf(id))
  const wait = (ms: number) => pause((done) => clock.setTimeout(done, ms / speed), (id) => clock.clearTimeout(id))
  const own = (release: () => void) => {
    let live = true
    const done = () => {
      if (!live) return
      live = false
      signal.removeEventListener('abort', done)
      release()
    }
    signal.addEventListener('abort', done, { once: true })
    return done
  }
  const tween = async (ms: number, step: (t: number) => void) => {
    const start = clock.now()
    const dur = ms / speed
    for (;;) {
      check()
      const t = Math.min(1, (clock.now() - start) / dur)
      step(t)
      if (t === 1) return
      await frame()
    }
  }
  const chain = (el: Element | null) => {
    const out: Element[] = []
    for (let n = el; n && n !== stage(); n = n.parentElement) if (n.hasAttribute('data-target')) out.push(n)
    return out
  }
  const hover = (el: Element | null) => {
    setHover(el)
    // The nearest marked element wins, as a real cursor reads the thing it is
    // over; a marked window passes its kind down to unmarked controls inside.
    for (let n = el; n && n !== stage(); n = n.parentElement) {
      const kind = n.getAttribute('data-cursor')
      if (kind) {
        setKind(kind as CursorKind)
        return
      }
    }
    setKind('pointer')
  }
  const carets = { n: 0 }

  const a: Act<S> = {
    get signal() {
      return signal
    },
    get layout() {
      return layout
    },
    put(patch) {
      if (signal.aborted) return
      setScene((s) => ({ ...s, ...(typeof patch === 'function' ? patch(s) : patch) }))
    },
    async set(patch) {
      check()
      a.put(patch)
      await flush()
      check()
    },
    async wait(ms) {
      check()
      await wait(ms)
    },
    rect(name, opts) {
      return rect(name, opts)
    },
    center(name) {
      return resolve(name)
    },
    caret(name, at) {
      carets.n++
      const el = targetEl(name) as HTMLElement | null
      const root = stage()
      if (!el || !root) return 0
      const box = root.getBoundingClientRect()
      const k = box.width / root.offsetWidth || 1
      const x = box.left + at.x * k
      const y = box.top + at.y * k
      const chars: { left: number; right: number; mid: number; top: number; bottom: number; at: number }[] = []
      const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
      const r = document.createRange()
      let offset = 0
      const hidden = (node: Node) => {
        for (let p = node.parentElement; p; p = p === el ? null : p.parentElement) {
          const cs = getComputedStyle(p)
          if (cs.opacity === '0' || cs.visibility === 'hidden' || cs.display === 'none') return true
        }
        return false
      }
      for (let n = walk.nextNode(); n; n = walk.nextNode()) {
        const text = n.textContent ?? ''
        if (hidden(n)) continue
        for (let c = 0; c < text.length; c++) {
          r.setStart(n, c)
          r.setEnd(n, c + 1)
          const b = r.getBoundingClientRect()
          if (b.width || b.height) chars.push({ left: b.left, right: b.right, mid: (b.left + b.right) / 2, top: b.top, bottom: b.bottom, at: offset + c })
        }
        offset += text.length
      }
      if (!chars.length) return 0
      if (y < chars[0].top) return 0
      if (y > chars[chars.length - 1].bottom) return offset
      let line = chars[0]
      for (const ch of chars) if (Math.abs((ch.top + ch.bottom) / 2 - y) < Math.abs((line.top + line.bottom) / 2 - y)) line = ch
      const row = chars.filter((ch) => Math.abs(ch.top - line.top) < (line.bottom - line.top) / 2)
      const next = row.find((ch) => ch.mid > x)
      return next ? next.at : row[row.length - 1].at + 1
    },
    async move(to, opts) {
      check()
      const start = { ...getPoint() }
      const end = resolve(to)
      const dist = Math.hypot(end.x - start.x, end.y - start.y)
      if (dist < 0.5) {
        hover(targetEl(to))
        return
      }
      const dest = chain(targetEl(to))
      const current = chain(getHovered())
      hover(current.find((n) => dest.includes(n)) ?? null)
      const ms = opts?.duration ?? clamp(260 + dist * 0.9, 300, 650)
      const bow = Math.min(dist * 0.08, 24)
      const nx = -(end.y - start.y) / dist
      const ny = (end.x - start.x) / dist
      await tween(ms, (t) => {
        const e = easeInOutCubic(t)
        const lift = Math.sin(Math.PI * e) * bow
        const p = opts?.path ? opts.path(e, start, end) : { x: start.x + (end.x - start.x) * e + nx * lift, y: start.y + (end.y - start.y) * e + ny * lift }
        place(p)
        if (opts?.onMove) opts.onMove(p, start, t)
      })
      check()
      hover(targetEl(to))
    },
    async click(to, opts) {
      check()
      if (to !== undefined) {
        await a.move(to)
        await wait(120)
      }
      check()
      const el = to !== undefined ? targetEl(to) : getHovered()
      const finger = cursor?.style === 'touch'
      const release = own(() => {
        setPressed(false)
        el?.removeAttribute('data-pressed')
        if (finger) clock.setTimeout(() => setTouching(false), 240)
      })
      try {
        if (finger) {
          setTouching(true)
          await wait(140)
          check()
        }
        for (let i = 0; i < (opts?.double ? 2 : 1); i++) {
          if (i) await wait(70)
          check()
          setPressed(true)
          el?.setAttribute('data-pressed', opts?.right ? 'right' : '')
          await wait(opts?.double ? 80 : 100)
          check()
          setPressed(false)
          el?.removeAttribute('data-pressed')
        }
      } finally {
        release()
      }
    },
    async scroll(name, to, opts) {
      check()
      const el = targetEl(name) as HTMLElement | null
      if (!el) return
      const from = el.scrollTop
      let end = typeof to === 'number' ? to : from
      if (typeof to === 'string') {
        const t = targetEl(to) as HTMLElement | null
        if (t) end = from + (t.getBoundingClientRect().top - el.getBoundingClientRect().top) / 1 - (opts?.offset ?? 0)
      }
      end = clamp(end, 0, el.scrollHeight - el.clientHeight)
      await tween(opts?.duration ?? clamp(420 + Math.abs(end - from) * 1.2, 500, 1400), (t) => {
        el.scrollTop = from + (end - from) * easeInOutCubic(t)
        el.toggleAttribute('data-scrolled', el.scrollTop > 0.5)
        thumb(el)
      })
      remeasure()
    },
    async snap(patch, scope) {
      check()
      const el = scope ? (targetEl(scope) as HTMLElement | null) : stage()
      el?.setAttribute('data-instant', '')
      flashInstant(true)
      try {
        a.put(patch)
        await flush()
        check()
      } finally {
        el?.removeAttribute('data-instant')
        flashInstant(false)
      }
    },
    async key(combo) {
      check()
      const caps = capsOf(combo)
      const id = ++keyId
      const k = getKeys()
      setLastKeys(k.caps.length ? { ...k, show: false, down: false } : null)
      setKeys({ id, caps, show: false, down: false })
      await frame()
      await frame()
      check()
      setKeys({ id, caps, show: true, down: false })
      await wait(180)
      check()
      setKeys({ id, caps, show: true, down: true })
      await wait(140)
      check()
      setKeys({ id, caps, show: true, down: false })
      // The caps linger and fade without holding up the script.
      void wait(600).then(
        () => {
          if (keyId === id && !signal.aborted) setKeys({ id, caps, show: false, down: false })
        },
        (error) => {
          if (!(error instanceof Stopped)) console.error('[stageshow] script error', error)
        },
      )
    },
    async stagger(items, fn, gap = 60) {
      await Promise.all(
        items.map(async (item, i) => {
          if (i) await wait(gap * i)
          check()
          await fn(item, i)
        }),
      )
    },
    mark(name) {
      if (!signal.aborted) stage()?.setAttribute('data-mark', name)
    },
    async cursor(kind) {
      check()
      setKind(kind)
      await frame()
    },
    async type(key, text, opts) {
      const interval = opts?.interval ?? 35
      for (let i = 0; i <= text.length; i++) {
        check()
        setScene((s) => ({ ...s, [key]: text.slice(0, i) }))
        await wait(interval * (0.7 + 0.6 * hash(i)))
      }
    },
    place(to) {
      if (signal.aborted) return
      place(resolve(to))
    },
    async enter(to, opts) {
      check()
      const end = resolve(to)
      const root = stage()
      if (!root) return
      const f = { x: 0, y: 0, w: root.offsetWidth, h: root.offsetHeight }
      const out = 40
      const gaps = [end.x - f.x, f.x + f.w - end.x, end.y - f.y, f.y + f.h - end.y]
      const side = gaps.indexOf(Math.min(...gaps))
      const from = side === 0 ? { x: f.x - out, y: end.y + f.h * 0.12 } : side === 1 ? { x: f.x + f.w + out * 0.4, y: end.y + f.h * 0.12 } : side === 2 ? { x: end.x - f.w * 0.06, y: f.y - out } : { x: end.x + f.w * 0.06, y: f.y + f.h + out * 0.4 }
      place(from)
      hover(null)
      await tween(opts?.duration ?? 700, (t) => {
        const e = entering(t)
        place({ x: from.x + (end.x - from.x) * e, y: from.y + (end.y - from.y) * e })
      })
      check()
      hover(targetEl(to))
    },
    async drag(to, onMove, opts) {
      check()
      const from = { ...getPoint() }
      const end = resolve(to)
      const dist = Math.hypot(end.x - from.x, end.y - from.y)
      hover(null)
      const before = getKind()
      const closesHand = opts?.cursor !== 'preserve'
      if (closesHand) setKind('grab')
      const release = own(() => setKind(before))
      try {
        setPressed(true)
        await wait(60)
        check()
        const bow = Math.min(dist * 0.06, 18)
        const nx = dist ? -(end.y - from.y) / dist : 0
        const ny = dist ? (end.x - from.x) / dist : 0
        await tween(opts?.duration ?? clamp(360 + dist * 1.1, 450, 900), (t) => {
          const e = easeInOutCubic(t)
          const lift = Math.sin(Math.PI * e) * bow
          const at = opts?.path?.(e, from, end) ?? { x: from.x + (end.x - from.x) * e + nx * lift, y: from.y + (end.y - from.y) * e + ny * lift }
          onMove?.(at, from, t)
          place(at)
        })
      } finally {
        release()
        setPressed(false)
      }
    },
  }

  return a
}
