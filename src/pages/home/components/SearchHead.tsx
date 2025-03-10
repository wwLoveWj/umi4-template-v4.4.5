import React, { useRef, useState } from "react";
import { SearchBar, Space, Toast, Popup, NavBar } from "antd-mobile";
import { SearchBarRef } from "antd-mobile/es/components/search-bar";
import { ScanningOutline } from "antd-mobile-icons";
import styles from "../style.less";
import { Html5Qrcode } from "html5-qrcode";
export default function SearchHead() {
  const [visible1, setVisible1] = useState(false);
  const searchRef = useRef<SearchBarRef>(null);
  let html5QrCode = null;
  const getCameras = () => {
    Html5Qrcode.getCameras()
      .then((devices) => {
        // debugger;
        // 返回的是你的摄像设备列表，手机有两个摄像头，电脑返回一个摄像头
        // 初始化扫描程序，在这里需要传递标签的id，第二个参数用来控制识别类型（没用过）
        html5QrCode = new Html5Qrcode("reader");
        start();
      })
      .catch((err) => {
        html5QrCode = new Html5Qrcode("reader");
      });
  };
  // 开始扫描相机给的二维码
  const start = () => {
    document.querySelector("#home").style.display = "none";
    html5QrCode.start(
      // environment后置摄像头 user前置摄像头 也可以传递获取摄像头时的id
      // 也可以是这样的{ deviceId: { exact: cameraId} }
      { facingMode: "environment" },
      {
        fps: 20, // 可选，每秒帧扫描二维码
        qrbox: { width: 250, height: 250 }, // 可选，如果你想要有界框UI
        aspectRatio: 1.777778, // 可选，视频馈送需要的纵横比，(4:3--1.333334, 16:9--1.777778, 1:1--1.0)传递错误的纵横比会导致视频不显示
      },
      (decodedText, decodedResult) => {
        debugger;
        if (
          decodedText?.startsWith("https://") ||
          decodedText?.startsWith("http://")
        ) {
          window.location.href = `${decodedText}`;
        } else {
          // 成功的回调函数
          document.getElementById("msg").innerText = decodedText;
        }

        stop();
      }
    );
    // 这里应该还有一个错误回调函数(没有识别到的时候会执行，太频繁了，没写)
  };
  // 停止摄像头
  const stop = () => {
    html5QrCode
      .stop()
      .then((suc) => {
        console.log("关闭摄像头");
      })
      .catch((err) => {
        console.log("关闭摄像头的时候报错了");
      });
  };
  return (
    <div className={styles?.headSearch}>
      <Space
        block
        direction="vertical"
        style={{
          padding: "12px",
          position: "sticky",
          top: "0 12px 4px",
          zIndex: 999,
        }}
      >
        <SearchBar
          ref={searchRef}
          placeholder="请输入搜索内容"
          searchIcon={
            <ScanningOutline
              style={{ color: "#002FA7", fontSize: "24px" }}
              onClick={() => {
                getCameras();
              }}
            />
          }
          onFocus={() => {
            setVisible1(true);
          }}
        />
      </Space>
      <Popup
        visible={visible1}
        onMaskClick={() => {
          setVisible1(false);
        }}
        onClose={() => {
          setVisible1(false);
        }}
        bodyStyle={{ height: "100vh" }}
      >
        <NavBar
          back="取消"
          onBack={() => {
            setVisible1(false);
          }}
          backIcon={false}
          right={
            <a
              onClick={() => {
                setVisible1(false);
              }}
            >
              完成
            </a>
          }
        >
          标题
        </NavBar>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Enim, officiis
        numquam ipsam magni quisquam ea excepturi qui, quidem beatae, illo
        veniam atque voluptas? Incidunt delectus provident itaque at. Dicta,
        labore.
      </Popup>
    </div>
  );
}
