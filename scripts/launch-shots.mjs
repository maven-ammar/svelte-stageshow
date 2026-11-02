// Generate launch assets for Product Hunt and Peerlist from the live site.
//
// Both platforms want different shapes, so this captures at each target's own size
// rather than resizing one image: PH renders a gallery at 1270x760, Peerlist a
// 500x500 logo and 1200x630 covers. Element screenshots plus a centred pad keep the
// hero's own composition instead of leaving a dead band under the fold.
//
//   node scripts/launch-shots.mjs            # both sets
//   node scripts/launch-shots.mjs --set ph
//   node scripts/launch-shots.mjs --set peerlist

import { execFileSync } from 'node:child_process'
import { mkdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join, resolve } from 'node:path'

let chromium
try {
  ;({ chromium } = await import('playwright-core'))
} catch {
  const require = createRequire(join(resolve(process.cwd(), '.agents', 'skills', 'stageshow'), 'package.json'))
  ;({ chromium } = require('playwright-core'))
}

const SITE = 'https://svelte-stageshow.vercel.app'
const BG = '0x0a0a0b'
const set = process.argv.includes('--set') ? process.argv[process.argv.indexOf('--set') + 1] : 'both'

const browser = await chromium.connectOverCDP('http://127.0.0.1:9222')
const context = browser.contexts()[0]
const page = context.pages()[0] || (await context.newPage())

