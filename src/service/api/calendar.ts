import request from "../request";

// 日历待办信息
export const CalendarInfoListQueryAPI = (params: any) => {
  return request.get<{ list: API.CalendarEvent[] }>("/calendar/query", params);
};
// 日历待办新增
export const CalendarInfoCreateAPI = (params: any): Promise<any> => {
  return request.post("/calendar/create", params);
};
// 日历待办更新
export const CalendarInfoUpdateAPI = (params: any): Promise<any> => {
  return request.post("/calendar/update", params);
};
