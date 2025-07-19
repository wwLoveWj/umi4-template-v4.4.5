const express = require("express");
const db = require("../../utils/mysql");
const { camelCaseKeys, handleQueryDb } = require("../../utils");

const router = express.Router();
// ==================================分数信息接口 ========================================
router.get("/", (req, res) => {
  try {
    // 查询 users 表中所有的数据
    const sqlStr = "select * from score_info";
    db.query(sqlStr, (err, rows) => {
      // 查询数据失败
      if (err) return console.log(err.message);
      // 查询数据成功
      rows = rows.map((item) => camelCaseKeys(item));
      console.log("分数列表查询成功");
      res.send({
        code: 1,
        msg: "success",
        data: rows,
      });
    });
  } catch (error) {
    res.json({ success: false, msg: error.message, code: 0 });
  }
});

router.post("/create", (req, res) => {
  let params = req.body;
  // 定义待执行的 SQL 语句，其中英文的 ? 表示占位符
  const sqlStr =
    "insert into score_info (score_id,user_id,username,deduction_score,deduction_reason,deduction_person,description,update_time,deduction_time,score) values (?,?,?,?,?,?,?,?,?,?)";
  //   const sqlUser = "update user_info set score=? where user_id=?";
  handleQueryDb(
    sqlStr,
    [
      params.scoreId,
      params.userId,
      params.username,
      params.deductionScore,
      params.deductionReason,
      params.deductionPerson,
      params.description,
      params.updateTime,
      params.deductionTime,
      params.score,
    ],
    res,
    "分数信息新增成功~"
  );
});

router.post("/edit", (req, res) => {
  let params = req.body;
  const sqlStr =
    "update score_info set score=?, deduction_score=?, deduction_reason=?, description=?, update_time=? where score_id=?";
  handleQueryDb(
    sqlStr,
    [
      params.score,
      params.deductionScore,
      params.deductionReason,
      params.description,
      params.updateTime,
      params.scoreId,
    ],
    res,
    "分数更新成功~"
  );
});

router.post("/delete", (req, res) => {
  const { scoreId } = req.body;
  const sqlStr = "delete from score_info where score_id=?";
  handleQueryDb(sqlStr, scoreId, res, "分数信息删除成功~");
});

router.post("/details", (req, res) => {
  const { userId } = req.body;
  const sqlStr = "select * from score_info where user_id=?";
  // handleQueryDb(sqlStr, userId, res, "分数明细数据查询成功~");
  // "select * from score_info where user_id= <select user_id from user_info where user_id=?>";
  db.query(sqlStr, userId, (err, rows) => {
    if (err) return console.log(err.message);
    // 注意：执行 delete 语句之后，结果也是一个对象，也会包含 affectedRows 属性
    console.log("查询明细数据成功");
    rows = rows.map((item) => camelCaseKeys(item));
    res.send({
      code: 1,
      msg: "查询分数明细数据成功",
      data: rows,
    });
  });
});

module.exports = router;