const goto = async (path, width, height) => {
  await page.setViewportSize({ width, height })
  await page.goto(`${SITE}${path}`, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.evaluate(() => document.fonts.ready)
  // Re-applied after every navigation: addStyleTag does not survive a goto, and a
  // scrollbar in a marketing image is the first thing a designer circles.
  await page.addStyleTag({ content: '::-webkit-scrollbar{display:none}' }).catch(() => {})
}

// A parked cursor leaves hover states in the frame (a "+" over the export button,
// tooltips). Park it in the corner before every capture.
const parkCursor = async () => {
  await page.mouse.move(2, 2)
  await page.waitForTimeout(350)
}

const padTo = (input, output, width, height) => {
  execFileSync('ffmpeg', [
    '-y', '-v', 'error',
    '-i', input,
    '-vf', `pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2:color=${BG}`,
    output,
  ])
}

// --- Product Hunt: 1270x760, PH renders a gallery at that ratio ------------------
const ph = async () => {
  const out = 'shots/ph'
  mkdirSync(out, { recursive: true })

  const shot = async (path, name, wait, element) => {
    await goto(path, 1270, 600)
    await parkCursor()
    await page.waitForTimeout(wait)
    const raw = `${out}/${name}-raw.png`
    await (element ? page.locator(element) : page).screenshot({ path: raw, type: 'png' })
    padTo(raw, `${out}/${name}.png`, 1270, 760)
    console.log(`  ${name}.png  1270x760`)
  }

  console.log('product hunt:')
  await shot('/', '01-hero', 2500, '.dot-hero')
  await shot('/', '02-typing', 12800, '.dot-hero') // popup types ~11.9-14s, then hides
  await shot('/', '03-paste', 17800, '.dot-hero') // terminal holds before the reset
  await shot('/docs/', '04-docs', 2000)

  // Thumbnail. A crop of the real window was tried first and at 240px it read as a
  // white smudge: the detail that makes it a product shot is exactly what disappears
  // at that size. This draws the same visual language at thumbnail scale instead —
  // gradient ground, one window, three bars, one accent dot — rendered at 3x and
  // downscaled so the edges stay sharp.
  await goto('/', 900, 700)
  await page.evaluate(() => {
    const el = document.createElement('div')
    el.id = 'ph-thumb'
    el.style.cssText = [
      'position:fixed', 'left:0', 'top:0', 'width:240px', 'height:240px', 'z-index:99999',
      'display:flex', 'align-items:center', 'justify-content:center',
      'background:radial-gradient(120% 90% at 22% 12%, #2b2340 0%, #141019 45%, #0a0a0b 100%),' +
        'radial-gradient(80% 70% at 85% 85%, #7c3f1e 0%, rgba(124,63,30,0) 60%)',
    ].join(';')

    const win = document.createElement('div')
    win.style.cssText = [
      'width:168px', 'height:132px', 'border-radius:12px', 'background:#faf9f7',
      'box-shadow:0 10px 24px rgba(0,0,0,0.45)', 'overflow:hidden',
      'display:flex', 'flex-direction:column',
    ].join(';')

    const bar = document.createElement('div')
    bar.style.cssText = 'height:22px;background:#efece7;display:flex;align-items:center;gap:5px;padding:0 9px'
    for (const colour of ['#e0574b', '#e0a33f', '#4fb06a']) {
      const dot = document.createElement('span')
      dot.style.cssText = `width:7px;height:7px;border-radius:50%;background:${colour}`
      bar.appendChild(dot)
    }

    const body = document.createElement('div')
    body.style.cssText = 'flex:1;padding:11px 12px;display:flex;flex-direction:column;gap:8px;position:relative'
    for (const [w, h, tone] of [[86, 9, '#d9d5cf'], [64, 7, '#e6e2dc'], [104, 7, '#e6e2dc']]) {
      const line = document.createElement('div')
      line.style.cssText = `width:${w}px;height:${h}px;border-radius:3px;background:${tone}`
      body.appendChild(line)
    }
    const accent = document.createElement('div')
    accent.style.cssText =
      'position:absolute;right:12px;bottom:12px;width:26px;height:10px;border-radius:5px;background:#3f6fd8'
    body.appendChild(accent)

    win.appendChild(bar)
    win.appendChild(body)
    el.appendChild(win)
    document.body.appendChild(el)
  })
  await page.waitForTimeout(400)
  // Render at 3x then downscale: screenshotting at 240 directly gives soft edges on
  // the rounded corners and the dots.
  await page.emulateMedia({})
  const thumbRaw = `${out}/05-thumb-raw.png`
  await page.locator('#ph-thumb').screenshot({ path: thumbRaw, type: 'png', scale: 'device' })
  execFileSync('ffmpeg', [
    '-y', '-v', 'error', '-i', thumbRaw,
    '-vf', 'scale=240:240:flags=lanczos', `${out}/05-thumb.png`,
  ])
  console.log('  05-thumb.png  240x240 (window motif, 3x downscaled)')
}

// --- Peerlist: 500x500 logo, 1200x630 covers ------------------------------------
const peerlist = async () => {
  const out = 'shots/peerlist'
  mkdirSync(out, { recursive: true })

  console.log('peerlist logo:')
  await goto('/', 1280, 800)
  await parkCursor()
  await page.waitForTimeout(2000)
  // Composed on the page rather than drawn offline, so it inherits the site's own
  // serif (Instrument Serif) and its gradient instead of guessing at them.
  await page.evaluate(() => {
    const el = document.createElement('div')
    el.id = 'peerlist-logo'
    el.style.cssText = [
      'position:fixed', 'left:0', 'top:0', 'width:500px', 'height:500px', 'z-index:99999',
      'display:flex', 'flex-direction:column', 'align-items:center', 'justify-content:center',
      'gap:14px',
      "font-family:'Instrument Serif',Georgia,serif",
      'color:#f4efe4',
      'background:radial-gradient(120% 90% at 20% 10%, #2b2340 0%, #141019 45%, #0a0a0b 100%),' +
        'radial-gradient(80% 70% at 85% 85%, #7c3f1e 0%, rgba(124,63,30,0) 60%)',
    ].join(';')
    el.innerHTML =
      '<span style="font-size:78px;line-height:0.95;text-align:center">svelte<br>stageshow</span>' +
      '<span style="font-family:ui-monospace,SFMono-Regular,monospace;font-size:14px;' +
      'letter-spacing:0.22em;color:#a8997f">SVELTE 5 PORT</span>'
    document.body.appendChild(el)
  })
  await page.waitForTimeout(600)
  await page.locator('#peerlist-logo').screenshot({ path: `${out}/logo-500.png`, type: 'png' })
  console.log('  logo-500.png  500x500')

  console.log('peerlist covers:')
  // 1200x630 is the share-card ratio, so the capture is taken at that width and the
  // hero is padded to the height rather than cropped.
  const cover = async (path, name, wait, element) => {
    await goto(path, 1200, 630)
    await parkCursor()
    await page.waitForTimeout(wait)
    const raw = `${out}/${name}-raw.png`
    await (element ? page.locator(element) : page).screenshot({ path: raw, type: 'png' })
    padTo(raw, `${out}/${name}.png`, 1200, 630)
    console.log(`  ${name}.png  1200x630`)
  }

  await cover('/', 'cover-1-hero', 2500, '.dot-hero')
  await cover('/', 'cover-2-typing', 12800, '.dot-hero')
  await cover('/', 'cover-3-paste', 17800, '.dot-hero')
  await cover('/docs/', 'cover-4-docs', 2000)
}

if (set === 'both' || set === 'ph') await ph()
if (set === 'both' || set === 'peerlist') await peerlist()

await browser.close()
console.log('done')
