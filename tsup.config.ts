import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts', 'src/vite.config.ts'],
  format: ['cjs', 'esm'],
  sourcemap: true,
  dts: true,
})
