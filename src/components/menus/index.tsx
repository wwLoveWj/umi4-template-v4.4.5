import React, { useState, useEffect } from "react";
import { Badge, TabBar } from "antd-mobile";
import {
  AppOutline,
  MessageOutline,
  MessageFill,
  UnorderedListOutline,
  UserOutline,
  ScanningOutline,
  ContentOutline,
} from "antd-mobile-icons";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./style.less";
import { getMessages, onMessageChange } from "@/utils/messageCenter";

/**
 * 获取未读消息数量
 * @returns {number} 未读消息数量
 */
function getUnreadMsgCount() {
  try {
    const msgs = getMessages();
    return msgs.filter((m) => !m.read).length;
  } catch {
    return 0;
  }
}

export default () => {
  // 动态获取未读消息数
  const [unreadMsgCount, setUnreadMsgCount] = useState(0);

  /**
   * 更新未读消息数量
   */
  const updateUnreadCount = () => {
    const count = getUnreadMsgCount();
    setUnreadMsgCount(count);
  };

  // 监听消息变化，实时更新角标
  useEffect(() => {
    updateUnreadCount();

    // 监听消息变化事件
    const removeListener = onMessageChange(updateUnreadCount);

    return () => {
      removeListener();
    };
  }, []);

  const tabs = [
    {
      key: "/home",
      title: "首页",
      icon: <AppOutline />,
      badge: Badge.dot,
    },
    {
      key: "/baby",
      title: "育儿",
      icon: <UnorderedListOutline />,
      badge: "5",
    },
    // {
    //   key: "/scan",
    //   icon: <ScanningOutline />,
    // },
    {
      key: "/article",
      title: "文章",
      icon: <ContentOutline />,
    },
    {
      key: "/msg",
      title: "消息",
      icon: (active: boolean) =>
        active ? <MessageFill /> : <MessageOutline />,
      badge:
        unreadMsgCount > 0
          ? unreadMsgCount > 99
            ? "99+"
            : unreadMsgCount
          : undefined,
    },
    {
      key: "/person",
      title: "我的",
      icon: <UserOutline />,
    },
  ];

  const [activeKey, setActiveKey] = useState("todo");
  const navigate = useNavigate();
  const { pathname } = useLocation();
  return (
    <div className={styles.tabBar}>
      <TabBar activeKey={pathname} onChange={(value) => navigate(value)}>
        {tabs.map((item) => (
          <TabBar.Item
            key={item.key}
            icon={item.icon}
            title={item.title}
            badge={item.badge}
          />
        ))}
      </TabBar>
    </div>
  );
};
