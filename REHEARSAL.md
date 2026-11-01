# Rehearsal

Evidence for the whole-kit Svelte port. Numbers are reproducible from the
commands below; `shots/` holds the stills and reports.

## Gate summary

| Gate | Result |
| --- | --- |
| Kit components | 13 motion + 10 parts + 6 controls + 10 root/frame modules |
| Brand artwork | 35 marks, 44 SVG files, licence files retained |
| Built CSS | **138,656 bytes**, 41 sheets, one import |
| Package `svelte-check` | **0 errors, 0 warnings** |
| Gallery `svelte-check` | **0 errors, 0 warnings** |
| Gallery build | pass |
| Capture registry | **69/69 slugs**, auto-globbed from `apps/web/src/scenes/*.svelte` |
| Capture smoke | **69/69** routes render a `.ss-stage` |
| static-card | **48.3 dB** at 900 CSS px; 0.00% changed |
| hero-demo | **38.1 dB** at 900 CSS px; 0.31% changed |
| messages / imessage / opposite-corners | **39.7 / 33.1 / 49.5 dB** after the CSS-bundle fix |
| Reduced-motion ai-chat / hero | **49.7 / 36.7 dB** |
| Determinism | **1,501 frames**, equal within run and across reloads |
| Consumer tarball | **180,996 bytes**; SvelteKit build wrote **19 files** |
| Video recorder | 30 deterministic frames -> `shots/video-port-hero.mp4` |

## 1. Source

The local skill copy was incomplete; the complete MIT source is
`benjitaylor/skills`, `stageshow/`, commit `8020574` (2026-10-31), cloned into
the ignored `reference/` folder. Every component and example was read from that
source. `reference/` is not committed or shipped.

The upstream inventory actually contains 13 motion files, 10 parts, 6 controls,
the Code/Chart/Keyboard/Messages/Phone/Window modules, 35 brand marks (44 SVG
files with variants), and 69 example folders. There is no 145-SVG brand folder
in the synced source; the table records what exists.

## 2. Build and bundle

```sh
node scripts/sync-css.mjs
pnpm --filter svelte-stageshow build
pnpm --filter web build
```

`sync-css.mjs` generates the gallery's source entry from the style tree;
`svelte-package` + `build-css.mjs` concatenate the same 41 sheets into
`dist/stageshow.css` (138,656 bytes). The first full build exposed the key
failure behind the black blobs: the gallery's source entry still imported only
the original 8 core sheets, so `Collapse`, bubble surfaces, popovers and the
new parts were unstyled. Syncing all 41 sheets fixed messages/imessage/
opposite-corners without changing their markup or CSS.

## 3. Capture protocol

`/?capture=<slug>` renders only that scene under:

```html
<main id="example" class="capture-example">...</main>
```

The scene's Stage renders `.ss-fit` at its authored design size, so the skill's
900px recorder works unchanged:

```sh
node .agents/skills/stageshow/scripts/film.mjs \
  'http://127.0.0.1:4173/?capture=static-card' \
  --select '#example' --still --width 900 --out shots/port/static-card.png
```

The owner confirmed this protocol independently: static-card **48.3 dB,
0.00% changed**, and a full 69-scene sweep ran against the same registry.

## 4. Parity and the black-blob bug

The first owner sweep was 21 pass / 15 close / 33 fail. Its worst three were
messages 7.7, imessage 8.7, opposite-corners 10.6 dB; all three showed huge
black areas. They were not masks or markup omissions: the single gallery CSS
entry was stale, so the thread's `--ss-*` bubble variables and the Collapse
layout were missing. After `sync-css.mjs` and a rebuild, the same stills
measure:

| Scene | Before | After | Changed px |
| --- | --- | --- | --- |
| messages | 7.7 dB | **39.7 dB** | 0.32% |
| imessage | 8.7 dB | **33.1 dB** | 0.49% |
| opposite-corners | 10.6 dB | **49.5 dB** | 0.00% |

Full per-scene table: `shots/parity-all.md`; worst contact sheet:
`shots/sheet-worst.png`; latest stills: `shots/ref/`, `shots/port/`.

## 5. Still, reduced motion and marks

The Stage follows the React contract:

- no script, or reduced motion: hold `poster ?? initial`, run no script, set
  `data-still`;
- live motion allowed: run the script; `--still` is a recorder flag, not a
  freeze. Upstream's own reference stills are early script frames (ai-chat
  shows the typed draft, not the poster).

There is one reset per entry into the still path; this fixed the
`effect_update_depth_exceeded` loop that appeared when a scripted scene was
frozen. Reduced-motion spot checks match upstream: ai-chat **49.7 dB**, hero
**36.7 dB**.

For animated scenes the reliable comparison is a matched mark. `act.mark()`
writes `data-mark`; `film.mjs --at <mark>` waits on it. `docs/marks.md` lists
all 38 scenes with marks. All match upstream except `annotations`, whose port
deliberately folds the two `composed.tsx` studies into the same scene and
therefore exposes 12 extra marks.

## 6. Determinism and video

```sh
node scripts/determinism.mjs 'http://127.0.0.1:4173/?test=determinism'
# frames=1501 withinRun=true acrossLoads=true firstMismatch=-1
# first=9ede2ba1ef97... last=c1b98270ffd2... pass=true
```

Each frame is a `VirtualClock.advanceFrame()` step, a Svelte flush, and a
SHA-256 over an attribute-sorted DOM clone. `scripts/record.mjs` exposes the
same start/step/stop path to Playwright, screenshots each frame, and runs
ffmpeg. The 30-frame test wrote `shots/video-port-hero.mp4`; the React
counterpart is `shots/video-react-hero.mp4`.

## 7. Consumer

```sh
cd packages/svelte-stageshow && pnpm pack
# svelte-stageshow-0.2.0.tgz, 180,996 bytes
cd <throwaway-sveltekit>
pnpm add file:<absolute-tgz>
pnpm run build
# @sveltejs/adapter-static wrote 19 files, exit 0
```

The throwaway consumer preview was closed after the build; only the gallery
preview remains for this work.

## 8. Faults found

1. The gallery CSS entry was not regenerated for the new 33 sheets: fixed with
   `scripts/sync-css.mjs`; the three black-blob failures became passes.
2. Freezing a scripted Stage re-entered `resetScene` on every rect update:
   guarded with one reset per still entry.
3. `annotations` includes composed studies absent from `index.tsx`: recorded as
   extra marks, not hidden.
4. `Icon` uses raw Lucide stroke widths, not `absoluteStrokeWidth`: sub-24px
   glyphs are slightly thinner than React.
5. `Roll`/`Swap`/`Popover` snapshot outgoing text/HTML; motion effects measure
   post-paint instead of in a layout effect.
6. The `looks` source page has three identities and six studies, not a
   four-theme sheet; the port keeps the source, and the four look themes live
   in the kit CSS.

## 9. Not checked

- Firefox and Safari, deferred by the owner.
- The owner's matched-mark parity sweep after the CSS-bundle fix; the prior
  full table is in `shots/parity-all.md`.
- A continuous live-loop video for all 69 scenes; one deterministic hero
  recording is present as the recorder proof.
- The live loop's per-frame motion quality for every example; determinism,
  marks and stills cover the script state, not every CSS interpolation.
