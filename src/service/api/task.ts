import request from "../request";

// 任务信息查询
export const TaskInfoQueryAPI = (params = {}): Promise<any> => {
  return request.get("/task/query", { params: { taskStatus: "2", ...params } });
};
// 创建任务
export const ReminderTaskcreateAPI = (params = {}): Promise<any> => {
  return request.post("/task/create", params);
};
// 删除任务
export const ReminderTaskDelAPI = (params = {}): Promise<any> => {
  return request.post("/task/delete", params);
};
// 批量删除任务
export const TaskListBatchDelAPI = (params = {}): Promise<any> => {
  return request.post("/task/batch/delete", params);
};
// 创建任务提醒
export const reminderTaskAPI = (
  params = {}
): Promise<{
  data: {
    userEmail: string;
    reminderContent: string;
    reminderTime: string;
    taskId: string;
    reminderPattern: string;
    interval: string;
  };
}> => {
  return request.post("/reminder/task", params);
};
// 创建定时任务
export const reminderTimeTaskAPI = (params: {
  userEmail: string;
  reminderContent: string;
  reminderTime: string;
  taskId: string;
  reminderPattern: string;
  interval: string;
}): Promise<any> => {
  return request.post("/reminder/time", params);
};

// 取消该任务提醒
export const reminderTimeTaskCancelAPI = (params: {
  taskId?: string;
  jobId?: string;
  taskIdList?: string[];
  action?: "ALL" | "SINGLE";
}): Promise<any> => {
  return request.post("/reminder/task/cancel", params);
};

// 邮箱测试服务
export const testTaskTempAPI = (params: {
  sendToUser?: string;
}): Promise<any> => {
  return request.post("/reminder/test", params);
};
