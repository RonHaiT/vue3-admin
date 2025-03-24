import { viteMockServe } from 'vite-plugin-mock'

export default function autoRegisterMockjs() {
  return viteMockServe({
    mockPath: 'mock',
    enable: true,
  })
}
