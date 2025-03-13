import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import glsl from 'vite-plugin-glsl'

export default defineConfig(({mode})=>{
  const isProduction = mode === 'production'
  return{
    plugins: [
      vue(),
      vueDevTools(),
      glsl({
        compress: true,
        watch: true,
        warnDuplicatedImports: false
      })
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
    },
    base: isProduction ? '/base-three' : '/',
    build: {
      outDir: 'dist/base-three',
      assetsDir: 'static',
      rollupOptions: {
        output: {
          manualChunks: {
            three: ['three'],
          }
        }
      }
    },
    esbuild: {
      // drop: ['console', 'debugger']
    }
  }
})
