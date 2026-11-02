import { svelte } from '@sveltejs/vite-plugin-svelte'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, type Plugin } from 'vite'

const lib = fileURLToPath(new URL('../../packages/svelte-stageshow/src/lib', import.meta.url))
const here = fileURLToPath(new URL('.', import.meta.url))

// The dev server runs over plain HTTP on a tailnet address, which is not a secure
// context, so navigator.clipboard does not exist and the annotation tool cannot copy
// its notes. This accepts them instead and writes a file the agent can read.
function feedbackSink(): Plugin {
  return {
    name: 'stageshow-feedback-sink',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/__notes', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end('POST only')
          return
        }
        let body = ''
        req.on('data', (chunk) => (body += chunk))
        req.on('end', () => {
          try {
            const dir = join(here, '.feedback')
            mkdirSync(dir, { recursive: true })
            const stamp = new Date().toISOString().replace(/[:.]/g, '-')
            writeFileSync(join(dir, `${stamp}.md`), body, 'utf8')
            res.statusCode = 204
            res.end()
            console.log(`[feedback] notes written: .feedback/${stamp}.md (${body.length} chars)`)
          } catch (error) {
            res.statusCode = 500
            res.end(String(error))
          }
        })
      })
    },
  }
}

export default defineConfig({
  plugins: [svelte(), feedbackSink()],
  resolve: {
    alias: [
      { find: /^svelte-stageshow\/style\.css$/, replacement: `${lib}/stageshow.css` },
      { find: /^svelte-stageshow$/, replacement: `${lib}/index.ts` },
    ],
  },
  server: {
    fs: {
      allow: ['../..'],
    },
  },
})
