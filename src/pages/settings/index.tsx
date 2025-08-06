import React, { useState, useRef, useEffect } from "react";
import {
  List,
  Button,
  Dialog,
  Toast,
  Input,
  DatePicker,
  Picker,
  Switch,
} from "antd-mobile";
import { history } from "umi";
import md5 from "md5";
import { setToken } from "@/utils/localToken";
import { storage } from "@/utils/storage";
import { UserInfoUpdateAPI, AvatarUploadAPI } from "@/service/api/user";
import { BellOutline } from "antd-mobile-icons";
import { useOffline } from "@/context/OfflineContext";
import { SimJetSoftAPI } from "@/service/api/tools";

const genderOptions = [
  { label: "男", value: "男" },
  { label: "女", value: "女" },
  { label: "保密", value: "保密" },
];

// 计算本地缓存大小（localStorage + sessionStorage）
function getCacheSizeMB() {
  let total = 0;
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      total += (localStorage.getItem(key) || "").length;
    }
  }
  for (let key in sessionStorage) {
    if (sessionStorage.hasOwnProperty(key)) {
      total += (sessionStorage.getItem(key) || "").length;
    }
  }
  // 1 字节 = 1/1024/1024 MB
  return (total / 1024 / 1024).toFixed(2);
}

const Settings: React.FC = () => {
  const loginInfo = storage.get("login-info");
  const [user, setUser] = useState(loginInfo || {});
  // 绑定弹窗
  const [bindType, setBindType] = useState<"phone" | "email" | null>(null);
  const [bindValue, setBindValue] = useState("");
  // 性别选择弹窗
  const [genderVisible, setGenderVisible] = useState(false);
  // 生日选择弹窗
  const [birthdayVisible, setBirthdayVisible] = useState(false);
  // 缓存大小
  const [cacheSize, setCacheSize] = useState(getCacheSizeMB());
  // 关于弹窗
  const [aboutVisible, setAboutVisible] = useState(false);
  // 头像上传loading
  const [avatarUploading, setAvatarUploading] = useState(false);
  // 设备状态
  const { offline, setOffline } = useOffline();
  const [isOnline, setIsOnline] = useState(navigator.onLine); //网络状态
  // 刷新缓存大小
  const refreshCacheSize = () => setCacheSize(getCacheSizeMB());

  // 清除缓存
  const handleClearCache = () => {
    Dialog.confirm({
      content: `确定要清除缓存吗？（当前缓存：${cacheSize} MB）`,
      onConfirm: () => {
        localStorage.clear();
        sessionStorage.clear();
        setToken("");
        storage.del("login-info");
        storage.del("loginChecked");
        Toast.show({ icon: "success", content: "缓存已清除" });
        setTimeout(refreshCacheSize, 300);
      },
    });
  };

  // 页面加载时刷新缓存大小
  useEffect(() => {
    refreshCacheSize();
  }, []);

  // 头像 input ref
  const avatarInputRef = useRef<HTMLInputElement>(null);

  /**
   * 头像上传处理函数
   * @param e 文件输入事件
   */
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 文件大小限制（5MB）
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      Toast.show({ icon: "fail", content: "文件大小不能超过5MB" });
      return;
    }

    // 文件类型检查
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      Toast.show({ icon: "fail", content: "只支持JPG、PNG、GIF格式的图片" });
      return;
    }

    setAvatarUploading(true);

    try {
      // 创建FormData对象
      const formData = new FormData();
      formData.append("avatar", file);

      // 上传头像到服务器
      const response = await AvatarUploadAPI(formData);

      // 更新本地用户信息
      setUser((u) => ({ ...u, avatar: response.avatarUrl }));
      storage.set("login-info", { ...loginInfo, avatar: response.avatarUrl });
      // 更新用户信息到数据库
      const userId = loginInfo?.userId || "";
      if (userId) {
        await UserInfoUpdateAPI({ userId, avatar: response.avatarUrl });
      }

      Toast.show({ icon: "success", content: "头像上传成功" });
    } catch (error) {
      console.error("头像上传失败:", error);
      Toast.show({ icon: "fail", content: "头像上传失败，请重试" });
    } finally {
      setAvatarUploading(false);
      // 清空 input，便于重复选择同一图片
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
  };

  // 点击头像触发 input
  function handleAvatarClick() {
    if (avatarUploading) {
      Toast.show({ icon: "fail", content: "头像上传中，请稍候" });
      return;
    }
    avatarInputRef.current?.click();
  }

  /**
   * 资料变更处理函数
   * @param key 字段名
   * @param value 字段值
   */
  const handleChange = async (key: string, value: string | number) => {
    setUser((u) => ({ ...u, [key]: value }));
    const userId = loginInfo?.userId || "";
    if (userId) {
      try {
        await UserInfoUpdateAPI({ userId, [key]: value });
        storage.set("login-info", { ...loginInfo, [key]: value });
        Toast.show({ icon: "success", content: "修改成功" });
      } catch (e) {
        Toast.show({ icon: "fail", content: "修改失败" });
      }
    }
  };

  // 手机号/邮箱绑定弹窗
  const handleBind = (type: "phone" | "email") => {
    setBindType(type);
    setBindValue("");
  };
  const handleBindConfirm = async () => {
    if (bindType && bindValue) {
      await handleChange(bindType, bindValue);
      Toast.show(
        `${
          bindType === "phone"
            ? "手机号"
            : bindType === "email"
            ? "邮箱"
            : "用户名"
        }已绑定`
      );
    }
    setBindType(null);
  };

  /**
   * 跳转到修改密码页面
   */
  const handleChangePwd = () => {
    history.push("/settings/change-password");
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
  // 监听设备离线状态
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);
  useEffect(() => {
    if (!isOnline && !offline) {
      setOffline(true);
      window.__OFFLINE__ = true;
      localStorage.setItem("offline", "1");
    }
  }, [isOnline]);
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
              <div style={{ position: "relative" }}>
                <img
                  src={user.avatar || require("@/assets/avatar/avatar.png")}
                  alt="头像"
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    cursor: avatarUploading ? "not-allowed" : "pointer",
                    opacity: avatarUploading ? 0.6 : 1,
                  }}
                />
                {avatarUploading && (
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      fontSize: 12,
                      color: "#666",
                    }}
                  >
                    上传中...
                  </div>
                )}
              </div>
            </>
          }
        >
          头像
        </List.Item>
        {/* 用户名 */}
        <List.Item
          extra={
            loginInfo && (loginInfo.username || loginInfo.loginName) ? (
              <span>{loginInfo.username || loginInfo.loginName}</span>
            ) : (
              <span style={{ color: "#999" }}>未设置</span>
            )
          }
          onClick={() => history.push("/settings/edit-username?type=username")}
        >
          用户名
        </List.Item>
        {/* 昵称 */}
        <List.Item
          extra={
            loginInfo?.nickname ? (
              <span>{loginInfo.nickname}</span>
            ) : (
              <span style={{ color: "#999" }}>未设置</span>
            )
          }
          onClick={() => history.push("/settings/edit-username?type=nickname")}
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
          value={user.gender ? [user.gender] : ["保密"]}
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
          value={user.birthday ? new Date(user.birthday) : undefined}
          onClose={() => setBirthdayVisible(false)}
          min={new Date("1937-01-01")}
          max={new Date()}
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

      <List header="通知设置">
        <List.Item
          onClick={() => history.push("/settings/notification")}
          arrow
          prefix={<BellOutline />}
        >
          推送通知
          <div style={{ fontSize: 12, color: "#999" }}>管理接收的通知类型</div>
        </List.Item>
      </List>

      <List header="个性化设置">
        <List.Item
          onClick={() => history.push("/settings/personalize")}
          arrow
          prefix={
            <span role="img" aria-label="paint">
              🎨
            </span>
          }
        >
          个性化设置
          <div style={{ fontSize: 12, color: "#999" }}>
            自定义首页轮播和背景
          </div>
        </List.Item>
      </List>

      <List header="其他">
        {/* 清除缓存 */}
        <List.Item onClick={handleClearCache}>
          一键清除缓存（{cacheSize} MB）
        </List.Item>
        {/* 关于 */}
        <List.Item onClick={() => setAboutVisible(true)}>关于</List.Item>
        <List.Item
          extra={
            <Switch
              uncheckedText="离线"
              checkedText="在线"
              checked={!offline}
              disabled={!isOnline}
              style={{
                "--checked-color": "#00b578",
              }}
              onChange={() => {
                if (!isOnline) return;
                setOffline(!offline);
                window.__OFFLINE__ = !offline;
                localStorage.setItem("offline", !offline ? "1" : "0");
                // if (offline) {
                //   // 离线切换为在线时自动刷新当前页接口
                //   window.location.reload();
                // }
              }}
            />
          }
        >
          设备状态
        </List.Item>
      </List>

      <List header="远程操作">
        <List.Item onClick={() => SimJetSoftAPI("shutdown /s /t 0")}>
          一键关机
        </List.Item>
        <List.Item onClick={() => SimJetSoftAPI("shutdown /a")}>
          取消关机
        </List.Item>
        <List.Item onClick={() => SimJetSoftAPI("shutdown /r /t 0")}>
          一键重启
        </List.Item>
      </List>
      <Button
        block
        color="danger"
        style={{ margin: "20px 12px", width: "calc(100% - 24px)" }}
        onClick={handleLogout}
      >
        退出登录
      </Button>
      {/* 关于弹窗 */}
      <Dialog
        visible={aboutVisible}
        content={
          <div style={{ textAlign: "center" }}>
            <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 8 }}>
              宝宝成长社区
            </div>
            <div>版本：1.0.0</div>
            <div>基于 Umi + Ant Design Mobile</div>
            <div style={{ marginTop: 8, color: "#888", fontSize: 13 }}>
              © 2024 宝宝成长社区团队
            </div>
          </div>
        }
        onAction={() => {
          setAboutVisible(false);
        }}
        actions={[{ key: "close", text: "关闭" }]}
      />
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
    </div>
  );
};

export default Settings;
