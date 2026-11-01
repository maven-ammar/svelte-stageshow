# svelte-stageshow

Svelte 5 port of **Stageshow**, Benji Taylor's MIT kit for framed faux product
UI: a believable interface, cropped with intent, as one still or a short
scripted demo.

- **Components:** Stage, Window, Bar, Text, Row, Phone, plus Avatar and Chip.
- **Style:** one importable stylesheet, plain CSS custom properties, no SCSS,
  no React, no icon dependency.
- **Runtime:** an Act scheduler with `set`, `wait`, `move`, `click`, `type`,
  `snap`, `stagger`, `mark`, `drag`, `scroll` and `enter`.
- **Determinism:** `runFrames(n)` runs the same script on a virtual 60fps clock
  and returns one SHA-256 per rendered frame. 1,501 frames match within a run
  and across page loads.
- **Gold parity:** filmed at 900 CSS px with the skill's `#example` method and
  measured with ffmpeg PSNR: static card **∞ dB** (pixel-identical), hero demo
  **42.51 dB** (text anti-aliasing only). Target was 30 dB.

Version **0.2.0**. Intended private repository (local commit only so far):
`maven-ammar/svelte-stageshow`. The npm name is reserved for release; install
from the packed tarball or the workspace until then.

## Install

```sh
pnpm add svelte-stageshow
```

```svelte
<script lang="ts">
  import { Avatar, Row, Stage, Window } from 'svelte-stageshow'
  import 'svelte-stageshow/style.css'
</script>

<Stage width={640} height={320} className="my-stage">
  {#snippet children(state, rect, layout)}
    <Window title="Customers" className="my-window">
      <div class="my-body">
        <Row selected title="Polaris Studio" subtitle="Scale · 24 seats">
          {#snippet lead()}<Avatar name="Polaris Studio" size={30} tone="accent" />{/snippet}
          {#snippet meta()}$12,400.00{/snippet}
        </Row>
      </div>
    </Window>
  {/snippet}
</Stage>

<style>
  :global(.my-stage .ss-stage) { background: #e8e5df; border-radius: 14px; overflow: hidden; }
  :global(.my-window) { position: absolute; left: 90px; top: 24px; width: 700px; height: 420px; box-shadow: var(--ss-shadow-hero); }
  :global(.my-body) { padding: 16px; }
</style>
```

The Stage puts `className` on the outer `.ss-fit`; the scene's own CSS goes
under `.ss-stage`. The stage is the shot: give it a ground and let the window
bleed, rather than wrapping it in another card.

## The Act

`script` is a function given an `Act`. A typical beat:

```svelte
<Stage
  width={720}
  height={340}
  initial={{ open: false, typed: '' }}
  poster={{ open: true, typed: 'Which accounts churned in March?' }}
  script={async (a) => {
    a.mark('ask')
    await a.move('ask', { duration: 520 })
    await a.click('ask')
    await a.set({ open: true })
    await a.wait(180)
    await a.move({ at: 'field', x: 0.9, y: 0.55 })
    await a.type('typed', 'Which accounts churned in March?', { interval: 36 })
    await a.wait(700)
  }}
  cursor={{ at: { wide: { x: 410, y: 94 }, compact: { x: 210, y: 80 } }, idle: false }}
>
  {#snippet children(state, rect, layout)}
    <!-- render from state; put data-target="ask" on the trigger -->
  {/snippet}
</Stage>
```

Implemented: `set`, `put`, `wait`, `rect`, `center`, `caret`, `move`, `click`,
`scroll`, `cursor`, `snap`, `stagger`, `mark`, `type`, `drag`, `place`,
`enter`, `signal`, `layout`. `key` keeps its timing (320ms) but keycaps are not
ported yet. `drag` is a carried press with `onMove`; it does not yet close the
hand into the grab cursor the way the React kit does.

## Deterministic stepping

Set `deterministic` and call `runFrames()` from a component ref:

```svelte
<Stage bind:this={stage} {script} {initial} deterministic ... />
```

```ts
const hashes = await stage.runFrames(600) // frames 0..600
```

Each frame advances a `VirtualClock` by exactly 1/60s, runs due timers before
requestAnimationFrame callbacks, flushes Svelte, then hashes a canonical DOM
clone with attributes sorted. CSS transitions and animations are off through
`data-still`; a frame is a settled state, not a film of a transition.

The gate:

```sh
node scripts/determinism.mjs "http://127.0.0.1:4173/?test=determinism"
# frames=1501 withinRun=true acrossLoads=true first=9ede2ba1… last=c1b98270… pass=true
```

This is the guarantee: a script and frame index render the same DOM every run,
including across reloads. Live playback uses real time and CSS transitions and
is not part of that frame contract.

## What is ported

