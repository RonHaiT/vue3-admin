import vue from '@vitejs/plugin-vue'
import type { Plugin } from 'vite'
import AutoImport from 'unplugin-auto-import/vite'
import autoRegisterAntdV from './antdv'
import autoRegisterSvgIcons from './svgIcon'
import autoRegisterMockjs from './mock'

//插件集中管理,安装
export default function setupPlugins(isBuild: boolean, env: ViteEnv) {
  const plugins: Plugin[] = [vue({
    template: {
      compilerOptions: {
        isCustomElement: (tag) => tag.startsWith('box-icon') // 告诉 Vue 这是一个原生组件
      }
    }
  })

  ]
  // 自动导入 Vue 相关函数，如：ref, reactive, toRef 等
  plugins.push(
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia'],
      dirs: ['src/types'],
      eslintrc: { enabled: true },
    }),
  )
  //注册icons
  plugins.push(autoRegisterSvgIcons())

  //注册 mock.js
  if (!isBuild) {
    plugins.push(autoRegisterMockjs())
  }

  //注册antdv
  plugins.push(autoRegisterAntdV())

  return plugins
}
