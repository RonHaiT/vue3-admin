import http from '@/http/axios'
import { type FormState } from '@/http/module/menu/types'
import { type MenuObj } from './types'

export function menuList() {
    return http.request<Array<MenuObj>>({
        url: '/menu/list/',
        headers: {
        }
    })
}

export function addMenu(data: FormState) {
    return http.request<boolean>({
        url: '/menu/list/',
        method: 'POST',
        data
    })
}
export function updateMenu(data: FormState) {
    return http.request<boolean>({
        url: `/menu/update/`,
        method: 'PUT',
        data
    })
}
export function deleteMenu(menuId: number) {
    return http.request<boolean>({
        url: `/menu/${menuId}/`,
        method: 'DELETE',
    })
}