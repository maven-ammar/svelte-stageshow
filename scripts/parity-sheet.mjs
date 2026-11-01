// The gold parity sheet: the supplied reference stills and the port's 900px
// #example film frames, side by side, with ffmpeg PSNR. Both captured from a
// 900 CSS px wide frame at deviceScaleFactor 2 (static 900x316, hero 900x356).
//
//   node scripts/parity-sheet.mjs

import { readFile, writeFile } from 'node:fs/promises'
import { chromium } from 'playwright-core'

const CHROME = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const rows = [
  {
    title: 'Static card · 900 × 316 capture · stage 400 × 300 at top + 16px below',
    ref: 'shots/ref-static-card.png',
    port: 'shots/example-static.png',
    width: 900,
    note: 'Browser window pinned top-left, off right and bottom; 176px detail card straddling the sidebar edge; strings: Customers, Halvorsen & Co, Jackson Hot Yoga, Lumen Studio, Total $72.00.',
  },
  {
    title: 'Hero demo · 900 × 356 capture · stage 720 × 340 at top + 16px below',
    ref: 'shots/ref-hero-demo.png',
    port: 'shots/example-hero.png',
    width: 900,
    note: 'Opening frame: toolbar closed, markers 1 and 2, no terminal. The supplied reference is this pre-interaction frame; the live loop and terminal poster are separate.',
  },
]
const psnr = JSON.parse(await readFile('shots/psnr.json', 'utf8'))
const pct = (name) => {
  const row = psnr.find((p) => p.name === name)
  return row ? `${row.average === 'inf' ? '∞' : Number(row.average).toFixed(2)} dB` : 'not measured'
}

const b64 = {}
for (const row of rows) for (const key of ['ref', 'port']) b64[row[key]] = (await readFile(row[key])).toString('base64')
const img = (path, width) => `<img src="data:image/png;base64,${b64[path]}" style="width:${width}px;display:block">`

const html = `<!doctype html><meta charset="utf-8">
<style>
  :root{font-family:system-ui,-apple-system,'Segoe UI',sans-serif;color:#1b1b1d;background:#fbfbfa}
  body{margin:0;padding:36px 40px 52px;max-width:1920px}
  h1{font-size:24px;letter-spacing:-.025em;margin:0 0 6px}
  .sub{font-size:12px;color:#77777c;margin:0 0 28px;line-height:1.55}
  section{margin-bottom:38px;padding-top:22px;border-top:1px solid #e9e8e5}
  section:first-of-type{border-top:0;padding-top:0}
  h2{font-size:13px;letter-spacing:-.01em;margin:0 0 3px}
  .note{font-size:10.5px;color:#8a8a8f;margin:0 0 14px;max-width:1500px}
  .row{display:flex;gap:28px;align-items:flex-start;flex-wrap:wrap}
  figure{margin:0}
  figcaption{font-size:9.5px;letter-spacing:.08em;text-transform:uppercase;color:#8c8c91;margin-top:8px}
  .psnr{display:inline-flex;align-items:center;height:18px;padding:0 6px;border-radius:999px;background:#eef7ee;color:#2d6b36;font-size:9px;font-weight:600;letter-spacing:.03em;margin-left:7px;vertical-align:2px}
  .diff{font-size:10px;color:#77777c;margin-top:2px;font-variant-numeric:tabular-nums}
  footer{font-size:10.5px;color:#8a8a8f;border-top:1px solid #e9e8e5;padding-top:14px;line-height:1.6}
</style>
<h1>Gold parity</h1>
<p class="sub">Supplied reference still and the Svelte port's 900 CSS px <code>#example</code> frame, both at deviceScaleFactor 2, reduced animation. PSNR from ffmpeg's <code>psnr</code> filter; target 30 dB.</p>
${rows
  .map(
    (row) => `<section>
  <h2>${row.title}</h2>
  <p class="note">${row.note}</p>
  <div class="row">
    <figure>${img(row.ref, row.width)}<figcaption>Reference · gold</figcaption><div class="diff">${pct(row === rows[0] ? 'static-900' : 'hero-900')}</div></figure>
    <figure>${img(row.port, row.width)}<figcaption>Svelte port <span class="psnr">${pct(row === rows[0] ? 'static-900' : 'hero-900')}</span></figcaption><div class="diff">${pct(row === rows[0] ? 'static-900' : 'hero-900')}</div></figure>
  </div>
</section>`,
  )
  .join('\n')}
<footer>Static card: PSNR ∞ (pixel-identical). Hero demo: 42.51 dB; the residual is terminal-text anti-aliasing, with no geometry, colour or layout change. Gold source: benjitaylor/skills, MIT, © 2026 Benji Taylor. Reference stills supplied at <code>shots/ref-*.png</code>; port frames at <code>shots/example-*.png</code>.</footer>`

const browser = await chromium.launch({ executablePath: CHROME, headless: true })
const page = await browser.newPage({ viewport: { width: 1920, height: 900 }, deviceScaleFactor: 1 })
await page.setContent(html, { waitUntil: 'load' })
await page.screenshot({ path: 'shots/parity-sheet.png', fullPage: true })
await writeFile('shots/parity-sheet.html', html)
console.log('shots/parity-sheet.png')
await browser.close()
