import React, { useEffect, useState } from "react";
import { Button, Toast } from "antd-mobile";
import { Html5Qrcode } from "html5-qrcode";

/**
 * 扫码功能测试页面
 */
const QRTestPage: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState("");

  /**
   * 开始扫码测试
   */
  const startScan = async () => {
    try {
      setIsScanning(true);

      // 获取摄像头权限
      const devices = await Html5Qrcode.getCameras();
      console.log("可用摄像头:", devices);

      if (devices.length === 0) {
        Toast.show({
          icon: "fail",
          content: "未找到摄像头设备",
        });
        return;
      }

      // 初始化扫码器
      const html5QrCode = new Html5Qrcode("test-reader");

      // 开始扫码
      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText, decodedResult) => {
          console.log("扫描结果:", decodedText);
          setResult(decodedText);
          setIsScanning(false);

          Toast.show({
            icon: "success",
            content: "扫描成功！",
          });

          // 停止扫码
          html5QrCode.stop();
        },
        (error) => {
          // 扫码过程中的错误，通常可以忽略
          console.log("扫码错误:", error);
        }
      );
    } catch (error) {
      console.error("启动扫码失败:", error);
      setIsScanning(false);
      Toast.show({
        icon: "fail",
        content: "启动扫码失败",
      });
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>扫码功能测试</h1>

      <div style={{ marginBottom: 20 }}>
        <Button color="primary" onClick={startScan} disabled={isScanning}>
          {isScanning ? "扫码中..." : "开始扫码测试"}
        </Button>
      </div>

      <div
        id="test-reader"
        style={{
          width: "100%",
          height: 300,
          border: "2px solid #ccc",
          borderRadius: 8,
          marginBottom: 20,
        }}
      ></div>

      {result && (
        <div
          style={{
            padding: 15,
            background: "#f0f0f0",
            borderRadius: 8,
            wordBreak: "break-all",
          }}
        >
          <h3>扫描结果：</h3>
          <p>{result}</p>
        </div>
      )}
    </div>
  );
};

export default QRTestPage;
