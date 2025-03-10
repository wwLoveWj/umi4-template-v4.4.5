import { STORAGE_PARAMS } from "@/constant/constant";
// import localforage from 'localforage';
/**
 * 获取本地Token
 */
export const getToken = async (): Promise<string | null> => {
  return await localStorage.getItem(STORAGE_PARAMS.tokenKey);
};

/**
 * 设置存储本地Token
 */
export const setToken = async (token: string): Promise<boolean> => {
  try {
    await localStorage.setItem(STORAGE_PARAMS.tokenKey, token);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * 移除本地Token
 */
export const removeToken = async (): Promise<boolean> => {
  try {
    await localStorage.removeItem(STORAGE_PARAMS.tokenKey);
    return true;
  } catch (error) {
    return false;
  }
};
