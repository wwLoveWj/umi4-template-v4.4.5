const express = require("express");
const db = require("../../utils/mysql");
const { camelCaseKeys, handleQueryDb, failMsg } = require("../../utils");

const router = express.Router();
//================================  获取所有事件信息  ===========================
const searchEventInfo = (req, res) => {
  const status = req.query?.status;
  // 查询 event_info 表中所有的数据
  const sqlStr = status
    ? `select * from event_info where status=?`
    : "select * from event_info order by processTime asc";
  db.query(sqlStr, [status], (err, rows) => {
    // 查询数据失败
    if (err) {
      failMsg(err.message, res);
    }
    console.log(rows, "结果----------", sqlStr);
    // 查询数据成功
    // 注意：如果执行的是 select 查询语句，则执行的结果是数组
    rows = rows?.map((item) => camelCaseKeys(item));
    res.send({
      code: 1,
      msg: "事件信息查询成功！",
      data: rows,
    });
  });
};
/**
 * 查询事件信息数据
 */
router.get("/query", (req, res) => {
  try {
    searchEventInfo(req, res);
  } catch (error) {
    res.json({ success: false, msg: error.message, code: 0 });
  }
});
/**
 * 创建事件信息接口
 */
router.post("/create", (req, res) => {
  let params = req.body;
  // 定义待执行的 SQL 语句，其中英文的 ? 表示占位符
  const sqlStr =
    "insert into event_info (eventId,title,status,processTime,description,tag) values (?,?,?,?,?,?)";
  // 执行 SQL 语句，使用数组的形式，依次为 ? 占位符指定具体的值
  handleQueryDb(
    sqlStr,
    [
      params.eventId,
      params.title,
      params.status,
      params?.processTime,
      params.description,
      params?.tag,
    ],
    res,
    "事件信息新增成功~"
  );
});
/**
 * 更新事件信息接口
 */
router.post("/update", (req, res) => {
  let params = req.body;
  const sqlStr = "update event_info set status=?, finishTime=? where eventId=?";
  handleQueryDb(
    sqlStr,
    [params.status, params.finishTime, params.eventId],
    res,
    "事件信息更新成功~"
  );
});
/**
 * 删除事件信息接口
 */
router.post("/delete", (req, res) => {
  let params = req.body;
  const sqlStr = "delete from event_info where eventId=?";
  handleQueryDb(sqlStr, params.userId, res, "事件信息删除成功~");
});

// 5. 导出路由模块
module.exports = router;
