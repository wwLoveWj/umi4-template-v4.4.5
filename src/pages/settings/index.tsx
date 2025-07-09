import React from "react";
import { List, Button, Dialog, Toast } from "antd-mobile";
import { history } from "umi";

/**
 * 设置页面
 */
const Settings: React.FC = () => {
  // 清除缓存
  const handleClearCache = () => {
    Dialog.confirm({
      content: "确定要清除缓存吗？",
      onConfirm: () => {
        localStorage.clear();
        sessionStorage.clear();
        Toast.show({ icon: "success", content: "缓存已清除" });
      },
    });
  };

  // 退出登录
  const handleLogout = () => {
    Dialog.confirm({
      content: "确定要退出登录吗？",
      onConfirm: () => {
        localStorage.clear();
        sessionStorage.clear();
        Toast.show({ icon: "success", content: "已退出登录" });
        history.replace("/login");
      },
    });
  };

  return (
    <div>
      <List header="设置">
        {/* 账号信息 */}
        <List.Item extra="未绑定">手机号</List.Item>
        {/* 清除缓存 */}
        <List.Item onClick={handleClearCache}>一键清除缓存</List.Item>
        {/* 关于 */}
        <List.Item
          onClick={() =>
            Dialog.alert({
              content: (
                <div>
                  <div>宝宝成长记</div>
                  <div style={{ fontSize: 12, color: "#aaa" }}>v1.0.0</div>
                </div>
              ),
            })
          }
        >
          关于
        </List.Item>
      </List>
      <div style={{ padding: 16 }}>
        <Button block color="danger" onClick={handleLogout}>
          退出登录
        </Button>
      </div>
    </div>
  );
};

export default Settings;
