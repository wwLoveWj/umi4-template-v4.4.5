import React, { useEffect, useState } from "react";
import {
  List,
  Badge,
  NavBar,
  Button,
  Empty,
  InfiniteScroll,
  Toast,
} from "antd-mobile";
import {
  LikeOutline,
  StarOutline,
  ClockCircleOutline,
  BellOutline,
  UserOutline,
  FileOutline,
  HeartOutline,
} from "antd-mobile-icons";
import { useNotification } from "@/hooks/useNotification";
import { NotificationItem } from "@/service/api/notification";
import { history } from "umi";

/**
 * 获取通知图标
 */
const getNotificationIcon = (type: string) => {
  switch (type) {
    case "like":
      return <HeartOutline style={{ color: "#ff4757" }} />;
    case "collect":
      return <StarOutline style={{ color: "#ffa502" }} />;
    case "follow":
      return <UserOutline style={{ color: "#2ed573" }} />;
    case "article_update":
      return <FileOutline style={{ color: "#3742fa" }} />;
    case "system":
      return <BellOutline style={{ color: "#ff6348" }} />;
    default:
      return <BellOutline style={{ color: "#747d8c" }} />;
  }
};

/**
 * 获取通知类型文本
 */
const getNotificationTypeText = (type: string) => {
  switch (type) {
    case "like":
      return "点赞";
    case "collect":
      return "收藏";
    case "follow":
      return "关注";
    case "article_update":
      return "文章更新";
    case "system":
      return "系统通知";
    default:
      return "通知";
  }
};

const MsgPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const {
    notifications,
    unreadCount,
    isConnected,
    isLoading,
    markAsRead,
    markAllAsRead,
    loadNotifications,
  } = useNotification();
  /**
   * 处理标记已读
   */
  const handleMarkRead = async (notification: NotificationItem) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }

    // 根据通知类型跳转到相应页面
    if (notification.relatedType === "article" && notification.relatedId) {
      history.push(`/article/detail/${notification.relatedId}`);
    } else if (notification.relatedType === "user" && notification.relatedId) {
      history.push(`/user/${notification.relatedId}`);
    }
  };

  /**
   * 处理全部已读
   */
  const handleMarkAllRead = async () => {
    await markAllAsRead();
  };

  /**
   * 加载更多通知
   */
  const loadMore = async () => {
    if (isLoading || !hasMore) return;

    const nextPage = currentPage + 1;
    await loadNotifications(nextPage);

    // 检查是否还有更多数据
    if (notifications.length >= nextPage * 20) {
      setCurrentPage(nextPage);
      setHasMore(true);
    } else {
      setHasMore(false);
    }
  };

  /**
   * 格式化时间
   */
  const formatTime = (timeStr: string) => {
    if (!timeStr) return "-";
    const date = new Date(timeStr);
    if (isNaN(date.getTime())) return "-"; // 新增：无效时间处理

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
  };

  return (
    <div>
      <NavBar
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "#002FA7",
          color: "#fff",
        }}
        right={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* 连接状态指示器 */}
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: isConnected ? "#52c41a" : "#ff4d4f",
                marginRight: 4,
              }}
            />
            <Button size="mini" onClick={handleMarkAllRead}>
              全部已读
            </Button>
          </div>
        }
      >
        消息中心
        {unreadCount > 0 && (
          <Badge
            content={unreadCount > 99 ? "99+" : unreadCount}
            color="danger"
          />
        )}
      </NavBar>

      <div style={{ padding: 12 }}>
        {notifications.length === 0 ? (
          <Empty
            description="暂无消息"
            image={
              <div style={{ fontSize: 48, color: "#ccc" }}>
                <BellOutline />
              </div>
            }
          />
        ) : (
          <List>
            {notifications.map((notification) => (
              <List.Item
                key={notification.id}
                prefix={getNotificationIcon(notification.type)}
                description={
                  <div style={{ marginTop: 4 }}>
                    <span style={{ color: "#999", fontSize: 12 }}>
                      <ClockCircleOutline style={{ marginRight: 4 }} />
                      {formatTime(notification.createdAt)}
                    </span>
                    <span
                      style={{
                        marginLeft: 8,
                        color: "#1677ff",
                        fontSize: 12,
                        background: "#f0f8ff",
                        padding: "2px 6px",
                        borderRadius: 4,
                      }}
                    >
                      {getNotificationTypeText(notification.type)}
                    </span>
                  </div>
                }
                extra={
                  !notification.isRead && (
                    <Badge color="primary" content="未读" />
                  )
                }
                onClick={() => handleMarkRead(notification)}
                style={{
                  background: notification.isRead ? "#fff" : "#f8f9ff",
                  borderLeft: notification.isRead
                    ? "none"
                    : "3px solid #1677ff",
                }}
              >
                <div
                  style={{
                    fontWeight: notification.isRead ? 400 : 600,
                    color: notification.isRead ? "#333" : "#000",
                  }}
                >
                  {notification.title}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: "#666",
                    marginTop: 4,
                    lineHeight: 1.4,
                  }}
                >
                  {notification.content}
                </div>
              </List.Item>
            ))}
          </List>
        )}

        {/* 无限滚动加载 */}
        <InfiniteScroll loadMore={loadMore} hasMore={hasMore}>
          {isLoading && (
            <div
              style={{ textAlign: "center", padding: "20px 0", color: "#999" }}
            >
              加载中...
            </div>
          )}
        </InfiniteScroll>
      </div>
    </div>
  );
};

export default MsgPage;
