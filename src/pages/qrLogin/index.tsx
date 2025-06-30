import React, { useEffect, useState, useRef } from "react";
import { Button, Toast, SpinLoading, Dialog } from "antd-mobile";
import { history } from "umi";
import { Html5Qrcode } from "html5-qrcode";
import { scanCodeAPI } from "@/service/api/login";
import { setToken } from "@/utils/localToken";
import { storage } from "@/utils/storage";
import styles from "./style.less";

/**
 * 扫码登录页面组件
 * 用于扫描Electron应用显示的二维码进行登录
 */
const QRLoginPage: React.FC = () => {
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanStatus, setScanStatus] = useState<
    "idle" | "scanning" | "success" | "error"
  >("idle");
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const [cameraDevices, setCameraDevices] = useState<any[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>("");

  /**
   * 获取摄像头设备列表
   */
  const getCameras = async () => {
    try {
      const devices = await Html5Qrcode.getCameras();
      setCameraDevices(devices);
      if (devices.length > 0) {
        // 默认选择后置摄像头
        const backCamera = devices.find(
          (device) =>
            device.label.toLowerCase().includes("back") ||
            device.label.toLowerCase().includes("后置") ||
            device.label.toLowerCase().includes("environment")
        );
        setSelectedCamera(backCamera ? backCamera.id : devices[0].id);
      }
    } catch (error) {
      console.error("获取摄像头失败:", error);
      Toast.show({
        icon: "fail",
        content: "无法访问摄像头，请检查权限设置",
      });
    }
  };

  /**
   * 开始扫码
   */
  const startScan = async () => {
    if (!selectedCamera) {
      Toast.show({
        icon: "fail",
        content: "请先选择摄像头",
      });
      return;
    }

    try {
      setIsScanning(true);
      setScanStatus("scanning");

      // 初始化扫码器
      html5QrCodeRef.current = new Html5Qrcode("qr-reader");

      // 开始扫码
      await html5QrCodeRef.current.start(
        { deviceId: selectedCamera },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          disableFlip: false,
        },
        onScanSuccess,
        onScanError
      );
    } catch (error) {
      console.error("启动扫码失败:", error);
      setScanStatus("error");
      Toast.show({
        icon: "fail",
        content: "启动扫码失败，请重试",
      });
    }
  };

  /**
   * 停止扫码
   */
  const stopScan = async () => {
    if (html5QrCodeRef.current && isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        setIsScanning(false);
        setScanStatus("idle");
      } catch (error) {
        console.error("停止扫码失败:", error);
      }
    }
  };

  /**
   * 扫码成功回调
   */
  const onScanSuccess = async (decodedText: string, decodedResult: any) => {
    try {
      console.log("=== 扫码结果处理开始 ===");
      console.log("原始扫描结果:", decodedText);

      // 停止扫码，避免重复扫描
      await stopScan();

      let sessionId = "";
      let token = "";
      // 尝试解析二维码内容
      try {
        // 方法1: 尝试解析为URL
        if (
          decodedText.startsWith("http://") ||
          decodedText.startsWith("https://")
        ) {
          const url = new URL(decodedText);

          // 先从search参数中获取
          sessionId = url.searchParams.get("sessionId") || "";
          token = url.searchParams.get("token") || "";

          // 如果search参数中没有，尝试从hash部分解析
          if (!sessionId || !token) {
            console.log("从hash部分解析参数:", url.hash);
            if (url.hash) {
              // 移除开头的#号
              const hashParams = url.hash.substring(1);
              if (hashParams.includes("?")) {
                const hashUrl = new URL(`http://dummy.com${hashParams}`);
                sessionId =
                  sessionId || hashUrl.searchParams.get("sessionId") || "";
                token = token || hashUrl.searchParams.get("token") || "";
              }
            }
          }

          console.log("解析URL结果:", {
            sessionId,
            token,
            url: url.toString(),
            searchParams: Object.fromEntries(url.searchParams.entries()),
            hash: url.hash,
          });
        } else {
          // 方法2: 尝试解析为查询字符串
          const params = new URLSearchParams(decodedText);
          sessionId = params.get("sessionId") || "";
          token = params.get("token") || "";

          console.log("解析查询字符串结果:", { sessionId, token });
        }
      } catch (parseError) {
        console.log("URL解析失败，尝试其他格式:", parseError);

        // 方法3: 直接使用二维码内容作为sessionId
        if (decodedText && decodedText.length > 0) {
          sessionId = decodedText;
        }
      }

      console.log("最终解析结果:", { sessionId, token });

      // 检查是否有有效的sessionId或token
      if (!sessionId && !token) {
        console.log("没有找到有效的sessionId或token");
        Toast.show({
          icon: "fail",
          content: "无效的二维码格式",
        });
        return;
      }

      // 如果URL中直接包含了token，可以直接登录
      if (token) {
        console.log("检测到直接token，尝试直接登录");

        // 直接使用token登录
        try {
          await setToken(token);

          // 获取用户信息（这里可能需要调用用户信息API）
          const userInfo = {
            username: "扫码登录用户",
            loginName: sessionId || "qr_user",
            email: "",
            avatar: "",
            loginPath: "/",
            menuList: [],
          };

          storage.set("login-info", userInfo);

          setScanStatus("success");

          Toast.show({
            icon: "success",
            content: "登录成功！",
          });

          // 延迟跳转
          setTimeout(() => {
            history.push("/home");
          }, 1500);

          return;
        } catch (tokenError) {
          console.error("直接token登录失败:", tokenError);
          // 如果直接登录失败，继续尝试API登录
        }
      }

      // 如果有sessionId，调用扫码登录API
      if (sessionId) {
        console.log("调用扫码登录API，sessionId:", sessionId);
        const response = await scanCodeAPI({ sessionId });

        if (response.success) {
          setScanStatus("success");

          // 检查是否需要确认登录
          if (response.data?.needConfirm) {
            // 跳转到确认页面
            Toast.show({
              icon: "success",
              content: "扫码成功，请确认登录",
            });

            setTimeout(() => {
              history.push(`/qrLogin/confirm?sessionId=${sessionId}`);
            }, 1000);
          } else {
            // 直接登录
            const { token: apiToken, userInfo } = response.data;
            await setToken(apiToken);
            storage.set("login-info", userInfo);

            Toast.show({
              icon: "success",
              content: "登录成功！",
            });

            // 延迟跳转
            setTimeout(() => {
              history.push("/");
            }, 1500);
          }
        } else {
          Toast.show({
            icon: "fail",
            content: response.msg || "登录失败",
          });

          // 登录失败后重新开始扫码
          setTimeout(() => {
            setScanStatus("idle");
            startScan();
          }, 2000);
        }
      } else {
        Toast.show({
          icon: "fail",
          content: "二维码格式不支持",
        });

        // 重新开始扫码
        setTimeout(() => {
          setScanStatus("idle");
          startScan();
        }, 2000);
      }
    } catch (error) {
      console.error("处理扫码结果失败:", error);

      // 显示具体的错误信息
      let errorMessage = "处理扫码结果失败";
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      Toast.show({
        icon: "fail",
        content: errorMessage,
      });

      // 错误后重新开始扫码
      setTimeout(() => {
        setScanStatus("idle");
        startScan();
      }, 2000);
    }
  };

  /**
   * 扫码错误回调
   */
  const onScanError = (error: any) => {
    // 扫码过程中的错误，通常可以忽略
    // console.log("扫码错误:", error);
  };

  /**
   * 切换摄像头
   */
  const switchCamera = () => {
    if (cameraDevices.length > 1) {
      const currentIndex = cameraDevices.findIndex(
        (device) => device.id === selectedCamera
      );
      const nextIndex = (currentIndex + 1) % cameraDevices.length;
      setSelectedCamera(cameraDevices[nextIndex].id);

      if (isScanning) {
        // 如果正在扫码，需要重新启动
        stopScan().then(() => {
          setTimeout(startScan, 500);
        });
      }
    }
  };

  /**
   * 返回登录页
   */
  const goBackToLogin = () => {
    Dialog.confirm({
      content: "确定要返回密码登录吗？",
      onConfirm: () => {
        stopScan();
        history.push("/login");
      },
    });
  };

  useEffect(() => {
    // 组件挂载时获取摄像头
    getCameras();

    // 组件卸载时清理
    return () => {
      stopScan();
    };
  }, []);

  return (
    <div className={styles.qrLoginPage}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>扫码登录</h1>
          <p>请扫描Electron应用显示的二维码</p>
        </div>

        <div className={styles.scanContainer}>
          {/* 摄像头选择 */}
          {cameraDevices.length > 1 && (
            <div className={styles.cameraSelector}>
              <select
                value={selectedCamera}
                onChange={(e) => setSelectedCamera(e.target.value)}
                disabled={isScanning}
              >
                {cameraDevices.map((device) => (
                  <option key={device.id} value={device.id}>
                    {device.label || `摄像头 ${device.id}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 扫码区域 */}
          <div className={styles.scanArea}>
            <div id="qr-reader" className={styles.qrReader}></div>

            {/* 扫码状态覆盖层 */}
            {scanStatus === "success" && (
              <div className={styles.successOverlay}>
                <div className={styles.successIcon}>✓</div>
                <p>登录成功！正在跳转...</p>
              </div>
            )}

            {scanStatus === "error" && (
              <div className={styles.errorOverlay}>
                <div className={styles.errorIcon}>❌</div>
                <p>扫码失败，请重试</p>
              </div>
            )}
          </div>

          {/* 扫码控制按钮 */}
          <div className={styles.controls}>
            {!isScanning ? (
              <Button
                color="primary"
                fill="solid"
                onClick={startScan}
                disabled={!selectedCamera}
                className={styles.scanButton}
              >
                开始扫码
              </Button>
            ) : (
              <Button
                color="default"
                fill="outline"
                onClick={stopScan}
                className={styles.stopButton}
              >
                停止扫码
              </Button>
            )}

            {cameraDevices.length > 1 && (
              <Button
                fill="none"
                onClick={switchCamera}
                disabled={isScanning}
                className={styles.switchButton}
              >
                切换摄像头
              </Button>
            )}
          </div>
        </div>

        <div className={styles.tips}>
          <h3>使用说明：</h3>
          <ul>
            <li>确保Electron应用已打开并显示登录二维码</li>
            <li>将二维码对准扫描框</li>
            <li>保持手机稳定，等待自动识别</li>
            <li>识别成功后会自动登录并跳转</li>
          </ul>
        </div>

        <div className={styles.actions}>
          <Button
            fill="none"
            onClick={goBackToLogin}
            className={styles.backButton}
          >
            返回密码登录
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QRLoginPage;
