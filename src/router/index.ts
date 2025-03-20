import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

// 手动注册的路由
const manualRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/system/HomeView.vue'),
  },
  {
    path: '/message',
    name: 'Message',
    component: () => import('@/views/antdv/Message.vue'),
  },
  {
    path: '/dropdown',
    name: 'Dropdown',
    component: () => import('@/views/antdv/Dropdown.vue'),
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/system/LoginView.vue'),
  },
]

const autoRoutes: RouteRecordRaw[] = []
const modules = import.meta.glob('@/views/pages/**/*.vue')

console.log('扫描到的文件:', modules);

// 转换字符串格式
const toCamelCase = (str: string, upperFirst = true) => {
  return str
    .split('/')
    .map((segment, index) => {
      if (index === 0 && !upperFirst) {
        return segment.charAt(0).toLowerCase() + segment.slice(1) // 确保首字母小写
      } else {
        return segment.charAt(0).toUpperCase() + segment.slice(1) // 其他单词首字母大写
      }

    })
    .join('')
}
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


const router = createRouter({
  history: createWebHistory(),
  routes: [...manualRoutes, ...autoRoutes],
})

export default router
