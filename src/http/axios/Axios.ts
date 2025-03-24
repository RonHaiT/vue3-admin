import axios, { type AxiosRequestConfig } from 'axios'
import { message } from 'ant-design-vue'
import { useAuthStore } from '@/stores/auth'; // 导入你的auth store
import router from '@/router/';
// 在全局作用域下声明 isRefreshing 属性
declare global {
  interface Window {
    isRefreshing: boolean;
  }
}
window.isRefreshing = false;
// 被挂起的请求数组
let refreshSubscribers: Array<() => void> = [];


class Axios {
  private instance
  constructor(config: AxiosRequestConfig) {
    this.instance = axios.create(config)
    this.interceptors()
  }

  public async request<T, D = ResponseResult<T>>(config: AxiosRequestConfig) {
    return new Promise<D>(async (resolve, reject) => {
      try {
        const response = await this.instance.request<D>(config)
        resolve(response.data)
      } catch (error) {
        reject(error)
      }
    }) as Promise<D>
  }

  private interceptors() {
    this.interceptorsRequest()
    this.interceptorsResponse()
  }

  private interceptorsRequest() {
    // 添加请求拦截器
    this.instance.interceptors.request.use(
      (config) => {
        //是否需要token
        const isAuth = config.headers.isAuth === "1";

        const authStore = useAuthStore(); // 获取auth store实例
        const token = authStore.token
        const expire = authStore.expire
        let timeStamp = authStore.timeStamp
        if (isAuth) {

          if (expire !== null && (parseInt(String(new Date().getTime())) - timeStamp) / 1000 < expire - 5) {
            config.headers.Authorization = "Bearer " + token;
          } else {
            router.push({ name: "Login" })
          }
        }
        return config
      },
      (error) => {
        // 对请求错误做些什么
        return Promise.reject(error)
      },
    )
  }

  private interceptorsResponse() {
    // 添加响应拦截器
    this.instance.interceptors.response.use(
      (response) => {
        return response
      },
      (error) => {
        console.log(111, error);

        let status = error.response.status
        let msg = ''
        switch (status) {
          case 400:
            msg = '登录失败'
            break
          case 401:
            msg = 'TOKEN过期'
            break
          case 403:
            msg = '无权访问'
            break
          case 404:
            msg = '请求地址错误'
            break
          case 500:
            msg = '服务器故障,联系管理员'
            break
          default:
            msg = '网络故障,请稍后重试'
            break
        }
        const [messageApi, contextHolder] = message.useMessage()
        messageApi.error(msg)
        return Promise.reject(error)
      },
    )
  }
}

export default Axios
