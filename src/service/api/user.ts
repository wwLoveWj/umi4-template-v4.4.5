import request from "../request";
/**
 * 全局 API 接口编写规则：
 * 1. 首字母大写，并且驼峰命名
 * 2. 尾部以 API 结尾，表明属于接口字段
 * 3. 功能以 " CREATE | UPDATE | DEL | QUERY "表明接口用途
 */
export const Login = () => {
  return request.post<{
    token: string;
  }>("/api/user/login");
};
// 获取用户的所有基础信息接口
export const verify = (params = {}): Promise<any> => {
  return request.get<API.UseInfoType>("/userInfo/check", params);
};
// 查询用户信息接口
export const UserInfoQueryAPI = (params = {}): Promise<any> => {
  return request.get<API.UseInfoType>("/userInfo/query", params);
};
// 更新app部分的用户信息
export const UserInfoUpdateAPI = (params: { userId: string }) => {
  return request.post("/userInfo/update", params);
};
