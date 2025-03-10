import React, { useEffect } from "react";
import { Button } from "antd-mobile";
import { history } from "umi";
import { Html5Qrcode } from "html5-qrcode";
export default function Scan() {
  let html5QrCode = null;
  // 获取摄像头权限
  const getCameras = () => {
    Html5Qrcode.getCameras()
      .then((devices) => {
        debugger;
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
    document.querySelector("button").style.display = "none";
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
        window.location.href = `${decodedText}`;
        // 成功的回调函数
        // document.getElementById("msg").innerText = decodedText;
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

  //   useEffect(() => {
  //     getCameras();
  //   }, []);
  return (
    <div>
      999
      <div className="qrcode">
        <div id="reader"></div>
        <div id="msg"></div>
      </div>
    </div>
  );
}
