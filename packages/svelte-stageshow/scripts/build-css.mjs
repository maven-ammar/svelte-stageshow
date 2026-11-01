// The package ships one CSS file. svelte-package copies src/lib/style/*.css
// into dist/style/, so this concatenates every kit stylesheet in dependency
// order and writes dist/stageshow.css. Keeping it a build step means a
// consumer imports a single file with no @imports to resolve.
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const style = join(root, 'src', 'lib', 'style')

async function walk(dir) {
  const out = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) out.push(...(await walk(path)))
    else if (entry.name.endsWith('.css')) out.push(path)
  }
  return out
}

const all = await walk(style)
const rel = (path) => relative(style, path).replaceAll('\\', '/')
const rank = (path) => {
  const name = rel(path)
  const core = ['stage.css', 'cursor.css', 'keys.css', 'window.css', 'phone.css', 'row.css', 'avatar.css', 'chip.css']
  const i = core.indexOf(name)
  if (i >= 0) return [0, i, name]
  if (name.startsWith('motion/')) return [1, 0, name]
  if (name.startsWith('parts/')) return [2, 0, name]
  if (name.startsWith('controls/')) return [3, 0, name]
  return [4, 0, name]
}
const order = all.sort((a, b) => {
  const ra = rank(a)
  const rb = rank(b)
  return ra[0] - rb[0] || ra[1] - rb[1] || ra[2].localeCompare(rb[2])
})

const parts = []
for (const file of order) {
  const text = await readFile(file, 'utf8')
  parts.push(`/* ${rel(file)} */\n${text.trim()}\n`)
}
const out = parts.join('\n')
await writeFile(join(root, 'dist', 'stageshow.css'), out)
console.log(`dist/stageshow.css ${out.length} bytes from ${order.length} files`)
