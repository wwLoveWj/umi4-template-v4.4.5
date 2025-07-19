/**
 * 聊天功能测试脚本
 */

const ChatService = require("./services/chatService");

async function testChatService() {
  console.log("🧪 开始测试聊天服务...\n");

  const chatService = new ChatService();

  try {
    // 等待数据库初始化
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 测试保存消息
    console.log("1. 测试保存消息...");
    const message1 = await chatService.saveMessage({
      fromUserId: "user1",
      toUserId: "user2",
      content: "你好！这是一条测试消息",
      messageType: "text",
    });
    console.log("✅ 消息保存成功:", message1);

    const message2 = await chatService.saveMessage({
      fromUserId: "user2",
      toUserId: "user1",
      content: "收到！回复测试消息",
      messageType: "text",
    });
    console.log("✅ 消息保存成功:", message2);

    // 测试获取聊天历史
    console.log("\n2. 测试获取聊天历史...");
    const history = await chatService.getChatHistory("user1", "user2", 10, 0);
    console.log("✅ 聊天历史获取成功:", history);

    // 测试获取聊天会话
    console.log("\n3. 测试获取聊天会话...");
    const sessions = await chatService.getChatSessions("user1");
    console.log("✅ 聊天会话获取成功:", sessions);

    // 测试获取未读数量
    console.log("\n4. 测试获取未读数量...");
    const unreadCount = await chatService.getUnreadCount("user1");
    console.log("✅ 未读数量获取成功:", unreadCount);

    // 测试标记已读
    console.log("\n5. 测试标记已读...");
    await chatService.markMessagesAsRead("user1", "user2");
    console.log("✅ 标记已读成功");

    // 测试撤回消息
    console.log("\n6. 测试撤回消息...");
    const recallResult = await chatService.recallMessage(message1.id, "user1");
    console.log("✅ 撤回消息成功:", recallResult);

    console.log("\n🎉 所有测试通过！聊天服务运行正常。");
  } catch (error) {
    console.error("❌ 测试失败:", error);
  }
}

// 运行测试
testChatService();
