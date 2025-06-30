import React, { useEffect, useState } from "react";
import { Button, Toast, SpinLoading, Avatar } from "antd-mobile";
import { history, useLocation } from "umi";
import { scanCodeAPI } from "@/service/api/login";
import { setToken } from "@/utils/localToken";
import { storage } from "@/utils/storage";
import styles from "./confirm.less";

/**
 * 扫码确认登录页面组件
 * 显示用户信息并等待用户确认登录
 */
const QRConfirmPage: React.FC = () => {
  const location = useLocation();
  const [userInfo, setUserInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");

  useEffect(() => {
    // 从URL参数中获取sessionId
    const urlParams = new URLSearchParams(location.search);
    const sessionIdFromUrl = urlParams.get("sessionId");

    if (sessionIdFromUrl) {
      setSessionId(sessionIdFromUrl);
      fetchUserInfo(sessionIdFromUrl);
    } else {
      Toast.show({
        icon: "fail",
        content: "无效的登录链接",
      });
      setTimeout(() => {
        history.push("/qrLogin");
      }, 2000);
    }
  }, [location]);

  /**
   * 获取用户信息
   */
  const fetchUserInfo = async (sessionId: string) => {
    try {
      setLoading(true);
      const response = await scanCodeAPI({ sessionId });

      if (response.success) {
        const { userInfo: userData } = response.data;
        setUserInfo(userData);
      } else {
        Toast.show({
          icon: "fail",
          content: response.msg || "获取用户信息失败",
        });
        setTimeout(() => {
          history.push("/qrLogin");
        }, 2000);
      }
    } catch (error) {
      console.error("获取用户信息失败:", error);
      Toast.show({
        icon: "fail",
        content: "网络错误，请重试",
      });
      setTimeout(() => {
        history.push("/qrLogin");
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 确认登录
   */
  const handleConfirmLogin = async () => {
    if (!sessionId) return;

    try {
      setConfirming(true);

      // 调用确认登录API
      const response = await scanCodeAPI({
        sessionId,
        action: "confirm",
      });

      if (response.success) {
        const { token, userInfo: userData } = response.data;

        // 存储登录信息
        await setToken(token);
        storage.set("login-info", userData);

        Toast.show({
          icon: "success",
          content: "登录成功！",
        });

        // 延迟跳转
        setTimeout(() => {
          history.push("/");
        }, 1500);
      } else {
        Toast.show({
          icon: "fail",
          content: response.msg || "确认登录失败",
        });
      }
    } catch (error) {
      console.error("确认登录失败:", error);
      Toast.show({
        icon: "fail",
        content: "网络错误，请重试",
      });
    } finally {
      setConfirming(false);
    }
  };

  /**
   * 取消登录
   */
  const handleCancelLogin = () => {
    history.push("/qrLogin");
  };

  /**
   * 获取用户头像
   */
  const getUserAvatar = () => {
    if (userInfo?.avatar) {
      return userInfo.avatar;
    }
    // 默认头像
    return "https://img.icons8.com/color/96/000000/user-male-circle.png";
  };

  /**
   * 获取用户显示名称
   */
  const getUserDisplayName = () => {
    return (
      userInfo?.username || userInfo?.loginName || userInfo?.email || "未知用户"
    );
  };

  if (loading) {
    return (
      <div className={styles.confirmPage}>
        <div className={styles.container}>
          <div className={styles.loadingWrapper}>
            <SpinLoading color="primary" />
            <p>正在获取用户信息...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.confirmPage}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>确认登录</h1>
          <p>请确认是否使用以下账号登录</p>
        </div>

        <div className={styles.userInfo}>
          <div className={styles.avatarSection}>
            <Avatar
              src={getUserAvatar()}
              className={styles.avatar}
              fallback="👤"
            />
            <div className={styles.userDetails}>
              <h2>{getUserDisplayName()}</h2>
              {userInfo?.email && (
                <p className={styles.email}>{userInfo.email}</p>
              )}
              {userInfo?.loginName &&
                userInfo.loginName !== userInfo?.username && (
                  <p className={styles.loginName}>账号: {userInfo.loginName}</p>
                )}
            </div>
          </div>

          <div className={styles.loginInfo}>
            <div className={styles.infoItem}>
              <span className={styles.label}>登录时间:</span>
              <span className={styles.value}>
                {new Date().toLocaleString("zh-CN")}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>登录设备:</span>
              <span className={styles.value}>
                {navigator.userAgent.includes("Mobile")
                  ? "移动设备"
                  : "桌面设备"}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>IP地址:</span>
              <span className={styles.value}>正在获取...</span>
            </div>
          </div>
        </div>

        <div className={styles.securityTips}>
          <h3>🔒 安全提示</h3>
          <ul>
            <li>请确认登录信息正确</li>
            <li>如非本人操作，请立即取消</li>
            <li>登录后将自动跳转到应用主页</li>
          </ul>
        </div>

        <div className={styles.actions}>
          <Button
            color="primary"
            fill="solid"
            size="large"
            loading={confirming}
            onClick={handleConfirmLogin}
            className={styles.confirmButton}
          >
            {confirming ? "确认中..." : "确认登录"}
          </Button>

          <Button
            fill="none"
            size="large"
            onClick={handleCancelLogin}
            className={styles.cancelButton}
            disabled={confirming}
          >
            取消登录
          </Button>
        </div>

        <div className={styles.footer}>
          <p>如有疑问，请联系管理员</p>
        </div>
      </div>
    </div>
  );
};

export default QRConfirmPage;
