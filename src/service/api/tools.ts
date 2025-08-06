import request from "../request";

//  一键关机
export const SimJetSoftAPI = (command: string) => {
  return request.get("/api/tools/shutdown", { params: { command } });
};
