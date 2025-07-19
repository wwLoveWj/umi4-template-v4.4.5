const express = require("express");
const db = require("../../utils/mysql");
const { camelCaseKeys, handleQueryDb } = require("../../utils");
const client = require("../../utils/redis");
const router = express.Router();
const dayjs = require("dayjs");

// ==============================编辑器内容的读取和设置================================
router.get("/query", (req, res) => {
  const sqlStr = "select * from feeding_info";
  const sql = `SELECT COUNT(*) AS total FROM feeding_info`;
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
      const result = rows.map((item) => {
        item.createTime = dayjs(item?.createTime).format("YYYY-MM-DD");
        return item;
      });
      res.send({
        code: 1,
        msg: "吃奶记录查询成功~",
        data: { total, list: result },
      });
    });
  });
});

router.post("/create", (req, res) => {
  const {
    feedingId,
    eventType,
    feedingTime,
    milkYield,
    feedingStatus,
    description,
  } = req.body;
  const sqlStr =
    "insert into feeding_info (feedingId,eventType,feedingTime,milkYield,feedingStatus,description) values (?,?,?,?,?,?)";
  handleQueryDb(
    sqlStr,
    [feedingId, eventType, feedingTime, milkYield, feedingStatus, description],
    res,
    "吃奶记录新增成功~"
  );
});

router.post("/update", (req, res) => {
  const {
    feedingId,
    eventType,
    feedingTime,
    milkYield,
    feedingStatus,
    description,
  } = req.body;
  const sqlStr =
    "update feeding_info set milkYield=?, feedingStatus=?, description=? where feedingId=?";
  handleQueryDb(
    sqlStr,
    [milkYield, feedingStatus, description, feedingId],
    res,
    "吃奶记录更新成功~"
  );
});

module.exports = router;
