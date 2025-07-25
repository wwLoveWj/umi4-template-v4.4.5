import React, { useEffect, useState } from "react";
import {
  NavBar,
  Input,
  Grid,
  List,
  Badge,
  Avatar,
  Empty,
  Toast,
} from "antd-mobile";
import {
  LikeOutline,
  MessageOutline,
  UserOutline,
  BellOutline,
  SearchOutline,
  ClockCircleOutline,
} from "antd-mobile-icons";
import { history } from "umi";
import { useChatSessions } from "@/hooks/useChatSessions";
import { ChatSession } from "@/service/api/chat";
import { getToken } from "@/utils/localToken";
import { storage } from "@/utils/storage";
/**
 * 获取用户头像
 */
const getUserAvatar = (userId: string) => {
  // 这里可以根据用户ID生成默认头像
  // 实际项目中应该从用户信息中获取
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`;
};

/**
 * 获取用户昵称
 */
const getUserNickname = (userId: string) => {
  // 这里应该从用户信息中获取昵称
  // 暂时使用用户ID作为昵称
  return `用户${userId.slice(-4)}`;
};

/**
 * 格式化时间
 */
function formatTime(timeStr: string) {
  if (!timeStr) return "-";
  const date = new Date(timeStr);
  if (isNaN(date.getTime())) return "-";
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return "刚刚";
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;

  return date.toLocaleDateString();
}

const categories = [
  {
    icon: <LikeOutline style={{ color: "#ff4d4f", fontSize: 28 }} />,
    text: "赞和收藏",
    key: "like",
    path: "/msg/like-collect",
  },
  {
    icon: <MessageOutline style={{ color: "#52c41a", fontSize: 28 }} />,
    text: "评论",
    key: "comment",
  },
  {
    icon: <UserOutline style={{ color: "#1677ff", fontSize: 28 }} />,
    text: "新增粉丝",
    key: "follow",
    path: "/msg/contacts",
  },
  {
    icon: <BellOutline style={{ color: "#faad14", fontSize: 28 }} />,
    text: "系统通知",
    key: "system",
  },
];

export default function CommonMsgPage() {
  const loginInfo = storage.get("login-info");
  const [searchKeyword, setSearchKeyword] = useState("");

  const {
    sessions,
    totalUnreadCount,
    isLoading,
    loadSessions,
    markSessionAsRead,
    refreshUnreadCount,
  } = useChatSessions();

  /**
   * 初始化
   */
  useEffect(() => {
    const initPage = async () => {
      try {
        // 获取当前用户ID（这里需要根据你的登录系统调整）
        const token = await getToken();
        if (token) {
          // 从token中解析用户ID，或者从其他地方获取
          // 这里暂时使用一个示例用户ID
          const userId = loginInfo?.id || 0;

          // 加载聊天会话
          await loadSessions(userId);
          await refreshUnreadCount(userId);
        } else {
          Toast.show({
            content: "请先登录",
            icon: "fail",
          });
          history.push("/login");
        }
      } catch (error) {
        console.error("初始化失败:", error);
      }
    };

    initPage();
  }, [loadSessions, refreshUnreadCount]);

  /**
   * 处理会话点击
   */
  const handleSessionClick = async (session: ChatSession) => {
    if (!loginInfo?.id) return;

    try {
      // 标记会话为已读
      if (session.unreadCount > 0) {
        await markSessionAsRead(loginInfo?.id, session.targetUserId);
      }

      // 跳转到聊天页面
      history.push(`/msg/chat/${session.targetUserId}`, { session });
    } catch (error) {
      console.error("跳转失败:", error);
    }
  };

  /**
   * 过滤会话
   */
  const filteredSessions = sessions.filter((session) => {
    if (!searchKeyword) return true;
    const nickname = session.targetNickname;
    return nickname.toLowerCase().includes(searchKeyword.toLowerCase());
  });

  return (
    <div style={{ background: "var(--primary-bg)", minHeight: "100vh" }}>
      <NavBar
        back="返回"
        onBack={() => history.back()}
        right={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Badge
              content={totalUnreadCount > 99 ? "99+" : totalUnreadCount}
              color="danger"
              style={{ marginRight: 8 }}
            />
            <span
              onClick={() => history.push("/msg/contacts")}
              style={{
                color: "#fff",
                fontSize: 14,
                cursor: "pointer",
                padding: "4px 8px",
                borderRadius: 4,
                background: "rgba(255,255,255,0.2)",
              }}
            >
              联系人
            </span>
          </div>
        }
      >
        消息
      </NavBar>

      <div style={{ padding: 12, background: "#fff" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "#f5f5f5",
            borderRadius: 20,
            padding: "8px 16px",
            marginBottom: 16,
          }}
        >
          <SearchOutline style={{ color: "#999", marginRight: 8 }} />
          <input
            type="text"
            placeholder="搜索联系人"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            style={{
              border: "none",
              outline: "none",
              flex: 1,
              fontSize: 14,
              background: "transparent",
            }}
          />
        </div>

        <Grid columns={4} gap={12} style={{ marginBottom: 8 }}>
          {categories.map((cat) => (
            <Grid.Item key={cat.key} onClick={() => history.push(cat.path)}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                {cat.icon}
                <div style={{ marginTop: 4, fontSize: 14 }}>{cat.text}</div>
              </div>
            </Grid.Item>
          ))}
        </Grid>
      </div>

      <div style={{ marginTop: 8 }}>
        {filteredSessions.length === 0 ? (
          <Empty
            description={isLoading ? "加载中..." : "暂无聊天记录"}
            image={
              <div style={{ fontSize: 48, color: "#ccc" }}>
                <MessageOutline />
              </div>
            }
          />
        ) : (
          <List>
            {filteredSessions.map((session) => (
              <List.Item
                key={session.targetUserId}
                prefix={
                  <Avatar
                    src={
                      session.targetAvatar ||
                      getUserAvatar(loginInfo?.userId || "")
                    }
                    style={{ "--size": "48px" }}
                  />
                }
                description={
                  <div style={{ marginTop: 4 }}>
                    <span style={{ color: "#999", fontSize: 12 }}>
                      <ClockCircleOutline style={{ marginRight: 4 }} />
                      {formatTime(session.lastMessageTime)}
                    </span>
                  </div>
                }
                extra={
                  session.unreadCount > 0 && (
                    <Badge
                      content={
                        session.unreadCount > 99 ? "99+" : session.unreadCount
                      }
                      style={{ marginLeft: 8 }}
                    />
                  )
                }
                onClick={() => handleSessionClick(session)}
                style={{
                  background: session.unreadCount > 0 ? "#f8f9ff" : "#fff",
                  borderLeft:
                    session.unreadCount > 0 ? "3px solid #1677ff" : "none",
                }}
              >
                <div
                  style={{
                    fontWeight: session.unreadCount > 0 ? 600 : 400,
                    color: session.unreadCount > 0 ? "#000" : "#333",
                    fontSize: 16,
                  }}
                >
                  {session?.targetNickname}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: session.unreadCount > 0 ? "#333" : "#666",
                    marginTop: 4,
                    lineHeight: 1.4,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    maxWidth: "200px",
                  }}
                >
                  {session.lastMessage || "暂无消息"}
                </div>
              </List.Item>
            ))}
          </List>
        )}
      </div>
    </div>
  );
}
