import { defineStore } from 'pinia'
import http from '@/apis/index'
import type { UserObj, } from '@/apis/module/user/types'
import type { MenuObj } from '@/apis/module/menu/types'
import { message } from 'ant-design-vue';
import router from '@/router';


message.config({
  top: `220px`,
});
interface FormState {
  username: string
  password: string
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    activeKey: '1',
    remember: false,
    menuList: [] as MenuObj[],
    title: '',
    token: "",
    refresh: '',
    userName: '',
    timeStamp: 0,
    expire: 0,
    userList: [] as UserObj[],
    selectedKeys: [''],
    openKeys: [''],
    collapsed: false,
    breadcrumb: [] as MenuObj[],
    checkedKeys: [1]
  }),
  actions: {
    async login(data: FormState) {
      try {
        let res = await http.user.login(data)
        if (res.status == 0) {
          let data = res.data.menulist

          const homeMenuItem: MenuObj = {
            id: -1,
            name: "首页",
            icon: "bx-home-alt",
            url: "/system/Home",
            path: 'Home',
            children: [],
            btn_permission: null,
            enable: 1,
            sort: 1,
            type: 1
          };
          data.unshift(homeMenuItem)
          this.menuList = data
          this.breadcrumb = [homeMenuItem]
          this.token = res.data.token
          this.refresh = res.data.refresh
          this.userName = res.data.username
          this.expire = res.data.expire as number;
          this.timeStamp = new Date().getTime()
          this.selectedKeys = ['main-1']
          message.success('登录成功');
          router.replace({ name: 'Dashboard' })
        }
      } catch (error) {
        console.log(error);
      }
    },
    logout() {
      let state = {
        activeKey: '1',
        remember: false,
        menuList: [],
        token: "",
        refresh: '',
        userName: '',
        userList: [],
      }
      Object.assign(this.$state, state);
      message.success('注销成功');
      router.replace({ name: 'Login' })
    },
    async getUserList() {
      try {
        let res = await http.user.userList()
        if (res.status == 0) {
          this.userList = res.data
        }
      } catch (error) {
        console.log(error);
      }
    },
    async addUser(data: UserObj) {
      try {
        let res = await http.user.addUser(data)
        if (res.status == 0) {
          this.userList = res.data
        }
      } catch (error) {
        console.log(error);
      }
    },
    async updateUser(data: UserObj) {
      try {
        let res = await http.user.updateUser(data)
        if (res.status == 0) {
          this.userList = res.data
        }
      } catch (error) {
        console.log(error);
      }
    },
    async deleteUser(id: number) {
      try {
        let res = await http.user.deleteUser(id)
        if (res.status == 0) {
          this.userList = res.data
        }
      } catch (error) {
        console.log(error);
      }
    },
  },
  persist: {
    key: 'auth',
  }
})
