# Act marks by scene

Marks are set with `act.mark(name)`; the Stage carries `data-mark="name"`,
which is what the skill `film.mjs --at name` waits for. Values are exact
script order. `—` means a still, or an animated upstream script with no marks.

| scene | upstream marks | port marks | same |
| --- | --- | --- | --- |
| ai-cards | day, search, flights, pick, book, done | day, search, flights, pick, book, done | yes |
| ai-chat | type, send, stream, sources | type, send, stream, sources | yes |
| annotations | start, callout, clear, done, start, resize, restore, done, start, request, reply, acknowledged, clear, done, start, arrange, restore, clear, done, start, upload, spine, branches, ready, clear, done, start, connected, live, done | start, callout, clear, done, start, resize, restore, done, start, request, reply, acknowledged, clear, done, start, arrange, restore, clear, done, start, upload, spine, branches, ready, clear, done, start, connected, live, done, start, collect, post, invoice, done, start, link, detail, leader, explanation, clear, done | **no** |
| backgrounds | — | — | yes |
| bento | — | — | yes |
| brand-marks | — | — | yes |
| calendar | drag, check, undo | drag, check, undo | yes |
| chart-scrub | hover, scrub, leave | hover, scrub, leave | yes |
| choreography | germany, canada | germany, canada | yes |
| chrome | — | — | yes |
| close-up | click | click | yes |
| controls | field, controls, code, slot, scroll, camera, exit | field, controls, code, slot, scroll, camera, exit | yes |
| corner-chip | — | — | yes |
| cursor-morph | — | — | yes |
| cursor-resize | — | — | yes |
| cursors | — | — | yes |
| dark-bento | — | — | yes |
| dark-hero | deploy, ready | deploy, ready | yes |
| device-pair | — | — | yes |
| dynamic-island | press, open, fold, timer, merge, end | press, open, fold, timer, merge, end | yes |
| excel | autosum, formula, undo | autosum, formula, undo | yes |
| fade-crop | — | — | yes |
| figma | select, fill, drag, done, undo | select, fill, drag, done, undo | yes |
| finder | select, open, close, drag, drop, undo | select, open, close, drag, drop, undo | yes |
| finder-glass | folder, file, open, close, back | folder, file, open, close, back | yes |
| form-error | type, error, fix, send | type, error, fix, send | yes |
| freeform-drag | — | — | yes |
| glass | — | — | yes |
| gmail | hover, archive, undo | hover, archive, undo | yes |
| google-calendar | drag, popup, save, undo | drag, popup, save, undo | yes |
| google-docs | start, select, compose, post, reply, resolve | start, select, compose, post, reply, resolve | yes |
| hero-demo | — | — | yes |
| hero-grid | — | — | yes |
| imessage | type, send, typing, done | type, send, typing, done | yes |
| kit-extras | chip, swap, rings, meter, menu, expand, exit | chip, swap, rings, meter, menu, expand, exit | yes |
| linear | focus, open, type, pick, result, undo | focus, open, type, pick, result, undo | yes |
| loading | resolve, refresh | resolve, refresh | yes |
| looks | — | — | yes |
| many-of-one | — | — | yes |
| messages | — | — | yes |
| monochrome | — | — | yes |
| notion | slash, pick, tick, done | slash, pick, tick, done | yes |
| opposite-corners | — | — | yes |
| overlap | — | — | yes |
| panel-annotation | pick, link | pick, link | yes |
| parts | states, stream, connector, menu, exit | states, stream, connector, menu, exit | yes |
| payout-flow | reveal, move, send | reveal, move, send | yes |
| phone-touch | tap, start, pause, close | tap, start, pause, close | yes |
| phones | — | — | yes |
| powerpoint | open, designer, pick, undo | open, designer, pick, undo | yes |
| presence | maya, jon, reset | maya, jon, reset | yes |
| raycast | type, open, down, back | type, open, down, back | yes |
| reorder | grab, drop | grab, drop | yes |
| ruled-bento | — | — | yes |
| share | open, type, role, invite, close | open, type, role, invite, close | yes |
| slack | hover, react, thread, send, exit, done | hover, react, thread, send, exit, done | yes |
| spotify | play, progress, back | play, progress, back | yes |
| stacked-cards | — | — | yes |
| staggered-bento | — | — | yes |
| static-card | — | — | yes |
| story | reveal, live, tier, exit | reveal, live, tier, exit | yes |
| subscriptions | first, second, scene | first, second, scene | yes |
| swipe | swipe, throw, close, done | swipe, throw, close, done | yes |
| table-edit | open, type, commit | open, type, commit | yes |
| telegram | type, send, read, reply, done | type, send, read, reply, done | yes |
| tilted-stack | — | — | yes |
| upload | grab, drag, drop, done, undo | grab, drag, drop, done, undo | yes |
| wikipedia | search, refine, pick, lake, back | search, refine, pick, lake, back | yes |
| window-row | ready | ready | yes |
