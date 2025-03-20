import { type RouteRecordRaw } from 'vue-router'
import toCamelCase from './toCamelCase'

const autoRoutes: RouteRecordRaw[] = []
const modules = import.meta.glob('@/views/pages/**/*.vue')




// 解析并注册动态路由
for (const path in modules) {
    const match = path.match(/\/views\/pages\/(.+)\.vue$/) // 提取相对路径
    if (match) {
        const filePath = match[1]
        const pathSegments = filePath.split("/")
        const fileName = pathSegments[pathSegments.length - 1] // 取最后一级文件名，如 'Article'
        // 生成 path
        const routePath = `/${toCamelCase(fileName, false)}` // '/article'
        // 生成 name
        const routeName = toCamelCase(fileName, true) // 'Article'
        autoRoutes.push({
            path: routePath,
            name: routeName,
            component: modules[path],
        })
    }
}
console.log('自动注册的路由:', autoRoutes);

export default autoRoutes