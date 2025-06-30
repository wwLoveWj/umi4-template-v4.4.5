import React, { useEffect, useState, useRef } from "react";
import { useLocation, history } from "umi";
// import { useToggle } from "react-use";
import { Form, Input, Button, Checkbox, Toast } from "antd-mobile";
import styles from "./style.less";
import { loginUserAPI } from "@/service/api/login";
import { useRequest } from "ahooks";
import { setToken } from "@/utils/localToken";
import JSEncrypt from "jsencrypt";
import md5 from "md5";
import { setPrivateKey, getPrivateKey } from "@/utils";
import { storage } from "@/utils/storage";
import { EyeInvisibleOutline, EyeOutline } from "antd-mobile-icons";
// import VerifyLogin from "@/components/VerifyLogin";
// 登录页面
const Login = () => {
  const pwdRef = useRef(null);
  // const { pathname } = useLocation();
  const [form] = Form.useForm();
  const [checked, setChecked] = useState(false); //记住密码
  const [isClickPass, setIsClickPass] = useState(false); //记录是否点击过通过按钮
  const [isPassing, setIsPassing] = useState(false); //是否通过了校验
  const [visible, setVisible] = useState(false);
  // 控制是否通过校验
  const chgValue = (isPassingvalue: boolean) => {
    setIsPassing(isPassingvalue);
  };
  useEffect(() => {
    // 仅在组件挂载时运行
    const initializeForm = async () => {
      if (process.env.NODE_ENV === "development") {
        const loginChecked = getPrivateKey(storage.get("loginChecked") || "");
        if (loginChecked) {
          try {
            const {
              checked: checkedCache,
              password,
              loginName,
            } = JSON.parse(loginChecked);
            setChecked(checkedCache);
            // 自动填充表单
            await form.setFieldsValue({
              loginName,
              password,
              checked: checkedCache,
            });
            // 如果记住登录状态被勾选，则自动聚焦到登录按钮
          } catch (error) {
            console.error("Error initializing form fields:", error);
            // 处理解密或解析错误
            storage.del("loginChecked"); // 出错时清理无效的cookie
          }
        }
      }
    };

    initializeForm();
  }, []);
  // 记住密码;
  const onChangePwd = async (e: any) => {
    const loginChecked = getPrivateKey(storage.get("loginChecked") || "");
    if (loginChecked) {
      setChecked(false);
      storage.del("loginChecked");
    } else {
      const values = await form.validateFields();
      values.checked = e.target.checked;
      setChecked(e.target.checked);
      const rsaPassWord = setPrivateKey(JSON.stringify(values)) || "";
      storage.set("loginChecked", rsaPassWord, { expire: [7, "day"] }); //7天有效期
    }
  };

  // 处理登录接口
  const handleLoginInfoMsg = useRequest(
    (fieldValues) => {
      return loginUserAPI(fieldValues);
    },
    {
      debounceWait: 100,
      manual: true,
      onSuccess: async (res) => {
        // 存储token以及login信息
        await setToken(res?.token);
        storage.set("login-info", res);
        // 语音提示用户登录成功
        // const utterThis = new window.SpeechSynthesisUtterance(
        //   "恭喜你登录成功" + res?.username + "欢迎回来！"
        // );
        // window.speechSynthesis.speak(utterThis);
        // notification.success({
        //   message: '登录成功',
        //   description: `${res?.data?.loginName}，欢迎回来`,
        //   duration: 5,
        // });
        history.push("/");
      },
    }
  );
  // 登录提交按钮
  const handleSubmit = () => {
    Toast.show({
      icon: "fail",
      content: "请输入用户邮箱",
    });
    // const encryptor = new JSEncrypt(); // 创建加密对象实例
    // //之前生成的公钥，复制的时候要小心不要有空格(此处把密钥省略了，自己写的时候可把自己生成的公钥粘到对应位置)
    // const pubKey =
    //   "MIIBCgKCAQEAzXfoDXWCayxsg9nUn6AYTXWF0x61YwpQXY4QubpYXnNU5wyHOjKPh/xtXA8lJzz4PnVbrvBy9YQerUc5rnXFuS8VOfYU0pjRbbd93E3MXngV3AbkNrkvrNaCt5raJQBVF4+Jo/OxuhSB4cGDDNUSa7fqE5balplMnI8OslKjtpwszI8gC6X7eDnBEoX7k+hUUMQHPB5HlvilT2Tvs9JcMqemqK1/cCgFijXB7rAFZeRXs0+yAIKHhX+GcPqlKA9b0y/QamwisA8xtg1qZwUxYyat0feTVH8PYAyHNd7c8/A/+HNXoM6psjSnGbBht4oh/gj0B9yXiuqKPNBHG5/IrwIDAQAB";
    // encryptor.setPublicKey(pubKey); //设置公钥
    // const rsaPassWord = encryptor.encrypt(values?.password); // 对内容进行加密
    // const params = { ...values, password: md5(values?.password) };
    // // 判断是否通过滑块校验
    // if (!isPassing) {
    //   setIsClickPass(true);
    //   return;
    // }
    // handleLoginInfoMsg.run(params);
  };

  return (
    <div className={styles.loginPage}>
      {/* {process.env.NODE_ENV === "development" && (
          <div className={styles.ribbon}>本地开发环境</div>
        )} */}
      <div className={styles?.container}>
        <h1>登录</h1>
        <div className={styles.formCard}>
          {/* <Form.Item
              name="loginName"
              rules={[
                {
                  required: true,
                  message: "请输入用户名（带邮箱后缀）",
                },
                {
                  validator(_, value) {
                    const trimValue = value && value.trim();
                    if (
                      !trimValue ||
                      trimValue.endsWith("@163.com") ||
                      trimValue.endsWith("@qq.com")
                    ) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("用户名需带邮箱后缀"));
                  },
                },
              ]}
            > */}
          <Input
            className={styles?.loginInput}
            placeholder="请输入用户名（带邮箱后缀）"
            //   prefix={
            //     <img
            //       src={require("../../../assets/iconsvg/login_userName.svg")}
            //     />
            //   }
          />
          <div className={styles.resetPassword}>
            <Input
              className={styles?.loginInput}
              ref={pwdRef}
              placeholder="请输入密码"
              type={visible ? "text" : "password"}
              maxLength={20}
            />
            <div className={styles.eye}>
              {!visible ? (
                <EyeInvisibleOutline onClick={() => setVisible(true)} />
              ) : (
                <EyeOutline onClick={() => setVisible(false)} />
              )}
            </div>
          </div>
          {/* <Input
            className={styles?.loginInput}
            ref={pwdRef}
            placeholder="请输入密码" 
            // visibilityToggle={false}
            //   iconRender={(visiblePwd) =>
            //     visiblePwd ? (
            //       <img
            //         src={require("../../../assets/iconsvg/login_showPwd.svg")}
            //       />
            //     ) : (
            //       <img
            //         src={require("../../../assets/iconsvg/login_hidePwd.svg")}
            //       />
            //     )
            //   }
            //   prefix={
            //     <img
            //       src={require("../../../assets/iconsvg/login_pwd.svg")}
            //     />
            //   
        //   />*/}
          {/* <VerifyLogin
                  isClickPass={isClickPass}
                  isPassing={isPassing}
                  chgValue={chgValue}
                /> */}
          {process.env.NODE_ENV === "development" && (
            //   <Form.Item
            //     name="checked"
            //     valuePropName="checked"
            //     extra={
            //       <a
            //         href={window.location.origin + "/login"}
            //         style={{ minHeight: "32px" }}
            //         className={styles?.forgetPwd}
            //       >
            //         忘记密码
            //       </a>
            //     }
            //   >
            <div className={styles?.loginInfoCheck}>
              <Checkbox
                onChange={onChangePwd}
                checked={checked}
                className={styles?.checkPwd}
              >
                记住密码
              </Checkbox>
              <a
                onClick={() => {
                  history.push("/forgetPwd");
                }}
                className={styles?.forgetPwd}
              >
                忘记密码
              </a>
            </div>
          )}
          <Button
            className={styles.submitItem}
            loading={handleLoginInfoMsg?.loading}
            onClick={() => {
              handleSubmit();
            }}
          >
            登录
          </Button>

          {/* 扫码登录按钮 */}
          <Button
            className={styles.qrLoginButton}
            fill="outline"
            onClick={() => {
              history.push("/qrLogin");
            }}
          >
            📱 扫码登录
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Login;
