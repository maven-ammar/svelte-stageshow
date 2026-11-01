// Deterministic video recorder. Loads one capture scene, starts the Stage on a
// virtual 60fps clock, screenshots every frame, then hands the PNG sequence to
// ffmpeg. No wall-clock timers, no real transitions.
//
//   node scripts/record.mjs "http://127.0.0.1:4173/?capture=hero-demo" \
//     --out shots/video/hero-demo --frames 1500
//
// Output: shots/video/hero-demo/frame-0000.png ... and hero-demo.mp4
// Requires the gallery to be built and served (the herdr preview tab).

import { mkdir, rm } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { chromium } from 'playwright-core'

const CHROME = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const argv = process.argv.slice(2)
const url = argv[0]
if (!url) {
  console.error('usage: node scripts/record.mjs <capture-url> [--out dir] [--frames 1500] [--fps 60] [--scale 2]')
  process.exit(2)
}
const flag = (name, fallback) => {
  const i = argv.indexOf(`--${name}`)
  return i >= 0 ? argv[i + 1] : fallback
}
const outDir = resolve(flag('out', 'shots/video/scene'))
const frames = Math.max(1, Number(flag('frames', 1500)))
const fps = Math.max(1, Number(flag('fps', 60)))
const scale = Math.max(0.5, Number(flag('scale', 2)))

await rm(outDir, { recursive: true, force: true })
await mkdir(outDir, { recursive: true })

const browser = await chromium.launch({ executablePath: CHROME, headless: true })
const page = await browser.newPage({ viewport: { width: 1100, height: 900 }, deviceScaleFactor: scale })
await page.goto(url, { waitUntil: 'networkidle' })
await page.evaluate(async () => {
  await document.fonts.ready
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
})
if (!(await page.locator('.ss-stage').count())) throw new Error('no .ss-stage on the capture page')
const has = await page.evaluate(() => !!window.__ssRecorder)
if (!has) throw new Error('window.__ssRecorder missing; is this a Stage with a script?')

await page.evaluate(() => window.__ssRecorder.start())
const stage = page.locator('.ss-stage').first()
for (let i = 0; i < frames; i++) {
  await stage.screenshot({ path: join(outDir, `frame-${String(i).padStart(4, '0')}.png`) })
  if (i < frames - 1) await page.evaluate(() => window.__ssRecorder.step())
}
await page.evaluate(() => window.__ssRecorder.stop())
await browser.close()

const out = join(dirname(outDir), `${outDir.split(/[\\/]/).pop()}.mp4`)
const ff = spawnSync(
  'ffmpeg',
  ['-y', '-hide_banner', '-loglevel', 'error', '-framerate', String(fps), '-i', join(outDir, 'frame-%04d.png'), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', out],
  { encoding: 'utf8' },
)
if (ff.status !== 0) {
  console.error(ff.stderr || 'ffmpeg failed')
  process.exit(1)
}
console.log(`${frames} frames @ ${fps}fps -> ${out}`)
