import React, { useState } from "react";
import { Badge, TabBar } from "antd-mobile";
import {
  AppOutline,
  MessageOutline,
  MessageFill,
  UnorderedListOutline,
  UserOutline,
  ScanningOutline,
} from "antd-mobile-icons";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./style.less";

export default () => {
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
      key: "/scan",
      icon: <ScanningOutline />,
    },
    {
      key: "/msg",
      title: "消息",
      icon: (active: boolean) =>
        active ? <MessageFill /> : <MessageOutline />,
      badge: "99+",
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
