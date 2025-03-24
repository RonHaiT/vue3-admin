import { defineStore } from 'pinia'
import http from '@/apis/index'
import { type FormState, type MenuObj } from '@/apis/module/menu/types'

export const useMenuStore = defineStore('menu', {
    state: () => ({
        menuList: [] as MenuObj[],
        title: "",
        loading: false
    }),
    actions: {
        //获取菜单列表 
        async getMenu() {
            try {
                this.loading = true
                let res = await http.menu.menuList()
                if (res.status == 0) {
                    this.menuList = res.data
                    this.loading = false
                } else {
                    this.loading = false
                }
            } catch (error) {
                this.loading = false
                console.error(error);
            }
        },
        // 添加菜单
        async addMenu(data: FormState) {
            try {
                this.loading = true
                let res = await http.menu.addMenu(data)
                if (res.status == 0) {
                    this.loading = false
                    return true
                }
            } catch (error) {
                console.error(error);
                this.loading = false
                return error
            }
        },
        // 更新菜单
        async updateMenu(data: FormState) {
            try {
                this.loading = true
                let res = await http.menu.updateMenu(data)
                if (res.status == 0) {
                    this.loading = false
                    return true
                }
            } catch (error) {
                console.error(error);
                this.loading = false
                return error
            }
        },
        //删除菜单
        async deleteMenu(menuId: number) {
            try {
                this.loading = true
                let res = await http.menu.deleteMenu(menuId)
                if (res.status == 0) {
                    this.loading = false
                    return true
                }
            } catch (error) {
                this.loading = false
                console.error(error);
                return error
            }
        },
    },
    persist: {
        key: 'menu',
    }
})