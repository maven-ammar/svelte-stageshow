// Load every registered capture slug, assert a .ss-stage is present and no
// "Unknown scene" fallback is shown, and collect console errors. This is the
// fast gate before the per-scene pixel comparison.
import { writeFile } from 'node:fs/promises'
import { chromium } from 'playwright-core'

const CHROME = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const base = process.argv[2] || 'http://127.0.0.1:4173'
const browser = await chromium.launch({ executablePath: CHROME, headless: true })
const page = await browser.newPage({ viewport: { width: 900, height: 900 } })

await page.goto(base, { waitUntil: 'networkidle' })
const slugs = await page.locator('.scene-link').allTextContents()
const results = []
for (const slug of slugs) {
  const errors = []
  const onConsole = (msg) => {
    if (msg.type() === 'error') errors.push(msg.text())
  }
  page.on('console', onConsole)
  await page.goto(`${base}/?capture=${slug}`, { waitUntil: 'networkidle' })
  const stages = await page.locator('.ss-stage').count()
  const missing = await page.locator('.capture-missing').allTextContents()
  await page.waitForTimeout(250)
  const size = await page.locator('.ss-stage').first().evaluate((el) => ({
    w: el.offsetWidth,
    h: el.offsetHeight,
    theme: el.getAttribute('data-theme'),
  })).catch(() => null)
  results.push({ slug, stages, missing: missing.join(' | '), errors, size })
  page.off('console', onConsole)
  if (!stages || missing.length) console.log(`FAIL ${slug}: stages=${stages} missing=${missing.join(' | ')}`)
}
await browser.close()
await writeFile('shots/smoke.json', JSON.stringify(results, null, 2))
const failed = results.filter((r) => !r.stages || r.missing || r.errors.length)
console.log(`scenes=${results.length} failed=${failed.length}`)
if (failed.length) {
  for (const row of failed) console.log(`${row.slug}: ${row.missing || row.errors.join(' | ') || 'no stage'}`)
  process.exit(1)
}
