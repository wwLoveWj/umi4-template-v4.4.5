import request from "../request";

// 发送定时通知
export const ScheduledNotifyAPI = (params = {}): Promise<any> => {
  return request.post("/scheduled/ww", params);
};

// 取消定时发送
export const ScheduledCancelAPI = (params = {}) => {
  return request.post<null>("/scheduled/cancel", params);
};
