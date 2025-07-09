import React, { useState, useRef } from "react";
import {
  List,
  Button,
  Dialog,
  Toast,
  Input,
  DatePicker,
  Picker,
} from "antd-mobile";
import { history } from "umi";
import { setToken } from "@/utils/localToken";
import { storage } from "@/utils/storage";

const mockUser = {
  avatar: "",
  username: "测试用户",
  nickname: "小宝",
  gender: "男",
  birthday: "2020-01-01",
  phone: "",
  email: "",
};

const genderOptions = [
  { label: "男", value: "男" },
  { label: "女", value: "女" },
  { label: "保密", value: "保密" },
];

const Settings: React.FC = () => {
  const [user, setUser] = useState(mockUser);
  // 绑定弹窗
  const [bindType, setBindType] = useState<"phone" | "email" | null>(null);
  const [bindValue, setBindValue] = useState("");
  // 修改密码弹窗
  const [pwdVisible, setPwdVisible] = useState(false);
  const [pwdValue, setPwdValue] = useState("");
  // 性别选择弹窗
  const [genderVisible, setGenderVisible] = useState(false);
  // 生日选择弹窗
  const [birthdayVisible, setBirthdayVisible] = useState(false);

  // 头像 input ref
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // 头像上传
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUser((u) => ({ ...u, avatar: url }));
      Toast.show("头像已更换");
    }
    // 清空 input，便于重复选择同一图片
    if (avatarInputRef.current) avatarInputRef.current.value = "";
  };

  // 点击头像触发 input
  function handleAvatarClick() {
    avatarInputRef.current?.click();
  }

  // 资料变更
  const handleChange = (key: string, value: string) => {
    setUser((u) => ({ ...u, [key]: value }));
  };

  // 手机号/邮箱绑定弹窗
  const handleBind = (type: "phone" | "email") => {
    setBindType(type);
    setBindValue("");
  };
  const handleBindConfirm = () => {
    if (bindType && bindValue) {
      setUser((u) => ({ ...u, [bindType]: bindValue }));
      Toast.show(`${bindType === "phone" ? "手机号" : "邮箱"}已绑定`);
    }
    setBindType(null);
  };

  // 密码修改弹窗
  const handleChangePwd = () => {
    setPwdVisible(true);
    setPwdValue("");
  };
  const handlePwdConfirm = () => {
    setPwdVisible(false);
    if (pwdValue) {
      Toast.show("密码已修改");
      // 这里可以提交到后端
    }
  };

  // 保存资料
  const handleSave = () => {
    Toast.show({ icon: "success", content: "资料已保存" });
  };

  // 退出登录
  const handleLogout = () => {
    Dialog.confirm({
      content: "确定要退出登录吗？",
      onConfirm: () => {
        setToken(""); // 清除token
        storage.del("login-info"); // 清除用户信息
        storage.del("loginChecked"); // 清除记住密码
        localStorage.clear();
        sessionStorage.clear();
        Toast.show({ icon: "success", content: "已退出登录" });
        history.replace("/login");
      },
    });
  };

  return (
    <div>
      <List header="个人资料">
        {/* 头像 */}
        <List.Item
          onClick={handleAvatarClick}
          extra={
            <>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleAvatarUpload}
              />
              <img
                src={user.avatar || require("@/assets/avatar/avatar.png")}
                alt="头像"
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  cursor: "pointer",
                }}
              />
            </>
          }
        >
          头像
        </List.Item>
        {/* 用户名 */}
        <List.Item
          extra={
            <Input
              value={user.username}
              onChange={(val) => handleChange("username", val)}
              clearable
              style={{ minWidth: 100 }}
            />
          }
        >
          用户名
        </List.Item>
        {/* 昵称 */}
        <List.Item
          extra={
            <Input
              value={user.nickname}
              onChange={(val) => handleChange("nickname", val)}
              clearable
              style={{ minWidth: 100 }}
            />
          }
        >
          昵称
        </List.Item>
        {/* 性别 */}
        <List.Item extra={user.gender} onClick={() => setGenderVisible(true)}>
          性别
        </List.Item>
        <Picker
          columns={[genderOptions]}
          visible={genderVisible}
          value={[user.gender]}
          onClose={() => setGenderVisible(false)}
          onConfirm={(val) => {
            if (val && val[0]) {
              handleChange("gender", String(val[0]));
            }
            setGenderVisible(false);
          }}
        />
        {/* 生日 */}
        <List.Item
          extra={user.birthday}
          onClick={() => setBirthdayVisible(true)}
        >
          生日
        </List.Item>
        <DatePicker
          visible={birthdayVisible}
          value={new Date(user.birthday)}
          onClose={() => setBirthdayVisible(false)}
          onConfirm={(date) => {
            handleChange("birthday", date.toISOString().slice(0, 10));
            setBirthdayVisible(false);
          }}
        />
        {/* 手机号 */}
        <List.Item
          extra={user.phone ? <span>{user.phone}</span> : "未绑定"}
          onClick={() => handleBind("phone")}
        >
          手机号
        </List.Item>
        {/* 邮箱 */}
        <List.Item
          extra={user.email ? <span>{user.email}</span> : "未绑定"}
          onClick={() => handleBind("email")}
        >
          邮箱
        </List.Item>
        {/* 修改密码 */}
        <List.Item onClick={handleChangePwd}>修改密码</List.Item>
      </List>
      <div style={{ padding: 16 }}>
        <Button block color="primary" onClick={handleSave}>
          保存资料
        </Button>
        <Button
          block
          color="danger"
          style={{ marginTop: 12 }}
          onClick={handleLogout}
        >
          退出登录
        </Button>
      </div>
      {/* 绑定手机号/邮箱弹窗 */}
      <Dialog
        visible={!!bindType}
        content={
          <Input
            placeholder={`请输入${bindType === "phone" ? "手机号" : "邮箱"}`}
            value={bindValue}
            onChange={setBindValue}
            clearable
            style={{ width: "100%", padding: 8, fontSize: 16 }}
          />
        }
        onAction={(action) => {
          if (action.key === "confirm") handleBindConfirm();
          else setBindType(null);
        }}
        actions={[
          { key: "cancel", text: "取消" },
          { key: "confirm", text: "确定" },
        ]}
      />
      {/* 修改密码弹窗 */}
      <Dialog
        visible={pwdVisible}
        content={
          <Input
            type="password"
            placeholder="请输入新密码"
            value={pwdValue}
            onChange={setPwdValue}
            clearable
            style={{ width: "100%", padding: 8, fontSize: 16 }}
          />
        }
        onAction={(action) => {
          if (action.key === "confirm") handlePwdConfirm();
          else setPwdVisible(false);
        }}
        actions={[
          { key: "cancel", text: "取消" },
          { key: "confirm", text: "确定" },
        ]}
      />
    </div>
  );
};

export default Settings;
