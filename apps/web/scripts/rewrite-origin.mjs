// Rewrite the origin in everything the build emitted, so moving to a custom
// domain is one environment variable rather than a hunt through the source.
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { DEFAULT_ORIGIN, SITE_ORIGIN } from './site-origin.mjs'

const dist = join(process.cwd(), 'dist')
const EXTENSIONS = new Set(['.html', '.txt', '.xml'])

if (SITE_ORIGIN === DEFAULT_ORIGIN) {
  console.log(`origin unchanged (${SITE_ORIGIN}); nothing to rewrite`)
  process.exit(0)
}

let changed = 0
let scanned = 0

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      walk(full)
      continue
    }
    const dot = entry.lastIndexOf('.')
    if (dot < 0 || !EXTENSIONS.has(entry.slice(dot))) continue
    scanned += 1
    const text = readFileSync(full, 'utf8')
    if (!text.includes(DEFAULT_ORIGIN)) continue
    writeFileSync(full, text.split(DEFAULT_ORIGIN).join(SITE_ORIGIN), 'utf8')
    changed += 1
  }
}

walk(dist)
console.log(`origin rewritten to ${SITE_ORIGIN} in ${changed} of ${scanned} files`)
