import React from "react";
import { NavBar, Input, Grid, List, Badge } from "antd-mobile";
import {
  LikeOutline,
  MessageOutline,
  UserOutline,
  BellOutline,
} from "antd-mobile-icons";
import { useNotificationContext } from "@/context/NotificationContext";
import { history } from "umi";

function formatTime(timeStr: string) {
  if (!timeStr) return "-";
  const date = new Date(timeStr);
  if (isNaN(date.getTime())) return "-";
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "今天";
  if (days === 1) return "昨天";
  if (days < 7) return `${days}天前`;
  if (days < 365) return `${Math.floor(days / 30)}月前`;
  return `${Math.floor(days / 365)}年前`;
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
  },
  {
    icon: <BellOutline style={{ color: "#faad14", fontSize: 28 }} />,
    text: "系统通知",
    key: "system",
  },
];

export default function CommonMsgPage() {
  const { notifications } = useNotificationContext();
  // 按fromUserId分组，只显示每个对话的最后一条消息
  const dialogMap = new Map();
  notifications.forEach((item) => {
    const key = item.fromUserId || item.id;
    if (
      !dialogMap.has(key) ||
      new Date(item.createdAt) > new Date(dialogMap.get(key).createdAt)
    ) {
      dialogMap.set(key, item);
    }
  });
  const dialogList = Array.from(dialogMap.values());

  return (
    <div style={{ background: "#f7f8fa", minHeight: "100vh" }}>
      <NavBar back="返回" onBack={() => history.back()}>
        消息
      </NavBar>
      <div style={{ padding: 12, background: "#fff" }}>
        <Input
          placeholder="搜索联系人"
          clearable
          style={{ marginBottom: 16, borderRadius: 20, background: "#f5f5f5" }}
        />
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
        <List>
          {dialogList.length === 0 ? (
            <List.Item>
              <div style={{ textAlign: "center", color: "#bbb", padding: 32 }}>
                暂无消息
              </div>
            </List.Item>
          ) : (
            dialogList.map((item) => (
              <List.Item
                key={item.fromUserId || item.id}
                prefix={
                  <img
                    src={
                      item.avatar ||
                      "https://img1.baidu.com/it/u=2302465390,3219849774&fm=253&app=138&size=w931&n=0&f=JPEG&fmt=auto"
                    }
                    style={{ width: 44, height: 44, borderRadius: 22 }}
                  />
                }
                description={
                  <span style={{ color: "#888" }}>
                    {item.content || item.title || "消息摘要"}
                  </span>
                }
                extra={
                  <span style={{ color: "#bbb", fontSize: 13 }}>
                    {formatTime(item.createdAt)}
                  </span>
                }
                onClick={() =>
                  history.push(`/msg/chat/${item.fromUserId || item.id}`)
                }
              >
                <span style={{ fontWeight: 600 }}>
                  {item.nickname || item.title || "用户"}
                </span>
                {item.isOfficial && (
                  <span
                    style={{
                      color: "#1677ff",
                      fontSize: 12,
                      border: "1px solid #1677ff",
                      borderRadius: 4,
                      padding: "0 4px",
                      marginLeft: 6,
                    }}
                  >
                    官方
                  </span>
                )}
              </List.Item>
            ))
          )}
        </List>
      </div>
    </div>
  );
}
