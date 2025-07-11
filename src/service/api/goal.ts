import request from "../request";

export const getGoals = () =>
  request.get("/goals?userId=" + localStorage.getItem("userId"));
export const addGoal = (data: any) =>
  request.post("/goals", { ...data, userId: localStorage.getItem("userId") });
export const completeGoal = (id: number) =>
  request.post(`/goals/${id}/complete`);
export const setGoalRemind = (id: number, remindTimes: string[]) =>
  request.post(`/goals/${id}/remind`, { remindTimes });
export const deleteGoal = (id: number) => request.delete(`/goals/${id}`);
