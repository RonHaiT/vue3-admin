import { type RouteRecordRaw } from 'vue-router'
import toCamelCase from './toCamelCase'



const systemRoutes: RouteRecordRaw[] = []
const modulesSystem = import.meta.glob('@/views/system/**/*.vue')

// 模拟后端返回的路由（包含权限）
const fetchBackendRoutes = async (): Promise<{ path: string; name: string; permissions: Record<string, boolean> }[]> => {
    return [
        {
            path: "/user/profile",
            name: "UserProfile",
            permissions: { canView: true, canEdit: true, canDelete: false, canAdd: false }
        },
        {
            path: "/user/settings",
            name: "Settings",
            permissions: { canView: true, canEdit: true, canDelete: true, canAdd: true }
        }
    ]
}

// 解析 `views/system/` 并匹配后端返回的路由
const initSystemRoutes = async () => {
    const backendRoutes = await fetchBackendRoutes()

    backendRoutes.forEach(route => {
        const routeName = toCamelCase(route.path.substring(1)) // 去掉 `/`
        const componentPath = `/src/views/system${route.path}.vue` // 组件路径


        if (modulesSystem[`${componentPath}`]) {
            const match = componentPath.match(/\/views\/system\/(.+)\.vue$/) // 提取相对路径

            if (match) {
                const filePath = match[1]
                const pathSegments = filePath.split("/")
                const fileName = pathSegments[pathSegments.length - 1] // 取最后一级文件名，如 'Article'
                // 生成 path
                const routePath = `/${toCamelCase(fileName, false)}` // '/article'
                // 生成 name
                const routeName = toCamelCase(fileName, true) // 'Article'
                systemRoutes.push({
                    path: routePath,
                    name: routeName,
                    component: modulesSystem[`@${componentPath}`], // 绑定组件
                    meta: {
                        permissions: route.permissions, // 绑定权限信息
                    },
                })
            }

        } else {
            console.warn(`⚠️ 组件未找到: ${componentPath}`)
        }
    })

    console.log("后台返回的 system 路由:", systemRoutes)
}

// 初始化 system 路由
await initSystemRoutes()

export default systemRoutes