import React, { useState } from "react";
import { NavBar, Button, Input, Toast } from "antd-mobile";
import { useNavigate } from "umi";

/**
 * 用户名修改页面
 * @returns {JSX.Element}
 */
const EditUsername: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState(""); // 可根据实际情况初始化
  const [saving, setSaving] = useState(false);

  // 保存用户名
  const handleSave = async () => {
    if (!username.trim()) return;
    setSaving(true);
    // TODO: 调用后端接口保存
    setTimeout(() => {
      setSaving(false);
      Toast.show({ icon: "success", content: "保存成功" });
      navigate(-1); // 返回上一页
    }, 800);
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
