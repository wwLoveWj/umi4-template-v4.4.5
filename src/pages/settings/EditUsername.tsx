import React, { useState, useEffect } from "react";
import { NavBar, Button, Input, Toast } from "antd-mobile";
import { useNavigate } from "umi";
import { storage } from "@/utils/storage";
import { UserInfoUpdateAPI } from "@/service/api/user";

/**
 * 用户名修改页面
 * @returns {JSX.Element}
 */
const EditUsername: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [saving, setSaving] = useState(false);

  // 初始化用户名
  useEffect(() => {
    const info = storage.get("login-info") as any;
    if (info && (info.username || info.loginName)) {
      setUsername(info.username || info.loginName || "");
    }
  }, []);

  // 保存用户名
  const handleSave = async () => {
    if (!username.trim()) return;
    setSaving(true);
    // 更新本地 storage
    const info = (storage.get("login-info") || {}) as any;
    info.username = username.trim();
    storage.set("login-info", info);
    // 同步数据库
    const userId = (storage.get("login-info") as any)?.userId;
    if (userId) {
      try {
        await UserInfoUpdateAPI({ userId, username: username.trim() } as any);
      } catch (e) {
        Toast.show({ icon: "fail", content: "数据库同步失败" });
      }
    }
    setTimeout(() => {
      setSaving(false);
      Toast.show({ icon: "success", content: "保存成功" });
      navigate(-1);
    }, 500);
  };

  return (
    <div style={{ background: "#f7f7f7", minHeight: "100vh" }}>
      <NavBar
        back="返回"
        onBack={() => navigate(-1)}
        right={
          <Button
            color="primary"
            size="small"
            disabled={!username.trim()}
            loading={saving}
            onClick={handleSave}
            style={{
              background: "transparent",
              border: "none",
              color: !username.trim() ? "#ccc" : "#1677ff",
              fontWeight: 600,
            }}
          >
            保存
          </Button>
        }
      >
        更改名字
      </NavBar>
      <div style={{ padding: "32px 20px 0 20px" }}>
        <Input
          value={username}
          onChange={setUsername}
          placeholder="请输入新用户名"
          clearable
          style={{
            fontSize: 18,
            fontWeight: 500,
            border: "none",
            background: "transparent",
            padding: 0,
          }}
        />
        <div
          style={{
            borderBottom: "1px solid #eee",
            margin: "8px 0 0 0",
          }}
        />
        <div
          style={{
            color: "#bbb",
            fontSize: 14,
            marginTop: 12,
          }}
        >
          好名字可以让你的朋友更容易记住你。
        </div>
      </div>
    </div>
  );
};

export default EditUsername;
