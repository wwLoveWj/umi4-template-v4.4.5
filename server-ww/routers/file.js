const express = require("express");
const multer = require("multer"); //上传文件中间件
const path = require("path");
const db = require("../utils/mysql");
const { storage, createFolder } = require("../utils/files");
const router = express.Router();
const { guid, handleQueryDb, camelCaseKeys } = require("../utils");

const uploadFolder = path.join(__dirname, "../upload"); //文件按照日期分割创建文件夹
createFolder(uploadFolder);
// 创建 multer 对象
const upload = multer({ storage: storage(uploadFolder) });

// 文件上传的接口
router.post("/upload", upload.single("file"), function (req, res, next) {
  console.log("req.file", req.file);
  const file = req.file;
  console.log("文件类型：%s", file.mimetype);
  console.log("原文件名：%s", file.originalname);
  console.log("文件大小：%s", file.size);
  console.log("保存路径：%s", file.path);
  // 插入图片到数据库
  const sqlStr =
    "insert into img_info (original_name,filename,img_type,img_path,img_url,img_id) values (?,?,?,?,?,?)";
  handleQueryDb(
    sqlStr,
    [
      file.originalname,
      file.filename,
      file.mimetype,
      file.path,
      `http://localhost:3007/${file.filename}`,
      guid(),
    ],
    res,
    "图片上传成功~",
    {
      ...file,
      url: `http://localhost:3007/${file.filename}`,
      alt: file.originalname, // 图片描述文字，非必须
      href: `http://localhost:3007/${file.filename}`, // 图片的链接，非必须
    }
  );
  // 接收文件成功后返回数据给前端
  // res.send({ ...file, url: `http://localhost:3007/${file.filename}` });
  // 由于我们设置了app.use(express.static(path.join(__dirname, 'upload')))，这是我们在app.js托管的静态资源，访问时路径要去掉upload
});

// 查询图片信息
router.get("/query", (req, res) => {
  const sqlStr = `select * from img_info`;
  db.query(sqlStr, (err, rows) => {
    if (err) {
      res.send({
        code: 0,
        msg: err.message,
        data: null,
      });
      return console.log(err.message);
    }
    // 查询数据成功
    rows = rows.map((item) => camelCaseKeys(item));
    res.send({
      code: 1,
      msg: "图片信息查询成功~",
      data: rows,
    });
  });
});

// 删除对应图片
router.post("/delete", (req, res) => {
  let params = req.body;
  const sqlStr = "delete from img_info where img_id = ?";
  handleQueryDb(sqlStr, params.imgId, res, "图片信息删除成功~");
});

module.exports = router;
