import { readFileSync, existsSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

// The gate scores one frame per animated scene: the stable payoff where the
// scene is designed to rest. `why` is only interesting when that is not the
// last mark in script order — the last mark is often the reverse move (undo,
// back, close, refresh) that starts the loop again.
const SCORE = {
  'ai-cards': ['done', 'last mark'],
  'ai-chat': ['sources', 'last mark'],
  annotations: ['done', 'last mark'],
  calendar: ['undo', 'last mark'],
  'chart-scrub': ['leave', 'last mark'],
  choreography: ['canada', 'last mark'],
  'close-up': ['click', 'last mark'],
  controls: ['exit', 'last mark'],
  'dark-hero': ['ready', 'last mark'],
  'dynamic-island': ['end', 'last mark'],
  excel: ['formula', 'the formula readout is the settled total; undo is the loop reset'],
  figma: ['done', 'done holds the applied colour; undo is the loop reset'],
  finder: ['drop', 'drop holds the moved file; undo returns it'],
  'finder-glass': ['open', 'open holds the Quick Look photo; back is the folder reset'],
  'form-error': ['send', 'last mark'],
  gmail: ['archive', 'archive holds the toast and next row; undo restores the email'],
  'google-calendar': ['save', 'save holds the settled event; undo removes it'],
  'google-docs': ['post', 'the posted comment is the stable thread; reply is still arriving and resolve is the reset'],
  imessage: ['done', 'last mark'],
  'kit-extras': ['expand', 'expand holds the open card; exit resets the sheet'],
  linear: ['undo', 'last mark'],
  loading: ['resolve', 'resolve holds the loaded page; refresh restarts the load'],
  notion: ['done', 'last mark'],
  'panel-annotation': ['link', 'last mark'],
  parts: ['menu', 'menu holds the note; exit resets the sheet'],
  'payout-flow': ['send', 'last mark'],
  'phone-touch': ['pause', 'pause freezes the running workout; close hides the card'],
  powerpoint: ['designer', 'designer holds the suggestions pane; pick and undo are mid-morph'],
  presence: ['reset', 'last mark'],
  raycast: ['down', 'down holds the selected Ship result; back is the Esc close'],
  reorder: ['drop', 'last mark'],
  share: ['invite', 'invite holds the added person; close is the reset'],
  slack: ['done', 'last mark'],
  spotify: ['progress', 'progress holds the player and its handle; back restarts the opening song'],
  story: ['tier', 'tier is the graduated plan and the poster; exit is the reset fade'],
  subscriptions: ['scene', 'last mark'],
  swipe: ['done', 'last mark'],
  'table-edit': ['commit', 'last mark'],
  telegram: ['done', 'last mark'],
  upload: ['done', 'done holds the uploaded row; undo removes it'],
  wikipedia: ['lake', 'lake holds the Kawaguchi article; back returns to Fuji'],
  'window-row': ['ready', 'last mark'],
}

const examples = 'D:/AMMAR BACKUP 14-4-25/Ammar/personal-assistant/.agents/skills/stageshow/examples'
const rows = []
for (const slug of readdirSync(examples)) {
  const upstream = join(examples, slug, 'index.tsx')
  if (!existsSync(upstream)) continue
  const u = [...readFileSync(upstream, 'utf8').matchAll(/\.mark\(\s*['"]([^'"]+)/g)].map((m) => m[1])
  const portPath = `apps/web/src/scenes/${slug}.svelte`
  const s = existsSync(portPath) ? readFileSync(portPath, 'utf8') : ''
  const p = [...s.matchAll(/\.mark\(\s*['"]([^'"]+)/g)].map((m) => m[1])
  const pick = SCORE[slug]
  if (u.length && !pick) throw new Error(`no score mark for animated scene ${slug}`)
  if (pick && !u.includes(pick[0])) throw new Error(`${slug}: score mark ${pick[0]} is not an upstream mark`)
  rows.push({ slug, upstream: u, port: p, score: pick })
}
const animated = rows.filter((r) => r.upstream.length)
const changed = animated.filter((r) => r.score[0] !== r.upstream[r.upstream.length - 1])
const lines = [
  '# Act marks by scene',
  '',
  'Marks are set with `act.mark(name)`; the Stage carries `data-mark="name"`,',
  'which is what the skill `film.mjs --at name` waits for. Values are exact',
  'script order. `—` means a still, or an animated upstream script with no marks.',
  '',
  '`score mark` is the frame the acceptance gate scores: the stable payoff where',
  'the scene is designed to rest, not a mark that starts a transition or a',
  'reverse move. `why` explains a choice that is not the last mark; `last mark`',
  'means the final mark is already the payoff. The four specimen sheets',
  '(`annotations`, `controls`, `kit-extras`, `parts`) are included, so this is',
  `${animated.length} marked rows: ${animated.length - 4} example animations and 4 sheets.`,
  '',
  '| scene | upstream marks | port marks | same | score mark | why |',
  '| --- | --- | --- | --- | --- | --- |',
  ...rows.map((r) => {
    const [mark, why] = r.score ?? ['—', 'still']
    return `| ${r.slug} | ${r.upstream.join(', ') || '—'} | ${r.port.join(', ') || '—'} | ${
      r.upstream.join(',') === r.port.join(',') ? 'yes' : '**no**'
    } | ${mark} | ${why} |`
  }),
]
writeFileSync('docs/marks.md', `${lines.join('\n')}\n`)
console.log(
  `${rows.length} scenes, ${rows.filter((r) => r.upstream.join(',') !== r.port.join(',')).length} mismatched, ` +
    `${animated.length} scored, ${changed.length} score marks before the last`,
)

