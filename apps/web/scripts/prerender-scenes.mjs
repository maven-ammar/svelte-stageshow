// After `vite build`, give every scene its own static HTML with the correct head.
// The app still mounts over it; this exists for crawlers and link previews, which
// do not run JavaScript.
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const dist = join(root, 'dist')
const scenesDir = join(root, 'src', 'scenes')
const BASE = 'https://svelte-stageshow.vercel.app'
const SKIP = /Determinism|HeroIcon|HeroToolbar|zz-/

const slugify = (name) => name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()

const slugs = readdirSync(scenesDir)
  .filter((file) => file.endsWith('.svelte') && !SKIP.test(file))
  .map((file) => slugify(file.replace(/\.svelte$/, '')))
  .sort()

const shell = readFileSync(join(dist, 'index.html'), 'utf8')
let written = 0

for (const slug of slugs) {
  const title = `${slug} - a Stageshow scene in Svelte 5`
  const description = `The ${slug} scene from Benji Taylor's Stageshow kit, ported to Svelte 5. A working component at its authored design size, compared against his own render.`
  const canonical = `${BASE}/scenes/${slug}`

  let html = shell
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`)
    .replace(
      /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
      `<meta name="description" content="${description}" />`
    )
    .replace(
      /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/,
      `<meta property="og:title" content="${title}" />`
    )
    .replace(
      /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/,
      `<meta property="og:description" content="${description}" />`
    )
    .replace('</head>', `    <link rel="canonical" href="${canonical}" />\n    <meta property="og:url" content="${canonical}" />\n  </head>`)

  const outDir = join(dist, 'scenes', slug)
  mkdirSync(outDir, { recursive: true })
  writeFileSync(join(outDir, 'index.html'), html, 'utf8')
  written += 1
}

console.log(`prerendered ${written} scene shells with their own head`)
