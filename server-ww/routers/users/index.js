const express = require("express");
const db = require("../../utils/mysql");
const { camelCaseKeys, handleQueryDb } = require("../../utils");
const multer = require("multer");
const path = require("path");
const fs = require("fs-extra");
require("dotenv").config();

const router = express.Router();
//================================  获取所有用户信息  ===========================
const searchUser = (res) => {
  // 查询 users 表中所有的数据
  const sqlStr = "select * from user_info";
  db.query(sqlStr, (err, rows) => {
    // 查询数据失败
    if (err) {
      res.send({
        code: 0,
        msg: err.message,
        data: null,
      });
      return console.log(err.message);
    }
    // 查询数据成功
    // 注意：如果执行的是 select 查询语句，则执行的结果是数组
    rows = rows.map((item) => camelCaseKeys(item));
    res.send({
      code: 1,
      msg: "用户信息查询成功！",
      data: rows,
    });
  });
};
/**
 * 查询用户信息数据
 */
router.get("/query", (req, res) => {
  try {
    searchUser(res);
  } catch (error) {
    res.json({ success: false, msg: error.message, code: 0 });
  }
});
/**
 * 创建用户接口
 */
router.post("/create", (req, res) => {
  let params = req.body;
  // 定义待执行的 SQL 语句，其中英文的 ? 表示占位符
  const sqlStr =
    "insert into user_info (user_id,username, age,weight,score,status,description,email) values (?, ?,?,?,?,?,?,?)";
  // 执行 SQL 语句，使用数组的形式，依次为 ? 占位符指定具体的值
  handleQueryDb(
    sqlStr,
    [
      params.userId,
      params.username,
      params.age,
      params.weight,
      params.score,
      params.status,
      params.description,
      params.email,
    ],
    res,
    "用户信息新增成功~"
  );
});
/**
 * 更新用户接口
 */
router.post("/edit", (req, res) => {
  let params = req.body;
  const sqlStr =
    "update user_info set username=?, age=?, weight=?, score=?, status=?, description=?, email=? where user_id=?";
  handleQueryDb(
    sqlStr,
    [
      params.username,
      params.age,
      params.weight,
      params.score,
      params.status,
      params.description,
      params.userId,
      params.email,
    ],
    res,
    "用户信息更新成功~"
  );
});

/**
 * @api {post}  更新用户信息
 * @body { userId, ...fields }
 */
router.post("/update", async (req, res) => {
  const { userId, ...fields } = req.body;
  if (!userId) {
    return res.status(400).json({
      code: 0,
      msg: `userId不能为空~`,
      data: null,
    });
  }
  if (Object.keys(fields).length === 0) {
    return res.status(400).json({
      code: 0,
      msg: `没有需要更新的字段~`,
      data: null,
    });
  }
  if (!fields || typeof fields !== "object") {
    throw new Error("fields 必须是一个对象");
  }
  // 构建 SQL 动态字段
  const setStr = Object.keys(fields)
    .map((key) => `\`${key}\` = ?`)
    .join(", ");
  const values = Object.values(fields);
  try {
    const result = await db.query(
      `UPDATE user_info SET ${setStr} WHERE user_id = ?`,
      [...values, userId]
    );
    if (result.affectedRows > 0) {
      res.json({
        code: 1,
        msg: `信息更新成功~`,
        data: null,
      });
    } else {
      res.status(404).json({
        code: 0,
        msg: `用户不存在~`,
        data: null,
      });
    }
  } catch (err) {
    res.status(500).json({
      code: 0,
      msg: `数据库错误,${err.message}`,
      data: null,
    });
  }
});

/**
 * 删除用户接口
 */
router.post("/delete", (req, res) => {
  let params = req.body;
  const sqlStr = "delete from user_info where user_id=?";
  handleQueryDb(sqlStr, params.userId, res, "用户信息删除成功~");
});

// ------------------------------ 头像上传 ------------------------------
// 数据库连接配置
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "baby_growth",
  port: process.env.DB_PORT || 3306,
};
// 静态文件服务
router.use("/uploads", express.static(path.join(__dirname, "uploads")));

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
 * 头像上传接口
 * POST /userInfo/uploadAvatar
 */
router.post("/uploadAvatar", upload.single("avatar"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        code: 0,
        msg: "请选择要上传的头像文件",
      });
    }

    // 生成文件访问URL
    const avatarUrl = `${req.protocol}://${req.get("host")}/userInfo/uploads/avatars/${req.file.filename}`;

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
});

/**
 * 校验原密码并修改新密码接口
 * POST /userInfo/checkPassword
 * body: { userId, oldPassword, newPassword }
 */
router.post("/checkPassword", async (req, res) => {
  try {
    const { userId, oldPassword, newPassword } = req.body;
    if (!userId || !oldPassword || !newPassword) {
      return res.status(400).json({ code: 0, msg: "参数不完整" });
    }
    const sql = "SELECT password FROM user_info WHERE user_id = ?";
    const rows = await db.query(sql, [userId]);
    if (rows.length === 0) {
      return res.status(404).json({ code: 0, msg: "用户不存在" });
    }
    if (rows[0].password === oldPassword) {
      // 原密码正确，更新新密码
      await db.query("UPDATE user_info SET password = ? WHERE user_id = ?", [
        newPassword,
        userId,
      ]);
      res.json({ code: 1, msg: "密码修改成功" });
    } else {
      res.json({ code: 0, msg: "原密码错误" });
    }
  } catch (error) {
    console.error("校验原密码错误:", error);
    res.status(500).json({ code: 0, msg: "服务器错误", error: error.message });
  }
});
// 5. 导出路由模块
module.exports = router;
