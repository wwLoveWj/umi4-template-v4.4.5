import React, { useEffect, useState, useRef } from "react";
import {
  Dialog,
  List,
  SwipeAction,
  Toast,
  Image,
  Empty,
  NavBar,
  Popup,
} from "antd-mobile";
import { Action, SwipeActionRef } from "antd-mobile/es/components/swipe-action";
import AddFloatingBubble from "@/components/floatingBubble";
import { EventInfoUpdateAPI, EventInfoListQueryAPI } from "@/service/api/event";
import { useRequest } from "ahooks";
import dayjs from "dayjs";
import { history } from "umi";
import WjPopup from "@/components/WjPopup";
import EventAdd from "@/pages/home/components/majorTabs/components/Add";

export default function EventList() {
  const orientation = window.screen.orientation;
  const swipeActionRefs = useRef<any[]>([]);
  const [direction, setDirection] = useState("竖屏");
  const [visible, setVisible] = useState(false);
  // 查询事件信息
  const { data: eventInfoList, run } = useRequest(
    () => EventInfoListQueryAPI({ status: "wait" }),
    {
      onSuccess: (res) => {
        // 初始化 ref 数组
        swipeActionRefs.current = (res || [])?.map(() => useRef());
      },
    }
  );
  // 更新操作状态
  const eventInfoUpdateFn = useRequest(EventInfoUpdateAPI, {
    manual: true,
    onSuccess: (res) => {
      run();
    },
  });
  const leftActions: Action[] = [
    {
      key: "pin",
      text: "置顶",
      color: "primary",
    },
  ];
  // 右侧操作列
  const rightActions = (index: number, item: API.EventInfoType): Action[] => {
    return [
      // {
      //   key: "unsubscribe",
      //   text: "取消关注",
      //   color: "light",
      // },
      {
        key: "mute",
        text: "完成",
        color: "warning",
        onClick: () => {
          //   请求接口改变该数据状态
          Toast.show("操作成功");
          eventInfoUpdateFn.run({
            status: "finish",
            eventId: item?.eventId,
            finishTime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
          });
        },
      },
      {
        key: "delete",
        text: "拒绝",
        color: "danger",
        onClick: async () => {
          await Dialog.confirm({
            content: "确定要拒绝吗？",
          });
          eventInfoUpdateFn.run({
            status: "error",
            eventId: item?.eventId,
            finishTime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
          });
          if (swipeActionRefs.current[index]) {
            swipeActionRefs.current[index].close();
          }
          Toast.show("删除成功");
        },
      },
    ];
  };

  // 获取屏幕方向
  const getDirection = () => {
    if (orientation.angle === 0 || orientation.angle === 180) {
      Toast.show("请切换为横屏");
      return "竖屏";
    } else if (orientation.angle === 90 || orientation.angle === -90) {
      Toast.show("请切换为竖屏");
      return "横屏";
    }
  };

  useEffect(() => {
    // window.addEventListener("touchstart", (e) => {
    //   console.log(e);
    // });
    orientation.onchange = (e) => {
      const direc = getDirection() || "竖屏";
      setDirection(direc);
    };
  }, []);
  return (
    <>
      <NavBar back="返回" onBack={() => history.push("/person")}>
        大事件
      </NavBar>
      {direction}
      {eventInfoList && eventInfoList?.length > 0 ? (
        <List>
          {(eventInfoList || [])?.map((item, index) => (
            <SwipeAction
              ref={(el) => (swipeActionRefs.current[index] = el)} // 为每个 SwipeAction 分配唯一的 ref
              closeOnAction={false}
              closeOnTouchOutside={false}
              key={item?.eventId}
              leftActions={leftActions}
              rightActions={rightActions(index, item)}
            >
              <List.Item>{item?.title}</List.Item>
            </SwipeAction>
          ))}
        </List>
      ) : (
        <Empty description="暂无数据" />
      )}
      <AddFloatingBubble onClick={() => setVisible(true)} />
      <WjPopup
        value={visible}
        onChange={setVisible}
        isShowSubmit={false}
        title={"添加大事"}
        // popupHeight="85vh"
      >
        <EventAdd
          onClose={() => {
            setVisible(false);
            run();
          }}
        />
      </WjPopup>
    </>
  );
}
