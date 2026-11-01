// Whether the viewer asked for reduced motion, and whether a Stage is showing
// its still. The React kit read the second through StillContext; the Svelte
// stage marks itself with `data-still`, so a motion part checks its ancestor
// instead. Both are browser-safe: during SSR the preference is false.

let media: MediaQueryList | null = null
const listeners = new Set<() => void>()

function notify() {
  for (const listener of listeners) listener()
}

function query(): MediaQueryList | null {
  if (media) return media
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return null
  media = window.matchMedia('(prefers-reduced-motion: reduce)')
  media.addEventListener('change', notify)
  return media
}

/** Whether the viewer asked for reduced motion. False without a browser. */
export function prefersReducedMotion(): boolean {
  return query()?.matches ?? false
}

/** Subscribe to the OS preference changing. Returns an unsubscribe. */
export function onReducedMotionChange(listener: () => void): () => void {
  query()
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** A static stage (`data-still`) settles its motion parts too. */
export function inStillStage(el: Element | null | undefined): boolean {
  return !!el?.closest('[data-still]')
}

/** Reduced motion, either from the OS or from the Stage's still. */
export function reducedMotion(el?: Element | null): boolean {
  return prefersReducedMotion() || inStillStage(el)
}
