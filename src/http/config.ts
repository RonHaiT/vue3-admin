// config.ts
import { useEnv } from "@/hooks/useEnv";

const { VITE_BASE_API } = useEnv();
console.log('VITE_BASE_API', VITE_BASE_API);

export default {
    baseURL: VITE_BASE_API,
    timeout: 10 * 1000, // 请求超时时间
    headers: { "Content-Type": "application/json;charset=UTF-8", auth: false }
}