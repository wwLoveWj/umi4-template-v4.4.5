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

export default function MsgPage() {
  const { notifications } = useNotificationContext();

  // 假如有头像、昵称、标签、内容、时间等字段
  // 这里只做简单映射，实际可根据你的通知结构调整
  const messages = notifications.map((msg) => ({
    id: msg.id,
    avatar:
      msg.avatar ||
      "https://img1.baidu.com/it/u=2302465390,3219849774&fm=253&app=138&size=w931&n=0&f=JPEG&fmt=auto", // 可替换为真实头像
    nickname: msg.nickname || msg.title || "系统消息",
    tag: msg.type === "system" ? "官方" : undefined,
    content: msg.content,
    time: msg.createdAt ? msg.createdAt.slice(11, 16) : "",
  }));

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
          {messages.length === 0 ? (
            <List.Item>
              <div style={{ textAlign: "center", color: "#bbb", padding: 32 }}>
                暂无消息
              </div>
            </List.Item>
          ) : (
            messages.map((msg) => (
              <List.Item
                key={msg.id}
                prefix={
                  <img
                    src={msg.avatar}
                    style={{ width: 44, height: 44, borderRadius: 22 }}
                  />
                }
                description={
                  <span>
                    {msg.tag && (
                      <span
                        style={{
                          color: "#1677ff",
                          fontSize: 12,
                          border: "1px solid #1677ff",
                          borderRadius: 4,
                          padding: "0 4px",
                          marginRight: 4,
                        }}
                      >
                        官方
                      </span>
                    )}
                    <span style={{ color: "#888" }}>{msg.content}</span>
                  </span>
                }
                extra={
                  <span style={{ color: "#999", fontSize: 13 }}>
                    {msg.time}
                  </span>
                }
              >
                <span style={{ fontWeight: 600 }}>{msg.nickname}</span>
              </List.Item>
            ))
          )}
        </List>
      </div>
    </div>
  );
}
