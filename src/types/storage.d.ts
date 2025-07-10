/**
 * 存储相关类型定义
 */

declare namespace Storage {
  /**
   * 登录信息类型 - 存储在localStorage中的用户登录信息
   */
  interface LoginInfo {
    /** 用户ID */
    userId?: string;
    /** 用户ID（备用字段） */
    id?: string;
    /** 用户名 */
    username?: string;
    /** 登录名 */
    loginName?: string;
    /** 邮箱 */
    email?: string;
    /** 头像URL */
    avatar?: string;
    /** 昵称 */
    nickname?: string;
    /** 性别 */
    gender?: "男" | "女" | "保密";
    /** 生日 */
    birthday?: string;
    /** 手机号 */
    phone?: string;
    /** 密码（加密后） */
    password?: string;
    /** 访问令牌 */
    token?: string;
    /** 登录路径 */
    loginPath?: string;
    /** 菜单列表 */
    menuList?: string[];
    /** 用户角色 */
    role?: string;
    /** 用户状态 */
    status?: "active" | "inactive" | "banned";
    /** 创建时间 */
    createTime?: string;
    /** 更新时间 */
    updateTime?: string;
    /** 最后登录时间 */
    lastLoginTime?: string;
    /** 登录次数 */
    loginCount?: number;
    /** 用户类型 */
    userType?: "admin" | "user" | "guest";
    /** 是否在线 */
    isOnline?: boolean;
    /** 用户等级 */
    level?: number;
    /** 积分 */
    points?: number;
    /** 个人简介 */
    bio?: string;
    /** 地址 */
    address?: string;
    /** 公司 */
    company?: string;
    /** 职位 */
    position?: string;
    /** 网站 */
    website?: string;
    /** 社交媒体链接 */
    socialLinks?: {
      wechat?: string;
      weibo?: string;
      qq?: string;
      github?: string;
    };
    /** 偏好设置 */
    preferences?: {
      theme?: "light" | "dark" | "auto";
      language?: string;
      timezone?: string;
      notifications?: boolean;
    };
    /** 扩展字段 */
    [key: string]: any;
  }

  /**
   * 记住密码信息类型
   */
  interface LoginChecked {
    /** 是否记住密码 */
    checked: boolean;
    /** 登录名 */
    loginName: string;
    /** 密码（加密后） */
    password: string;
  }

  /**
   * 应用设置类型
   */
  interface AppSettings {
    /** 主题 */
    theme?: "light" | "dark" | "auto";
    /** 语言 */
    language?: string;
    /** 时区 */
    timezone?: string;
    /** 通知设置 */
    notifications?: boolean;
    /** 自动登录 */
    autoLogin?: boolean;
    /** 记住密码 */
    rememberPassword?: boolean;
  }

  /**
   * 缓存信息类型
   */
  interface CacheInfo {
    /** 缓存大小（MB） */
    size: number;
    /** 缓存时间 */
    timestamp: number;
    /** 缓存类型 */
    type: "localStorage" | "sessionStorage" | "indexedDB";
  }
}

/**
 * 全局存储键名常量
 */
export const STORAGE_KEYS = {
  /** 登录信息 */
  LOGIN_INFO: "login-info",
  /** 记住密码 */
  LOGIN_CHECKED: "loginChecked",
  /** 应用设置 */
  APP_SETTINGS: "app-settings",
  /** 用户偏好 */
  USER_PREFERENCES: "user-preferences",
  /** 缓存信息 */
  CACHE_INFO: "cache-info",
  /** 访问令牌 */
  ACCESS_TOKEN: "access-token",
  /** 刷新令牌 */
  REFRESH_TOKEN: "refresh-token",
} as const;

/**
 * 存储键名类型
 */
export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

/**
 * 存储值类型映射
 */
export interface StorageValueMap {
  [STORAGE_KEYS.LOGIN_INFO]: Storage.LoginInfo;
  [STORAGE_KEYS.LOGIN_CHECKED]: Storage.LoginChecked;
  [STORAGE_KEYS.APP_SETTINGS]: Storage.AppSettings;
  [STORAGE_KEYS.USER_PREFERENCES]: Storage.LoginInfo["preferences"];
  [STORAGE_KEYS.CACHE_INFO]: Storage.CacheInfo;
  [STORAGE_KEYS.ACCESS_TOKEN]: string;
  [STORAGE_KEYS.REFRESH_TOKEN]: string;
}
