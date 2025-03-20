import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import Components from 'unplugin-vue-components/vite';
import AutoImport from 'unplugin-auto-import/vite'
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers';
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.startsWith('box-icon') // 告诉 Vue 这是一个原生组件
        }
      }
    }),
    vueDevTools(),
    AutoImport({
      imports: ['vue', 'vue-router'],
      dirs: ['src/types'],
      eslintrc: { enabled: true },
    }),
    Components({
      resolvers: [
        AntDesignVueResolver({
          importStyle: false, // css in js
        }),
      ],
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  // 代理配置
  server: {
    proxy: {
      "/api": {
        target: "https://cqgxq.matchn.cn/cqgxq-api",
        changeOrigin: true,
        prependPath: true,
      }
    }
  }
})
