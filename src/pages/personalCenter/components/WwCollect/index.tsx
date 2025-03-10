import React, { Children, useRef, useState } from "react";
import { history } from "umi";
import CustomTabs from "@/components/tabs";
import WwCollect from "./WwCollect";
import { storage } from "@/utils/storage";
export default function Index() {
  const [checkList, setCheckList] = useState<
    { tagName: string; tagId: string }[]
  >(storage.get("tagList") || []);
  const [tabsKey, setTabsKey] = useState<any>(0);
  //   const items = [
  //     {
  //       title: "全部",
  //       children: <WwCollect tagName={0} />,
  //       key: 0,
  //     },
  //     {
  //       title: "小红书",
  //       children: <WwCollect tagName={tabsKey} />,
  //       key: "小红书",
  //     },
  //     {
  //       title: "抖音",
  //       children: 3,
  //       key: 3,
  //     },
  //     {
  //       title: "csdn",
  //       children: 4,
  //       key: 4,
  //     },
  //     {
  //       title: "技术",
  //       children: <WwCollect tagName={tabsKey} />,
  //       key: "技术",
  //     },
  //   ];
  return (
    <CustomTabs
      defaultActiveKey="0"
      items={[
        {
          title: "全部",
          children: <WwCollect tagName={0} />,
          key: 0,
        },
        ...checkList?.map((item) => {
          return {
            title: item.tagName,
            children: <WwCollect tagName={item.tagId} />,
            key: item.tagId,
          };
        }),
      ]}
      onChange={(e) => {
        setTabsKey(e);
      }}
    />
  );
}
