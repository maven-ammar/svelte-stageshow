# Port status

One row per public component/module. `Ported` means the Svelte file is in the
package and exported; the note records a deliberate deviation, not a missing
feature. Source: `benjitaylor/skills/stageshow` (MIT, commit `8020574`).

| Public API | Status | Evidence / note |
| --- | --- | --- |
| `Stage` | Ported | fit/scale, compact, looks, tokens, ground, cursor, play, keycaps, deterministic frames, recorder |
| `Window` | Ported | browser/app/sidebar/tabs/terminal/glass/card/hairline/tall bar |
| `Bar` | Ported | tones 1-5, shrink |
| `Text` | Ported | fidelity-aware bar/text, wrap |
| `Row` | Ported | lead/title/subtitle/meta/preview/selected/pad |
| `Phone` | Ported | pro/photo/bezel/silver/clay/soft/bare/outline/android |
| `Avatar` | Ported | initials, tones, ring states |
| `Chip` | Ported | remove callback |
| `Cursor` | Ported | all pointer/I-beam/hand/wait/resize/touch/circle styles; uses the macOS glyph components below |
| `MacPointer`, `MacIbeam`, `MacCrosshair`, `MacPointingHand`, `MacOpenHand`, `MacGrab`, `MacWait`, `MacResize*` | Ported | upstream `cursors.tsx` module split into typed Svelte glyphs; `cursors.ts` re-exports the same names |
| `messages.ts` module | Ported | Thread, Bubble, Stamp, Receipt with the same props |
| `ios.ts` module | Ported | Keyboard with the same props |
| `Camera` | Ported | zoom/feather; measurement via `$effect` + ResizeObserver |
| `Collapse` | Ported | clip/drop, above/below, solid, tall |
| `Connector` | Ported | h/v/straight/step/curve, arrow/dots/label/dash |
| `Count` | Ported | digit strips, unit box, snap/rolling |
| `Expand` | Ported | card and launch faces, phone corner |
| `Fly` | Ported | fixed take-off rects, arc, held state |
| `Follow` | Ported | spring follow; `cellOf` exported |
| `Popover` | Ported | origin, delayed close; closing HTML is snapshotted during the fade |
| `Roll` | Ported | char/word, fade; outgoing text is snapshotted |
| `Scroll` | Ported | mask, thumb, data-scrolled |
| `States` | Ported | cross-fade between snippets/strings |
| `Stream` | Ported | word-by-word with reserve |
| `Swap` | Ported | outgoing plain text frozen; element children can reflect a parent update during the fade |
| `BrandMark` | Ported | 35 marks, tile/dark/light/custom src |
| `Check` | Ported | pending arc, fill + tick |
| `Facepile` | Ported | radial mask overlap |
| `Icon` | Ported | inline Lucide nodes + chip/contactless drawings; absolute stroke width now matches lucide-react |
| `Menu` | Ported | rows, value, targets |
| `Meter` | Ported | tone, clip-path fill |
| `Pin` | Ported | corner/tone/selected/avatar |
| `Spinner` | Ported | reduced motion holds |
| `Toast` | Ported | show, icon/action |
| `Tooltip` | Ported | above/below, gap |
| `Badge` | Ported | tone, dot, lead |
| `Field` | Ported | focus/error/status, chip/held value |
| `Segmented` | Ported | thumb, targets |
| `Slot` | Ported | open/dashed height slot |
| `Tabs` | Ported | active tab + bar |
| `Toggle` | Ported | on/off, mono/blueprint overrides |
| `Code` | Ported | tokenizer, diff lines, count, overflow mask |
| `Chart` | Ported | line/bars, area/dot, draw wipe, morph |
| `Keyboard` | Ported | iOS 27 rows, callouts, auto-shift, dark |
| `Thread` | Ported | ready context, tail registry, FLIP via MutationObserver |
| `Bubble` | Ported | typing/morph/tail/source/tapback/avatar; string minimal-fidelity caveat |
| `Stamp` | Ported | centered timestamp |
| `Receipt` | Ported | show/fade via Roll |
| `Prompt` | Ported | path, prompt sigil, command |
| `Caret` | Ported | solid option |
| `LockScreen` | Ported | date/clock/controls/stack/satellite |
| `Notification` | Ported | icon/title/body/time/banner |
| `Keycaps` / `capsOf` | Ported | act.key, four placements, fade rows |
| `StillProvider` | Added | query-still host context; holds poster/initial and stops scripts |
| `WALLPAPER` | Ported | default lock-screen gradient |
| Brands | Ported | 35 marks, 44 SVG assets, four licence files + SOURCES.md |
| Looks | Ported | light/dark/blueprint/glass tokens and overrides in stage.css |
| Examples | Ported | 69/69 registered; 38 animated scenes expose marks; annotations adds composed studies |

## Verification

```sh
pnpm --filter svelte-stageshow check
pnpm --filter web exec svelte-check --tsconfig ./tsconfig.json --fail-on-warnings
node scripts/smoke-scenes.mjs
node scripts/list-marks.mjs
```

Package and gallery checks are 0 errors / 0 warnings. Capture smoke is 69/69.
The latest parity table is `shots/parity-all.md`; matched-mark stills are under
`shots/ref-at/` and `shots/port-at/`.
