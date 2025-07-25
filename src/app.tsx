import "./global.less";

import { ConfigProvider } from "antd-mobile";
import Package from "../package.json";
import React from "react";
import zhCN from "antd-mobile/es/locales/zh-CN";
import "@/utils/app-back-button.js";
// 初始化路由菜单数据
// export async function getInitialState() {
//   return {};
// }

import dayjs from "dayjs";
import "dayjs/locale/zh-cn";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
dayjs.locale("zh-cn");
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

import { NotificationProvider } from "@/context/NotificationContext";
import { OfflineProvider } from "@/context/OfflineContext";
import { ThemeProvider } from "@/context/ThemeContext";

export function rootContainer(container: React.ReactNode) {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <ConfigProvider locale={zhCN}>
          <OfflineProvider>{container}</OfflineProvider>
        </ConfigProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export async function render(oldRender: any) {
  oldRender();
}
