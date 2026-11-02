// Print the stage's rendered box on a capture route, so a clip can be filmed at the
// scene's own size instead of a guessed viewport with black bands around it.
//
//   node scripts/stage-size.mjs "https://svelte-stageshow.vercel.app/?capture=messages"

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
if (!url) {
  console.error('usage: node scripts/stage-size.mjs <capture-url>')
  process.exit(2)
}

const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
})
const page = await browser.newPage({ viewport: { width: 1400, height: 900 }, deviceScaleFactor: 1 })
await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 })
await page.evaluate(() => document.fonts.ready)
await page.waitForTimeout(1200)

const box = await page.evaluate(() => {
  const stage = document.querySelector('.ss-stage') || document.querySelector('.ss-fit')
  if (!stage) return null
  const rect = stage.getBoundingClientRect()
  return { width: Math.round(rect.width), height: Math.round(rect.height) }
})

await browser.close()
console.log(JSON.stringify(box))
