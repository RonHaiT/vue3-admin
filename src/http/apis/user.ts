// apis/user.ts
import request from "../request";

// 获取用户信息
export const getUserInfo = () => {
    return request.get("/user/info");  // 假设这是用户信息接口
};

// 登录
export const login = (data: LoginParams) => {
    return request.post("/user/login", data);
};
// 获取上传七牛token
export const qiNiuToken = () => {
    return request.get("/match/noAuth/file/getUpToken");
};
