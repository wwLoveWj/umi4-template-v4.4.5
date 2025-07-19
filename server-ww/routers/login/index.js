const express = require("express");
const jwt = require("jsonwebtoken");
// const md5 = require("md5");
const client = require("../../utils/redis");
// 导入 bcryptjs 加密包
// const bcrypt = require("bcryptjs");
const db = require("../../utils/mysql");
// 导入全局配置文件（里面有token的密钥）
const { jwtConfig } = require("../../utils/config");
const { camelCaseKeys, handleQueryDb } = require("../../utils");

const router = express.Router();
// ========================================系统用户的增删改查=======================================
// 查询系统登录用户
router.get("/tableList", (req, res) => {
  const sqlStr =
    "select username,email,user_id,create_time,status from login_info";
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
      msg: "系统登录用户列表查询成功~",
      data: rows,
    });
  });
});
/**
 * 创建系统登录用户接口
 */
router.post("/createSystemUsers", (req, res) => {
  let params = req.body;
  const sqlStr =
    "insert into login_info (username,password,email,user_id) values(?,?,?,?)";
  const sql =
    "insert into users_role (username,rolename,description,role_id,user_id) values(?,?,?,?,?)";
  db.query(
    sqlStr,
    [params.username, params.password, params.email, params.userId],
    (err, results) => {
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
        console.log(params, "%c 成功的信息");
        // 注意：执行了 update 语句之后，执行的结果，也是一个对象，可以通过 affectedRows 判断是否更新成功
        handleQueryDb(
          sql,
          [
            params.username,
            params.rolename,
            params.description,
            params.roleId,
            params.userId,
          ],
          res,
          "登录用户创建成功~"
        );
      }
    }
  );
});
router.post("/chgPwd", (req, res) => {
  let params = req.body;
  const sqlStr = "update login_info set password=? where user_id=?";
  handleQueryDb(
    sqlStr,
    [params.password, params.userId],
    res,
    "用户密码更新成功~"
  );
});
// ========================================系统用户的登录注册=======================================
/**
 * POST 用户注册
 * @param username  用户名
 * @param password  用户密码
 */
router.post("/register", (req, res) => {
  const { username, password, verifyCode, email, userId } = req.body;
  if (!username || !password) {
    res.send({
      code: 0,
      msg: "用户名与密码为必传参数...",
    });
    return;
  }
  client.get(email).then((code) => {
    console.log(typeof code, verifyCode);
    if (!code) {
      res.send({
        code: 0,
        msg: "验证码已过期，请重新验证！",
      });
    }
    //从redis查询数据
    if (verifyCode === Number(code)) {
      if (username && password) {
        const searchSql = `SELECT * FROM login_info WHERE username=?`;
        db.query(searchSql, [username], (err, results) => {
          if (err) throw err;
          if (results.length >= 1) {
            //2、如果有相同用户名，则注册失败，用户名重复
            res.send({ code: 0, msg: "注册失败，用户名重复" });
          } else {
            // 调用 bcrypt.hashSync() 对密码加密
            // let pwd = bcrypt.hashSync(password, 10); // 参数2： 加密等级 填10即可
            const sqlStr =
              "insert into login_info (username,password,email,user_id) values(?,?,?,?)";
            db.query(
              sqlStr,
              [username, password, email, userId],
              (err, results) => {
                if (err) throw err;
                if (results.affectedRows === 1) {
                  res.send({ code: 1, msg: "注册成功" });
                } else {
                  res.send({ code: 0, msg: "注册失败" });
                }
              }
            );
          }
        });
      }
      console.log("注册接收", req.body);
    } else {
      console.log("验证失败");
      res.send({
        code: 0,
        msg: "验证码错误...",
      });
      return;
    }
  });
});

/**
 * 登录接口
 */
router.post("/index", (req, res) => {
  const { loginName, password, username } = req.body;
  if (!loginName) {
    if (!username || !password) {
      res.send({
        code: 0,
        msg: "用户名与密码为必传参数...",
      });
      return;
    }
  }
  if (!username) {
    if (!loginName || !password) {
      res.send({
        code: 0,
        msg: "邮箱与密码为必传参数...",
      });
      return;
    }
  }
  const sqlStr = username
    ? "select * from user_info WHERE username=? And password=?"
    : "select * from user_info WHERE email=? And password=?";
  db.query(
    sqlStr,
    username ? [username, password] : [loginName, password],
    (err, result) => {
      if (err) throw err;
      if (result.length > 0) {
        // 生成token
        var token = jwt.sign(
          {
            identity: result[0].identity,
            email: username ? result[0].username : result[0].loginName,
          },
          jwtConfig.jwtSecretKey,
          {
            expiresIn: jwtConfig.expiresIn, //tonken 有效期
          }
        );
        console.log("token返回成功！");
        const rows = result.map((item) => camelCaseKeys(item));
        const info = rows.find(
          (item) => item.email === loginName || item.username === username
        );
        console.log("当前用户信息---------", rows);
        res.send({ code: 1, msg: "登录成功", data: { ...info, token } });
        // 如果没有登录成功，则返回登录失败
      } else {
        //   let authorization = req.headers.authorization;
        //   // 判断token
        //   if (!authorization) {
        //     res.send({ code: 0, msg: "未登录" });
        //   } else {
        //     console.log(authorization, "authorization---------登陆校验");
        //     let token = authorization.split(" ")[1]; // 获取token
        //     console.log(token, "authorization---------过期了？");
        //     jwt.verify(token, "secret", (err, decode) => {
        //       if (err) {
        //         res.send({ code: 0, msg: "登录过期，请重新登录！" });
        //       }
        //     });
        //   }
        res.send({ code: 0, msg: "用户名或密码错误！" });
      }
    }
  );
});
module.exports = router;
