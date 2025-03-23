// 接种记录
import React, { useState, useEffect } from "react";
import { Steps, PullToRefresh } from "antd-mobile";
import styles from "./style.less";
import { useRequest } from "ahooks";
import { EventInfoListQueryAPI } from "@/service/api/event";
import AddFloatingBubble from "@/components/floatingBubble";
import WjPopup from "@/components/WjPopup";
import RegisterVaccination from "./components/RegisterVaccination";
import dayjs from "dayjs";
import { ScanningOutline } from "antd-mobile-icons";
import { useModel } from "umi";
const { Step } = Steps;

const colorStatus = {
  // 0: "#333", //一般
  1: "#1677FF", //重要
  2: "#FF0000", //紧急
};
const vaccineList: API.VaccinationType[] = [
  {
    vaccineName: "手足口",
    inoculabilityTime: "2023-07-01 10:00:00",
    batchNumber: "43434trtr545454545",
    tag: 1,
  },
];
export default function MajorEvents({ title = "疫苗接种登记" }) {
  const { getCameras, html5QrCode, stop } = useModel("useScan");
  const [visible, setVisible] = useState(false);
  //   const { data: eventInfoList, runAsync } = useRequest(EventInfoListQueryAPI, {
  //     onSuccess: (res) => {
  //       // debugger;
  //     },
  //   });
  // 格式化时间
  const formateTime = (time: string) => {
    return dayjs(time).format("YYYY-MM-DD HH:mm:ss");
  };

  useEffect(() => {
    return () => {
      console.log(html5QrCode, "疫苗");
      if (html5QrCode) stop();
    };
  }, []);
  return (
    <>
      <div className={styles.vaccination} id="home">
        <h2>{title}</h2>
        <ScanningOutline
          style={{ color: "#002FA7", fontSize: "18px" }}
          onClick={() => {
            getCameras();
          }}
        />
        <PullToRefresh
          onRefresh={async () => {
            //   await runAsync({});
          }}
        >
          <Steps direction="vertical">
            {vaccineList?.map((item) => (
              <Step
                title={
                  <div>
                    <span>{item.vaccineName}</span>
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
                      {item.tag === 2
                        ? "已接种"
                        : item.tag === 1
                        ? "待接种"
                        : "未接种"}
                    </span>
                  </div>
                }
                status={item.status}
                description={
                  <div>
                    {item.tag === 2 ? (
                      <p>
                        接种时间：{formateTime(item?.inoculabilityTime || "")}
                      </p>
                    ) : item.tag === 1 ? (
                      <p>通知时间：{formateTime(item?.noticeTime || "")}</p>
                    ) : (
                      <p>创建时间：{formateTime(item?.createTime || "")}</p>
                    )}
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
                      {item.batchNumber ? `批次号：${item.batchNumber}` : ""}
                    </span>
                    <p>{item.description ? `备注：${item.description}` : ""}</p>
                  </div>
                }
              />
            ))}
          </Steps>
        </PullToRefresh>
        <AddFloatingBubble onClick={() => setVisible(true)} />
        <WjPopup
          value={visible}
          onChange={setVisible}
          isShowSubmit={false}
          title={"接种登记"}
          popupHeight={"90vh"}
        >
          <RegisterVaccination
            onClose={() => {
              setVisible(false);
              console.log(html5QrCode, "疫苗记录");
              // if (html5QrCode) stop();
            }}
          />
        </WjPopup>
      </div>
      <div className="qrcode">
        <div id="reader"></div>
        <div id="msg"></div>
      </div>
    </>
  );
}
