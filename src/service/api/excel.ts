import request from "../request";

// 查询待办任务列表
export const ExcelInfoQueryAPI = (params = {}): Promise<any> => {
  return request.get("/excel/query", { params });
};
// 删除待办任务
export const ExcelInfoDelAPI = (data = {}): Promise<any> => {
  return request.post("/excel/delete", data);
};
// excel列表的数据导出
export const ExcelInfoExportAPI = (data = {}): Promise<any> => {
  return request("/excel/export", {
    method: "post",
    data,
    // responseType: "blob",
  });
};
// excel列表的数据导入
export const ExcelInfoImportAPI = (data = {}, params: number): Promise<any> => {
  return request("/excel/import/" + params, {
    method: "post",
    data,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
