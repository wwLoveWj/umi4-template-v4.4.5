import React from "react";
import AddFloatingBubble from "@/components/floatingBubble";
import { MailOutline } from "antd-mobile-icons";
import { history } from "umi";
export default function Index() {
  return (
    <div>
      <h2>发送邮件</h2>
      <AddFloatingBubble
        pathname="/msg/sendMail"
        iconRender={
          <MailOutline
            fontSize={26}
            onClick={() => history.push("/msg/sendMail")}
          />
        }
        isShowIcon={false}
      />
    </div>
  );
}
