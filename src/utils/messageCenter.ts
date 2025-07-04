/**
 * 消息中心工具
 * 用于管理全局消息（如点赞、收藏提醒）
 */

export interface MessageItem {
  id: string;
  type: "like" | "collect";
  articleId: string;
  articleTitle: string;
  time: string;
  read: boolean;
  content: string;
}

const STORAGE_KEY = "my_umi_mobile_messages";

/** 获取所有消息 */
export function getMessages(): MessageItem[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as MessageItem[];
  } catch {
    return [];
  }
}

/** 添加一条消息 */
export function addMessage(msg: Omit<MessageItem, "id" | "read" | "time">) {
  const messages = getMessages();
  const newMsg: MessageItem = {
    ...msg,
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    time: new Date().toISOString(),
    read: false,
  };
  messages.unshift(newMsg);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
}

/** 标记消息为已读 */
export function markMessageRead(id: string) {
  const messages = getMessages();
  const idx = messages.findIndex((m) => m.id === id);
  if (idx !== -1) {
    messages[idx].read = true;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }
}

/** 全部标记为已读 */
export function markAllRead() {
  const messages = getMessages().map((m) => ({ ...m, read: true }));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
}
