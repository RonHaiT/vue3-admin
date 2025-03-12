// request.ts
import type { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import axios from "axios";
import config from "./config";
import { message } from 'ant-design-vue'
const request: AxiosInstance = axios.create(config);

// 请求拦截器
request.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers!["Authorization"] = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// 响应拦截器
request.interceptors.response.use(
    (response: AxiosResponse) => {
        return response.data;
    },
    (error: AxiosError) => {
        if (error.response) {
            console.error("响应错误:", error.response);
            switch (error.response.status) {
                case 401:
                    break;
                case 500:
                    console.error("服务器错误，请稍后再试");
                    break;
                default:
                    message.error('未知错误')
                    console.error(`未知错误: ${error.response.status}`);
            }
        } else {
            message.error('请求失败，网络错误')
            console.error("请求失败，网络错误");
        }
        return Promise.reject(error);
    }
);

export default request;
