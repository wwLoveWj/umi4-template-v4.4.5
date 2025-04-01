import React from "react";
import CustomTabs from "@/components/tabs";
import Feeding from "./feeding/index";
import Album from "./album/index";
import GrowthTrajectory from "./growthTrajectory/index";
import Education from "./education/index";

export default function Index() {
  const items = [
    {
      title: "奶量记录",
      children: <Feeding />,
      key: 1,
    },
    {
      title: "宝宝相册",
      children: <Album />,
      key: 2,
    },
    {
      title: "成长轨迹",
      children: <GrowthTrajectory />,
      key: 3,
    },
    {
      title: "教育",
      children: <Education />,
      key: 4,
    },
  ];
  return <CustomTabs defaultActiveKey="1" items={items} />;
}
