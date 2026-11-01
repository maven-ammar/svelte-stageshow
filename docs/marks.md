# Act marks by scene

Marks are set with `act.mark(name)`; the Stage carries `data-mark="name"`,
which is what the skill `film.mjs --at name` waits for. Values are exact
script order. `—` means a still, or an animated upstream script with no marks.

`score mark` is the frame the acceptance gate scores: the stable payoff where
the scene is designed to rest, not a mark that starts a transition or a
reverse move. `why` explains a choice that is not the last mark; `last mark`
means the final mark is already the payoff. The four specimen sheets
(`annotations`, `controls`, `kit-extras`, `parts`) are included, so this is
43 marked rows: 39 example animations and 4 sheets.

| scene | upstream marks | port marks | same | score mark | why |
| --- | --- | --- | --- | --- | --- |
| ai-cards | day, search, flights, pick, book, done | day, search, flights, pick, book, done | yes | done | last mark |
| ai-chat | type, send, stream, sources | type, send, stream, sources | yes | sources | last mark |
| annotations | start, callout, clear, done, start, resize, restore, done, start, request, reply, acknowledged, clear, done, start, arrange, restore, clear, done, start, upload, spine, branches, ready, clear, done, start, connected, live, done | start, callout, clear, done, start, resize, restore, done, start, request, reply, acknowledged, clear, done, start, arrange, restore, clear, done, start, upload, spine, branches, ready, clear, done, start, connected, live, done, start, collect, post, invoice, done, start, link, detail, leader, explanation, clear, done | **no** | done | last mark |
| backgrounds | — | — | yes | — | still |
| bento | — | — | yes | — | still |
| brand-marks | — | — | yes | — | still |
| calendar | drag, check, undo | drag, check, undo | yes | undo | last mark |
| chart-scrub | hover, scrub, leave | hover, scrub, leave | yes | leave | last mark |
| choreography | germany, canada | germany, canada | yes | canada | last mark |
| chrome | — | — | yes | — | still |
| close-up | click | click | yes | click | last mark |
| controls | field, controls, code, slot, scroll, camera, exit | field, controls, code, slot, scroll, camera, exit | yes | exit | last mark |
| corner-chip | — | — | yes | — | still |
| cursor-morph | — | — | yes | — | still |
| cursor-resize | — | — | yes | — | still |
| cursors | — | — | yes | — | still |
| dark-bento | — | — | yes | — | still |
| dark-hero | deploy, ready | deploy, ready | yes | ready | last mark |
| device-pair | — | — | yes | — | still |
| dynamic-island | press, open, fold, timer, merge, end, settled | press, open, fold, timer, merge, end, settled | yes | settled | the idle pill after the spring settles; end catches the shrink |
| excel | autosum, formula, undo | autosum, formula, undo | yes | formula | the formula readout is the settled total; undo is the loop reset |
| fade-crop | — | — | yes | — | still |
| figma | select, fill, drag, done, undo | select, fill, drag, done, undo | yes | done | done holds the applied colour; undo is the loop reset |
| finder | select, open, close, drag, drop, undo | select, open, close, drag, drop, undo | yes | drop | drop holds the moved file; undo returns it |
| finder-glass | folder, file, open, close, back | folder, file, open, close, back | yes | open | open holds the Quick Look photo; back is the folder reset |
| form-error | type, error, fix, send | type, error, fix, send | yes | send | last mark |
| freeform-drag | — | — | yes | — | still |
| glass | — | — | yes | — | still |
| gmail | hover, archive, undo | hover, archive, undo | yes | archive | archive holds the toast and next row; undo restores the email |
| google-calendar | drag, popup, save, undo | drag, popup, save, undo | yes | save | save holds the settled event; undo removes it |
| google-docs | start, select, compose, post, reply, resolve | start, select, compose, post, reply, resolve | yes | post | the posted comment is the stable thread; reply is still arriving and resolve is the reset |
| hero-demo | — | — | yes | — | still |
| hero-grid | — | — | yes | — | still |
| imessage | type, send, typing, done | type, send, typing, done | yes | done | last mark |
| kit-extras | chip, swap, rings, meter, menu, expand, exit | chip, swap, rings, meter, menu, expand, exit | yes | expand | expand holds the open card; exit resets the sheet |
| linear | focus, open, type, pick, result, undo | focus, open, type, pick, result, undo | yes | undo | last mark |
| loading | resolve, refresh | resolve, refresh | yes | resolve | resolve holds the loaded page; refresh restarts the load |
| looks | — | — | yes | — | still |
| many-of-one | — | — | yes | — | still |
| messages | — | — | yes | — | still |
| monochrome | — | — | yes | — | still |
| notion | slash, pick, tick, done | slash, pick, tick, done | yes | done | last mark |
| opposite-corners | — | — | yes | — | still |
| overlap | — | — | yes | — | still |
| panel-annotation | pick, link | pick, link | yes | link | last mark |
| parts | states, stream, connector, menu, exit | states, stream, connector, menu, exit | yes | menu | menu holds the note; exit resets the sheet |
| payout-flow | reveal, move, send | reveal, move, send | yes | send | last mark |
| phone-touch | tap, start, pause, close | tap, start, pause, close | yes | pause | pause freezes the running workout; close hides the card |
| phones | — | — | yes | — | still |
| powerpoint | open, designer, pick, undo | open, designer, pick, undo | yes | designer | designer holds the suggestions pane; pick and undo are mid-morph |
| presence | maya, jon, reset | maya, jon, reset | yes | reset | last mark |
| raycast | type, open, down, settled, back | type, open, down, settled, back | yes | settled | the selection after the down key; down lands before or after it |
| reorder | grab, drop | grab, drop | yes | drop | last mark |
| ruled-bento | — | — | yes | — | still |
| share | open, type, role, invite, close | open, type, role, invite, close | yes | invite | invite holds the added person; close is the reset |
| slack | hover, react, thread, send, exit, done | hover, react, thread, send, exit, done | yes | done | last mark |
| spotify | play, progress, back | play, progress, back | yes | progress | progress holds the player and its handle; back restarts the opening song |
| stacked-cards | settled | settled | yes | settled | only mark; fires after the bars settle, so a still cannot catch the stagger |
| staggered-bento | — | — | yes | — | still |
| static-card | — | — | yes | — | still |
| story | reveal, live, tier, exit | reveal, live, tier, exit | yes | tier | tier is the graduated plan and the poster; exit is the reset fade |
| subscriptions | first, second, scene, settled | first, second, scene, settled | yes | settled | the second checkout after its payment lands; scene is the crossfade start |
| swipe | swipe, throw, close, done | swipe, throw, close, done | yes | done | last mark |
| table-edit | open, type, commit | open, type, commit | yes | commit | last mark |
| telegram | type, send, read, reply, done | type, send, read, reply, done | yes | done | last mark |
| tilted-stack | — | — | yes | — | still |
| upload | grab, drag, drop, done, undo | grab, drag, drop, done, undo | yes | done | done holds the uploaded row; undo removes it |
| wikipedia | search, refine, pick, lake, settled, back | search, refine, pick, lake, settled, back | yes | settled | the lake article after its rise settles; lake catches the page transition |
| window-row | ready | ready | yes | ready | last mark |
