import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const examples = 'D:/AMMAR BACKUP 14-4-25/Ammar/personal-assistant/.agents/skills/stageshow/examples'
const rows = []
for (const slug of (await import('node:fs')).readdirSync(examples)) {
  const upstream = join(examples, slug, 'index.tsx')
  if (!existsSync(upstream)) continue
  const u = [...readFileSync(upstream, 'utf8').matchAll(/\.mark\(\s*['"]([^'"]+)/g)].map((m) => m[1])
  const portPath = `apps/web/src/scenes/${slug}.svelte`
  const s = existsSync(portPath) ? readFileSync(portPath, 'utf8') : ''
  const p = [...s.matchAll(/\.mark\(\s*['"]([^'"]+)/g)].map((m) => m[1])
  if (u.length || p.length) rows.push({ slug, upstream: u.join(','), port: p.join(','), same: u.join(',') === p.join(',') })
}
console.log(rows.map((r) => `${r.slug}\t${r.upstream}\t${r.port}\t${r.same}`).join('\n'))
