import React from "react";
import { List, SwipeAction, Empty } from "antd-mobile";

export default function Index({
  eventInfoList,
  swipeActionRefs,
  leftActions,
  rightActions,
  link = false,
}: {
  eventInfoList: { actionId: string; title: string; link?: string }[];
  swipeActionRefs: any;
  leftActions?: any;
  rightActions?: any;
  link?: boolean;
}) {
  return (
    <>
      {eventInfoList?.length > 0 ? (
        <List>
          {(eventInfoList || [])?.map((item, index) => (
            <SwipeAction
              ref={(el) => (swipeActionRefs.current[index] = el)} // 为每个 SwipeAction 分配唯一的 ref
              closeOnAction={false}
              closeOnTouchOutside={false}
              key={item?.actionId}
              leftActions={leftActions}
              rightActions={rightActions(index, item)}
            >
              <List.Item>
                {link ? <a href={item?.link}>{item?.title}</a> : item?.title}
              </List.Item>
            </SwipeAction>
          ))}
        </List>
      ) : (
        <Empty description="暂无数据" />
      )}
    </>
  );
}
