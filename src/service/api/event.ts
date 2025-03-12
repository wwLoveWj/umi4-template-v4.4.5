import request from "../request";

// 大事件信息
export const EventInfoListQueryAPI = (
  params: any
): Promise<API.EventInfoType[]> => {
  return request.get("/event/query", { params });
};
// 事件记录新增
export const EventInfoCreateAPI = (params: any): Promise<any> => {
  return request.post("/event/create", params);
};
// 事件记录更新
export const EventInfoUpdateAPI = (params: {
  status: "finish" | "error" | "wait" | "process";
  finishTime: string;
  eventId: string;
}): Promise<any> => {
  return request.post("/event/update", params);
};
