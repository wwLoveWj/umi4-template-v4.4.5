import Push from "push.js";
import { Toast } from "antd-mobile";

// Push.js 基础使用示例
export class PushExample {
  // 初始化通知权限
  static async initPermission(): Promise<boolean> {
    try {
      // 检查浏览器是否支持通知
      if (!("Notification" in window)) {
        Toast.show("此浏览器不支持通知功能");
        return false;
      }

      // 检查权限状态
      const permission = Push.Permission.get();
      console.log("当前通知权限:", permission);

      // 如果没有权限，请求权限
      if (permission === "default") {
        const newPermission = await Push.Permission.request();
        console.log("请求后的通知权限:", newPermission);

        if (newPermission === "granted") {
          Toast.show("通知权限已授权");
          return true;
        } else {
          Toast.show("通知权限被拒绝");
          return false;
        }
      }

      return permission === "granted";
    } catch (error) {
      console.error("初始化通知权限失败:", error);
      return false;
    }
  }

  // 发送简单通知
  static sendSimpleNotification(title: string, message: string) {
    try {
      if (!Push.Permission.has()) {
        Toast.show("请先授权通知权限");
        return;
      }

      Push.create(title, {
        body: message,
        timeout: 4000,
        onClick: () => {
          console.log("通知被点击");
        },
      });
    } catch (error) {
      console.error("发送通知失败:", error);
      Toast.show("发送通知失败");
    }
  }

  // 发送重要通知
  static sendImportantNotification(title: string, message: string) {
    try {
      if (!Push.Permission.has()) {
        Toast.show("请先授权通知权限");
        return;
      }

      Push.create(title, {
        body: message,
        requireInteraction: true,
        timeout: 10000,
        vibrate: [200, 100, 200],
        onClick: () => {
          console.log("重要通知被点击");
        },
      });
    } catch (error) {
      console.error("发送重要通知失败:", error);
      Toast.show("发送通知失败");
    }
  }

  // 发送带操作的通知
  static sendActionableNotification(title: string, message: string) {
    try {
      if (!Push.Permission.has()) {
        Toast.show("请先授权通知权限");
        return;
      }

      Push.create(title, {
        body: message,
        requireInteraction: true,
        actions: [
          {
            action: "accept",
            title: "接受",
          },
          {
            action: "decline",
            title: "拒绝",
          },
          {
            action: "view",
            title: "查看",
          },
        ],
        timeout: 15000,
        onActionClick: (action) => {
          console.log("用户点击了操作:", action);
          switch (action) {
            case "accept":
              Toast.show("已接受");
              break;
            case "decline":
              Toast.show("已拒绝");
              break;
            case "view":
              Toast.show("查看详情");
              break;
            default:
              console.log("未知操作:", action);
          }
        },
      });
    } catch (error) {
      console.error("发送可操作通知失败:", error);
      Toast.show("发送通知失败");
    }
  }

  // 发送定时通知
  static sendScheduledNotification(
    title: string,
    message: string,
    delay: number
  ) {
    setTimeout(() => {
      this.sendSimpleNotification(title, message);
    }, delay);
  }

  // 发送系统通知
  static sendSystemNotification(title: string, message: string) {
    try {
      if (!Push.Permission.has()) {
        Toast.show("请先授权通知权限");
        return;
      }

      Push.create(title, {
        body: message,
        silent: true,
        timeout: 3000,
        tag: "system",
      });
    } catch (error) {
      console.error("发送系统通知失败:", error);
    }
  }

  // 发送错误通知
  static sendErrorNotification(title: string, error: string) {
    try {
      if (!Push.Permission.has()) {
        Toast.show("请先授权通知权限");
        return;
      }

      Push.create(title, {
        body: error,
        requireInteraction: true,
        timeout: 8000,
        tag: "error",
      });
    } catch (err) {
      console.error("发送错误通知失败:", err);
    }
  }

  // 发送成功通知
  static sendSuccessNotification(title: string, message: string) {
    try {
      if (!Push.Permission.has()) {
        Toast.show("请先授权通知权限");
        return;
      }

      Push.create(title, {
        body: message,
        timeout: 3000,
        tag: "success",
      });
    } catch (error) {
      console.error("发送成功通知失败:", error);
    }
  }

  // 测试通知功能
  static async testNotifications() {
    console.log("开始测试通知功能...");

    // 初始化权限
    const hasPermission = await this.initPermission();
    if (!hasPermission) {
      console.log("没有通知权限，无法测试");
      return;
    }

    // 测试简单通知
    this.sendSimpleNotification("测试通知", "这是一条测试消息");

    // 延迟 2 秒后发送重要通知
    setTimeout(() => {
      this.sendImportantNotification("重要通知", "这是一条重要消息");
    }, 2000);

    // 延迟 4 秒后发送可操作通知
    setTimeout(() => {
      this.sendActionableNotification("操作通知", "请选择操作");
    }, 4000);

    // 延迟 6 秒后发送系统通知
    setTimeout(() => {
      this.sendSystemNotification("系统通知", "系统维护通知");
    }, 6000);

    // 延迟 8 秒后发送成功通知
    setTimeout(() => {
      this.sendSuccessNotification("成功通知", "操作成功完成");
    }, 8000);
  }

  // 获取通知状态信息
  static getNotificationStatus() {
    return {
      isSupported: "Notification" in window,
      hasPermission: Push.Permission.has(),
      permissionStatus: Push.Permission.get(),
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    };
  }

  // 设置默认配置
  static setDefaultConfig() {
    Push.config({
      icon: "/favicon.ico",
      timeout: 4000,
      requireInteraction: false,
      silent: false,
    });
  }

  // 获取当前配置
  static getCurrentConfig() {
    return Push.config();
  }
}

// 导出便捷函数
export const initPushPermission = () => PushExample.initPermission();
export const sendSimpleNotification = (title: string, message: string) =>
  PushExample.sendSimpleNotification(title, message);
export const sendImportantNotification = (title: string, message: string) =>
  PushExample.sendImportantNotification(title, message);
export const sendActionableNotification = (title: string, message: string) =>
  PushExample.sendActionableNotification(title, message);
export const sendScheduledNotification = (
  title: string,
  message: string,
  delay: number
) => PushExample.sendScheduledNotification(title, message, delay);
export const sendSystemNotification = (title: string, message: string) =>
  PushExample.sendSystemNotification(title, message);
export const sendErrorNotification = (title: string, error: string) =>
  PushExample.sendErrorNotification(title, error);
export const sendSuccessNotification = (title: string, message: string) =>
  PushExample.sendSuccessNotification(title, message);
export const testNotifications = () => PushExample.testNotifications();
export const getNotificationStatus = () => PushExample.getNotificationStatus();
export const setDefaultConfig = () => PushExample.setDefaultConfig();
export const getCurrentConfig = () => PushExample.getCurrentConfig();
