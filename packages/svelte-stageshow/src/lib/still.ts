import { getContext, setContext } from 'svelte'

// Upstream's StillContext: a host (the preview's `?still=1` route) can force
// every Stage inside it to hold its poster/initial frame with the script off.
const STILL_KEY = Symbol('stageshow.still')

export function setStill(still: boolean) {
  setContext(STILL_KEY, still)
}

export function getStill(): boolean {
  return getContext<boolean>(STILL_KEY) ?? false
}
