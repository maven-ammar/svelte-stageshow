// Film a capture route at an exact stage size, or the skill's #example wrapper.
// Uses the locally installed Chrome through playwright-core; no browser
// download, no global install.
//
//   node scripts/film.mjs "http://127.0.0.1:4173/?capture=hero-demo&w=720" \
//     --out shots/port-hero-720.png --size 720x340
//
//   node scripts/film.mjs "http://127.0.0.1:4173/?capture=static-card" \
//     --out shots/example-static.png --size 900x400 --select '#example' --still
//
// --select screenshots the element, not the viewport (the skill films its
// 900px #example wrapper this way). --still mirrors the skill's flag: it sets
// window.__ssStill before load, which makes a Stage freeze at its opening
// frame (not the reduced-motion poster). --reduce forces the poster.

import { mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { chromium } from 'playwright-core'

const CHROME = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const argv = process.argv.slice(2)
const url = argv[0]
if (!url) {
  console.error("usage: node scripts/film.mjs <url> --out <file> [--size 720x340] [--select '#example'] [--still] [--reduce]")
  process.exit(2)
}

const flag = (name, fallback) => {
  const i = argv.indexOf(`--${name}`)
  return i >= 0 ? argv[i + 1] : fallback
}
const has = (name) => argv.includes(`--${name}`)

const out = resolve(flag('out', 'shots/still.png'))
const [width, height] = flag('size', '720x340').split('x').map(Number)
const scale = Number(flag('scale', '2'))
const select = flag('select', '')
const still = has('still')
const reduce = has('reduce')

const browser = await chromium.launch({ executablePath: CHROME, headless: true })
const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: scale })
if (still) await page.addInitScript(() => { window.__ssStill = true })
if (reduce) await page.emulateMedia({ reducedMotion: 'reduce' })

await page.goto(url, { waitUntil: 'networkidle' })
await page.evaluate(async () => {
  await document.fonts.ready
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
})
await page.waitForTimeout(250)

await mkdir(dirname(out), { recursive: true })
if (select) {
  const el = page.locator(select)
  if (!(await el.count())) throw new Error(`selector not found: ${select}`)
  await el.screenshot({ path: out })
} else {
  await page.screenshot({ path: out })
}

const size = await page.evaluate((selector) => {
  const el = selector ? document.querySelector(selector) : document.querySelector('.ss-stage')
  const box = el?.getBoundingClientRect()
  return box ? { x: box.x, y: box.y, width: box.width, height: box.height } : null
}, select)
console.log(`${out} ${width}x${height}@${scale}x ${select ? `select=${select} ` : ''}box=${size ? `${Math.round(size.width)}x${Math.round(size.height)} @ ${Math.round(size.x)},${Math.round(size.y)}` : 'missing'}`)

await browser.close()
