// 1. 导入 mysql 模块
const mysql = require("mysql");
const util = require("util");
// 2. 建立与 MySQL 数据库的连接关系
const db = mysql.createPool({
  host: "127.0.0.1", // 数据库的 IP 地址
  user: "root", // 登录数据库的账号
  password: "123456", // 登录数据库的密码  自己家的密码wj
  database: "userInfo", // 指定要操作哪个数据库
});
db.query = util.promisify(db.query);

module.exports = db;
