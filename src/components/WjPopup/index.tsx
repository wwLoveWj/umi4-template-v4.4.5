import React from "react";
import { NavBar, Popup, Button } from "antd-mobile";
import { useControllableValue } from "ahooks";
export default function Index(props: any) {
  const { title = "标题", popupHeight = "100vh" } = props;
  const [visible, setVisible] = useControllableValue<boolean>(props);
  return (
    <Popup
      visible={visible}
      onMaskClick={() => {
        setVisible(false);
      }}
      onClose={() => {
        setVisible(false);
      }}
      bodyStyle={{ height: popupHeight }}
    >
      <NavBar
        back="取消"
        onBack={() => {
          setVisible(false);
        }}
        backIcon={false}
        right={
          props?.isShowSubmit && (
            <a
              onClick={() => {
                setVisible(false);
              }}
            >
              提交
            </a>
          )
        }
      >
        {title}
      </NavBar>
      {props?.children}
    </Popup>
  );
}
