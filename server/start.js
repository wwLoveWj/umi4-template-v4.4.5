const mysql = require("mysql2/promise");
const fs = require("fs-extra");
const path = require("path");

/**
 * 数据库连接测试
 */
async function testDatabaseConnection() {
  const dbConfig = {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "baby_growth",
    port: process.env.DB_PORT || 3306,
  };

  try {
    console.log("🔍 测试数据库连接...");
    const connection = await mysql.createConnection(dbConfig);
    await connection.ping();
    console.log("✅ 数据库连接成功");
    await connection.end();
    return true;
  } catch (error) {
    console.error("❌ 数据库连接失败:", error.message);
    console.log("\n📋 请检查以下配置:");
    console.log("1. 确保MySQL服务已启动");
    console.log("2. 检查.env文件中的数据库配置");
    console.log("3. 确保数据库和表已创建");
    console.log("\n💡 可以运行以下命令创建数据库:");
    console.log("mysql -u root -p < database.sql");
    return false;
  }
}

/**
 * 检查并创建必要的目录
 */
function ensureDirectories() {
  const uploadDir = path.join(__dirname, "uploads", "avatars");
  try {
    fs.ensureDirSync(uploadDir);
    console.log("✅ 上传目录检查完成");
    return true;
  } catch (error) {
    console.error("❌ 创建上传目录失败:", error.message);
    return false;
  }
}

/**
 * 检查环境变量
 */
function checkEnvironment() {
  console.log("🔍 检查环境配置...");

  const requiredEnvVars = ["DB_HOST", "DB_USER", "DB_NAME"];
  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );

  if (missingVars.length > 0) {
    console.log("⚠️  缺少环境变量:", missingVars.join(", "));
    console.log("💡 请检查.env文件配置");
    return false;
  }

  console.log("✅ 环境配置检查完成");
  return true;
}

/**
 * 启动服务器
 */
async function startServer() {
  console.log("🚀 启动宝宝成长社区后端服务...\n");

  // 检查环境变量
  if (!checkEnvironment()) {
    process.exit(1);
  }

  // 检查目录
  if (!ensureDirectories()) {
    process.exit(1);
  }

  // 测试数据库连接
  if (!(await testDatabaseConnection())) {
    process.exit(1);
  }

  // 启动服务器
  try {
    const app = require("./app");
    console.log("\n🎉 服务器启动成功!");
    console.log(`📡 服务地址: http://localhost:${process.env.PORT || 3007}`);
    console.log(`📁 上传目录: ${path.join(__dirname, "uploads", "avatars")}`);
    console.log("\n📚 API文档请查看 README.md");
  } catch (error) {
    console.error("❌ 服务器启动失败:", error.message);
    process.exit(1);
  }
}

// 启动服务
startServer();
