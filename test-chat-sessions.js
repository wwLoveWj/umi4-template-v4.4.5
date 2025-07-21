/**
 * 测试聊天会话功能
 */

const axios = require("axios");

const BASE_URL = "http://localhost:3007";

async function testChatSessions() {
  console.log("🧪 测试聊天会话功能...\n");

  try {
    // 1. 测试获取聊天会话列表
    console.log("📋 测试获取聊天会话列表...");
    const sessionsResponse = await axios.get(`${BASE_URL}/api/chat/sessions`, {
      params: { userId: "test_user_123" },
    });
    console.log("✅ 聊天会话列表:", sessionsResponse.data);

    // 2. 测试获取未读消息数量
    console.log("\n📊 测试获取未读消息数量...");
    const unreadResponse = await axios.get(
      `${BASE_URL}/api/chat/unread-count`,
      {
        params: { userId: "test_user_123" },
      }
    );
    console.log("✅ 未读消息数量:", unreadResponse.data);

    // 3. 测试获取聊天历史
    console.log("\n💬 测试获取聊天历史...");
    const historyResponse = await axios.get(
      `${BASE_URL}/api/chat/history/target_user_456`,
      {
        params: {
          userId: "test_user_123",
          limit: 10,
          offset: 0,
        },
      }
    );
    console.log("✅ 聊天历史:", historyResponse.data);

    // 4. 测试标记已读
    console.log("\n✅ 测试标记已读...");
    const markReadResponse = await axios.post(
      `${BASE_URL}/api/chat/read/target_user_456`,
      {
        userId: "test_user_123",
      }
    );
    console.log("✅ 标记已读成功:", markReadResponse.data);

    console.log("\n🎉 所有测试通过！");
  } catch (error) {
    console.error("❌ 测试失败:", error.response?.data || error.message);

    if (error.response?.status === 401) {
      console.log("💡 提示: 可能需要添加JWT token到请求头");
    }
  }
}

// 运行测试
testChatSessions();
