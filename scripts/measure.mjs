// Measure the two ported gold scenes at their shown sizes. Numbers only:
// stage and window geometry, how much of the hero is off stage, the
// satellite's straddle, type sizes, visible strings and named targets.
// Writes shots/measure.json.
//
//   node scripts/measure.mjs "http://127.0.0.1:4173"

import { mkdir, writeFile } from 'node:fs/promises'
import { chromium } from 'playwright-core'

const CHROME = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const base = process.argv[2] || 'http://127.0.0.1:4173'
const scenes = [
  { id: 'static-card', width: 400, height: 300, window: '.sc-window', satellite: '.sc-detail' },
  { id: 'static-card', width: 358, height: 300, window: '.sc-window', satellite: '.sc-detail' },
  { id: 'hero-demo', width: 720, height: 340, window: '.hd-browser', satellite: '.hd-terminal' },
  { id: 'hero-demo', width: 358, height: 400, window: '.hd-browser', satellite: '.hd-terminal' },
]

const browser = await chromium.launch({ executablePath: CHROME, headless: true })
const out = []

for (const scene of scenes) {
  const page = await browser.newPage({ viewport: { width: scene.width, height: scene.height }, deviceScaleFactor: 1 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto(`${base}/?capture=${scene.id}&w=${scene.width}&v=measure`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(300)

  const data = await page.evaluate(({ windowSel, satelliteSel }) => {
    const stage = document.querySelector('.ss-stage')
    const win = windowSel ? document.querySelector(windowSel) : null
    const sat = satelliteSel ? document.querySelector(satelliteSel) : null
    const r = (el) => {
      if (!el) return null
      const b = el.getBoundingClientRect()
      return { x: +b.x.toFixed(1), y: +b.y.toFixed(1), width: +b.width.toFixed(1), height: +b.height.toFixed(1), right: +b.right.toFixed(1), bottom: +b.bottom.toFixed(1) }
    }
    const sr = r(stage)
    const wr = r(win)
    const str = r(sat)

    const visibleWidth = wr && sr ? Math.max(0, Math.min(sr.right, wr.right) - Math.max(sr.x, wr.x)) : null
    const visibleHeight = wr && sr ? Math.max(0, Math.min(sr.bottom, wr.bottom) - Math.max(sr.y, wr.y)) : null
    const bleedRight = wr && sr ? Math.max(0, wr.right - sr.right) : null
    const bleedBottom = wr && sr ? Math.max(0, wr.bottom - sr.bottom) : null
    const bleedTop = wr ? Math.max(0, wr.y - (sr?.y ?? 0)) : null
    const bleedLeft = wr ? Math.max(0, wr.x - (sr?.x ?? 0)) : null
    const straddle = str && wr ? Math.max(0, Math.min(str.right, wr.right) - Math.max(str.x, wr.x)) : null

    const font = (sel) => {
      const el = document.querySelector(sel)
      return el ? getComputedStyle(el).fontSize : null
    }

    const texts = []
    const walker = document.createTreeWalker(stage, NodeFilter.SHOW_TEXT)
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const text = (n.textContent || '').trim().replace(/\s+/g, ' ')
      if (!text || text.length < 2 || /^[\s·•\-–—+%]+$/.test(text)) continue
      let visible = true
      for (let p = n.parentElement; p; p = p.parentElement) {
        const cs = getComputedStyle(p)
        if (cs.display === 'none' || cs.visibility === 'hidden') visible = false
      }
      if (visible) texts.push(text)
    }

    return {
      stage: sr,
      window: wr,
      satellite: str,
      visible: visibleWidth && visibleHeight ? { width: visibleWidth, height: visibleHeight } : null,
      bleed: { top: bleedTop, left: bleedLeft, right: bleedRight, bottom: bleedBottom },
      bleedPct: wr && sr
        ? {
            width: +(((visibleWidth ?? 0) / sr.width) * 100).toFixed(1),
            height: +(((visibleHeight ?? 0) / sr.height) * 100).toFixed(1),
            windowOffRight: +(((bleedRight ?? 0) / (wr.width || 1)) * 100).toFixed(1),
            windowOffBottom: +(((bleedBottom ?? 0) / (wr.height || 1)) * 100).toFixed(1),
          }
        : null,
      satelliteStraddle: str && wr ? { insideOfWindow: straddle, outsideOfWindow: +(str.width - (straddle ?? 0)).toFixed(1) } : null,
      type: {
        windowTitle: font('.ss-window__heading, .ss-window__title'),
        pageTitle: font('.sc-title, .hd-title'),
        cardTitle: font('.sc-detail-name'),
        rowTitle: font('.ss-row__title'),
        rowMeta: font('.ss-row__meta'),
        terminal: font('.hd-terminal-body'),
      },
      strings: { total: texts.length, unique: [...new Set(texts)].length, sample: [...new Set(texts)].slice(0, 16) },
      targets: [...stage.querySelectorAll('[data-target]')].map((el) => el.getAttribute('data-target')),
    }
  }, { windowSel: scene.window, satelliteSel: scene.satellite })

  out.push({ id: scene.id, size: `${scene.width}x${scene.height}`, ...data })
  await page.close()
}

await mkdir('shots', { recursive: true })
await writeFile('shots/measure.json', JSON.stringify(out, null, 2))
for (const row of out) {
  console.log(
    `${row.id} ${row.size} stage=${row.stage.width}x${row.stage.height} ` +
      `visible=${row.visible?.width}x${row.visible?.height} ` +
      `bleed=${row.bleed.top}/${row.bleed.left}/${row.bleed.right}/${row.bleed.bottom} ` +
      `strings=${row.strings.unique} targets=${row.targets.length}`,
  )
}

await browser.close()
