
/**import qs from 'qs';
 * axios将 JavaScript 对象序列化为 JSON 。 要以application/x-www-form-urlencoded格式发送数据,使用qs库转换
 * let params = qs.stringify({ 'a': 1, b: '2' })
 */

import request from "../request";

// 获取用户信息
export const getUserInfo = () => {
    return request.get("/user/info");  // 假设这是用户信息接口
};

// 登录
export const authLogin = (data: LoginParams) => {
    return request.post<LoginParams, { data: 0 }>("/auth/oauth/token", data);
};
// 获取上传七牛token
export const qiNiuToken = () => {
    return request.get("/match/noAuth/file/getUpToken");
};
