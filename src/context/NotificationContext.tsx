import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
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
import { Toast } from "antd-mobile";
import { storage } from "@/utils/storage";

interface NotificationContextType {
  notifications: NotificationItem[];
  setNotifications: React.Dispatch<React.SetStateAction<NotificationItem[]>>;
  unreadCount: number;
  setUnreadCount: React.Dispatch<React.SetStateAction<number>>;
  isConnected: boolean;
  setIsConnected: React.Dispatch<React.SetStateAction<boolean>>;
  subscriptionSettings: SubscriptionSettings | null;
  setSubscriptionSettings: React.Dispatch<
    React.SetStateAction<SubscriptionSettings | null>
  >;
  isLoading: boolean;
  markAsRead: (notificationId: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  loadNotifications: (page?: number) => Promise<void>;
  updateSettings: (settings: Partial<SubscriptionSettings>) => Promise<void>;
  refreshUnreadCount: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const useNotificationContext = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx)
    throw new Error(
      "useNotificationContext must be used within NotificationProvider"
    );
  return ctx;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [subscriptionSettings, setSubscriptionSettings] =
    useState<SubscriptionSettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loginInfo = storage.get("login-info");
  const userId = loginInfo?.id;
  const currentPage = useRef(1);
  const hasMore = useRef(true);

  // WebSocket连接
  const connect = useCallback(async () => {
    if (!userId) {
      console.warn("用户未登录，无法连接WebSocket");
      return;
    }
    try {
      await websocketManager.connect({
        url: "ws://localhost:3007/ws",
        userId,
        onConnectionEstablished: (connectionId) => {
          websocketManager.authenticate(userId);
        },
        onAuthenticated: () => {
          setIsConnected(true);
        },
        onNotification: (notification) => {
          setNotifications((prev) => [
            notification as NotificationItem,
            ...prev,
          ]);
          setUnreadCount((prev) => prev + 1);
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
          Toast.show({ content: `连接错误: ${error}`, icon: "fail" });
        },
        onClose: () => {
          setIsConnected(false);
        },
      });
    } catch (error) {
      Toast.show({ content: "连接失败，请检查网络", icon: "fail" });
    }
  }, [userId]);

  // 断开WebSocket
  const disconnect = useCallback(() => {
    websocketManager.disconnect();
    setIsConnected(false);
  }, []);

  // 标记通知为已读
  const markAsRead = useCallback(
    async (notificationId: number) => {
      if (!userId) return;
      try {
        await markNotificationReadAPI(userId, notificationId);
        setNotifications((prev) =>
          prev.map((item) =>
            item.id === notificationId ? { ...item, isRead: true } : item
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (error) {
        Toast.show({ content: "操作失败", icon: "fail" });
      }
    },
    [userId]
  );

  // 标记全部为已读
  const markAllAsRead = useCallback(async () => {
    if (!userId) return;
    try {
      await markAllNotificationsReadAPI(userId);
      setNotifications((prev) =>
        prev.map((item) => ({ ...item, isRead: true }))
      );
      setUnreadCount(0);
      Toast.show({ content: "已全部标记为已读" });
    } catch (error) {
      Toast.show({ content: "操作失败", icon: "fail" });
    }
  }, [userId]);

  // 拉取通知列表
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
        Toast.show({ content: "加载失败", icon: "fail" });
      } finally {
        setIsLoading(false);
      }
    },
    [userId]
  );

  // 更新订阅设置
  const updateSettings = useCallback(
    async (settings: Partial<SubscriptionSettings>) => {
      if (!userId) return;
      try {
        await updateSubscriptionSettingsAPI(userId, settings);
        setSubscriptionSettings((prev) =>
          prev ? { ...prev, ...settings } : null
        );
        Toast.show({ content: "设置已保存" });
      } catch (error) {
        Toast.show({ content: "保存失败", icon: "fail" });
      }
    },
    [userId]
  );

  // 刷新未读数量
  const refreshUnreadCount = useCallback(async () => {
    if (!userId) return;
    try {
      const response = await getUnreadCountAPI(userId);
      if (response && typeof response === "object" && "count" in response) {
        setUnreadCount(response.count);
      }
    } catch (error) {
      // 忽略
    }
  }, [userId]);

  // 拉取订阅设置
  const loadSubscriptionSettings = useCallback(async () => {
    if (!userId) return;
    try {
      const response = await getSubscriptionSettingsAPI(userId);
      if (response) {
        setSubscriptionSettings(response);
      }
    } catch (error) {
      // 忽略
    }
  }, [userId]);

  // 初始化：自动连接WebSocket和拉取通知
  useEffect(() => {
    if (userId) {
      connect();
      loadNotifications(1);
      loadSubscriptionSettings();
      refreshUnreadCount();
    }
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

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        setNotifications,
        unreadCount,
        setUnreadCount,
        isConnected,
        setIsConnected,
        subscriptionSettings,
        setSubscriptionSettings,
        isLoading,
        markAsRead,
        markAllAsRead,
        loadNotifications,
        updateSettings,
        refreshUnreadCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
