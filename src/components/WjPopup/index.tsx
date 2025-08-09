import React from "react";
import { NavBar, Popup } from "antd-mobile";
import { useControllableValue } from "ahooks";
export default function Index(props: any) {
  const { title = "标题", popupHeight = "100vh", onClose } = props;
  const [visible, setVisible] = useControllableValue<boolean>(props);
  return (
    <Popup
      visible={visible}
      onMaskClick={() => {
        setVisible(false);
      }}
      onClose={() => {
        if (onClose) {
          onClose();
        } else {
          setVisible(false);
        }
      }}
      showCloseButton={!!onClose}
      destroyOnClose
      closeIcon={onClose ? <span>提交</span> : null}
      bodyStyle={{ height: popupHeight }}
      closeOnSwipe={true}
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
