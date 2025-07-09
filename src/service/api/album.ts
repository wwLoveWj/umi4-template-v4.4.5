import request from "../request";

// 图片上传
export const imgInfoUploadAPI = (params: any): Promise<any> => {
  return request.post("/api/album/upload", params);
};
// 图片上传列表接口
export const imgInfoListAPI = (params: any): Promise<any> => {
  return request.get("/api/album/list", params);
};
