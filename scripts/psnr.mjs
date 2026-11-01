// The gold gate: compare the 900px #example film frames against the supplied
// reference stills with ffmpeg's PSNR filter. Target: 30 dB or better.
//
//   node scripts/psnr.mjs

import { spawnSync } from 'node:child_process'
import { writeFile } from 'node:fs/promises'

const pairs = [
  { name: 'static-900', port: 'shots/example-static.png', ref: 'shots/ref-static-card.png' },
  { name: 'hero-900', port: 'shots/example-hero.png', ref: 'shots/ref-hero-demo.png' },
]

const out = []
for (const pair of pairs) {
  const result = spawnSync(
    'ffmpeg',
    ['-hide_banner', '-i', pair.port, '-i', pair.ref, '-lavfi', '[0:v][1:v]psnr', '-f', 'null', '-'],
    { encoding: 'utf8' },
  )
  const line = (result.stderr || '').split(/\r?\n/).find((l) => l.includes('PSNR')) ?? ''
  const average = line.match(/average:([\d.]+|inf)/)?.[1] ?? 'missing'
  const pass = average === 'inf' || Number(average) >= 30
  out.push({ ...pair, average, pass, line: line.trim() })
  console.log(`${pair.name} PSNR=${average} dB pass=${pass}`)
}

await writeFile('shots/psnr.json', JSON.stringify(out, null, 2))
if (out.some((row) => !row.pass)) process.exit(1)
