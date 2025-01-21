// apis/match.ts
import request from "../request";

// 获取上传七牛token
export const qiNiuToken = () => {
    return request.get("/match/noAuth/file/getUpToken");
};


