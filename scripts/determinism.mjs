// The determinism gate: run the HeroDemo Act script twice in one page, then
// reload and run it twice again. Every rendered frame is SHA-256 hashed; the
// sequences must match exactly, within a run and across loads.
//
//   node scripts/determinism.mjs "http://127.0.0.1:4173/?test=determinism"

import { mkdir, writeFile } from 'node:fs/promises'
import { chromium } from 'playwright-core'

const CHROME = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const url = process.argv[2] || 'http://127.0.0.1:4173/?test=determinism'
const frames = 1500

const browser = await chromium.launch({ executablePath: CHROME, headless: true })
const page = await browser.newPage({ viewport: { width: 720, height: 340 } })

async function run() {
  await page.waitForFunction(() => typeof window.__runDeterminism === 'function')
  return page.evaluate((count) => window.__runDeterminism(count), frames)
}

await page.goto(url, { waitUntil: 'networkidle' })
const first = await run()
const second = await page.reload({ waitUntil: 'networkidle' }).then(run)

const match = (a, b) => a.length === b.length && a.every((hash, i) => hash === b[i])
const within = first.same
const across = match(first.a, second.a)
const pass = within && across && first.frames === second.frames && first.frames === frames + 1

const report = {
  frames: first.frames,
  withinRun: within,
  acrossLoads: across,
  firstMismatchWithin: first.first,
  firstHash: first.a[0],
  lastHash: first.a[first.a.length - 1],
  firstMismatchAcross: across ? -1 : first.a.findIndex((hash, i) => hash !== second.a[i]),
  pass,
}
await mkdir('shots', { recursive: true })
await writeFile('shots/determinism.json', JSON.stringify(report, null, 2))

console.log(
  `frames=${report.frames} withinRun=${report.withinRun} acrossLoads=${report.acrossLoads} ` +
    `firstMismatch=${report.firstMismatchWithin} first=${report.firstHash.slice(0, 12)} last=${report.lastHash.slice(0, 12)} pass=${report.pass}`,
)

await browser.close()
if (!pass) process.exit(1)
