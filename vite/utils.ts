import { toRaw } from 'vue'

export function parseEnv(env: Record<string, any>): ViteEnv {
  const envs: any = toRaw(env) // 深拷贝，避免响应式影响
  Object.entries(env).forEach(([key, value]) => {
    if (value === 'true' || value === 'false') {
      envs[key] = value === 'true'
    } else if (/^\d+$/.test(value)) {
      envs[key] = Number(value)
    } else if (value === 'null') {
      envs[key] = null
    } else if (value === 'undefined') {
      envs[key] = undefined
    } else {
      envs[key] = value
    }
  })
  return envs
}
