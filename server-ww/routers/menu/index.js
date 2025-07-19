const express = require("express");
const db = require("../../utils/mysql");
const { camelCaseKeys, handleQueryDb } = require("../../utils");

const router = express.Router();

// =====================================菜单列表相关增删改查=================================
// 查询菜单列表所有信息
router.get("/query", (req, res) => {
  const sqlStr = "select * from menus";
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
    rows = rows.map((item) => camelCaseKeys(item));
    res.send({
      code: 1,
      msg: "菜单信息查询成功~",
      data: rows,
    });
  });
});

router.post("/create", (req, res) => {
  const { pid, title, path, component, icon, isHidden } = req.body;
  const sqlStr =
    "insert into menus (pid,title,path,component,icon,isHidden) values (?,?,?,?,?,?)";
  handleQueryDb(
    sqlStr,
    [pid, title, path, component, icon, isHidden],
    res,
    "菜单新增成功~"
  );
});

router.post("/edit", (req, res) => {
  const { title, path, component, icon, isHidden, id } = req.body;
  const sqlStr =
    "update menus set title=? ,path=?, component=?, icon=?, isHidden=? where id=?";
  handleQueryDb(
    sqlStr,
    [title, path, component, icon, isHidden, id],
    res,
    "菜单信息更新成功~"
  );
});

router.post("/delete", (req, res) => {
  const { id } = req.body;
  const sqlStr = "delete from menus where id=?";
  handleQueryDb(sqlStr, id, res, "菜单信息删除成功~");
});

module.exports = router;
