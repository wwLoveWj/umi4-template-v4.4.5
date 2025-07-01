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
import { validateEmail, validatePhone, validatePassword } from "@/utils/check";
import SliderVerify from "@/components/SliderVerify";
// import VerifyLogin from "@/components/VerifyLogin";

/**
 * 预加载背景图
 */
const preloadBackgroundImage = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("背景图加载失败"));
    img.src = require("@/assets/lake.jpg");
  });
};

// 登录页面
const Login = () => {
  const pwdRef = useRef(null);
  // const { pathname } = useLocation();
  const [form] = Form.useForm();
  const [checked, setChecked] = useState(false); //记住密码
  const [isClickPass, setIsClickPass] = useState(false); //记录是否点击过通过按钮
  const [isPassing, setIsPassing] = useState(false); //是否通过了校验
  const [visible, setVisible] = useState(false);
  const [loginName, setLoginName] = useState(""); // 用户名/邮箱/手机号
  const [password, setPassword] = useState(""); // 密码
  const [loginNameError, setLoginNameError] = useState(""); // 用户名错误信息
  const [passwordError, setPasswordError] = useState(""); // 密码错误信息
  const [bgLoaded, setBgLoaded] = useState(false); // 背景图加载状态

  // 控制是否通过校验
  const chgValue = (isPassingvalue: boolean) => {
    setIsPassing(isPassingvalue);
  };

  useEffect(() => {
    // 预加载背景图
    const loadBackgroundImage = async () => {
      try {
        await preloadBackgroundImage();
        setBgLoaded(true);
        // 添加CSS类名以触发背景图显示动画
        document.body.classList.add("bgLoaded");
      } catch (error) {
        console.warn("背景图加载失败，使用fallback背景:", error);
        setBgLoaded(true); // 即使失败也设置为已加载，使用fallback
      }
    };

    loadBackgroundImage();
  }, []);

  useEffect(() => {
    // 仅在组件挂载时运行
    const initializeForm = async () => {
      if (process.env.NODE_ENV === "development") {
        const loginChecked = getPrivateKey(storage.get("loginChecked") || "");
        if (loginChecked) {
          try {
            const {
              checked: checkedCache,
              password: savedPassword,
              loginName: savedLoginName,
            } = JSON.parse(loginChecked);
            setChecked(checkedCache);
            setLoginName(savedLoginName || "");
            setPassword(savedPassword || "");
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

  /**
   * 验证用户名/邮箱/手机号
   */
  const validateLoginName = (value: string): boolean => {
    if (!value.trim()) {
      Toast.show({ content: "请输入用户名/邮箱/手机号", icon: "fail" });
      return false;
    }

    const trimmedValue = value.trim();
    if (validateEmail(trimmedValue) || validatePhone(trimmedValue)) {
      return true;
    } else {
      Toast.show({ content: "请输入有效的邮箱或手机号", icon: "fail" });
      return false;
    }
  };

  /**
   * 验证密码
   */
  const validatePasswordInput = (value: string): boolean => {
    if (!value) {
      Toast.show({ content: "请输入密码", icon: "fail" });
      return false;
    }

    const result = validatePassword(value);
    if (!result.isValid) {
      Toast.show({ content: result.message, icon: "fail" });
      return false;
    }

    return true;
  };

  /**
   * 记住密码处理
   */
  const onChangePwd = async (newChecked: boolean) => {
    setChecked(newChecked);
    if (newChecked) {
      // 保存密码
      if (loginName && password) {
        const values = {
          checked: newChecked,
          password,
          loginName,
        };
        const rsaPassWord = setPrivateKey(JSON.stringify(values)) || "";
        storage.set("loginChecked", rsaPassWord, { expire: [7, "day"] }); //7天有效期
      }
    } else {
      // 清除保存的密码
      storage.del("loginChecked");
    }
  };

  /**
   * 处理登录接口
   */
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

        // 如果勾选了记住密码，保存登录信息
        if (checked && loginName && password) {
          const values = {
            checked: true,
            password,
            loginName,
          };
          const rsaPassWord = setPrivateKey(JSON.stringify(values)) || "";
          storage.set("loginChecked", rsaPassWord, { expire: [7, "day"] });
        }
        // 语音提示用户登录成功
        // const utterThis = new window.SpeechSynthesisUtterance(
        //   "恭喜你登录成功" + res?.username + "欢迎回来！"
        // );
        // window.speechSynthesis.speak(utterThis);

        Toast.show({
          icon: "success",
          content: `登录成功！欢迎回来，${res?.username || res?.loginName}`,
        });

        history.push("/");
      },
      onError: (error) => {
        Toast.show({
          icon: "fail",
          content: error?.message || "登录失败，请检查用户名和密码",
        });
      },
    }
  );

  /**
   * 登录提交按钮
   */
  const handleSubmit = async () => {
    // 清除之前的错误信息
    setLoginNameError("");
    setPasswordError("");
    // 验证用户名/邮箱/手机号
    if (!validateLoginName(loginName)) {
      return;
    }

    // 验证密码
    if (!validatePasswordInput(password)) {
      return;
    }

    // 判断是否通过滑块校验
    if (!isPassing) {
      setIsClickPass(true);
      Toast.show({ content: "请先完成滑块验证", icon: "fail" });
      return;
    }

    // 提交登录
    const params = {
      loginName: loginName.trim(),
      password: md5(password), // 使用MD5加密密码
    };

    handleLoginInfoMsg.run(params);
  };

  /**
   * 处理用户名输入
   */
  const handleLoginNameChange = (value: string) => {
    setLoginName(value);
  };

  /**
   * 处理密码输入
   */
  const handlePasswordChange = (value: string) => {
    setPassword(value);
  };

  return (
    <div className={`${styles.loginPage} ${bgLoaded ? styles.bgLoaded : ""}`}>
      {/* {process.env.NODE_ENV === "development" && (
          <div className={styles.ribbon}>本地开发环境</div>
        )} */}
      <div className={styles?.container}>
        <h1>登录</h1>
        <div className={styles.formCard}>
          <div className={styles.inputWrapper}>
            <Input
              className={styles?.loginInput}
              placeholder="请输入邮箱或手机号"
              value={loginName}
              onChange={handleLoginNameChange}
              onBlur={() => validateLoginName(loginName)}
            />
          </div>

          <div className={styles.inputWrapper}>
            <div className={styles.resetPassword}>
              <Input
                className={styles?.loginInput}
                ref={pwdRef}
                placeholder="请输入密码"
                type={visible ? "text" : "password"}
                maxLength={32}
                value={password}
                onChange={handlePasswordChange}
                onBlur={() => validatePasswordInput(password)}
              />
              <div className={styles.eye}>
                {!visible ? (
                  <EyeInvisibleOutline onClick={() => setVisible(true)} />
                ) : (
                  <EyeOutline onClick={() => setVisible(false)} />
                )}
              </div>
            </div>
          </div>

          {process.env.NODE_ENV === "development" && (
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

          {/* 滑块验证 */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: "100%",
            }}
          >
            <SliderVerify onPass={() => setIsPassing(true)} />
          </div>

          <Button
            className={styles.submitItem}
            loading={handleLoginInfoMsg?.loading}
            onClick={handleSubmit}
            disabled={!loginName || !password}
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
