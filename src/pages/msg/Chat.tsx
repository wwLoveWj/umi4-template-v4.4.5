import React from "react";
import { NavBar, Input } from "antd-mobile";
import { history, useParams } from "umi";

// 假数据
const chatData = [
  {
    id: 1,
    from: "掘金酱",
    avatar:
      "https://img1.baidu.com/it/u=2302465390,3219849774&fm=253&app=138&size=w931&n=0&f=JPEG&fmt=auto",
    content:
      "【🔥金石计划冲刺倒计时5天🔥】伟大的稀土掘友们，5月11日奖池即将关闭！...",
    time: "20:35",
    self: false,
  },
  {
    id: 2,
    from: "我",
    avatar:
      "https://img1.baidu.com/it/u=2302465390,3219849774&fm=253&app=138&size=w931&n=0&f=JPEG&fmt=auto",
    content: "你撤回了一条消息",
    time: "20:36",
    self: true,
  },
];

const emojiList = [
  "😀",
  "😁",
  "😍",
  "😘",
  "😳",
  "😭",
  "😴",
  "😡",
  "😏",
  "😜",
  "😅",
  "😆",
  "😓",
  "😢",
  "😱",
  "😲",
  "😤",
  "😋",
  "😎",
  "😐",
  "😕",
  "😇",
  "😈",
  "😬",
  "😌",
  "😔",
  "😖",
  "😷",
  "😵",
  "😲",
  "😳",
  "😡",
  "😠",
  "😇",
  "😈",
  "😬",
  "😌",
  "😔",
  "😖",
  "😷",
  "😵",
];

export default function ChatPage() {
  const params = useParams();
  // 这里可根据params.id拉取对话消息
  const target = chatData.find((msg) => !msg.self);

  return (
    <div style={{ background: "#f7f8fa", minHeight: "100vh" }}>
      <NavBar back="返回" onBack={() => history.back()}>
        {target?.from || "对话"}
      </NavBar>
      <div style={{ padding: 16, paddingBottom: 80 }}>
        {chatData.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: "flex",
              alignItems: "flex-end",
              marginBottom: 12,
              flexDirection: msg.self ? "row-reverse" : "row",
            }}
          >
            <img
              src={msg.avatar}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                margin: msg.self ? "0 0 0 8px" : "0 8px 0 0",
              }}
            />
            <div style={{ maxWidth: "70%" }}>
              <div
                style={{
                  fontSize: 13,
                  color: msg.self ? "#888" : "#333",
                  marginBottom: 2,
                }}
              >
                {msg.from}
              </div>
              <div
                style={{
                  background: msg.self ? "#e6f7ff" : "#fff",
                  borderRadius: 8,
                  padding: "8px 12px",
                  fontSize: 15,
                  color: "#222",
                  boxShadow: "0 1px 2px #eee",
                }}
              >
                {msg.content}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "#bbb",
                  marginTop: 2,
                  textAlign: msg.self ? "right" : "left",
                }}
              >
                {msg.time}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          background: "#fff",
          borderTop: "1px solid #eee",
          padding: 8,
          zIndex: 10,
        }}
      >
        <Input
          placeholder="请输入内容"
          clearable
          style={{ borderRadius: 20, background: "#f5f5f5" }}
        />
        <div
          style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 8 }}
        >
          {emojiList.slice(0, 20).map((e, i) => (
            <span key={i} style={{ fontSize: 24, cursor: "pointer" }}>
              {e}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
