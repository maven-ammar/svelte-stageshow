import { getContext, setContext } from 'svelte'

// The look a stage sets for everything inside it: theme, palette, fidelity,
// and which of its designs (wide or compact) is showing. <Stage> provides it;
// parts read it with getLook().

/** glass: frosted, translucent surfaces over a soft color field. */
export type Theme = 'light' | 'dark' | 'blueprint' | 'glass'
export type Palette = 'accent' | 'mono'
/** minimal: no text, only shapes. standard: real text where it carries meaning. realistic: real text, logos and avatars everywhere. */
export type Fidelity = 'minimal' | 'standard' | 'realistic'
/** wide: the design size. compact: the smaller design used below `compact.below`. */
export type Layout = 'wide' | 'compact'

export interface Look {
  readonly theme: Theme
  readonly palette: Palette
  readonly fidelity: Fidelity
  readonly layout: Layout
}

const LOOK_KEY = Symbol('stageshow.look')

const DEFAULT_LOOK: Look = {
  theme: 'light',
  palette: 'accent',
  fidelity: 'standard',
  layout: 'wide',
}

export function setLook(look: Look) {
  setContext(LOOK_KEY, look)
}

export function getLook(): Look {
  return getContext<Look>(LOOK_KEY) ?? DEFAULT_LOOK
}
