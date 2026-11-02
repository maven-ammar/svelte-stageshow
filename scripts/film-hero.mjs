// Film the landing hero as a real-time clip, for the launch post.
//
// Two earlier approaches failed for opposite reasons and are recorded here so
// nobody rediscovers them:
//
//   - page.screenshot() per frame: 320ms a shot on this page, so a 3s window took
//     24s to capture and played back at 8x. Unusable.
//   - deterministic runFrames() stepping: perfect motion, but the landing hero is
//     a live Stage with no handle to step it from outside, and the clip has to be
//     the real page, not the demo route.
//
// Page.startScreencast is the right tool: Chrome pushes compositor frames as they
// happen, so capture cost does not gate the timeline. Each frame carries its own
// timestamp, so the concat list reproduces the real durations and ffmpeg resamples
// to a constant rate at the end.
//
//   node scripts/film-hero.mjs https://svelte-stageshow.vercel.app/ \
//     --out shots/stageshow-hero.mp4 --size 1280x600 --seconds 10 --fps 25

import { copyFileSync, linkSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { execFileSync } from 'node:child_process'
import { chromium } from 'playwright-core'

const CHROME = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'

const argv = process.argv.slice(2)
const url = argv[0]
if (!url) {
  console.error('usage: node scripts/film-hero.mjs <url> --out <file> [--size 1280x600] [--seconds 10] [--fps 25] [--quality 92] [--dpr 1] [--scale-to 1280x600] [--start 0.8]')
  process.exit(2)
}

const flag = (name, fallback) => {
  const index = argv.indexOf(`--${name}`)
  return index >= 0 ? argv[index + 1] : fallback
}

const out = flag('out', 'shots/stageshow-hero.mp4')
const [width, height] = flag('size', '1280x600').split('x').map(Number)
const seconds = Number(flag('seconds', '10'))
const fps = Number(flag('fps', '25'))
const quality = Number(flag('quality', '92'))
const dpr = Number(flag('dpr', '1'))
const scaleTo = flag('scale-to', '')
const startDelay = Number(flag('start', '800'))

const scratch = mkdtempSync(join(tmpdir(), 'film-hero-'))
const frameDir = join(scratch, 'frames')
mkdirSync(frameDir, { recursive: true })
mkdirSync(resolve(out, '..'), { recursive: true })

const run = async () => {
  const browser = await chromium.launch({ executablePath: CHROME })
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: dpr })
  await page.goto(url, { waitUntil: 'load', timeout: 60000 })
  // Fonts decide where the headline sits and how wide the demo reads; capturing
  // before they land bakes a fallback face into frame 0.
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(startDelay)

  const cdp = await page.context().newCDPSession(page)
  const stamps = []
  let index = 0
  let done = false

  cdp.on('Page.screencastFrame', ({ data, sessionId, metadata }) => {
    if (done) return
    writeFileSync(join(frameDir, `f${String(index).padStart(5, '0')}.jpg`), Buffer.from(data, 'base64'))
    stamps.push(metadata.timestamp)
    index += 1
    cdp.send('Page.screencastFrameAck', { sessionId }).catch(() => {})
  })

  await cdp.send('Page.startScreencast', {
    format: 'jpeg',
    quality,
    maxWidth: width * dpr,
    maxHeight: height * dpr,
    everyNthFrame: 1,
  })

  await page.waitForTimeout(seconds * 1000)
  done = true
  await cdp.send('Page.stopScreencast')
  await browser.close()

  if (stamps.length < 10) throw new Error(`only ${stamps.length} frames arrived`)

  // Map each output slot to the pushed frame that was on screen at that moment.
  // The concat demuxer was tried first and stretched 14.78s of capture into
  // 17.07s of video, which reads as slow motion; a nearest-frame remap keeps the
  // clip's length equal to the time actually recorded.
  const framePath = (n) => join(frameDir, `f${String(n).padStart(5, '0')}.jpg`)
  const span = stamps[stamps.length - 1] - stamps[0]
  const outCount = Math.round(span * fps)
  const slotDir = join(scratch, 'slots')
  mkdirSync(slotDir, { recursive: true })

  const pick = (k) => {
    const at = stamps[0] + k / fps
    let lo = 0
    let hi = stamps.length - 1
    let found = 0
    while (lo <= hi) {
      const mid = (lo + hi) >> 1
      if (stamps[mid] <= at) {
        found = mid
        lo = mid + 1
      } else {
        hi = mid - 1
      }
    }
    return found
  }

  for (let k = 0; k < outCount; k += 1) {
    const src = framePath(pick(k))
    const dst = join(slotDir, `s${String(k).padStart(5, '0')}.jpg`)
    try {
      linkSync(src, dst)
    } catch {
      copyFileSync(src, dst)
    }
  }

  execFileSync(
    'ffmpeg',
    [
      '-y', '-v', 'error',
      '-framerate', String(fps),
      '-i', join(slotDir, 's%05d.jpg'),
      '-vf', scaleTo
        ? `scale=${scaleTo.split('x')[0]}:${scaleTo.split('x')[1]}:flags=lanczos,pad=ceil(iw/2)*2:ceil(ih/2)*2`
        : 'pad=ceil(iw/2)*2:ceil(ih/2)*2',
      '-c:v', 'libx264',
      '-preset', 'slow',
      '-crf', '20',
      '-pix_fmt', 'yuv420p',
      '-movflags', '+faststart',
      resolve(out),
    ],
    { stdio: 'inherit' },
  )

  console.log(`wrote ${out}: ${stamps.length} pushed frames over ${span.toFixed(2)}s (${(stamps.length / span).toFixed(1)} fps pushed), remapped to ${outCount} frames at ${fps} fps`)
}

try {
  await run()
} catch (error) {
  console.error(`film-hero failed: ${error.message}`)
  process.exitCode = 1
} finally {
  try {
    rmSync(scratch, { recursive: true, force: true })
  } catch {}
}
