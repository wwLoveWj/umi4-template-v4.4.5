/**
 * 测试WebSocket连接和认证
 */

const WebSocket = require("ws");

function testWebSocketConnection() {
  console.log("🧪 测试WebSocket连接...\n");

  const ws = new WebSocket("ws://localhost:3007");

  ws.on("open", () => {
    console.log("✅ WebSocket连接已建立");

    // 发送认证消息
    const authMessage = {
      type: "authenticate",
      data: { userId: "test_user_123" },
    };

    console.log("📤 发送认证消息:", authMessage);
    ws.send(JSON.stringify(authMessage));
  });

  ws.on("message", (data) => {
    try {
      const message = JSON.parse(data);
      console.log("📥 收到消息:", message);

      if (message.type === "authenticated") {
        console.log("✅ 认证成功！");

        // 测试发送聊天消息
        const chatMessage = {
          type: "chat_message",
          data: {
            toUserId: "target_user_456",
            content: "这是一条测试消息",
            messageType: "text",
          },
        };

        console.log("📤 发送聊天消息:", chatMessage);
        ws.send(JSON.stringify(chatMessage));
      }

      if (message.type === "message_sent") {
        console.log("✅ 消息发送成功！");
        ws.close();
      }
    } catch (error) {
      console.error("❌ 解析消息失败:", error);
    }
  });

  ws.on("error", (error) => {
    console.error("❌ WebSocket错误:", error);
  });

  ws.on("close", () => {
    console.log("🔌 WebSocket连接已关闭");
  });

  // 5秒后自动关闭
  setTimeout(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.close();
    }
  }, 5000);
}

// 运行测试
testWebSocketConnection();
