import React from "react";
import { Steps, PullToRefresh } from "antd-mobile";
import styles from "../../../style.less";
import { useRequest } from "ahooks";
import { EventInfoListQueryAPI } from "@/service/api/event";
// import AddFloatingBubble from "@/components/floatingBubble";
import dayjs from "dayjs";
const { Step } = Steps;

const colorStatus = {
  // 0: "#333", //一般
  1: "#1677FF", //重要
  2: "#FF0000", //紧急
};
export default function MajorEvents({ title = "近期大事件" }) {
  const { data: eventInfoList, runAsync } = useRequest(EventInfoListQueryAPI, {
    onSuccess: (res) => {
      // debugger;
    },
  });
  // 格式化时间
  const formateTime = (time: string) => {
    return dayjs(time).format("YYYY-MM-DD HH:mm:ss");
  };
  return (
    <div className={styles.majorEvents}>
      <h2>{title}</h2>
      <PullToRefresh
        onRefresh={async () => {
          await runAsync({});
        }}
      >
        <Steps direction="vertical">
          {eventInfoList?.map((item) => (
            <Step
              title={
                <div>
                  <span>{item.title}</span>
                  <span
                    style={{
                      // border: `1px solid ${(colorStatus as any)[item.tag]}`,
                      width: "12px",
                      height: "12px",
                      marginLeft: "10px",
                      padding: "2px",
                      borderRadius: "5px",
                      color: "#fff",
                      background: (colorStatus as any)[item.tag],
                    }}
                  >
                    {item.tag === 2 ? "重要" : item.tag === 1 ? "待办" : ""}
                  </span>
                </div>
              }
              status={item.status}
              description={
                <div>
                  <p>重要时刻：{formateTime(item?.processTime)}</p>
                  {/* <p>
                  {
                    item.status === "finish"
                    ? `完成时间：${formateTime(item.finishTime)}`
                    :
                    item.status === "wait"
                      ? `创建时间：${formateTime(item.createTime)}`
                      : ""
                  }
                </p> */}
                  <span>
                    {item.description ? `备注：${item.description}` : ""}
                  </span>
                </div>
              }
            />
          ))}
        </Steps>
      </PullToRefresh>
      {/* <AddFloatingBubble pathname="/event/add" /> */}
    </div>
  );
}
