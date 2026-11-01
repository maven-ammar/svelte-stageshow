// Public look surface, mirroring upstream `kit/looks.ts`. The implementation
// lives in look.ts so the Svelte context helpers stay in one place.
export type { Theme, Palette, Fidelity, Layout, Look } from './look.js'
export { getLook, setLook } from './look.js'

import { getLook } from './look.js'

/** React's `useLook()` name, kept for API parity in the Svelte port. */
export const useLook = getLook
