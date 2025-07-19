const express = require("express");
const db = require("../../utils/mysql");
const { camelCaseKeys, handleQueryDb } = require("../../utils");

const router = express.Router();

// ===================================菜单权限相关============================================
// 获取到所有的菜单列表权限
router.get("/queryMenuList", (req, res) => {
  let sqlStr = `SELECT * FROM menus`;
  db.query(sqlStr, (err, rows) => {
    // 查询数据失败
    if (err) return console.log(err.message);
    // 查询数据成功
    rows = rows.map((item) => camelCaseKeys(item));
    console.log("菜单列表查询成功~");
    res.send({
      code: 1,
      msg: "success",
      data: rows,
    });
  });
});
// 通过userId查到roleId，通过roleId查到menusId
router.get("/menuIdsByroleIdByUserId", (req, res) => {
  // 1. 接收前端传的参数
  let userId = req.query.userId;
  console.log("菜单对应ids权限查询参数", userId);
  // 2. 拼接sql语句准备去数据库查询
  let sqlStr = `SELECT roles.menuIds
  FROM roles
  JOIN users_role ON roles.role_id = users_role.role_id
  WHERE users_role.user_id =?`;
  db.query(sqlStr, userId, (err, rows) => {
    // 查询数据失败
    if (err) return console.log(err.message);
    // 查询数据成功
    rows = rows.map((item) => camelCaseKeys(item));
    console.log("菜单对应ids权限值查询成功~", rows);
    res.send({
      code: 1,
      msg: "success",
      data: rows,
    });
  });
});
// 根据角色id查询能看到的菜单有哪些（前提是这些菜单是启用状态的）
router.get("/roleMenuByMenuId", (req, res) => {
  // 1. 接收前端传的参数
  let menuIds = req.query.menuIds;
  console.log("角色菜单信息查询参数", menuIds);
  // 2. 拼接sql语句准备去数据库查询
  let sqlStr = `SELECT * FROM menus WHERE id IN (${menuIds}) AND isDel = 1 AND status = 1`;
  db.query(sqlStr, (err, rows) => {
    // 查询数据失败
    if (err) return console.log(err.message);
    // 查询数据成功
    rows = rows.map((item) => camelCaseKeys(item));
    console.log("菜单信息查询成功~");
    res.send({
      code: 1,
      msg: "success",
      data: rows,
    });
  });
});
// 分配角色权限接口
router.post("/roleMenuAddMenuId", (req, res) => {
  let params = req.body;
  const sqlStr = "update roles set menuIds=? where role_id=?";
  handleQueryDb(
    sqlStr,
    [params.menuIds, params.roleId],
    res,
    "角色权限变更成功~"
  );
});
// =====================================角色列表相关增删改查=================================
// 查询角色列表所有信息
router.get("/roleList", (req, res) => {
  const sqlStr = "select * from roles";
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
    // 注意：如果执行的是 select 查询语句，则执行的结果是数组
    rows = rows.map((item) => camelCaseKeys(item));
    res.send({
      code: 1,
      msg: "角色信息查询成功~",
      data: rows,
    });
  });
});

router.post("/create", (req, res) => {
  let params = req.body;
  const sqlStr =
    "insert into roles (role_id,rolename,description) values (?,?,?)";
  handleQueryDb(
    sqlStr,
    [params.roleId, params.rolename, params.description],
    res,
    "角色新增成功~"
  );
});

router.post("/edit", (req, res) => {
  let params = req.body;
  const sqlStr = "update roles set rolename=? ,description=? where role_id=?";
  handleQueryDb(
    sqlStr,
    [params.rolename, params.description, params.roleId],
    res,
    "角色信息更新成功~"
  );
});

router.post("/delete", (req, res) => {
  const { roleId } = req.body;
  const sqlStr = "delete from roles where role_id=?";
  handleQueryDb(sqlStr, roleId, res, "角色信息删除成功~");
});
// ======================================角色用户中间表相关查询===============================================
// 用户权限列表接口
router.get("/usersAuthList", (req, res) => {
  const sqlStr = "select * from users_role";
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
      msg: "权限信息查询成功~",
      data: rows,
    });
  });
});
/**
 * 用户授权接口
 */
router.post("/userAuth", (req, res) => {
  let params = req.body;
  const sqlStr =
    "insert into users_role (user_id, role_id,description,rolename,username) values (?,?,?,?,?)";
  // 执行 SQL 语句，使用数组的形式，依次为 ? 占位符指定具体的值
  handleQueryDb(
    sqlStr,
    [
      params.userId,
      params.roleId,
      params.description,
      params.rolename,
      params.username,
    ],
    res,
    "用户授权成功~"
  );
});
// 解除用户授权
router.post("/revokeAuthorization", (req, res) => {
  let params = req.body;
  const sqlStr = "delete from users_role where id=?";
  const sql = "delete from login_info where user_id=?";
  db.query(sqlStr, params.id, (err, results) => {
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
    if (results.affectedRows === 1) {
      handleQueryDb(sql, params.userId, res, "解除用户授权成功~");
    }
  });
});

module.exports = router;
