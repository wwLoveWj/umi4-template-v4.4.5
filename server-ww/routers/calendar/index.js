const express = require("express");
const db = require("../../utils/mysql");
const { camelCaseKeys, handleQueryDb } = require("../../utils");
const client = require("../../utils/redis");
const router = express.Router();
const dayjs = require("dayjs");

router.get("/query", (req, res) => {
  const sqlStr = "select * from calendar_info";
  const sql = `SELECT COUNT(*) AS total FROM calendar_info`;
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
      // const result = rows.map((item) => {
      //   item.startDate = dayjs(item?.startDate).format("YYYY-MM-DD");
      //   item.endDate = dayjs(item?.endDate).format("YYYY-MM-DD");
      //   return item;
      // });
      res.send({
        code: 1,
        msg: "日历待办查询成功~",
        data: { total, list: rows },
      });
    });
  });
});

router.post("/create", (req, res) => {
  const { calendarId, type, content, startDate, endDate } = req.body;
  const sqlStr =
    "insert into calendar_info (calendarId,type,content,startDate,endDate) values (?,?,?,?,?)";
  handleQueryDb(
    sqlStr,
    [calendarId, type, content, startDate, endDate],
    res,
    "日历待办新增成功~"
  );
});

router.post("/update", (req, res) => {
  const { calendarId, content, startDate, endDate, type } = req.body;
  const sqlStr =
    "update calendar_info set content=?, startDate=?, endDate=?, type=? where calendarId=?";
  handleQueryDb(
    sqlStr,
    [content, startDate, endDate, type, calendarId],
    res,
    "日历待办更新成功~"
  );
});

module.exports = router;
