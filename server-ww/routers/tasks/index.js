const express = require("express");
const db = require("../../utils/mysql");
const { camelCaseKeys, handleQueryDb } = require("../../utils");

const router = express.Router();
//================================  获取所有任务信息  ===========================
router.get("/query", (req, res) => {
  let params = req.query;
  // const sqlStr = `select * from task_info where task like '%${params.taskName || ""}%' and status=?`;
  const sql = `select * from task_info where task like '%${params.taskName || ""}%'`;
  db.query(sql, params.taskStatus, (err, rows) => {
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
      msg: "任务信息查询成功！",
      data: rows,
    });
  });
});
/**
 * 创建任务接口
 */
router.post("/create", (req, res) => {
  let params = req.body;
  // 定义待执行的 SQL 语句，其中英文的 ? 表示占位符
  const sqlStr = "insert into task_info (task_id,task, status) values (?, ?,?)";
  // 执行 SQL 语句，使用数组的形式，依次为 ? 占位符指定具体的值
  handleQueryDb(
    sqlStr,
    [params.taskId, params.task, params.status],
    res,
    "任务创建成功~"
  );
});
/**
 * 更新任务信息接口
 */
router.post("/edit", (req, res) => {
  let params = req.body;
  const sqlStr = "update task_info set task=? where task_id=?";
  handleQueryDb(sqlStr, [params.task, params.taskId], res, "任务信息更新成功~");
});
/**
 * 删除任务接口
 */
router.post("/delete", (req, res) => {
  let params = req.body;
  const sqlStr = "delete from task_info where task_id=?";
  handleQueryDb(sqlStr, params.taskId, res, "任务信息删除成功~");
});
// 批量删除
router.post("/batch/delete", (req, res) => {
  let params = req.body;
  // params.taskIdList = ["select  task_id from (select task_id from task_info"];
  // if (`"${params.taskIdList.join('","')}"`.includes("task_info")) {
  //   res.send({
  //     code: 0,
  //     msg: "存在sql注入漏洞，请及时修复~",
  //     data: null,
  //   });
  //   return;
  // }
  // sql注入语句
  // const sqlStr = `delete from task_info where task_id in (select  task_id from (select task_id from task_info) as temp_table)`;
  const sqlStr = `delete from task_info where task_id in ("${params.taskIdList.join('","')}")`;
  db.query(sqlStr, (err, results) => {
    if (err) {
      if (res) {
        res.send({
          code: 0,
          msg: err.message,
          data: null,
        });
      }
      return console.log(err.message);
    }
    if (results.affectedRows > 0) {
      // 注意：执行了 update 语句之后，执行的结果，也是一个对象，可以通过 affectedRows 判断是否更新成功
      if (res) {
        res.send({
          code: 1,
          msg: "任务信息批量删除成功~",
          data: null,
        });
      }
    }
  });
});
// 5. 导出路由模块
module.exports = router;
