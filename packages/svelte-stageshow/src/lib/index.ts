// Svelte 5 port of the Stageshow kit. The components are the public API; the
// stylesheet is one import (svelte-stageshow/style.css).
//
// Names follow the upstream `kit/index.ts` exactly. ReactNode props became
// `Snippet` props, and React events became callback props.

// Stage and runtime
export { default as Stage } from './Stage.svelte'
export { default as Cursor } from './Cursor.svelte'
export { default as StillProvider } from './StillProvider.svelte'
export {
  MacPointer,
  MacIbeam,
  MacCrosshair,
  MacPointingHand,
  MacOpenHand,
  MacGrab,
  MacWait,
  MacResize,
  MacResizeNS,
  MacResizeEW,
  MacResizeNWSE,
  MacResizeNESW,
} from './cursors.js'
export { default as Keycaps } from './Keycaps.svelte'
export { getLook, setLook } from './look.js'
export { useLook } from './looks.js'
export { capsOf } from './keys.js'
export type { Keys, KeysAt } from './keys.js'
export type { Look, Theme, Palette, Fidelity, Layout } from './look.js'
export type {
  Act,
  Script,
  Play,
  LookTokens,
  CursorKind,
  CursorStyle,
  CursorConfig,
  CompactConfig,
  Ground,
  PhoneFrame,
} from './types.js'
export type { Point, Rect, Target } from './measure.js'
export { inset, box, between, contains, EMPTY } from './measure.js'
export { EASE, bezier, css as easeCss } from './ease.js'
export type { EaseName, Bezier } from './ease.js'

// Frames: windows, devices, terminals and system surfaces
export { default as Window } from './Window.svelte'
export { default as Bar } from './Bar.svelte'
export { default as Text } from './Text.svelte'
export { default as Phone } from './Phone.svelte'
export { default as Row } from './Row.svelte'
export { default as Avatar } from './Avatar.svelte'
export { default as Chip } from './Chip.svelte'

// Motion
export { default as Connector } from './motion/Connector.svelte'
export { default as Count } from './motion/Count.svelte'
export { default as Roll } from './motion/Roll.svelte'
export { default as Swap } from './motion/Swap.svelte'
export { default as Collapse } from './motion/Collapse.svelte'
export { default as Fly } from './motion/Fly.svelte'
export { default as Follow } from './motion/Follow.svelte'
export { cellOf } from './motion/Follow.svelte'
export { default as States } from './motion/States.svelte'
export { default as Stream } from './motion/Stream.svelte'
export { default as Popover } from './motion/Popover.svelte'
export { default as Camera } from './motion/Camera.svelte'
export { default as Scroll } from './motion/Scroll.svelte'
export { default as Expand } from './motion/Expand.svelte'

// Small parts
export { default as BrandMark } from './parts/BrandMark.svelte'
export { default as Check } from './parts/Check.svelte'
export { default as Facepile } from './parts/Facepile.svelte'
export { default as Icon } from './parts/Icon.svelte'
export type { IconName } from './parts/Icon.svelte'
export { default as Menu } from './parts/Menu.svelte'
export { default as Meter } from './parts/Meter.svelte'
export { default as Pin } from './parts/Pin.svelte'
export { default as Spinner } from './parts/Spinner.svelte'
export { default as Toast } from './parts/Toast.svelte'
export { default as Tooltip } from './parts/Tooltip.svelte'
export { brandMarks } from './brands.js'
export type { BrandName, BrandAsset } from './brands.js'

// Controls
export { default as Badge } from './controls/Badge.svelte'
export { default as Field } from './controls/Field.svelte'
export { default as Segmented } from './controls/Segmented.svelte'
export { default as Slot } from './controls/Slot.svelte'
export { default as Tabs } from './controls/Tabs.svelte'
export { default as Toggle } from './controls/Toggle.svelte'

// Root modules
export { default as Code } from './Code.svelte'
export { default as Chart } from './Chart.svelte'
export { chartPoints } from './chart.js'
export type { ChartProps } from './chart.js'
export type { CodeLine } from './code.js'
export { default as Keyboard } from './Keyboard.svelte'
export { default as Thread } from './Thread.svelte'
export { default as Bubble } from './Bubble.svelte'
export { default as Stamp } from './Stamp.svelte'
export { default as Receipt } from './Receipt.svelte'
export { default as Prompt } from './Prompt.svelte'
export { default as Caret } from './Caret.svelte'
export { default as LockScreen } from './LockScreen.svelte'
export { default as Notification } from './Notification.svelte'
export { WALLPAPER } from './wallpaper.js'

export const version = '0.2.0'
