import React, { useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { storage } from "@/utils/storage";
import { Toast } from "antd-mobile";

// 获取用户信息
const useScan = () => {
  let html5QrCode: any = storage.get("html5QrCode");
  const u = navigator.userAgent;
  const isAndroid = u.indexOf("Android") > -1 || u.indexOf("Adr") > -1;
  // const isIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);

  // 原文链接：https://blog.csdn.net/qq_60654563/article/details/140920510
  const getCameras = () => {
    Html5Qrcode.getCameras()
      .then((devices) => {
        Toast.show(
          `摄像头列表获取成功,${devices?.length}个摄像头获取成功,${devices?.[0]?.id},${devices?.[0]?.label}`
        );

        // 返回的是你的摄像设备列表，手机有两个摄像头，电脑返回一个摄像头
        // 初始化扫描程序，在这里需要传递标签的id，第二个参数用来控制识别类型（没用过）
        html5QrCode = new Html5Qrcode("reader");
        storage.set("html5QrCode", new Html5Qrcode("reader"));
        if (isAndroid) {
          start(devices?.[1]?.id);
        } else {
          start(devices?.[0]?.id);
        }
      })
      .catch((err) => {
        var errMsg = "";
        let name = err.name;
        if (name?.includes("NotAllowedError")) {
          errMsg = "ERROR: 您需要授予相机访问权限";
        } else if (name.indexOf("NotFoundError") != -1) {
          errMsg = "ERROR: 这个设备上没有摄像头";
        } else if (name.indexOf("NotSupportedError") != -1) {
          errMsg = "ERROR: 所需的安全上下文(HTTPS、本地主机)";
        } else if (name.indexOf("NotReadableError") != -1) {
          errMsg = "ERROR: 相机被占用";
        } else if (name.indexOf("OverconstrainedError") != -1) {
          errMsg = "ERROR: 安装摄像头不合适";
        } else if (name.indexOf("StreamApiNotSupportedError") != -1) {
          errMsg = "ERROR: 此浏览器不支持流API";
        } else {
          errMsg = err;
        }
        Toast.show(errMsg);
        // html5QrCode = new Html5Qrcode("reader");
        // storage.set("html5QrCode", new Html5Qrcode("reader"));
        // stop();
      });
  };
  // 开始扫描相机给的二维码
  const start = (cameraId: string) => {
    (document.querySelector("#home") as HTMLDivElement).style.display = "none";
    html5QrCode.start(
      // environment后置摄像头 user前置摄像头 也可以传递获取摄像头时的id
      // 也可以是这样的
      { deviceId: { exact: cameraId } },
      // { facingMode: "environment" },
      {
        fps: 20, // 可选，每秒帧扫描二维码
        qrbox: { width: 250, height: 250 }, // 可选，如果你想要有界框UI
        aspectRatio: 1.777778, // 可选，视频馈送需要的纵横比，(4:3--1.333334, 16:9--1.777778, 1:1--1.0)传递错误的纵横比会导致视频不显示
      },
      (decodedText: string) => {
        if (
          decodedText?.startsWith("https://") ||
          decodedText?.startsWith("http://")
        ) {
          window.location.href = `${decodedText}`;
        } else {
          // 成功的回调函数
          (document.getElementById("msg") as HTMLDivElement).innerText =
            decodedText;
          // Toast.show(`扫码成功,${decodedText}`);
        }

        stop();
      }
    );
    // 原文链接：https://blog.csdn.net/qq_60654563/article/details/140920510
    // 这里应该还有一个错误回调函数(没有识别到的时候会执行，太频繁了，没写)
  };
  // 停止摄像头
  const stop = () => {
    console.log(html5QrCode, "关闭了吗");
    html5QrCode
      .stop()
      .then((suc: any) => {
        console.log("关闭摄像头", suc);
        storage.del("html5QrCode");
        Toast.show("摄像头已关闭");
      })
      .catch((err: any) => {
        console.log("关闭摄像头的时候报错了", err);
        Toast.show(err);
      });
  };
  return {
    getCameras,
    stop,
    html5QrCode,
  };
};

export default useScan;
