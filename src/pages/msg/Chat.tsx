import React, { useRef, useState, useEffect, useCallback } from "react";
import { NavBar, Input, Toast, Badge, List, Popup, Button } from "antd-mobile";
import { history, useParams, useLocation } from "umi";
import websocketManager from "../../utils/websocket";
import { SendOutline, SmileOutline } from "antd-mobile-icons";
import { getChatHistoryAPI, markChatReadAPI } from "../../service/api/chat";
import { storage } from "../../utils/storage";

// 表情列表
const emojiList = [
  "😀",
  "😁",
  "😍",
  "😘",
  "😳",
  "😭",
  "😴",
  "😡",
  "😏",
  "😜",
  "😅",
  "😆",
  "😓",
  "😢",
  "😱",
  "😲",
  "😤",
  "😋",
  "😎",
  "😐",
  "❤️",
  "👍",
  "👎",
  "🎉",
  "🔥",
  "💯",
  "😊",
  "😂",
  "🤔",
  "👏",
];

interface ChatMessage {
  id: string;
  from: string;
  fromUserId: number;
  toUserId: string;
  avatar?: string;
  content: string;
  time: string;
  self: boolean;
  unread: boolean;
  type: "text" | "emoji" | "system";
}

export default function ChatPage() {
  const loginInfo = storage.get("login-info");
  const location = useLocation();
  const session = location.state?.session;
  const params = useParams<{ userId: string }>();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [showEmoji, setShowEmoji] = useState(false);
  const [popup, setPopup] = useState<{ visible: boolean; msgId?: string }>({
    visible: false,
  });
  const [targetUser, setTargetUser] = useState<API.LoginInfoType>(
    loginInfo || {
      nickname: "系统",
      avatar:
        "https://img1.baidu.com/it/u=2302465390,3219849774&fm=253&app=138&size=w931&n=0&f=JPEG&fmt=auto",
    }
  );

  const inputRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // 组件挂载时滚动到底部
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // 加载聊天记录
  useEffect(() => {
    if (params.userId) {
      loadChatHistory();
    }
  }, [params.userId]);

  // 加载聊天历史
  const loadChatHistory = async () => {
    try {
      // 这里应该调用API获取聊天记录
      // const response = await fetch(`/api/chat/history/${params.userId}`);
      // const data = await response.json();
      // setMessages(data.messages);

      const loginInfo = storage.get("login-info");
      const currentUserId = loginInfo?.id;

      if (!currentUserId || !params.userId) {
        Toast.show("用户信息获取失败");
        return;
      }

      // 调用API获取聊天记录
      const response = await getChatHistoryAPI(
        currentUserId,
        Number(params.userId)
      );
      // 转换API数据格式为组件需要的格式
      const formattedMessages: ChatMessage[] = response.messages?.map(
        (msg) => ({
          id: String(msg.id),
          from:
            msg.fromUserId === currentUserId
              ? "我"
              : session?.targetNickname || "对方",
          fromUserId: msg.fromUserId,
          toUserId: msg.toUserId,
          avatar:
            msg.fromUserId === currentUserId
              ? targetUser.avatar
              : session?.targetAvatar ||
                "https://img1.baidu.com/it/u=2302465390,3219849774&fm=253&app=138&size=w931&n=0&f=JPEG&fmt=auto",
          content: msg.content,
          time: new Date(msg.createdAt).toTimeString().slice(0, 5),
          self: msg.fromUserId === currentUserId,
          unread: !msg.isRead && msg.fromUserId !== currentUserId,
          type: msg.messageType as "text" | "emoji" | "system",
        })
      );

      setMessages(formattedMessages);

      // 标记消息为已读
      if (formattedMessages.some((msg) => !msg.self && msg.unread)) {
        await markChatReadAPI(currentUserId, params.userId);
      }
    } catch (error) {
      console.error("加载聊天记录失败:", error);
      Toast.show("加载聊天记录失败");
    }
  };

  // 发送消息到WebSocket
  const sendMessageToWebSocket = useCallback(async (messageData: any) => {
    try {
      websocketManager.send(messageData);
    } catch (error) {
      console.error("发送WebSocket消息失败:", error);
      throw error;
    }
  }, []);

  // 发送消息
  const sendMsg = useCallback(async () => {
    if (!input.trim() || !params.userId) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      from: "我",
      fromUserId: loginInfo?.id || 16,
      toUserId: params.userId,
      avatar:
        loginInfo?.avatar ||
        "https://img1.baidu.com/it/u=2302465390,3219849774&fm=253&app=138&size=w931&n=0&f=JPEG&fmt=auto",
      content: input,
      time: new Date().toTimeString().slice(0, 5),
      self: true,
      unread: false,
      type: "text",
    };

    // 添加到本地消息列表
    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setShowEmoji(false);

    // 发送到WebSocket
    try {
      await sendMessageToWebSocket({
        type: "chat_message",
        data: {
          toUserId: params.userId,
          content: input,
          messageType: "text",
          fromAvatar: loginInfo?.avatar,
        },
      });
    } catch (error) {
      console.error("发送消息失败:", error);
      Toast.show("发送失败，请重试");
    }
  }, [input, params.userId, sendMessageToWebSocket]);

  // 插入表情
  const insertEmoji = useCallback((emoji: string) => {
    setInput((prev) => prev + emoji);
    inputRef.current?.focus();
  }, []);

  // 长按消息
  const handleLongPress = useCallback((msgId: string) => {
    setPopup({ visible: true, msgId });
  }, []);

  // 撤回消息
  const handleRecall = useCallback(async () => {
    if (!popup.msgId) return;

    try {
      // 发送撤回消息到WebSocket
      await sendMessageToWebSocket({
        type: "recall_message",
        data: {
          messageId: popup.msgId,
          toUserId: params.userId,
        },
      });

      // 更新本地消息
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === popup.msgId
            ? { ...msg, content: "你撤回了一条消息", type: "system" as const }
            : msg
        )
      );

      setPopup({ visible: false });
      Toast.show("消息已撤回");
    } catch (error) {
      console.error("撤回消息失败:", error);
      Toast.show("撤回失败");
    }
  }, [popup.msgId, sendMessageToWebSocket, params.userId]);

  // 复制消息
  const handleCopy = useCallback(() => {
    const msg = messages.find((m) => m.id === popup.msgId);
    if (msg) {
      navigator.clipboard.writeText(msg.content);
      Toast.show("已复制");
    }
    setPopup({ visible: false });
  }, [messages, popup.msgId]);

  // 处理回车键
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMsg();
      }
    },
    [sendMsg]
  );

  return (
    <div
      style={{
        background: "#f7f8fa",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* 顶部导航 */}
      <NavBar
        back="返回"
        onBack={() => history.back()}
        style={{ background: "#fff", borderBottom: "1px solid #eee" }}
      >
        {targetUser.nickname}
      </NavBar>

      {/* 消息列表区域 */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px",
          paddingBottom: showEmoji ? "200px" : "80px",
        }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: "flex",
              alignItems: "flex-end",
              marginBottom: 12,
              flexDirection: msg.self ? "row-reverse" : "row",
              position: "relative",
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              if (msg.self) {
                handleLongPress(msg.id);
              }
            }}
            onTouchStart={(e) => {
              if (!msg.self) return;
              // 移动端长按
              const timer = setTimeout(() => handleLongPress(msg.id), 500);
              const clear = () => {
                clearTimeout(timer);
                document.removeEventListener("touchend", clear);
                document.removeEventListener("touchmove", clear);
              };
              document.addEventListener("touchend", clear);
              document.addEventListener("touchmove", clear);
            }}
          >
            <img
              src={msg.avatar}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                margin: msg.self ? "0 0 0 8px" : "0 8px 0 0",
              }}
              alt="avatar"
            />
            <div style={{ maxWidth: "70%" }}>
              <div
                style={{
                  fontSize: 13,
                  color: msg.self ? "#888" : "#333",
                  marginBottom: 2,
                  textAlign: msg.self ? "right" : "left",
                }}
              >
                {msg.from}
                {msg.unread && !msg.self && (
                  <Badge content="未读" style={{ marginLeft: 8 }} />
                )}
              </div>
              <div
                style={{
                  background:
                    msg.type === "system"
                      ? "#f0f0f0"
                      : msg.self
                      ? "#e6f7ff"
                      : "#fff",
                  borderRadius: 8,
                  padding: "8px 12px",
                  fontSize: 15,
                  color: msg.type === "system" ? "#999" : "#222",
                  boxShadow: "0 1px 2px #eee",
                  fontStyle: msg.type === "system" ? "italic" : "normal",
                }}
              >
                {msg.content}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "#bbb",
                  marginTop: 2,
                  textAlign: msg.self ? "right" : "left",
                }}
              >
                {msg.time}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <div
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          background: "#fff",
          borderTop: "1px solid #eee",
          padding: "8px",
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Input
            ref={inputRef}
            value={input}
            onChange={setInput}
            onKeyDown={handleKeyDown}
            placeholder="请输入内容"
            clearable
            style={{
              flex: 1,
              borderRadius: 20,
              background: "#f5f5f5",
              padding: "8px 12px",
            }}
          />
          <Button
            size="small"
            onClick={() => setShowEmoji(!showEmoji)}
            style={{
              borderRadius: 20,
              padding: "8px",
              minWidth: 40,
              background: showEmoji ? "#e6f7ff" : "#f5f5f5",
            }}
          >
            <SmileOutline />
          </Button>
          <Button
            size="small"
            onClick={sendMsg}
            disabled={!input.trim()}
            style={{
              borderRadius: 20,
              padding: "8px",
              minWidth: 40,
              background: input.trim() ? "#1890ff" : "#f5f5f5",
              color: input.trim() ? "#fff" : "#ccc",
            }}
          >
            <SendOutline />
          </Button>
        </div>

        {/* 表情选择区域 */}
        {showEmoji && (
          <div
            style={{
              marginTop: 8,
              padding: "12px",
              background: "#f9f9f9",
              borderRadius: 8,
              maxHeight: 120,
              overflowY: "auto",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(8, 1fr)",
                gap: 8,
              }}
            >
              {emojiList.map((emoji, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: 24,
                    cursor: "pointer",
                    textAlign: "center",
                    padding: "4px",
                    borderRadius: 4,
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#e6f7ff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                  onClick={() => insertEmoji(emoji)}
                >
                  {emoji}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 长按操作弹窗 */}
      <Popup
        visible={popup.visible}
        onMaskClick={() => setPopup({ visible: false })}
        bodyStyle={{ borderRadius: 8, padding: 0 }}
      >
        <List>
          <List.Item onClick={handleCopy}>复制</List.Item>
          <List.Item onClick={handleRecall}>撤回</List.Item>
          <List.Item onClick={() => setPopup({ visible: false })}>
            取消
          </List.Item>
        </List>
      </Popup>
    </div>
  );
}
