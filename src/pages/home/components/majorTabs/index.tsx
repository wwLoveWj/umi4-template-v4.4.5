import React, { Children, useRef, useState } from "react";
import { history } from "umi";
import CustomTabs from "@/components/tabs";
import MajorEvents from "./components/MajorEvents.tsx";

export default function Index() {
  const items = [
    {
      title: "咨询",
      children: <MajorEvents />,
      key: 1,
    },
    {
      title: "待办通知",
      children: 2,
      key: 2,
    },
    {
      title: "重要消息",
      children: 3,
      key: 3,
    },
    {
      title: "今日消费",
      children: 4,
      key: 4,
    },
    {
      title: "创意园区",
      children: 5,
      key: 5,
    },
  ];
  return <CustomTabs defaultActiveKey="1" items={items} />;
}
