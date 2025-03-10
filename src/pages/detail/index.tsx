import { NavBar, Space, Toast } from "antd-mobile";
import React from "react";
import styles from "./style.less";

export default () => {
  const back = () => {
    Toast.show({
      content: "点击了返回区域",
      duration: 1000,
    });
    history.back();
  };

  return (
    <>
      <NavBar
        style={{
          "--height": "36px",
          "--border-bottom": "1px #eee solid",
        }}
        className={styles?.detailBar}
        onBack={back}
      >
        标题
      </NavBar>
      <h1>详情</h1>
      详情详情详情详情详情详情
    </>
  );
};
