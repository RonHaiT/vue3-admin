import { type AxiosRequestConfig } from 'axios'
import { env } from '@/types/helper'
let baseURL = env.VITE_API_URL
baseURL = '/api/'
let config = {
    baseURL: baseURL,
    timeout: 100000,
    method: 'GET',
} as AxiosRequestConfig

// baseURL = 'http://127.0.0.1:8008/api'
export default config
