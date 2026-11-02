---
name: stageshow
description: Build faux product UI that looks like a real product, as a still illustration or an animated demo with a cursor. Browser and app windows, dashboards, phones, notifications, terminals, bento grids and cursor walkthroughs, framed, masked and cropped the way a marketing page, feature card or docs hero needs them. Use whenever someone wants a fake or mocked UI, a product demo or walkthrough animation, a hero or feature-card illustration of an app, a product shot in the style of a polished marketing site, or an animated cursor doing things in an interface, even if they never say "faux UI". Svelte 5 and plain CSS.
---

# Stageshow

Miniature product UI: a believable interface, framed in its space, as one still or a short
animation in which one thing happens. The viewer recognises the screen and sees the thing happen.

This is the Svelte 5 port of [Stageshow](https://benji.org/stageshow), Benji Taylor's MIT skill
and kit. Same idea, same rules, same five failures; only the code is Svelte.

## The one idea

**It reads as a real product, simplified to what the viewer needs, framed with intent, and every
motion has a cause.**

Faux UI fails in five ways: a screenshot in a box, a composition with no idea, decoration standing
in for meaning, fake chrome around a thing that is not a window, and motion that is load-bearing.
The rules here exist to catch those five.

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
  <Window url="acme - invoices">
    <!-- your product's real interface, built from the kit's parts -->
  </Window>
</Stage>
```

The whole kit is ported: Stage, Window, Phone (with LockScreen and Notification), Bar, Text, Row,
Avatar, Chip, Cursor, Keyboard, Thread, Receipt, Stamp, the 13 motion primitives, the 10 parts,
the 6 controls, the chart/code/messages/prompt modules, 35 brand marks and four looks.

## If you have read the React skill

Same workflow, same framing rules, same failure modes. What changes:

| React | Svelte | Why |
| --- | --- | --- |
| `import { Stage } from './kit'` | `import { Stage } from 'svelte-stageshow'` | the kit is a package here, not a folder to copy |
| `onClick`, `onEnter` props | `onclick`, `onenter` — callbacks are plain props | Svelte 5 uses callback props, not synthetic events |
| `<Text size={9} mono>SERIAL</Text>` | `<Text style="font-family:var(--ss-mono);font-size:9px">SERIAL</Text>` | `Text` takes children; the look owns type scale, `style` owns exceptions |
| `<Bar tone="faint">` | `<Bar tone={2}>` | `tone` is 1–5, a number, all through the kit |
| children as `props.children` | children as a snippet, implicit in markup | Svelte 5 |
| `useEffect` scene setup | `$effect`, or `script` on `Stage` | runes |
| `forwardRef` | `bind:this` | Svelte |

## The seven steps

1. **Pick the moment.** One interaction, one state, one claim. Write it in a sentence before any
   markup: "a merchant marks an invoice paid and the total updates".
2. **Choose the frame.** A window, a phone, a card or a satellite, and only one of them may be the
   hero. A card stays a card; faking browser chrome around a card is one of the five failures.
3. **Compose.** One gutter, one inset, a crop that cuts something on purpose. `references/framing.md`
   has the rules per shape: overlap, stacked cards, opposite corners, bento.
4. **Build from the kit.** Parts for the hard geometry (bars, rows, avatars, chips, keyboards), your
   own markup for the product's real content.
5. **Write real words where they carry meaning.** Fidelity is honest: `minimal` is all bars,
   `standard` is words where they matter, `realistic` is real content everywhere. A card that says
   nothing but grey bars has said nothing.
6. **Motion that is not load-bearing.** If the animation stopped halfway, the picture must still make
   sense. Honour reduced motion: `Stage` holds the poster and stops the script.
7. **Film it and look.** The upstream `film.mjs` works unchanged against a capture route; this port's
   gallery serves `/scenes/<slug>` and `?capture=<scene>` with a `#example` wrapper and an `.ss-fit`
   stage, so a still or a contact sheet is one command.

## The parts that do the hard work

- **Stage** — design size, scale to fit, look (theme, palette, fidelity), the scene state, and the
  `script` that drives it. The script receives an `Act`: `set`, `wait`, `move`, `click`, `type`,
  `scroll`, `key`, `mark`.
- **Window** — title bar, lights, url pill, an edge fade for content that continues.
- **Phone** — device frame, plus LockScreen and Notification for lock-screen studies.
- **Keyboard** — a real key grid with modifiers; use it, never draw one by hand.
- **Text / Bar / Row / Avatar / Chip** — the small parts that make a fake read as real.
- **Motion** — Collapse, Roll, Swap, Count, Connector, Fly, Follow, Popover, Scroll, Camera, Expand,
  States, Stream. Each solves a specific transition; reach for the named one rather than animating
  raw CSS.

## Small formats: a second composition, not a squeeze

At 358–390 the card is not the wide card scaled down. Redesign it: move the claim, change what is
cropped, drop the satellite, let one element run off the edge.

The one hard rule: **a crop has to still read as the thing it is.** A keyboard cropped to two rows of
keys stops being a keyboard and becomes a pattern of rectangles; a window cropped to its title bar
stops being a window. Cut where the form is still unmistakable and let the cut fall on something the
eye completes.

## Verification, and the trap

Film the reference **in the same run** as your own capture. A reference filmed before a rebuild is not
valid: stale captures produced three wrong verdicts in one night.

Score at a **settled mark**, not at the last mark in a script: a mid-transition frame compared between
two runs measures timing, not fidelity.

## House style

The kit gives geometry and behaviour, not a brand. Map the host product's tokens onto the kit's CSS
custom properties (`--ss-*`) so the illustration sits beside the real product without looking
borrowed.

## Where to read next

- `references/framing.md` — how a surface sits in its space, per shape.
- `references/craft.md` — the judgement calls: contrast, weight, what earns its place.
- `references/kit.md` — every part's props.
- `references/verify.md` — how to film and what to look for.
- Upstream, for anything this file does not restate: https://benji.org/stageshow
