// request.ts
import type { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import axios from "axios";
import config from "./config";
import { message } from 'ant-design-vue'
// 创建 axios 实例
const request: AxiosInstance = axios.create(config);

// 请求拦截器
request.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // 可以在这里添加 token 或者其他请求头
        // 例如，如果有 token，可以从 localStorage 获取并加入请求头
        const token = localStorage.getItem("token");
        if (token) {
            config.headers!["Authorization"] = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError) => {
        // 请求错误处理
        return Promise.reject(error);
    }
);

// 响应拦截器
request.interceptors.response.use(
    (response: AxiosResponse) => {
        // 可以在这里进行响应数据的处理
        return response.data;
    },
    (error: AxiosError) => {
        // 响应错误处理
        if (error.response) {
            // 请求已发出，但服务器响应的状态码不在 2xx 范围内
            message.error('响应错误')
            console.error("响应错误:", error.response);
            // 可以根据响应状态码进行不同的错误提示处理
            switch (error.response.status) {
                case 401:
                    // Token 过期，跳转到登录页
                    break;
                case 500:
                    message.error('服务器错误，请稍后再试')
                    console.error("服务器错误，请稍后再试");
                    break;
                default:
                    message.error('未知错误')
                    console.error(`未知错误: ${error.response.status}`);
            }
        } else {
            // 处理没有响应的情况（例如：网络错误）
            message.error('请求失败，网络错误')
            console.error("请求失败，网络错误");
        }
        return Promise.reject(error);
    }
);

// 导出封装好的 axios 实例
export default request;
