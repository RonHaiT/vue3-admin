// apis/user.ts
import request from "../request";

// 获取用户信息
export const getUserInfo = () => {
    return request.get("/user/info");  // 假设这是用户信息接口
};

// 登录
export const login = (data: { username: string; password: string }) => {
    return request.post("/user/login", data);
};
