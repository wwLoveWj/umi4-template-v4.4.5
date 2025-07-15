import React from "react";
import { List, Switch, NavBar, Toast } from "antd-mobile";
import { useNotification } from "@/hooks/useNotification";
import { history } from "umi";

/**
 * 通知订阅设置页面
 */
const NotificationSettings: React.FC = () => {
  const { subscriptionSettings, updateSettings, isConnected } =
    useNotification();

  /**
   * 处理开关切换
   */
  const handleSwitchChange = async (key: string, value: boolean) => {
    if (!subscriptionSettings) return;

    try {
      await updateSettings({ [key]: value });
    } catch (error) {
      console.error("更新设置失败:", error);
    }
  };

  if (!subscriptionSettings) {
    return (
      <div>
        <NavBar onBack={() => history.back()}>通知设置</NavBar>
        <div style={{ padding: 20, textAlign: "center", color: "#999" }}>
          加载中...
        </div>
      </div>
    );
  }

  return (
    <div>
      <NavBar onBack={() => history.back()}>通知设置</NavBar>

      {/* 连接状态 */}
      <div
        style={{
          padding: "12px 16px",
          background: isConnected ? "#f6ffed" : "#fff2f0",
          borderBottom: "1px solid #f0f0f0",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: isConnected ? "#52c41a" : "#ff4d4f",
          }}
        />
        <span
          style={{
            fontSize: 14,
            color: isConnected ? "#52c41a" : "#ff4d4f",
          }}
        >
          {isConnected ? "实时连接正常" : "连接异常，通知可能延迟"}
        </span>
      </div>

      <List header="推送通知">
        <List.Item
          extra={
            <Switch
              checked={subscriptionSettings.systemNotification}
              onChange={(checked) =>
                handleSwitchChange("systemNotification", checked)
              }
            />
          }
        >
          系统通知
          <div style={{ fontSize: 12, color: "#999", marginTop: 4 }}>
            接收系统维护、更新等重要通知
          </div>
        </List.Item>

        <List.Item
          extra={
            <Switch
              checked={subscriptionSettings.articleUpdate}
              onChange={(checked) =>
                handleSwitchChange("articleUpdate", checked)
              }
            />
          }
        >
          关注人文章更新
          <div style={{ fontSize: 12, color: "#999", marginTop: 4 }}>
            当关注的人发布新文章时通知您
          </div>
        </List.Item>

        <List.Item
          extra={
            <Switch
              checked={subscriptionSettings.likeNotification}
              onChange={(checked) =>
                handleSwitchChange("likeNotification", checked)
              }
            />
          }
        >
          点赞通知
          <div style={{ fontSize: 12, color: "#999", marginTop: 4 }}>
            当有人点赞您的文章时通知您
          </div>
        </List.Item>

        <List.Item
          extra={
            <Switch
              checked={subscriptionSettings.collectNotification}
              onChange={(checked) =>
                handleSwitchChange("collectNotification", checked)
              }
            />
          }
        >
          收藏通知
          <div style={{ fontSize: 12, color: "#999", marginTop: 4 }}>
            当有人收藏您的文章时通知您
          </div>
        </List.Item>

        <List.Item
          extra={
            <Switch
              checked={subscriptionSettings.followNotification}
              onChange={(checked) =>
                handleSwitchChange("followNotification", checked)
              }
            />
          }
        >
          关注通知
          <div style={{ fontSize: 12, color: "#999", marginTop: 4 }}>
            当有人关注您时通知您
          </div>
        </List.Item>
      </List>

      <div
        style={{
          padding: "16px",
          fontSize: 12,
          color: "#999",
          lineHeight: 1.5,
          background: "#f8f9fa",
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: 8 }}>说明：</div>
        <div>• 关闭某项通知后，您将不会收到该类型的推送</div>
        <div>• 已关闭的通知仍会保存在消息中心，但不会实时推送</div>
        <div>• 系统通知建议保持开启，以免错过重要信息</div>
      </div>
    </div>
  );
};

export default NotificationSettings;
