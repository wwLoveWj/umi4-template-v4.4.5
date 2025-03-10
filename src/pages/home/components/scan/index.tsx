import React, { useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
export default function Index() {
  let html5Qrcode = null;
  const [isScaning, setScaning] = useState(false);

  //methods方法
  const openQrcode = () => {
    setScaning(true);
    Html5Qrcode.getCameras().then((devices) => {
      debugger;
      if (devices && devices.length) {
        html5Qrcode = new Html5Qrcode("reader");
        html5Qrcode.start(
          {
            facingMode: "environment",
          },
          {
            focusMode: "continuous", //设置连续聚焦模式
            fps: 5, //设置扫码识别速度
            qrbox: 280, //设置二维码扫描框大小
          },
          (decodeText, decodeResult) => {
            if (decodeText) {
              debugger;
              //这里decodeText就是通过扫描二维码得到的内容
              // this.action(decodeText)  //对二维码逻辑处理
              stopScan(); //关闭扫码功能
            }
          },
          (err) => {
            // console.log(err);  //错误信息
          }
        );
      }
    });
  };

  const stopScan = () => {
    console.log("停止扫码");
    setScaning(false);
    if (html5Qrcode) {
      html5Qrcode.stop();
    }
  };
  return (
    <div>
      <button onClick={() => openQrcode()}>代码扫描</button>
    </div>
  );
}
