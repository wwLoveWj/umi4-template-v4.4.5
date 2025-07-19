/**
 * 聊天API服务
 * 提供聊天相关的API调用方法
 */

import { request } from "../request";

export interface ChatMessage {
  id: number;
  fromUserId: string;
  toUserId: string;
  content: string;
  messageType: "text" | "emoji" | "system";
  isRead: boolean;
  createdAt: string;
}

export interface ChatSession {
  targetUserId: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export interface ChatHistoryResponse {
  messages: ChatMessage[];
  hasMore: boolean;
}

/**
 * 获取聊天历史记录
 * @param userId 当前用户ID
 * @param targetUserId 目标用户ID
 * @param limit 限制数量
 * @param offset 偏移量
 */
export const getChatHistoryAPI = async (
  userId: string,
  targetUserId: string,
  limit: number = 50,
  offset: number = 0
): Promise<ChatHistoryResponse> => {
  const response = await request.get(`/api/chat/history/${targetUserId}`, {
    params: {
      userId,
      limit,
      offset,
    },
  });
  return response.data;
};

/**
 * 获取聊天会话列表
 * @param userId 用户ID
 */
export const getChatSessionsAPI = async (
  userId: string
): Promise<ChatSession[]> => {
  const response = await request.get("/api/chat/sessions", {
    params: { userId },
  });
  return response.data;
};

/**
 * 标记消息为已读
 * @param userId 当前用户ID
 * @param targetUserId 目标用户ID
 */
export const markChatReadAPI = async (
  userId: string,
  targetUserId: string
): Promise<void> => {
  await request.post(`/api/chat/read/${targetUserId}`, {
    userId,
  });
};

/**
 * 撤回消息
 * @param messageId 消息ID
 * @param userId 用户ID
 */
export const recallMessageAPI = async (
  messageId: string,
  userId: string
): Promise<void> => {
  await request.post(`/api/chat/recall/${messageId}`, {
    userId,
  });
};

/**
 * 获取未读消息数量
 * @param userId 用户ID
 */
export const getChatUnreadCountAPI = async (
  userId: string
): Promise<number> => {
  const response = await request.get("/api/chat/unread-count", {
    params: { userId },
  });
  return response.data.count;
};

/**
 * 删除聊天记录
 * @param userId 当前用户ID
 * @param targetUserId 目标用户ID
 */
export const deleteChatHistoryAPI = async (
  userId: string,
  targetUserId: string
): Promise<void> => {
  await request.delete(`/api/chat/history/${targetUserId}`, {
    data: { userId },
  });
};
