// The package ships one CSS file. svelte-package copies src/lib/style/*.css
// into dist/style/, so this concatenates them in the same order the components
// load them, and writes dist/stageshow.css. Keeping it a build step means a
// consumer imports a single file with no @imports to resolve.
import { readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const style = join(root, 'src', 'lib', 'style')
const order = ['stage.css', 'cursor.css', 'keys.css', 'window.css', 'phone.css', 'row.css', 'avatar.css', 'chip.css']

const parts = []
for (const file of order) {
  const text = await readFile(join(style, file), 'utf8')
  parts.push(`/* ${file} */\n${text.trim()}\n`)
}
const out = parts.join('\n')
await writeFile(join(root, 'dist', 'stageshow.css'), out)
console.log(`dist/stageshow.css ${out.length} bytes from ${order.length} files`)
