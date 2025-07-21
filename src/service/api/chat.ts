/**
 * 聊天API服务
 * 提供聊天相关的API调用方法
 */

import { request } from "../request";

export interface ChatMessage {
  id: number;
  fromUserId: number;
  toUserId: string;
  content: string;
  messageType: "text" | "emoji" | "system";
  isRead: boolean;
  createdAt: string;
  fromAvatar: string; //发送方头像
  fromNickname: string; //昵称
}

export interface ChatSession {
  targetUserId: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  targetAvatar: string;
  targetNickname: string;
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
  userId: number,
  targetUserId: number,
  limit: number = 50,
  offset: number = 0
): Promise<ChatHistoryResponse> => {
  return await request.get(`/api/chat/history/${targetUserId}`, {
    params: {
      userId,
      limit,
      offset,
    },
  });
};

/**
 * 获取聊天会话列表
 * @param userId 用户ID
 */
export const getChatSessionsAPI = async (
  userId: number
): Promise<ChatSession[]> => {
  return await request.get("/api/chat/sessions", {
    params: { userId },
  });
};

/**
 * 标记消息为已读
 * @param userId 当前用户ID
 * @param targetUserId 目标用户ID
 */
export const markChatReadAPI = async (
  userId: number,
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
  userId: number
): Promise<number> => {
  const response = await request.get("/api/chat/unread-count", {
    params: { userId },
  });
  return response.count;
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
