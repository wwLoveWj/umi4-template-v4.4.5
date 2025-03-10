import request from "../request";
import axios from "axios";
import { getToken } from "@/utils/localToken";

export const imgInfoQueryAPI = (params = {}): Promise<any> => {
  return request.get<API.ImageUploadType>("/file/query", { params });
};

// 单张图片的删除
export const imgInfoDeleteAPI = (params = {}) => {
  return request.post<null>("/file/delete", params);
};

// 上传图片
export const uploadImgAPI = async (formData: any): Promise<any> => {
  let token = await getToken();
  return axios({
    url: "http://localhost:3007/file/upload",
    method: "post",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
    data: formData,
  });
};
