const express = require("express");
const db = require("../utils/mysql");
const { camelCaseKeys, handleQueryDb } = require("../utils");

const router = express.Router();
// ==============================网址卡片的增删改查接口================================
router.get("/query", (req, res) => {
  let pageNo = req.query.pageNo;
  let pageSize = req.query.pageSize;
  // 接入查询参数
  const keyWords = req.query.keyWords || "";
  const sqlStr = `select * from link_info WHERE name LIKE '%${keyWords}%'`;
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
      msg: "网址信息查询成功！",
      data: rows,
    });
  });
});

router.post("/create", (req, res) => {
  let params = req.body;
  console.log(params, "网址新增参数");
  const sqlStr =
    "insert into link_info (name,description,link,avatar,link_id) values (?,?,?,?,?)";
  handleQueryDb(
    sqlStr,
    [
      params.name,
      params.description,
      params.link,
      params.avatar,
      params.linkId,
    ],
    res,
    "网址信息插入成功~"
  );
});

router.post("/edit", (req, res) => {
  let params = req.body;
  const sqlStr =
    "update link_info set name=?, description=?, link=?, avatar=? where link_id=?";
  handleQueryDb(
    sqlStr,
    [
      params.name,
      params.description,
      params.link,
      params.avatar,
      params.linkId,
    ],
    res,
    "网址信息更新成功~"
  );
});

router.post("/delete", (req, res) => {
  let params = req.body;
  const sqlStr = "delete from link_info where link_id=?";
  handleQueryDb(sqlStr, params.editorId, res, "网址信息删除成功~");
});
module.exports = router;
