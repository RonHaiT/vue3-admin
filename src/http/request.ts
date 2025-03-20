import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';
import { message } from 'ant-design-vue';
import { useUserStore } from '@/stores/user';
import { useRouter } from 'vue-router';
import { authLogin } from '@/http/apis/user';
import config from '@/http/config'
enum TokenType {
    pwd = 'pwd',
    sms = 'sms',
    refresh = 'refresh'
}

class Http {
    private instance: AxiosInstance;
    private userStore;
    private requestQueue: Array<() => Promise<any>> = [];
    private isRefreshingToken = false;
    private router;

    constructor(userStore: ReturnType<typeof useUserStore>) {
        this.userStore = userStore;
        this.router = useRouter();

        this.instance = axios.create(config);

        this.setupInterceptors();
    }

    private setupInterceptors() {
        // 请求拦截器
        this.instance.interceptors.request.use((config) => {
            if (config.headers.auth) {
                if (!this.userStore.accessToken) {
                    message.warn('请登录');
                    setTimeout(() => this.router.push('/login'), 300);
                    return Promise.reject(new Error('未登录'));
                }

                const currentTime = Math.floor(Date.now() / 1000);
                let expiresAt = this.userStore.expiresAt;

                if (expiresAt - currentTime < 30) {
                    return this.handle401(() => this.instance(config));
                }

                config.headers.Authorization = `${this.userStore.accessToken}`;
            }
            return config;
        });

        // 响应拦截器
        this.instance.interceptors.response.use(
            (response: AxiosResponse) => response.data,
            async (error) => {
                const { response } = error;
                if (response?.status === 401) {
                    return this.handle401(() => this.instance(error.config));
                }

                message.error(response?.data?.message || '请求出错');
                return Promise.reject(error);
            }
        );
    }

    async get<TResponse>(url: string, params?: Record<string, any>, headers?: Record<string, string>): Promise<TResponse> {
        return this.instance.get(url, { params, headers });
    }

    async post<TRequest, TResponse>(url: string, data?: TRequest, headers?: Record<string, string>): Promise<TResponse> {
        return this.instance.post(url, data, { headers });
    }

    async put<TRequest, TResponse>(url: string, data?: TRequest, headers?: Record<string, string>): Promise<TResponse> {
        return this.instance.put(url, data, { headers });
    }

    async delete<TResponse>(url: string, headers?: Record<string, string>): Promise<TResponse> {
        return this.instance.delete(url, { headers });
    }

    private async handle401<TResponse>(requestFunc: () => Promise<TResponse>): Promise<TResponse> {
        return new Promise<TResponse>((resolve, reject) => {
            this.requestQueue.push(requestFunc);

            if (!this.isRefreshingToken) {
                this.isRefreshingToken = true;
                this.refreshToken()
                    .then(() => {
                        this.processRequestQueue();
                        resolve(requestFunc());
                    })
                    .catch((error) => {
                        this.requestQueue = [];
                        reject(error);
                    })
                    .finally(() => {
                        this.isRefreshingToken = false;
                    });
            }
        });
    }

    private async refreshToken() {
        try {
            const response = await authLogin({
                clientId: 'PcK8xDtgS11smvem',
                refreshToken: this.userStore.refreshToken,
                secret: 'LjGaldZe66wTxIcz5d1iz4zV1TPVQnuJ',
                tokenType: TokenType.refresh,
            });

            if (response.status === 0) {
                this.userStore.setTokens(response.data.accessToken, response.data.refreshToken, response.data.expiresIn);
                this.userStore.setUserInfo(response.data.userInfo);
            } else {
                message.error('登录失效，请重新登录');
                this.router.push('/login');
            }
        } catch (error) {
            message.error('登录失效，请重新登录');
            this.router.push('/login');
            throw error;
        }
    }

    private async processRequestQueue() {
        while (this.requestQueue.length > 0) {
            const request = this.requestQueue.shift();
            if (request) {
                try {
                    await request();
                } catch (error) {
                    console.error('请求队列中的请求失败', error);
                }
            }
        }
    }
}
const request = new Http(useUserStore());
export default request;
