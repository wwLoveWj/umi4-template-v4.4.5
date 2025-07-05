import { useLocation, Outlet } from "umi";
import styles from "./index.less";
import TabBar from "@/components/menus";
import routes from "@/routes";
import { useMemo } from "react";
import { NavBar } from "antd-mobile";
import React, { useState } from "react";
export default function Layout() {
  const { pathname } = useLocation();
  const [currentRoute, setCurrentRoute] = useState<Partial<API.MenuRoutesType>>(
    {}
  );
  // 获取到所有的菜单数据进行处理
  const menus =
    routes
      ?.find((route) => route.path === "/")
      ?.routes?.filter((item: any) => !item.redirect) || [];

  const shouldShowTabBar = useMemo(() => {
    // 监听路由变化
    // 判断是否需要隐藏 TabBar
    const currentRouter = menus.find(
      (route) => route.path === pathname || route?.hideTabBar
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
    </div>
  );
}
