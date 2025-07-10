/**
 * LoginInfo 类型使用示例
 * 展示如何正确使用 LoginInfoType 类型定义
 */

import { storage } from "@/utils/storage";

/**
 * 获取登录信息的类型安全方法
 */
export function getLoginInfo(): API.LoginInfoType | null {
  return storage.get("login-info") as API.LoginInfoType | null;
}

/**
 * 设置登录信息的类型安全方法
 */
export function setLoginInfo(loginInfo: API.LoginInfoType): void {
  storage.set("login-info", loginInfo);
}

/**
 * 更新登录信息的部分字段
 */
export function updateLoginInfo(updates: Partial<API.LoginInfoType>): void {
  const currentInfo = getLoginInfo();
  if (currentInfo) {
    const updatedInfo = { ...currentInfo, ...updates };
    setLoginInfo(updatedInfo);
  }
}

/**
 * 获取用户ID（兼容多种字段名）
 */
export function getUserId(): string | undefined {
  const loginInfo = getLoginInfo();
  return loginInfo?.userId || loginInfo?.id;
}

/**
 * 获取用户名（兼容多种字段名）
 */
export function getUsername(): string | undefined {
  const loginInfo = getLoginInfo();
  return loginInfo?.username || loginInfo?.loginName;
}

/**
 * 获取用户头像
 */
export function getUserAvatar(): string | undefined {
  const loginInfo = getLoginInfo();
  return loginInfo?.avatar;
}

/**
 * 检查用户是否已登录
 */
export function isLoggedIn(): boolean {
  const loginInfo = getLoginInfo();
  return !!(loginInfo?.token && (loginInfo?.userId || loginInfo?.id));
}

/**
 * 获取用户基本信息
 */
export function getUserBasicInfo(): {
  userId?: string;
  username?: string;
  email?: string;
  avatar?: string;
  nickname?: string;
} {
  const loginInfo = getLoginInfo();
  return {
    userId: loginInfo?.userId || loginInfo?.id,
    username: loginInfo?.username || loginInfo?.loginName,
    email: loginInfo?.email,
    avatar: loginInfo?.avatar,
    nickname: loginInfo?.nickname,
  };
}

/**
 * 获取用户偏好设置
 */
export function getUserPreferences(): API.LoginInfoType["preferences"] {
  const loginInfo = getLoginInfo();
  return loginInfo?.preferences;
}

/**
 * 更新用户偏好设置
 */
export function updateUserPreferences(
  preferences: API.LoginInfoType["preferences"]
): void {
  updateLoginInfo({ preferences });
}

/**
 * 清除登录信息
 */
export function clearLoginInfo(): void {
  storage.del("login-info");
}

// 使用示例：

/**
 * 示例：在组件中使用类型安全的登录信息
 */
export function exampleUsage() {
  // 获取登录信息
  const loginInfo = getLoginInfo();

  if (loginInfo) {
    // 类型安全的访问
    console.log("用户ID:", loginInfo.userId || loginInfo.id);
    console.log("用户名:", loginInfo.username || loginInfo.loginName);
    console.log("邮箱:", loginInfo.email);
    console.log("头像:", loginInfo.avatar);
    console.log("昵称:", loginInfo.nickname);
    console.log("性别:", loginInfo.gender);
    console.log("生日:", loginInfo.birthday);
    console.log("手机号:", loginInfo.phone);
    console.log("用户类型:", loginInfo.userType);
    console.log("用户等级:", loginInfo.level);
    console.log("积分:", loginInfo.points);
    console.log("个人简介:", loginInfo.bio);
    console.log("地址:", loginInfo.address);
    console.log("公司:", loginInfo.company);
    console.log("职位:", loginInfo.position);
    console.log("网站:", loginInfo.website);

    // 访问嵌套对象
    if (loginInfo.socialLinks) {
      console.log("微信:", loginInfo.socialLinks.wechat);
      console.log("微博:", loginInfo.socialLinks.weibo);
      console.log("QQ:", loginInfo.socialLinks.qq);
      console.log("GitHub:", loginInfo.socialLinks.github);
    }

    if (loginInfo.preferences) {
      console.log("主题:", loginInfo.preferences.theme);
      console.log("语言:", loginInfo.preferences.language);
      console.log("时区:", loginInfo.preferences.timezone);
      console.log("通知:", loginInfo.preferences.notifications);
    }
  }
}

/**
 * 示例：更新用户信息
 */
export function exampleUpdateUserInfo() {
  // 更新头像
  updateLoginInfo({
    avatar: "https://example.com/avatar.jpg",
  });

  // 更新多个字段
  updateLoginInfo({
    nickname: "新昵称",
    gender: "男",
    birthday: "1990-01-01",
    phone: "13800138000",
    bio: "这是我的个人简介",
  });

  // 更新偏好设置
  updateUserPreferences({
    theme: "dark",
    language: "zh-CN",
    timezone: "Asia/Shanghai",
    notifications: true,
  });

  // 更新社交媒体链接
  updateLoginInfo({
    socialLinks: {
      wechat: "my_wechat",
      weibo: "my_weibo",
      qq: "123456789",
      github: "my_github",
    },
  });
}
