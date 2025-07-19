const express = require("express");
const db = require("../../utils/mysql");
const { camelCaseKeys, handleQueryDb } = require("../../utils");
const client = require("../../utils/redis");
const router = express.Router();

// ==============================编辑器内容的读取和设置================================
router.get("/query", (req, res) => {
  const sqlStr = "select * from editor_info";
  const sql = `SELECT COUNT(*) AS total FROM editor_info`;
  db.query(sql, (err, results) => {
    // 查询数据失败
    if (err) return console.log(err.message);
    // 计算总页数
    const total = results[0].total;
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
      rows = rows.map((item) => camelCaseKeys(item));
      res.send({
        code: 1,
        msg: "文章列表信息查询成功~",
        data: { total, list: rows },
      });
    });
  });
});

// 查询文章明细
router.post("/details", (req, res) => {
  const { editorId } = req.body;
  const sqlStr = "select * from editor_info where editor_id=?";
  db.query(sqlStr, editorId, (err, rows) => {
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
    rows = rows.map((item) => camelCaseKeys(item));
    console.log(rows[0], "详情------------文章999");
    res.send({
      code: 1,
      msg: "文章明细查询成功~",
      data: rows[0],
    });
  });
});

// 新增文章
router.post("/create", (req, res) => {
  // 向 users 表中，新增一条数据，其中 username 的值为 Spider-Man，password 的值为 pcc123
  const { editorKey, editorId, title, imgBg } = req.body;
  client.get(editorKey).then((info) => {
    console.log(editorKey, "文章内容info---------", info);
    if (!info) {
      res.send({
        code: 0,
        msg: `redis不存在key：${editorKey}`,
        data: null,
      });
      return;
    }
    const sqlStr =
      "insert into editor_info (editor_content,editor_id,title,img_bg) values (?,?,?,?)";
    handleQueryDb(
      sqlStr,
      [info, editorId, title, imgBg],
      res,
      "文章创建成功~",
      null,
      () => {
        console.log("销毁");
        client.del(editorKey);
      }
    );
  });
});

// 编辑文章
router.post("/edit", (req, res) => {
  const { editorKey, editorId, title } = req.body;
  client.get(editorKey).then((info) => {
    console.log(editorKey, "文章内容info---------", info);
    if (!info) {
      res.send({
        code: 0,
        msg: `redis不存在key：${editorKey}`,
        data: null,
      });
      return;
    }
    const sqlStr =
      "update editor_info set editor_content=?, title=? where editor_id=?";
    handleQueryDb(
      sqlStr,
      [info, title, editorId],
      res,
      "文章更新成功~",
      null,
      () => {
        console.log("销毁---编辑");
        client.del(editorKey);
      }
    );
  });
});
// 删除对应文章信息
router.post("/delete", (req, res) => {
  const { editorId } = req.body;
  const sqlStr = "delete from editor_info where editor_id=?";
  handleQueryDb(sqlStr, editorId, res, "文章列表数据删除成功~");
});

module.exports = router;
