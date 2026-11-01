import type { Layout, Palette, Theme, Fidelity } from './look.js'
import type { Point, Rect, Target } from './measure.js'

/** loop: repeats while on screen. once: plays when first seen, then holds the end. hover: plays while the pointer is over it, settles back when it leaves. */
export type Play = 'loop' | 'once' | 'hover'

/** Design tokens for a look: `--ss-accent`, `--ss-radius-md`, `--ss-font` and the rest. */
export type LookTokens = { [token: `--ss-${string}`]: string }

/** pointer: the arrow. hand: the pointing hand, for links and buttons. open: the open hand over something draggable. grab: the closed hand while it's held. resize-ns, resize-ew: over an edge that drags. resize-nwse, resize-nesw: over a corner. */
export type CursorKind = 'pointer' | 'ibeam' | 'crosshair' | 'hand' | 'open' | 'grab' | 'wait' | 'resize-ns' | 'resize-ew' | 'resize-nwse' | 'resize-nesw'

/** real: the macOS pointer. large: the same, 1.5x. circle: the iPad's glass pointer. touch: a finger on a phone. arrow: a solid rounded arrowhead. */
export type CursorStyle = 'real' | 'large' | 'circle' | 'touch' | 'arrow'

export interface CursorConfig {
  /** Where the cursor rests at the start of each loop, or where it sits in a still. */
  at: Target | { wide: Target; compact: Target }
  kind?: CursorKind
  style?: CursorStyle
  /** Keep the cursor in the reduced-motion poster. */
  still?: boolean
  /** Send a soft ring out from each click. */
  ripple?: boolean
  /** How long (ms) the cursor may rest after acting before it fades (4000 by default); false keeps it on. */
  idle?: number | false
}

export interface KeysConfig {
  wide: KeysAt
  compact: KeysAt
}

export type KeysAt = 'bottom' | 'top' | 'bottom-left' | 'bottom-right'

export interface CompactConfig {
  below: number
  width: number
  height: number
}

export type Ground = 'orbs' | [string, string] | [string, string, string]

export interface Act<S> {
  /** Merge a patch into scene state. Resolves once it has painted, so rects are fresh. */
  set(patch: Partial<S> | ((s: S) => Partial<S>)): Promise<void>
  /** Like set, without waiting. For per-frame updates inside drag. */
  put(patch: Partial<S> | ((s: S) => Partial<S>)): void
  wait(ms: number): Promise<void>
  /** Where a target is now, in stage pixels. */
  rect(name: string, opts?: { layout?: boolean }): Rect
  /** The character offset a text selection reaches with the pointer at `at`. */
  caret(name: string, at: Point): number
  center(name: string): Point
  move(to: Target, opts?: { duration?: number; path?: (progress: number, from: Point, to: Point) => Point; onMove?: (at: Point, from: Point, t: number) => void }): Promise<void>
  click(to?: Target, opts?: { double?: boolean; right?: boolean }): Promise<void>
  scroll(name: string, to: number | string, opts?: { duration?: number; offset?: number }): Promise<void>
  cursor(kind: CursorKind): Promise<void>
  snap(patch: Partial<S> | ((s: S) => Partial<S>), scope?: string): Promise<void>
  key(combo: string): Promise<void>
  stagger<T>(items: T[], fn: (item: T, i: number) => Promise<void> | void, gap?: number): Promise<void>
  mark(name: string): void
  type(key: keyof S, text: string, opts?: { interval?: number }): Promise<void>
  drag(to: Target, onMove?: (at: Point, from: Point, t: number) => void, opts?: { duration?: number; cursor?: 'preserve'; path?: (progress: number, from: Point, to: Point) => Point }): Promise<void>
  place(to: Target): void
  enter(to: Target, opts?: { duration?: number }): Promise<void>
  readonly signal: AbortSignal
  readonly layout: Layout
}

export type Script<S> = (act: Act<S>) => Promise<void>

export type PhoneFrame = 'pro' | 'photo' | 'bezel' | 'soft' | 'bare' | 'silver' | 'clay' | 'outline' | 'android'

export type { Layout, Palette, Theme, Fidelity, Point, Rect, Target }
