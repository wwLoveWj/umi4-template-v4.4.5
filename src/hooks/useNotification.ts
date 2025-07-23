/**
 * 通知Hook
 * 管理WebSocket连接、通知状态、未读数量等
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { Toast } from "antd-mobile";
import websocketManager, { NotificationData } from "@/utils/websocket";
import {
  getNotificationsAPI,
  markNotificationReadAPI,
  markAllNotificationsReadAPI,
  getUnreadCountAPI,
  getSubscriptionSettingsAPI,
  updateSubscriptionSettingsAPI,
  NotificationItem,
  SubscriptionSettings,
} from "@/service/api/notification";
import { storage } from "@/utils/storage";

export interface UseNotificationReturn {
  // 状态
  notifications: NotificationItem[];
  unreadCount: number;
  subscriptionSettings: SubscriptionSettings | null;
  isConnected: boolean;
  isLoading: boolean;

  // 方法
  connect: () => Promise<void>;
  disconnect: () => void;
  markAsRead: (notificationId: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  loadNotifications: (page?: number) => Promise<void>;
  updateSettings: (settings: Partial<SubscriptionSettings>) => Promise<void>;
  refreshUnreadCount: () => Promise<void>;
}

export const useNotification = (): UseNotificationReturn => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [subscriptionSettings, setSubscriptionSettings] =
    useState<SubscriptionSettings | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loginInfo = storage.get("login-info");
  const userId = loginInfo?.id;
  const currentPage = useRef(1);
  const hasMore = useRef(true);

  /**
   * 连接WebSocket
   */
  const connect = useCallback(async () => {
    if (!userId) {
      console.warn("用户未登录，无法连接WebSocket");
      return;
    }

    try {
      await websocketManager.connect({
        url: "ws://carefully-equal-monarch.ngrok-free.app/", // WebSocket连接地址
        userId,
        onConnectionEstablished: (connectionId) => {
          console.log("WebSocket连接已建立:", connectionId);
          websocketManager.authenticate(userId);
        },
        onAuthenticated: (userId) => {
          console.log("用户认证成功:", userId);
          setIsConnected(true);
        },
        onNotification: (notification) => {
          // 收到新通知
          setNotifications((prev) => [
            notification as NotificationItem,
            ...prev,
          ]);
          setUnreadCount((prev) => prev + 1);

          // 显示通知提醒
          Toast.show({
            content: notification.title,
            duration: 3000,
            position: "top",
          });
        },
        onUnreadCountUpdate: (count) => {
          setUnreadCount(count);
        },
        onError: (error) => {
          console.error("WebSocket错误:", error);
          Toast.show({
            content: `连接错误: ${error}`,
            icon: "fail",
          });
        },
        onClose: () => {
          setIsConnected(false);
          console.log("WebSocket连接已关闭");
        },
      });
    } catch (error) {
      console.error("连接WebSocket失败:", error);
      Toast.show({
        content: "连接失败，请检查网络",
        icon: "fail",
      });
    }
  }, [userId]);

  /**
   * 断开WebSocket连接
   */
  const disconnect = useCallback(() => {
    websocketManager.disconnect();
    setIsConnected(false);
  }, []);

  /**
   * 标记通知为已读
   */
  const markAsRead = useCallback(
    async (notificationId: number) => {
      if (!userId) return;

      try {
        await markNotificationReadAPI(userId, notificationId);

        // 更新本地状态
        setNotifications((prev) =>
          prev.map((item) =>
            item.id === notificationId ? { ...item, isRead: true } : item
          )
        );

        // 更新未读数量
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (error) {
        console.error("标记已读失败:", error);
        Toast.show({
          content: "操作失败",
          icon: "fail",
        });
      }
    },
    [userId]
  );

  /**
   * 标记所有通知为已读
   */
  const markAllAsRead = useCallback(async () => {
    if (!userId) return;

    try {
      await markAllNotificationsReadAPI(userId);

      // 更新本地状态
      setNotifications((prev) =>
        prev.map((item) => ({ ...item, isRead: true }))
      );

      // 清空未读数量
      setUnreadCount(0);

      Toast.show({
        content: "已全部标记为已读",
      });
    } catch (error) {
      console.error("标记全部已读失败:", error);
      Toast.show({
        content: "操作失败",
        icon: "fail",
      });
    }
  }, [userId]);

  /**
   * 加载通知列表
   */
  const loadNotifications = useCallback(
    async (page = 1) => {
      if (!userId || !hasMore.current) return;

      try {
        setIsLoading(true);
        const response = await getNotificationsAPI(userId, page, 20);

        if (response && Array.isArray(response) && response.length > 0) {
          if (page === 1) {
            setNotifications(response);
          } else {
            setNotifications((prev) => [...prev, ...response]);
          }
          currentPage.current = page;
          hasMore.current = response.length === 20;
        } else {
          hasMore.current = false;
        }
      } catch (error) {
        console.error("加载通知失败:", error);
        Toast.show({
          content: "加载失败",
          icon: "fail",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [userId]
  );

  /**
   * 更新订阅设置
   */
  const updateSettings = useCallback(
    async (settings: Partial<SubscriptionSettings>) => {
      if (!userId) return;

      try {
        await updateSubscriptionSettingsAPI(userId, settings);

        // 更新本地状态
        setSubscriptionSettings((prev) =>
          prev ? { ...prev, ...settings } : null
        );

        Toast.show({
          content: "设置已保存",
        });
      } catch (error) {
        console.error("更新设置失败:", error);
        Toast.show({
          content: "保存失败",
          icon: "fail",
        });
      }
    },
    [userId]
  );

  /**
   * 刷新未读数量
   */
  const refreshUnreadCount = useCallback(async () => {
    if (!userId) return;

    try {
      const response = await getUnreadCountAPI(userId);
      if (response && typeof response === "object" && "count" in response) {
        setUnreadCount(response.count);
      }
    } catch (error) {
      console.error("获取未读数量失败:", error);
    }
  }, [userId]);

  /**
   * 加载订阅设置
   */
  const loadSubscriptionSettings = useCallback(async () => {
    if (!userId) return;

    try {
      const response = await getSubscriptionSettingsAPI(userId);
      if (response) {
        setSubscriptionSettings(response);
      }
    } catch (error) {
      console.error("加载订阅设置失败:", error);
    }
  }, [userId]);

  // 初始化
  useEffect(() => {
    if (userId) {
      // 连接WebSocket
      connect();

      // 加载初始数据
      loadNotifications(1);
      loadSubscriptionSettings();
      refreshUnreadCount();
    }

    // 清理函数
    return () => {
      disconnect();
    };
  }, [
    userId,
    connect,
    disconnect,
    loadNotifications,
    loadSubscriptionSettings,
    refreshUnreadCount,
  ]);

  return {
    // 状态
    notifications,
    unreadCount,
    subscriptionSettings,
    isConnected,
    isLoading,

    // 方法
    connect,
    disconnect,
    markAsRead,
    markAllAsRead,
    loadNotifications,
    updateSettings,
    refreshUnreadCount,
  };
};
