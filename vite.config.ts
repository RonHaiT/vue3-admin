import { defineConfig, UserConfig, loadEnv } from 'vite'
import alias from './vite/alias'
import { parseEnv } from './vite/utils'
import setupPlugins from './vite/plugins'


// https://vite.dev/config/
export default defineConfig(({ command, mode }): UserConfig => {
  const isBuild = command == 'build'
  const root = process.cwd()
  const env = parseEnv(loadEnv(mode, root))
  return {
    plugins: setupPlugins(isBuild, env),
    //路径别名
    resolve: { alias },
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
  }
}
)
