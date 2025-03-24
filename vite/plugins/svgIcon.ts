import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import path from 'path'
export default function autoRegisterSvgIcons() {
  return createSvgIconsPlugin({
    iconDirs: [path.resolve(process.cwd(), 'src/assets/icons')],
    symbolId: 'icon-[dir]-[name]',
  })
}
