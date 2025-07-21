/**
 * 聊天会话管理Hook
 * 提供聊天会话列表的加载、更新等功能
 */

import { useState, useCallback, useEffect } from "react";
import { Toast } from "antd-mobile";
import {
  getChatSessionsAPI,
  markChatReadAPI,
  getChatUnreadCountAPI,
} from "@/service/api/chat";
import { ChatSession } from "@/service/api/chat";

export interface UseChatSessionsReturn {
  // 状态
  sessions: ChatSession[];
  totalUnreadCount: number;
  isLoading: boolean;
  isConnected: boolean;

  // 方法
  loadSessions: (userId: number) => Promise<void>;
  markSessionAsRead: (userId: number, targetUserId: string) => Promise<void>;
  refreshUnreadCount: (userId: number) => Promise<void>;
  updateSession: (session: ChatSession) => void;
  addSession: (session: ChatSession) => void;
}

export const useChatSessions = (): UseChatSessionsReturn => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  /**
   * 加载聊天会话列表
   */
  const loadSessions = useCallback(async (userId: number) => {
    if (!userId) {
      console.warn("用户未登录，无法加载聊天会话");
      return;
    }

    try {
      setIsLoading(true);
      const response = await getChatSessionsAPI(userId);
      if (Array.isArray(response)) {
        setSessions(response);
      } else {
        console.error("聊天会话数据格式错误:", response);
        setSessions([]);
      }
    } catch (error) {
      console.error("加载聊天会话失败:", error);
      Toast.show({
        content: "加载失败",
        icon: "fail",
      });
      setSessions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * 标记会话为已读
   */
  const markSessionAsRead = useCallback(
    async (userId: number, targetUserId: string) => {
      try {
        await markChatReadAPI(userId, targetUserId);

        // 更新本地状态
        setSessions((prev) =>
          prev.map((session) =>
            session.targetUserId === targetUserId
              ? { ...session, unreadCount: 0 }
              : session
          )
        );

        // 重新计算总未读数
        await refreshUnreadCount(userId);
      } catch (error) {
        console.error("标记已读失败:", error);
        Toast.show({
          content: "操作失败",
          icon: "fail",
        });
      }
    },
    []
  );

  /**
   * 刷新未读数量
   */
  const refreshUnreadCount = useCallback(async (userId: number) => {
    if (!userId) return;

    try {
      const count = await getChatUnreadCountAPI(userId);
      setTotalUnreadCount(count);
    } catch (error) {
      console.error("获取未读数量失败:", error);
    }
  }, []);

  /**
   * 更新会话信息
   */
  const updateSession = useCallback((updatedSession: ChatSession) => {
    setSessions((prev) =>
      prev.map((session) =>
        session.targetUserId === updatedSession.targetUserId
          ? updatedSession
          : session
      )
    );
  }, []);

  /**
   * 添加新会话
   */
  const addSession = useCallback((newSession: ChatSession) => {
    setSessions((prev) => {
      // 检查是否已存在
      const exists = prev.some(
        (session) => session.targetUserId === newSession.targetUserId
      );
      if (exists) {
        // 如果存在，更新它
        return prev.map((session) =>
          session.targetUserId === newSession.targetUserId
            ? newSession
            : session
        );
      } else {
        // 如果不存在，添加到开头
        return [newSession, ...prev];
      }
    });
  }, []);

  return {
    sessions,
    totalUnreadCount,
    isLoading,
    isConnected,
    loadSessions,
    markSessionAsRead,
    refreshUnreadCount,
    updateSession,
    addSession,
  };
};
