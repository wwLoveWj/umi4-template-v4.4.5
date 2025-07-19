const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs-extra");
const mysql = require("mysql2/promise");
const chatRouter = require("./routers/chat");
const WebSocketServer = require("./websocket");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3007;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// 数据库连接配置
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "baby_growth",
  port: process.env.DB_PORT || 3306,
};

// 创建数据库连接池
const pool = mysql.createPool(dbConfig);

/**
 * 确保上传目录存在
 */
const uploadDir = path.join(__dirname, "uploads", "avatars");
fs.ensureDirSync(uploadDir);

/**
 * 配置文件上传
 */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // 生成唯一文件名：时间戳 + 随机数 + 原扩展名
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, "avatar-" + uniqueSuffix + ext);
  },
});

/**
 * 文件过滤器
 */
const fileFilter = (req, file, cb) => {
  // 只允许上传图片文件
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("只允许上传图片文件！"), false);
  }
};

/**
 * 创建multer实例
 */
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB限制
  },
});

/**
 * 验证JWT Token的中间件
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ code: 0, msg: "访问令牌缺失" });
  }

  // 这里应该验证JWT token，简化处理
  // jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
  //   if (err) return res.status(403).json({ code: 0, msg: '访问令牌无效' });
  //   req.user = user;
  //   next();
  // });

  // 简化处理，直接通过
  next();
};

/**
 * 头像上传接口
 * POST /userInfo/uploadAvatar
 */
app.post(
  "/userInfo/uploadAvatar",
  authenticateToken,
  upload.single("avatar"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          code: 0,
          msg: "请选择要上传的头像文件",
        });
      }

      // 生成文件访问URL
      const avatarUrl = `${req.protocol}://${req.get("host")}/uploads/avatars/${
        req.file.filename
      }`;

      // 返回成功响应
      res.json({
        code: 1,
        msg: "头像上传成功",
        data: {
          avatarUrl: avatarUrl,
          message: "头像上传成功",
        },
      });
    } catch (error) {
      console.error("头像上传错误:", error);
      res.status(500).json({
        code: 0,
        msg: "头像上传失败",
        error: error.message,
      });
    }
  }
);

/**
 * 更新用户信息接口
 * POST /userInfo/update
 */
app.post("/userInfo/update", authenticateToken, async (req, res) => {
  try {
    const { userId, ...updateData } = req.body;

    if (!userId) {
      return res.status(400).json({
        code: 0,
        msg: "用户ID不能为空",
      });
    }

    // 构建更新SQL
    const updateFields = Object.keys(updateData)
      .map((key) => `${key} = ?`)
      .join(", ");
    const updateValues = Object.values(updateData);
    updateValues.push(userId);

    const sql = `UPDATE user_info SET ${updateFields} WHERE userId = ?`;

    const [result] = await pool.execute(sql, updateValues);

    if (result.affectedRows > 0) {
      res.json({
        code: 1,
        msg: "用户信息更新成功",
        data: null,
      });
    } else {
      res.status(404).json({
        code: 0,
        msg: "用户不存在或更新失败",
      });
    }
  } catch (error) {
    console.error("更新用户信息错误:", error);
    res.status(500).json({
      code: 0,
      msg: "更新用户信息失败",
      error: error.message,
    });
  }
});

/**
 * 查询用户信息接口
 * GET /userInfo/query
 */
app.get("/userInfo/query", authenticateToken, async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        code: 0,
        msg: "用户ID不能为空",
      });
    }

    const sql = "SELECT * FROM user_info WHERE userId = ?";
    const [rows] = await pool.execute(sql, [userId]);

    if (rows.length > 0) {
      res.json({
        code: 1,
        msg: "查询成功",
        data: rows[0],
      });
    } else {
      res.status(404).json({
        code: 0,
        msg: "用户不存在",
      });
    }
  } catch (error) {
    console.error("查询用户信息错误:", error);
    res.status(500).json({
      code: 0,
      msg: "查询用户信息失败",
      error: error.message,
    });
  }
});

/**
 * 用户登录验证接口
 * GET /userInfo/check
 */
app.get("/userInfo/check", authenticateToken, async (req, res) => {
  try {
    // 这里应该从token中获取用户信息
    // 简化处理，返回模拟数据
    res.json({
      code: 1,
      msg: "验证成功",
      data: {
        userId: "user123",
        username: "测试用户",
        avatar: "",
        email: "test@example.com",
      },
    });
  } catch (error) {
    console.error("用户验证错误:", error);
    res.status(500).json({
      code: 0,
      msg: "用户验证失败",
      error: error.message,
    });
  }
});

/**
 * 错误处理中间件
 */
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        code: 0,
        msg: "文件大小超过限制（最大5MB）",
      });
    }
  }

  console.error("服务器错误:", error);
  res.status(500).json({
    code: 0,
    msg: "服务器内部错误",
    error: error.message,
  });
});

/**
 * 404处理
 */
app.use("*", (req, res) => {
  res.status(404).json({
    code: 0,
    msg: "接口不存在",
  });
});

const goalsRouter = require("./routers/goals");
app.use("/goals", goalsRouter);

// 注册聊天路由
app.use("/api/chat", chatRouter);

// 启动HTTP服务器
const server = app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  console.log(`上传目录: ${uploadDir}`);
});

// 启动WebSocket服务器
const wss = new WebSocketServer(server);
console.log("WebSocket服务器已启动");

module.exports = app;
