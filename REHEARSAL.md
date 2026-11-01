# Rehearsal

Verification record for `svelte-stageshow` 0.2.0. Measured on this machine on
2026-11-01 with Chrome (local install), `playwright-core` 1.56.1, Node 22.12.0
and pnpm 10.13.1.

## Gate summary

| Gate | Result |
|---|---|
| `pnpm check` | 0 errors, 0 warnings (library and gallery) |
| `pnpm build` | library `svelte-package` + gallery Vite build succeed |
| Consumer tarball | 0.2.0, 62,871 bytes; SvelteKit build exit 0 |
| API names | 72 checked, 0 missing (`scripts/api-map.mjs`) |
| Determinism | 1,501 frames; within a run and across reloads, all hashes equal |
| Static gold parity | **∞ dB PSNR** at the 900 × 316 capture (pixel-identical) |
| Hero gold parity | **42.51 dB PSNR** at the 900 × 356 capture (text AA only) |
| Parity sheet | `shots/parity-sheet.png` — reference and port side by side |

## 1. Gold source and stills

The local copy this port started from was incomplete: 28 kit root files, 0
under `kit/parts`, `kit/motion`, `kit/controls` and `kit/brands`, 0 files across
69 `examples/` folders, 0 gold images, 14 of 15 references. The complete source
is public in **`benjitaylor/skills`** (MIT), `stageshow/`, commit `8020574`
(2026-10-31), and is synced in the ignored `reference/` folder. The actual
`Row`, `Avatar`, `Chip` and both scenes were ported from that source.

Parity uses the supplied references `shots/ref-static-card.png` and
`shots/ref-hero-demo.png` and the same film method: a 900 CSS px `#example`
frame, deviceScaleFactor 2, `--still` (no script, no cursor, opening frame).
The stage sits at the top of the frame and 16px stays below it:

- static: stage 400 × 300 -> capture 900 × 316
- hero: stage 720 × 340 -> capture 900 × 356

The supplied hero reference is the **opening frame** (toolbar closed, markers 1
and 2, no terminal), not the terminal poster; the port's `still` mode renders
that frame. The live loop and poster are separate.

```sh
node scripts/film.mjs "http://127.0.0.1:4173/?capture=static-card" --out shots/example-static.png --size 900x400 --select '#example' --still
node scripts/film.mjs "http://127.0.0.1:4173/?capture=hero-demo" --out shots/example-hero.png --size 900x400 --select '#example' --still
node scripts/psnr.mjs
```

## 2. PSNR against the references

`scripts/psnr.mjs` runs ffmpeg's `psnr` filter between each port frame and its
reference; `shots/psnr.json` holds the output.

| Pair | Capture | PSNR | Target | Result |
|---|---|---|---|---|
| static-900 | 900 × 316 | **∞ dB** | 30 dB | pixel-identical; 0 differing pixels |
| hero-900 | 900 × 356 | **42.51 dB** | 30 dB | pass; residual is terminal-text anti-aliasing |

The static capture is byte-for-byte identical in the rendered image. The hero
residual is confined to text glyph edges in the terminal; no edge, fill,
radius, shadow, marker or layout differs. The first parity attempt compared a
different frame and size (a 720 × 340 poster against the 900 × 316/356 opening
frames) and measured 18.3/9.6 dB; that comparison was invalid, not a port
regression. The design-size poster stills are kept at `shots/port-*` and the
older `shots/diff.json` records their own 0.000%/0.137%/0.217% numbers, but the
900 PSNR table above is the gate.

## 3. Geometry and composition

Measured at 1× from the live DOM (`node scripts/measure.mjs`, `shots/measure.json`):

| Scene | Size | Window visible | Of stage | Off right | Off bottom | Satellite |
|---|---|---|---|---|---|---|
| static-card | 400×300 | 296×276 | 74.0% × 92.0% | 35.7% of window | 13.8% | 176 px, 96 in / 80 out |
| static-card | 358×300 | 290×276 | 81.0% × 92.0% | 37.0% of window | 13.8% | 176 px, 132 in / 44 out |
| hero-demo | 720×340 | 656×308 | 91.1% × 90.6% | 0% | 9.4% | terminal 340 px, inside the browser |
| hero-demo | 358×400 | 326×384 | 91.1% × 96.0% | 0% | 4.0% | terminal 310 px, inside the browser |

Visible text strings: static 12, hero 14. Named targets: static 0, hero 17.
Type: static window/title 13 px, detail name 12 px, row title 12 px; hero title
11 px, terminal 10 px, window title 13 px.

The gold's own framing is the bar: the static card is 400 × 300 with a 176 px
detail card straddling the window's left edge over the sidebar; the hero is
720 × 340 with a 656 px browser at a 32 px gutter, running off the bottom, and
a 340 px terminal over its right side in the live loop. The port keeps those
numbers exactly; the only rendered differences are the hero text pixels above.

