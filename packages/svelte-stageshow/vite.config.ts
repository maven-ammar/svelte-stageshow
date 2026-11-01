import { svelte } from '@sveltejs/vite-plugin-svelte'
import { defineConfig } from 'vite'

// The library is built by svelte-package; Vite is here so the package can be
// built and type-checked in the same toolchain the gallery uses.
export default defineConfig({
  plugins: [svelte()],
  build: {
    lib: {
      entry: 'src/lib/index.ts',
      formats: ['es'],
      fileName: 'index',
    },
  },
})
