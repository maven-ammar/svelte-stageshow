// Svelte 5 port of the Stageshow kit. The components are the public API; the
// stylesheet is one import (svelte-stageshow/style.css).

export { default as Stage } from './Stage.svelte'
export { default as Window } from './Window.svelte'
export { default as Bar } from './Bar.svelte'
export { default as Text } from './Text.svelte'
export { default as Row } from './Row.svelte'
export { default as Phone } from './Phone.svelte'
export { default as Avatar } from './Avatar.svelte'
export { default as Chip } from './Chip.svelte'
export { default as Cursor } from './Cursor.svelte'

export { getLook } from './look.js'
export type { Look, Theme, Palette, Fidelity, Layout } from './look.js'
export type {
  Act,
  Script,
  Play,
  LookTokens,
  CursorKind,
  CursorStyle,
  CursorConfig,
  KeysAt,
  CompactConfig,
  Ground,
  PhoneFrame,
} from './types.js'
export type { Point, Rect, Target } from './measure.js'
export { inset, box, between, contains, EMPTY } from './measure.js'
export { EASE, bezier, css as easeCss } from './ease.js'
export type { EaseName, Bezier } from './ease.js'

export const version = '0.2.0'
