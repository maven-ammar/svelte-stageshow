// Render a page to a film one frame at a time.
//
// Page.startScreencast is right for capturing something that only exists in real time, but it
// pushes frames whenever the compositor has one, not on a fixed grid. On a page that decodes
// eleven videos at once the push rate drops during the expensive part of a move, the nearest-frame
// remap then repeats frames to fill the gap, and the result is visible judder exactly where the
// film should be smoothest.
//
// This does the opposite: it asks the page for a named moment, waits for the page to be at that
// moment, and screenshots it. Capture cost stops mattering — only the output frame rate does.
//
//   node scripts/render-film.mjs "file:///…/wall.html#render" \
//     --out shots/film/stageshow-wall.mp4 --seconds 13.8 --fps 30 --size 1280x720
//
// The page opts in by exposing window.renderFrame(t) returning a promise. Without it the script
// still works, it just gets whatever the page does on its own clock.

import { mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { execFileSync } from 'node:child_process'
import { chromium } from 'playwright-core'

const CHROME = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'

const argv = process.argv.slice(2)
const url = argv[0]
if (!url) {
  console.error('usage: node scripts/render-film.mjs <url> --out <file> [--seconds 13.8] [--fps 30] [--size 1280x720] [--quality 95]')
  process.exit(2)
}

const flag = (name, fallback) => {
  const index = argv.indexOf(`--${name}`)
  return index >= 0 ? argv[index + 1] : fallback
}

const out = resolve(flag('out', 'shots/film/render.mp4'))
const seconds = Number(flag('seconds', '14'))
const fps = Number(flag('fps', '30'))
const quality = Number(flag('quality', '95'))
const [width, height] = flag('size', '1280x720').split('x').map(Number)

const scratch = mkdtempSync(join(tmpdir(), 'render-film-'))
const frameDir = join(scratch, 'frames')
mkdirSync(frameDir, { recursive: true })
mkdirSync(resolve(out, '..'), { recursive: true })

const run = async () => {
  const browser = await chromium.launch({ executablePath: CHROME, headless: true })
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 })
  page.on('pageerror', (error) => console.error(`pageerror: ${error.message}`))
  await page.goto(url, { waitUntil: 'load', timeout: 60000 })

  // The page raises __filmReady once the clips can be decoded and the layout exists. A page that
  // never raises it is still renderable, so this is a bounded wait, not a gate.
  await page
    .waitForFunction(() => window.__filmReady === true, null, { timeout: 20000 })
    .catch(() => console.warn('page never signalled ready; rendering anyway'))

  const hasRenderer = await page.evaluate(() => typeof window.renderFrame === 'function')
  if (!hasRenderer) console.warn('page has no window.renderFrame(t); frames will repeat')

  const count = Math.round(seconds * fps)
  const started = Date.now()
  for (let k = 0; k < count; k += 1) {
    const t = k / fps
    if (hasRenderer) await page.evaluate((at) => window.renderFrame(at), t)
    await page.screenshot({
      path: join(frameDir, `f${String(k).padStart(5, '0')}.jpg`),
      type: 'jpeg',
      quality,
    })
    if (k % 30 === 0) {
      const each = (Date.now() - started) / (k + 1)
      process.stdout.write(`\r${k}/${count} frames, ${Math.round(each)}ms each, ${Math.round((count * each) / 1000)}s total`)
    }
  }
  await browser.close()

  const written = readdirSync(frameDir).length
  if (written !== count) throw new Error(`expected ${count} frames, wrote ${written}`)

  execFileSync(
    'ffmpeg',
    [
      '-y', '-v', 'error',
      '-framerate', String(fps),
      '-i', join(frameDir, 'f%05d.jpg'),
      '-c:v', 'libx264',
      '-preset', 'slow',
      '-crf', '18',
      '-pix_fmt', 'yuv420p',
      '-movflags', '+faststart',
      '-r', String(fps),
      out,
    ],
    { stdio: 'inherit' },
  )

  console.log(`\nwrote ${out}: ${count} frames at ${fps}fps over ${(count / fps).toFixed(2)}s`)
}

try {
  await run()
} catch (error) {
  console.error(`render-film failed: ${error.message}`)
  process.exitCode = 1
} finally {
  try {
    rmSync(scratch, { recursive: true, force: true })
  } catch {}
}
