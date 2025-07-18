import React from "react";
import { NavBar, List } from "antd-mobile";
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

export default function LikeCollectPage() {
  const { notifications } = useNotificationContext();
  // 只筛选点赞和收藏
  const likeCollect = notifications.filter(
    (n) => n.type === "like" || n.type === "collect"
  );

  return (
    <div>
      <NavBar back="返回" onBack={() => history.back()}>
        赞和收藏
      </NavBar>
      <List>
        {likeCollect.length === 0 ? (
          <List.Item>
            <div style={{ textAlign: "center", color: "#bbb", padding: 32 }}>
              暂无赞和收藏消息
            </div>
          </List.Item>
        ) : (
          likeCollect.map((item) => (
            <List.Item
              key={item.id}
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
                <div>
                  <span style={{ fontWeight: 600, marginRight: 4 }}>
                    {item.nickname || item.title || "用户"}
                  </span>
                  {item.type === "like" ? "赞了你的" : "收藏了你的"}
                  {item.relatedType === "article"
                    ? "文章"
                    : item.relatedType === "comment"
                    ? "评论"
                    : ""}
                  {item.articleTitle && (
                    <span style={{ color: "#1677ff", marginLeft: 4 }}>
                      《{item.articleTitle}》
                    </span>
                  )}
                  {item.commentContent && (
                    <div style={{ color: "#888", marginTop: 2 }}>
                      {item.commentContent}
                    </div>
                  )}
                </div>
              }
              extra={
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: "#bbb", fontSize: 13 }}>
                    {formatTime(item.createdAt)}
                  </div>
                  {item.cover && (
                    <img
                      src={item.cover}
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 6,
                        marginTop: 4,
                      }}
                    />
                  )}
                </div>
              }
            />
          ))
        )}
      </List>
    </div>
  );
}
