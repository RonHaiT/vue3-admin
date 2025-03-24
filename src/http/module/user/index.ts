import http from '@/http/axios'
import type { User, UserInfo, UserObj } from './types'

export function login(data: UserInfo) {
  return http.request<User>({
    url: '/user/login/',
    method: 'POST',
    data: data,
    headers: {
      isAuth: 0
    }
  })
}

export function userList() {
  return http.request<Array<UserObj>>({
    url: '/user/list/',
  })
}
export function addUser(data: UserObj) {
  return http.request<Array<UserObj>>({
    url: '/user/list/',
    method: 'POST',
    data
  })
}
export function updateUser(data: UserObj) {
  return http.request<Array<UserObj>>({
    url: '/user/update/',
    method: 'PUT',
    data
  })
}
export function deleteUser(data: number) {
  return http.request<Array<UserObj>>({
    url: '/user/delete/',
    method: 'DELETE',
    data
  })
}


