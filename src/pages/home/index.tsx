import React, { useRef, useState } from "react";
import { history } from "umi";
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
import {
  createWebSocket,
  closeWebSocket,
  // websocket,
  websocketMsgHandler,
} from "@/utils/websocket";
// import ScanWeb from "./components/scan/index";
import MajorEvents from "./components/majorTabs/index";
import styles from "./style.less";

export const demoImages = [
  img1,
  "https://images.unsplash.com/photo-1601128533718-374ffcca299b?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=3128&q=80",
  "https://images.unsplash.com/photo-1567945716310-4745a6b7844b?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=3113&q=80",
  "https://images.unsplash.com/photo-1624993590528-4ee743c9896e?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=200&h=1000&q=80",
];
const swiperImages = [img1, img1, img1, img1, img1];
export default function Index() {
  const searchRef = useRef<SearchBarRef>(null);
  const [visible, setVisible] = useState(false);

  const items = swiperImages.map((imgSrc, index) => (
    <Swiper.Item key={index}>
      <img
        className={styles.content}
        src={imgSrc}
        alt=""
        onClick={() => {
          setVisible(true);
          Toast.show(`你点击了卡片 ${index + 1}`);
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

  return (
    <>
      <div id="home" className={styles.homePage}>
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
          <ImageViewer.Multi
            images={demoImages}
            visible={visible}
            defaultIndex={1}
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
            <button onClick={() => closeWebSocket()}>888</button>
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
        <div className="qrcode">
          <div id="reader"></div>
          <div id="msg"></div>
        </div>
      </div>
    </>
  );
}
