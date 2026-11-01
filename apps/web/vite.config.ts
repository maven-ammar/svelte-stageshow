import { svelte } from '@sveltejs/vite-plugin-svelte'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const lib = fileURLToPath(new URL('../../packages/svelte-stageshow/src/lib', import.meta.url))

export default defineConfig({
  plugins: [svelte()],
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
