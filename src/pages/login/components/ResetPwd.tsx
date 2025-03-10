import React, { useState } from "react";
import { Form, Input, Button, NavBar } from "antd-mobile";
import { EyeInvisibleOutline, EyeOutline } from "antd-mobile-icons";
import styles from "../style.less";

export default function () {
  const [visible, setVisible] = useState(false);
  const back = () => history.back();
  return (
    <div className={styles.loginInfoPage}>
      <NavBar
        style={{
          "--height": "36px",
          fontSize: "24px",
        }}
        onBack={back}
      >
        标题
      </NavBar>
      <Form
        layout="horizontal"
        mode="card"
        footer={
          <Button block type="submit" color="primary" size="large">
            重置密码
          </Button>
        }
      >
        <Form.Item label="姓名">
          <Input placeholder="请输入" />
        </Form.Item>
        <Form.Item label="邮箱地址">
          <Input placeholder="请输入" />
        </Form.Item>
        <Form.Item label="邮箱地址">
          <div className={styles.resetPassword}>
            <Input
              className={styles.input}
              placeholder="请输入密码"
              type={visible ? "text" : "password"}
            />
            <div className={styles.eye}>
              {!visible ? (
                <EyeInvisibleOutline onClick={() => setVisible(true)} />
              ) : (
                <EyeOutline onClick={() => setVisible(false)} />
              )}
            </div>
          </div>
        </Form.Item>
        <Form.Item label="验证码" extra={<a>发送验证码</a>}>
          <Input placeholder="请输入" />
        </Form.Item>
      </Form>
    </div>
  );
}
