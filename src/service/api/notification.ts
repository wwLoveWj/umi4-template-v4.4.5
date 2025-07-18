/**
 * 通知相关API接口
 */

import { request } from "../request";

export interface NotificationItem {
  id: number;
  userId: number;
  type: "system" | "article_update" | "like" | "collect" | "follow" | "comment";
  title: string;
  content: string;
  relatedId?: number;
  relatedType?: string;
  isRead: boolean;
  createdAt: string;
  avatar: string;
}

export interface SubscriptionSettings {
  id: number;
  userId: number;
  articleUpdate: boolean;
  likeNotification: boolean;
  collectNotification: boolean;
  followNotification: boolean;
  systemNotification: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * 获取用户通知列表
 * @param userId 用户ID
 * @param page 页码
 * @param pageSize 每页数量
 */
export const getNotificationsAPI = (
  userId: string | number,
  page = 1,
  pageSize = 20
) => {
  return request<NotificationItem[]>({
    url: "/notice/notifications",
    method: "GET",
    params: { userId, page, pageSize },
  });
};

/**
 * 标记通知为已读
 * @param userId 用户ID
 * @param notificationId 通知ID
 */
export const markNotificationReadAPI = (
  userId: string | number,
  notificationId: number
) => {
  return request({
    url: `/notice/notifications/${notificationId}/read`,
    method: "PUT",
    data: { userId },
  });
};

/**
 * 标记所有通知为已读
 * @param userId 用户ID
 */
export const markAllNotificationsReadAPI = (userId: string | number) => {
  return request({
    url: "/notice/notifications/read-all",
    method: "PUT",
    data: { userId },
  });
};

/**
 * 获取未读通知数量
 * @param userId 用户ID
 */
export const getUnreadCountAPI = (userId: string | number) => {
  return request<{ count: number }>({
    url: "/notice/notifications/unread-count",
    method: "GET",
    params: { userId },
  });
};

/**
 * 获取用户订阅设置
 * @param userId 用户ID
 */
export const getSubscriptionSettingsAPI = (userId: string | number) => {
  return request<SubscriptionSettings>({
    url: "/notice/subscription-settings",
    method: "GET",
    params: { userId },
  });
};

/**
 * 更新用户订阅设置
 * @param userId 用户ID
 * @param settings 订阅设置
 */
export const updateSubscriptionSettingsAPI = (
  userId: string | number,
  settings: Partial<
    Omit<SubscriptionSettings, "id" | "userId" | "createdAt" | "updatedAt">
  >
) => {
  return request({
    url: "/notice/subscription-settings",
    method: "PUT",
    data: { userId, ...settings },
  });
};

/**
 * 发送系统通知（管理员接口）
 * @param title 通知标题
 * @param content 通知内容
 * @param userIds 目标用户ID数组（可选，为空则发送给所有用户）
 */
export const sendSystemNotificationAPI = (
  title: string,
  content: string,
  userIds?: number[]
) => {
  return request({
    url: "/notice/notifications/system",
    method: "POST",
    data: { title, content, userIds },
  });
};
