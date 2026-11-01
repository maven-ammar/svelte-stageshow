// The clock an Act runs on. Real playback uses the browser's clock; a
// deterministic run uses VirtualClock, where one advanceFrame is exactly one
// 60fps frame. Timers run before requestAnimationFrame callbacks in a frame,
// consistently, so the same script and frame index always see the same order.

export interface Clock {
  now(): number
  raf(cb: () => void): number
  cancelRaf(id: number): void
  setTimeout(cb: () => void, ms: number): number
  clearTimeout(id: number): void
}

export const realClock: Clock = {
  now: () => performance.now(),
  raf: (cb) => requestAnimationFrame(cb),
  cancelRaf: (id) => cancelAnimationFrame(id),
  setTimeout: (cb, ms) => window.setTimeout(cb, ms),
  clearTimeout: (id) => window.clearTimeout(id),
}

interface Timer {
  id: number
  at: number
  cb: () => void
}

/** A clock with no wall time. advanceFrame() is one 1/60 s frame. */
export class VirtualClock implements Clock {
  private t = 0
  private nextId = 0
  private rafs = new Map<number, () => void>()
  private timers: Timer[] = []

  now() {
    return this.t
  }

  raf(cb: () => void) {
    const id = ++this.nextId
    this.rafs.set(id, cb)
    return id
  }

  cancelRaf(id: number) {
    this.rafs.delete(id)
  }

  setTimeout(cb: () => void, ms: number) {
    const id = ++this.nextId
    this.timers.push({ id, at: this.t + Math.max(0, ms), cb })
    return id
  }

  clearTimeout(id: number) {
    this.timers = this.timers.filter((timer) => timer.id !== id)
  }

  /** Run every timer due up to now, then every callback waiting for a frame. */
  advanceFrame() {
    this.t += 1000 / 60
    let guard = 0
    for (;;) {
      const due = this.timers
        .filter((timer) => timer.at <= this.t + 1e-6)
        .sort((a, b) => a.at - b.at || a.id - b.id)
      if (!due.length || guard++ > 1000) break
      const ids = new Set(due.map((timer) => timer.id))
      this.timers = this.timers.filter((timer) => !ids.has(timer.id))
      for (const timer of due) timer.cb()
    }
    const rafs = [...this.rafs.values()]
    this.rafs.clear()
    for (const cb of rafs) cb()
  }
}
