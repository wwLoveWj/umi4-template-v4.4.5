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
import { useNotificationContext } from "@/context/NotificationContext";
import styles from "./style.less";

export default () => {
  const { unreadCount } = useNotificationContext();
  const navigate = useNavigate();
  const { pathname } = useLocation();

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
        unreadCount > 0 ? (unreadCount > 99 ? "99+" : unreadCount) : undefined,
    },
    {
      key: "/person",
      title: "我的",
      icon: <UserOutline />,
    },
  ];

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
