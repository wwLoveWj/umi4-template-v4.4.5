import React, { Children, useRef, useState } from "react";
import { history } from "umi";
import CustomTabs from "@/components/tabs";
import MajorEvents from "./components/MajorEvents.tsx";
import { Badge, ErrorBlock, Space } from "antd-mobile";

export default function Index() {
  const items = [
    {
      title: "咨询",
      children: <MajorEvents />,
      key: 1,
    },
    {
      title: <Badge content="新">待办通知</Badge>,
      children: (
        <Space block direction="vertical" style={{ "--gap": "16px" }}>
          <ErrorBlock status="default" />
        </Space>
      ),
      key: 2,
    },
    {
      title: "重要消息",
      children: (
        <Space block direction="vertical" style={{ "--gap": "16px" }}>
          <ErrorBlock status="default" />
        </Space>
      ),
      key: 3,
    },
    {
      title: "今日消费",
      children: (
        <Space block direction="vertical" style={{ "--gap": "16px" }}>
          <ErrorBlock status="default" />
        </Space>
      ),
      key: 4,
    },
    {
      title: "创意园区",
      children: (
        <Space block direction="vertical" style={{ "--gap": "16px" }}>
          <ErrorBlock status="default" />
        </Space>
      ),
      key: 5,
    },
  ];
  return <CustomTabs defaultActiveKey="1" items={items} />;
}
