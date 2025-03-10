import request from "../request";

// 吃奶信息
export const FeedingInfoListQueryAPI = (params: any) => {
  return request.get<{ list: API.ArticleTableDataType[] }>(
    "/feeding/query",
    params
  );
};
// 吃奶记录
export const FeedingInfoCreateAPI = (params: any): Promise<any> => {
  return request.post("/feeding/create", params);
};
// 吃奶记录更新
export const FeedingInfoUpdateAPI = (params: any): Promise<any> => {
  return request.post("/feeding/edit", params);
};
