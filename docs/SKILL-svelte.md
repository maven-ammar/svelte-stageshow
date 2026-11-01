# Stageshow for Svelte

The design skill for framed faux product UI — a believable interface, cropped with intent, as
one still or a short scripted demo — with the kit written in Svelte 5.

Read this first. It is the React skill upstream (`docs/upstream-SKILL-react.md`, MIT, Benji
Taylor) with the same idea and the same rules; only the code is Svelte. Where the two differ,
this file wins and says so.

## The idea

Faux UI fails in five ways: a screenshot in a box, a composition with no idea, decoration
standing in for meaning, fake chrome around a thing that is not a window, and motion that is
load-bearing. The rules exist to catch those five. Everything below serves one claim: this is a
real product, seen at the moment that matters.

## Install

```sh
pnpm add svelte-stageshow
```

```svelte
<script lang="ts">
  import { Stage, Window, Text, Row } from 'svelte-stageshow'
  import 'svelte-stageshow/style.css'
</script>

<Stage width={720} height={340} theme="light" palette="accent">
  <Window url="acme — invoices">
    <!-- your product's real interface, built from the kit's parts -->
  </Window>
</Stage>
```

The whole kit is ported: Stage, Window, Phone (with LockScreen and Notification), Bar, Text,
Row, Avatar, Chip, Cursor, Keyboard, Thread, Receipt, Stamp, the 13 motion primitives, the 10
parts, the 6 controls, the chart/code/messages/prompt modules, 35 brand marks and four looks.
`docs/port-status.md` lists every component and its state.

## What differs from the React kit, and why

| React | Svelte | Why |
| --- | --- | --- |
| `import { Stage } from './kit'` | `import { Stage } from 'svelte-stageshow'` | the kit is a package here, not a folder you copy |
| `onClick`, `onEnter` props | `onclick`, `onenter` — callbacks are plain props | Svelte 5 uses callback props, not synthetic events |
| `<Text size={9} mono>SERIAL</Text>` | `<Text style="font-family:var(--ss-mono);font-size:9px">SERIAL</Text>` | `Text` takes children and has no `size`/`mono` prop; the look owns type scale, `style` owns exceptions |
| `<Bar tone="faint">` | `<Bar tone={2}>` | `tone` is 1–5, a number, all through the kit |
| children as `props.children` | children as a snippet, implicit in markup | Svelte 5 |
| `useEffect` scene setup | `$effect`, or `script` on `Stage` | runes |
| `forwardRef` | `bind:this` | Svelte |

`docs/api-map.json` is the prop-by-prop comparison: 72 props checked, none missing, every name
kept unless a row above says otherwise.

## The seven steps, unchanged

1. **Pick the moment.** One interaction, one state, one claim. Write it in a sentence before
   any markup: "a merchant marks an invoice paid and the total updates".
2. **Choose the frame.** A window, a phone, a card or a satellite — and only one of them may be
   the hero. A card stays a card; faking browser chrome around a card is one of the five
   failures.
3. **Compose.** One gutter, one inset, a crop that cuts something on purpose. `references/`
   has the framing rules per shape: overlap, stacked cards, opposite corners, bento.
4. **Build from the kit.** Parts for the hard geometry (bars, rows, avatars, chips, keyboards),
   your own markup for the product's real content.
5. **Write real words where they carry meaning.** The fidelity scale is honest: `minimal` is
   all bars, `standard` is words where they matter, `realistic` is real content everywhere. A
   card that says nothing but grey bars has said nothing.
6. **Motion that is not load-bearing.** If the animation stopped halfway, the picture must
   still make sense. Honour reduced motion: `Stage` holds the poster and stops the script.
7. **Film it and look.** `film.mjs` from the upstream skill works unchanged against a capture
   route; the port's gallery serves `?capture=<scene>` with a `#example` wrapper and an
   `.ss-fit` stage, so a still or a contact sheet is one command.

## The parts that do the hard work

- **Stage** — design size, scale to fit, look (theme, palette, fidelity), the scene state, and
  the `script` that drives it. In Svelte the script receives an `Act`: `set`, `wait`, `move`,
  `click`, `type`, `scroll`, `key`, `mark`.
- **Window** — title bar, lights, url pill, an edge fade for content that continues.
- **Phone** — device frame, plus LockScreen and Notification for lock-screen studies.
- **Keyboard** — a real key grid with modifiers; use it, never draw one by hand.
- **Text / Bar / Row / Avatar / Chip** — the small parts that make a fake read as real.
- **Motion** — Collapse, Roll, Swap, Count, Connector, Fly, Follow, Popover, Scroll, Camera,
  Expand, States, Stream. Each one solves a specific transition; reach for the named one rather
  than animating raw CSS.

## Small formats: a second composition, not a squeeze

At 358–390 the card is not the wide card scaled down. Redesign it: move the claim, change what
is cropped, drop the satellite, let one element run off the edge.

The one hard rule: **a crop has to still read as the thing it is.** A keyboard cropped to two
rows of keys stops being a keyboard and becomes a pattern of rectangles; a window cropped to its
title bar stops being a window. Cut where the form is still unmistakable — the top row plus one
row, a window with its whole title bar and one line of content — and let the cut fall on
something the eye completes.

Worked example from a real attempt: at 390 the wide composition (claim, then a full keyboard)
was cropped to the claim plus two keyboard rows. It scored well and read badly — the keys were
no longer a keyboard. The fix is to lead with the object at that width: keep five keys and the
space bar, crop the rest off the right edge, and let the claim sit under it. One object, still
recognisable, one claim.

## Verification, and the trap

Film the reference **in the same run** as your own capture. A reference filmed before a rebuild
is not valid: three wrong verdicts in one night came from comparing against stale captures, and
one scene's whole 20-point swing was a mark landing before or after a selection animation.

Score at a **settled mark**, not at the last mark in a script: a mid-transition frame compared
between two runs measures timing, not fidelity. `docs/marks.md` records the score mark per
scene for exactly this reason.

## House style

The kit gives geometry and behaviour, not a brand. Map the host product's tokens onto the kit's
CSS custom properties (`--ss-*`) so the illustration sits beside the real product without
looking borrowed. For shiromedia that means paper `#f4f1e6`, ink `#14120f`, one orange accent
`#e8622a`, condensed display for claims and mono for machine labels.

## Where to read next

- `references/framing.md` — how a surface sits in its space, per shape.
- `references/craft.md` — the judgement calls: contrast, weight, what earns its place.
- `references/kit.md` — every part's props.
- `references/verify.md` — how to film and what to look for.
- `docs/upstream-SKILL-react.md` — the original, for anything this file does not restate.
