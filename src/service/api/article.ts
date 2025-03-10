import request from "../request";

// 文章列表信息
export const ArticleInfoListQueryAPI = (params: any) => {
  return request.get<{ list: API.ArticleTableDataType[] }>(
    "/article/query",
    params
  );
};
// 创建文章
export const ArticleInfoCreateAPI = (params: any): Promise<any> => {
  return request.post("/article/create", params);
};
// 编辑文章
export const ArticleInfoUpdateAPI = (params: any): Promise<any> => {
  return request.post("/article/edit", params);
};
// 删除对应的文章列表信息
export const ArticleInfoDelAPI = (params: { editorId: string }) => {
  return request.post<null>("/article/delete", params);
};
// 根据editorId查询文章对应明细
export const ArticleInfoDetailsAPI = (
  params: any
): Promise<API.ArticleTableDataType> => {
  return request.post("/article/details", params);
};
