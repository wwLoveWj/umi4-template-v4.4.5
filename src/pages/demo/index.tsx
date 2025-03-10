import React, { useEffect, useState } from "react";
import jsQR from "jsqr";
export default function Index() {
  const video = document.getElementById("camera-stream") as HTMLDivElement;
  const resultDiv = document.getElementById("result");
  const resultDivRef = React.useRef(resultDiv);

  const [direction, setDirection] = useState(0);
  const getUserMedia = (constraints: any, success: any, error: any) => {
    if (navigator.mediaDevices.getUserMedia) {
      //最新的标准API
      navigator.mediaDevices
        .getUserMedia(constraints)
        .then(success)
        .catch(error);
    } else if (navigator.webkitGetUserMedia) {
      //webkit核心浏览器
      navigator.webkitGetUserMedia(constraints, success, error);
    } else if (navigator.mozGetUserMedia) {
      //firfox浏览器
      navigator.mozGetUserMedia(constraints, success, error);
    } else if (navigator.getUserMedia) {
      //旧版API
      navigator.getUserMedia(constraints, success, error);
    }
  };
  const success = (stream: any) => {
    //兼容webkit核心浏览器
    let CompatibleURL = window.URL || window.webkitURL;
    //将视频流设置为video元素的源
    // let videoElement = document.getElementById("video");
    //@ts-ignore
    video.srcObject = stream;
    requestAnimationFrame(scanQRCode);
    //@ts-ignore
    video.play();
  };

  const error = (error: any) => {
    alert(`访问用户媒体设备失败${error.name}, ${error.message}`);
    console.log(`访问用户媒体设备失败${error.name}, ${error.message}`);
  };
  // 原文链接：https://blog.csdn.net/weixin_46600931/article/details/127770594
  useEffect(() => {
    if (video?.srcObject) {
      video.srcObject.getTracks()[0].stop();
    }
    if (
      //@ts-ignore
      // 开启
      navigator.mediaDevices.getUserMedia ||
      navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia ||
      navigator.msGetUserMedia ||
      navigator.oGetUserMedia
    ) {
      var facingMode: any = null;
      if (direction == 1) {
        facingMode = { exact: "environment" };
      } else {
        facingMode = { exact: "user" };
      }
      // 切换摄像头需先关闭再打开
      if (video?.srcObject) {
        video.srcObject.getTracks()[0].stop();
      }
      //调用用户媒体设备, 访问摄像头
      getUserMedia(
        { video: { width: 480, height: 320, facingMode: facingMode } }, // user 前置
        success,
        error
      );
    } else {
      alert("不支持访问用户媒体");
    }
    // 请求摄像头权限并获取视频流
    // navigator.mediaDevices
    //   .getUserMedia({ video: { facingMode: "environment" } })
    //   .then((stream) => {
    //     debugger;

    //     video.srcObject = stream;
    //     requestAnimationFrame(scanQRCode);
    //   })
    //   .catch((err) => {
    //     console.error("无法访问摄像头:", err);
    //     resultDivRef.current.textContent = "无法访问摄像头";
    //   });
  }, [direction]);

  // 扫描二维码
  function scanQRCode() {
    // debugger;
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas
        .getContext("2d")
        .drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = canvas
        .getContext("2d")
        .getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);

      if (code) {
        resultDivRef.current.textContent = `扫描结果: ${code.data}`;
        window.location.href = code.data;
        video.srcObject.getTracks().forEach((track) => track.stop()); // 停止摄像头
        return;
      }
    }
    requestAnimationFrame(scanQRCode); // 继续扫描下一帧
  }

  return (
    <div>
      <button onClick={() => setDirection(direction == 1 ? 0 : 1)}>
        切换前后置
      </button>
      <video
        id="camera-stream"
        autoPlay
        playsInline
        style={{ width: "100%", maxWidth: "400px" }}
      ></video>
      <div id="result" ref={resultDivRef}></div>
    </div>
  );
}
