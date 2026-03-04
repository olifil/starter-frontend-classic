/// <reference types="vitest" />
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import autoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'
import { fileURLToPath, URL } from 'node:url'
import { dirname, resolve } from 'node:path'
import { readdirSync } from 'node:fs'

const uiComponentFolders = readdirSync('./src/components/ui', { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)

function ShadcnVueResolver() {
  return {
    type: 'component' as const,
    resolve: (name: string) => {
      const kebab = name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
      const folder = uiComponentFolders
        .filter((f) => kebab === f || kebab.startsWith(f + '-'))
        .sort((a, b) => b.length - a.length)[0]
      if (folder) {
        return { name, from: `@/components/ui/${folder}` }
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    autoImport({
      imports: ['vue', 'vue-router', 'pinia', '@vueuse/core', 'vue-i18n'],
      dts: 'src/auto-imports.d.ts',
    }),
    Components({
      dirs: ['src/components', 'src/interface/components'],
      resolvers: [ShadcnVueResolver()],
      dts: 'src/components.d.ts',
    }),
    VueI18nPlugin({
      include: resolve(dirname(fileURLToPath(import.meta.url)), './src/i18n/locales/**'),
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@tests': fileURLToPath(new URL('./tests', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    root: fileURLToPath(new URL('./', import.meta.url)),
    include: ['tests/**/*.spec.ts'],
  },
})
