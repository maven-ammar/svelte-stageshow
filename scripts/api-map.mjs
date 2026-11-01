// Public API gate: every prop the React kit exposed must still be a prop of
// the Svelte component under the same name. The React names are frozen in
// docs/react-api.json (the original source is not part of this repo).
//
//   node scripts/api-map.mjs

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const components = ['Stage', 'Window', 'Bar', 'Text', 'Phone', 'Row']
const react = JSON.parse(await readFile(resolve(root, 'docs/react-api.json'), 'utf8')).components

const allowedExtra = {
  Stage: ['deterministic', 'class'],
  Window: ['class'],
  Bar: ['class'],
  Text: ['class'],
  Phone: ['class'],
  Row: ['className', 'class'],
}

const table = []
let missing = 0
let checked = 0

for (const name of components) {
  const source = await readFile(resolve(root, 'packages/svelte-stageshow/src/lib', `${name}.svelte`), 'utf8')
  const match = source.match(/let\s*\{([\s\S]*?)\}\s*:\s*Props\s*=\s*\$props\(\)/)
  if (!match) throw new Error(`Could not find $props() destructuring in ${name}.svelte`)
  const svelte = match[1]
    .split('\n')
    .map((line) => line.replace(/\/\/.*$/, '').trim())
    .filter((line) => line && !line.startsWith('...'))
    .flatMap((line) => line.split(','))
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => part.split(/[:=]/)[0].trim())
    .filter((part) => /^[A-Za-z_$][\w$]*$/.test(part))

  for (const prop of react[name]) {
    checked++
    const ok = svelte.includes(prop)
    if (!ok) missing++
    table.push({ component: name, react: prop, svelte: ok ? prop : '—', status: ok ? 'same name' : 'MISSING' })
  }
  for (const prop of svelte) {
    if (!react[name].includes(prop) && !allowedExtra[name].includes(prop)) {
      table.push({ component: name, react: '—', svelte: prop, status: 'added (documented)' })
    }
  }
  for (const prop of allowedExtra[name]) {
    if (svelte.includes(prop)) table.push({ component: name, react: '—', svelte: prop, status: 'added (Svelte idiom)' })
  }
}

await mkdir(resolve(root, 'docs'), { recursive: true })
await writeFile(resolve(root, 'docs/api-map.json'), JSON.stringify({ checked, missing, table }, null, 2))

console.log(`checked=${checked} missing=${missing}`)
for (const row of table.filter((row) => row.status !== 'same name')) {
  console.log(`${row.component}.${row.react} -> ${row.svelte} (${row.status})`)
}
if (missing) process.exit(1)
