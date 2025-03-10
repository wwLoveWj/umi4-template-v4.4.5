import React, { useRef, useState } from "react";
import { Tabs } from "antd-mobile";

interface ItemsProps {
  children: any;
  key: string | number;
  title: string;
}
export default function Index({
  defaultActiveKey = "1",
  items,
  onChange,
}: {
  defaultActiveKey: string;
  items: ItemsProps[];
  onChange: (e: string) => void;
}) {
  return (
    <Tabs defaultActiveKey={defaultActiveKey} onChange={onChange}>
      {items?.map((item) => {
        return (
          <Tabs.Tab title={item.title} key={item.key}>
            {item.children}
          </Tabs.Tab>
        );
      })}
    </Tabs>
  );
}
