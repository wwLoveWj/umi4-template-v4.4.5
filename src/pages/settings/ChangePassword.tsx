import React, { useState } from "react";
import { NavBar, Input, Button, Toast } from "antd-mobile";
import { useNavigate } from "umi";
import md5 from "md5";
import { storage } from "@/utils/storage";
import { checkPassword } from "@/service/api/user";

/**
 * 修改密码页面
 * @returns {JSX.Element}
 */
const ChangePassword: React.FC = () => {
  const navigate = useNavigate();
  const loginInfo = storage.get("login-info");
  const [oldPwd, setOldPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [loading, setLoading] = useState(false);

  /**
   * 提交修改密码
   */
  const handleSubmit = async () => {
    if (!oldPwd || !newPwd || !confirmPwd) {
      Toast.show({ icon: "fail", content: "请填写完整信息" });
      return;
    }
    if (newPwd !== confirmPwd) {
      Toast.show({ icon: "fail", content: "两次新密码不一致" });
      return;
    }
    if (newPwd.length < 6) {
      Toast.show({ icon: "fail", content: "新密码至少6位" });
      return;
    }
    setLoading(true);
    try {
      // 这里假设后端需要原密码校验
      const userId = loginInfo?.userId || loginInfo?.id || "";
      await checkPassword({
        userId,
        oldPassword: md5(oldPwd),
        newPassword: md5(newPwd),
      });
      Toast.show({ icon: "success", content: "密码修改成功，请重新登录" });
      setTimeout(() => {
        storage.del("login-info");
        navigate("/login", { replace: true });
      }, 1500);
    } catch (e) {
      Toast.show({ icon: "fail", content: "密码修改失败，请检查原密码" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <NavBar onBack={() => navigate(-1)}>修改密码</NavBar>
      <div style={{ marginTop: 32 }}>
        <Input
          clearable
          value={oldPwd}
          onChange={setOldPwd}
          placeholder="请输入原密码"
          type="text"
        />
        <div style={{ height: 16 }} />
        <Input
          clearable
          value={newPwd}
          onChange={setNewPwd}
          placeholder="请输入新密码"
          type="text"
        />
        <div style={{ height: 16 }} />
        <Input
          clearable
          value={confirmPwd}
          onChange={setConfirmPwd}
          placeholder="请再次输入新密码"
          type="text"
        />
        <div style={{ height: 32 }} />
        <Button block color="primary" loading={loading} onClick={handleSubmit}>
          确认修改
        </Button>
      </div>
    </div>
  );
};

export default ChangePassword;
