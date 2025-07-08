import React, { useEffect, useState } from "react";
import { List, Badge, NavBar, Button, Empty } from "antd-mobile";
import {
  LikeOutline,
  StarOutline,
  ClockCircleOutline,
} from "antd-mobile-icons";
import {
  getMessages,
  markAllRead,
  markMessageRead,
  MessageItem,
} from "@/utils/messageCenter";
import AddFloatingBubble from "@/components/floatingBubble";
import { MailOutline } from "antd-mobile-icons";
import WjPopup from "@/components/WjPopup";
import SendMailForm from "./components/SendMail";

const MsgPage: React.FC = () => {
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setMessages(getMessages());
  }, []);

  const handleMarkAllRead = () => {
    markAllRead();
    setMessages(getMessages());
  };

  const handleMarkRead = (id: string) => {
    markMessageRead(id);
    setMessages(getMessages());
  };

  return (
    <div>
      <NavBar
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "#002FA7",
          color: "#fff",
        }}
        right={
          <Button size="mini" onClick={handleMarkAllRead}>
            全部已读
          </Button>
        }
      >
        消息中心
      </NavBar>
      <div style={{ padding: 12 }}>
        {messages.length === 0 ? (
          <Empty description="暂无消息" />
        ) : (
          <List>
            {messages.map((msg) => (
              <List.Item
                key={msg.id}
                prefix={
                  msg.type === "like" ? (
                    <LikeOutline style={{ color: "#ff4757" }} />
                  ) : (
                    <StarOutline style={{ color: "#ffa502" }} />
                  )
                }
                description={
                  <span style={{ color: "#999", fontSize: 12 }}>
                    <ClockCircleOutline style={{ marginRight: 4 }} />
                    {new Date(msg.time).toLocaleString()}
                  </span>
                }
                extra={!msg.read && <Badge color="primary" content="未读" />}
                onClick={() => handleMarkRead(msg.id)}
              >
                <div style={{ fontWeight: msg.read ? 400 : 600 }}>
                  {msg.content}
                </div>
                <div style={{ fontSize: 13, color: "#666", marginTop: 2 }}>
                  文章：《{msg.articleTitle}》
                </div>
              </List.Item>
            ))}
          </List>
        )}
      </div>
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
};

export default MsgPage;
