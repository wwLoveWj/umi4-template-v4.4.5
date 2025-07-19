const express = require("express");
const db = require("../../utils/mysql");
const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// 确保缩略图目录存在
const thumbDir = path.join(__dirname, "uploads/thumbs");
if (!fs.existsSync(thumbDir)) fs.mkdirSync(thumbDir, { recursive: true });

// 上传图片接口
router.post("/upload", upload.single("file"), async (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).json({ error: "No file uploaded" });

  // 原图路径
  const originalPath = file.path;
  // 新的原图 jpg 路径
  const jpgPath = path.join(__dirname + "/uploads", file.filename + ".jpg");
  // 缩略图路径
  const thumbPath = path.join(thumbDir, "thumb_" + file.filename + ".jpg");

  // 转存原图为 jpg
  await sharp(originalPath).jpeg({ quality: 90 }).toFile(jpgPath);
  // 生成缩略图（宽度200px，等比缩放）
  await sharp(originalPath)
    .resize({ width: 200 })
    .jpeg({ quality: 80 })
    .toFile(thumbPath);

  // 存储到数据库
  const url = `http://localhost:3007/api/album/uploads/${file.filename}.jpg`; // 大图
  const thumbUrl = `http://localhost:3007/api/album/uploads/thumbs/thumb_${file.filename}.jpg`; // 小图
  await db.query("INSERT INTO baby_album (url, thumb_url) VALUES (?, ?)", [
    url,
    thumbUrl,
  ]);

  res.send({
    code: 1,
    msg: `图片上传成功~`,
    data: {
      url,
      thumbUrl,
    },
  });
});

// 获取所有图片列表
router.get("/list", async (req, res) => {
  const rows = await db.query(
    "SELECT url, thumb_url as thumbUrl FROM baby_album ORDER BY created_at DESC"
  );
  res.send({
    code: 1,
    msg: `图片列表查询成功~`,
    data: rows || [],
  });
});

// 静态资源服务
router.use("/uploads", express.static(path.join(__dirname, "uploads")));

module.exports = router;
