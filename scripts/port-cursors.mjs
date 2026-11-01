// Extract the two large hand path sets from upstream kit/cursors.tsx so the
// Svelte glyphs are byte-for-byte the same geometry. Run once; output is
// committed under packages/svelte-stageshow/src/lib/cursors/.
import { readFileSync, writeFileSync } from 'node:fs'

const src = readFileSync('D:/AMMAR BACKUP 14-4-25/Ammar/personal-assistant/.agents/skills/stageshow/kit/cursors.tsx', 'utf8')
const section = (name, next) => src.slice(src.indexOf(`export function ${name}`), src.indexOf(`export function ${next}`))
const paths = (text) => [...text.matchAll(/ d="([^"]+)"/g)].map((m) => m[1])

const open = paths(section('MacOpenHand', 'MacGrab'))
const grab = paths(section('MacGrab', 'MacWait'))
if (open.length < 4 || grab.length < 2) throw new Error(`unexpected path counts ${open.length}/${grab.length}`)

writeFileSync(
  'packages/svelte-stageshow/src/lib/cursors/MacOpenHand.svelte',
  `<svg width="26" height="26" viewBox="0 0 32 32" fill="none" aria-hidden="true">
  <g transform="translate(7 6)">
    <path d="${open[0]}" fill="#fff" />
    <g stroke="#000" stroke-linecap="round" stroke-width=".75">
      <path d="${open[1]}" stroke-linejoin="round" />
      <path d="${open[2]}" />
      <path d="${open[3]}" />
      <path d="${open[4]}" />
    </g>
  </g>
</svg>
`,
)

writeFileSync(
  'packages/svelte-stageshow/src/lib/cursors/MacGrab.svelte',
  `<svg width="30" height="30" viewBox="0 0 32 32" fill="none" aria-hidden="true">
  <g transform="translate(8 9)">
    <path d="${grab[0]}" fill="#000" />
    <path d="${grab[1]}" fill="#fff" />
  </g>
</svg>
`,
)
console.log(`open=${open.length} grab=${grab.length}`)
