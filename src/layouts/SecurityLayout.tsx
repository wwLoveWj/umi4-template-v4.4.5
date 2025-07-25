import { useLocation, Outlet } from "umi";
import styles from "./index.less";
import TabBar from "@/components/menus";
import routes from "@/routes";
import { useMemo } from "react";
import { NavBar, SafeArea } from "antd-mobile";
import React, { useState } from "react";
import { useOffline } from "@/context/OfflineContext";
export default function Layout() {
  const { pathname } = useLocation();
  const [currentRoute, setCurrentRoute] = useState<Partial<API.MenuRoutesType>>(
    {}
  );
  const { offline, setOffline } = useOffline();
  // 获取到所有的菜单数据进行处理
  const menus =
    routes
      ?.find((route) => route.path === "/")
      ?.routes?.filter((item: any) => !item.redirect) || [];

  const shouldShowTabBar = useMemo(() => {
    // 监听路由变化
    // 判断是否需要隐藏 TabBar
    const currentRouter = menus.find(
      (route) => route.path === pathname || route?.isDetails
    ) || {
      hideTabBar: false,
    };
    setCurrentRoute(currentRouter);
    return !currentRouter?.hideTabBar;
  }, [pathname, routes]);
  const shouldShowBack = useMemo(() => {
    // 判断是否需要显示返回
    const currentRouter = menus.find((route) => route.path === pathname) || {
      showBack: false,
    };
    setCurrentRoute(currentRouter);
    return currentRouter?.showBack;
  }, [pathname, routes]);
  return (
    <div className={styles.layoutContainer}>
      <div style={{ background: "#ace0ff" }}>
        <SafeArea position="top" />
        {/* 一键离线按钮 */}
        <button
          style={{
            position: "absolute",
            top: 12,
            right: 16,
            zIndex: 1001,
            background: offline ? "#ff9800" : "#1677ff",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "6px 16px",
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 2px 8px #0002",
          }}
          onClick={() => {
            setOffline(!offline);
            window.__OFFLINE__ = !offline;
            localStorage.setItem("offline", !offline ? "1" : "0");
          }}
        >
          {offline ? "恢复在线" : "一键离线"}
        </button>
      </div>
      <div id="home">
        {shouldShowBack && (
          <NavBar
            back="返回"
            onBack={() => history.back()}
            style={{
              background: "#002FA7",
              color: "#fff",
              position: "sticky",
              top: 0,
              zIndex: 999,
            }}
          >
            {currentRoute?.title}
          </NavBar>
        )}
        <div className={styles.layoutContent}>
          <Outlet />
        </div>
        {shouldShowTabBar && <TabBar />}
      </div>
      <div className="qrcode">
        <div id="reader"></div>
        <div id="msg"></div>
      </div>
      <div style={{ background: "#ffcfac" }}>
        <SafeArea position="bottom" />
      </div>
    </div>
  );
}
