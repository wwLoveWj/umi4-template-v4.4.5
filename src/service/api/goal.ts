import request from "../request";

export const getGoals = (userId: string) =>
  request.get("/goals?userId=" + userId);
export const addGoal = (data: any) => request.post("/goals", data);
export const completeGoal = (id: number) =>
  request.post(`/goals/${id}/complete`);
export const setGoalRemind = (id: number, remindTimes: string[]) =>
  request.post(`/goals/${id}/remind`, { remindTimes });
export const deleteGoal = (id: number) => request.delete(`/goals/${id}`);
