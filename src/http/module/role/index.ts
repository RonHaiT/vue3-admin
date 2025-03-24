import http from '@/http/axios'
import type { RoleObj } from './types'


export function roleList() {
  return http.request<Array<RoleObj>>({
    url: '/role/list/',
  })
}
export function addRole(data: RoleObj) {
  return http.request<Array<RoleObj>>({
    url: '/role/list/',
    method: 'POST',
    data
  })
}
export function updateRole(data: RoleObj) {
  return http.request<Array<RoleObj>>({
    url: '/role/update/',
    method: 'PUT',
    data
  })
}
export function deleteRole(id: number) {
  return http.request<Array<RoleObj>>({
    url: `/role/${id}/`,
    method: 'DELETE',
  })
}

