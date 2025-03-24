import { defineStore } from 'pinia'
import http from '@/apis/index'
import { type RoleObj } from '@/apis/module/role/types'


export const useRoleStore = defineStore('role', {
    state: () => ({
        roleList: [] as RoleObj[],
        title: ""
    }),
    actions: {
        async getRoleList() {
            try {
                let res = await http.role.roleList()
                if (res.status == 0) {
                    this.roleList = res.data
                }
            } catch (error) {
                console.error(error);
            }
        },
        async addRole(data: RoleObj): Promise<boolean> {
            try {
                let res = await http.role.addRole(data)
                if (res.status == 0) {
                    console.log('role', res);
                    return true
                } else {
                    return false
                }
            } catch (error) {
                console.error(error);
                return false
            }
        },
        async updateRole(data: RoleObj): Promise<boolean> {
            try {
                let res = await http.role.updateRole(data)
                if (res.status == 0) {
                    console.log('role', res);
                    return true
                } else {
                    return false
                }
            } catch (error) {
                console.error(error);
                return false
            }
        },
        async deleteRole(id: number): Promise<boolean> {
            try {
                let res = await http.role.deleteRole(id)
                if (res.status == 0) {
                    console.log('role', res);
                    return true
                } else {
                    return false
                }
            } catch (error) {
                console.error(error);
                return false
            }
        },
    }
})