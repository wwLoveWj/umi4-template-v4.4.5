import React, { useState, useEffect } from "react";
import { NavBar, Button, Input, Toast } from "antd-mobile";
import { useNavigate, useLocation } from "umi";
import { storage } from "@/utils/storage";
import { UserInfoUpdateAPI } from "@/service/api/user";

/**
 * 用户名/昵称修改页面
 * @returns {JSX.Element}
 */
const EditUsername: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const loginInfo = storage.get("login-info");

  // 从URL参数获取编辑类型
  const searchParams = new URLSearchParams(location.search);
  const editType = searchParams.get("type") || "username"; // 'username' 或 'nickname'

  // 根据编辑类型设置初始值和标题
  const getInitialValue = () => {
    if (editType === "nickname") {
      return loginInfo?.nickname || "";
    }
    return loginInfo?.username || "";
  };

  const getTitle = () => {
    return editType === "nickname" ? "修改昵称" : "修改用户名";
  };

  const getPlaceholder = () => {
    return editType === "nickname" ? "请输入新昵称" : "请输入新用户名";
  };

  const getDescription = () => {
    return editType === "nickname"
      ? "好昵称可以让你的朋友更容易记住你。"
      : "好名字可以让你的朋友更容易记住你。";
  };

  const [value, setValue] = useState(getInitialValue());
  const [saving, setSaving] = useState(false);

  // 保存用户名或昵称
  const handleSave = async () => {
    if (!value.trim()) return;
    setSaving(true);

    const userId = loginInfo?.userId || loginInfo?.id;
    if (userId) {
      try {
        const updateData =
          editType === "nickname"
            ? { userId: String(userId), nickname: value.trim() }
            : { userId: String(userId), username: value.trim() };

        await UserInfoUpdateAPI(updateData);

        // 更新本地存储
        const updatedLoginInfo = { ...loginInfo };
        if (editType === "nickname") {
          updatedLoginInfo.nickname = value.trim();
        } else {
          updatedLoginInfo.username = value.trim();
        }
        storage.set("login-info", updatedLoginInfo);

        Toast.show({ icon: "success", content: "保存成功" });
        navigate(-1);
      } catch (e) {
        console.error("保存失败:", e);
        Toast.show({ icon: "fail", content: "保存失败，请重试" });
      } finally {
        setSaving(false);
      }
    } else {
      Toast.show({ icon: "fail", content: "用户信息获取失败" });
      setSaving(false);
    }
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
            disabled={!value.trim()}
            loading={saving}
            onClick={handleSave}
            style={{
              background: "transparent",
              border: "none",
              color: !value.trim() ? "#ccc" : "#1677ff",
              fontWeight: 600,
            }}
          >
            保存
          </Button>
        }
      >
        {getTitle()}
      </NavBar>
      <div style={{ padding: "32px 20px 0 20px" }}>
        <Input
          value={value}
          onChange={setValue}
          placeholder={getPlaceholder()}
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
          {getDescription()}
        </div>
      </div>
    </div>
  );
};

export default EditUsername;