| Area | State |
|---|---|
| `Stage` | fit and scale, `compact`, look context, tokens, accent, ground orbs, cursor rest, target rects, hover stills, `play` loop/once/hover, visibility, deterministic `runFrames` |
| `Window` | browser, app, sidebar app, tabs, terminal, glass, card, hairline, receded, lights, tall bar |
| `Bar`, `Text` | tones 1–5, shrink, fidelity-aware text, filler bars, measuring fallback |
| `Row` | lead, title, subtitle, meta, preview, unread, selected, pad, trailing children |
| `Phone` | pro, photo fallback, bezel, silver, clay, soft, bare, outline, android, status bar, island, home indicator |
| `Avatar`, `Chip` | initials/person/accent/ink/ios/plain, remove callback |
| `Cursor` | pointer, I-beam, hand, wait, crosshair, resize-ns/ew/nwse/nesw; open/grab share the hand glyph |
| CSS | tokens, light/dark/blueprint/glass looks, mono palette, stage, window, phone, cursor, keycaps, edge fades, Row/Avatar/Chip |
| Act | listed above |

Not ported, and deliberately absent from the exports:

- Motion parts: `Collapse`, `Fly`, `Connector`, `Count`, `Roll`, `Swap`,
  `Follow`, `States`, `Stream`, `Popover`, `Camera`, `Scroll`, `Expand`.
- Controls: `Field`, `Segmented`, `Toggle`, `Tabs`, `Badge`, `Slot`.
- Messages: `Thread`, `Bubble`, `Stamp`, `Receipt`; `Keyboard`, `LockScreen`,
  `Notification`.
- Small parts: `Icon` and the icon set, `Check`, `Spinner`, `Meter`, `Menu`,
  `Facepile`, `BrandMark`, `Pin`, `Tooltip`, `Code`, `Chart`.
- Keycap rows; cursor style morphing between kinds; `drag`'s grab cursor.

These are a scope decision for this milestone, not a missing source: the
public kit contains them in the ignored `reference/` checkout and they can be
ported in a later pass. The next section records how the source was recovered.

## Prop mapping

The React kit's prop names are preserved: **72 checked, 0 missing**
(`node scripts/api-map.mjs`). The frozen React list is in
`docs/react-api.json`; the generated table is `docs/api-map.json`.

| Component | Props (same names) | Svelte type / behavior |
|---|---|---|
| `Stage` | width, height, initial, script, poster, cursor, play, compact, keys, hover, theme, palette, fidelity, greys, tokens, fill, accent, ground, speed, className, specimen, unframed, children | `children` is a snippet with the same `(state, rect, layout)` signature; adds `deterministic` and `class` |
| `Window` | url, urlShape, tabs, nav, title, sidebar, sidebarWidth, sidebarStyle, toolbar, lead, body, receded, chrome, lights, lightsSize, barSize, children, className | node slots are snippets; `url` is `string \| Snippet`; `body` is an attribute object; adds `class` |
| `Bar` | w, h, tone, r, shrink, className | `style` is a CSS string; adds `class` |
| `Text` | children, filler, w, h, tone, wrap, className | `children` is a snippet; adds `class` |
| `Phone` | width, frame, time, island, status, dark, wallpaper, className, children | `children` is a snippet; adds `class` |
| `Row` | lead, title, subtitle, meta, preview, unread, selected, pad, children | ported from the public gold kit; node slots are snippets; adds `className` and `class` |

Every component also accepts Svelte's `class` attribute, merged after
`className`. `style` on Bar/Text/Avatar/Phone is a string, as Svelte expects.

## Diff from React

| React | Svelte 5 port | Why |
|---|---|---|
| `children: (state, rect, layout) => ReactNode` | `children: Snippet<[S, rect, layout]>` | Svelte's render prop; same three arguments |
| `ReactNode` slots (`sidebar`, `toolbar`, `lead`, `url`, tabs) | `Snippet` (or `string` where a string is enough) | Svelte idiom; prop names kept |
| `useLook()` context | `getLook()` from Svelte context, backed by getters over runes | Same `theme`, `palette`, `fidelity`, `layout` values |
| `style={{ ... }}` objects | `style="..."` strings | Svelte writes CSS strings |
| `flushSync` inside drag/selection | state updates + `tick()`; no synchronous render | Svelte batches; the deterministic driver flushes each frame |
| Component CSS imports | one `svelte-stageshow/style.css` built from `style/*.css` | One importable file; no SCSS |
| `stageshow.css` all-in-one | same tokens, looks, stage/window/phone/cursor; Row/Avatar/Chip CSS copied from the kit | One importable file; no SCSS |
| React events (e.g. Chip remove) | callback props (`onRemove`) | Brief's rule for Svelte ports |
| Keycap rows from `act.key` | `key` resolves after 320ms, no keycaps | Keycap UI is not ported; script timing is preserved |
| Cursor glyph morphing | one active glyph per kind; open/grab share the hand | Simplified cursor layer |
| Gold example sources | both scenes ported from `benjitaylor/skills`; stills filmed from the same source | Same content, dimensions and 1× DOM geometry |
| React, react-dom, lucide-react | none; `svelte` is the only peer | No React at consumer level |