## 4. Determinism

```sh
node scripts/determinism.mjs "http://127.0.0.1:4173/?test=determinism"
# frames=1501 withinRun=true acrossLoads=true firstMismatch=-1
# first=9ede2ba1ef97... last=c1b98270ffd2... pass=true
```

It runs the full HeroDemo Act script twice in one page and twice again after a
reload. Each frame is one `VirtualClock.advanceFrame()` (16.666 ms), then a
Svelte flush, then SHA-256 over a clone of `.ss-stage` with every element's
attributes sorted by name. `data-still` disables CSS transitions and
animations for the run, so a frame is a settled state.

The live loop was also sampled at 720 × 340 on the real clock:
the terminal opens and the browser recedes at ~18 s, the reset clears both at
~21 s, and the next loop's toolbar/popup are running by ~24 s. The sampled
frames are in `shots/beats/` (`hero-*.png`, `live-*.png`).

The first failure found was attribute order: Svelte put a dynamic
`aria-hidden` before the static attributes on first render and after them on a
later render. Sorting attributes on the clone fixed it; the hash still covers
every tag, attribute value, text node and comment. A second failure was the
`data-active` attribute rendered without `="true"`; the cursor's
`[data-active="true"]` selector then never matched. Both are fixed.

What the guarantee does not cover: live playback's CSS transitions (real
time), and engine-specific text rasterisation (the hash is DOM, not pixels).

## 5. API names

`node scripts/api-map.mjs` parses each Svelte component's `$props()`
destructuring and compares it with the frozen React prop list in
`docs/react-api.json` (from the public source).

```
checked=72 missing=0
```

All six components keep the original prop names. Added on purpose:
`Stage.deterministic`, `class` on every component, `Row.className`, and
`style` on `Bar`/`Text`/`Row` where an attribute object becomes a CSS string.
The full table is `docs/api-map.json`; the README has the grouped mapping and
the type/behavior diff.

## 6. Consumer test

A throwaway SvelteKit app in
`C:\Users\asus\AppData\Local\Temp\opencode\ss-consumer` installed the packed
0.2.0 tarball (62,871 bytes), not the workspace:

```sh
pnpm add .../svelte-stageshow-0.2.0.tgz
pnpm build
# exit 0; 17 files written to build/ by @sveltejs/adapter-static
```

It renders `Stage + Window + Row + Avatar + Bar` and imports
`svelte-stageshow/style.css`. Captured proof: `shots/consumer.png` (640×320).
The tarball includes `dist/` and `dist/stageshow.css`; the CSS has no
`@import` left, and the package has no React, react-dom or lucide dependency.

## 7. Faults found and fixed

1. **Local source was incomplete.** The public `benjitaylor/skills` repo was
   found, the actual parts and scenes were ported, and the gold stills were
   filmed. The first-pass re-authored scenes were replaced.
2. **Determinism failed at frame 0 on attribute order.** Fixed with a canonical
   attribute-sorted clone; 1,501 frames pass.
3. **The cursor was invisible** because `data-active` rendered as a bare
   attribute and the CSS expects `="true"`. Set explicitly.
4. **The cursor was hidden in live playback** because `showCursor` used
   `still` instead of `!still` in its script branch. Fixed.
5. **A pointer kind fell through to the resize triangles** because the cursor
   renderer had no pointer branch. Added the macOS pointer path.
6. **The ported popup/terminal entrance faded through** in an earlier pass;
   the final gold source uses opacity/transform with its own CSS, so the
   renderer now follows the gold exactly.
7. **A compact crop was a 16–20 px sliver** in an earlier pass; the final gold
   designs use their own sizes (static 358 × 300, hero 358 × 400), measured
   above.
8. **The first gold comparison was invalid:** it put a 720 × 340 poster against
   the supplied 900 × 316/356 opening frames and measured 18.3/9.6 dB. Re-filmed
   the port with the skill's `900px #example --still` method and compared with
   ffmpeg PSNR: static **∞ dB**, hero **42.51 dB**, both over the 30 dB target.
   The hero residual is text anti-aliasing only.

## 8. Not checked

- Motion parts, controls, messages, keyboard, lock screen, notification, icon
  set, keycaps, cursor morphing and the grab-hand drag. These are not in the
  package (scope), not claimed as ported.
- Dark, blueprint and glass looks; only the light look is exercised.
- Firefox and Safari; Chrome only.
- The live loop as a video; sampled frames at 800–24,000 ms and the 1,501-frame
  deterministic run cover the script and seam, not a continuous recording.
- Screen-reader behavior of the faux controls; the components are illustrative
  surfaces, not application widgets.
