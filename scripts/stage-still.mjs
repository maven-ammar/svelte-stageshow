// Capture one still of a scene's stage, fitted to a post-sized frame.
//
// Some capture routes do not animate (their Stage is authored as a still, or the script has
// nothing to do), so the screencast records a single frame and muxing produces nothing. A still
// is the honest asset there: it is what the scene actually is.

import { execFileSync } from 'node:child_process'
import { createRequire } from 'node:module'
import { join, resolve } from 'node:path'

let chromium
try {
  ;({ chromium } = await import('playwright-core'))
} catch {
  const require = createRequire(join(resolve(process.cwd(), '.agents', 'skills', 'stageshow'), 'package.json'))
  ;({ chromium } = require('playwright-core'))
}

const url = process.argv[2]
const out = process.argv[3]
if (!url || !out) {
  console.error('usage: node scripts/stage-still.mjs <capture-url> <out.png>')
  process.exit(2)
}

const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
})
const page = await browser.newPage({ viewport: { width: 1400, height: 900 }, deviceScaleFactor: 2 })
await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 })
await page.evaluate(() => document.fonts.ready)
await page.waitForTimeout(2500)

const stage = page.locator('.ss-stage').first()
const raw = out.replace(/\.png$/, '-raw.png')
await stage.screenshot({ path: raw, type: 'png' })
await browser.close()

// Same fit as the clips: keep the scene's aspect, centre it on the page colour.
execFileSync('ffmpeg', [
  '-y', '-v', 'error',
  '-i', raw,
  '-vf',
  'scale=1200:630:force_original_aspect_ratio=decrease:flags=lanczos,pad=1200:630:(ow-iw)/2:(oh-ih)/2:color=0x0a0a0b',
  out,
])
console.log(out)