The class names, DOM structure and CSS custom properties are kept, so a demo's
own unlayered CSS still wins over the kit's `@layer stageshow` styles.

## Source recovery

The local copy of the skill this port started from was incomplete: 28 kit root
files, 0 files in `kit/parts`, `kit/motion`, `kit/controls`, `kit/brands`, 0
across all 69 `examples/` folders (including `static-card` and `hero-demo`), 0
gold images, and 14 of 15 references.

The complete source is public in **`benjitaylor/skills`** (MIT), under
`stageshow/`. It was cloned into an ignored `reference/` folder inside this
project, its React playground was installed there, and the gold stills were
filmed from it at the same sizes as the port. The actual `Row`, `Avatar`,
`Chip`, `Row.css`, `Avatar.css`, `Chip.css` and both scene sources were then
ported directly. The first pass, built from the written reference while the
public source was not yet found, was replaced.

Nothing in `reference/` is committed or shipped. It is a local-only copy used
to film the gold stills and read the source; `shots/` keeps the resulting
stills. There is no remaining source gap for the ported scope. The motion
parts, controls, messages and other small parts are still not ported — that is
scope, not missing source.

### Gold parity

Filmed at 900 CSS px with the skill's method — `film.mjs --select '#example'
--still`, deviceScaleFactor 2 — then compared with `ffmpeg -lavfi psnr`:

| Scene | Capture | PSNR | Result |
|---|---|---|---|
| Static card | 900 × 316 (stage 400 × 300 + 16px below) | **∞ dB** | pixel-identical |
| Hero demo | 900 × 356 (stage 720 × 340 + 16px below) | **42.51 dB** | pass; residual is terminal-text anti-aliasing |

The supplied hero reference is the **opening frame** (toolbar closed, markers 1
and 2, no terminal), not the terminal poster. The port's `still` mode renders
that same frame; the live Act loop and poster are separate. The target was
30 dB; `node scripts/psnr.mjs` reproduces the two numbers and writes
`shots/psnr.json`. Design-size stills at 400/358 and 720/358 are kept in
`shots/port-*` for component geometry. See `shots/parity-sheet.png` and
`REHEARSAL.md`.

## Verify

```sh
pnpm install
pnpm check          # 0 errors, 0 warnings (package + gallery)
pnpm build          # svelte-package + gallery
pnpm dev            # gallery at http://127.0.0.1:5173
pnpm build && pnpm --filter web preview   # capture server at 4173

# gold gate: film the port at 900 CSS px with the skill's #example method,
# then compare against the supplied reference stills
node scripts/film.mjs "http://127.0.0.1:4173/?capture=static-card" --out shots/example-static.png --size 900x400 --select '#example' --still
node scripts/film.mjs "http://127.0.0.1:4173/?capture=hero-demo" --out shots/example-hero.png --size 900x400 --select '#example' --still
node scripts/psnr.mjs                              # ∞ dB / 42.51 dB

# design-size stills (component geometry)
node scripts/film.mjs "http://127.0.0.1:4173/?capture=static-card&w=400" --out shots/port-static-400.png --size 400x300
node scripts/film.mjs "http://127.0.0.1:4173/?capture=static-card&w=358" --out shots/port-static-358.png --size 358x300
node scripts/film.mjs "http://127.0.0.1:4173/?capture=hero-demo&w=720" --out shots/port-hero-720.png --size 720x340
node scripts/film.mjs "http://127.0.0.1:4173/?capture=hero-demo&w=358" --out shots/port-hero-358.png --size 358x400

node scripts/measure.mjs "http://127.0.0.1:4173"   # geometry and strings
node scripts/api-map.mjs                           # 72/72 prop names
node scripts/determinism.mjs "http://127.0.0.1:4173/?test=determinism"
node scripts/parity-sheet.mjs                      # shots/parity-sheet.png
```

The consumer test used a throwaway SvelteKit app, installed the packed
0.2.0 tarball (62,871 bytes), rendered Stage + Window + Row + Avatar + Bar and
built it with `@sveltejs/adapter-static`; exit 0. No devDependency was needed
at runtime. The tarball's `dist/stageshow.css` has no `@import`s.

## Repository layout

```
packages/svelte-stageshow/   the library (src/lib, style, dist)
apps/web/                    the gallery and capture routes
scripts/                     film, measure, api-map, determinism, parity sheet
shots/                       gold and ported stills, diffs, reports, parity sheet
docs/                        frozen React prop list, generated API map
reference/                   ignored local gold checkout used for filming
REHEARSAL.md                 the verification record and gold parity
```

## Licence

MIT. Stageshow is © 2026 Benji Taylor; see `LICENSE`. The Svelte port is by
Ammar (maven-ammar), 2026. `NOTICE.md` keeps the original notices and adds the
port attribution. Product and OS names, device geometry and app marks in any
example remain with their owners.
