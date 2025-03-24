import { type MenuObj } from '@/http/module/menu/types'
import { type RoleObj } from '@/http/module/role/types'

export interface User {
  refresh: string
  token: string
  username: string
  expire: number | null
  timeStamp: number | null
  menulist: Array<MenuObj>
}
export interface UserInfo {
  username: string
  password: string
}

export interface UserObj {
  id?: number | null
  username: string
  nickname: string
  email: string
  avatar?: string
  mobile?: null | number
  qq?: null | string
  wx?: null | string
  weibo?: null | string
  roles: RoleObj[]
  create_time?: string
  update_time?: string
}
