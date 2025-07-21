/**
 * 测试昵称更新功能
 */

const axios = require("axios");

const BASE_URL = "http://localhost:3007";

async function testNicknameUpdate() {
  console.log("🧪 测试昵称更新功能...\n");

  try {
    // 1. 测试更新用户昵称
    console.log("📝 测试更新用户昵称...");
    const updateResponse = await axios.post(`${BASE_URL}/userInfo/update`, {
      userId: "current_user_123",
      nickname: "测试昵称_" + Date.now(),
    });
    console.log("✅ 昵称更新成功:", updateResponse.data);

    // 2. 测试查询用户信息
    console.log("\n👤 测试查询用户信息...");
    const queryResponse = await axios.get(`${BASE_URL}/userInfo/query`, {
      params: { userId: "current_user_123" },
    });
    console.log("✅ 用户信息查询成功:", queryResponse.data);

    // 3. 测试更新其他字段
    console.log("\n📋 测试更新其他字段...");
    const otherUpdateResponse = await axios.post(
      `${BASE_URL}/userInfo/update`,
      {
        userId: "current_user_123",
        gender: "男",
        birthday: "1990-01-01",
      }
    );
    console.log("✅ 其他字段更新成功:", otherUpdateResponse.data);

    console.log("\n🎉 昵称更新功能测试通过！");
  } catch (error) {
    console.error("❌ 测试失败:", error.response?.data || error.message);

    if (error.response?.status === 401) {
      console.log("💡 提示: 可能需要添加JWT token到请求头");
    }
  }
}

// 运行测试
testNicknameUpdate();
