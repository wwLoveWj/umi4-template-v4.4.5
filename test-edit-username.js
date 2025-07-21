/**
 * 测试用户名/昵称编辑功能
 */

const axios = require("axios");

const BASE_URL = "http://localhost:3007";

async function testEditUsername() {
  console.log("🧪 测试用户名/昵称编辑功能...\n");

  const testUserId = "1"; // 使用一个存在的用户ID

  try {
    // 1. 测试更新用户名
    console.log("📝 测试更新用户名...");
    const usernameResponse = await axios.post(`${BASE_URL}/userInfo/update`, {
      userId: testUserId,
      username: "测试用户名_" + Date.now(),
    });
    console.log("✅ 用户名更新成功:", usernameResponse.data);

    // 2. 测试更新昵称
    console.log("\n📝 测试更新昵称...");
    const nicknameResponse = await axios.post(`${BASE_URL}/userInfo/update`, {
      userId: testUserId,
      nickname: "测试昵称_" + Date.now(),
    });
    console.log("✅ 昵称更新成功:", nicknameResponse.data);

    // 3. 测试查询用户信息
    console.log("\n👤 测试查询用户信息...");
    const queryResponse = await axios.get(`${BASE_URL}/userInfo/query`, {
      params: { userId: testUserId },
    });
    console.log("✅ 用户信息查询成功:", queryResponse.data);

    // 4. 测试同时更新多个字段
    console.log("\n📋 测试同时更新多个字段...");
    const multiUpdateResponse = await axios.post(
      `${BASE_URL}/userInfo/update`,
      {
        userId: testUserId,
        username: "多字段用户名",
        nickname: "多字段昵称",
        gender: "男",
      }
    );
    console.log("✅ 多字段更新成功:", multiUpdateResponse.data);

    console.log("\n🎉 用户名/昵称编辑功能测试通过！");
  } catch (error) {
    console.error("❌ 测试失败:", error.response?.data || error.message);

    if (error.response?.status === 401) {
      console.log("💡 提示: 可能需要添加JWT token到请求头");
    }
  }
}

// 运行测试
testEditUsername();
