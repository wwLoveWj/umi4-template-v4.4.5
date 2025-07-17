import React, { useRef, useState, useEffect } from "react";
import { history, useModel } from "umi";
import {
  Swiper,
  Toast,
  ImageViewer,
  SearchBar,
  Space,
  Button,
} from "antd-mobile";
import { ScanningOutline } from "antd-mobile-icons";
import { SearchBarRef } from "antd-mobile/es/components/search-bar";
import { ScheduledNotifyAPI } from "@/service/api/scheduled";
import { MailSendAPI } from "@/service/api/mail";
import { useRequest } from "ahooks";
import SearchHead from "./components/SearchHead";
import img1 from "@/assets/articleBg.jpg";
import websocketManager from "@/utils/websocket";
// import ScanWeb from "./components/scan/index";
import MajorEvents from "./components/majorTabs/index";
import styles from "./style.less";

export const demoImages = [
  "https://img1.baidu.com/it/u=788315313,2675512338&fm=253&app=138&size=w931&n=0&f=JPEG&fmt=auto?sec=1741107600&t=d7ef9e580911b86b75eb1cbd9687d9eb",
  "https://img2.baidu.com/it/u=3423686319,3061697869&fm=253&app=120&size=w931&n=0&f=JPEG&fmt=auto?sec=1741107600&t=bcbf5e63683bf34f6737c7316fba973a",
  "https://img2.baidu.com/it/u=815774148,3892081775&fm=253&app=138&size=w931&n=0&f=JPEG&fmt=auto?sec=1741107600&t=a34940ab279a5306e0e51da75fd4f72a",
  "https://img1.baidu.com/it/u=2302465390,3219849774&fm=253&app=138&size=w931&n=0&f=JPEG&fmt=auto?sec=1741107600&t=fca949e753c4f127a6c67a1560b73368",
];
// 读取用户自定义轮播图
const userCarousel = JSON.parse(localStorage.getItem("carouselImages") || "[]");
const swiperImages =
  userCarousel.length > 0
    ? userCarousel
    : [
        "https://img1.baidu.com/it/u=788315313,2675512338&fm=253&app=138&size=w931&n=0&f=JPEG&fmt=auto?sec=1741107600&t=d7ef9e580911b86b75eb1cbd9687d9eb",
        "https://img2.baidu.com/it/u=3423686319,3061697869&fm=253&app=120&size=w931&n=0&f=JPEG&fmt=auto?sec=1741107600&t=bcbf5e63683bf34f6737c7316fba973a",
        "https://img2.baidu.com/it/u=815774148,3892081775&fm=253&app=138&size=w931&n=0&f=JPEG&fmt=auto?sec=1741107600&t=a34940ab279a5306e0e51da75fd4f72a",
        "https://img1.baidu.com/it/u=2302465390,3219849774&fm=253&app=138&size=w931&n=0&f=JPEG&fmt=auto?sec=1741107600&t=fca949e753c4f127a6c67a1560b73368",
      ];
export default function Index() {
  const { html5QrCode, stop } = useModel("useScan");
  const searchRef = useRef<SearchBarRef>(null);
  const [visible, setVisible] = useState(false);
  const [imgWatchIdx, setImgWatchIdx] = useState(0);

  const items = swiperImages.map((imgSrc, index) => (
    <Swiper.Item key={index}>
      <img
        className={styles.content}
        src={imgSrc}
        alt=""
        onClick={() => {
          setVisible(true);
          Toast.show(`你点击了卡片 ${index + 1}`);
          setImgWatchIdx(index);
        }}
      />
    </Swiper.Item>
  ));
  // const scheduledNotifyFn = useRequest(
  //   () =>
  //     ScheduledNotifyAPI({
  //       notificationMode: "intervalTime",
  //       notificationTime: { hour: 14, second: 34 },
  //       taskId: "trtrtrt5454",
  //     }),
  //   {
  //     // debounceWait: 100,
  //     // manual: true,
  //     onSuccess: async (res) => {
  //       debugger;
  //     },
  //   }
  // );
  // useEffect(() => {
  //   createWebSocket("ws://localhost:3000");
  //   return () => {
  //     closeWebSocket();
  //   };
  // }, []);
  useEffect(() => {
    return () => {
      console.log(html5QrCode, "首页");
      if (html5QrCode?.isScanning) stop();
    };
  }, []);
  return (
    <>
      <div className={styles.homePage}>
        <SearchHead />
        <div className={styles.main}>
          <div className={styles.bg}></div>
          <Swiper
            style={{
              margin: "0 12px 12px",
              "--height": "200px",
              "--border-radius": "8px",
              "--width": "auto",
            }}
            loop
            autoplay
            onIndexChange={(i) => {
              // console.log(i, "onIndexChange1");
            }}
          >
            {items}
          </Swiper>
          {/* 照片查看器 */}
          <ImageViewer
            image={demoImages[imgWatchIdx]}
            visible={visible}
            onClose={() => {
              setVisible(false);
            }}
          />
          <h1 className={styles.title}>首页</h1>
          <MajorEvents />
          <div className={styles.homeBottom}>
            {/* <ScanWeb /> */}
            <button
              onClick={() =>
                // MailSendAPI({
                //   to: "wei.wu-n@msxf.com",
                //   text: "我发送了一封邮件",
                //   subject: "首页",
                //   nickname: "系统",
                //   recipientname: "女王大人",
                // })
                history.push("/demo")
              }
            >
              扫描二维码
            </button>
            <button onClick={() => websocketManager.disconnect()}>888</button>
            <button
              // onClick={() => {
              //   websocketMsgHandler(
              //     JSON.stringify({
              //       editorContent: "青女王=======",
              //       editorKey: "editor-add",
              //       title: "你到底想说啥",
              //       isEditMode: true, //编辑器操作类型，用于判断是否更新数据库
              //     })
              //   );
              // }}
              onClick={() => {
                history.push("/notice");
              }}
            >
              跳转到详情页
            </button>
            <Button onClick={() => stop()}>关闭888</Button>
          </div>
        </div>
      </div>
      {/* <div className="qrcode">
        <div id="reader"></div>
        <div id="msg"></div>
      </div> */}
    </>
  );
}
