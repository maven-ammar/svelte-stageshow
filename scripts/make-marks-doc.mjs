import { readFileSync, existsSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const examples = 'D:/AMMAR BACKUP 14-4-25/Ammar/personal-assistant/.agents/skills/stageshow/examples'
const rows = []
for (const slug of readdirSync(examples)) {
  const upstream = join(examples, slug, 'index.tsx')
  if (!existsSync(upstream)) continue
  const u = [...readFileSync(upstream, 'utf8').matchAll(/\.mark\(\s*['"]([^'"]+)/g)].map((m) => m[1])
  const portPath = `apps/web/src/scenes/${slug}.svelte`
  const s = existsSync(portPath) ? readFileSync(portPath, 'utf8') : ''
  const p = [...s.matchAll(/\.mark\(\s*['"]([^'"]+)/g)].map((m) => m[1])
  rows.push({ slug, upstream: u, port: p })
}
const lines = [
  '# Act marks by scene',
  '',
  'Marks are set with `act.mark(name)`; the Stage carries `data-mark="name"`,',
  'which is what the skill `film.mjs --at name` waits for. Values are exact',
  'script order. `—` means a still, or an animated upstream script with no marks.',
  '',
  '| scene | upstream marks | port marks | same |',
  '| --- | --- | --- | --- |',
  ...rows.map(
    (r) =>
      `| ${r.slug} | ${r.upstream.join(', ') || '—'} | ${r.port.join(', ') || '—'} | ${
        r.upstream.join(',') === r.port.join(',') ? 'yes' : '**no**'
      } |`,
  ),
]
writeFileSync('docs/marks.md', `${lines.join('\n')}\n`)
console.log(`${rows.length} scenes, ${rows.filter((r) => r.upstream.join(',') !== r.port.join(',')).length} mismatched`)
