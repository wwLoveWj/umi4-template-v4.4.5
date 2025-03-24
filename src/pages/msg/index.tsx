import React, { useState } from "react";
import AddFloatingBubble from "@/components/floatingBubble";
import { MailOutline } from "antd-mobile-icons";
import WjPopup from "@/components/WjPopup";
import SendMailForm from "./components/SendMail";

export default function Index() {
  const [visible, setVisible] = useState(false);
  return (
    <div>
      <h2>发送邮件</h2>
      <AddFloatingBubble
        pathname="/msg/sendMail"
        iconRender={
          <MailOutline fontSize={26} onClick={() => setVisible(true)} />
        }
        isShowIcon={false}
      />
      <WjPopup
        value={visible}
        onChange={setVisible}
        isShowSubmit={false}
        title={"发送邮件"}
        popupHeight={"65vh"}
      >
        <SendMailForm
          onClose={() => {
            setVisible(false);
          }}
        />
      </WjPopup>
    </div>
  );
}
