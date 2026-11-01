// Film the live hero loop at named beats, for rehearsal. This uses the real
// clock and real CSS transitions (no reduced motion); the determinism gate
// uses the virtual clock and CSS transitions off.
//
//   node scripts/film-beats.mjs "http://127.0.0.1:4173/?capture=hero-demo"

import { mkdir } from 'node:fs/promises'
import { chromium } from 'playwright-core'

const CHROME = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const url = process.argv[2] || 'http://127.0.0.1:4173/?capture=hero-demo'
const beats = [
  [250, 'open-time'],
  [700, 'opened'],
  [1800, 'typing'],
  [3200, 'answer'],
  [4200, 'terminal'],
  [5200, 'annotation'],
  [6900, 'reset'],
]

const browser = await chromium.launch({ executablePath: CHROME, headless: true })
const page = await browser.newPage({ viewport: { width: 720, height: 340 }, deviceScaleFactor: 2 })
await page.goto(url, { waitUntil: 'networkidle' })
await mkdir('shots/beats', { recursive: true })

let elapsed = 0
for (const [at, name] of beats) {
  await page.waitForTimeout(at - elapsed)
  elapsed = at
  await page.screenshot({ path: `shots/beats/hero-${String(at).padStart(4, '0')}-${name}.png` })
  const mark = await page.evaluate(() => document.querySelector('.ss-stage')?.getAttribute('data-mark') ?? '')
  console.log(`${at}ms ${name}${mark ? ` mark=${mark}` : ''}`)
}

await browser.close()
