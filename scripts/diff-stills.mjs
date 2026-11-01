// Pixel-diff a ported still against the gold still filmed from
// benjitaylor/skills. Reports the count and share of pixels whose largest
// channel delta is over 8 (anti-aliasing noise below that is ignored), plus
// the bounding box of the changes. Writes shots/diff.json.
//
//   node scripts/diff-stills.mjs

import { readFile, writeFile } from 'node:fs/promises'
import { chromium } from 'playwright-core'

const CHROME = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const pairs = [
  { name: 'static-400', gold: 'shots/gold-static-400.png', port: 'shots/port-static-400.png' },
  { name: 'static-358', gold: 'shots/gold-static-358.png', port: 'shots/port-static-358.png' },
  { name: 'hero-720', gold: 'shots/gold-hero-720.png', port: 'shots/port-hero-720.png' },
  { name: 'hero-358', gold: 'shots/gold-hero-358.png', port: 'shots/port-hero-358.png' },
]

const browser = await chromium.launch({ executablePath: CHROME, headless: true })
const page = await browser.newPage({ viewport: { width: 100, height: 100 } })
const out = []

for (const pair of pairs) {
  const gold = (await readFile(pair.gold)).toString('base64')
  const port = (await readFile(pair.port)).toString('base64')
  const result = await page.evaluate(async ({ gold, port }) => {
    const load = (data) =>
      new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => resolve(img)
        img.onerror = reject
        img.src = `data:image/png;base64,${data}`
      })
    const a = await load(gold)
    const b = await load(port)
    if (a.width !== b.width || a.height !== b.height) return { sizeMismatch: [a.width, a.height, b.width, b.height] }
    const canvas = document.createElement('canvas')
    canvas.width = a.width
    canvas.height = a.height
    const ctx = canvas.getContext('2d')
    ctx.drawImage(a, 0, 0)
    const da = ctx.getImageData(0, 0, a.width, a.height).data
    ctx.clearRect(0, 0, a.width, a.height)
    ctx.drawImage(b, 0, 0)
    const db = ctx.getImageData(0, 0, a.width, a.height).data
    let diff = 0
    let max = 0
    let minX = a.width, minY = a.height, maxX = -1, maxY = -1
    for (let i = 0; i < da.length; i += 4) {
      const d = Math.max(Math.abs(da[i] - db[i]), Math.abs(da[i + 1] - db[i + 1]), Math.abs(da[i + 2] - db[i + 2]))
      if (d > max) max = d
      if (d > 8) {
        diff++
        const p = i / 4
        const x = p % a.width
        const y = Math.floor(p / a.width)
        if (x < minX) minX = x
        if (y < minY) minY = y
        if (x > maxX) maxX = x
        if (y > maxY) maxY = y
      }
    }
    return {
      width: a.width,
      height: a.height,
      pixels: a.width * a.height,
      differing: diff,
      percent: +((diff / (a.width * a.height)) * 100).toFixed(3),
      maxDelta: max,
      bbox: maxX >= 0 ? { x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1 } : null,
    }
  }, { gold, port })
  out.push({ name: pair.name, ...result })
  console.log(`${pair.name} ${result.width}x${result.height} differing=${result.differing} (${result.percent}%) maxDelta=${result.maxDelta} bbox=${JSON.stringify(result.bbox)}`)
}

await writeFile('shots/diff.json', JSON.stringify(out, null, 2))
await browser.close()
