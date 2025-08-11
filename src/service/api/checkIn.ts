import axios from "axios";
// import request from "../request";
// 逆地理编码
// export const GetLocationRegeoAPI = (params) =>
//   request.get("https://restapi.amap.com/v2/geocode/regeo", {
//     params,
//   });
export const GetLocationRegeoAPI = (params) =>
  axios.get("https://restapi.amap.com/v3/geocode/regeo", {
    params,
  });
