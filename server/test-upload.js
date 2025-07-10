const fs = require("fs");
const path = require("path");
const FormData = require("form-data");
const axios = require("axios");

/**
 * 测试头像上传功能
 */
async function testAvatarUpload() {
  const testImagePath = path.join(__dirname, "test-avatar.jpg");

  // 检查测试图片是否存在
  if (!fs.existsSync(testImagePath)) {
    console.log("❌ 测试图片不存在，请创建一个test-avatar.jpg文件");
    return;
  }

  try {
    console.log("🧪 开始测试头像上传...");

    // 创建FormData
    const formData = new FormData();
    formData.append("avatar", fs.createReadStream(testImagePath));

    // 发送请求
    const response = await axios.post(
      "http://localhost:3007/userInfo/uploadAvatar",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: "Bearer test-token",
        },
      }
    );

    console.log("✅ 上传成功:", response.data);
  } catch (error) {
    console.error("❌ 上传失败:", error.response?.data || error.message);
  }
}

// 运行测试
testAvatarUpload();
