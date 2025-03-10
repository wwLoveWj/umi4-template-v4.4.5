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
  "https://images.unsplash.com/photo-1620476214170-1d8080f65cdb?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=3150&q=80",
  "https://images.unsplash.com/photo-1601128533718-374ffcca299b?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=3128&q=80",
  "https://images.unsplash.com/photo-1567945716310-4745a6b7844b?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=3113&q=80",
  "https://images.unsplash.com/photo-1624993590528-4ee743c9896e?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=200&h=1000&q=80",
];
const swiperImages = [
  "https://img1.baidu.com/it/u=788315313,2675512338&fm=253&app=138&size=w931&n=0&f=JPEG&fmt=auto?sec=1741107600&t=d7ef9e580911b86b75eb1cbd9687d9eb",
  "https://img2.baidu.com/it/u=3423686319,3061697869&fm=253&app=120&size=w931&n=0&f=JPEG&fmt=auto?sec=1741107600&t=bcbf5e63683bf34f6737c7316fba973a",
  "https://img2.baidu.com/it/u=815774148,3892081775&fm=253&app=138&size=w931&n=0&f=JPEG&fmt=auto?sec=1741107600&t=a34940ab279a5306e0e51da75fd4f72a",
  "https://img1.baidu.com/it/u=2302465390,3219849774&fm=253&app=138&size=w931&n=0&f=JPEG&fmt=auto?sec=1741107600&t=fca949e753c4f127a6c67a1560b73368",
];
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
        <div className={styles.headerSection}>
          <SearchHead />
          <Swiper
            style={{
              margin: "-133px 0px 0px",
              "--height": "200px",
              "--border-radius": "8px",
              "--width": "96%",
            }}
            loop
            autoplay
            onIndexChange={(i) => {
              // console.log(i, "onIndexChange1");
            }}
          >
            {items}
          </Swiper>
        </div>
        {/* 照片查看器 */}
        <ImageViewer.Multi
          images={demoImages}
          visible={visible}
          defaultIndex={1}
          onClose={() => {
            setVisible(false);
          }}
        />
        <h1>首页</h1>
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
    </>
  );
}
